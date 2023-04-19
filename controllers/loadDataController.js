// Import required modules
const express = require('express');
const router = express.Router();
const Rental = require('../model/rentals-db'); // Assuming a Rental model exists

// Define the "load data" route
router.get('/rentals', async (req, res) => {
    // Check if there are already rentals in the database
    try {
        const rentals_list = await Rental.find({});
        if (rentals_list.length > 0) {
            return res.status(200).send('Rentals already loaded into database');
        } else {
            const provinces = [
                'Alberta',
                'British Columbia',
                'Manitoba',
                'New Brunswick',
                'Newfoundland and Labrador',
                'Northwest Territories',
                'Nova Scotia',
                'Nunavut',
                'Ontario',
                'Prince Edward Island',
                'Quebec',
                'Saskatchewan',
                'Yukon',
            ];

            const cities = [
                'Vancouver',
                'Toronto',
                'Calgary',
                'Montreal',
                'Ottawa',
                'Quebec City',
                'Halifax',
                'Victoria',
                'Winnipeg',
                'Regina',
                'Saskatoon',
                'St. John\'s',
                'Yellowknife',
            ];

            try {
                // Generate 10 random rentals
                const rentals = Array.from({ length: 10 }, () => {
                    const imageUrl = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
                    const headline = 'Modern and Spacious Downtown Loft';
                    const numSleeps = Math.floor(Math.random() * 6) + 1;
                    const numBedrooms = Math.floor(Math.random() * 4) + 1;
                    const numBathrooms = Math.floor(Math.random() * 3) + 1;
                    const pricePerNight = parseFloat((Math.random() * 200 + 50).toFixed(2));
                    const city = cities[Math.floor(Math.random() * cities.length)];
                    const province = provinces[Math.floor(Math.random() * provinces.length)];
                    const featuredRental = Math.random() < 0.5;

                    return {
                        imageUrl,
                        headline,
                        numSleeps,
                        numBedrooms,
                        numBathrooms,
                        pricePerNight,
                        city,
                        province,
                        featuredRental,
                    };
                });

                // Save the rentals to the database
                await Rental.create(rentals);
                console.log('Successfully saved rentals to the database');
            } catch (error) {
                console.error('Error saving rentals to the database:', error);
            } finally {
                // mongoose.connection.close();
                // console.log('Disconnected from MongoDB');
            }


        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error');
    }

});


// Export the router
module.exports = router;
