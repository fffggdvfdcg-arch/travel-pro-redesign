const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
    cruise: { type: mongoose.Schema.Types.ObjectId, ref: "Cruise" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productType: { type: String, enum: ["tour", "cruise"], default: "tour" },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: Date },
    people: { type: Number, required: true, min: 1, default: 1 },
    guests: { adults: { type: Number, default: 1 }, children: { type: Number, default: 0 } },
    totalPrice: { type: Number, default: 0, min: 0 },
    comment: { type: String, default: "" },
    status: { type: String, enum: ["new", "in_work", "confirmed", "cancelled"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
