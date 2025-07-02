
const Listing=require("../models/listing");
const Review = require("../models/review.js");
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const newReview = new Review({
    ...req.body.review,        // comment & rating
    author: req.user._id,      // reviewer
    listing: listing._id       // 🆕 reference the listing
  });

  listing.reviews.push(newReview); // keep ref in listing doc

  await newReview.save();
  await listing.save();

  req.flash("success", "New review created!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview=async (req, res) => {
    const { id, reviewID } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};