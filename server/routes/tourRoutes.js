const express = require("express");
const router = express.Router();
const { getAllTours, getTourById, createTour, updateTour, deleteTour, likeTour, addComment } = require("../controllers/tourController");
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

router.get("/", getAllTours);
router.get("/:id", getTourById);
router.post("/:id/like", likeTour);
router.post("/:id/comments", addComment);
router.post("/", authMiddleware, adminOnly, createTour);
router.put("/:id", authMiddleware, adminOnly, updateTour);
router.delete("/:id", authMiddleware, adminOnly, deleteTour);

module.exports = router;
