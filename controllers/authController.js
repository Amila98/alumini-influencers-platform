const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {

    const { email, password } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // check existing user
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};