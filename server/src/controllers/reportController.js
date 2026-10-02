const RepairTicket = require("../models/RepairTicket");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

const getReports = async (req, res) => {
  try {
    const [
      totalRevenueResult,
      totalPayments,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      repairStatusResult,
      revenueByMethodResult
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.countDocuments(),
      Invoice.countDocuments(),
      Invoice.countDocuments({ status: "paid" }),
      Invoice.countDocuments({ status: "unpaid" }),
      RepairTicket.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$method", total: { $sum: "$amount" } } }
      ])
    ]);

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const repairStatusCounts = {};
    repairStatusResult.forEach((item) => {
      repairStatusCounts[item._id] = item.count;
    });

    const revenueByPaymentMethod = {};
    revenueByMethodResult.forEach((item) => {
      revenueByPaymentMethod[item._id] = item.total;
    });

    return res.status(200).json({
      success: true,
      reports: {
        totalRevenue,
        totalPayments,
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        repairStatusCounts,
        revenueByPaymentMethod
      }
    });
  } catch (error) {
    console.error("Get reports error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching reports"
    });
  }
};

module.exports = {
  getReports
};