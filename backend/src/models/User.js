const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, default: "" },
    hospitalId: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "reception", "admin"],
      default: "patient",
    },
    // Doctor-specific profile fields
    department: { type: String, trim: true, default: "" },
    specialization: { type: String, trim: true, default: "" },
    fee: { type: Number, default: 1500 },
    experience: { type: Number, default: 5 },
    rating: { type: Number, default: 4.5 },
    availability: { type: String, trim: true, default: "09:00 AM - 05:00 PM" },
    avatar: { type: String, trim: true, default: "" },

    // Password reset OTP
    resetPasswordOtp: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

