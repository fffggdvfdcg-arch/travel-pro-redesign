const User = require("../models/User");

const roleRank = { user: 1, manager: 2, admin: 3, superadmin: 4 };
const allowedRoles = ["user", "manager", "admin", "superadmin"];

const canManageTarget = (actor, target) => {
  if (!actor || !target) return false;
  if (actor._id.toString() === target._id.toString()) return false;
  if (actor.role === "superadmin") return true;
  if (actor.role === "admin") return ["user", "manager"].includes(target.role);
  return false;
};

const getUsers = async (req, res) => {
  try {
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only Admin/Super Admin can view users" });
    }
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (!canManageTarget(req.user, targetUser)) {
      return res.status(403).json({ message: "You do not have permission to delete this user" });
    }

    // Important: delete the exact document that passed the permission check.
    // This avoids the UI hiding a user while the document is still present in MongoDB.
    const deletedId = targetUser._id.toString();
    await targetUser.deleteOne();

    const stillExists = await User.exists({ _id: deletedId });
    if (stillExists) {
      return res.status(500).json({ message: "User was not deleted from database" });
    }

    res.json({ message: "User deleted", deletedId });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const banUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (!canManageTarget(req.user, targetUser)) {
      return res.status(403).json({ message: "You do not have permission to ban this user" });
    }
    targetUser.isBanned = true;
    await targetUser.save();
    res.json({ message: "User banned", user: targetUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const unbanUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (!canManageTarget(req.user, targetUser)) {
      return res.status(403).json({ message: "You do not have permission to unban this user" });
    }
    targetUser.isBanned = false;
    await targetUser.save();
    res.json({ message: "User unbanned", user: targetUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });
    if (role === "superadmin") {
      return res.status(403).json({ message: "Super Admin can only be assigned directly on the server/database" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }
    if (targetUser.role === "superadmin") {
      return res.status(403).json({ message: "Super Admin role cannot be changed from admin panel" });
    }

    if (req.user.role === "admin") {
      const onlyUserOrManager = ["user", "manager"].includes(targetUser.role) && ["user", "manager"].includes(role);
      if (!onlyUserOrManager) {
        return res.status(403).json({ message: "Admin can only promote User to Manager or demote Manager to User" });
      }
    } else if (req.user.role === "superadmin") {
      if (roleRank[role] >= roleRank.superadmin) {
        return res.status(403).json({ message: "Cannot assign Super Admin from admin panel" });
      }
    } else {
      return res.status(403).json({ message: "Only Admin/Super Admin can change roles" });
    }

    targetUser.role = role;
    await targetUser.save();
    res.json({ message: "Role changed", user: targetUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUsers, deleteUser, banUser, unbanUser, changeRole };
