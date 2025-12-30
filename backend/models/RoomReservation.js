// backend/models/RoomReservation.js
const mongoose = require("mongoose");

const roomReservationSchema = new mongoose.Schema(
  {
    salle: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    motif: { type: String, default: "" },
    status: { type: String, enum: ["confirmée", "annulée"], default: "confirmée" },
  },
  { timestamps: true }
);

// index utile pour perf
roomReservationSchema.index({ salle: 1, start: 1, end: 1 });

module.exports = mongoose.model("RoomReservation", roomReservationSchema);
