const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  listingTitle: String,
  location: String,
  country: String,
  price: Number,
  bookedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
