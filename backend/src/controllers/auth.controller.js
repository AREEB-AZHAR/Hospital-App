const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { publicUser } = require("../utils/publicUser");
const { recordAudit } = require("../utils/audit");

function signAccessToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in .env");
  }
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );
}

async function createRefreshToken(userId, ip = "") {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
    ip: String(ip || "").split(",")[0].trim(),
  });
  return token;
}

exports.register = async (req, res, next) => {
  try {
    const { name, phone, password, email, hospitalId } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "name, phone, password required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ phone: String(phone).trim() });
    if (exists) return res.status(409).json({ message: "Phone already registered" });

    const hid = String(hospitalId || "").trim();
    if (hid) {
      const hidTaken = await User.findOne({ hospitalId: hid });
      if (hidTaken) return res.status(409).json({ message: "Hospital ID already registered" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email || "").trim(),
      hospitalId: hid,
      passwordHash,
      role: "patient",
    });

    const token = signAccessToken(user);
    const refreshToken = await createRefreshToken(user._id, req.ip);

    await recordAudit({ user, ip: req.ip }, "USER_REGISTER", "User", user._id, { phone: user.phone });

    res.json({
      token,
      refreshToken,
      user: publicUser(user),
    });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: "phone, password required" });

    const user = await User.findOne({ phone: String(phone).trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signAccessToken(user);
    const refreshToken = await createRefreshToken(user._id, req.ip);

    await recordAudit({ user, ip: req.ip }, "USER_LOGIN", "User", user._id);

    res.json({
      token,
      refreshToken,
      user: publicUser(user),
    });
  } catch (e) {
    next(e);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const cleanPhone = String(phone).trim();
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return res.json({
        ok: true,
        message: "If an account exists with this phone number, a 6-digit reset code has been sent.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 8);

    user.resetPasswordOtp = otpHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    console.log(`[SMS Gateway Mock] Reset OTP for ${cleanPhone}: ${otp}`);

    await recordAudit({ user, ip: req.ip }, "USER_FORGOT_PASSWORD_REQUESTED", "User", user._id);

    res.json({
      ok: true,
      message: "A 6-digit reset code has been sent.",
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    });
  } catch (e) {
    next(e);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: "Phone, reset code, and new password are required" });
    }

    const cleanPass = String(newPassword).trim();
    if (cleanPass.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanPhone = String(phone).trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ phone: cleanPhone });
    if (!user || !user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    if (user.resetPasswordExpires.getTime() < Date.now()) {
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    const isValid = await bcrypt.compare(cleanOtp, user.resetPasswordOtp);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect reset code" });
    }

    user.passwordHash = await bcrypt.hash(cleanPass, 10);
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    await recordAudit({ user, ip: req.ip }, "PASSWORD_RESET", "User", user._id);

    res.json({
      ok: true,
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (e) {
    next(e);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const doc = await RefreshToken.findOne({ token: String(refreshToken).trim() });
    if (!doc || doc.revokedAt || doc.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(doc.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const token = signAccessToken(user);

    res.json({ token });
  } catch (e) {
    next(e);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        { token: String(refreshToken).trim() },
        { revokedAt: new Date() }
      );
    }

    res.json({ ok: true, message: "Logged out successfully" });
  } catch (e) {
    next(e);
  }
};
