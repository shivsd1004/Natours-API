const mongoose = require('mongoose');
const Tour=require('./tourModel');

// Define the schema for the review model
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'A review must have some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'A review must have a rating'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A review must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A review must belong to a user'],
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Define a compound index to enforce uniqueness of reviews by user for a tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Define a pre hook to populate the 'tour' and 'user' fields with actual documents before saving
reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'tour',
//     select: 'name', // Populate only the 'name' field of the referenced tour
//   })
this.populate({
    path: 'user',
    select: 'name photo', // Populate only the 'name' and 'photo' fields of the referenced user
  });
  next();
});

reviewSchema.statics.calcAverageRatings=async function(tourId){
  const stats=await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group:{
        _id:'$tour',
        nRating:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    }

  ]);
  // console.log(stats);
if(stats.length>0){

  await Tour.findByIdAndUpdate(tourId,{
    ratingAverage:stats[0].avgRating,
    ratingQuantity:stats[0].nRating
  });
}else{
  await Tour.findByIdAndUpdate(tourId,{
    ratingAverage:0,
    ratingQuantity:4.5
  });
}
}
reviewSchema.post('save',function(){
  // this points to cuurent review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});
// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.post(/^findOneAnd/, async function() {
await this.r.constructor.calcAverageRatings(this.r.tour)  
});

// Create the Review model using the schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
