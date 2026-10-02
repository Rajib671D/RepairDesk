const Invoice = require("../models/Invoice");
const RepairTicket = require("../models/RepairTicket");
const Customer = require("../models/Customer");

const createInvoice = async (req, res) => {
  try {
    const { repairTicket, customer, subtotal, discount, tax } = req.body;

    const existingRepairTicket = await RepairTicket.findById(repairTicket);

    if (!existingRepairTicket) {
      return res.status(404).json({
        success: false,
        message: "Repair ticket not found"
      });
    }

    const existingCustomer = await Customer.findById(customer);

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const total = subtotal - (discount || 0) + (tax || 0);

    const invoiceNumber = "INV-" + Date.now();

    const invoice = await Invoice.create({
      invoiceNumber,
      repairTicket,
      customer,
      subtotal,
      discount,
      tax,
      total,
      status: "unpaid"
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice
    });
  } catch (error) {
    console.error("Create invoice error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the invoice"
    });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("repairTicket", "ticketNumber status cost")
      .populate("customer", "name phone email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error("Get invoices error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching invoices"
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate("repairTicket", "ticketNumber status cost")
      .populate("customer", "name phone email");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    return res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error("Get invoice by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the invoice"
    });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount, tax, status } = req.body;

    const existingInvoice = await Invoice.findById(id);

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    const newDiscount = discount !== undefined ? discount : existingInvoice.discount;
    const newTax = tax !== undefined ? tax : existingInvoice.tax;
    const total = existingInvoice.subtotal - newDiscount + newTax;

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { discount: newDiscount, tax: newTax, status, total },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice
    });
  } catch (error) {
    console.error("Update invoice error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the invoice"
    });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully"
    });
  } catch (error) {
    console.error("Delete invoice error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the invoice"
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
};