const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Total seats must be at least 1"],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, "Available seats cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    image: {
      type: String,
      default: "",
    },
    seatsLayout: [
      {
        rowName: { type: String, required: true },
        seats: [
          {
            seatNumber: { type: String, required: true },
            isBooked: { type: Boolean, default: false },
            isBlocked: { type: Boolean, default: false },
            category: { type: String, default: "Standard" },
            price: { type: Number, required: true }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
