const express = require("express");
const { login } = require("../controllers/authController");
const validate = require("../middleware/validationMiddleware");
const { loginSchema } = require("../utils/validation");

const router = express.Router();

router.post("/login", validate(loginSchema), login);

module.exports = router;