const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");
const { getUsers, deleteUser, banUser, unbanUser, changeRole } = require("../controllers/adminController");

router.get("/users", authMiddleware, adminOnly, getUsers);
router.delete("/users/:id", authMiddleware, adminOnly, deleteUser);
router.put("/users/:id/ban", authMiddleware, adminOnly, banUser);
router.put("/users/:id/unban", authMiddleware, adminOnly, unbanUser);
router.put("/users/:id/role", authMiddleware, adminOnly, changeRole);

module.exports = router;
