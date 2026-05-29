const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { staffOnly, adminOnly } = require("../middleware/roleMiddleware");
const { createBooking, getBookings, updateBookingStatus, deleteBooking } = require("../controllers/bookingController");

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, staffOnly, getBookings);
router.put("/:id/status", authMiddleware, staffOnly, updateBookingStatus);
router.delete("/:id", authMiddleware, adminOnly, deleteBooking);

module.exports = router;
