// Terms & Privacy text (from the design). Edit freely.
export type LegalDoc = { title: string; updated: string; intro: string; sections: { id: string; h: string; p: string[]; list: string[] }[] };

export const LEGAL: Record<"terms" | "privacy", LegalDoc> = {
 "terms": {
  "title": "Terms & conditions",
  "updated": "October 1, 2026",
  "intro": "These terms govern your use of the Dobara website and apps. Please read them carefully — by creating an account or using Dobara you agree to them.",
  "sections": [
   {
    "id": "t1",
    "h": "1. Acceptance of these terms",
    "p": [
     "By accessing or using Dobara (“we”, “us”, “the platform”), you agree to these Terms & Conditions, and our Privacy Policy. If you do not agree, please do not use the platform."
    ],
    "list": []
   },
   {
    "id": "t2",
    "h": "2. Who can use Dobara",
    "p": [
     "You must be at least 18 years old and able to enter into a binding contract under Indian law. You need a valid email address to create an account."
    ],
    "list": []
   },
   {
    "id": "t3",
    "h": "3. Your account",
    "p": [
     "You are responsible for all activity on your account. Keep your login codes private — Dobara staff will never ask for them. One person may hold only one account unless we approve otherwise."
    ],
    "list": []
   },
   {
    "id": "t4",
    "h": "4. Listing items",
    "p": [
     "Sellers must own the items they list and describe them honestly."
    ],
    "list": [
     "Use real photos of the actual item — no stock images.",
     "Choose the condition grade that matches the item and disclose any faults.",
     "Do not list illegal, stolen, counterfeit or dangerous items (weapons, drugs, medicines, wildlife products and similar).",
     "New listings are checked by our team before they go live."
    ]
   },
   {
    "id": "t5",
    "h": "5. Offers and deals",
    "p": [
     "Buyers can make offers and sellers can accept, counter or decline them. An accepted offer is a commitment: the buyer should complete payment within 2 hours, during which the seller holds the item."
    ],
    "list": []
   },
   {
    "id": "t6",
    "h": "6. Payments and Dobara Secure Pay",
    "p": [
     "Payments made on Dobara are held by our payment partner and released to the seller only after the buyer confirms receipt, or automatically 48 hours after delivery if no issue is raised."
    ],
    "list": [
     "Buyers pay the agreed item price plus the flat delivery fee shown at checkout (pickup is free).",
     "Listing is free. Sellers receive the full agreed price once the buyer confirms receipt.",
     "Cash paid directly to a seller at pickup is not covered by Secure Pay."
    ]
   },
   {
    "id": "t7",
    "h": "7. Delivery and pickup",
    "p": [
     "Deliveries are arranged by the seller (for example through a courier). Every handover is confirmed with a one-time code (OTP). Responsibility for the item passes to the buyer once the delivery OTP is verified."
    ],
    "list": []
   },
   {
    "id": "t8",
    "h": "8. Cancellations, returns and disputes",
    "p": [
     "If the seller cannot complete an order it is cancelled and the buyer is refunded. If an item is not as described, report it within 48 hours of delivery; the seller’s payout is paused while we review."
    ],
    "list": []
   },
   {
    "id": "t9",
    "h": "9. Reviews and user content",
    "p": [
     "Reviews must be honest and based on a completed transaction. You grant Dobara a licence to display content you post (photos, descriptions, reviews) on the platform. We may remove content that breaks these terms."
    ],
    "list": []
   },
   {
    "id": "t10",
    "h": "10. Prohibited conduct",
    "p": [
     "You must not:"
    ],
    "list": [
     "Ask for or make payments outside Dobara to avoid fees or protections.",
     "Harass, threaten or discriminate against other users or partners.",
     "Create fake listings, reviews or accounts.",
     "Scrape, reverse-engineer or disrupt the platform."
    ]
   },
   {
    "id": "t11",
    "h": "11. Our role",
    "p": [
     "Dobara is an online marketplace and an intermediary under the Information Technology Act, 2000. Items are sold by individual sellers, not by Dobara. We are not the owner of listed items and do not guarantee their quality beyond the protections described in these terms."
    ],
    "list": []
   },
   {
    "id": "t12",
    "h": "12. Limitation of liability",
    "p": [
     "To the extent permitted by law, Dobara’s total liability for any claim relating to a transaction is limited to the amount paid for that transaction through Secure Pay."
    ],
    "list": []
   },
   {
    "id": "t13",
    "h": "13. Suspension and termination",
    "p": [
     "We may suspend or close accounts that break these terms, receive repeated verified complaints, or pose a safety risk. You may close your account at any time by writing to support@dobara.in once all orders are complete."
    ],
    "list": []
   },
   {
    "id": "t14",
    "h": "14. Governing law",
    "p": [
     "These terms are governed by the laws of India. Courts at Gautam Buddh Nagar, Uttar Pradesh have exclusive jurisdiction."
    ],
    "list": []
   },
   {
    "id": "t15",
    "h": "15. Contact and grievances",
    "p": [
     "Questions about these terms can be sent to legal@dobara.in. Complaints can be raised with our Grievance Officer at grievance@dobara.in; we acknowledge within 24 hours and resolve within 15 days."
    ],
    "list": []
   }
  ]
 },
 "privacy": {
  "title": "Privacy policy",
  "updated": "October 1, 2026",
  "intro": "This policy explains what personal data Dobara collects, why we collect it and the choices you have. We process personal data in line with the Digital Personal Data Protection Act, 2023.",
  "sections": [
   {
    "id": "p1",
    "h": "1. Data we collect",
    "p": [],
    "list": [
     "Account data: name, email address, your area and delivery address.",
     "Payout data: bank details that sellers share with us to receive payments.",
     "Listing and transaction data: items, offers, orders, payments and reviews.",
     "Location data: your chosen area and, with permission, device location.",
     "Communications: chats on Dobara and support conversations.",
     "Device data: IP address, browser, app version and crash logs."
    ]
   },
   {
    "id": "p2",
    "h": "2. How we use it",
    "p": [],
    "list": [
     "To run your account, listings, offers and orders.",
     "To show items near you and estimate delivery fees.",
     "To verify identities and prevent fraud and scams.",
     "To process payments, refunds and payouts.",
     "To send order updates, OTPs and, with consent, offers.",
     "To resolve disputes and meet legal obligations."
    ]
   },
   {
    "id": "p3",
    "h": "3. Location",
    "p": [
     "We show other users your area only (for example “Sector 18, Noida”), never your exact address. Exact pickup or delivery addresses are shared only with the other party and the assigned delivery partner after payment."
    ],
    "list": []
   },
   {
    "id": "p4",
    "h": "4. Who we share data with",
    "p": [],
    "list": [
     "The buyer, seller or delivery partner involved in your order, limited to what they need.",
     "Payment partners that process payments under PCI-DSS standards.",
     "Verification, SMS and cloud providers acting on our instructions.",
     "Authorities when required by law."
    ]
   },
   {
    "id": "p5",
    "h": "5. Payments",
    "p": [
     "We never store your full card number or UPI PIN. Payments are handled by our licensed payment partners."
    ],
    "list": []
   },
   {
    "id": "p6",
    "h": "6. How long we keep data",
    "p": [
     "We keep account data while your account is active. Transaction and tax records are retained for up to 8 years as required by law. Chats are kept for 2 years to support dispute resolution."
    ],
    "list": []
   },
   {
    "id": "p7",
    "h": "7. Your rights",
    "p": [
     "You can access, correct or delete your personal data, withdraw consent for marketing, and nominate another person to exercise your rights. Write to privacy@dobara.in."
    ],
    "list": []
   },
   {
    "id": "p8",
    "h": "8. Security",
    "p": [
     "Data is encrypted in transit and at rest. Access by our staff is limited, logged and reviewed."
    ],
    "list": []
   },
   {
    "id": "p9",
    "h": "9. Children",
    "p": [
     "Dobara is not meant for anyone under 18. We do not knowingly collect data from children."
    ],
    "list": []
   },
   {
    "id": "p10",
    "h": "10. Cookies",
    "p": [
     "We use essential cookies to keep you signed in and optional analytics cookies to improve the product. You can turn off optional cookies in your browser."
    ],
    "list": []
   },
   {
    "id": "p11",
    "h": "11. Contact",
    "p": [
     "Data Protection queries: privacy@dobara.in. Grievance Officer: grievance@dobara.in."
    ],
    "list": []
   }
  ]
 }
};
