const { db } = require("./utils/firebase");

db.collection("testLogs").add({
  message: "Write test at " + new Date().toISOString(),
})
.then(() => console.log("Firestore write success"))
.catch((err) => console.error("Firestore write failed:", err));