const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../utils/firebase");

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  console.log("REGISTER ENDPOINT TRIGGERED");
  console.log("Body received:", req.body);

  try {
    const { email, password, role } = req.body;
    const usersRef = db.collection("users");

    const existingUser = await usersRef.where("email", "==", email).get();

    if (!existingUser.empty) {
      console.log("User already exists");
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersRef.add({ email, password: hashedPassword, role: role || "user" });

    console.log("User registered");
    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Firebase Error:", error);
    res.status(500).json({ msg: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(400).json({ msg: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: userDoc.id, email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ msg: "Login failed", error: error.message });
  }
};