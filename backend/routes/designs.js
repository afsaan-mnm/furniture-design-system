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
  upload 
} = require("../controllers/designController");

const { authenticateUser } = require("../middleware/authMiddleware");
const { getPrivateDesigns } = require("../controllers/designController");

// Public Routes
router.get("/explore/all", getPublicDesigns);
router.get("/:id", getDesignById);

// Protected User Routes
router.post("/save", authenticateUser, upload, saveDesign);

router.get("/my", authenticateUser, getMyDesigns);
router.put("/:id", authenticateUser, updateDesign);
router.put("/:id/visibility", authenticateUser, toggleVisibility);
router.delete("/:id", authenticateUser, deleteDesign);
router.get("/explore/private", getPrivateDesigns); 

module.exports = router;