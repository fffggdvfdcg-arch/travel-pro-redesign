const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    country: { type: String, default: "", trim: true },
    type: { type: String, enum: ["tour", "package", "cruise", "hotel"], default: "package" },
    stars: { type: Number, min: 1, max: 5, default: 4 },
    tags: [{ type: String, trim: true }],
    image: { type: String, default: "" },
    maxPeople: { type: Number, default: 10, min: 1 },
    lowPrice: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    likes: { type: Number, default: 0 },
    comments: [commentSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);
