const express = require("express");
const router = express.Router();

const {
  saveDesign,
  getMyDesigns,
  updateDesign,
  deleteDesign,
  getPublicDesigns,
  toggleVisibility,
  getDesignById,
  upload // handles background image upload
} = require("../controllers/designController");

const { authenticateUser } = require("../middleware/authMiddleware");

// Public Routes
router.get("/explore/all", getPublicDesigns);
router.get("/:id", getDesignById);

// Protected User Routes
router.post("/save", authenticateUser, upload, saveDesign);

router.get("/my", authenticateUser, getMyDesigns);
router.put("/:id", authenticateUser, updateDesign);
router.put("/:id/visibility", authenticateUser, toggleVisibility);
router.delete("/:id", authenticateUser, deleteDesign);

module.exports = router;