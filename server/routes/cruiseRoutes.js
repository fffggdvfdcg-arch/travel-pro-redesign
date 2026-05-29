const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const { getAllCruises, getCruiseById, createCruise, updateCruise, deleteCruise } = require("../controllers/cruiseController");

router.get("/", getAllCruises);
router.get("/:id", getCruiseById);
router.post("/", authMiddleware, adminOnly, createCruise);
router.put("/:id", authMiddleware, adminOnly, updateCruise);
router.delete("/:id", authMiddleware, adminOnly, deleteCruise);

module.exports = router;
