const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware.js");
const passport = require("passport");
const userContoller = require("../controllers/users.js");
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");
const Review = require("../models/review");
const Listing = require("../models/listing");
const User = require("../models/user");
router.get("/signup", userContoller.renderSignup);
router.post("/signup", wrapAsync(userContoller.signup));

router.get("/login", userContoller.renderlogin);
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userContoller.login
);

router.get("/logout", userContoller.logout);

// ✅ Google Auth Routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

// dashboard routes of user
router.get("/profile", isLoggedIn, (req, res) => {
  res.render("users/dashboard");
});

router.get("/bookings", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id });
  res.render("users/bookings.ejs", { bookings });
});


// review of dashboard 
router.get("/profile/reviews",isLoggedIn, async (req, res) => {
  try {
    const reviews = await Review.find({ author: req.user._id }).populate("listing");
    res.render("users/myReviews.ejs", { reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    req.flash("error", "Unable to fetch your reviews.");
    res.redirect("/profile");
  }
});


// 🚀 Settings Form
router.get("/profile/settings", isLoggedIn, (req, res) => {
  res.render("users/settings.ejs", { user: req.user });
});

// 🚀 Handle Profile Update
router.post("/profile/settings", isLoggedIn, async (req, res) => {
  const { username, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { username, email }, { new: true });
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
  } catch (err) {
    console.error("❌ Update failed:", err);
    req.flash("error", "Unable to update profile.");
    res.redirect("/profile/settings");
  }
});
module.exports = router;
