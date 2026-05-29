const Tour = require("../models/Tour");

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
};

const normalizePayload = (body) => {
  const payload = { ...body };
  ["price", "duration", "maxPeople", "stars", "discountPercent"].forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== "") payload[key] = Number(payload[key]);
  });
  if (payload.tags !== undefined) payload.tags = normalizeArray(payload.tags);
  if (payload.lowPrice !== undefined) payload.lowPrice = payload.lowPrice === true || payload.lowPrice === "true";
  return payload;
};

const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTour = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const { title, description, price, duration, location } = payload;
    if (!title || !description || price === undefined || !duration || !location) {
      return res.status(400).json({ message: "Fill title, description, price, duration and location" });
    }
    const tour = await Tour.create({ ...payload, createdBy: req.user._id });
    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, normalizePayload(req.body), { new: true, runValidators: true });
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json({ message: "Tour deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const likeTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ message: "Name and comment are required" });
    const tour = await Tour.findByIdAndUpdate(req.params.id, { $push: { comments: { name, text } } }, { new: true, runValidators: true });
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.status(201).json(tour);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllTours, getTourById, createTour, updateTour, deleteTour, likeTour, addComment };
