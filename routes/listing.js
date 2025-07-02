const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");

const { isLoggedIn, isOwnner, validateListing, isReviewAuthor } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })
router.route("/")
    .get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync (listingController.createListing))


router.get("/new", isLoggedIn, listingController.renderNewForm);
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwnner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwnner, wrapAsync(listingController.deleteListing));


router.get("/:id/edit", isLoggedIn, isOwnner, wrapAsync(listingController.renderEditForm));



module.exports = router;
