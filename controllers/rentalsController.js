// Import required modules
const express = require('express');
const router = express.Router();
const Rental = require('../model/rentals-db'); // Assuming a Rental model exists

// Retrieve list of rentals
router.get('/', async (req, res) => {
  

    try {
      // const rentalz = await Rental.find({});
      let rentals = await getRentalsWithCity(req);

      res.render('rentals', { rentals: rentals });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    
});
// Retrieve list of rentals
router.get('/list', async (req, res) => {
  if (req?.session?.userData && req.session.userData.userType === 'DataEntryClerk') {
    try {
      const rentalz = await Rental.find().sort('headline');
      let rentals = JSON.parse(JSON.stringify(rentalz));
      

      res.render('list', { rentals });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.render('error-page', { ErrorMessage: 'You are not allowed to access this page' });
  }
});

// Create new rental
router.post('/', async (req, res) => {
  const rental = new Rental({
    headline: req.body.headline,
    description: req.body.description,
    location: req.body.location,
    price: req.body.price
  });

  try {
    const newRental = await rental.save();
    res.status(201).json(newRental);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Retrieve rental by ID
router.get('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update rental by ID
router.patch('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (rental) {
      rental.headline = req.body.headline || rental.headline;
      rental.description = req.body.description || rental.description;
      rental.location = req.body.location || rental.location;
      rental.price = req.body.price || rental.price;

      const updatedRental = await rental.save();
      res.json(updatedRental);
    } else {
      res.status(404).json({ message: 'Rental not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete rental by ID
router.delete('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (rental) {
      await rental.remove();
      res.json({ message: 'Rental deleted successfully' });
    } else {
      res.status(404).json({ message: 'Rental not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getRentalsWithCity(req) {
  const rentalsByCity = {};
  const rs = await Rental.find();
  let rentals = JSON.parse(JSON.stringify(rs))



  rentals.forEach(rental => {
    const cityProvince = `${rental.city}, ${rental.province}`;
    if (!rentalsByCity[cityProvince]) {
      rentalsByCity[cityProvince] = [];
    }
    rentalsByCity[cityProvince].push(rental);
  });

  const result = [];

  for (const cityProvince in rentalsByCity) {
    const rentalsForCity = rentalsByCity[cityProvince];
    result.push({
      cityProvince,
      rentals: rentalsForCity
    });
  }

  return result;
}

module.exports = router;
