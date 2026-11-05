/* Extra demo data: verified (approved) sellers in every city/area, each selling across different categories.
 * Photos live in public/demo/*.jpg (free-to-use Unsplash photos, resized). Used by prisma/seed.ts.
 */

// [title, category, condition, price, photos (public/demo/<name>.jpg), description, delivery available]
export type DemoItem = [string, string, string, number, string[], string, boolean];
// [title, category, price, photo, rating 1–5, review text] — already sold, gives the seller a completed deal + review
export type DemoSold = [string, string, number, string, number, string];

export type DemoSeller = {
  name: string;
  email: string;
  city: string;
  area: string;
  phone: string;
  bio: string;
  items: DemoItem[];
  sold: DemoSold[];
};

/** Old sprite art → real photos (used for the original demo listings). */
export const SPRITE_PHOTOS: Record<string, string[]> = {
  dslr: ['dslr', 'dslr-2', 'camera-kit'],
  phone: ['iphone', 'iphone-2', 'phone'],
  laptop: ['macbook-2', 'laptop', 'macbook'],
  mirrorless: ['mirrorless', 'camera-retro'],
  gamingpc: ['gamingpc', 'gaming-setup'],
  desk: ['desk', 'office-setup'],
  chair: ['office-setup', 'chair'],
  bicycle: ['bicycle', 'roadbike'],
  dumbbell: ['dumbbell'],
  drill: ['drill', 'drill-2'],
  tv: ['tv', 'tv-2'],
  washer: ['washer'],
  sofa: ['sofa', 'sofa-2'],
  motorcycle: ['motorcycle', 'ktm'],
  console: ['console', 'controller'],
  books: ['books', 'bookshelf'],
  jacket: ['jacket'],
  lens: ['lens', 'camera-kit'],
  microwave: ['microwave', 'oven'],
  earbuds: ['earbuds', 'earbuds-2'],
};

export const demoPhoto = (name: string) => `/demo/${name}.jpg`;

/** Photos for a sprite name, rotated by `n` so repeated items don't all share the same cover photo. */
export function photosForSprite(sprite: string, n = 0) {
  const list = SPRITE_PHOTOS[sprite];
  if (!list) return ['sprite:' + sprite];
  const i = n % list.length;
  return [...list.slice(i), ...list.slice(0, i)].map(demoPhoto);
}

export const DEMO_BUYERS = [
  { name: 'Pooja Singh', email: 'pooja@dobara.test', city: 'Delhi', area: 'Dwarka' },
  { name: 'Siddharth Rao', email: 'siddharth@dobara.test', city: 'Bangalore', area: 'Koramangala' },
  { name: 'Tanvi Kulkarni', email: 'tanvi@dobara.test', city: 'Pune', area: 'Baner' },
  { name: 'Imran Qureshi', email: 'imran@dobara.test', city: 'Hyderabad', area: 'Madhapur' },
];

export const DEMO_SELLERS: DemoSeller[] = [
  // ---------------- Noida ----------------
  {
    name: 'Ananya Saxena', email: 'ananya@dobara.test', city: 'Noida', area: 'Sector 62', phone: '9810452201',
    bio: 'Software engineer in Sector 62. I upgrade gadgets often and keep every bill and box.',
    items: [
      ['iPad Air (5th gen) 64 GB Wi-Fi, Space Grey', 'electronics', 'Excellent', 38500, ['tablet', 'tablet-2'], 'Used mostly for reading and notes. Always kept in a cover with a screen guard. Battery health 92%. Box, cable and bill included.', true],
      ['Sony WH-1000XM4 noise-cancelling headphones', 'electronics', 'Like New', 14500, ['headphones', 'headphones-2'], 'Bought last year, used maybe 20 times. Comes with the hard case, cable and flight adapter.', true],
      ['Apple Watch Series 7, 45 mm GPS', 'electronics', 'Good', 16000, ['smartwatch'], 'Minor hairline scratch on the screen, not visible when on. Original strap plus one extra sport band.', true],
      ['Coffee machine with grinder — barely used', 'appliances', 'Like New', 9500, ['coffee'], 'Moved to a place with an office café, so this sat unused. Descaled and cleaned before listing.', false],
    ],
    sold: [['OnePlus Buds Pro', 'electronics', 4200, 'earbuds-2', 5, 'Exactly as described and she replied within minutes. Smooth pickup at Sector 62 metro.']],
  },
  {
    name: 'Gaurav Chauhan', email: 'gaurav@dobara.test', city: 'Noida', area: 'Sector 137', phone: '9810452202',
    bio: 'Fitness and outdoors. Weekend pickups from Paras Tierea, Sector 137.',
    items: [
      ['Decathlon road bike, 21-speed, size M', 'sports', 'Good', 14500, ['roadbike', 'bicycle'], 'Serviced last month — new brake pads and chain lube. A few cosmetic scratches on the frame.', false],
      ['SG cricket kit with English willow bat', 'sports', 'Excellent', 6500, ['cricket'], 'Full kit: bat, pads, gloves, helmet and kit bag. Bat knocked in and oiled.', true],
      ['Adjustable dumbbells 2 × 20 kg', 'sports', 'Good', 6800, ['dumbbell'], 'Home gym clear-out. Plates have some rust spots on the edges, everything locks properly.', false],
      ['Black sports sunglasses, polarised', 'fashion', 'Like New', 1800, ['sunglasses-2'], 'Worn twice. Comes with the case and cleaning cloth.', true],
    ],
    sold: [['Yoga mat and resistance band set', 'sports', 1200, 'dumbbell', 4, 'Good condition, fair price. Pickup took a bit of coordination but all fine.']],
  },
  {
    name: 'Shalini Mishra', email: 'shalini@dobara.test', city: 'Noida', area: 'Sector 74', phone: '9810452203',
    bio: 'Home decor lover. Furniture is solid wood and kept in a smoke-free, pet-free home.',
    items: [
      ['6-seater dining table set, solid wood', 'furniture', 'Excellent', 24000, ['dining', 'dining-2'], 'Sheesham wood table with six cushioned chairs. No wobble, no cracks. Buyer arranges transport.', false],
      ['Tall wooden bookshelf, 5 shelves', 'furniture', 'Good', 5500, ['bookshelf'], 'Sturdy and can be disassembled for transport. A couple of small marks on one side panel.', false],
      ['Designer leather handbag, red', 'fashion', 'Like New', 4500, ['handbag'], 'Gifted, used for one wedding. Dust bag included.', true],
      ['Samsung 253 L double-door fridge, mint', 'appliances', 'Good', 13500, ['fridge'], 'Cools perfectly. Selling because we got a larger one. 4 years old.', false],
    ],
    sold: [['Accent lounge chair', 'furniture', 6000, 'lounge-chair', 5, 'Beautiful chair, spotless condition. Shalini even helped load it in the cab.']],
  },

  // ---------------- Delhi ----------------
  {
    name: 'Harpreet Kaur', email: 'harpreet@dobara.test', city: 'Delhi', area: 'Dwarka', phone: '9810452204',
    bio: 'Teacher in Dwarka. Selling things from my kids’ rooms and our old study.',
    items: [
      ['NCERT + reference books, Class 9–12 (40 books)', 'books', 'Good', 2200, ['books', 'bookshelf'], 'Physics, Chemistry, Maths and Biology with RD Sharma and HC Verma. Some pencil notes inside.', true],
      ['Study desk with drawer', 'furniture', 'Good', 4200, ['desk'], 'Engineered wood, fits in a small room. A few marks on the top.', false],
      ['Acoustic guitar with bag and capo', 'other', 'Excellent', 5200, ['guitar'], 'Yamaha F310. New strings fitted last month. Great for beginners.', true],
      ['Philips mixer / blender jar set', 'appliances', 'Good', 1800, ['blender'], 'All three jars included. Motor runs smoothly.', true],
    ],
    sold: [['Kids bicycle, 20 inch', 'sports', 2500, 'bicycle', 5, 'Very honest seller, the cycle was even better than the photos.']],
  },
  {
    name: 'Sameer Khan', email: 'sameer@dobara.test', city: 'Delhi', area: 'Rohini', phone: '9810452205',
    bio: 'Bike and car enthusiast. All vehicles with papers, service history and NOC.',
    items: [
      ['Honda City 2017 VX, petrol, 52,000 km', 'vehicles', 'Excellent', 685000, ['car', 'car-2'], 'Single owner, all services at the authorised centre. Insurance valid till March. No accidents.', false],
      ['KTM RC 200 (2020), 21,000 km', 'vehicles', 'Good', 128000, ['ktm', 'sportbike'], 'New tyres at 18,000 km. Minor scratch on the left fairing. All papers clear.', false],
      ['Bosch toolkit — 46 pieces', 'tools', 'Like New', 2800, ['toolkit'], 'Used for two bike jobs. Every piece present.', true],
    ],
    sold: [['Royal Enfield riding jacket', 'fashion', 3500, 'jacket', 4, 'Jacket was in good shape. One velcro strap is weak but it was mentioned up front.']],
  },
  {
    name: 'Nitin Aggarwal', email: 'nitin@dobara.test', city: 'Delhi', area: 'Karol Bagh', phone: '9810452206',
    bio: 'I run a small electronics repair shop in Karol Bagh. Every device is tested before sale.',
    items: [
      ['Samsung Galaxy S21 FE 128 GB', 'mobiles', 'Excellent', 21500, ['android', 'phone'], 'Battery replaced at a Samsung service centre. Comes with a new case and charger.', true],
      ['Dell 24" IPS monitor, Full HD', 'electronics', 'Good', 7500, ['monitor'], 'No dead pixels. HDMI cable included.', true],
      ['iPhone 12 64 GB, Black', 'mobiles', 'Good', 26000, ['iphone-2', 'iphone'], 'Battery health 84%. Face ID works. Small dent on the frame corner.', true],
      ['Lenovo IdeaPad Slim 3, Ryzen 5, 8 GB / 512 GB', 'laptops', 'Excellent', 31000, ['laptop', 'laptop-2'], 'Fresh Windows 11 install. Charger included, 1 year old.', true],
    ],
    sold: [['Redmi Note 11 64 GB', 'mobiles', 7500, 'phone', 5, 'Phone was fully tested in front of me. Very professional.']],
  },

  // ---------------- Ghaziabad ----------------
  {
    name: 'Ritika Goel', email: 'ritika@dobara.test', city: 'Ghaziabad', area: 'Indirapuram', phone: '9810452207',
    bio: 'Moving to Dubai in December — everything must go, at fair prices.',
    items: [
      ['3-seater velvet sofa, emerald green', 'furniture', 'Like New', 18500, ['sofa', 'sofa-2'], 'Bought 8 months ago from Urban Ladder. No stains, no pets.', false],
      ['LG 32" smart TV', 'electronics', 'Good', 9000, ['tv-2', 'tv'], 'Netflix, YouTube and Prime work fine. Remote and wall mount included.', false],
      ['Morphy Richards OTG oven, 28 L', 'appliances', 'Excellent', 4200, ['oven'], 'Used for baking a few times a month. Trays and rack included.', true],
      ['White running shoes, size 7', 'fashion', 'Like New', 2200, ['sneakers-2'], 'Wrong size, worn indoors twice.', true],
    ],
    sold: [['Samsung microwave 20 L', 'appliances', 3200, 'microwave', 5, 'Worked perfectly, well packed for delivery.']],
  },
  {
    name: 'Deepak Tyagi', email: 'deepak@dobara.test', city: 'Ghaziabad', area: 'Raj Nagar Extension', phone: '9810452208',
    bio: 'Contractor — selling spare power tools and some home items.',
    items: [
      ['DeWalt 18V cordless drill with 2 batteries', 'tools', 'Excellent', 7800, ['drill', 'drill-2'], 'Very light use. Both batteries hold full charge. Case included.', true],
      ['Hand tool set — pliers, screwdrivers, wrenches', 'tools', 'Good', 1500, ['toolkit'], 'Assorted 30+ tools, all in working condition.', true],
      ['Revolt RV400 electric motorcycle (2022)', 'vehicles', 'Good', 78000, ['ebike'], 'Range about 120 km per charge. Charger and papers included.', false],
    ],
    sold: [['Bosch angle grinder', 'tools', 2400, 'drill-2', 4, 'Tool was fine. Deepak was a little late for pickup but polite.']],
  },

  // ---------------- Gurgaon ----------------
  {
    name: 'Varun Khanna', email: 'varun@dobara.test', city: 'Gurgaon', area: 'Golf Course Road', phone: '9810452209',
    bio: 'Product manager and gamer. Consoles and PCs are kept dust-free in an AC room.',
    items: [
      ['PS5 Disc Edition + 2 DualSense controllers', 'gaming', 'Excellent', 38000, ['console', 'controller'], 'Includes Spider-Man 2 and GT7 discs. Always used on a stand with good airflow.', true],
      ['Custom gaming PC — Ryzen 7, RTX 3070', 'gaming', 'Excellent', 82000, ['gamingpc', 'gaming-setup'], '32 GB RAM, 1 TB NVMe, 750 W Gold PSU. Stress-tested before handover.', false],
      ['MacBook Pro 13" M2, 8 GB / 256 GB', 'laptops', 'Like New', 92000, ['macbook', 'macbook-2'], '42 battery cycles. AppleCare until next year. Box and charger included.', true],
      ['iMac 24" M1, Blue', 'electronics', 'Excellent', 88000, ['imac'], 'Magic keyboard and mouse included. No scratches.', false],
    ],
    sold: [['Xbox wireless controller', 'gaming', 3200, 'controller', 5, 'Mint condition and very quick replies.']],
  },
  {
    name: 'Simran Ahuja', email: 'simran@dobara.test', city: 'Gurgaon', area: 'Sohna Road', phone: '9810452210',
    bio: 'Fashion and lifestyle — wardrobe clear-out every season.',
    items: [
      ['Quilted leather sling bag, black', 'fashion', 'Excellent', 12500, ['handbag-2'], 'Authentic, with purchase receipt. Gold hardware has no fading.', true],
      ['Red running shoes, size 6', 'fashion', 'Like New', 2900, ['sneakers'], 'Worn for one 5K run.', true],
      ['Round gold-frame sunglasses', 'fashion', 'Good', 1400, ['sunglasses'], 'Light scratches on the case, lenses are perfect.', true],
      ['Fossil analog watch, white strap', 'fashion', 'Good', 3500, ['watch'], 'New battery fitted. Strap shows light wear.', true],
    ],
    sold: [['Biker leather jacket, size S', 'fashion', 4500, 'jacket', 5, 'Gorgeous jacket, exactly as in the photos. Lovely to deal with.']],
  },

  // ---------------- Mumbai ----------------
  {
    name: 'Farhan Shaikh', email: 'farhan@dobara.test', city: 'Mumbai', area: 'Bandra', phone: '9810452211',
    bio: 'Wedding and travel photographer. I sell older gear when I upgrade bodies.',
    items: [
      ['Canon EOS 90D body + 18–135 mm lens', 'cameras', 'Excellent', 78000, ['dslr-2', 'dslr'], 'Shutter count around 14,000. Two batteries and a 64 GB card included.', true],
      ['Sigma 18–35 mm f/1.8 Art lens (Canon mount)', 'cameras', 'Excellent', 39000, ['lens'], 'Sharp, no fungus or haze. Front and rear caps plus hood.', true],
      ['Fujifilm X100V, silver', 'cameras', 'Like New', 115000, ['camera-retro', 'mirrorless'], 'Under 3,000 shots. Thumb grip and leather half-case included.', true],
    ],
    sold: [['Sony a6000 kit', 'cameras', 28000, 'camera-kit', 5, 'Farhan explained everything about the camera. Highly recommended.']],
  },
  {
    name: 'Aditi Patil', email: 'aditi@dobara.test', city: 'Mumbai', area: 'Powai', phone: '9810452212',
    bio: 'IIT Bombay researcher. Selling books and electronics before relocating.',
    items: [
      ['Engineering + GATE reference books (25)', 'books', 'Good', 3000, ['books'], 'Made Easy, Kreyszig, Cormen and more. Some highlighting.', true],
      ['Bose SoundLink headphones', 'electronics', 'Good', 6500, ['headphones-2'], 'Ear cushions replaced recently. Battery lasts about 12 hours.', true],
      ['Ergonomic study set — desk + chair', 'furniture', 'Excellent', 9800, ['office-setup', 'desk'], 'Height-adjustable chair with lumbar support and a white study desk.', false],
      ['iPad 9th gen 64 GB with Apple Pencil', 'electronics', 'Good', 22000, ['tablet-2', 'tablet'], 'Great for notes. Pencil (1st gen) included.', true],
    ],
    sold: [['Kindle Paperwhite', 'electronics', 6500, 'tablet', 4, 'Good condition. A small scratch on the back that wasn’t in the photos, but fine.']],
  },
  {
    name: 'Rohit Naik', email: 'rohit@dobara.test', city: 'Mumbai', area: 'Versova', phone: '9810452213',
    bio: 'Bike commuter and home cook in Versova.',
    items: [
      ['Royal Enfield Classic 350, 2021, 15,000 km', 'vehicles', 'Excellent', 165000, ['motorcycle'], 'Serviced every 3,000 km. Touring seat and crash guard fitted.', false],
      ['Whirlpool 7 kg front-load washing machine', 'appliances', 'Good', 11500, ['washer'], 'Works perfectly. Selling because the new flat has a built-in one.', false],
      ['Nespresso-style espresso machine', 'appliances', 'Excellent', 7000, ['coffee'], 'Descaled monthly. Milk frother included.', true],
    ],
    sold: [['Riding jacket + gloves', 'vehicles', 2200, 'jacket', 5, 'Clean, well kept and fairly priced.']],
  },

  // ---------------- Bangalore ----------------
  {
    name: 'Karthik Subramanian', email: 'karthik@dobara.test', city: 'Bangalore', area: 'Whitefield', phone: '9810452214',
    bio: 'Tech lead at an ITPL startup. Work-from-home gear, all in great shape.',
    items: [
      ['Dell UltraSharp 27" monitor', 'electronics', 'Excellent', 18500, ['monitor', 'imac'], 'USB-C hub monitor, perfect for MacBooks. No dead pixels.', true],
      ['MacBook Air M1, 8 GB / 256 GB, Gold', 'laptops', 'Good', 52000, ['macbook-2', 'laptop'], '180 battery cycles. One small dent on the bottom corner.', true],
      ['Ergonomic mesh office chair', 'furniture', 'Good', 7500, ['office-setup'], 'Adjustable arms and headrest. Mesh in perfect condition.', false],
      ['Noise-cancelling earbuds', 'electronics', 'Like New', 5500, ['earbuds', 'earbuds-2'], 'Used for two weeks. All ear tips and case included.', true],
    ],
    sold: [['Logitech webcam C920', 'electronics', 3500, 'imac', 5, 'Fast replies and quick doorstep delivery.']],
  },
  {
    name: 'Divya Hegde', email: 'divya@dobara.test', city: 'Bangalore', area: 'Koramangala', phone: '9810452215',
    bio: 'Designer, minimalist living. Furniture and decor from my Koramangala flat.',
    items: [
      ['Mid-century lounge chair', 'furniture', 'Excellent', 8500, ['lounge-chair'], 'Swivel base, linen upholstery. No stains.', false],
      ['White moulded dining chairs (set of 2)', 'furniture', 'Like New', 3800, ['chair'], 'Wooden legs, very sturdy.', false],
      ['4-seater dining table, oak finish', 'furniture', 'Good', 11000, ['dining-2', 'dining'], 'Round table, seats four comfortably. Minor marks on top.', false],
      ['Gold round sunglasses', 'fashion', 'Like New', 1600, ['sunglasses'], 'Barely worn, comes with case.', true],
    ],
    sold: [['Fabric 2-seater sofa', 'furniture', 9000, 'sofa-2', 5, 'Divya was super helpful, even shared mover contacts.']],
  },
  {
    name: 'Pranav Rao', email: 'pranav@dobara.test', city: 'Bangalore', area: 'HSR Layout', phone: '9810452216',
    bio: 'Weekend cyclist and gamer in HSR. Quick replies, flexible pickups.',
    items: [
      ['Hybrid bicycle, 24-speed, alloy frame', 'sports', 'Excellent', 16500, ['bicycle', 'roadbike'], 'Shimano gears, disc brakes. Bottle cage and lights included.', false],
      ['PS5 Slim Digital + 3 games', 'gaming', 'Like New', 36500, ['console', 'controller'], 'Bought 4 months ago, warranty valid. Games are digital (account transfer not included).', true],
      ['iPhone 13 128 GB, Midnight', 'mobiles', 'Excellent', 39500, ['iphone', 'iphone-2'], 'Battery health 89%. Always in a case with a screen guard.', true],
    ],
    sold: [['Cricket bat — Kashmir willow', 'sports', 1500, 'cricket', 4, 'Decent bat for the price. Pranav was on time.']],
  },

  // ---------------- Pune ----------------
  {
    name: 'Shruti Kulkarni', email: 'shruti@dobara.test', city: 'Pune', area: 'Baner', phone: '9810452217',
    bio: 'Musician and teacher. Instruments and books from my Baner studio.',
    items: [
      ['Yamaha acoustic guitar F310 + stand', 'other', 'Excellent', 5800, ['guitar'], 'Recently set up — low action, easy to play. Gig bag included.', true],
      ['Classic novels + self-help book collection (30)', 'books', 'Good', 1800, ['books', 'bookshelf'], 'Mix of Penguin classics and bestsellers. Good condition.', true],
      ['Sony over-ear headphones, yellow edition', 'electronics', 'Good', 3800, ['headphones'], 'Great bass. Cushions slightly worn.', true],
    ],
    sold: [['Bluetooth speaker', 'electronics', 2800, 'headphones', 5, 'Lovely person, the speaker works great.']],
  },
  {
    name: 'Omkar Jadhav', email: 'omkar@dobara.test', city: 'Pune', area: 'Viman Nagar', phone: '9810452218',
    bio: 'Mechanical engineer. Bikes, tools and appliances — all tested.',
    items: [
      ['Yamaha R15 V3 (2019), 26,000 km', 'vehicles', 'Good', 112000, ['sportbike', 'ktm'], 'Second owner, papers clear. New chain set at 24,000 km.', false],
      ['Cordless drill + bit set', 'tools', 'Good', 3200, ['drill-2', 'toolkit'], '12 V drill with 2 batteries and 30 bits.', true],
      ['IFB 25 L convection microwave', 'appliances', 'Excellent', 7200, ['microwave', 'oven'], 'All modes work. Glass tray and grill rack included.', true],
      ['LG 43" 4K smart TV', 'electronics', 'Good', 19500, ['tv', 'tv-2'], 'webOS, Magic Remote included. Stand legs plus wall mount.', false],
    ],
    sold: [['Bosch tool kit', 'tools', 1900, 'toolkit', 5, 'Everything as described. Easy pickup.']],
  },

  // ---------------- Hyderabad ----------------
  {
    name: 'Lakshmi Prasad', email: 'lakshmi@dobara.test', city: 'Hyderabad', area: 'Madhapur', phone: '9810452219',
    bio: 'Working in HITEC City. Selling gadgets and home appliances after upgrading.',
    items: [
      ['Samsung Galaxy S22 128 GB', 'mobiles', 'Excellent', 32000, ['android', 'phone'], 'No scratches, always used with a case. Box and charger included.', true],
      ['HP Pavilion laptop, i5 11th gen, 16 GB', 'laptops', 'Good', 38000, ['laptop-2', 'laptop'], 'Battery backup about 4 hours. Small wear on the palm rest.', true],
      ['Mixer grinder + blender combo', 'appliances', 'Like New', 3200, ['blender'], 'Used a handful of times. All jars and lids included.', true],
      ['Samsung 23 L microwave', 'appliances', 'Good', 4000, ['microwave'], 'Heats evenly, door seal is perfect.', true],
    ],
    sold: [['Apple Watch SE', 'electronics', 14000, 'smartwatch', 5, 'Genuine product with bill, very quick handover.']],
  },
  {
    name: 'Sai Teja', email: 'sai@dobara.test', city: 'Hyderabad', area: 'Kondapur', phone: '9810452220',
    bio: 'Gym trainer and gamer. Fitness gear and consoles, all in great shape.',
    items: [
      ['Dumbbell set 30 kg with rods', 'sports', 'Good', 4800, ['dumbbell'], 'Chrome rods and rubber-coated plates.', false],
      ['Gaming PC — i5 12400F, RTX 3060', 'gaming', 'Excellent', 64000, ['gaming-setup', 'gamingpc'], 'RGB case, 16 GB RAM, 1 TB SSD. Runs every current game at 1080p high.', false],
      ['Nike running shoes, size 9', 'fashion', 'Good', 2600, ['sneakers', 'sneakers-2'], 'Used for about 200 km, plenty of life left.', true],
    ],
    sold: [['PS4 controller', 'gaming', 2200, 'controller', 4, 'Works fine, slight stick drift as mentioned in the listing.']],
  },

  // ---------------- Jaipur ----------------
  {
    name: 'Yash Agarwal', email: 'yash@dobara.test', city: 'Jaipur', area: 'Vaishali Nagar', phone: '9810452221',
    bio: 'Family business in electronics retail. Tested phones and laptops with bills.',
    items: [
      ['iPhone 14 128 GB, Midnight', 'mobiles', 'Excellent', 52000, ['iphone', 'iphone-2'], 'Battery health 91%. Apple warranty till February.', true],
      ['Dell Inspiron 15, i7, 16 GB / 512 GB', 'laptops', 'Good', 41000, ['laptop', 'laptop-2'], 'Ideal for students. New battery fitted in March.', true],
      ['Sony 43" Bravia 4K TV', 'electronics', 'Excellent', 28000, ['tv-2', 'tv'], 'Google TV, Dolby Vision. 2 years old with bill.', false],
      ['KTM Duke 250 (2021), 11,000 km', 'vehicles', 'Excellent', 165000, ['ktm', 'sportbike'], 'Single owner, all services on time at KTM Jaipur. Insurance valid.', false],
    ],
    sold: [['Realme Buds Air', 'electronics', 1800, 'earbuds', 5, 'Very trustworthy, item was sealed.']],
  },
  {
    name: 'Pallavi Rathore', email: 'pallavi@dobara.test', city: 'Jaipur', area: 'C-Scheme', phone: '9810452222',
    bio: 'Interior designer in C-Scheme. Handpicked furniture and decor pieces.',
    items: [
      ['Handcrafted sheesham bookshelf', 'furniture', 'Excellent', 9500, ['bookshelf'], 'Jaipur-made, solid wood with brass handles.', false],
      ['L-shaped sofa, grey with cushions', 'furniture', 'Good', 21000, ['sofa-2', 'sofa'], 'Five-seater with five cushions. Covers are washable.', false],
      ['Leather handbag, red', 'fashion', 'Excellent', 3800, ['handbag'], 'Genuine leather, used occasionally.', true],
      ['Retro accent chair', 'furniture', 'Like New', 5600, ['lounge-chair', 'chair'], 'Display piece from a staging project, never used daily.', false],
    ],
    sold: [['Dining chairs set of 4', 'furniture', 7200, 'chair', 5, 'Beautiful chairs, Pallavi arranged a tempo for delivery too.']],
  },
];
