// backend/routes/staffRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

// GET /api/staff
router.get("/", getAllStaff);

// GET /api/staff/:id
router.get("/:id", getStaffById);

// POST /api/staff
router.post("/", createStaff);

// PUT /api/staff/:id
router.put("/:id", updateStaff);

// DELETE /api/staff/:id
router.delete("/:id", deleteStaff);

module.exports = router;
