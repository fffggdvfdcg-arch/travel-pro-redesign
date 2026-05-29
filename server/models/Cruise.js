const mongoose = require("mongoose");

const cruiseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    route: { type: String, required: true, trim: true },
    ports: [{ type: String, trim: true }],
    liner: { type: String, required: true, trim: true },
    cabin: { type: String, default: "Interior", trim: true },
    country: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    departureDate: { type: Date },
    image: { type: String, default: "" },
    stars: { type: Number, min: 1, max: 5, default: 5 },
    tags: [{ type: String, trim: true }],
    maxPeople: { type: Number, default: 20, min: 1 },
    lowPrice: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cruise", cruiseSchema);
