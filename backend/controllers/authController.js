import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, flat, phone } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || "resident",
      flat: flat || "",
      phone: phone || "",
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          flat: user.flat,
          phone: user.phone,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log(`Login debug: email="${email}", userFound=${!!user}`);
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Login debug: isMatch=${isMatch}`);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    res.json({
      token: generateToken(user._id),
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        flat: user.flat,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, flat, phone } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.flat = flat !== undefined ? flat : user.flat;
    user.phone = phone !== undefined ? phone : user.phone;

    const updatedUser = await user.save();

    res.json({
      ok: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        flat: updatedUser.flat,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};
