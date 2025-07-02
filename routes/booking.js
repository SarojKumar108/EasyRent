const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const generateTicket = require("../utils/generateTicket");
const sendTicketEmail = require("../utils/sendTicketEmail");
const sendOTP = require("../utils/sendOTP");
const Booking = require("../models/booking");

// ✅ Show OTP verification form
router.get("/verify-otp", (req, res) => {
  if (!req.session.otp) {
    req.flash("error", "Session expired. Please try again.");
    return res.redirect("/listings");
  }
  res.render("bookings/verifyOtp.ejs");
});

/// ✅ Handle OTP verification
router.post("/verify-otp", async (req, res, next) => {
  try {
    const { otp } = req.body;
    const { otp: sessionOTP, listingId, email } = req.session;

    if (!sessionOTP) {
      req.flash("error", "Session expired. Please start again.");
      return res.redirect("/listings");
    }

    if (Number(otp) !== sessionOTP) {
      req.flash("error", "Incorrect OTP. Try again.");
      return res.redirect("/book/verify-otp");
    }

    // 1️⃣  OTP matches
    req.session.isVerified = true;
    req.flash("success", "OTP verified. Payment successful!");

    // 2️⃣  Fetch the listing you’re booking
    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    // 3️⃣  Save booking record (only if user is logged in)
    if (req.user) {
      await Booking.create({
        user: req.user._id,
        listingTitle: listing.title,
        location: listing.location,
        country: listing.country,
        price: listing.price,
        bookedAt: new Date()
      });
    }

    // 4️⃣  Proceed to ticket download route
    return res.redirect("/book/tickets");
  } catch (err) {
    next(err);
  }
});


// ✅ Ticket download
router.get("/tickets", async (req, res) => {
  if (!req.session.isVerified || !req.session.listingId) {
    req.flash("error", "Unauthorized access.");
    return res.redirect("/listings");
  }

  try {
    console.log("📦 Session Listing ID:", req.session.listingId);

    const listing = await Listing.findById(req.session.listingId);
    const ticketPath = await generateTicket(listing, req.session.email);
    await sendTicketEmail(req.session.email, ticketPath);

    res.download(ticketPath);

    // Clear session
    req.session.otp = null;
    req.session.email = null;
    req.session.listingId = null;
    req.session.isVerified = null;
  } catch (err) {
    console.error("Error generating or sending ticket:", err);
    req.flash("error", "Something went wrong while generating your ticket.");
    res.redirect("/listings");
  }
});

// ✅ POST: Verify price and send OTP
router.post("/:id/verify-price", async (req, res) => {
  const { id } = req.params;
  const { expectedPrice, enteredPrice, email } = req.body;

  if (expectedPrice != enteredPrice) {
    req.flash("error", "Entered price does not match.");
    return res.redirect(`/book/${id}`);
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  req.session.otp = otp;
  req.session.email = email;
  req.session.listingId = id;

  try {
    await sendOTP(email, otp);
    req.flash("success", "OTP sent to your email.");
    res.redirect("/book/verify-otp");
  } catch (err) {
    console.log("❌ OTP sending failed:", err);
    req.flash("error", "Failed to send OTP.");
    res.redirect(`/book/${id}`);
  }
});

// ✅ General booking form (keep this LAST)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    res.render("bookings/book.ejs", { listing });
  } catch (err) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }
});

module.exports = router;
