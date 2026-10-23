const Department = require("../models/Department");

const DEFAULTS = [
  { name: "Cardiology", desc: "Heart & blood pressure care" },
  { name: "ENT", desc: "Ear, nose & throat" },
  { name: "Pediatrics", desc: "Child health & vaccines" },
  { name: "Dermatology", desc: "Skin & hair treatments" },
  { name: "Orthopedics", desc: "Bones, joints & injuries" },
  { name: "Neurology", desc: "Brain, nerves & headaches" },
  { name: "Gynecology", desc: "Women’s health" },
  { name: "General Medicine", desc: "Fever, cough & routine care" },
];

async function seedDepartments() {
  const count = await Department.estimatedDocumentCount();
  if (count > 0) return;
  await Department.insertMany(DEFAULTS);
  console.log("✅ Seeded departments");
}

module.exports = seedDepartments;
