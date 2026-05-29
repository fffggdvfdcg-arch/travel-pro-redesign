const Cruise = require("../models/Cruise");

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
};

const numericFields = ["price", "duration", "stars", "maxPeople", "discountPercent"];

const buildPayload = (body) => {
  const payload = { ...body };
  numericFields.forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== "") payload[key] = Number(payload[key]);
  });
  if (payload.ports !== undefined) payload.ports = normalizeArray(payload.ports);
  if (payload.tags !== undefined) payload.tags = normalizeArray(payload.tags);
  if (payload.lowPrice !== undefined) payload.lowPrice = payload.lowPrice === true || payload.lowPrice === "true";
  return payload;
};

const getAllCruises = async (req, res) => {
  try {
    const cruises = await Cruise.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(cruises);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCruiseById = async (req, res) => {
  try {
    const cruise = await Cruise.findById(req.params.id);
    if (!cruise) return res.status(404).json({ message: "Cruise not found" });
    res.json(cruise);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createCruise = async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const { title, description, route, liner, price, duration } = payload;
    if (!title || !description || !route || !liner || price === undefined || !duration) {
      return res.status(400).json({ message: "Fill title, description, route, liner, price and duration" });
    }
    const cruise = await Cruise.create({ ...payload, createdBy: req.user._id });
    res.status(201).json(cruise);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateCruise = async (req, res) => {
  try {
    const cruise = await Cruise.findByIdAndUpdate(req.params.id, buildPayload(req.body), { new: true, runValidators: true });
    if (!cruise) return res.status(404).json({ message: "Cruise not found" });
    res.json(cruise);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCruise = async (req, res) => {
  try {
    const cruise = await Cruise.findByIdAndDelete(req.params.id);
    if (!cruise) return res.status(404).json({ message: "Cruise not found" });
    res.json({ message: "Cruise deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllCruises, getCruiseById, createCruise, updateCruise, deleteCruise };
