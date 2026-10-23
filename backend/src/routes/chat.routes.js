const router = require("express").Router();
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/auth");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Message = require("../models/Message");

function pairFilter(a, b) {
  return {
    $or: [
      { senderId: a, receiverId: b },
      { senderId: b, receiverId: a },
    ],
  };
}

async function canAccessConversation(user, targetId) {
  if (user.role === "admin" || user.role === "reception") return true;

  const target = await User.findById(targetId).select("role").lean();
  if (!target) return false;

  if (target.role === "admin" || target.role === "reception") return true;

  if (user.role === "doctor" && target.role === "patient") {
    const hasAppt = await Appointment.exists({
      doctorId: user.id,
      patientId: targetId,
    });
    return Boolean(hasAppt);
  }

  if (user.role === "patient" && target.role === "doctor") {
    const hasAppt = await Appointment.exists({
      patientId: user.id,
      doctorId: targetId,
    });
    return Boolean(hasAppt);
  }

  return false;
}

router.get("/contacts", requireAuth, async (req, res, next) => {
  try {
    const me = req.user.id;
    const role = req.user.role;
    const ids = new Set();

    const recent = await Message.find({
      $or: [{ senderId: me }, { receiverId: me }],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    for (const m of recent) {
      const other = m.senderId.toString() === me ? m.receiverId.toString() : m.senderId.toString();
      ids.add(other);
    }

    if (role === "patient") {
      const staff = await User.find({ role: { $in: ["reception", "admin"] } })
        .select("_id")
        .lean();
      staff.forEach((u) => ids.add(u._id.toString()));
      const appts = await Appointment.find({ patientId: me }).select("doctorId").lean();
      appts.forEach((a) => ids.add(a.doctorId.toString()));
    } else if (role === "doctor") {
      const staff = await User.find({ role: { $in: ["reception", "admin"] } })
        .select("_id")
        .lean();
      staff.forEach((u) => ids.add(u._id.toString()));
      const appts = await Appointment.find({ doctorId: me }).select("patientId").lean();
      appts.forEach((a) => ids.add(a.patientId.toString()));
    } else {
      const others = await User.find({ _id: { $ne: me } }).select("_id").limit(150).lean();
      others.forEach((u) => ids.add(u._id.toString()));
    }

    ids.delete(me);
    const users = await User.find({ _id: { $in: [...ids] } })
      .select("_id name role department")
      .lean();

    const lastByUser = {};
    for (const m of recent) {
      const other = m.senderId.toString() === me ? m.receiverId.toString() : m.senderId.toString();
      if (!lastByUser[other]) lastByUser[other] = m;
    }

    const contacts = users
      .map((u) => {
        const last = lastByUser[u._id.toString()];
        return {
          id: u._id.toString(),
          name: u.name,
          role: u.role,
          department: u.department || "",
          last: last?.text || "",
          lastAt: last?.createdAt || null,
        };
      })
      .sort((a, b) => {
        const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
        const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
        return tb - ta;
      });

    res.json(contacts);
  } catch (e) {
    next(e);
  }
});

router.get("/with/:userId", requireAuth, async (req, res, next) => {
  try {
    const other = req.params.userId;
    if (!mongoose.isValidObjectId(other)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const allowed = await canAccessConversation(req.user, other);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied to this conversation" });
    }

    const list = await Message.find(pairFilter(req.user.id, other)).sort({ createdAt: 1 }).lean();

    res.json(
      list.map((m) => ({
        id: m._id.toString(),
        fromMe: m.senderId.toString() === req.user.id,
        text: m.text,
        createdAt: new Date(m.createdAt).getTime(),
        status: "delivered",
      }))
    );
  } catch (e) {
    next(e);
  }
});

router.post("/with/:userId", requireAuth, async (req, res, next) => {
  try {
    const other = req.params.userId;
    const text = String(req.body.text || "").trim();
    if (!mongoose.isValidObjectId(other)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!text) return res.status(400).json({ message: "text required" });
    if (other === req.user.id) return res.status(400).json({ message: "Cannot message yourself" });

    const peer = await User.findById(other).select("_id role").lean();
    if (!peer) return res.status(404).json({ message: "User not found" });

    const allowed = await canAccessConversation(req.user, other);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied to message this user" });
    }

    const msg = await Message.create({
      senderId: req.user.id,
      receiverId: other,
      text,
    });

    res.json({
      id: msg._id.toString(),
      fromMe: true,
      text: msg.text,
      createdAt: new Date(msg.createdAt).getTime(),
      status: "sent",
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
