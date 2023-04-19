const Rental = require('../model/rentals-db');
const express = require('express');
const Cart = require('../model/cart');
const router = express.Router();

function requireCustomer(req, res, next) {
  if (req.session?.userData?.userType === 'Customer') {
    next();
  } else {
    // res.status(401).send('Unauthorized');
    res.render("error-page", { ErrorMessage: "You are not allowed to access this page" });
  }
}


router.post('/add', requireCustomer, async (req, res) => {
  nights = 1;

  try {
    const { rentalId } = req.body;
    const cart = await Cart.findOne({ user: req.session.userData.id });


    if (!cart) {
      const newCart = new Cart({
        user: req.session.userData.id,
        rentals: [{ rental: rentalId, nights }]
      });
      await newCart.save();
      // return res.status(201).json({ message: 'Rental added to cart' });
      return res.redirect("/rentals")

    }

    const rentalIndex = cart.rentals.findIndex(item => item.rental == rentalId);

    if (rentalIndex !== -1) {
      cart.rentals[rentalIndex].nights += nights;
    } else {
      cart.rentals.push({ rental: rentalId, nights });
    }

    await cart.save();
    // return res.status(200).json({ message: 'Rental added to cart' });
    return res.redirect("/rentals")
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/update/:id', requireCustomer, async (req, res) => {
  const { id } = req.params;
  const { nights } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.session.userData.id });
    if (!cart) {
      // return res.status(404).json({ message: 'Cart not found' });
      res.redirect("/cart");
    }

    const rentalIndex = cart.rentals.findIndex(item => item._id == id);
    if (rentalIndex === -1) {
      // return res.status(404).json({ message: 'Rental not found in cart' });
      res.redirect("/cart");

    }

    cart.rentals[rentalIndex].nights = nights;
    await cart.save();

    // return res.status(200).json({ message: 'Rental updated successfully' });
    res.redirect("/cart");

  } catch (error) {
    console.error(error);
    // return res.status(500).json({ message: 'Internal server error' });
    res.redirect("/cart");

  }
});


// Remove a rental from the cart
router.post('/remove/:id', requireCustomer, async (req, res) => {
  const { id } = req.params;
try {
  const cart = await Cart.findOne({ user: req.session.userData.id });
  if (!cart) {
    // return res.status(404).json({ message: 'Cart not found' });
    res.redirect("/cart");
  }

  const rentalIndex = cart.rentals.findIndex(item => item._id == id);
  if (rentalIndex === -1) {
    // return res.status(404).json({ message: 'Rental not found in cart' });
    res.redirect("/cart");
  }

  cart.rentals.splice(rentalIndex, 1); // remove the rental at the rentalIndex
  await cart.save();

  // return res.status(200).json({ message: 'Rental deleted successfully' });
  res.redirect("/cart");

} catch (error) {
  console.error(error);
  // return res.status(500).json({ message: 'Internal server error' });
  res.redirect("/cart");
}

});

// Get the user's cart
router.get('/', requireCustomer, async (req, res) => {
  try {
    // const cart = await Cart.find({});
    let rentals = await getCart(req);
    let subtotal = rentals.subtotal;

    console.log(rentals);

    // return res.status(200).json(cart);
    res.render("cart", { rentalsInCart: rentals,subtotal:subtotal.toFixed(2) });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
async function getCart(req) {
  const cart = await Cart.find({ user: req.session.userData.id }).populate('rentals.rental');

  const allRentals = [];
  let subtotal =0.0;

  cart.forEach((item) => {
    item.rentals.forEach((rental) => {
      allRentals.push(rental);
        subtotal = (rental.rental.pricePerNight*rental.nights)*1.10;

    });
  });

  let rentals = JSON.parse(JSON.stringify(allRentals));
  rentals.subtotal = subtotal;
  return rentals;
}
// Make order from the user's cart
router.post('/make-order', requireCustomer, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.userData.id });
    if (!cart) {
      res.redirect("/cart");
    }
    let rentals = await getCart(req);
    let subtotal = rentals.subtotal;

    // Send an email to the user with the order details
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
      to: req.session.userData.email,
      from: 'fardeenwebassignment@gmail.com',
      subject: 'Your order has been placed',
      html: `
        <p>Dear ${req.session.userData.email},</p>
        <p>Thank you for your order. Here are the details:</p>
        <ul>
          ${rentals.map(rental => `
            <li>
              <strong>${rental.rental.headline}</strong>
              (${rental.nights} nights at ${rental.rental.pricePerNight} per night)
              - Total: ${rental.rental.pricePerNight * rental.nights}
            </li>
          `).join('')}
        </ul>
        <p>Total: ${subtotal}</p>
        <p>Thank you for your business!</p>
      `
    };

    await sgMail.send(message);

    // Remove the rentals from the cart and save the changes
    cart.rentals = [];
    await cart.save();

    // Redirect to the rentals page
    res.redirect("/rentals");

  } catch (error) {
    console.error(error);
    // return res.status(500).json({ message: 'Internal server error' });
    res.redirect("/cart");
  }
});



module.exports = router;
