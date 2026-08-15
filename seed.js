const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const User = require('./models/User');

const seedProducts = [
  // Electronics
  {
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    price: 199.99,
    shortDescription: 'Immersive sound quality with active noise cancellation and 30-hour battery life.',
    fullDescription: 'Experience studio-grade audio quality with our top-of-the-line wireless noise-canceling headphones. Built with plush memory foam ear cushions, dual microphone noise isolation, intuitive touch controls, and fast USB-C charging.',
    stock: 25,
    rating: 4.8,
    reviewsCount: 42,
    image: '/images/products/headphones.jpg',
    isFeatured: true
  },
  {
    name: 'Smartwatch Series Pro',
    category: 'Electronics',
    price: 249.99,
    shortDescription: 'Advanced health metrics, AMOLED display, and GPS tracking.',
    fullDescription: 'Track your heart rate, sleep cycles, workouts, and oxygen saturation in real-time with Smartwatch Series Pro. Water-resistant up to 50 meters with customizable watch faces and seamless phone sync.',
    stock: 18,
    rating: 4.7,
    reviewsCount: 38,
    image: '/images/products/smartwatch.jpg',
    isFeatured: true
  },
  {
    name: 'Ultra-Slim Mechanical Keyboard',
    category: 'Electronics',
    price: 129.99,
    shortDescription: 'RGB backlit mechanical keyboard with tactile switches and Bluetooth multi-device sync.',
    fullDescription: 'Elevate your typing experience with low-profile mechanical switches, anodized aluminum top frame, customizable RGB backlighting per key, and multi-device Bluetooth switching.',
    stock: 15,
    rating: 4.9,
    reviewsCount: 56,
    image: '/images/products/keyboard.jpg',
    isFeatured: true
  },
  {
    name: '4K Ultra HD Action Camera',
    category: 'Electronics',
    price: 179.99,
    shortDescription: 'Compact waterproof camera with electronic image stabilization and 60fps video.',
    fullDescription: 'Capture your adventure moments in vivid 4K resolution. Features dual LCD screens, 170-degree ultra-wide lens, waterproof body down to 30m with case, and WiFi remote app control.',
    stock: 12,
    rating: 4.6,
    reviewsCount: 29,
    image: '/images/products/actioncam.jpg',
    isFeatured: false
  },
  {
    name: 'Ergonomic Wireless Mouse',
    category: 'Electronics',
    price: 49.99,
    shortDescription: 'Precision optical mouse with comfortable vertical grip and silent clicks.',
    fullDescription: 'Reduce wrist strain with our scientifically engineered ergonomic vertical mouse. Includes adjustable DPI settings (800-3200), rechargeable lithium battery, and whisper-quiet switches.',
    stock: 30,
    rating: 4.5,
    reviewsCount: 19,
    image: '/images/products/mouse.jpg',
    isFeatured: false
  },

  // Fashion
  {
    name: 'Classic Vintage Denim Jacket',
    category: 'Fashion',
    price: 79.99,
    shortDescription: '100% premium cotton denim jacket with tailored fit and classic button closure.',
    fullDescription: 'A timeless wardrobe essential crafted from durable ring-spun cotton denim. Features dual chest flap pockets, button side tabs for custom waist adjustment, and reinforced stitching.',
    stock: 20,
    rating: 4.7,
    reviewsCount: 31,
    image: '/images/products/denim-jacket.jpg',
    isFeatured: true
  },
  {
    name: 'Genuine Leather Biker Jacket',
    category: 'Fashion',
    price: 189.99,
    shortDescription: 'Handcrafted lambskin leather jacket with asymmetrical zip front.',
    fullDescription: 'Embrace effortless style with this full-grain lambskin leather jacket. Satin inner lining, heavy-duty YKK zippers, zipper cuffs, and multiple functional pockets.',
    stock: 10,
    rating: 4.9,
    reviewsCount: 64,
    image: '/images/products/leather-jacket.jpg',
    isFeatured: true
  },
  {
    name: 'Urban Fleece Pullover Hoodie',
    category: 'Fashion',
    price: 49.99,
    shortDescription: 'Cozy heavyweight fleece hoodie with front kangaroo pocket.',
    fullDescription: 'Designed for ultimate comfort, this plush fleece hoodie offers a relaxed fit, double-lined hood with adjustable drawstrings, and ribbed cuffs and hem.',
    stock: 40,
    rating: 4.6,
    reviewsCount: 52,
    image: '/images/products/hoodie.jpg',
    isFeatured: false
  },
  {
    name: 'Slim-Fit Casual Linen Blazer',
    category: 'Fashion',
    price: 119.99,
    shortDescription: 'Breathable linen blend blazer suitable for casual and semi-formal occasions.',
    fullDescription: 'Stay sharp and cool in warm weather. Tailored slim fit with notched lapels, two-button front, single rear vent, and internal chest pockets.',
    stock: 14,
    rating: 4.8,
    reviewsCount: 23,
    image: '/images/products/blazer.jpg',
    isFeatured: false
  },
  {
    name: 'Pro-Athlete Running Sneakers',
    category: 'Fashion',
    price: 89.99,
    shortDescription: 'Lightweight mesh running shoes with responsive foam cushioning.',
    fullDescription: 'Engineered for distance running and active daily workouts. Features breathable engineered mesh upper, energy-returning EVA midsole, and high-traction rubber outsole.',
    stock: 22,
    rating: 4.7,
    reviewsCount: 45,
    image: '/images/products/sneakers.jpg',
    isFeatured: true
  },

  // Books
  {
    name: 'Modern Web Development Architecture',
    category: 'Books',
    price: 39.99,
    shortDescription: 'Comprehensive guide to modern full-stack web applications and microservices.',
    fullDescription: 'Master modern full-stack development patterns, API design, security practices, performance optimization, and scalable database schemas for enterprise applications.',
    stock: 50,
    rating: 4.9,
    reviewsCount: 88,
    image: '/images/products/book-webdev.jpg',
    isFeatured: true
  },
  {
    name: 'Mastering JavaScript & Node.js',
    category: 'Books',
    price: 44.99,
    shortDescription: 'Deep dive into asynchronous JavaScript, Event Loop, and Express APIs.',
    fullDescription: 'Unlock the power of JavaScript from foundational asynchronous concepts to advanced Node.js backend streaming, cluster modules, and MongoDB integrations.',
    stock: 35,
    rating: 4.8,
    reviewsCount: 71,
    image: '/images/products/book-javascript.jpg',
    isFeatured: false
  },
  {
    name: 'The UI/UX Design Handbook',
    category: 'Books',
    price: 34.99,
    shortDescription: 'Practical principles for designing modern, accessible, visual web interfaces.',
    fullDescription: 'Learn visual hierarchy, color theory, wireframing, component design systems, usability testing, and accessibility guidelines from industry experts.',
    stock: 28,
    rating: 4.7,
    reviewsCount: 34,
    image: '/images/products/book-uiux.jpg',
    isFeatured: false
  },
  {
    name: 'Clean Code & Software Principles',
    category: 'Books',
    price: 49.99,
    shortDescription: 'Handbook of agile software craftsmanship and refactoring techniques.',
    fullDescription: 'Learn how to write code that is clean, readable, maintainable, and testable. Covers refactoring patterns, unit testing strategies, and SOLID principles.',
    stock: 45,
    rating: 5.0,
    reviewsCount: 112,
    image: '/images/products/book-cleancode.jpg',
    isFeatured: true
  },
  {
    name: 'Data Structures & Algorithms Guide',
    category: 'Books',
    price: 29.99,
    shortDescription: 'Essential interview preparation guide with visual algorithm breakdowns.',
    fullDescription: 'Master arrays, trees, graphs, dynamic programming, and sorting algorithms with step-by-step illustrations and JavaScript code solutions.',
    stock: 60,
    rating: 4.6,
    reviewsCount: 40,
    image: '/images/products/book-algo.jpg',
    isFeatured: false
  },

  // Accessories
  {
    name: 'Executive Italian Leather Backpack',
    category: 'Accessories',
    price: 129.99,
    shortDescription: 'Premium water-resistant leather backpack with padded 15.6" laptop sleeve.',
    fullDescription: 'Crafted from top-grain Italian leather with magnetic buckle closures, hidden anti-theft back pocket, padded mesh shoulder straps, and dedicated tablet compartment.',
    stock: 16,
    rating: 4.9,
    reviewsCount: 48,
    image: '/images/products/backpack.jpg',
    isFeatured: true
  },
  {
    name: 'UV400 Polarized Aviator Sunglasses',
    category: 'Accessories',
    price: 59.99,
    shortDescription: 'Classic stainless steel frame sunglasses with anti-glare polarized lenses.',
    fullDescription: 'Protect your eyes with 100% UV400 blocking polarized lenses. Ultra-lightweight alloy metal frame, silicon nose pads, and protective hard leather case included.',
    stock: 35,
    rating: 4.7,
    reviewsCount: 26,
    image: '/images/products/sunglasses.jpg',
    isFeatured: false
  },
  {
    name: 'Insulated Stainless Steel Water Bottle',
    category: 'Accessories',
    price: 24.99,
    shortDescription: 'Double-wall vacuum insulated flask keeps drinks cold for 24h or hot for 12h.',
    fullDescription: 'BPA-free food-grade 18/8 stainless steel bottle with leak-proof straw lid, powder-coated sweat-free exterior, and 32 oz capacity.',
    stock: 50,
    rating: 4.8,
    reviewsCount: 39,
    image: '/images/products/water-bottle.jpg',
    isFeatured: false
  },
  {
    name: 'Minimalist Quartz Chronograph Watch',
    category: 'Accessories',
    price: 159.99,
    shortDescription: 'Sleek stainless steel watch with Japanese quartz movement and date display.',
    fullDescription: 'Sophisticated minimalist timepiece featuring sapphire crystal lens, 3ATM water resistance, mesh stainless steel band, and luminous hands.',
    stock: 12,
    rating: 4.8,
    reviewsCount: 29,
    image: '/images/products/watch.jpg',
    isFeatured: true
  },
  {
    name: '3-in-1 Fast Wireless Charging Station',
    category: 'Accessories',
    price: 39.99,
    shortDescription: 'Foldable magnetic charging dock for Smartphone, Smartwatch, and Earbuds.',
    fullDescription: 'Declutter your nightstand or desk. Fast 15W Qi-wireless charging pad with intelligent safety protection against overcurrent, overvoltage, and temperature spikes.',
    stock: 25,
    rating: 4.6,
    reviewsCount: 33,
    image: '/images/products/charger.jpg',
    isFeatured: false
  }
];

const seedDB = async (standalone = true) => {
  try {
    if (standalone) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopnest';
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB for seeding...');
    }

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Seed Admin and Demo User (College Demonstration Credentials Only)
    const adminUser = await User.create({
      name: 'ShopNest Admin (Demo)',
      email: 'admin@shopnest.com',
      password: 'admin123',
      role: 'admin'
    });

    const demoUser = await User.create({
      name: 'John Doe (Demo User)',
      email: 'user@shopnest.com',
      password: 'user123',
      role: 'user'
    });

    console.log(`✅ DEMO Admin Account Created: admin@shopnest.com / admin123 (Development Demonstration Only)`);
    console.log(`✅ DEMO Customer Account Created: user@shopnest.com / user123 (Development Demonstration Only)`);

    // Seed Products
    const createdProducts = await Product.insertMany(seedProducts);
    console.log(`✅ Successfully Seeded ${createdProducts.length} Products into MongoDB!`);

    if (standalone) {
      mongoose.connection.close();
      console.log('Seeding completed. Database connection closed.');
    }
  } catch (error) {
    console.error('❌ Error Seeding Database:', error.message);
  }
};

if (require.main === module) {
  seedDB(true);
}

module.exports = seedDB;
