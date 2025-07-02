const express=require("express");
const router=express.Router({mergeParams:true});

const wrapAsync=require("../utils/wrapAsync");
const ExpressError=require("../utils/ExpressError.js");
const {validateReview,isLoggedIn,isReviewAuthor }=require("../middleware.js")

const ReviewController=require("../controllers/reviews.js");




router.post("/",isLoggedIn,validateReview,wrapAsync(ReviewController.createReview));


  router.delete('/:reviewID',isLoggedIn,isReviewAuthor ,wrapAsync(ReviewController.deleteReview));
module.exports=router;
