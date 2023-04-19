const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rentals: [{
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental'
    },
    nights: Number,
  }]
});

module.exports = mongoose.model('Cart', cartSchema);
