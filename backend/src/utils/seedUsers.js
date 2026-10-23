const bcrypt = require("bcrypt");
const User = require("../models/User");

const SEED_USERS = [
  {
    name: "Alex Morgan",
    phone: "03001234567",
    email: "alex.morgan@hospital.local",
    hospitalId: "P-1001",
    role: "patient",
  },
  {
    name: "Dr. Sarah Jenkins",
    phone: "03001112233",
    email: "s.jenkins@hospital.local",
    hospitalId: "D-2001",
    role: "doctor",
    department: "Cardiology",
    specialization: "Senior Interventional Cardiologist",
    fee: 2000,
    experience: 14,
    rating: 4.9,
    availability: "09:00 AM - 02:00 PM",
  },
  {
    name: "Dr. Marcus Vance",
    phone: "03002223344",
    email: "m.vance@hospital.local",
    hospitalId: "D-2002",
    role: "doctor",
    department: "Neurology",
    specialization: "Consultant Neurosurgeon",
    fee: 2500,
    experience: 16,
    rating: 4.8,
    availability: "10:00 AM - 04:00 PM",
  },
  {
    name: "Dr. Elena Rostova",
    phone: "03003334455",
    email: "e.rostova@hospital.local",
    hospitalId: "D-2003",
    role: "doctor",
    department: "Pediatrics",
    specialization: "Child Healthcare & Immunologist",
    fee: 1800,
    experience: 10,
    rating: 4.9,
    availability: "08:30 AM - 03:30 PM",
  },
  {
    name: "Dr. Tariq Al-Mansoor",
    phone: "03004445566",
    email: "t.mansoor@hospital.local",
    hospitalId: "D-2004",
    role: "doctor",
    department: "Orthopedics",
    specialization: "Orthopedic & Joint Surgeon",
    fee: 2200,
    experience: 12,
    rating: 4.7,
    availability: "11:00 AM - 05:00 PM",
  },
  {
    name: "Dr. Aisha Patel",
    phone: "03005556677",
    email: "a.patel@hospital.local",
    hospitalId: "D-2005",
    role: "doctor",
    department: "Dermatology",
    specialization: "Aesthetic & Clinical Dermatologist",
    fee: 1700,
    experience: 8,
    rating: 4.8,
    availability: "01:00 PM - 07:00 PM",
  },
  {
    name: "Dr. James Wilson",
    phone: "03006667788",
    email: "j.wilson@hospital.local",
    hospitalId: "D-2006",
    role: "doctor",
    department: "General Medicine",
    specialization: "Internal Medicine Specialist",
    fee: 1400,
    experience: 7,
    rating: 4.6,
    availability: "09:00 AM - 05:00 PM",
  },
];

async function seedUsers() {
  const count = await User.estimatedDocumentCount();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash("123456", 10);
  const usersToInsert = SEED_USERS.map((u) => ({
    ...u,
    passwordHash,
  }));

  await User.insertMany(usersToInsert);
  console.log("✅ Seeded demo patient and doctors (default password: 123456)");
}

module.exports = seedUsers;
