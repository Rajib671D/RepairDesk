const Customer = require("../models/Customer");

const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = await Customer.create({
      name,
      phone,
      email,
      address
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer
    });
  } catch (error) {
    console.error("Create customer error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the customer"
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      customers
    });
  } catch (error) {
    console.error("Get customers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching customers"
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    return res.status(200).json({
      success: true,
      customer
    });
  } catch (error) {
    console.error("Get customer by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the customer"
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { name, phone, email, address },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer
    });
  } catch (error) {
    console.error("Update customer error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the customer"
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully"
    });
  } catch (error) {
    console.error("Delete customer error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the customer"
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};