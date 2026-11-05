/* More verified demo sellers so every area in LOCATIONS has 3–4 approved sellers.
 * Generated deterministically from name pools + an item catalogue (photos in public/demo).
 * Used by prisma/seed.ts (full reset) and prisma/add-demo-sellers.ts (additive, keeps existing data).
 */
import { LOCATIONS } from '../lib/constants';
import type { DemoItem, DemoSeller, DemoSold } from './demo-sellers';

/** Approved sellers each area already has from demo-data.json + DEMO_SELLERS. */
const EXISTING: Record<string, number> = {
  'Noida|Sector 50': 1, 'Ghaziabad|Indirapuram': 2, 'Ghaziabad|Raj Nagar Extension': 2, 'Pune|Karve Nagar': 0,
};
/** One busy area per city gets a 4th seller. */
const FOUR = new Set(['Noida|Sector 18', 'Delhi|Saket', 'Ghaziabad|Indirapuram', 'Gurgaon|DLF Phase 3', 'Mumbai|Andheri West', 'Bangalore|Koramangala', 'Pune|Kothrud', 'Hyderabad|Gachibowli', 'Jaipur|Malviya Nagar']);

const NAMES: Record<string, string[]> = {
  Noida: ['Abhishek Srivastava', 'Nidhi Agarwal', 'Rajat Bhatia', 'Swati Pandey', 'Kunal Sethi', 'Megha Rastogi', 'Vivek Chaudhary', 'Tanya Malik', 'Saurabh Dubey', 'Kritika Jain', 'Ashish Tomar', 'Pooja Bisht', 'Mayank Goyal', 'Shreya Tripathi', 'Rakesh Negi'],
  Delhi: ['Aman Bhalla', 'Ritu Khurana', 'Siddhant Arora', 'Jasleen Gill', 'Varun Chopra', 'Naina Batra', 'Manoj Rawat', 'Akanksha Sood', 'Harsh Vohra', 'Komal Dhingra', 'Rajiv Talwar', 'Ishaan Grover'],
  Ghaziabad: ['Sachin Tyagi', 'Prerna Garg', 'Ajay Sirohi', 'Monika Bhardwaj', 'Tarun Mittal', 'Shweta Kansal'],
  Gurgaon: ['Rohit Yadav', 'Anjali Dahiya', 'Nikhil Sangwan', 'Payal Hooda', 'Gaurav Kataria', 'Sakshi Phogat', 'Vikram Rao', 'Ira Bedi'],
  Mumbai: ['Aniket Sawant', 'Pooja Desai', 'Zaid Merchant', 'Neha Pillai', 'Siddharth Mhatre', 'Riya Fernandes', 'Kunal Shah', 'Sanya Mehta', 'Tejas Gokhale', 'Alisha Dsouza'],
  Bangalore: ['Arvind Gowda', 'Deepa Shetty', 'Naveen Kumar', 'Sneha Murthy', 'Rakshit Bhat', 'Anusha Reddy', 'Vinay Prabhu', 'Keerthi Rao', 'Suhas Nayak', 'Lavanya Iyer'],
  Pune: ['Aditya Kale', 'Mrunal Joshi', 'Ninad Bapat', 'Sayali Pawar', 'Chinmay Gadgil', 'Rutuja Shinde', 'Akshay More', 'Gauri Deshpande', 'Prathamesh Bhosale', 'Ketaki Apte', 'Sagar Thorat'],
  Hyderabad: ['Ravi Teja', 'Swathi Reddy', 'Kiran Varma', 'Mounika Rao', 'Abdul Rahman', 'Harika Chowdary', 'Srikanth Goud', 'Bhavana Naidu'],
  Jaipur: ['Mahendra Shekhawat', 'Ruchi Khandelwal', 'Lokesh Saini', 'Ankita Sharma', 'Himanshu Jangid', 'Nisha Choudhary', 'Rajendra Meena', 'Kavita Soni'],
};

type Theme = { bio: string; items: DemoItem[]; sold: DemoSold[] };

const THEMES: Theme[] = [
  {
    bio: 'Gadget upgrader. Phones and accessories with bills, factory reset before handover.',
    items: [
      ['iPhone 13 128 GB, Blue', 'mobiles', 'Excellent', 38500, ['iphone', 'iphone-2'], 'Battery health 88%. Always used with a case and screen guard. Box and bill included.', true],
      ['OnePlus 11R 5G, 8/128 GB', 'mobiles', 'Good', 21000, ['android', 'phone'], 'Minor scuffs on the frame. Charger and original case included.', true],
      ['Samsung Galaxy A54 5G, 128 GB', 'mobiles', 'Like New', 19500, ['phone', 'android'], 'Seven months old, still under warranty. No scratches.', true],
      ['iPhone 11 64 GB, White', 'mobiles', 'Good', 17500, ['iphone-2', 'iphone'], 'Battery health 81%. Small mark on the back glass, Face ID works.', true],
      ['Redmi Note 13 Pro, 8/256 GB', 'mobiles', 'Excellent', 16500, ['android'], 'Bought as a backup phone, barely used. Box and bill included.', true],
      ['TWS earbuds with charging case', 'electronics', 'Like New', 2400, ['earbuds-2', 'earbuds'], 'Used for a week. All ear tips included.', true],
      ['Smartwatch with AMOLED display', 'electronics', 'Excellent', 5200, ['smartwatch'], 'Heart rate, SpO2 and GPS. Two straps included.', true],
    ],
    sold: [['Pixel 6a 128 GB', 'mobiles', 14500, 'android', 5, 'Phone was exactly as described and factory reset in front of me.']],
  },
  {
    bio: 'Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned.',
    items: [
      ['MacBook Air M1 8/256 GB, Space Grey', 'laptops', 'Excellent', 54000, ['macbook', 'macbook-2'], 'Around 150 battery cycles. No dents. Charger and box included.', true],
      ['HP Victus gaming laptop, Ryzen 5, RTX 3050', 'laptops', 'Good', 46000, ['laptop-2', 'laptop'], '16 GB RAM, 512 GB SSD. Runs cool, keyboard backlight works.', true],
      ['Lenovo ThinkPad E14, i5, 16 GB', 'laptops', 'Good', 33000, ['laptop', 'laptop-2'], 'Business laptop, great keyboard. Battery lasts about 5 hours.', true],
      ['LG 27" 4K IPS monitor', 'electronics', 'Excellent', 17500, ['monitor'], 'Factory calibrated, no dead pixels. Stand and cables included.', false],
      ['iPad 10th gen 64 GB, Wi-Fi', 'electronics', 'Like New', 29500, ['tablet', 'tablet-2'], 'Used for streaming and notes. Folio case included.', true],
      ['Mechanical keyboard + wireless mouse combo', 'electronics', 'Excellent', 3200, ['office-setup'], 'Brown switches, hot-swappable. Mouse is silent-click.', true],
      ['ASUS Vivobook 15, i3, 8 GB / 512 GB', 'laptops', 'Good', 24000, ['laptop'], 'Good for college work. Fresh Windows install, charger included.', true],
    ],
    sold: [['Logitech wireless mouse', 'electronics', 900, 'office-setup', 5, 'Quick and easy deal, item was as good as new.']],
  },
  {
    bio: 'Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request.',
    items: [
      ['Nikon D5600 with 18–55 mm VR lens', 'cameras', 'Excellent', 36000, ['dslr', 'dslr-2'], 'Shutter count about 9,000. Two batteries, charger and a 64 GB card.', true],
      ['Sony a6100 with 16–50 mm kit lens', 'cameras', 'Like New', 52000, ['mirrorless', 'camera-retro'], 'Under 2,500 shots. Box and bill included.', true],
      ['Canon 50 mm f/1.8 STM prime lens', 'cameras', 'Excellent', 7800, ['lens'], 'Clean glass, no haze. Caps and pouch included.', true],
      ['Canon EOS 200D II kit', 'cameras', 'Good', 33000, ['camera-kit', 'dslr'], 'Light wear on the grip. Works perfectly, includes bag.', true],
      ['Vintage film camera (working)', 'cameras', 'Good', 6500, ['camera-retro'], 'Light meter works, tested with a roll last month.', true],
      ['Camera bag + tripod + filters kit', 'cameras', 'Good', 2800, ['camera-kit'], 'Backpack-style bag, aluminium tripod and UV/CPL filters.', true],
    ],
    sold: [['Godox speedlite flash', 'cameras', 4200, 'camera-kit', 5, 'Flash works great, came with the original box.']],
  },
  {
    bio: 'Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport.',
    items: [
      ['3-seater fabric sofa, beige', 'furniture', 'Good', 14500, ['sofa', 'sofa-2'], 'Comfortable and sturdy. Covers dry-cleaned last month.', false],
      ['Computer desk with drawers, walnut finish', 'furniture', 'Good', 5200, ['desk', 'office-setup'], 'Spacious top with cable cut-out. Can be dismantled for moving.', false],
      ['4-seater dining table with chairs', 'furniture', 'Excellent', 13500, ['dining', 'dining-2'], 'Glass top with wooden chairs. No wobble.', false],
      ['Study table with bookshelf', 'furniture', 'Good', 4800, ['desk', 'bookshelf'], 'Compact, fits in a bedroom corner. A few marks on top.', false],
      ['Ergonomic office chair, mesh back', 'furniture', 'Excellent', 6200, ['office-setup', 'chair'], 'Adjustable height and armrests. Wheels roll smoothly.', false],
      ['Accent armchair, teal velvet', 'furniture', 'Like New', 7200, ['lounge-chair'], 'Used in the living room as a display piece.', false],
      ['5-shelf wooden bookshelf', 'furniture', 'Good', 3900, ['bookshelf'], 'Solid and steady. Minor scratches on one side.', false],
    ],
    sold: [['2-seater dining table, sheesham', 'furniture', 3500, 'dining-2', 5, 'Lovely solid table and the seller helped load it.']],
  },
  {
    bio: 'Home appliances after upgrading the kitchen. Everything working and cleaned before sale.',
    items: [
      ['LG 260 L frost-free double-door fridge', 'appliances', 'Good', 15500, ['fridge'], 'Cools well, no noise. Five years old.', false],
      ['IFB 6 kg front-load washing machine', 'appliances', 'Good', 12500, ['washer'], 'All programs work. Drum cleaned recently.', false],
      ['Samsung 28 L convection microwave', 'appliances', 'Excellent', 8200, ['microwave', 'oven'], 'Convection, grill and solo modes all work.', true],
      ['OTG oven 35 L with rotisserie', 'appliances', 'Good', 4600, ['oven'], 'Used for weekend baking. Trays included.', true],
      ['Mixer grinder 750 W, 3 jars', 'appliances', 'Excellent', 2600, ['blender'], 'Motor strong, jars have no cracks.', true],
      ['Drip coffee maker with carafe', 'appliances', 'Like New', 3400, ['coffee'], 'Used a handful of times. Reusable filter included.', true],
      ['Sony 50" 4K smart TV', 'electronics', 'Good', 31000, ['tv', 'tv-2'], 'Google TV, crisp picture. Remote and wall mount included.', false],
    ],
    sold: [['Toaster oven 12 L', 'appliances', 1800, 'oven', 4, 'Works fine, the seller was flexible with the pickup time.']],
  },
  {
    bio: 'Fitness and outdoor gear. Weekend pickups, everything wiped down and checked.',
    items: [
      ['Geared bicycle, 21-speed, disc brakes', 'sports', 'Good', 9500, ['bicycle', 'roadbike'], 'Serviced recently, new tubes. Stand and lights included.', false],
      ['Road bike, aluminium frame, size M', 'sports', 'Excellent', 22000, ['roadbike'], 'Shimano Claris groupset. Very light, ridden mostly on weekends.', false],
      ['Dumbbell set 20 kg with rods', 'sports', 'Good', 3600, ['dumbbell'], 'Plates and two chrome rods with collars.', false],
      ['Cricket kit — bat, pads, gloves, helmet', 'sports', 'Good', 4200, ['cricket'], 'Full kit in a wheeled bag. Bat oiled and knocked in.', true],
      ['Running shoes, size 8', 'fashion', 'Like New', 2700, ['sneakers', 'sneakers-2'], 'Used for under 50 km. Cushioning as new.', true],
      ['Sports sunglasses, polarised', 'fashion', 'Excellent', 1500, ['sunglasses-2'], 'Wrap-around frame, case included.', true],
    ],
    sold: [['Cricket bat, English willow', 'sports', 1600, 'cricket', 5, 'Bat was in great shape, quick handover.']],
  },
  {
    bio: 'Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover.',
    items: [
      ['PS5 Disc Edition + 1 controller', 'gaming', 'Excellent', 39000, ['console', 'controller'], 'Warranty till next year. Includes two game discs.', true],
      ['Xbox Series S 512 GB', 'gaming', 'Like New', 23500, ['console'], 'Used for a few months. Box and all cables included.', true],
      ['Gaming PC — i5 12400F, RTX 3060 Ti', 'gaming', 'Good', 62000, ['gamingpc', 'gaming-setup'], '16 GB RAM, 1 TB NVMe. Runs AAA titles at 1440p.', false],
      ['DualSense controller, white', 'gaming', 'Excellent', 4200, ['controller'], 'No stick drift, triggers work perfectly.', true],
      ['Gaming headset with mic', 'gaming', 'Good', 2600, ['headphones', 'headphones-2'], 'Clear mic, comfortable for long sessions.', true],
      ['PS4 Slim 1 TB + 2 controllers', 'gaming', 'Good', 18500, ['console', 'controller'], 'Runs quiet, cleaned recently. Three game discs included.', true],
    ],
    sold: [['Gaming mouse + mousepad', 'gaming', 1500, 'gaming-setup', 5, 'Item was clean and well packed. Recommended.']],
  },
  {
    bio: 'Wardrobe clear-out — authentic brands, worn only a few times. Delivery available.',
    items: [
      ['Leather handbag, tan', 'fashion', 'Excellent', 3800, ['handbag', 'handbag-2'], 'Genuine leather with dust bag. No scuffs on corners.', true],
      ['Quilted sling bag, black', 'fashion', 'Like New', 4500, ['handbag-2'], 'Used for two events. Chain strap included.', true],
      ['Biker leather jacket, size M', 'fashion', 'Good', 5200, ['jacket'], 'Real leather, broken in nicely. All zips work.', true],
      ['Analog wristwatch, steel strap', 'fashion', 'Excellent', 4800, ['watch'], 'New battery fitted. Box and warranty card included.', true],
      ['Aviator sunglasses, gold frame', 'fashion', 'Good', 1900, ['sunglasses'], 'Lenses scratch-free. Case included.', true],
      ['White sneakers, size 7', 'fashion', 'Like New', 2300, ['sneakers-2'], 'Worn twice, wrong size.', true],
    ],
    sold: [['Designer tote bag', 'fashion', 2800, 'handbag', 5, 'Bag was in pristine condition, quick replies.']],
  },
  {
    bio: 'Vehicles with papers, service records and NOC. Test ride on request.',
    items: [
      ['Maruti Swift VXi 2018, petrol, 48,000 km', 'vehicles', 'Good', 455000, ['car', 'car-2'], 'Single owner, all services at Maruti. Insurance valid.', false],
      ['Hyundai i20 Asta 2019, 39,000 km', 'vehicles', 'Excellent', 615000, ['car-2', 'car'], 'Top variant with sunroof. No accidents, papers clear.', false],
      ['Bajaj Pulsar NS200 (2020), 18,000 km', 'vehicles', 'Good', 92000, ['sportbike', 'ktm'], 'New tyres and chain set. All papers in order.', false],
      ['Royal Enfield Meteor 350 (2022), 9,000 km', 'vehicles', 'Excellent', 172000, ['motorcycle'], 'Tripper navigation, crash guard and backrest fitted.', false],
      ['Ather 450X electric scooter (2022)', 'vehicles', 'Good', 88000, ['ebike'], 'Battery health good, about 90 km per charge. Charger included.', false],
      ['Car tool kit + tyre inflator', 'tools', 'Like New', 1800, ['toolkit'], 'Digital inflator and 40-piece tool set.', true],
    ],
    sold: [['Bike riding jacket', 'vehicles', 2600, 'jacket', 5, 'Jacket in great shape, honest seller.']],
  },
  {
    bio: 'Books, music and hobby things from a home library. Happy to bundle for a discount.',
    items: [
      ['UPSC preparation books set (20)', 'books', 'Good', 2600, ['books', 'bookshelf'], 'Laxmikanth, Spectrum, NCERTs and more. Some notes in pencil.', true],
      ['Fiction bestsellers bundle (25 books)', 'books', 'Good', 1500, ['books'], 'Mix of thrillers and literary fiction, all paperbacks.', true],
      ['JEE / NEET reference books (15)', 'books', 'Good', 1900, ['books', 'bookshelf'], 'HC Verma, MS Chouhan and more. Clean pages.', true],
      ['Acoustic guitar with gig bag', 'other', 'Excellent', 4800, ['guitar'], 'Beginner-friendly, new strings fitted.', true],
      ['Bluetooth over-ear headphones', 'electronics', 'Good', 2900, ['headphones-2', 'headphones'], 'Good battery, cushions in decent shape.', true],
    ],
    sold: [['Children’s story books set', 'books', 800, 'books', 5, 'Books were in great condition, the kids love them.']],
  },
  {
    bio: 'Carpenter and DIY enthusiast. Power tools with batteries and cases, all tested.',
    items: [
      ['Cordless drill driver 18 V, 2 batteries', 'tools', 'Excellent', 6200, ['drill', 'drill-2'], 'Light use, both batteries hold charge. Case included.', true],
      ['Impact drill 650 W with bits', 'tools', 'Good', 2400, ['drill-2'], 'Works on concrete and wood. 15 bits included.', true],
      ['Mechanic tool kit, 108 pieces', 'tools', 'Like New', 3300, ['toolkit'], 'Socket set, spanners and screwdrivers in a hard case.', true],
      ['Workbench study desk, solid wood', 'furniture', 'Good', 5600, ['desk'], 'Heavy and sturdy, great for a workshop or study.', false],
      ['Angle grinder 4 inch', 'tools', 'Good', 1900, ['drill-2', 'toolkit'], 'Runs smoothly, guard and two discs included.', true],
    ],
    sold: [['Screwdriver set', 'tools', 700, 'toolkit', 4, 'Good tools, fair price.']],
  },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');
const round = (n: number) => (n >= 10000 ? Math.round(n / 500) * 500 : Math.round(n / 100) * 100);

function build(): DemoSeller[] {
  const out: DemoSeller[] = [];
  const used: Record<string, number> = {};
  let n = 0;
  for (const { city, areas } of LOCATIONS) {
    for (const area of areas) {
      const key = `${city}|${area}`;
      const have = EXISTING[key] ?? 1;
      const want = FOUR.has(key) ? 4 : 3;
      for (let i = have; i < want; i++) {
        const name = NAMES[city]![used[city] = (used[city] ?? -1) + 1]!;
        const t = THEMES[(n * 5 + i) % THEMES.length]!;
        // 3 items per seller, rotated through the theme so neighbours don't list the same things
        const items = [0, 1, 2].map((j) => {
          const it = t.items[(n + j * 2) % t.items.length]!;
          const factor = 0.92 + ((n * 7 + j * 3) % 17) / 100;
          return [it[0], it[1], it[2], round(it[3] * factor), it[4], it[5], it[6]] as DemoItem;
        });
        n++;
        out.push({
          name, email: `${slug(name)}@dobara.test`, city, area,
          phone: '98105' + String(10000 + n).slice(-5),
          bio: `${t.bio} Based in ${area}, ${city}.`,
          items,
          sold: t.sold,
        });
      }
    }
  }
  return out;
}

export const EXTRA_SELLERS: DemoSeller[] = build();
