const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const { cloudinary } = require("../cloudConfig");
const streamifier = require("streamifier");

// Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {
    allListings,
    currUser: res.locals.currUser,
    success: res.locals.success,
    error: res.locals.error,
  });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", {
    currUser: res.locals.currUser,
    success: res.locals.success,
    error: res.locals.error,
  });
};

// Show single listing
module.exports.showListings = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", {
    listing,
    currUser: res.locals.currUser,
    success: res.locals.success,
    error: res.locals.error,
  });
};

// Create new listing
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    // Upload image to Cloudinary using streamifier
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "wanderlust_dev" },
      async (error, result) => {
        if (error) throw error;
        newListing.image = {
          url: result.secure_url,
          filename: result.public_id,
        };
        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } else {
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  }
};

// Render edit listing form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", {
    listing,
    currUser: res.locals.currUser,
    success: res.locals.success,
    error: res.locals.error,
  });
};

// Update listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    new: true,
  });

  if (req.file) {
    // Delete old image from Cloudinary if exists
    if (listing.image?.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    // Upload new image
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "wanderlust_dev" },
      async (error, result) => {
        if (error) throw error;
        listing.image = {
          url: result.secure_url,
          filename: result.public_id,
        };
        await listing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } else {
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  }
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing?.image?.filename) {
    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
