const RepairTicket = require("../models/RepairTicket");
const Device = require("../models/Device");
const User = require("../models/user");

const createRepairTicket = async (req, res) => {
  try {
    const { device, problem, priority, assignedTechnician, expectedDate, cost, notes } = req.body;

    const existingDevice = await Device.findById(device);

    if (!existingDevice) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    if (assignedTechnician) {
      const technician = await User.findById(assignedTechnician);

      if (!technician || technician.role !== "technician") {
        return res.status(400).json({
          success: false,
          message: "Invalid technician"
        });
      }
    }

    const ticketNumber = "RD-" + Date.now();

    const ticket = await RepairTicket.create({
      ticketNumber,
      device,
      problem,
      priority,
      assignedTechnician,
      expectedDate,
      cost,
      notes
    });

    return res.status(201).json({
      success: true,
      message: "Repair ticket created successfully",
      ticket
    });
  } catch (error) {
    console.error("Create repair ticket error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the repair ticket"
    });
  }
};

const getRepairTickets = async (req, res) => {
  try {
    const tickets = await RepairTicket.find()
      .populate({
        path: "device",
        select: "brand model type customer",
        populate: {
          path: "customer",
          select: "name phone"
        }
      })
      .populate("assignedTechnician", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error("Get repair tickets error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching repair tickets"
    });
  }
};

const getRepairTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await RepairTicket.findById(id)
      .populate({
        path: "device",
        select: "brand model type customer",
        populate: {
          path: "customer",
          select: "name phone"
        }
      })
      .populate("assignedTechnician", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Repair ticket not found"
      });
    }

    return res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error("Get repair ticket by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the repair ticket"
    });
  }
};

const updateRepairTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { problem, priority, status, assignedTechnician, expectedDate, cost, notes } = req.body;

    if (assignedTechnician) {
      const technician = await User.findById(assignedTechnician);

      if (!technician || technician.role !== "technician") {
        return res.status(400).json({
          success: false,
          message: "Invalid technician"
        });
      }
    }

    const ticket = await RepairTicket.findByIdAndUpdate(
      id,
      { problem, priority, status, assignedTechnician, expectedDate, cost, notes },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Repair ticket not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Repair ticket updated successfully",
      ticket
    });
  } catch (error) {
    console.error("Update repair ticket error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the repair ticket"
    });
  }
};

const deleteRepairTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await RepairTicket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Repair ticket not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Repair ticket deleted successfully"
    });
  } catch (error) {
    console.error("Delete repair ticket error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the repair ticket"
    });
  }
};

module.exports = {
  createRepairTicket,
  getRepairTickets,
  getRepairTicketById,
  updateRepairTicket,
  deleteRepairTicket
};