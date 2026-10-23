const router = require("express").Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} = require("../controllers/auth.controller");
const { loginLimiter } = require("../middleware/loginLimiter");

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", loginLimiter, forgotPassword);
router.post("/reset-password", loginLimiter, resetPassword);

module.exports = router;
