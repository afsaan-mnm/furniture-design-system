const { db } = require("../utils/firebase");

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      console.log("Authenticated user:", req.user);

      const snapshot = await db
        .collection("users")
        .where("email", "==", req.user.email)
        .get();

      if (snapshot.empty) {
        console.log("No user found in Firestore");
        return res.status(403).json({ msg: "User not found" });
      }

      const user = snapshot.docs[0].data();
      console.log("Firestore user data:", user);

      if (user.role !== requiredRole) {
        console.log(`Role mismatch. Required: ${requiredRole}, Found: ${user.role}`);
        return res.status(403).json({ msg: "Forbidden: Insufficient role" });
      }

      console.log("Role verified");
      next();
    } catch (err) {
      console.error("Role check error:", err.message);
      return res.status(500).json({ msg: "Internal role check error" });
    }
  };
};

module.exports = checkRole;