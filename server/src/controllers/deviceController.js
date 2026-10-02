const Device = require("../models/Device");
const Customer = require("../models/Customer");

const createDevice = async (req, res) => {
  try {
    const { customer, type, brand, model, serialNumber, color } = req.body;

    const existingCustomer = await Customer.findById(customer);

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const device = await Device.create({
      customer,
      type,
      brand,
      model,
      serialNumber,
      color
    });

    return res.status(201).json({
      success: true,
      message: "Device created successfully",
      device
    });
  } catch (error) {
    console.error("Create device error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the device"
    });
  }
};

const getDevices = async (req, res) => {
  try {
    const devices = await Device.find()
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      devices
    });
  } catch (error) {
    console.error("Get devices error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching devices"
    });
  }
};

const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findById(id).populate("customer", "name phone");

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    return res.status(200).json({
      success: true,
      device
    });
  } catch (error) {
    console.error("Get device by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the device"
    });
  }
};

const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, brand, model, serialNumber, color } = req.body;

    const device = await Device.findByIdAndUpdate(
      id,
      { type, brand, model, serialNumber, color },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device updated successfully",
      device
    });
  } catch (error) {
    console.error("Update device error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the device"
    });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findByIdAndDelete(id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device deleted successfully"
    });
  } catch (error) {
    console.error("Delete device error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the device"
    });
  }
};

module.exports = {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice
};