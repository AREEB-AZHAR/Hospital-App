const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { recordAudit } = require("../utils/audit");

const todayKey = (tz = "Asia/Karachi") => {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, department, date, time, note } = req.body;

    if (!doctorId || !department || !date || !time) {
      return res.status(400).json({ message: "doctorId, department, date, time required" });
    }

    const cleanDate = String(date).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
    }

    if (cleanDate < todayKey()) {
      return res.status(400).json({ message: "Cannot book appointments in the past" });
    }

    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(401).json({ message: "Invalid user" });

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") return res.status(400).json({ message: "Invalid doctorId" });

    const clash = await Appointment.findOne({
      doctorId: doctor._id,
      date,
      time,
      status: { $ne: "cancelled" },
    });
    if (clash) {
      return res.status(409).json({ message: "That slot is already booked for this doctor" });
    }

    const appt = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      patientName: patient.name,
      doctorName: doctor.name,
      department,
      date,
      time,
      note: note || "",
      status: "pending",
      paymentStatus: "pending",
    });

    await recordAudit(req, "APPOINTMENT_CREATE", "Appointment", appt._id, {
      doctorName: doctor.name,
      department,
      date,
      time,
    });

    res.json(appt);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: "That slot is already booked for this doctor" });
    }
    next(e);
  }
};

exports.myAppointments = async (req, res, next) => {
  try {
    const list = await Appointment.find({ patientId: req.user.id })
      .sort({ date: -1, time: -1 })
      .lean();

    res.json(list);
  } catch (e) {
    next(e);
  }
};

exports.queueAppointments = async (req, res, next) => {
  try {
    const { date, status, page, limit } = req.query;
    const filter = {};
    if (date) filter.date = String(date).trim();
    if (status) filter.status = String(status).trim();

    const query = Appointment.find(filter).sort({ date: -1, time: -1 });

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      query.skip((pageNum - 1) * limitNum).limit(limitNum);
    } else {
      query.limit(200);
    }

    const list = await query.lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
};

exports.doctorToday = async (req, res, next) => {
  try {
    const tz = req.headers["x-timezone"] || "Asia/Karachi";
    const key = req.query.date ? String(req.query.date).trim() : todayKey(tz);
    const list = await Appointment.find({ doctorId: req.user.id, date: key })
      .sort({ time: 1 })
      .lean();

    res.json({ date: key, items: list });
  } catch (e) {
    next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "upcoming", "arrived", "done", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    // doctor can only update their own appointments
    if (req.user.role === "doctor" && appt.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    appt.status = status;
    await appt.save();

    await recordAudit(req, "APPOINTMENT_STATUS_UPDATE", "Appointment", appt._id, { status });

    res.json(appt);
  } catch (e) {
    next(e);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    // patient can only cancel their own
    if (req.user.role === "patient" && appt.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    appt.status = "cancelled";
    await appt.save();

    await recordAudit(req, "APPOINTMENT_CANCEL", "Appointment", appt._id);

    res.json(appt);
  } catch (e) {
    next(e);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    if (appt.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    appt.note = String(note || "").trim();
    await appt.save();

    await recordAudit(req, "PRESCRIPTION_UPDATE", "Appointment", appt._id);

    res.json(appt);
  } catch (e) {
    next(e);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!["pending", "paid"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid paymentStatus" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    appt.paymentStatus = paymentStatus;
    await appt.save();

    await recordAudit(req, "PAYMENT_UPDATE", "Appointment", appt._id, { paymentStatus });

    res.json(appt);
  } catch (e) {
    next(e);
  }
};

