const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const { upload } = require("../cloudConfig.js");

// ⚠️ IMPORTANT: Specific routes MUST come before parameterized routes
// Search route - must be before /:id
// Live search API
router.get(
  "/api/search",
  wrapAsync(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const results = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ],
    }).limit(10); // optional limit for performance

    res.json(results); // send JSON back
  })
);

// New listing form - must be before /:id
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Base route for all listings and creating new listing
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );

// Individual listing routes (with :id parameter)
router
  .route("/:id")
  .get(wrapAsync(listingController.showListings))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Edit form route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
