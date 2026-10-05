// Static data used across the app (categories, conditions, locations, labels).

export const CATEGORIES = [
  { key: 'electronics', label: 'Electronics', icon: 'cpu' },
  { key: 'mobiles', label: 'Mobiles', icon: 'mobile' },
  { key: 'laptops', label: 'Laptops', icon: 'laptop' },
  { key: 'cameras', label: 'Cameras', icon: 'camera' },
  { key: 'furniture', label: 'Furniture', icon: 'sofa' },
  { key: 'vehicles', label: 'Vehicles', icon: 'car' },
  { key: 'fashion', label: 'Fashion', icon: 'shirt' },
  { key: 'appliances', label: 'Home Appliances', icon: 'washer' },
  { key: 'books', label: 'Books', icon: 'book' },
  { key: 'sports', label: 'Sports', icon: 'dumbbell' },
  { key: 'tools', label: 'Tools', icon: 'wrench' },
  { key: 'gaming', label: 'Gaming', icon: 'gamepad' },
  { key: 'other', label: 'Other', icon: 'grid' },
] as const;

export function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? 'Other';
}

export const CONDITIONS = [
  { key: 'Like New', hint: 'No signs of use', cls: 'cd-ln' },
  { key: 'Excellent', hint: 'Barely used', cls: 'cd-ex' },
  { key: 'Good', hint: 'Light signs of use', cls: 'cd-gd' },
  { key: 'Fair', hint: 'Visible wear, works well', cls: 'cd-fr' },
  { key: 'Needs Repair', hint: 'Has a fault', cls: 'cd-rp' },
] as const;

export function conditionCls(c: string) {
  return CONDITIONS.find((x) => x.key === c)?.cls ?? 'cd-gd';
}

// Locations: picked once from this list (no GPS).
export const LOCATIONS: { city: string; areas: string[] }[] = [
  { city: 'Noida', areas: ['Sector 18', 'Sector 50', 'Sector 61', 'Sector 62', 'Sector 74', 'Sector 76', 'Sector 137'] },
  { city: 'Delhi', areas: ['Saket', 'Lajpat Nagar', 'Dwarka', 'Rohini', 'Karol Bagh'] },
  { city: 'Ghaziabad', areas: ['Indirapuram', 'Vaishali', 'Raj Nagar Extension'] },
  { city: 'Gurgaon', areas: ['DLF Phase 3', 'Sohna Road', 'Golf Course Road'] },
  { city: 'Mumbai', areas: ['Andheri West', 'Versova', 'Bandra', 'Powai'] },
  { city: 'Bangalore', areas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield'] },
  { city: 'Pune', areas: ['Kothrud', 'Karve Nagar', 'Baner', 'Viman Nagar'] },
  { city: 'Hyderabad', areas: ['Gachibowli', 'Kondapur', 'Madhapur'] },
  { city: 'Jaipur', areas: ['Malviya Nagar', 'C-Scheme', 'Vaishali Nagar'] },
];

export function isValidLocation(city: string, area: string) {
  return !!LOCATIONS.find((l) => l.city === city && l.areas.includes(area));
}

export const DELIVERY_FEE = 79;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  PAID: 'Waiting for seller',
  ACCEPTED: 'Seller accepted',
  HANDED_TO_DELIVERY: 'Handed to delivery',
  OUT_FOR_DELIVERY: 'Out for delivery',
  READY_FOR_PICKUP: 'Ready for pickup',
  DELIVERED: 'Delivered — check & confirm',
  COMPLETED: 'Completed',
  ISSUE_REPORTED: 'Problem reported',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: 'b-gray',
  PAID: 'b-amber',
  ACCEPTED: 'b-pri',
  HANDED_TO_DELIVERY: 'b-pri',
  OUT_FOR_DELIVERY: 'b-pri',
  READY_FOR_PICKUP: 'b-pri',
  DELIVERED: 'b-teal',
  COMPLETED: 'b-green',
  ISSUE_REPORTED: 'b-red',
  CANCELLED: 'b-gray',
};

export const LISTING_STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: 'Pending review',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  SOLD: 'Sold',
};

export const LISTING_STATUS_BADGE: Record<string, string> = {
  PENDING_REVIEW: 'b-amber',
  ACTIVE: 'b-green',
  REJECTED: 'b-red',
  SOLD: 'b-gray',
};

export const REVIEW_TAGS_FOR_SELLER = ['As described', 'Quick replies', 'Well packed', 'On time', 'Friendly', 'Fair price'];
export const REVIEW_TAGS_FOR_BUYER = ['Paid on time', 'Clear communication', 'Punctual', 'Friendly'];

export const ISSUE_REASONS = [
  'Item not as described',
  'Arrived damaged',
  'Missing parts or accessories',
  'Not working',
  'Received a different item',
];
