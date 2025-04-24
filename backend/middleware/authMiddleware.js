const jwt = require("jsonwebtoken");
const { db } = require("../utils/firebase");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Unauthorized: Invalid token" });
  }
};

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const snapshot = await db
        .collection("users")
        .where("email", "==", req.user.email)
        .get();

      if (snapshot.empty) {
        return res.status(403).json({ msg: "User not found" });
      }

      const user = snapshot.docs[0].data();

      if (user.role !== requiredRole) {
        return res.status(403).json({ msg: "Forbidden: Insufficient role" });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err.message);
      return res.status(500).json({ msg: "Internal role check error" });
    }
  };
};

module.exports = { authenticateUser, checkRole };