const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const sendOTP = require("../utils/sendOTP");
const generateCartTicket = require("../utils/generateCartTicket");
const sendTicketEmail    = require("../utils/sendTicketEmail");
const Booking = require("../models/booking");




// ────────────────────────── helpers
const cartTotal = cart =>
  cart.reduce((sum, item) => sum + Number(item.price), 0);

// ────────────────────────── VIEW CART  (already had)
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  res.render("cart/cart.ejs", { cart, total: cartTotal(cart) });
});

// ────────────────────────── CHECKOUT PAGE  (new)
router.get("/checkout", (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    req.flash("error", "Your cart is empty.");
    return res.redirect("/cart");
  }
  res.render("cart/checkout.ejs", {
    total: cartTotal(cart),
    cart
  });
});

// ────────────────────────── VERIFY-PRICE & SEND OTP  (new)
router.post("/verify-price", async (req, res, next) => {
  try {
    const { expectedPrice, enteredPrice, email } = req.body;
    const total = cartTotal(req.session.cart || []);

    // server-side check against tampering
    if (Number(expectedPrice) !== total || Number(enteredPrice) !== total) {
      req.flash("error", "Entered total does not match.");
      return res.redirect("/cart/checkout");
    }

    // generate & store OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    req.session.cartOTP = otp;
    req.session.cartEmail = email;

    await sendOTP(email, otp);
    req.flash("success", "OTP sent to your email.");
    res.redirect("/cart/verify-otp");
  } catch (err) {
    next(err);
  }
});

// ────────────────────────── VERIFY OTP  (new)
router.route("/verify-otp")
  .get((req, res) => {
    if (!req.session.cartOTP) {
      req.flash("error", "Session expired. Try again.");
      return res.redirect("/cart");
    }
    res.render("cart/verifyOtp.ejs");
  })

  .post(async (req, res) => {
    const { otp } = req.body;

    if (Number(otp) === req.session.cartOTP) {
      try {
        // ✅ 1. Save each item in cart as a booking (if the user is logged in)
if (req.user && req.session.cart.length) {
  const bookings = req.session.cart.map(item => ({
    user: req.user._id,
    listingTitle: item.title,
    location: item.location,
    country: item.country || "",   // cart may not store country; fallback
    price: item.price,
    bookedAt: new Date()
  }));
  await Booking.insertMany(bookings);
}

// ✅ 2. Generate PDF ticket covering all items
const ticketPath = await generateCartTicket(req.session.cart, req.session.cartEmail);

// ✅ 3. Email the ticket
await sendTicketEmail(req.session.cartEmail, ticketPath);

// ✅ 4. Clear session data
req.session.cart = [];
req.session.cartOTP = null;
req.session.cartEmail = null;

// ✅ 5. Success feedback
req.flash("success", "Payment successful! Ticket sent to your email 🎫");
return res.redirect("/cart/success");  // or res.download(ticketPath)

      } catch (err) {
        console.error("❌ Error sending cart ticket:", err);
        req.flash("error", "Something went wrong while sending your ticket.");
        return res.redirect("/cart");
      }
    }

    req.flash("error", "Incorrect OTP. Try again.");
    res.redirect("/cart/verify-otp");
  });

// ────────────────────────── SUCCESS PAGE  (new)
router.get("/success", (req, res) => {
  res.render("cart/success.ejs");
});


// ─────────────────── VIEW CART ───────────────────
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  res.render("cart/cart.ejs", { cart });
});

// ─────────────────── ADD TO CART ─────────────────
router.post("/add/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) throw new Error("Listing not found");

    if (!req.session.cart) req.session.cart = [];

    const isInCart = req.session.cart.some(item => item._id === id);
    if (!isInCart) {
      req.session.cart.push({
        _id: listing._id.toString(),
        title: listing.title,
        price: listing.price,
        location: listing.location
      });
    }

    // If AJAX request, return JSON
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.json({ cartCount: req.session.cart.length });
    }

    // Else fallback
    req.flash("success", "Added to cart!");
    res.redirect("/cart");
  } catch (e) {
    next(e);
  }
});


// ────────────────── REMOVE ITEM ──────────────────
router.post("/remove/:id", (req, res) => {
    const { id } = req.params;
    req.session.cart = (req.session.cart || []).filter(
    item => item._id !== id        // both are plain strings
    );
  req.flash("success", "Item removed.");
  res.redirect("/cart");
});

module.exports = router;
