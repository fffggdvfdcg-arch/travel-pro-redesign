const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const Cruise = require("../models/Cruise");

const createBooking = async (req, res) => {
  try {
    const { tourId, cruiseId, productType = tourId ? "tour" : "cruise", name, phone, people, guests, date, comment } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "Name and phone are required" });

    const model = productType === "cruise" ? Cruise : Tour;
    const productId = productType === "cruise" ? cruiseId : tourId;
    if (!productId) return res.status(400).json({ message: "Tour or cruise is required" });

    const product = await model.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ message: "Product not found" });

    const adults = Number(guests?.adults || people || 1);
    const children = Number(guests?.children || 0);
    const totalGuests = Math.max(1, adults + children);
    if (product.maxPeople && totalGuests > product.maxPeople) return res.status(400).json({ message: `Maximum people: ${product.maxPeople}` });

    const discount = product.lowPrice ? Number(product.discountPercent || 35) : 0;
    const totalPrice = Math.round(Number(product.price) * totalGuests * (1 - discount / 100));

    const booking = await Booking.create({
      tour: productType === "tour" ? productId : undefined,
      cruise: productType === "cruise" ? productId : undefined,
      productType,
      name,
      phone,
      date,
      people: totalGuests,
      guests: { adults, children },
      totalPrice,
      comment,
      user: req.user?._id,
    });
    const populated = await booking.populate([
      { path: "tour", select: "title location price duration" },
      { path: "cruise", select: "title route price duration liner" },
    ]);
    res.status(201).json({ message: "Заявка отправлена менеджеру", booking: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("tour", "title location price duration")
      .populate("cruise", "title route price duration liner")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "in_work", "confirmed", "cancelled"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("tour", "title location price duration")
      .populate("cruise", "title route price duration liner");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus, deleteBooking };
