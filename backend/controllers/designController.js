const { db } = require("../utils/firebase");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Storage for background image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "assets", "Upload");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

exports.upload = multer({ storage }).single("bgImage");

// Allowed object images
const allowedImages = [
  "bed1blue.png", "bed1red.png", "bed1white.png",
  "bed2blue.png", "bed2red.png", "bed2white.png",
  "chair1blue.png", "chair1brown.png", "chair1red.png", "chair1white.png",
  "sofa1white.png", "sofa1blue.png", "sofa1brown.png",
  "sofa2blue.png", "sofa2brown.png", "sofa2gray.png", "sofa2green.png",
  "table1bl.png", "table1br.png", "table1w.png"
];

const allowed3DModels = [
  "Bookrack.glb", "gamingchair.glb", "Chair1.glb", "Chair2.glb", "coffeetable.glb", "rack2.glb", "soffaaaa.glb", "sofa1.glb", "couch02.glb"
];

// Validate object images
const validateDesignObjects = (objects) => {
  return objects.map((obj) => {
    const imagePath = obj.image || obj.path;
    const fileName = imagePath?.split("/").pop();

    // Only validate .png for 2D
    if (fileName?.endsWith(".png")) {
      if (!allowedImages.includes(fileName)) {
        throw new Error(`Invalid image provided: ${fileName}`);
      }
    }

    return obj;
  });
};

// Save Design
exports.saveDesign = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, isPublic } = req.body;
    const objects = JSON.parse(req.body.objects || "[]");

    if (!name || objects.length === 0 || !type) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Validate 2D images only (skip .obj/.glb)
    const validatedObjects = validateDesignObjects(objects);

    let backgroundPath = "";
    if (req.file) {
      backgroundPath = `${req.file.filename}`;
    }

    const designData = {
      objects: validatedObjects,
      background: backgroundPath
    };

    await db.collection("designs").add({
      userId,
      name,
      type,
      isPublic: isPublic === "true" || isPublic === true,
      designData,
      createdAt: new Date()
    });

    return res.status(201).json({ msg: "Design saved successfully" });
  } catch (err) {
    console.error("Save design error:", err.message);
    return res.status(500).json({ msg: "Failed to save design" });
  }
};


// Get designs of logged in user
exports.getMyDesigns = async (req, res) => {
  try {
    const userId = String(req.user.id);
    const snapshot = await db.collection("designs").where("userId", "==", userId).get();

    if (snapshot.empty) {
      return res.status(404).json({ msg: "No designs found" });
    }

    const designs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ designs });
  } catch (err) {
    console.error("Error fetching user designs:", err.message);
    return res.status(500).json({ msg: "Failed to fetch designs" });
  }
};

// Get a single design by ID
exports.getDesignById = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection("designs").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ msg: "Design not found" });
    }
    return res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Get by ID error:", err.message);
    return res.status(500).json({ msg: "Failed to fetch design" });
  }
};

// Update design
exports.updateDesign = async (req, res) => {
  const { id } = req.params;
  const { name, objects, designMeta, type, isPublic } = req.body;

  try {
    const docRef = db.collection("designs").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).json({ msg: "Design not found" });
    if (doc.data().userId !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

    let parsedObjects = [];
    let parsedMeta = {};

    try {
      parsedObjects = JSON.parse(objects || "[]");
      parsedMeta = JSON.parse(designMeta || "{}");
    } catch (err) {
      return res.status(400).json({ msg: "Invalid JSON in objects or designMeta" });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (parsedObjects.length > 0) {
      const validatedObjects = validateDesignObjects(parsedObjects);
      updateFields.designData = {
        ...parsedMeta,
        objects: validatedObjects,
      };
    }
    if (type) updateFields.type = type;
    if (typeof isPublic === "boolean" || isPublic === "true" || isPublic === "false") {
      updateFields.isPublic = isPublic === "true" || isPublic === true;
    }

    await docRef.update(updateFields);

    return res.status(200).json({ msg: "Design updated successfully" });
  } catch (err) {
    console.error("Update error:", err.message);
    return res.status(500).json({ msg: "Failed to update design" });
  }
};

// Delete design
exports.deleteDesign = async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection("designs").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ msg: "Design not found" });
    if (doc.data().userId !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

    await docRef.delete();
    return res.status(200).json({ msg: "Design deleted" });
  } catch (err) {
    console.error("Delete error:", err.message);
    return res.status(500).json({ msg: "Failed to delete design" });
  }
};

// Get all public designs
exports.getPublicDesigns = async (req, res) => {
  try {
    const snapshot = await db
      .collection("designs")
      .where("isPublic", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    const designs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ designs });
  } catch (err) {
    console.error("Public designs error:", err.message);
    return res.status(500).json({ msg: "Failed to fetch public designs" });
  }
};

// Toggle visibility
exports.toggleVisibility = async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection("designs").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ msg: "Design not found" });
    if (doc.data().userId !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

    const currentVisibility = doc.data().isPublic || false;
    await docRef.update({ isPublic: !currentVisibility });

    return res.status(200).json({ msg: `Visibility set to ${!currentVisibility}` });
  } catch (err) {
    console.error("Visibility toggle error:", err.message);
    return res.status(500).json({ msg: "Failed to toggle visibility" });
  }
};

// Get all private designs from any user
exports.getPrivateDesigns = async (req, res) => {
  try {
    const snapshot = await db
      .collection("designs")
      .where("isPublic", "==", false)
      .orderBy("createdAt", "desc")
      .get();

    const designs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ designs });
  } catch (err) {
    console.error("Private designs fetch error:", err.message);
    return res.status(500).json({ msg: "Failed to fetch private designs" });
  }
};