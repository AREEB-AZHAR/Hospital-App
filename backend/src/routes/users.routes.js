const router = require("express").Router();
const bcrypt = require("bcrypt");
const { requireAuth, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const { publicUser } = require("../utils/publicUser");
const { recordAudit } = require("../utils/audit");

// ── GET /users/doctors — list all doctors with full profile ──────────────────
router.get(
  "/doctors",
  requireAuth,
  async (req, res, next) => {
    try {
      const doctors = await User.find({ role: "doctor" })
        .select("_id name phone role department specialization fee experience rating availability avatar")
        .sort({ name: 1 })
        .lean();

      res.json(
        doctors.map((d) => ({
          id: d._id.toString(),
          name: d.name,
          phone: d.phone,
          role: d.role,
          department: d.department || "General",
          specialization: d.specialization || "",
          fee: d.fee ?? 1500,
          experience: d.experience ?? 5,
          rating: d.rating ?? 4.5,
          availability: d.availability || "09:00 AM - 05:00 PM",
          avatar: d.avatar || "",
        }))
      );
    } catch (e) {
      next(e);
    }
  }
);

// ── GET /users/me — current user profile ────────────────────────────────────
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(publicUser(user));
  } catch (e) {
    next(e);
  }
});

// ── PATCH /users/me — update own profile ────────────────────────────────────
router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    let allowed = ["name", "email", "avatar"];
    if (req.user.role === "doctor") {
      allowed = ["name", "email", "specialization", "fee", "experience", "availability", "avatar"];
    } else if (req.user.role === "admin") {
      allowed = ["name", "email", "department", "specialization", "fee", "experience", "availability", "avatar"];
    }

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      select: "-passwordHash",
    }).lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email || "",
      role: user.role,
      department: user.department || "",
      specialization: user.specialization || "",
      fee: user.fee ?? 1500,
      experience: user.experience ?? 5,
      rating: user.rating ?? 4.5,
      availability: user.availability || "",
      avatar: user.avatar || "",
    });
  } catch (e) {
    next(e);
  }
});

// ── GET /users/all — admin only: list all users ──────────────────────────────
router.get(
  "/all",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { role, q, page, limit } = req.query;
      const filter = {};
      if (role && role !== "all") filter.role = role;
      if (q) {
        filter.$or = [
          { name: { $regex: String(q).trim(), $options: "i" } },
          { phone: { $regex: String(q).trim(), $options: "i" } },
        ];
      }

      const query = User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 });

      if (page || limit) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        query.skip((pageNum - 1) * limitNum).limit(limitNum);
      } else {
        query.limit(100);
      }

      const users = await query.lean();

      res.json(
        users.map((u) => publicUser(u))
      );
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/staff",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { name, phone, password, email, role, department, hospitalId } = req.body;
      const allowed = ["doctor", "reception", "admin", "patient"];
      if (!name || !phone || !password) {
        return res.status(400).json({ message: "name, phone, password required" });
      }
      if (!allowed.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const exists = await User.findOne({ phone: String(phone).trim() });
      if (exists) return res.status(409).json({ message: "Phone already registered" });

      const passwordHash = await bcrypt.hash(String(password), 10);
      const user = await User.create({
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email || "").trim(),
        hospitalId: String(hospitalId || "").trim(),
        passwordHash,
        role,
        department: String(department || "").trim(),
      });

      res.json(publicUser(user));
    } catch (e) {
      next(e);
    }
  }
);

// ── PATCH /users/:id/role — admin only: change user role ────────────────────
router.patch(
  "/:id/role",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const { role } = req.body;
      const allowed = ["patient", "doctor", "reception", "admin"];
      if (!allowed.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: "-passwordHash" }
      ).lean();

      if (!user) return res.status(404).json({ message: "User not found" });

      await recordAudit(req, "ROLE_CHANGE", "User", req.params.id, { newRole: role });

      res.json({ id: user._id.toString(), name: user.name, role: user.role });
    } catch (e) {
      next(e);
    }
  }
);

// ── DELETE /users/:id — admin only: delete user ─────────────────────────────
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      if (req.params.id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own admin account" });
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      await recordAudit(req, "USER_DELETE", "User", req.params.id, {
        deletedName: user.name,
        deletedRole: user.role,
      });

      res.json({ message: "User deleted successfully", id: req.params.id });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;

