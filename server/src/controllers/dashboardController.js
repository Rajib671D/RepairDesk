const RepairTicket = require("../models/RepairTicket");
const Customer = require("../models/Customer");

const getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const todaysRepairs = await RepairTicket.countDocuments({
      createdAt: {
        $gte: startOfToday,
        $lt: startOfTomorrow
      }
    });

    const pendingRepairs = await RepairTicket.countDocuments({
      status: { $ne: "delivered" }
    });

    const completedRepairs = await RepairTicket.countDocuments({
      status: "delivered"
    });

    const revenueResult = await RepairTicket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$cost" }
        }
      }
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const customers = await Customer.countDocuments();

    return res.status(200).json({
      success: true,
      stats: {
        todaysRepairs,
        pendingRepairs,
        completedRepairs,
        revenue,
        customers
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching dashboard stats"
    });
  }
};

module.exports = {
  getDashboardStats
};