const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

const createPayment = async (req, res) => {
  try {
    const { invoice, amount, method, transactionId } = req.body;

    const existingInvoice = await Invoice.findById(invoice);

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    if (existingInvoice.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot make payment for a cancelled invoice"
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const existingPayments = await Payment.find({
      invoice: existingInvoice._id,
      status: "completed"
    });

    const previousPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);

    const remainingAmount = existingInvoice.total - previousPaid;

    if (remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice is already fully paid"
      });
    }

    if (amount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds remaining invoice balance",
        remainingAmount
      });
    }

    const payment = await Payment.create({
      invoice,
      amount,
      method,
      transactionId,
      status: "completed"
    });

    const totalPaid = previousPaid + amount;

    const invoiceStatus = totalPaid >= existingInvoice.total ? "paid" : "unpaid";
    existingInvoice.status = invoiceStatus;
    await existingInvoice.save();

    const newRemainingAmount = existingInvoice.total - totalPaid;

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
      paymentSummary: {
        invoiceTotal: existingInvoice.total,
        previousPaid,
        currentPayment: amount,
        totalPaid,
        remainingAmount: newRemainingAmount,
        invoiceStatus
      }
    });
  } catch (error) {
    console.error("Create payment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the payment"
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("invoice", "invoiceNumber total status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error("Get payments error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching payments"
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id).populate("invoice", "invoiceNumber total status");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("Get payment by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the payment"
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, status, transactionId } = req.body;

    const existingPayment = await Payment.findById(id);

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const invoice = await Invoice.findById(existingPayment.invoice);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    if (invoice.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update payment for a cancelled invoice"
      });
    }

    const newAmount = amount !== undefined ? amount : existingPayment.amount;
    const newStatus = status !== undefined ? status : existingPayment.status;

    if (!newAmount || newAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const otherCompletedPayments = await Payment.find({
      invoice: existingPayment.invoice,
      status: "completed",
      _id: { $ne: existingPayment._id }
    });

    const otherCompletedTotal = otherCompletedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    const resultingCompletedTotal =
      newStatus === "completed" ? otherCompletedTotal + newAmount : otherCompletedTotal;

    if (resultingCompletedTotal > invoice.total) {
      const remainingAmount = invoice.total - otherCompletedTotal;
      return res.status(400).json({
        success: false,
        message: "Payment amount exceeds remaining invoice balance",
        remainingAmount
      });
    }

    existingPayment.amount = newAmount;
    existingPayment.method = method !== undefined ? method : existingPayment.method;
    existingPayment.status = newStatus;
    existingPayment.transactionId =
      transactionId !== undefined ? transactionId : existingPayment.transactionId;

    await existingPayment.save();

    const invoiceStatus = resultingCompletedTotal >= invoice.total ? "paid" : "unpaid";
    invoice.status = invoiceStatus;
    await invoice.save();

    const remainingAmount = invoice.total - resultingCompletedTotal;

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: existingPayment,
      paymentSummary: {
        invoiceTotal: invoice.total,
        totalPaid: resultingCompletedTotal,
        remainingAmount,
        invoiceStatus
      }
    });
  } catch (error) {
    console.error("Update payment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the payment"
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPayment = await Payment.findById(id);

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const invoiceId = existingPayment.invoice;
    const wasCompleted = existingPayment.status === "completed";

    await Payment.findByIdAndDelete(id);

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    let totalPaid = 0;

    if (wasCompleted) {
      const remainingCompletedPayments = await Payment.find({
        invoice: invoiceId,
        status: "completed"
      });

      totalPaid = remainingCompletedPayments.reduce((sum, p) => sum + p.amount, 0);

      if (invoice.status !== "cancelled") {
        invoice.status = totalPaid >= invoice.total ? "paid" : "unpaid";
        await invoice.save();
      }
    } else {
      const remainingCompletedPayments = await Payment.find({
        invoice: invoiceId,
        status: "completed"
      });

      totalPaid = remainingCompletedPayments.reduce((sum, p) => sum + p.amount, 0);
    }

    const remainingAmount = invoice.total - totalPaid;

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      paymentSummary: {
        invoiceTotal: invoice.total,
        totalPaid,
        remainingAmount,
        invoiceStatus: invoice.status
      }
    });
  } catch (error) {
    console.error("Delete payment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the payment"
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
};