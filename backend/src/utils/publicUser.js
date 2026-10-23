function publicUser(user) {
  if (!user) return null;
  const id = user._id ? user._id.toString() : user.id;
  return {
    id,
    name: user.name,
    phone: user.phone,
    email: user.email || "",
    hospitalId: user.hospitalId || "",
    role: user.role,
    department: user.department || "",
    specialization: user.specialization || "",
    fee: user.fee ?? 1500,
    experience: user.experience ?? 5,
    rating: user.rating ?? 4.5,
    availability: user.availability || "",
    avatar: user.avatar || "",
    createdAt: user.createdAt,
  };
}

module.exports = { publicUser };
