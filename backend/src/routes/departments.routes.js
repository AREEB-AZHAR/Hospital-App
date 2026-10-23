const router = require("express").Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const Department = require("../models/Department");

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const list = await Department.find().sort({ name: 1 }).lean();
    res.json(
      list.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        desc: d.desc || "",
      }))
    );
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const desc = String(req.body.desc || "").trim();
    if (!name) return res.status(400).json({ message: "name required" });

    const dept = await Department.create({ name, desc });
    res.json({ id: dept._id.toString(), name: dept.name, desc: dept.desc || "" });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "Department already exists" });
    next(e);
  }
});

module.exports = router;
