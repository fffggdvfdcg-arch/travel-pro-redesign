const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "manager", "admin", "superadmin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    acceptedLegal: { type: Boolean, default: false },
    acceptedLegalAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
