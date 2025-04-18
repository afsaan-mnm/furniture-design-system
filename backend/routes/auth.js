const express = require("express");
const { register, login } = require("../controllers/authController");
const { authenticateUser, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticateUser, (req, res) => {
    res.status(200).json({ msg: "Authenticated user", user: req.user });
});

router.get("/admin-only", authenticateUser, checkRole("admin"), (req, res) => {
    res.json({ msg: "Welcome, Admin!" });
});

module.exports = router;