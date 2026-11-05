--
-- PostgreSQL database dump
--

\restrict lsNFHsxUIyAvDuDgtrjEX2DYt8rezkMpP8CAH0nlkN6KUfHYdxXF0lJAkGOr4d0

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ComplaintStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ComplaintStatus" AS ENUM (
    'OPEN',
    'RESOLVED'
);


--
-- Name: FulfilMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FulfilMode" AS ENUM (
    'PICKUP',
    'DELIVERY'
);


--
-- Name: ListingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ListingStatus" AS ENUM (
    'PENDING_REVIEW',
    'ACTIVE',
    'REJECTED',
    'SOLD',
    'RESERVED'
);


--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'OFFER',
    'SYSTEM'
);


--
-- Name: OfferStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OfferStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'COUNTERED'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING_PAYMENT',
    'PAID',
    'ACCEPTED',
    'HANDED_TO_DELIVERY',
    'OUT_FOR_DELIVERY',
    'READY_FOR_PICKUP',
    'DELIVERED',
    'COMPLETED',
    'ISSUE_REPORTED',
    'CANCELLED'
);


--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'PAID'
);


--
-- Name: SellerStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SellerStatus" AS ENUM (
    'NONE',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Complaint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Complaint" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "userId" text NOT NULL,
    reason text NOT NULL,
    text text NOT NULL,
    photos text[],
    status public."ComplaintStatus" DEFAULT 'OPEN'::public."ComplaintStatus" NOT NULL,
    outcome text,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ContactMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContactMessage" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    topic text NOT NULL,
    "orderCode" text,
    message text NOT NULL,
    resolved boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "agreedPrice" integer,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: EmailOtp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailOtp" (
    id text NOT NULL,
    email text NOT NULL,
    "codeHash" text NOT NULL,
    purpose text NOT NULL,
    name text,
    attempts integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Listing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Listing" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    condition text NOT NULL,
    price integer NOT NULL,
    description text NOT NULL,
    photos text[],
    "canPickup" boolean DEFAULT true NOT NULL,
    "canDeliver" boolean DEFAULT true NOT NULL,
    city text NOT NULL,
    area text NOT NULL,
    status public."ListingStatus" DEFAULT 'PENDING_REVIEW'::public."ListingStatus" NOT NULL,
    "rejectReason" text,
    views integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    type public."MessageType" DEFAULT 'TEXT'::public."MessageType" NOT NULL,
    text text,
    amount integer,
    "offerStatus" public."OfferStatus",
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    code text NOT NULL,
    "listingId" text NOT NULL,
    "conversationId" text,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    "agreedPrice" integer NOT NULL,
    "deliveryFee" integer NOT NULL,
    total integer NOT NULL,
    mode public."FulfilMode" NOT NULL,
    address text,
    "pickupPlace" text,
    "pickupTime" text,
    "courierNote" text,
    status public."OrderStatus" DEFAULT 'PENDING_PAYMENT'::public."OrderStatus" NOT NULL,
    "handoverOtp" text NOT NULL,
    "razorpayOrderId" text,
    "paymentId" text,
    "paymentMode" text,
    "paidAt" timestamp(3) without time zone,
    "acceptedAt" timestamp(3) without time zone,
    "shippedAt" timestamp(3) without time zone,
    "outAt" timestamp(3) without time zone,
    "readyAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Payout; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payout" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "sellerId" text NOT NULL,
    amount integer NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "fromUserId" text NOT NULL,
    "toUserId" text NOT NULL,
    rating integer NOT NULL,
    tags text[],
    text text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    city text,
    area text,
    address text,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sellerStatus" public."SellerStatus" DEFAULT 'NONE'::public."SellerStatus" NOT NULL,
    "sellerPhone" text,
    "sellerNote" text,
    "sellerRejectReason" text,
    "sellerAppliedAt" timestamp(3) without time zone
);


--
-- Data for Name: Complaint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Complaint" (id, "orderId", "userId", reason, text, photos, status, outcome, "adminNote", "createdAt") FROM stdin;
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContactMessage" (id, name, email, topic, "orderCode", message, resolved, "createdAt") FROM stdin;
\.


--
-- Data for Name: Conversation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Conversation" (id, "listingId", "buyerId", "sellerId", "agreedPrice", "updatedAt", "createdAt") FROM stdin;
cmuv6m96q002uuh7savwi3wr3	cmuv6m93l000kuh7s7em80eg2	cmuv6m9180001uh7syb2m1tr0	cmuv6m91l0004uh7sn0nii9u7	\N	2026-10-05 11:44:07.683	2026-10-05 11:44:07.683
cmuv6m9980046uh7sd82dc90c	cmuv6m94e0014uh7s93dyq64e	cmuv6m91c0002uh7sx14c2ye6	cmuv6m91l0004uh7sn0nii9u7	16000	2026-10-05 11:44:07.772	2026-10-05 11:44:07.772
cmv57951r0005uh8k98bhsl9i	cmv51tddb00p6uhm8p66hxqtz	cmv5792510001uh8koogdh7vy	cmv51tdd900p4uhm89l74qfpy	9000	2026-10-13 06:58:43.959	2026-10-12 11:59:37.167
cmvp5hvxe0001uhsgjmen4pl6	cmv51td3z00jruhm8j8spxdzk	cmuv6m9140000uh7sue4vhajf	cmv51td3x00jpuhm8a3oeqzkz	\N	2026-10-26 11:11:16.686	2026-10-26 11:05:49.535
cmvthm3ti0001uh24gh7e699v	cmuv6m93l000kuh7s7em80eg2	cmuv6m9140000uh7sue4vhajf	cmuv6m91l0004uh7sn0nii9u7	\N	2026-10-29 11:56:15.106	2026-10-29 11:56:06.482
cmvthq1sm0008uh247bow1zqw	cmv51tc94000tuhm8vumk98rw	cmuv6m9140000uh7sue4vhajf	cmv51tc8v000luhm8gy1nhadz	1200	2026-10-29 11:59:51.819	2026-10-29 11:59:10.486
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Listing" (id, "sellerId", title, category, condition, price, description, photos, "canPickup", "canDeliver", city, area, status, "rejectReason", views, "createdAt") FROM stdin;
cmuv6m93s000ouh7suqu6v3dv	cmuv6m9280007uh7svoealavk	MacBook Air M1 (8 GB / 256 GB), Space Grey	laptops	Excellent	48000	Battery cycle count 212, health 89%. Keyboard and trackpad perfect. Minor scuff on the bottom panel. Charger included.\n\nReason for selling: Got a work laptop, this is lying unused.	{/demo/macbook.jpg,/demo/macbook-2.jpg,/demo/laptop.jpg}	t	t	Delhi	Saket	ACTIVE	\N	1210	2026-10-04 11:44:07.574
cmuv6m93v000quh7svdopc8qb	cmuv6m9230006uh7sxuv38bzw	Sony Alpha A6400 with 16–50mm kit lens	cameras	Like New	52000	Barely used, shutter count 3,100. Screen guard since day one. Comes with 2 batteries.\n\nReason for selling: Moving cities, reducing gear.	{/demo/camera-retro.jpg,/demo/mirrorless.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	988	2026-10-05 08:44:07.577
cmuv6m93y000suh7sadtoh3h9	cmuv6m92d0008uh7sj5kq7ao9	Gaming PC — Ryzen 5 5600, RTX 3060 12 GB, 16 GB RAM	gaming	Good	58000	Runs every modern title at 1080p high. Temps under 70°C. Windows 11 activated. Monitor not included.\n\nReason for selling: Upgrading to a new build.	{/demo/gamingpc.jpg,/demo/gaming-setup.jpg}	t	t	Gurgaon	DLF Phase 3	ACTIVE	\N	1560	2026-10-05 05:44:07.58
cmuv6m941000uuh7ss7h1n1gy	cmuv6m92h0009uh7scay6bdzr	Solid sheesham study table with drawer	furniture	Good	6500	Sturdy solid wood, light surface scratches. Needs two people to carry.\n\nReason for selling: Shifting to a smaller flat.	{/demo/office-setup.jpg,/demo/desk.jpg}	t	t	Noida	Sector 61	ACTIVE	\N	312	2026-10-05 11:14:07.583
cmuv6m944000wuh7s7oa8l66x	cmuv6m92l000auh7shjhieuj1	Ergonomic mesh office chair with lumbar support	furniture	Excellent	8500	Adjustable headrest, 2D armrests, recline lock. No tears in the mesh.\n\nReason for selling: Moved back to office full-time.	{/demo/office-setup.jpg,/demo/chair.jpg}	t	t	Delhi	Lajpat Nagar	ACTIVE	\N	704	2026-10-04 10:44:07.586
cmuv6m947000yuh7s0rbknp7d	cmuv6m92p000buh7syoeezluk	Hero Sprint 21-speed hybrid bicycle	sports	Good	9000	Serviced last month. New brake pads. Minor paint chips.\n\nReason for selling: Bought a scooter for the commute.	{/demo/roadbike.jpg,/demo/bicycle.jpg}	t	f	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	433	2026-10-03 11:44:07.589
cmuv6m9490010uh7srqvxyxm6	cmuv6m91y0005uh7sne9aexuo	Adjustable dumbbells, 24 kg pair	sports	Like New	7800	Hardly used. All plates and collars included.\n\nReason for selling: Joined a gym.	{/demo/dumbbell.jpg}	t	t	Noida	Sector 50	ACTIVE	\N	521	2026-10-05 03:44:07.591
cmuv6m94c0012uh7swmxd4vmy	cmuv6m92h0009uh7scay6bdzr	Bosch GSB 500W impact drill kit	tools	Excellent	2400	Works perfectly, full kit with 13 bits in the case.\n\nReason for selling: Used for one home move.	{/demo/drill-2.jpg,/demo/drill.jpg}	t	t	Noida	Sector 61	ACTIVE	\N	198	2026-10-05 07:44:07.594
cmuv6m94h0016uh7s0wmu85dj	cmuv6m92l000auh7shjhieuj1	LG 7 kg front-load washing machine	appliances	Fair	14000	Works well, door gasket replaced last year. Some cosmetic marks.\n\nReason for selling: Moving abroad.	{/demo/washer.jpg}	t	t	Delhi	Lajpat Nagar	ACTIVE	\N	402	2026-10-02 11:44:07.599
cmuv6m94j0018uh7s10u0la6a	cmuv6m9230006uh7sxuv38bzw	3-seater fabric sofa, slate grey	furniture	Good	12000	Comfortable, no stains. Covers are washable.\n\nReason for selling: Moving cities.	{/demo/sofa-2.jpg,/demo/sofa.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	615	2026-10-03 23:44:07.601
cmuv6m94l001auh7s86g9jpxk	cmuv6m92p000buh7syoeezluk	Royal Enfield Classic 350 (2019), 18,400 km	vehicles	Excellent	132000	Single owner, all services at authorised centre. Insurance valid till Feb 2027.\n\nReason for selling: Buying a car.	{/demo/motorcycle.jpg,/demo/ktm.jpg}	t	f	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	2240	2026-10-04 23:44:07.604
cmuv6m94p001cuh7se7whbxuz	cmuv6m92d0008uh7sj5kq7ao9	PS5 Disc Edition + 2 controllers	gaming	Like New	36000	Includes two controllers and three games.\n\nReason for selling: Not getting time to play.	{/demo/controller.jpg,/demo/console.jpg}	t	t	Gurgaon	DLF Phase 3	ACTIVE	\N	1802	2026-10-05 01:44:07.607
cmuv6m94r001euh7shazblwhg	cmuv6m9280007uh7svoealavk	UPSC prep books set — Laxmikanth, Spectrum + 12 more	books	Good	1800	Some highlighting in Laxmikanth.\n\nReason for selling: Cleared prelims, passing it on.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Delhi	Saket	ACTIVE	\N	288	2026-10-04 20:44:07.609
cmuv6m94u001guh7skjnd4e9o	cmuv6m92l000auh7shjhieuj1	Levi's denim trucker jacket, size M	fashion	Like New	1200	Worn twice. Dry cleaned.\n\nReason for selling: Wrong size.	{/demo/jacket.jpg}	t	t	Delhi	Lajpat Nagar	ACTIVE	\N	150	2026-10-05 08:24:07.612
cmuv6m94w001iuh7s5s06l2xz	cmuv6m91l0004uh7sn0nii9u7	Canon EF 50mm f/1.8 STM lens	cameras	Excellent	6200	Clean glass, both caps included.\n\nReason for selling: Bundling with camera sale.	{/demo/lens.jpg,/demo/camera-kit.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	390	2026-10-04 02:24:07.614
cmuv6m94y001kuh7s66rwr3q7	cmuv6m92h0009uh7scay6bdzr	Redmi Note 12 — cracked screen, works fine	mobiles	Needs Repair	4500	Screen cracked at the corner; touch works. Replacement costs about ₹2,500.\n\nReason for selling: Upgraded.	{/demo/phone.jpg,/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Noida	Sector 61	ACTIVE	\N	211	2026-10-05 10:14:07.616
cmuv6m951001muh7sdv371ff7	cmuv6m9230006uh7sxuv38bzw	Samsung 23 L solo microwave	appliances	Fair	3200	Heats evenly. Turntable included.\n\nReason for selling: Moving cities.	{/demo/microwave.jpg,/demo/oven.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	176	2026-10-04 17:24:07.619
cmuv6m956001quh7s73sb4134	cmuv6m93b000huh7s6gdjihgo	Dell S2421H 24" IPS monitor	electronics	Excellent	8500	Full HD IPS, speakers built in.	{/demo/tv-2.jpg,/demo/tv.jpg}	t	t	Ghaziabad	Vaishali	SOLD	\N	530	2026-10-02 17:04:07.624
cmuv6m959001suh7sfhcmmsa7	cmuv6m93f000iuh7szsqcd2w6	iPhone 15 128 GB, Black — 7 months old	mobiles	Like New	49000	Battery health 99%. Under Apple warranty till Mar 2027. Box and bill.\n\nReason for selling: Company-issued phone arrived.	{/demo/phone.jpg,/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Noida	Sector 76	ACTIVE	\N	1320	2026-10-05 09:14:07.626
cmuv6m94e0014uh7s93dyq64e	cmuv6m91l0004uh7sn0nii9u7	Samsung 43" Crystal 4K Smart TV	electronics	Good	17500	No dead pixels. Remote and wall mount included. Stand legs available.\n\nReason for selling: Upgraded to a bigger TV.	{/demo/tv-2.jpg,/demo/tv.jpg}	t	t	Noida	Sector 18	SOLD	\N	866	2026-10-04 11:44:07.596
cmuv6m93p000muh7svsdpek51	cmuv6m91y0005uh7sne9aexuo	iPhone 14 Pro 256 GB, Deep Purple	mobiles	Excellent	64500	Always used with a case and screen guard. Battery health 86%. Face ID and all cameras work perfectly. No repairs, never opened.\n\nReason for selling: Switching to Android for work.	{/demo/iphone-2.jpg,/demo/phone.jpg,/demo/iphone.jpg}	t	t	Noida	Sector 50	ACTIVE	\N	1905	2026-10-05 06:44:07.571
cmv51tc7x0006uhm8213hcc8g	cmv51tc7l0004uhm8v6egi0f3	iPad Air (5th gen) 64 GB Wi-Fi, Space Grey	electronics	Excellent	38500	Used mostly for reading and notes. Always kept in a cover with a screen guard. Battery health 92%. Box, cable and bill included.	{/demo/tablet.jpg,/demo/tablet-2.jpg}	t	t	Noida	Sector 62	ACTIVE	\N	130	2026-10-11 15:14:21.883
cmv51tc840008uhm82za3njdw	cmv51tc7l0004uhm8v6egi0f3	Sony WH-1000XM4 noise-cancelling headphones	electronics	Like New	14500	Bought last year, used maybe 20 times. Comes with the hard case, cable and flight adapter.	{/demo/headphones.jpg,/demo/headphones-2.jpg}	t	t	Noida	Sector 62	ACTIVE	\N	183	2026-10-11 04:01:21.891
cmv51tc87000auhm8gue9f10e	cmv51tc7l0004uhm8v6egi0f3	Apple Watch Series 7, 45 mm GPS	electronics	Good	16000	Minor hairline scratch on the screen, not visible when on. Original strap plus one extra sport band.	{/demo/smartwatch.jpg}	t	t	Noida	Sector 62	ACTIVE	\N	236	2026-10-10 16:48:21.894
cmv51tc8a000cuhm8eldajhkl	cmv51tc7l0004uhm8v6egi0f3	Coffee machine with grinder — barely used	appliances	Like New	9500	Moved to a place with an office café, so this sat unused. Descaled and cleaned before listing.	{/demo/coffee.jpg}	t	f	Noida	Sector 62	ACTIVE	\N	289	2026-10-10 05:35:21.897
cmv51tc8d000euhm8lek9j3dm	cmv51tc7l0004uhm8v6egi0f3	OnePlus Buds Pro	electronics	Good	4200	OnePlus Buds Pro in good condition.	{/demo/earbuds-2.jpg}	t	t	Noida	Sector 62	SOLD	\N	0	2026-09-19 09:27:21.9
cmv51tc8x000nuhm86efx5sc0	cmv51tc8v000luhm8gy1nhadz	Decathlon road bike, 21-speed, size M	sports	Good	14500	Serviced last month — new brake pads and chain lube. A few cosmetic scratches on the frame.	{/demo/roadbike.jpg,/demo/bicycle.jpg}	t	f	Noida	Sector 137	ACTIVE	\N	167	2026-10-11 08:14:21.92
cmv51td5b00kruhm8gtye217v	cmv51td5200kjuhm8uf7iq953	Gaming mouse + mousepad	gaming	Good	1500	Gaming mouse + mousepad in good condition.	{/demo/gaming-setup.jpg}	t	t	Delhi	Karol Bagh	SOLD	\N	0	2026-09-24 09:27:23.086
cmuv6m95f001wuh7s1cp2j0ei	cmuv6m937000guh7sxrn2e4tz	iPhone 13 128 GB, Midnight	mobiles	Excellent	38500	Battery 88%.\n\nReason for selling: Upgraded.	{/demo/phone.jpg,/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Jaipur	Malviya Nagar	ACTIVE	\N	640	2026-10-05 08:44:07.633
cmuv6m95i001yuh7skl67aow2	cmuv6m937000guh7sxrn2e4tz	Study table and chair set	furniture	Good	5200	Solid, clean.\n\nReason for selling: Kids outgrew it.	{/demo/desk.jpg,/demo/office-setup.jpg}	t	t	Jaipur	Malviya Nagar	ACTIVE	\N	210	2026-10-04 20:44:07.636
cmuv6m95l0020uh7s8sgc51fb	cmuv6m937000guh7sxrn2e4tz	Canon EOS 200D II with kit lens	cameras	Like New	34000	Shutter 2,400.\n\nReason for selling: Upgraded.	{/demo/dslr-2.jpg,/demo/camera-kit.jpg,/demo/dslr.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	402	2026-10-05 06:44:07.639
cmuv6m95o0022uh7sunjcwbz8	cmuv6m934000fuh7snmsllk3o	MacBook Pro 14" M1 Pro, 16 GB / 512 GB	laptops	Excellent	118000	Battery 90%.\n\nReason for selling: Company laptop now.	{/demo/macbook.jpg,/demo/macbook-2.jpg,/demo/laptop.jpg}	t	t	Mumbai	Andheri West	ACTIVE	\N	980	2026-10-05 07:44:07.642
cmuv6m95q0024uh7s32n2hc4x	cmuv6m934000fuh7snmsllk3o	Mesh office chair, high back	furniture	Good	6800	Good condition.\n\nReason for selling: WFH ended.	{/demo/chair.jpg,/demo/office-setup.jpg}	t	t	Mumbai	Andheri West	ACTIVE	\N	211	2026-10-05 01:44:07.644
cmuv6m95s0026uh7s3j27ag6i	cmuv6m934000fuh7snmsllk3o	Firefox Bad Attitude 8 bicycle	sports	Excellent	11000	Serviced.\n\nReason for selling: Moving.	{/demo/bicycle.jpg,/demo/roadbike.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	190	2026-10-04 11:44:07.646
cmuv6m95w0028uh7s8yeac1en	cmuv6m92w000duh7smxgvru0j	Gaming PC — i5 13400F, RTX 4060	gaming	Like New	72000	Mint.\n\nReason for selling: Upgrade.	{/demo/gaming-setup.jpg,/demo/gamingpc.jpg}	t	t	Bangalore	Indiranagar	ACTIVE	\N	870	2026-10-05 08:24:07.649
cmuv6m95z002auh7sc0dz45ft	cmuv6m92w000duh7smxgvru0j	3-seater sofa, beige	furniture	Good	15000	Clean.\n\nReason for selling: Moving.	{/demo/sofa.jpg,/demo/sofa-2.jpg}	t	t	Bangalore	HSR Layout	ACTIVE	\N	320	2026-10-04 20:44:07.653
cmuv6m964002euh7s6xnk6m3q	cmuv6m930000euh7s8dv7t3bf	Royal Enfield Hunter 350 (2023)	vehicles	Like New	142000	6,200 km.\n\nReason for selling: Moving abroad.	{/demo/motorcycle.jpg,/demo/ktm.jpg}	t	f	Pune	Kothrud	ACTIVE	\N	1300	2026-10-05 09:44:07.658
cmuv6m967002guh7sir90ixqr	cmuv6m930000euh7s8dv7t3bf	Whirlpool 7 kg front load washer	appliances	Good	12000	Works well.\n\nReason for selling: Moving.	{/demo/washer.jpg}	t	t	Pune	Karve Nagar	ACTIVE	\N	240	2026-10-04 20:44:07.661
cmuv6m96a002iuh7sja59hxda	cmuv6m930000euh7s8dv7t3bf	Dumbbell set 20 kg with rod	sports	Good	5500	Good.\n\nReason for selling: Gym.	{/demo/dumbbell.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	140	2026-10-05 01:44:07.664
cmuv6m96c002kuh7sqw4tq8em	cmuv6m92s000cuh7sxusr9e11	Sony A7 III body only	cameras	Excellent	98000	Shutter 21k.\n\nReason for selling: Upgraded to A7 IV.	{/demo/camera-retro.jpg,/demo/mirrorless.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	880	2026-10-05 06:44:07.667
cmuv6m96f002muh7se0ipg1py	cmuv6m92s000cuh7sxusr9e11	Mi 43" 4K Android TV	electronics	Good	16000	Fine.\n\nReason for selling: Upgrade.	{/demo/tv.jpg,/demo/tv-2.jpg}	t	t	Hyderabad	Kondapur	ACTIVE	\N	300	2026-10-04 15:44:07.669
cmuv6m96i002ouh7spy1czbhh	cmuv6m92s000cuh7sxusr9e11	Bosch cordless drill 12V	tools	Excellent	2100	Two batteries.\n\nReason for selling: Done with DIY.	{/demo/drill-2.jpg,/demo/drill.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	90	2026-10-05 05:04:07.672
cmuv6m953001ouh7sjgfmhyuw	cmuv6m91y0005uh7sne9aexuo	boAt Airdopes 141 — sealed box	electronics	Like New	1299	Sealed box, brand warranty 1 year from activation.\n\nReason for selling: Received as a gift, already have a pair.	{/demo/earbuds.jpg,/demo/earbuds-2.jpg}	t	t	Noida	Sector 50	SOLD	\N	94	2026-10-05 10:44:07.621
cmuv6m984003iuh7sgee95yx2	cmuv6m91l0004uh7sn0nii9u7	Canon EF-S 55–250mm lens	cameras	Good	9800	Canon EF-S 55–250mm lens in good condition.	{/demo/camera-kit.jpg,/demo/lens.jpg}	t	t	Noida	Sector 18	SOLD	\N	0	2026-08-11 11:44:07.73
cmuv6m98g003quh7sag6nc2mn	cmuv6m91l0004uh7sn0nii9u7	GoPro Hero 9	cameras	Good	14500	GoPro Hero 9 in good condition.	{/demo/dslr-2.jpg,/demo/camera-kit.jpg,/demo/dslr.jpg}	t	t	Noida	Sector 18	SOLD	\N	0	2026-07-27 11:44:07.742
cmuv6m96n002suh7sqc9sau2z	cmuv6m91y0005uh7sne9aexuo	iPhone 14 Pro — ₹9,999 only!!	mobiles	Like New	9999	Urgent sale, brand new condition, no bill. Pay advance to book.	{/demo/iphone-2.jpg,/demo/phone.jpg,/demo/iphone.jpg}	t	t	Noida	Sector 50	PENDING_REVIEW	\N	0	2026-10-05 11:14:07.677
cmv51tc8z000puhm8c88f2ydn	cmv51tc8v000luhm8gy1nhadz	SG cricket kit with English willow bat	sports	Excellent	6500	Full kit: bat, pads, gloves, helmet and kit bag. Bat knocked in and oiled.	{/demo/cricket.jpg}	t	t	Noida	Sector 137	ACTIVE	\N	220	2026-10-10 21:01:21.923
cmv51tc92000ruhm8rz75hrgr	cmv51tc8v000luhm8gy1nhadz	Adjustable dumbbells 2 × 20 kg	sports	Good	6800	Home gym clear-out. Plates have some rust spots on the edges, everything locks properly.	{/demo/dumbbell.jpg}	t	f	Noida	Sector 137	ACTIVE	\N	273	2026-10-10 09:48:21.925
cmv51tc96000vuhm89fo031nq	cmv51tc8v000luhm8gy1nhadz	Yoga mat and resistance band set	sports	Good	1200	Yoga mat and resistance band set in good condition.	{/demo/dumbbell.jpg}	t	t	Noida	Sector 137	SOLD	\N	0	2026-09-14 09:27:21.929
cmv51tc9j0014uhm855hup7eb	cmv51tc9h0012uhm848ampvfo	6-seater dining table set, solid wood	furniture	Excellent	24000	Sheesham wood table with six cushioned chairs. No wobble, no cracks. Buyer arranges transport.	{/demo/dining.jpg,/demo/dining-2.jpg}	t	f	Noida	Sector 74	ACTIVE	\N	204	2026-10-11 01:14:21.943
cmv51tc9m0016uhm8jqalvnfr	cmv51tc9h0012uhm848ampvfo	Tall wooden bookshelf, 5 shelves	furniture	Good	5500	Sturdy and can be disassembled for transport. A couple of small marks on one side panel.	{/demo/bookshelf.jpg}	t	f	Noida	Sector 74	ACTIVE	\N	257	2026-10-10 14:01:21.945
cmv51tc9s0018uhm8jlw58nmb	cmv51tc9h0012uhm848ampvfo	Designer leather handbag, red	fashion	Like New	4500	Gifted, used for one wedding. Dust bag included.	{/demo/handbag.jpg}	t	t	Noida	Sector 74	ACTIVE	\N	310	2026-10-10 02:48:21.951
cmv51tc9z001auhm8n8pylztd	cmv51tc9h0012uhm848ampvfo	Samsung 253 L double-door fridge, mint	appliances	Good	13500	Cools perfectly. Selling because we got a larger one. 4 years old.	{/demo/fridge.jpg}	t	f	Noida	Sector 74	ACTIVE	\N	363	2026-10-09 15:35:21.958
cmv51tca6001cuhm810zf02m4	cmv51tc9h0012uhm848ampvfo	Accent lounge chair	furniture	Good	6000	Accent lounge chair in good condition.	{/demo/lounge-chair.jpg}	t	t	Noida	Sector 74	SOLD	\N	0	2026-09-09 09:27:21.965
cmv51tcbg001luhm82s8l8qxq	cmv51tcb7001juhm86jt72j5y	NCERT + reference books, Class 9–12 (40 books)	books	Good	2200	Physics, Chemistry, Maths and Biology with RD Sharma and HC Verma. Some pencil notes inside.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Delhi	Dwarka	ACTIVE	\N	241	2026-10-10 18:14:22.01
cmv51tcbo001nuhm8m75gzje6	cmv51tcb7001juhm86jt72j5y	Study desk with drawer	furniture	Good	4200	Engineered wood, fits in a small room. A few marks on the top.	{/demo/desk.jpg}	t	f	Delhi	Dwarka	ACTIVE	\N	294	2026-10-10 07:01:22.018
cmv51tcbw001puhm8m6d65pmd	cmv51tcb7001juhm86jt72j5y	Acoustic guitar with bag and capo	other	Excellent	5200	Yamaha F310. New strings fitted last month. Great for beginners.	{/demo/guitar.jpg}	t	t	Delhi	Dwarka	ACTIVE	\N	347	2026-10-09 19:48:22.026
cmv51tcc4001ruhm8e5ihr0r6	cmv51tcb7001juhm86jt72j5y	Philips mixer / blender jar set	appliances	Good	1800	All three jars included. Motor runs smoothly.	{/demo/blender.jpg}	t	t	Delhi	Dwarka	ACTIVE	\N	400	2026-10-09 08:35:22.035
cmv51tccc001tuhm8ckog8mem	cmv51tcb7001juhm86jt72j5y	Kids bicycle, 20 inch	sports	Good	2500	Kids bicycle, 20 inch in good condition.	{/demo/bicycle.jpg}	t	t	Delhi	Dwarka	SOLD	\N	0	2026-09-04 09:27:22.042
cmv51tcds0024uhm8y5o0z2yg	cmv51tcdc0020uhm89xbrvius	KTM RC 200 (2020), 21,000 km	vehicles	Good	128000	New tyres at 18,000 km. Minor scratch on the left fairing. All papers clear.	{/demo/ktm.jpg,/demo/sportbike.jpg}	t	f	Delhi	Rohini	ACTIVE	\N	331	2026-10-10 00:01:22.095
cmv51tcdy0026uhm8ma4j53hu	cmv51tcdc0020uhm89xbrvius	Bosch toolkit — 46 pieces	tools	Like New	2800	Used for two bike jobs. Every piece present.	{/demo/toolkit.jpg}	t	t	Delhi	Rohini	ACTIVE	\N	384	2026-10-09 12:48:22.101
cmv51tce30028uhm88giv42d4	cmv51tcdc0020uhm89xbrvius	Royal Enfield riding jacket	fashion	Good	3500	Royal Enfield riding jacket in good condition.	{/demo/jacket.jpg}	t	t	Delhi	Rohini	SOLD	\N	0	2026-08-30 09:27:22.106
cmv51tcen002huhm8hq0z8j7s	cmv51tcek002fuhm8bc53jn6p	Samsung Galaxy S21 FE 128 GB	mobiles	Excellent	21500	Battery replaced at a Samsung service centre. Comes with a new case and charger.	{/demo/android.jpg,/demo/phone.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	315	2026-10-10 04:14:22.126
cmv51tceq002juhm864l34kkd	cmv51tcek002fuhm8bc53jn6p	Dell 24" IPS monitor, Full HD	electronics	Good	7500	No dead pixels. HDMI cable included.	{/demo/monitor.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	368	2026-10-09 17:01:22.129
cmv51tces002luhm8vwxf0iv0	cmv51tcek002fuhm8bc53jn6p	iPhone 12 64 GB, Black	mobiles	Good	26000	Battery health 84%. Face ID works. Small dent on the frame corner.	{/demo/iphone-2.jpg,/demo/iphone.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	421	2026-10-09 05:48:22.132
cmv51tcev002nuhm8eqwztxf6	cmv51tcek002fuhm8bc53jn6p	Lenovo IdeaPad Slim 3, Ryzen 5, 8 GB / 512 GB	laptops	Excellent	31000	Fresh Windows 11 install. Charger included, 1 year old.	{/demo/laptop.jpg,/demo/laptop-2.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	74	2026-10-08 18:35:22.134
cmv51tcey002puhm85syzeicj	cmv51tcek002fuhm8bc53jn6p	Redmi Note 11 64 GB	mobiles	Good	7500	Redmi Note 11 64 GB in good condition.	{/demo/phone.jpg}	t	t	Delhi	Karol Bagh	SOLD	\N	0	2026-08-25 09:27:22.137
cmv51tcfe002yuhm83mbbp82i	cmv51tcfc002wuhm8kcykhz7c	3-seater velvet sofa, emerald green	furniture	Like New	18500	Bought 8 months ago from Urban Ladder. No stains, no pets.	{/demo/sofa.jpg,/demo/sofa-2.jpg}	t	f	Ghaziabad	Indirapuram	ACTIVE	\N	352	2026-10-09 21:14:22.153
cmv51tcfh0030uhm8elit29sj	cmv51tcfc002wuhm8kcykhz7c	LG 32" smart TV	electronics	Good	9000	Netflix, YouTube and Prime work fine. Remote and wall mount included.	{/demo/tv-2.jpg,/demo/tv.jpg}	t	f	Ghaziabad	Indirapuram	ACTIVE	\N	405	2026-10-09 10:01:22.156
cmv51tcfj0032uhm8vj3yldk5	cmv51tcfc002wuhm8kcykhz7c	Morphy Richards OTG oven, 28 L	appliances	Excellent	4200	Used for baking a few times a month. Trays and rack included.	{/demo/oven.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	58	2026-10-08 22:48:22.159
cmv51tcfm0034uhm8ly83ibz5	cmv51tcfc002wuhm8kcykhz7c	White running shoes, size 7	fashion	Like New	2200	Wrong size, worn indoors twice.	{/demo/sneakers-2.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	111	2026-10-08 11:35:22.161
cmv51tcfp0036uhm87p007w5t	cmv51tcfc002wuhm8kcykhz7c	Samsung microwave 20 L	appliances	Good	3200	Samsung microwave 20 L in good condition.	{/demo/microwave.jpg}	t	t	Ghaziabad	Indirapuram	SOLD	\N	0	2026-08-20 09:27:22.164
cmv51tc94000tuhm8vumk98rw	cmv51tc8v000luhm8gy1nhadz	Black sports sunglasses, polarised	fashion	Like New	1800	Worn twice. Comes with the case and cleaning cloth.	{/demo/sunglasses-2.jpg}	t	t	Noida	Sector 137	SOLD	\N	327	2026-10-09 22:35:21.927
cmv51tcg2003fuhm8ekhvgcpw	cmv51tcg0003duhm8civbu6c6	DeWalt 18V cordless drill with 2 batteries	tools	Excellent	7800	Very light use. Both batteries hold full charge. Case included.	{/demo/drill.jpg,/demo/drill-2.jpg}	t	t	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	389	2026-10-09 14:14:22.177
cmv51tcg4003huhm8d7nzze4h	cmv51tcg0003duhm8civbu6c6	Hand tool set — pliers, screwdrivers, wrenches	tools	Good	1500	Assorted 30+ tools, all in working condition.	{/demo/toolkit.jpg}	t	t	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	42	2026-10-09 03:01:22.179
cmv51tcg6003juhm8q80y6pat	cmv51tcg0003duhm8civbu6c6	Revolt RV400 electric motorcycle (2022)	vehicles	Good	78000	Range about 120 km per charge. Charger and papers included.	{/demo/ebike.jpg}	t	f	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	95	2026-10-08 15:48:22.182
cmv51tcg9003luhm80yxs2owp	cmv51tcg0003duhm8civbu6c6	Bosch angle grinder	tools	Good	2400	Bosch angle grinder in good condition.	{/demo/drill-2.jpg}	t	t	Ghaziabad	Raj Nagar Extension	SOLD	\N	0	2026-09-24 09:27:22.184
cmv51tcgl003uuhm82qxocnup	cmv51tcgj003suhm8hl3ylyak	PS5 Disc Edition + 2 DualSense controllers	gaming	Excellent	38000	Includes Spider-Man 2 and GT7 discs. Always used on a stand with good airflow.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Gurgaon	Golf Course Road	ACTIVE	\N	426	2026-10-09 07:14:22.196
cmv51tcgn003wuhm8w89i1kj2	cmv51tcgj003suhm8hl3ylyak	Custom gaming PC — Ryzen 7, RTX 3070	gaming	Excellent	82000	32 GB RAM, 1 TB NVMe, 750 W Gold PSU. Stress-tested before handover.	{/demo/gamingpc.jpg,/demo/gaming-setup.jpg}	t	f	Gurgaon	Golf Course Road	ACTIVE	\N	79	2026-10-08 20:01:22.199
cmv51tcgq003yuhm8dbjqii9k	cmv51tcgj003suhm8hl3ylyak	MacBook Pro 13" M2, 8 GB / 256 GB	laptops	Like New	92000	42 battery cycles. AppleCare until next year. Box and charger included.	{/demo/macbook.jpg,/demo/macbook-2.jpg}	t	t	Gurgaon	Golf Course Road	ACTIVE	\N	132	2026-10-12 08:48:22.201
cmv51tcgt0040uhm8nu9txwsm	cmv51tcgj003suhm8hl3ylyak	iMac 24" M1, Blue	electronics	Excellent	88000	Magic keyboard and mouse included. No scratches.	{/demo/imac.jpg}	t	f	Gurgaon	Golf Course Road	ACTIVE	\N	185	2026-10-11 21:35:22.204
cmv51tcgw0042uhm8d4ks93wf	cmv51tcgj003suhm8hl3ylyak	Xbox wireless controller	gaming	Good	3200	Xbox wireless controller in good condition.	{/demo/controller.jpg}	t	t	Gurgaon	Golf Course Road	SOLD	\N	0	2026-09-19 09:27:22.207
cmv51tch9004buhm87fxe1rwd	cmv51tch60049uhm8kwvp1g5f	Quilted leather sling bag, black	fashion	Excellent	12500	Authentic, with purchase receipt. Gold hardware has no fading.	{/demo/handbag-2.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	63	2026-10-09 00:14:22.22
cmv51tchc004duhm8c5vyy63i	cmv51tch60049uhm8kwvp1g5f	Red running shoes, size 6	fashion	Like New	2900	Worn for one 5K run.	{/demo/sneakers.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	116	2026-10-08 13:01:22.223
cmv51tche004fuhm8jps7sb83	cmv51tch60049uhm8kwvp1g5f	Round gold-frame sunglasses	fashion	Good	1400	Light scratches on the case, lenses are perfect.	{/demo/sunglasses.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	169	2026-10-12 01:48:22.226
cmv51tchh004huhm8sxbf05zl	cmv51tch60049uhm8kwvp1g5f	Fossil analog watch, white strap	fashion	Good	3500	New battery fitted. Strap shows light wear.	{/demo/watch.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	222	2026-10-11 14:35:22.228
cmv51tchl004juhm8w7mdmq9o	cmv51tch60049uhm8kwvp1g5f	Biker leather jacket, size S	fashion	Good	4500	Biker leather jacket, size S in good condition.	{/demo/jacket.jpg}	t	t	Gurgaon	Sohna Road	SOLD	\N	0	2026-09-14 09:27:22.231
cmv51tci0004suhm89582v87e	cmv51tchx004quhm8o1c09yoo	Canon EOS 90D body + 18–135 mm lens	cameras	Excellent	78000	Shutter count around 14,000. Two batteries and a 64 GB card included.	{/demo/dslr-2.jpg,/demo/dslr.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	100	2026-10-08 17:14:22.247
cmv51tci3004uuhm8hkdxk72v	cmv51tchx004quhm8o1c09yoo	Sigma 18–35 mm f/1.8 Art lens (Canon mount)	cameras	Excellent	39000	Sharp, no fungus or haze. Front and rear caps plus hood.	{/demo/lens.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	153	2026-10-12 06:01:22.25
cmv51tci5004wuhm8hvb8yj99	cmv51tchx004quhm8o1c09yoo	Fujifilm X100V, silver	cameras	Like New	115000	Under 3,000 shots. Thumb grip and leather half-case included.	{/demo/camera-retro.jpg,/demo/mirrorless.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	206	2026-10-11 18:48:22.252
cmv51tci8004yuhm8ljewwl0o	cmv51tchx004quhm8o1c09yoo	Sony a6000 kit	cameras	Good	28000	Sony a6000 kit in good condition.	{/demo/camera-kit.jpg}	t	t	Mumbai	Bandra	SOLD	\N	0	2026-09-09 09:27:22.255
cmv51tcil0057uhm8g0nb0a06	cmv51tcij0055uhm8dwq91l9x	Engineering + GATE reference books (25)	books	Good	3000	Made Easy, Kreyszig, Cormen and more. Some highlighting.	{/demo/books.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	137	2026-10-08 10:14:22.268
cmv51tcio0059uhm8munib3c6	cmv51tcij0055uhm8dwq91l9x	Bose SoundLink headphones	electronics	Good	6500	Ear cushions replaced recently. Battery lasts about 12 hours.	{/demo/headphones-2.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	190	2026-10-11 23:01:22.271
cmv51tciq005buhm86minznnx	cmv51tcij0055uhm8dwq91l9x	Ergonomic study set — desk + chair	furniture	Excellent	9800	Height-adjustable chair with lumbar support and a white study desk.	{/demo/office-setup.jpg,/demo/desk.jpg}	t	f	Mumbai	Powai	ACTIVE	\N	243	2026-10-11 11:48:22.273
cmv51tcis005duhm8hg1ky4et	cmv51tcij0055uhm8dwq91l9x	iPad 9th gen 64 GB with Apple Pencil	electronics	Good	22000	Great for notes. Pencil (1st gen) included.	{/demo/tablet-2.jpg,/demo/tablet.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	296	2026-10-11 00:35:22.275
cmv51tciu005fuhm8ackywwgk	cmv51tcij0055uhm8dwq91l9x	Kindle Paperwhite	electronics	Good	6500	Kindle Paperwhite in good condition.	{/demo/tablet.jpg}	t	t	Mumbai	Powai	SOLD	\N	0	2026-09-04 09:27:22.277
cmv51tcj8005ouhm80uwy4pzp	cmv51tcj5005muhm8fcscj8o9	Royal Enfield Classic 350, 2021, 15,000 km	vehicles	Excellent	165000	Serviced every 3,000 km. Touring seat and crash guard fitted.	{/demo/motorcycle.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	174	2026-10-12 03:14:22.291
cmv51tcjb005quhm8ywa1n80y	cmv51tcj5005muhm8fcscj8o9	Whirlpool 7 kg front-load washing machine	appliances	Good	11500	Works perfectly. Selling because the new flat has a built-in one.	{/demo/washer.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	227	2026-10-11 16:01:22.294
cmv51tcje005suhm8efpyok65	cmv51tcj5005muhm8fcscj8o9	Nespresso-style espresso machine	appliances	Excellent	7000	Descaled monthly. Milk frother included.	{/demo/coffee.jpg}	t	t	Mumbai	Versova	ACTIVE	\N	280	2026-10-11 04:48:22.297
cmv51tcjg005uuhm8umcl4k99	cmv51tcj5005muhm8fcscj8o9	Riding jacket + gloves	vehicles	Good	2200	Riding jacket + gloves in good condition.	{/demo/jacket.jpg}	t	t	Mumbai	Versova	SOLD	\N	0	2026-08-30 09:27:22.299
cmv51tcjt0063uhm8vmqsf7g0	cmv51tcjr0061uhm81w14fvbq	Dell UltraSharp 27" monitor	electronics	Excellent	18500	USB-C hub monitor, perfect for MacBooks. No dead pixels.	{/demo/monitor.jpg,/demo/imac.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	211	2026-10-11 20:14:22.312
cmv51tcjw0065uhm8qsvesvfn	cmv51tcjr0061uhm81w14fvbq	MacBook Air M1, 8 GB / 256 GB, Gold	laptops	Good	52000	180 battery cycles. One small dent on the bottom corner.	{/demo/macbook-2.jpg,/demo/laptop.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	264	2026-10-11 09:01:22.315
cmv51tcjy0067uhm8q4pldbhc	cmv51tcjr0061uhm81w14fvbq	Ergonomic mesh office chair	furniture	Good	7500	Adjustable arms and headrest. Mesh in perfect condition.	{/demo/office-setup.jpg}	t	f	Bangalore	Whitefield	ACTIVE	\N	317	2026-10-10 21:48:22.317
cmv51tck00069uhm85toduoew	cmv51tcjr0061uhm81w14fvbq	Noise-cancelling earbuds	electronics	Like New	5500	Used for two weeks. All ear tips and case included.	{/demo/earbuds.jpg,/demo/earbuds-2.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	370	2026-10-10 10:35:22.319
cmv51tck2006buhm8kixc14l0	cmv51tcjr0061uhm81w14fvbq	Logitech webcam C920	electronics	Good	3500	Logitech webcam C920 in good condition.	{/demo/imac.jpg}	t	t	Bangalore	Whitefield	SOLD	\N	0	2026-08-25 09:27:22.321
cmv51tckg006kuhm88ofwj1wp	cmv51tcke006iuhm8n33euzeb	Mid-century lounge chair	furniture	Excellent	8500	Swivel base, linen upholstery. No stains.	{/demo/lounge-chair.jpg}	t	f	Bangalore	Koramangala	ACTIVE	\N	248	2026-10-11 13:14:22.336
cmv51tckk006muhm8lfk75lpw	cmv51tcke006iuhm8n33euzeb	White moulded dining chairs (set of 2)	furniture	Like New	3800	Wooden legs, very sturdy.	{/demo/chair.jpg}	t	f	Bangalore	Koramangala	ACTIVE	\N	301	2026-10-11 02:01:22.339
cmv51tckn006ouhm8f67mh59n	cmv51tcke006iuhm8n33euzeb	4-seater dining table, oak finish	furniture	Good	11000	Round table, seats four comfortably. Minor marks on top.	{/demo/dining-2.jpg,/demo/dining.jpg}	t	f	Bangalore	Koramangala	ACTIVE	\N	354	2026-10-10 14:48:22.342
cmv51tckp006quhm8f2ihc76j	cmv51tcke006iuhm8n33euzeb	Gold round sunglasses	fashion	Like New	1600	Barely worn, comes with case.	{/demo/sunglasses.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	407	2026-10-10 03:35:22.345
cmv51tcks006suhm831nqdzsq	cmv51tcke006iuhm8n33euzeb	Fabric 2-seater sofa	furniture	Good	9000	Fabric 2-seater sofa in good condition.	{/demo/sofa-2.jpg}	t	t	Bangalore	Koramangala	SOLD	\N	0	2026-08-20 09:27:22.347
cmv51tcl50071uhm87m65dbrt	cmv51tcl3006zuhm8g2ieril4	Hybrid bicycle, 24-speed, alloy frame	sports	Excellent	16500	Shimano gears, disc brakes. Bottle cage and lights included.	{/demo/bicycle.jpg,/demo/roadbike.jpg}	t	f	Bangalore	HSR Layout	ACTIVE	\N	285	2026-10-11 06:14:22.36
cmv51tcl70073uhm83dl826m8	cmv51tcl3006zuhm8g2ieril4	PS5 Slim Digital + 3 games	gaming	Like New	36500	Bought 4 months ago, warranty valid. Games are digital (account transfer not included).	{/demo/console.jpg,/demo/controller.jpg}	t	t	Bangalore	HSR Layout	ACTIVE	\N	338	2026-10-10 19:01:22.362
cmv51tcl90075uhm8dhvbyc9y	cmv51tcl3006zuhm8g2ieril4	iPhone 13 128 GB, Midnight	mobiles	Excellent	39500	Battery health 89%. Always in a case with a screen guard.	{/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Bangalore	HSR Layout	ACTIVE	\N	391	2026-10-10 07:48:22.364
cmv51tclb0077uhm8x8al6w44	cmv51tcl3006zuhm8g2ieril4	Cricket bat — Kashmir willow	sports	Good	1500	Cricket bat — Kashmir willow in good condition.	{/demo/cricket.jpg}	t	t	Bangalore	HSR Layout	SOLD	\N	0	2026-09-24 09:27:22.366
cmv51tcln007guhm8gg7n3x1w	cmv51tcll007euhm8upawpjlw	Yamaha acoustic guitar F310 + stand	other	Excellent	5800	Recently set up — low action, easy to play. Gig bag included.	{/demo/guitar.jpg}	t	t	Pune	Baner	ACTIVE	\N	322	2026-10-10 23:14:22.378
cmv51tclp007iuhm8qqyjh04z	cmv51tcll007euhm8upawpjlw	Classic novels + self-help book collection (30)	books	Good	1800	Mix of Penguin classics and bestsellers. Good condition.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Pune	Baner	ACTIVE	\N	375	2026-10-10 12:01:22.38
cmv51tclr007kuhm8tynk9qdz	cmv51tcll007euhm8upawpjlw	Sony over-ear headphones, yellow edition	electronics	Good	3800	Great bass. Cushions slightly worn.	{/demo/headphones.jpg}	t	t	Pune	Baner	ACTIVE	\N	428	2026-10-10 00:48:22.382
cmv51tclt007muhm85ti35dkx	cmv51tcll007euhm8upawpjlw	Bluetooth speaker	electronics	Good	2800	Bluetooth speaker in good condition.	{/demo/headphones.jpg}	t	t	Pune	Baner	SOLD	\N	0	2026-09-19 09:27:22.384
cmv51tcm4007vuhm8ioz2bnwc	cmv51tcm2007tuhm8j5ky6d21	Yamaha R15 V3 (2019), 26,000 km	vehicles	Good	112000	Second owner, papers clear. New chain set at 24,000 km.	{/demo/sportbike.jpg,/demo/ktm.jpg}	t	f	Pune	Viman Nagar	ACTIVE	\N	359	2026-10-10 16:14:22.395
cmv51tcm6007xuhm8032l50rd	cmv51tcm2007tuhm8j5ky6d21	Cordless drill + bit set	tools	Good	3200	12 V drill with 2 batteries and 30 bits.	{/demo/drill-2.jpg,/demo/toolkit.jpg}	t	t	Pune	Viman Nagar	ACTIVE	\N	412	2026-10-10 05:01:22.397
cmv51tcm9007zuhm8gl4zj2z1	cmv51tcm2007tuhm8j5ky6d21	IFB 25 L convection microwave	appliances	Excellent	7200	All modes work. Glass tray and grill rack included.	{/demo/microwave.jpg,/demo/oven.jpg}	t	t	Pune	Viman Nagar	ACTIVE	\N	65	2026-10-09 17:48:22.4
cmv51tcmb0081uhm8rohiisvv	cmv51tcm2007tuhm8j5ky6d21	LG 43" 4K smart TV	electronics	Good	19500	webOS, Magic Remote included. Stand legs plus wall mount.	{/demo/tv.jpg,/demo/tv-2.jpg}	t	f	Pune	Viman Nagar	ACTIVE	\N	118	2026-10-09 06:35:22.402
cmv51tcme0083uhm8tk4wq3ws	cmv51tcm2007tuhm8j5ky6d21	Bosch tool kit	tools	Good	1900	Bosch tool kit in good condition.	{/demo/toolkit.jpg}	t	t	Pune	Viman Nagar	SOLD	\N	0	2026-09-14 09:27:22.405
cmv51tcmq008cuhm8p9uutges	cmv51tcmo008auhm8d4bvpab3	Samsung Galaxy S22 128 GB	mobiles	Excellent	32000	No scratches, always used with a case. Box and charger included.	{/demo/android.jpg,/demo/phone.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	396	2026-10-10 09:14:22.418
cmv51tcmt008euhm8ocavk6fv	cmv51tcmo008auhm8d4bvpab3	HP Pavilion laptop, i5 11th gen, 16 GB	laptops	Good	38000	Battery backup about 4 hours. Small wear on the palm rest.	{/demo/laptop-2.jpg,/demo/laptop.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	49	2026-10-09 22:01:22.42
cmv51tcmv008guhm8utrx7i9r	cmv51tcmo008auhm8d4bvpab3	Mixer grinder + blender combo	appliances	Like New	3200	Used a handful of times. All jars and lids included.	{/demo/blender.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	102	2026-10-09 10:48:22.422
cmv51tcmy008iuhm8ctmmdl3l	cmv51tcmo008auhm8d4bvpab3	Samsung 23 L microwave	appliances	Good	4000	Heats evenly, door seal is perfect.	{/demo/microwave.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	155	2026-10-08 23:35:22.425
cmv51tcn1008kuhm8ape6rn5d	cmv51tcmo008auhm8d4bvpab3	Apple Watch SE	electronics	Good	14000	Apple Watch SE in good condition.	{/demo/smartwatch.jpg}	t	t	Hyderabad	Madhapur	SOLD	\N	0	2026-09-09 09:27:22.428
cmv51tcnj008tuhm8ex684ddb	cmv51tcnf008ruhm8sk15hj8c	Dumbbell set 30 kg with rods	sports	Good	4800	Chrome rods and rubber-coated plates.	{/demo/dumbbell.jpg}	t	f	Hyderabad	Kondapur	ACTIVE	\N	433	2026-10-10 02:14:22.446
cmv51tdok00wsuhm88nu8rky1	cmv51tdo900wmuhm8k2isgtds	Aviator sunglasses, gold frame	fashion	Good	1900	Lenses scratch-free. Case included.	{/demo/sunglasses.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	248	2026-10-08 12:48:23.779
cmv51tcnm008vuhm8325l2yw2	cmv51tcnf008ruhm8sk15hj8c	Gaming PC — i5 12400F, RTX 3060	gaming	Excellent	64000	RGB case, 16 GB RAM, 1 TB SSD. Runs every current game at 1080p high.	{/demo/gaming-setup.jpg,/demo/gamingpc.jpg}	t	f	Hyderabad	Kondapur	ACTIVE	\N	86	2026-10-09 15:01:22.449
cmv51tcnp008xuhm8331324vk	cmv51tcnf008ruhm8sk15hj8c	Nike running shoes, size 9	fashion	Good	2600	Used for about 200 km, plenty of life left.	{/demo/sneakers.jpg,/demo/sneakers-2.jpg}	t	t	Hyderabad	Kondapur	ACTIVE	\N	139	2026-10-09 03:48:22.452
cmv51tcnr008zuhm899x5b8z1	cmv51tcnf008ruhm8sk15hj8c	PS4 controller	gaming	Good	2200	PS4 controller in good condition.	{/demo/controller.jpg}	t	t	Hyderabad	Kondapur	SOLD	\N	0	2026-09-04 09:27:22.454
cmv51tco50098uhm8ytt1xrce	cmv51tco20096uhm83ziqhjzl	iPhone 14 128 GB, Midnight	mobiles	Excellent	52000	Battery health 91%. Apple warranty till February.	{/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Jaipur	Vaishali Nagar	ACTIVE	\N	70	2026-10-09 19:14:22.468
cmv51tco7009auhm8k1h6zt0g	cmv51tco20096uhm83ziqhjzl	Dell Inspiron 15, i7, 16 GB / 512 GB	laptops	Good	41000	Ideal for students. New battery fitted in March.	{/demo/laptop.jpg,/demo/laptop-2.jpg}	t	t	Jaipur	Vaishali Nagar	ACTIVE	\N	123	2026-10-09 08:01:22.47
cmv51tcoa009cuhm8oawea02p	cmv51tco20096uhm83ziqhjzl	Sony 43" Bravia 4K TV	electronics	Excellent	28000	Google TV, Dolby Vision. 2 years old with bill.	{/demo/tv-2.jpg,/demo/tv.jpg}	t	f	Jaipur	Vaishali Nagar	ACTIVE	\N	176	2026-10-08 20:48:22.473
cmv51tcoc009euhm89dnbf8st	cmv51tco20096uhm83ziqhjzl	KTM Duke 250 (2021), 11,000 km	vehicles	Excellent	165000	Single owner, all services on time at KTM Jaipur. Insurance valid.	{/demo/ktm.jpg,/demo/sportbike.jpg}	t	f	Jaipur	Vaishali Nagar	ACTIVE	\N	229	2026-10-08 09:35:22.475
cmv51tcoe009guhm8z7745rxe	cmv51tco20096uhm83ziqhjzl	Realme Buds Air	electronics	Good	1800	Realme Buds Air in good condition.	{/demo/earbuds.jpg}	t	t	Jaipur	Vaishali Nagar	SOLD	\N	0	2026-08-30 09:27:22.477
cmv51tcor009puhm8girahwo7	cmv51tcoo009nuhm8ipomqjvq	Handcrafted sheesham bookshelf	furniture	Excellent	9500	Jaipur-made, solid wood with brass handles.	{/demo/bookshelf.jpg}	t	f	Jaipur	C-Scheme	ACTIVE	\N	107	2026-10-09 12:14:22.49
cmv51tcot009ruhm8p9umgkm1	cmv51tcoo009nuhm8ipomqjvq	L-shaped sofa, grey with cushions	furniture	Good	21000	Five-seater with five cushions. Covers are washable.	{/demo/sofa-2.jpg,/demo/sofa.jpg}	t	f	Jaipur	C-Scheme	ACTIVE	\N	160	2026-10-09 01:01:22.493
cmv51tcow009tuhm827x97ql9	cmv51tcoo009nuhm8ipomqjvq	Leather handbag, red	fashion	Excellent	3800	Genuine leather, used occasionally.	{/demo/handbag.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	213	2026-10-08 13:48:22.495
cmv51tcoy009vuhm8618s5wlc	cmv51tcoo009nuhm8ipomqjvq	Retro accent chair	furniture	Like New	5600	Display piece from a staging project, never used daily.	{/demo/lounge-chair.jpg,/demo/chair.jpg}	t	f	Jaipur	C-Scheme	ACTIVE	\N	266	2026-10-12 02:35:22.498
cmv51tcp1009xuhm88ccjxk19	cmv51tcoo009nuhm8ipomqjvq	Dining chairs set of 4	furniture	Good	7200	Dining chairs set of 4 in good condition.	{/demo/chair.jpg}	t	t	Jaipur	C-Scheme	SOLD	\N	0	2026-08-25 09:27:22.5
cmv51tcpe00a6uhm8lwvauoik	cmv51tcpc00a4uhm8oc5qxijn	MacBook Air M1 8/256 GB, Space Grey	laptops	Excellent	49500	Around 150 battery cycles. No dents. Charger and box included.	{/demo/macbook.jpg,/demo/macbook-2.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	144	2026-10-09 05:14:22.514
cmv51tcph00a8uhm8n26svb0u	cmv51tcpc00a4uhm8oc5qxijn	Lenovo ThinkPad E14, i5, 16 GB	laptops	Good	31500	Business laptop, great keyboard. Battery lasts about 5 hours.	{/demo/laptop.jpg,/demo/laptop-2.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	197	2026-10-08 18:01:22.516
cmv51tcpj00aauhm8uepp0hf1	cmv51tcpc00a4uhm8oc5qxijn	iPad 10th gen 64 GB, Wi-Fi	electronics	Like New	29000	Used for streaming and notes. Folio case included.	{/demo/tablet.jpg,/demo/tablet-2.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	250	2026-10-12 06:48:22.518
cmv51tcpm00acuhm88p53deoz	cmv51tcpc00a4uhm8oc5qxijn	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Noida	Sector 18	SOLD	\N	0	2026-08-20 09:27:22.521
cmv51tcq000aluhm84tle7vgf	cmv51tcpy00ajuhm8emqmn0z2	Quilted sling bag, black	fashion	Like New	4500	Used for two events. Chain strap included.	{/demo/handbag-2.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	181	2026-10-08 22:14:22.535
cmv51tcq300anuhm8vsw53n2j	cmv51tcpy00ajuhm8emqmn0z2	Analog wristwatch, steel strap	fashion	Excellent	4900	New battery fitted. Box and warranty card included.	{/demo/watch.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	234	2026-10-08 11:01:22.538
cmv51tcq600apuhm8jr8ys8u3	cmv51tcpy00ajuhm8emqmn0z2	White sneakers, size 7	fashion	Like New	2400	Worn twice, wrong size.	{/demo/sneakers-2.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	287	2026-10-11 23:48:22.541
cmv51tcq800aruhm8kxeh687m	cmv51tcpy00ajuhm8emqmn0z2	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Noida	Sector 18	SOLD	\N	0	2026-09-24 09:27:22.543
cmv51tcqo00b0uhm8du9lsh8q	cmv51tcqk00ayuhm8ofjcpehc	Canon 50 mm f/1.8 STM prime lens	cameras	Excellent	8300	Clean glass, no haze. Caps and pouch included.	{/demo/lens.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	218	2026-10-08 15:14:22.559
cmv51tcqr00b2uhm8unavdrgh	cmv51tcqk00ayuhm8ofjcpehc	Vintage film camera (working)	cameras	Good	6000	Light meter works, tested with a roll last month.	{/demo/camera-retro.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	271	2026-10-12 04:01:22.562
cmv51tcqu00b4uhm8y3ihhrd5	cmv51tcqk00ayuhm8ofjcpehc	Nikon D5600 with 18–55 mm VR lens	cameras	Excellent	34000	Shutter count about 9,000. Two batteries, charger and a 64 GB card.	{/demo/dslr.jpg,/demo/dslr-2.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	324	2026-10-11 16:48:22.565
cmv51tcqw00b6uhm8tt559ko0	cmv51tcqk00ayuhm8ofjcpehc	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Noida	Sector 18	SOLD	\N	0	2026-09-19 09:27:22.568
cmv51tcr900bfuhm8e16nfmir	cmv51tcr700bduhm8j50zp6hr	Cricket kit — bat, pads, gloves, helmet	sports	Good	4000	Full kit in a wheeled bag. Bat oiled and knocked in.	{/demo/cricket.jpg}	t	t	Noida	Sector 50	ACTIVE	\N	255	2026-10-12 08:14:22.58
cmv51tcrb00bhuhm8lgdzdmpv	cmv51tcr700bduhm8j50zp6hr	Sports sunglasses, polarised	fashion	Excellent	1500	Wrap-around frame, case included.	{/demo/sunglasses-2.jpg}	t	t	Noida	Sector 50	ACTIVE	\N	308	2026-10-11 21:01:22.582
cmv51tcrd00bjuhm8lx25bbeb	cmv51tcr700bduhm8j50zp6hr	Road bike, aluminium frame, size M	sports	Excellent	22500	Shimano Claris groupset. Very light, ridden mostly on weekends.	{/demo/roadbike.jpg}	t	f	Noida	Sector 50	ACTIVE	\N	361	2026-10-11 09:48:22.585
cmv51tcrg00bluhm8ogi4y10k	cmv51tcr700bduhm8j50zp6hr	Cricket bat, English willow	sports	Good	1600	Cricket bat, English willow in good condition.	{/demo/cricket.jpg}	t	t	Noida	Sector 50	SOLD	\N	0	2026-09-14 09:27:22.587
cmv51tcrv00buuhm8vtliy1vo	cmv51tcrs00bsuhm8c5q9kc1i	Redmi Note 13 Pro, 8/256 GB	mobiles	Excellent	17000	Bought as a backup phone, barely used. Box and bill included.	{/demo/android.jpg}	t	t	Noida	Sector 50	ACTIVE	\N	292	2026-10-12 01:14:22.602
cmv51tcrx00bwuhm8iizzltbd	cmv51tcrs00bsuhm8c5q9kc1i	Smartwatch with AMOLED display	electronics	Excellent	5500	Heart rate, SpO2 and GPS. Two straps included.	{/demo/smartwatch.jpg}	t	t	Noida	Sector 50	ACTIVE	\N	345	2026-10-11 14:01:22.604
cmv51tcs000byuhm8rlwsm3dj	cmv51tcrs00bsuhm8c5q9kc1i	OnePlus 11R 5G, 8/128 GB	mobiles	Good	19500	Minor scuffs on the frame. Charger and original case included.	{/demo/android.jpg,/demo/phone.jpg}	t	t	Noida	Sector 50	ACTIVE	\N	398	2026-10-11 02:48:22.607
cmv51tcs200c0uhm8ps04cj6h	cmv51tcrs00bsuhm8c5q9kc1i	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Noida	Sector 50	SOLD	\N	0	2026-09-09 09:27:22.609
cmv51tcsg00c9uhm84d4h3zoh	cmv51tcsd00c7uhm8tmo56vlo	Drip coffee maker with carafe	appliances	Like New	3200	Used a handful of times. Reusable filter included.	{/demo/coffee.jpg}	t	t	Noida	Sector 61	ACTIVE	\N	329	2026-10-11 18:14:22.623
cmv51tcsi00cbuhm8ajvdc85k	cmv51tcsd00c7uhm8tmo56vlo	LG 260 L frost-free double-door fridge	appliances	Good	15000	Cools well, no noise. Five years old.	{/demo/fridge.jpg}	t	f	Noida	Sector 61	ACTIVE	\N	382	2026-10-11 07:01:22.625
cmv51tcsk00cduhm8ol10ixpc	cmv51tcsd00c7uhm8tmo56vlo	Samsung 28 L convection microwave	appliances	Excellent	8100	Convection, grill and solo modes all work.	{/demo/microwave.jpg,/demo/oven.jpg}	t	t	Noida	Sector 61	ACTIVE	\N	435	2026-10-10 19:48:22.627
cmv51tcsn00cfuhm8vsdbvdgn	cmv51tcsd00c7uhm8tmo56vlo	Toaster oven 12 L	appliances	Good	1800	Toaster oven 12 L in good condition.	{/demo/oven.jpg}	t	t	Noida	Sector 61	SOLD	\N	0	2026-09-04 09:27:22.63
cmv51tct000couhm8acjbn41h	cmv51tcsx00cmuhm8hznxusn2	Impact drill 650 W with bits	tools	Good	2400	Works on concrete and wood. 15 bits included.	{/demo/drill-2.jpg}	t	t	Noida	Sector 61	ACTIVE	\N	366	2026-10-11 11:14:22.643
cmv51tct200cquhm8mr2wb6lq	cmv51tcsx00cmuhm8hznxusn2	Workbench study desk, solid wood	furniture	Good	5800	Heavy and sturdy, great for a workshop or study.	{/demo/desk.jpg}	t	f	Noida	Sector 61	ACTIVE	\N	419	2026-10-11 00:01:22.645
cmv51tct400csuhm8libg21rk	cmv51tcsx00cmuhm8hznxusn2	Cordless drill driver 18 V, 2 batteries	tools	Excellent	6600	Light use, both batteries hold charge. Case included.	{/demo/drill.jpg,/demo/drill-2.jpg}	t	t	Noida	Sector 61	ACTIVE	\N	72	2026-10-10 12:48:22.647
cmv51tct700cuuhm8qly3446v	cmv51tcsx00cmuhm8hznxusn2	Screwdriver set	tools	Good	700	Screwdriver set in good condition.	{/demo/toolkit.jpg}	t	t	Noida	Sector 61	SOLD	\N	0	2026-08-30 09:27:22.65
cmv51tctl00d3uhm85ij426pi	cmv51tcti00d1uhm8xkgp5mta	3-seater fabric sofa, beige	furniture	Good	15500	Comfortable and sturdy. Covers dry-cleaned last month.	{/demo/sofa.jpg,/demo/sofa-2.jpg}	t	f	Noida	Sector 62	ACTIVE	\N	403	2026-10-11 04:14:22.664
cmv51tctn00d5uhm86fvezvnn	cmv51tcti00d1uhm8xkgp5mta	4-seater dining table with chairs	furniture	Excellent	12500	Glass top with wooden chairs. No wobble.	{/demo/dining.jpg,/demo/dining-2.jpg}	t	f	Noida	Sector 62	ACTIVE	\N	56	2026-10-10 17:01:22.666
cmv51tctq00d7uhm8dx82edo2	cmv51tcti00d1uhm8xkgp5mta	Ergonomic office chair, mesh back	furniture	Excellent	6000	Adjustable height and armrests. Wheels roll smoothly.	{/demo/office-setup.jpg,/demo/chair.jpg}	t	f	Noida	Sector 62	ACTIVE	\N	109	2026-10-10 05:48:22.669
cmv51tcts00d9uhm89jtayoow	cmv51tcti00d1uhm8xkgp5mta	2-seater dining table, sheesham	furniture	Good	3500	2-seater dining table, sheesham in good condition.	{/demo/dining-2.jpg}	t	t	Noida	Sector 62	SOLD	\N	0	2026-08-25 09:27:22.672
cmv51tcu700diuhm8vwirwtax	cmv51tcu500dguhm88atkf6z3	Acoustic guitar with gig bag	other	Excellent	4700	Beginner-friendly, new strings fitted.	{/demo/guitar.jpg}	t	t	Noida	Sector 62	ACTIVE	\N	40	2026-10-10 21:14:22.686
cmv51tcu900dkuhm8t078c767	cmv51tcu500dguhm88atkf6z3	UPSC preparation books set (20)	books	Good	2600	Laxmikanth, Spectrum, NCERTs and more. Some notes in pencil.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Noida	Sector 62	ACTIVE	\N	93	2026-10-10 10:01:22.688
cmv51tcub00dmuhm8doe3c4sj	cmv51tcu500dguhm88atkf6z3	JEE / NEET reference books (15)	books	Good	2000	HC Verma, MS Chouhan and more. Clean pages.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Noida	Sector 62	ACTIVE	\N	146	2026-10-09 22:48:22.69
cmv51tcue00douhm8zzukfz1s	cmv51tcu500dguhm88atkf6z3	Children’s story books set	books	Good	800	Children’s story books set in good condition.	{/demo/books.jpg}	t	t	Noida	Sector 62	SOLD	\N	0	2026-08-20 09:27:22.693
cmv51tcur00dxuhm8v756ntcw	cmv51tcup00dvuhm8ons2j78m	Canon EOS 200D II kit	cameras	Good	34500	Light wear on the grip. Works perfectly, includes bag.	{/demo/camera-kit.jpg,/demo/dslr.jpg}	t	t	Noida	Sector 74	ACTIVE	\N	77	2026-10-10 14:14:22.707
cmv51tcuu00dzuhm8cova78st	cmv51tcup00dvuhm8ons2j78m	Camera bag + tripod + filters kit	cameras	Good	3000	Backpack-style bag, aluminium tripod and UV/CPL filters.	{/demo/camera-kit.jpg}	t	t	Noida	Sector 74	ACTIVE	\N	130	2026-10-10 03:01:22.709
cmv51tcuw00e1uhm8z3yabnkz	cmv51tcup00dvuhm8ons2j78m	Sony a6100 with 16–50 mm kit lens	cameras	Like New	48500	Under 2,500 shots. Box and bill included.	{/demo/mirrorless.jpg,/demo/camera-retro.jpg}	t	t	Noida	Sector 74	ACTIVE	\N	183	2026-10-09 15:48:22.712
cmv51tcuz00e3uhm8wtw1a1x5	cmv51tcup00dvuhm8ons2j78m	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Noida	Sector 74	SOLD	\N	0	2026-09-24 09:27:22.714
cmv51tcvc00ecuhm8uhenuppn	cmv51tcva00eauhm801p8125h	Ather 450X electric scooter (2022)	vehicles	Good	82500	Battery health good, about 90 km per charge. Charger included.	{/demo/ebike.jpg}	t	f	Noida	Sector 74	ACTIVE	\N	114	2026-10-10 07:14:22.727
cmv51tcvf00eeuhm85x8zj9ii	cmv51tcva00eauhm801p8125h	Maruti Swift VXi 2018, petrol, 48,000 km	vehicles	Good	441500	Single owner, all services at Maruti. Insurance valid.	{/demo/car.jpg,/demo/car-2.jpg}	t	f	Noida	Sector 74	ACTIVE	\N	167	2026-10-09 20:01:22.73
cmv51tcvh00eguhm8lmzxufri	cmv51tcva00eauhm801p8125h	Bajaj Pulsar NS200 (2020), 18,000 km	vehicles	Good	92000	New tyres and chain set. All papers in order.	{/demo/sportbike.jpg,/demo/ktm.jpg}	t	f	Noida	Sector 74	ACTIVE	\N	220	2026-10-09 08:48:22.732
cmv51tcvl00eiuhm8wgyusfe7	cmv51tcva00eauhm801p8125h	Bike riding jacket	vehicles	Good	2600	Bike riding jacket in good condition.	{/demo/jacket.jpg}	t	t	Noida	Sector 74	SOLD	\N	0	2026-09-19 09:27:22.735
cmv51tcw000eruhm8692bgd7y	cmv51tcvx00epuhm81f0vvd48	iPad 10th gen 64 GB, Wi-Fi	electronics	Like New	30000	Used for streaming and notes. Folio case included.	{/demo/tablet.jpg,/demo/tablet-2.jpg}	t	t	Noida	Sector 76	ACTIVE	\N	151	2026-10-10 00:14:22.751
cmv51tcw300etuhm81zg59rvt	cmv51tcvx00epuhm81f0vvd48	ASUS Vivobook 15, i3, 8 GB / 512 GB	laptops	Good	25000	Good for college work. Fresh Windows install, charger included.	{/demo/laptop.jpg}	t	t	Noida	Sector 76	ACTIVE	\N	204	2026-10-09 13:01:22.754
cmv51tcw500evuhm8llv7bs9z	cmv51tcvx00epuhm81f0vvd48	HP Victus gaming laptop, Ryzen 5, RTX 3050	laptops	Good	49000	16 GB RAM, 512 GB SSD. Runs cool, keyboard backlight works.	{/demo/laptop-2.jpg,/demo/laptop.jpg}	t	t	Noida	Sector 76	ACTIVE	\N	257	2026-10-09 01:48:22.756
cmv51tcw800exuhm81pkyybej	cmv51tcvx00epuhm81f0vvd48	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Noida	Sector 76	SOLD	\N	0	2026-09-14 09:27:22.759
cmv51tcwo00f6uhm88i2pajez	cmv51tcwl00f4uhm8xd2n2dpo	Leather handbag, tan	fashion	Excellent	4100	Genuine leather with dust bag. No scuffs on corners.	{/demo/handbag.jpg,/demo/handbag-2.jpg}	t	t	Noida	Sector 76	ACTIVE	\N	188	2026-10-09 17:14:22.775
cmv51tcwr00f8uhm8fen11wyq	cmv51tcwl00f4uhm8xd2n2dpo	Biker leather jacket, size M	fashion	Good	4900	Real leather, broken in nicely. All zips work.	{/demo/jacket.jpg}	t	t	Noida	Sector 76	ACTIVE	\N	241	2026-10-09 06:01:22.778
cmv51tcwt00fauhm8zq28q9ei	cmv51tcwl00f4uhm8xd2n2dpo	Aviator sunglasses, gold frame	fashion	Good	1800	Lenses scratch-free. Case included.	{/demo/sunglasses.jpg}	t	t	Noida	Sector 76	ACTIVE	\N	294	2026-10-08 18:48:22.781
cmv51tcww00fcuhm8ps1jmiij	cmv51tcwl00f4uhm8xd2n2dpo	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Noida	Sector 76	SOLD	\N	0	2026-09-09 09:27:22.783
cmv51tcxa00fluhm87adggk8o	cmv51tcx800fjuhm8gtn4c7i7	Smartwatch with AMOLED display	electronics	Excellent	5100	Heart rate, SpO2 and GPS. Two straps included.	{/demo/smartwatch.jpg}	t	t	Noida	Sector 137	ACTIVE	\N	225	2026-10-09 10:14:22.797
cmv51tcxd00fnuhm84vrpzrys	cmv51tcx800fjuhm8gtn4c7i7	OnePlus 11R 5G, 8/128 GB	mobiles	Good	21000	Minor scuffs on the frame. Charger and original case included.	{/demo/android.jpg,/demo/phone.jpg}	t	t	Noida	Sector 137	ACTIVE	\N	278	2026-10-08 23:01:22.8
cmv51tcxf00fpuhm8p727d6l3	cmv51tcx800fjuhm8gtn4c7i7	iPhone 11 64 GB, White	mobiles	Good	18000	Battery health 81%. Small mark on the back glass, Face ID works.	{/demo/iphone-2.jpg,/demo/iphone.jpg}	t	t	Noida	Sector 137	ACTIVE	\N	331	2026-10-08 11:48:22.802
cmv51tcxh00fruhm8zrojlq7j	cmv51tcx800fjuhm8gtn4c7i7	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Noida	Sector 137	SOLD	\N	0	2026-09-04 09:27:22.804
cmv51tcy400g0uhm8cmf6v8xo	cmv51tcy100fyuhm8kz5j5o5z	Gaming PC — i5 12400F, RTX 3060 Ti	gaming	Good	65000	16 GB RAM, 1 TB NVMe. Runs AAA titles at 1440p.	{/demo/gamingpc.jpg,/demo/gaming-setup.jpg}	t	f	Noida	Sector 137	ACTIVE	\N	262	2026-10-09 03:14:22.827
cmv51tcy600g2uhm8ytczf6ug	cmv51tcy100fyuhm8kz5j5o5z	Gaming headset with mic	gaming	Good	2800	Clear mic, comfortable for long sessions.	{/demo/headphones.jpg,/demo/headphones-2.jpg}	t	t	Noida	Sector 137	ACTIVE	\N	315	2026-10-08 16:01:22.829
cmv51tcy900g4uhm85k2g68h6	cmv51tcy100fyuhm8kz5j5o5z	PS5 Disc Edition + 1 controller	gaming	Excellent	36500	Warranty till next year. Includes two game discs.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Noida	Sector 137	ACTIVE	\N	368	2026-10-12 04:48:22.832
cmv51tcyb00g6uhm8d0oqtzez	cmv51tcy100fyuhm8kz5j5o5z	Gaming mouse + mousepad	gaming	Good	1500	Gaming mouse + mousepad in good condition.	{/demo/gaming-setup.jpg}	t	t	Noida	Sector 137	SOLD	\N	0	2026-08-30 09:27:22.834
cmv51tcys00gfuhm8na6odyus	cmv51tcyo00gduhm80czpt8wj	Cordless drill driver 18 V, 2 batteries	tools	Excellent	5900	Light use, both batteries hold charge. Case included.	{/demo/drill.jpg,/demo/drill-2.jpg}	t	t	Delhi	Saket	ACTIVE	\N	299	2026-10-08 20:14:22.851
cmv51tcyv00ghuhm8c5tvwfab	cmv51tcyo00gduhm80czpt8wj	Mechanic tool kit, 108 pieces	tools	Like New	3200	Socket set, spanners and screwdrivers in a hard case.	{/demo/toolkit.jpg}	t	t	Delhi	Saket	ACTIVE	\N	352	2026-10-12 09:01:22.854
cmv51tcyy00gjuhm8vv7f1qqy	cmv51tcyo00gduhm80czpt8wj	Angle grinder 4 inch	tools	Good	1900	Runs smoothly, guard and two discs included.	{/demo/drill-2.jpg,/demo/toolkit.jpg}	t	t	Delhi	Saket	ACTIVE	\N	405	2026-10-11 21:48:22.857
cmv51tcz100gluhm81vxhuyqx	cmv51tcyo00gduhm80czpt8wj	Screwdriver set	tools	Good	700	Screwdriver set in good condition.	{/demo/toolkit.jpg}	t	t	Delhi	Saket	SOLD	\N	0	2026-08-25 09:27:22.86
cmv51tczh00guuhm8tcng7wav	cmv51tcze00gsuhm8wx06xo2s	Running shoes, size 8	fashion	Like New	2800	Used for under 50 km. Cushioning as new.	{/demo/sneakers.jpg,/demo/sneakers-2.jpg}	t	t	Delhi	Saket	ACTIVE	\N	336	2026-10-08 13:14:22.876
cmv51tczk00gwuhm8bw5gvlwu	cmv51tcze00gsuhm8wx06xo2s	Geared bicycle, 21-speed, disc brakes	sports	Good	10000	Serviced recently, new tubes. Stand and lights included.	{/demo/bicycle.jpg,/demo/roadbike.jpg}	t	f	Delhi	Saket	ACTIVE	\N	389	2026-10-12 02:01:22.879
cmv51tczn00gyuhm839wp3mzv	cmv51tcze00gsuhm8wx06xo2s	Dumbbell set 20 kg with rods	sports	Good	3900	Plates and two chrome rods with collars.	{/demo/dumbbell.jpg}	t	f	Delhi	Saket	ACTIVE	\N	42	2026-10-11 14:48:22.882
cmv51tczp00h0uhm80cqo2tv7	cmv51tcze00gsuhm8wx06xo2s	Cricket bat, English willow	sports	Good	1600	Cricket bat, English willow in good condition.	{/demo/cricket.jpg}	t	t	Delhi	Saket	SOLD	\N	0	2026-08-20 09:27:22.885
cmv51td0300h9uhm84qas1xr8	cmv51td0100h7uhm8i1idvzp7	iPhone 11 64 GB, White	mobiles	Good	16000	Battery health 81%. Small mark on the back glass, Face ID works.	{/demo/iphone-2.jpg,/demo/iphone.jpg}	t	t	Delhi	Saket	ACTIVE	\N	373	2026-10-12 06:14:22.898
cmv51td0600hbuhm8eyh0h8sh	cmv51td0100h7uhm8i1idvzp7	TWS earbuds with charging case	electronics	Like New	2300	Used for a week. All ear tips included.	{/demo/earbuds-2.jpg,/demo/earbuds.jpg}	t	t	Delhi	Saket	ACTIVE	\N	426	2026-10-11 19:01:22.901
cmv51td0a00hduhm8iuxtqlww	cmv51td0100h7uhm8i1idvzp7	iPhone 13 128 GB, Blue	mobiles	Excellent	37500	Battery health 88%. Always used with a case and screen guard. Box and bill included.	{/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Delhi	Saket	ACTIVE	\N	79	2026-10-11 07:48:22.905
cmv51td0c00hfuhm8xt5fxbfx	cmv51td0100h7uhm8i1idvzp7	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Delhi	Saket	SOLD	\N	0	2026-09-24 09:27:22.908
cmv51td0r00houhm827f3oivh	cmv51td0o00hmuhm8spwsa97c	Ergonomic office chair, mesh back	furniture	Excellent	6100	Adjustable height and armrests. Wheels roll smoothly.	{/demo/office-setup.jpg,/demo/chair.jpg}	t	f	Delhi	Lajpat Nagar	ACTIVE	\N	410	2026-10-11 23:14:22.922
cmv51td0v00hquhm8b4x89ez2	cmv51td0o00hmuhm8spwsa97c	5-shelf wooden bookshelf	furniture	Good	4000	Solid and steady. Minor scratches on one side.	{/demo/bookshelf.jpg}	t	f	Delhi	Lajpat Nagar	ACTIVE	\N	63	2026-10-11 12:01:22.926
cmv51td0x00hsuhm86cd2dbgk	cmv51td0o00hmuhm8spwsa97c	Computer desk with drawers, walnut finish	furniture	Good	5500	Spacious top with cable cut-out. Can be dismantled for moving.	{/demo/desk.jpg,/demo/office-setup.jpg}	t	f	Delhi	Lajpat Nagar	ACTIVE	\N	116	2026-10-11 00:48:22.929
cmv51td1000huuhm8suvw0ghi	cmv51td0o00hmuhm8spwsa97c	2-seater dining table, sheesham	furniture	Good	3500	2-seater dining table, sheesham in good condition.	{/demo/dining-2.jpg}	t	t	Delhi	Lajpat Nagar	SOLD	\N	0	2026-09-19 09:27:22.931
cmv51td1h00i5uhm8e0xihw1x	cmv51td1c00i1uhm8xu5jqybo	Fiction bestsellers bundle (25 books)	books	Good	1400	Mix of thrillers and literary fiction, all paperbacks.	{/demo/books.jpg}	t	t	Delhi	Lajpat Nagar	ACTIVE	\N	100	2026-10-11 05:01:22.948
cmv51td1k00i7uhm8zlp1woco	cmv51td1c00i1uhm8xu5jqybo	Acoustic guitar with gig bag	other	Excellent	4600	Beginner-friendly, new strings fitted.	{/demo/guitar.jpg}	t	t	Delhi	Lajpat Nagar	ACTIVE	\N	153	2026-10-10 17:48:22.951
cmv51td1n00i9uhm8393ux3x7	cmv51td1c00i1uhm8xu5jqybo	Children’s story books set	books	Good	800	Children’s story books set in good condition.	{/demo/books.jpg}	t	t	Delhi	Lajpat Nagar	SOLD	\N	0	2026-09-14 09:27:22.954
cmv51td2100iiuhm8xr0wcfbb	cmv51td1z00iguhm8vdgvm19j	Canon 50 mm f/1.8 STM prime lens	cameras	Excellent	7500	Clean glass, no haze. Caps and pouch included.	{/demo/lens.jpg}	t	t	Delhi	Dwarka	ACTIVE	\N	84	2026-10-11 09:14:22.969
cmv51td2400ikuhm8cgdalszw	cmv51td1z00iguhm8vdgvm19j	Vintage film camera (working)	cameras	Good	6400	Light meter works, tested with a roll last month.	{/demo/camera-retro.jpg}	t	t	Delhi	Dwarka	ACTIVE	\N	137	2026-10-10 22:01:22.971
cmv51td2700imuhm80rwdx7u1	cmv51td1z00iguhm8vdgvm19j	Nikon D5600 with 18–55 mm VR lens	cameras	Excellent	36500	Shutter count about 9,000. Two batteries, charger and a 64 GB card.	{/demo/dslr.jpg,/demo/dslr-2.jpg}	t	t	Delhi	Dwarka	ACTIVE	\N	190	2026-10-10 10:48:22.974
cmv51td2a00iouhm81skd48en	cmv51td1z00iguhm8vdgvm19j	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Delhi	Dwarka	SOLD	\N	0	2026-09-09 09:27:22.977
cmv51td2p00ixuhm869puxd5m	cmv51td2n00ivuhm8nc5681p5	Royal Enfield Meteor 350 (2022), 9,000 km	vehicles	Excellent	177000	Tripper navigation, crash guard and backrest fitted.	{/demo/motorcycle.jpg}	t	f	Delhi	Dwarka	ACTIVE	\N	121	2026-10-11 02:14:22.992
cmv51td2s00izuhm8r2uy2mup	cmv51td2n00ivuhm8nc5681p5	Car tool kit + tyre inflator	tools	Like New	1900	Digital inflator and 40-piece tool set.	{/demo/toolkit.jpg}	t	t	Delhi	Dwarka	ACTIVE	\N	174	2026-10-10 15:01:22.995
cmv51td2u00j1uhm8y4kbkmax	cmv51td2n00ivuhm8nc5681p5	Hyundai i20 Asta 2019, 39,000 km	vehicles	Excellent	566000	Top variant with sunroof. No accidents, papers clear.	{/demo/car-2.jpg,/demo/car.jpg}	t	f	Delhi	Dwarka	ACTIVE	\N	227	2026-10-10 03:48:22.997
cmv51td2x00j3uhm8j2xdbpcf	cmv51td2n00ivuhm8nc5681p5	Bike riding jacket	vehicles	Good	2600	Bike riding jacket in good condition.	{/demo/jacket.jpg}	t	t	Delhi	Dwarka	SOLD	\N	0	2026-09-04 09:27:23
cmv51td3c00jcuhm82sfrgqjs	cmv51td3900jauhm8a86jcb4t	HP Victus gaming laptop, Ryzen 5, RTX 3050	laptops	Good	43000	16 GB RAM, 512 GB SSD. Runs cool, keyboard backlight works.	{/demo/laptop-2.jpg,/demo/laptop.jpg}	t	t	Delhi	Rohini	ACTIVE	\N	158	2026-10-10 19:14:23.015
cmv51td3i00jguhm85hdnv2n6	cmv51td3900jauhm8a86jcb4t	Mechanical keyboard + wireless mouse combo	electronics	Excellent	3200	Brown switches, hot-swappable. Mouse is silent-click.	{/demo/office-setup.jpg}	t	t	Delhi	Rohini	ACTIVE	\N	264	2026-10-09 20:48:23.021
cmv51td3l00jiuhm8z7eml1h3	cmv51td3900jauhm8a86jcb4t	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Delhi	Rohini	SOLD	\N	0	2026-08-30 09:27:23.024
cmv51td4200jtuhm8kp4kqik4	cmv51td3x00jpuhm8a3oeqzkz	Quilted sling bag, black	fashion	Like New	4600	Used for two events. Chain strap included.	{/demo/handbag-2.jpg}	t	t	Delhi	Rohini	ACTIVE	\N	248	2026-10-10 01:01:23.041
cmv51td4500jvuhm89e60ss52	cmv51td3x00jpuhm8a3oeqzkz	Analog wristwatch, steel strap	fashion	Excellent	5100	New battery fitted. Box and warranty card included.	{/demo/watch.jpg}	t	t	Delhi	Rohini	ACTIVE	\N	301	2026-10-09 13:48:23.044
cmv51td4700jxuhm8gr6fpxys	cmv51td3x00jpuhm8a3oeqzkz	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Delhi	Rohini	SOLD	\N	0	2026-08-25 09:27:23.046
cmv51td4j00k6uhm8o52rvt8e	cmv51td4h00k4uhm8ps06px67	iPhone 11 64 GB, White	mobiles	Good	18500	Battery health 81%. Small mark on the back glass, Face ID works.	{/demo/iphone-2.jpg,/demo/iphone.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	232	2026-10-10 05:14:23.058
cmv51td4m00k8uhm8g3dsbj5k	cmv51td4h00k4uhm8ps06px67	TWS earbuds with charging case	electronics	Like New	2200	Used for a week. All ear tips included.	{/demo/earbuds-2.jpg,/demo/earbuds.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	285	2026-10-09 18:01:23.061
cmv51td4o00kauhm81jwphong	cmv51td4h00k4uhm8ps06px67	iPhone 13 128 GB, Blue	mobiles	Excellent	37000	Battery health 88%. Always used with a case and screen guard. Box and bill included.	{/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	338	2026-10-09 06:48:23.063
cmv51td4q00kcuhm8ilytrzb3	cmv51td4h00k4uhm8ps06px67	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Delhi	Karol Bagh	SOLD	\N	0	2026-08-20 09:27:23.065
cmv51td5400kluhm8f3sh2646	cmv51td5200kjuhm8uf7iq953	Xbox Series S 512 GB	gaming	Like New	23000	Used for a few months. Box and all cables included.	{/demo/console.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	269	2026-10-09 22:14:23.079
cmv51td5700knuhm8iernvykt	cmv51td5200kjuhm8uf7iq953	DualSense controller, white	gaming	Excellent	4200	No stick drift, triggers work perfectly.	{/demo/controller.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	322	2026-10-09 11:01:23.082
cmv51td5900kpuhm8jbckwtuo	cmv51td5200kjuhm8uf7iq953	PS4 Slim 1 TB + 2 controllers	gaming	Good	19000	Runs quiet, cleaned recently. Three game discs included.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Delhi	Karol Bagh	ACTIVE	\N	375	2026-10-08 23:48:23.084
cmv51td1e00i3uhm87s1as5aq	cmv51td1c00i1uhm8xu5jqybo	Bluetooth over-ear headphones	electronics	Good	3100	Good battery, cushions in decent shape.	{/demo/headphones-2.jpg,/demo/headphones.jpg}	t	t	Delhi	Lajpat Nagar	ACTIVE	\N	48	2026-10-11 16:14:22.945
cmv51td3z00jruhm8j8spxdzk	cmv51td3x00jpuhm8a3oeqzkz	White sneakers, size 7	fashion	Like New	2300	Worn twice, wrong size.	{/demo/sneakers-2.jpg}	t	t	Delhi	Rohini	ACTIVE	\N	196	2026-10-10 12:14:23.038
cmv51td5n00l0uhm8i5lo58r6	cmv51td5l00kyuhm8k816nrq0	TWS earbuds with charging case	electronics	Like New	2500	Used for a week. All ear tips included.	{/demo/earbuds-2.jpg,/demo/earbuds.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	306	2026-10-09 15:14:23.098
cmv51td5q00l2uhm8nh708lzz	cmv51td5l00kyuhm8k816nrq0	iPhone 13 128 GB, Blue	mobiles	Excellent	41000	Battery health 88%. Always used with a case and screen guard. Box and bill included.	{/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	359	2026-10-09 04:01:23.101
cmv51td5u00l4uhm8gulx84ou	cmv51td5l00kyuhm8k816nrq0	Samsung Galaxy A54 5G, 128 GB	mobiles	Like New	18000	Seven months old, still under warranty. No scratches.	{/demo/phone.jpg,/demo/android.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	412	2026-10-08 16:48:23.105
cmv51td5x00l6uhm819b7eg6q	cmv51td5l00kyuhm8k816nrq0	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Ghaziabad	Indirapuram	SOLD	\N	0	2026-09-19 09:27:23.108
cmv51td6c00lfuhm8fa5u0krj	cmv51td6900lduhm8x84bxr3q	DualSense controller, white	gaming	Excellent	3900	No stick drift, triggers work perfectly.	{/demo/controller.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	343	2026-10-09 08:14:23.123
cmv51td6f00lhuhm8p3v3vetq	cmv51td6900lduhm8x84bxr3q	PS4 Slim 1 TB + 2 controllers	gaming	Good	18000	Runs quiet, cleaned recently. Three game discs included.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	396	2026-10-08 21:01:23.126
cmv51td6j00ljuhm8mddqwt1v	cmv51td6900lduhm8x84bxr3q	Xbox Series S 512 GB	gaming	Like New	23500	Used for a few months. Box and all cables included.	{/demo/console.jpg}	t	t	Ghaziabad	Indirapuram	ACTIVE	\N	49	2026-10-08 09:48:23.13
cmv51td6l00lluhm8hyym57qh	cmv51td6900lduhm8x84bxr3q	Gaming mouse + mousepad	gaming	Good	1500	Gaming mouse + mousepad in good condition.	{/demo/gaming-setup.jpg}	t	t	Ghaziabad	Indirapuram	SOLD	\N	0	2026-09-14 09:27:23.132
cmv51td6y00luuhm8pvflxcfy	cmv51td6w00lsuhm8vfmd0cgu	Acoustic guitar with gig bag	other	Excellent	4800	Beginner-friendly, new strings fitted.	{/demo/guitar.jpg}	t	t	Ghaziabad	Vaishali	ACTIVE	\N	380	2026-10-09 01:14:23.145
cmv51td7100lwuhm8s4lbgz9i	cmv51td6w00lsuhm8vfmd0cgu	UPSC preparation books set (20)	books	Good	2700	Laxmikanth, Spectrum, NCERTs and more. Some notes in pencil.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Ghaziabad	Vaishali	ACTIVE	\N	433	2026-10-08 14:01:23.148
cmv51td7300lyuhm8zkcutt3q	cmv51td6w00lsuhm8vfmd0cgu	JEE / NEET reference books (15)	books	Good	2000	HC Verma, MS Chouhan and more. Clean pages.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Ghaziabad	Vaishali	ACTIVE	\N	86	2026-10-12 02:48:23.15
cmv51td7500m0uhm8g2n8naao	cmv51td6w00lsuhm8vfmd0cgu	Children’s story books set	books	Good	800	Children’s story books set in good condition.	{/demo/books.jpg}	t	t	Ghaziabad	Vaishali	SOLD	\N	0	2026-09-09 09:27:23.152
cmv51td7i00m9uhm8tusa4nxd	cmv51td7f00m7uhm8b4l6hyk2	IFB 6 kg front-load washing machine	appliances	Good	13500	All programs work. Drum cleaned recently.	{/demo/washer.jpg}	t	f	Ghaziabad	Vaishali	ACTIVE	\N	417	2026-10-08 18:14:23.165
cmv51td7k00mbuhm83s9avaun	cmv51td7f00m7uhm8b4l6hyk2	OTG oven 35 L with rotisserie	appliances	Good	4300	Used for weekend baking. Trays included.	{/demo/oven.jpg}	t	t	Ghaziabad	Vaishali	ACTIVE	\N	70	2026-10-12 07:01:23.167
cmv51td7m00mduhm8cihvupjr	cmv51td7f00m7uhm8b4l6hyk2	Drip coffee maker with carafe	appliances	Like New	3300	Used a handful of times. Reusable filter included.	{/demo/coffee.jpg}	t	t	Ghaziabad	Vaishali	ACTIVE	\N	123	2026-10-11 19:48:23.169
cmv51td7p00mfuhm8no01h80k	cmv51td7f00m7uhm8b4l6hyk2	Toaster oven 12 L	appliances	Good	1800	Toaster oven 12 L in good condition.	{/demo/oven.jpg}	t	t	Ghaziabad	Vaishali	SOLD	\N	0	2026-09-04 09:27:23.172
cmv51td8200mouhm8tubqw9bf	cmv51td7z00mmuhm8ngklrx4o	UPSC preparation books set (20)	books	Good	2500	Laxmikanth, Spectrum, NCERTs and more. Some notes in pencil.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	54	2026-10-08 11:14:23.185
cmv51td8400mquhm8zlxqh644	cmv51td7z00mmuhm8ngklrx4o	JEE / NEET reference books (15)	books	Good	1900	HC Verma, MS Chouhan and more. Clean pages.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	107	2026-10-12 00:01:23.187
cmv51td8700msuhm8ssg8kdko	cmv51td7z00mmuhm8ngklrx4o	Bluetooth over-ear headphones	electronics	Good	3000	Good battery, cushions in decent shape.	{/demo/headphones-2.jpg,/demo/headphones.jpg}	t	t	Ghaziabad	Raj Nagar Extension	ACTIVE	\N	160	2026-10-11 12:48:23.19
cmv51td8a00muuhm8mp1dthj5	cmv51td7z00mmuhm8ngklrx4o	Children’s story books set	books	Good	800	Children’s story books set in good condition.	{/demo/books.jpg}	t	t	Ghaziabad	Raj Nagar Extension	SOLD	\N	0	2026-08-30 09:27:23.193
cmv51td8o00n3uhm8ms7xk9eo	cmv51td8m00n1uhm8nerfktld	Sony a6100 with 16–50 mm kit lens	cameras	Like New	54500	Under 2,500 shots. Box and bill included.	{/demo/mirrorless.jpg,/demo/camera-retro.jpg}	t	t	Gurgaon	DLF Phase 3	ACTIVE	\N	91	2026-10-12 04:14:23.207
cmv51td8r00n5uhm8mixy0a3a	cmv51td8m00n1uhm8nerfktld	Canon EOS 200D II kit	cameras	Good	35500	Light wear on the grip. Works perfectly, includes bag.	{/demo/camera-kit.jpg,/demo/dslr.jpg}	t	t	Gurgaon	DLF Phase 3	ACTIVE	\N	144	2026-10-11 17:01:23.21
cmv51td8t00n7uhm88191jgom	cmv51td8m00n1uhm8nerfktld	Camera bag + tripod + filters kit	cameras	Good	2600	Backpack-style bag, aluminium tripod and UV/CPL filters.	{/demo/camera-kit.jpg}	t	t	Gurgaon	DLF Phase 3	ACTIVE	\N	197	2026-10-11 05:48:23.212
cmv51td8w00n9uhm873ivvekk	cmv51td8m00n1uhm8nerfktld	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Gurgaon	DLF Phase 3	SOLD	\N	0	2026-08-25 09:27:23.215
cmv51td9d00niuhm88mnk13pz	cmv51td9a00nguhm8xo8mdqu8	Bajaj Pulsar NS200 (2020), 18,000 km	vehicles	Good	87500	New tyres and chain set. All papers in order.	{/demo/sportbike.jpg,/demo/ktm.jpg}	t	f	Gurgaon	DLF Phase 3	ACTIVE	\N	128	2026-10-11 21:14:23.232
cmv51td9g00nkuhm8bwggtdjg	cmv51td9a00nguhm8xo8mdqu8	Ather 450X electric scooter (2022)	vehicles	Good	86000	Battery health good, about 90 km per charge. Charger included.	{/demo/ebike.jpg}	t	f	Gurgaon	DLF Phase 3	ACTIVE	\N	181	2026-10-11 10:01:23.235
cmv51td9j00nmuhm8ygvl63zg	cmv51td9a00nguhm8xo8mdqu8	Maruti Swift VXi 2018, petrol, 48,000 km	vehicles	Good	459500	Single owner, all services at Maruti. Insurance valid.	{/demo/car.jpg,/demo/car-2.jpg}	t	f	Gurgaon	DLF Phase 3	ACTIVE	\N	234	2026-10-10 22:48:23.238
cmv51td9m00nouhm84oqmca96	cmv51td9a00nguhm8xo8mdqu8	Bike riding jacket	vehicles	Good	2600	Bike riding jacket in good condition.	{/demo/jacket.jpg}	t	t	Gurgaon	DLF Phase 3	SOLD	\N	0	2026-08-20 09:27:23.241
cmv51tda300nxuhm8h7e3ojgx	cmv51tda000nvuhm8zwxizw4q	Accent armchair, teal velvet	furniture	Like New	7300	Used in the living room as a display piece.	{/demo/lounge-chair.jpg}	t	f	Gurgaon	DLF Phase 3	ACTIVE	\N	165	2026-10-11 14:14:23.258
cmv51tdb200nzuhm81ppmkvcu	cmv51tda000nvuhm8zwxizw4q	3-seater fabric sofa, beige	furniture	Good	15000	Comfortable and sturdy. Covers dry-cleaned last month.	{/demo/sofa.jpg,/demo/sofa-2.jpg}	t	f	Gurgaon	DLF Phase 3	ACTIVE	\N	218	2026-10-11 03:01:23.293
cmv51tdba00o1uhm81m6rga30	cmv51tda000nvuhm8zwxizw4q	4-seater dining table with chairs	furniture	Excellent	14500	Glass top with wooden chairs. No wobble.	{/demo/dining.jpg,/demo/dining-2.jpg}	t	f	Gurgaon	DLF Phase 3	ACTIVE	\N	271	2026-10-10 15:48:23.301
cmv51tdbe00o3uhm8q1csm72d	cmv51tda000nvuhm8zwxizw4q	2-seater dining table, sheesham	furniture	Good	3500	2-seater dining table, sheesham in good condition.	{/demo/dining-2.jpg}	t	t	Gurgaon	DLF Phase 3	SOLD	\N	0	2026-09-24 09:27:23.305
cmv51tdc200ocuhm8zpjpchj8	cmv51tdbz00oauhm8omxibygu	Gaming headset with mic	gaming	Good	2400	Clear mic, comfortable for long sessions.	{/demo/headphones.jpg,/demo/headphones-2.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	202	2026-10-11 07:14:23.329
cmv51tdc500oeuhm8e9y2ixrg	cmv51tdbz00oauhm8omxibygu	PS5 Disc Edition + 1 controller	gaming	Excellent	37000	Warranty till next year. Includes two game discs.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	255	2026-10-10 20:01:23.332
cmv51tdc800oguhm8pytfqcl3	cmv51tdbz00oauhm8omxibygu	Gaming PC — i5 12400F, RTX 3060 Ti	gaming	Good	61000	16 GB RAM, 1 TB NVMe. Runs AAA titles at 1440p.	{/demo/gamingpc.jpg,/demo/gaming-setup.jpg}	t	f	Gurgaon	Sohna Road	ACTIVE	\N	308	2026-10-10 08:48:23.335
cmv51tdcb00oiuhm8cgagg93d	cmv51tdbz00oauhm8omxibygu	Gaming mouse + mousepad	gaming	Good	1500	Gaming mouse + mousepad in good condition.	{/demo/gaming-setup.jpg}	t	t	Gurgaon	Sohna Road	SOLD	\N	0	2026-09-19 09:27:23.338
cmv51tdcr00oruhm84yq88xbj	cmv51tdco00opuhm8w8yd45sm	MacBook Air M1 8/256 GB, Space Grey	laptops	Excellent	53500	Around 150 battery cycles. No dents. Charger and box included.	{/demo/macbook.jpg,/demo/macbook-2.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	239	2026-10-11 00:14:23.354
cmv51tdct00otuhm8o1eazetw	cmv51tdco00opuhm8w8yd45sm	Lenovo ThinkPad E14, i5, 16 GB	laptops	Good	33500	Business laptop, great keyboard. Battery lasts about 5 hours.	{/demo/laptop.jpg,/demo/laptop-2.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	292	2026-10-10 13:01:23.357
cmv51tdcw00ovuhm826ei27sk	cmv51tdco00opuhm8w8yd45sm	iPad 10th gen 64 GB, Wi-Fi	electronics	Like New	31000	Used for streaming and notes. Folio case included.	{/demo/tablet.jpg,/demo/tablet-2.jpg}	t	t	Gurgaon	Sohna Road	ACTIVE	\N	345	2026-10-10 01:48:23.359
cmv51tdcy00oxuhm8nz3q6r5q	cmv51tdco00opuhm8w8yd45sm	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Gurgaon	Sohna Road	SOLD	\N	0	2026-09-14 09:27:23.361
cmv51tdde00p8uhm8b2h98rxf	cmv51tdd900p4uhm89l74qfpy	Dumbbell set 20 kg with rods	sports	Good	3300	Plates and two chrome rods with collars.	{/demo/dumbbell.jpg}	t	f	Gurgaon	Golf Course Road	ACTIVE	\N	329	2026-10-10 06:01:23.377
cmv51tddg00pauhm8mymqpnic	cmv51tdd900p4uhm89l74qfpy	Running shoes, size 8	fashion	Like New	2600	Used for under 50 km. Cushioning as new.	{/demo/sneakers.jpg,/demo/sneakers-2.jpg}	t	t	Gurgaon	Golf Course Road	ACTIVE	\N	382	2026-10-09 18:48:23.379
cmv51tddj00pcuhm8t83qkigj	cmv51tdd900p4uhm89l74qfpy	Cricket bat, English willow	sports	Good	1600	Cricket bat, English willow in good condition.	{/demo/cricket.jpg}	t	t	Gurgaon	Golf Course Road	SOLD	\N	0	2026-09-09 09:27:23.382
cmv51tddw00pluhm80q57vixw	cmv51tddu00pjuhm8wt0p0hpr	Samsung Galaxy A54 5G, 128 GB	mobiles	Like New	18500	Seven months old, still under warranty. No scratches.	{/demo/phone.jpg,/demo/android.jpg}	t	t	Gurgaon	Golf Course Road	ACTIVE	\N	313	2026-10-10 10:14:23.395
cmv51tddy00pnuhm8fkstmk2q	cmv51tddu00pjuhm8wt0p0hpr	Redmi Note 13 Pro, 8/256 GB	mobiles	Excellent	16500	Bought as a backup phone, barely used. Box and bill included.	{/demo/android.jpg}	t	t	Gurgaon	Golf Course Road	ACTIVE	\N	366	2026-10-09 23:01:23.397
cmv51tde100ppuhm8xysoa9ay	cmv51tddu00pjuhm8wt0p0hpr	Smartwatch with AMOLED display	electronics	Excellent	5300	Heart rate, SpO2 and GPS. Two straps included.	{/demo/smartwatch.jpg}	t	t	Gurgaon	Golf Course Road	ACTIVE	\N	419	2026-10-09 11:48:23.4
cmv51tde300pruhm8ydv55lce	cmv51tddu00pjuhm8wt0p0hpr	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Gurgaon	Golf Course Road	SOLD	\N	0	2026-09-04 09:27:23.402
cmv51tdeh00q0uhm81olkrhig	cmv51tdee00pyuhm8mx8iayt1	OTG oven 35 L with rotisserie	appliances	Good	4700	Used for weekend baking. Trays included.	{/demo/oven.jpg}	t	t	Mumbai	Andheri West	ACTIVE	\N	350	2026-10-10 03:14:23.416
cmv51tdej00q2uhm8ya2zvcbz	cmv51tdee00pyuhm8mx8iayt1	Drip coffee maker with carafe	appliances	Like New	3600	Used a handful of times. Reusable filter included.	{/demo/coffee.jpg}	t	t	Mumbai	Andheri West	ACTIVE	\N	403	2026-10-09 16:01:23.418
cmv51tdem00q4uhm8onwmfqx2	cmv51tdee00pyuhm8mx8iayt1	LG 260 L frost-free double-door fridge	appliances	Good	14500	Cools well, no noise. Five years old.	{/demo/fridge.jpg}	t	f	Mumbai	Andheri West	ACTIVE	\N	56	2026-10-09 04:48:23.421
cmv51tdeo00q6uhm8wacflou6	cmv51tdee00pyuhm8mx8iayt1	Toaster oven 12 L	appliances	Good	1800	Toaster oven 12 L in good condition.	{/demo/oven.jpg}	t	t	Mumbai	Andheri West	SOLD	\N	0	2026-08-30 09:27:23.423
cmv51tdf200qfuhm8t63b0hd5	cmv51tdez00qduhm8i8yw4wnk	Angle grinder 4 inch	tools	Good	1800	Runs smoothly, guard and two discs included.	{/demo/drill-2.jpg,/demo/toolkit.jpg}	t	t	Mumbai	Andheri West	ACTIVE	\N	387	2026-10-09 20:14:23.437
cmv51tdf500qhuhm8tvipdvem	cmv51tdez00qduhm8i8yw4wnk	Impact drill 650 W with bits	tools	Good	2300	Works on concrete and wood. 15 bits included.	{/demo/drill-2.jpg}	t	t	Mumbai	Andheri West	ACTIVE	\N	40	2026-10-09 09:01:23.44
cmv51tdf700qjuhm85pivfa2s	cmv51tdez00qduhm8i8yw4wnk	Workbench study desk, solid wood	furniture	Good	5500	Heavy and sturdy, great for a workshop or study.	{/demo/desk.jpg}	t	f	Mumbai	Andheri West	ACTIVE	\N	93	2026-10-08 21:48:23.442
cmv51tdf900qluhm8575dsdla	cmv51tdez00qduhm8i8yw4wnk	Screwdriver set	tools	Good	700	Screwdriver set in good condition.	{/demo/toolkit.jpg}	t	t	Mumbai	Andheri West	SOLD	\N	0	2026-08-25 09:27:23.445
cmv51tdfp00quuhm8ntwr90b9	cmv51tdfm00qsuhm883vw6g8t	Running shoes, size 8	fashion	Like New	2700	Used for under 50 km. Cushioning as new.	{/demo/sneakers.jpg,/demo/sneakers-2.jpg}	t	t	Mumbai	Andheri West	ACTIVE	\N	424	2026-10-09 13:14:23.46
cmv51tdfs00qwuhm8906joys1	cmv51tdfm00qsuhm883vw6g8t	Geared bicycle, 21-speed, disc brakes	sports	Good	9800	Serviced recently, new tubes. Stand and lights included.	{/demo/bicycle.jpg,/demo/roadbike.jpg}	t	f	Mumbai	Andheri West	ACTIVE	\N	77	2026-10-09 02:01:23.463
cmv51tdfv00qyuhm8qmwzskyc	cmv51tdfm00qsuhm883vw6g8t	Dumbbell set 20 kg with rods	sports	Good	3800	Plates and two chrome rods with collars.	{/demo/dumbbell.jpg}	t	f	Mumbai	Andheri West	ACTIVE	\N	130	2026-10-08 14:48:23.466
cmv51tdfy00r0uhm8cahouin6	cmv51tdfm00qsuhm883vw6g8t	Cricket bat, English willow	sports	Good	1600	Cricket bat, English willow in good condition.	{/demo/cricket.jpg}	t	t	Mumbai	Andheri West	SOLD	\N	0	2026-08-20 09:27:23.469
cmv51tdgd00r9uhm8nc1zfkcu	cmv51tdga00r7uhm8ia6axlrn	Car tool kit + tyre inflator	tools	Like New	1900	Digital inflator and 40-piece tool set.	{/demo/toolkit.jpg}	t	t	Mumbai	Versova	ACTIVE	\N	61	2026-10-09 06:14:23.484
cmv51tdgg00rbuhm8wcnr9blk	cmv51tdga00r7uhm8ia6axlrn	Hyundai i20 Asta 2019, 39,000 km	vehicles	Excellent	572000	Top variant with sunroof. No accidents, papers clear.	{/demo/car-2.jpg,/demo/car.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	114	2026-10-08 19:01:23.487
cmv51tdgj00rduhm8rdqfnq9s	cmv51tdga00r7uhm8ia6axlrn	Royal Enfield Meteor 350 (2022), 9,000 km	vehicles	Excellent	165000	Tripper navigation, crash guard and backrest fitted.	{/demo/motorcycle.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	167	2026-10-12 07:48:23.49
cmv51tdgm00rfuhm80cl4yev4	cmv51tdga00r7uhm8ia6axlrn	Bike riding jacket	vehicles	Good	2600	Bike riding jacket in good condition.	{/demo/jacket.jpg}	t	t	Mumbai	Versova	SOLD	\N	0	2026-09-24 09:27:23.493
cmv51tdh100rouhm8u0yd80od	cmv51tdgy00rmuhm8n3otph93	3-seater fabric sofa, beige	furniture	Good	14000	Comfortable and sturdy. Covers dry-cleaned last month.	{/demo/sofa.jpg,/demo/sofa-2.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	98	2026-10-08 23:14:23.508
cmv51tdh400rquhm8vynaqjmi	cmv51tdgy00rmuhm8n3otph93	4-seater dining table with chairs	furniture	Excellent	13500	Glass top with wooden chairs. No wobble.	{/demo/dining.jpg,/demo/dining-2.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	151	2026-10-08 12:01:23.511
cmv51tdh700rsuhm802h22am6	cmv51tdgy00rmuhm8n3otph93	Ergonomic office chair, mesh back	furniture	Excellent	6400	Adjustable height and armrests. Wheels roll smoothly.	{/demo/office-setup.jpg,/demo/chair.jpg}	t	f	Mumbai	Versova	ACTIVE	\N	204	2026-10-12 00:48:23.514
cmv51tdha00ruuhm804gw261n	cmv51tdgy00rmuhm8n3otph93	2-seater dining table, sheesham	furniture	Good	3500	2-seater dining table, sheesham in good condition.	{/demo/dining-2.jpg}	t	t	Mumbai	Versova	SOLD	\N	0	2026-09-19 09:27:23.517
cmv51tdho00s3uhm8i2rg30es	cmv51tdhm00s1uhm84c40hf27	Quilted sling bag, black	fashion	Like New	4700	Used for two events. Chain strap included.	{/demo/handbag-2.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	135	2026-10-08 16:14:23.531
cmv51tdhq00s5uhm8jopmylb6	cmv51tdhm00s1uhm84c40hf27	Analog wristwatch, steel strap	fashion	Excellent	5100	New battery fitted. Box and warranty card included.	{/demo/watch.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	188	2026-10-12 05:01:23.534
cmv51tdht00s7uhm8cqxvueo1	cmv51tdhm00s1uhm84c40hf27	White sneakers, size 7	fashion	Like New	2100	Worn twice, wrong size.	{/demo/sneakers-2.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	241	2026-10-11 17:48:23.536
cmv51tdhv00s9uhm8p016m4l5	cmv51tdhm00s1uhm84c40hf27	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Mumbai	Bandra	SOLD	\N	0	2026-09-14 09:27:23.539
cmv51tdie00skuhm8s9j78dso	cmv51tdi900sguhm89dvu0p80	Vintage film camera (working)	cameras	Good	6300	Light meter works, tested with a roll last month.	{/demo/camera-retro.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	225	2026-10-11 22:01:23.557
cmv51tdih00smuhm8swbec5im	cmv51tdi900sguhm89dvu0p80	Nikon D5600 with 18–55 mm VR lens	cameras	Excellent	36000	Shutter count about 9,000. Two batteries, charger and a 64 GB card.	{/demo/dslr.jpg,/demo/dslr-2.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	278	2026-10-11 10:48:23.56
cmv51tdij00souhm80c9qtpso	cmv51tdi900sguhm89dvu0p80	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Mumbai	Bandra	SOLD	\N	0	2026-09-09 09:27:23.562
cmv51tdiw00sxuhm8ab8bettw	cmv51tdit00svuhm8c3tkn9xq	DualSense controller, white	gaming	Excellent	4200	No stick drift, triggers work perfectly.	{/demo/controller.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	209	2026-10-12 02:14:23.575
cmv51tdiz00szuhm8fzstj6g1	cmv51tdit00svuhm8c3tkn9xq	PS4 Slim 1 TB + 2 controllers	gaming	Good	19000	Runs quiet, cleaned recently. Three game discs included.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	262	2026-10-11 15:01:23.578
cmv51tdj200t1uhm8hnv167rc	cmv51tdit00svuhm8c3tkn9xq	Xbox Series S 512 GB	gaming	Like New	25000	Used for a few months. Box and all cables included.	{/demo/console.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	315	2026-10-11 03:48:23.581
cmv51tdj400t3uhm8wl2lzwpb	cmv51tdit00svuhm8c3tkn9xq	Gaming mouse + mousepad	gaming	Good	1500	Gaming mouse + mousepad in good condition.	{/demo/gaming-setup.jpg}	t	t	Mumbai	Powai	SOLD	\N	0	2026-09-04 09:27:23.584
cmv51tdjj00tcuhm8it1drw11	cmv51tdjg00tauhm8jkqzx6b7	iPad 10th gen 64 GB, Wi-Fi	electronics	Like New	32000	Used for streaming and notes. Folio case included.	{/demo/tablet.jpg,/demo/tablet-2.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	246	2026-10-11 19:14:23.598
cmv51tdjm00teuhm8ybfsg0pz	cmv51tdjg00tauhm8jkqzx6b7	ASUS Vivobook 15, i3, 8 GB / 512 GB	laptops	Good	22500	Good for college work. Fresh Windows install, charger included.	{/demo/laptop.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	299	2026-10-11 08:01:23.601
cmv51tdjo00tguhm8asg2fjih	cmv51tdjg00tauhm8jkqzx6b7	HP Victus gaming laptop, Ryzen 5, RTX 3050	laptops	Good	44500	16 GB RAM, 512 GB SSD. Runs cool, keyboard backlight works.	{/demo/laptop-2.jpg,/demo/laptop.jpg}	t	t	Mumbai	Powai	ACTIVE	\N	352	2026-10-10 20:48:23.603
cmv51tdjr00tiuhm8oqsyn4sv	cmv51tdjg00tauhm8jkqzx6b7	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Mumbai	Powai	SOLD	\N	0	2026-08-30 09:27:23.606
cmv51tdk400truhm8yo98t251	cmv51tdk100tpuhm80l7cdar4	Sports sunglasses, polarised	fashion	Excellent	1500	Wrap-around frame, case included.	{/demo/sunglasses-2.jpg}	t	t	Bangalore	Indiranagar	ACTIVE	\N	283	2026-10-11 12:14:23.619
cmv51tdk700ttuhm80v8n15z7	cmv51tdk100tpuhm80l7cdar4	Road bike, aluminium frame, size M	sports	Excellent	22000	Shimano Claris groupset. Very light, ridden mostly on weekends.	{/demo/roadbike.jpg}	t	f	Bangalore	Indiranagar	ACTIVE	\N	336	2026-10-11 01:01:23.622
cmv51tdk900tvuhm8wkf7n7za	cmv51tdk100tpuhm80l7cdar4	Cricket kit — bat, pads, gloves, helmet	sports	Good	4400	Full kit in a wheeled bag. Bat oiled and knocked in.	{/demo/cricket.jpg}	t	t	Bangalore	Indiranagar	ACTIVE	\N	389	2026-10-10 13:48:23.624
cmv51tdkc00txuhm8u1pkypi5	cmv51tdk100tpuhm80l7cdar4	Cricket bat, English willow	sports	Good	1600	Cricket bat, English willow in good condition.	{/demo/cricket.jpg}	t	t	Bangalore	Indiranagar	SOLD	\N	0	2026-08-25 09:27:23.627
cmv51tdkp00u6uhm8ez6p3awx	cmv51tdkn00u4uhm84zbj002k	Smartwatch with AMOLED display	electronics	Excellent	5500	Heart rate, SpO2 and GPS. Two straps included.	{/demo/smartwatch.jpg}	t	t	Bangalore	Indiranagar	ACTIVE	\N	320	2026-10-11 05:14:23.64
cmv51tdkr00u8uhm8v6on7w0k	cmv51tdkn00u4uhm84zbj002k	OnePlus 11R 5G, 8/128 GB	mobiles	Good	22500	Minor scuffs on the frame. Charger and original case included.	{/demo/android.jpg,/demo/phone.jpg}	t	t	Bangalore	Indiranagar	ACTIVE	\N	373	2026-10-10 18:01:23.642
cmv51tdku00uauhm8opediel2	cmv51tdkn00u4uhm84zbj002k	iPhone 11 64 GB, White	mobiles	Good	16500	Battery health 81%. Small mark on the back glass, Face ID works.	{/demo/iphone-2.jpg,/demo/iphone.jpg}	t	t	Bangalore	Indiranagar	ACTIVE	\N	426	2026-10-10 06:48:23.645
cmv51tdkw00ucuhm8nfsp7khm	cmv51tdkn00u4uhm84zbj002k	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Bangalore	Indiranagar	SOLD	\N	0	2026-08-20 09:27:23.647
cmv51tdl800uluhm83ogql12d	cmv51tdl600ujuhm8gkh2m2z0	LG 260 L frost-free double-door fridge	appliances	Good	14500	Cools well, no noise. Five years old.	{/demo/fridge.jpg}	t	f	Bangalore	Koramangala	ACTIVE	\N	357	2026-10-10 22:14:23.659
cmv51tdla00unuhm8umwenfuh	cmv51tdl600ujuhm8gkh2m2z0	Samsung 28 L convection microwave	appliances	Excellent	8000	Convection, grill and solo modes all work.	{/demo/microwave.jpg,/demo/oven.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	410	2026-10-10 11:01:23.661
cmv51tdld00upuhm8muzwm05p	cmv51tdl600ujuhm8gkh2m2z0	Mixer grinder 750 W, 3 jars	appliances	Excellent	2600	Motor strong, jars have no cracks.	{/demo/blender.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	63	2026-10-09 23:48:23.664
cmv51tdlg00uruhm86luss2g3	cmv51tdl600ujuhm8gkh2m2z0	Toaster oven 12 L	appliances	Good	1800	Toaster oven 12 L in good condition.	{/demo/oven.jpg}	t	t	Bangalore	Koramangala	SOLD	\N	0	2026-09-24 09:27:23.667
cmv51tdls00v0uhm8qswp37ed	cmv51tdlq00uyuhm87ibtd394	Cordless drill driver 18 V, 2 batteries	tools	Excellent	6300	Light use, both batteries hold charge. Case included.	{/demo/drill.jpg,/demo/drill-2.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	394	2026-10-10 15:14:23.679
cmv51tdlu00v2uhm801aw5qhh	cmv51tdlq00uyuhm87ibtd394	Mechanic tool kit, 108 pieces	tools	Like New	3500	Socket set, spanners and screwdrivers in a hard case.	{/demo/toolkit.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	47	2026-10-10 04:01:23.681
cmv51tdlw00v4uhm8vdq7w7hh	cmv51tdlq00uyuhm87ibtd394	Angle grinder 4 inch	tools	Good	2100	Runs smoothly, guard and two discs included.	{/demo/drill-2.jpg,/demo/toolkit.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	100	2026-10-09 16:48:23.684
cmv51tdlz00v6uhm8ecfdxdwj	cmv51tdlq00uyuhm87ibtd394	Screwdriver set	tools	Good	700	Screwdriver set in good condition.	{/demo/toolkit.jpg}	t	t	Bangalore	Koramangala	SOLD	\N	0	2026-09-19 09:27:23.686
cmv51tdmd00vfuhm8d7ntojyb	cmv51tdmb00vduhm8zuvxwxdq	Cricket kit — bat, pads, gloves, helmet	sports	Good	3900	Full kit in a wheeled bag. Bat oiled and knocked in.	{/demo/cricket.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	431	2026-10-10 08:14:23.7
cmv51tdmf00vhuhm8nlgvvz4z	cmv51tdmb00vduhm8zuvxwxdq	Sports sunglasses, polarised	fashion	Excellent	1400	Wrap-around frame, case included.	{/demo/sunglasses-2.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	84	2026-10-09 21:01:23.703
cmv51tdmi00vjuhm80os5w1cp	cmv51tdmb00vduhm8zuvxwxdq	Road bike, aluminium frame, size M	sports	Excellent	21500	Shimano Claris groupset. Very light, ridden mostly on weekends.	{/demo/roadbike.jpg}	t	f	Bangalore	Koramangala	ACTIVE	\N	137	2026-10-09 09:48:23.705
cmv51tdmk00vluhm8m9tz4gp3	cmv51tdmb00vduhm8zuvxwxdq	Cricket bat, English willow	sports	Good	1600	Cricket bat, English willow in good condition.	{/demo/cricket.jpg}	t	t	Bangalore	Koramangala	SOLD	\N	0	2026-09-14 09:27:23.707
cmv51tdmx00vuuhm8ymyalarj	cmv51tdmu00vsuhm8r0ii6tt1	Ather 450X electric scooter (2022)	vehicles	Good	87000	Battery health good, about 90 km per charge. Charger included.	{/demo/ebike.jpg}	t	f	Bangalore	HSR Layout	ACTIVE	\N	68	2026-10-10 01:14:23.72
cmv51tdmz00vwuhm8iq6rpcgz	cmv51tdmu00vsuhm8r0ii6tt1	Maruti Swift VXi 2018, petrol, 48,000 km	vehicles	Good	464000	Single owner, all services at Maruti. Insurance valid.	{/demo/car.jpg,/demo/car-2.jpg}	t	f	Bangalore	HSR Layout	ACTIVE	\N	121	2026-10-09 14:01:23.722
cmv51tdn200vyuhm89ccys37b	cmv51tdmu00vsuhm8r0ii6tt1	Bajaj Pulsar NS200 (2020), 18,000 km	vehicles	Good	96500	New tyres and chain set. All papers in order.	{/demo/sportbike.jpg,/demo/ktm.jpg}	t	f	Bangalore	HSR Layout	ACTIVE	\N	174	2026-10-09 02:48:23.725
cmv51tdn400w0uhm86zm2cq2t	cmv51tdmu00vsuhm8r0ii6tt1	Bike riding jacket	vehicles	Good	2600	Bike riding jacket in good condition.	{/demo/jacket.jpg}	t	t	Bangalore	HSR Layout	SOLD	\N	0	2026-09-09 09:27:23.727
cmv51tdnh00w9uhm8cjlkqdo5	cmv51tdnf00w7uhm83ao4b4yq	Ergonomic office chair, mesh back	furniture	Excellent	6600	Adjustable height and armrests. Wheels roll smoothly.	{/demo/office-setup.jpg,/demo/chair.jpg}	t	f	Bangalore	HSR Layout	ACTIVE	\N	105	2026-10-09 18:14:23.74
cmv51tdnk00wbuhm8drfha7ji	cmv51tdnf00w7uhm83ao4b4yq	5-shelf wooden bookshelf	furniture	Good	3600	Solid and steady. Minor scratches on one side.	{/demo/bookshelf.jpg}	t	f	Bangalore	HSR Layout	ACTIVE	\N	158	2026-10-09 07:01:23.743
cmv51tdnm00wduhm89j6igtbo	cmv51tdnf00w7uhm83ao4b4yq	Computer desk with drawers, walnut finish	furniture	Good	4900	Spacious top with cable cut-out. Can be dismantled for moving.	{/demo/desk.jpg,/demo/office-setup.jpg}	t	f	Bangalore	HSR Layout	ACTIVE	\N	211	2026-10-08 19:48:23.745
cmv51tdnq00wfuhm866b9pocj	cmv51tdnf00w7uhm83ao4b4yq	2-seater dining table, sheesham	furniture	Good	3500	2-seater dining table, sheesham in good condition.	{/demo/dining-2.jpg}	t	t	Bangalore	HSR Layout	SOLD	\N	0	2026-09-04 09:27:23.748
cmv51tdod00wouhm8lyb75q93	cmv51tdo900wmuhm8k2isgtds	Leather handbag, tan	fashion	Excellent	3600	Genuine leather with dust bag. No scuffs on corners.	{/demo/handbag.jpg,/demo/handbag-2.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	142	2026-10-09 11:14:23.772
cmv51tdoh00wquhm8up7tzid1	cmv51tdo900wmuhm8k2isgtds	Biker leather jacket, size M	fashion	Good	5100	Real leather, broken in nicely. All zips work.	{/demo/jacket.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	195	2026-10-09 00:01:23.776
cmv51tdoo00wuuhm8d3xbnz4b	cmv51tdo900wmuhm8k2isgtds	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Bangalore	Whitefield	SOLD	\N	0	2026-08-30 09:27:23.783
cmv51tdp800x3uhm8di9atln7	cmv51tdp400x1uhm8aw9nl0eo	Sony a6100 with 16–50 mm kit lens	cameras	Like New	53500	Under 2,500 shots. Box and bill included.	{/demo/mirrorless.jpg,/demo/camera-retro.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	179	2026-10-09 04:14:23.803
cmv51tdpc00x5uhm8iesqg4fu	cmv51tdp400x1uhm8aw9nl0eo	Canon EOS 200D II kit	cameras	Good	35000	Light wear on the grip. Works perfectly, includes bag.	{/demo/camera-kit.jpg,/demo/dslr.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	232	2026-10-08 17:01:23.807
cmv51tdpf00x7uhm8s1kyruzw	cmv51tdp400x1uhm8aw9nl0eo	Camera bag + tripod + filters kit	cameras	Good	2600	Backpack-style bag, aluminium tripod and UV/CPL filters.	{/demo/camera-kit.jpg}	t	t	Bangalore	Whitefield	ACTIVE	\N	285	2026-10-12 05:48:23.81
cmv51tdpj00x9uhm89p9vfxcg	cmv51tdp400x1uhm8aw9nl0eo	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Bangalore	Whitefield	SOLD	\N	0	2026-08-25 09:27:23.814
cmv51tdq100xiuhm8rgtbn5as	cmv51tdpx00xguhm8pl0m36an	Gaming PC — i5 12400F, RTX 3060 Ti	gaming	Good	57500	16 GB RAM, 1 TB NVMe. Runs AAA titles at 1440p.	{/demo/gamingpc.jpg,/demo/gaming-setup.jpg}	t	f	Pune	Kothrud	ACTIVE	\N	216	2026-10-08 21:14:23.832
cmv51tdq400xkuhm89tnxj9gc	cmv51tdpx00xguhm8pl0m36an	Gaming headset with mic	gaming	Good	2500	Clear mic, comfortable for long sessions.	{/demo/headphones.jpg,/demo/headphones-2.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	269	2026-10-08 10:01:23.835
cmv51tdq700xmuhm89kbbq3w1	cmv51tdpx00xguhm8pl0m36an	PS5 Disc Edition + 1 controller	gaming	Excellent	38500	Warranty till next year. Includes two game discs.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	322	2026-10-11 22:48:23.838
cmv51tdqa00xouhm8bgaoosxh	cmv51tdpx00xguhm8pl0m36an	Gaming mouse + mousepad	gaming	Good	1500	Gaming mouse + mousepad in good condition.	{/demo/gaming-setup.jpg}	t	t	Pune	Kothrud	SOLD	\N	0	2026-08-20 09:27:23.841
cmv51tdqs00xzuhm87kf6cihe	cmv51tdqn00xvuhm890r05g7v	LG 27" 4K IPS monitor	electronics	Excellent	18000	Factory calibrated, no dead pixels. Stand and cables included.	{/demo/monitor.jpg}	t	f	Pune	Kothrud	ACTIVE	\N	306	2026-10-12 03:01:23.859
cmv51tdqv00y1uhm82givix2x	cmv51tdqn00xvuhm890r05g7v	Mechanical keyboard + wireless mouse combo	electronics	Excellent	3400	Brown switches, hot-swappable. Mouse is silent-click.	{/demo/office-setup.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	359	2026-10-11 15:48:23.862
cmv51tdqx00y3uhm8kvss089z	cmv51tdqn00xvuhm890r05g7v	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Pune	Kothrud	SOLD	\N	0	2026-09-24 09:27:23.864
cmv51tdrb00ycuhm82667pitf	cmv51tdr900yauhm8vep96ors	Aviator sunglasses, gold frame	fashion	Good	2000	Lenses scratch-free. Case included.	{/demo/sunglasses.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	290	2026-10-12 07:14:23.878
cmv51tdre00yeuhm8ep4kc6dr	cmv51tdr900yauhm8vep96ors	Leather handbag, tan	fashion	Excellent	3500	Genuine leather with dust bag. No scuffs on corners.	{/demo/handbag.jpg,/demo/handbag-2.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	343	2026-10-11 20:01:23.881
cmv51tdrg00yguhm8jrin8fue	cmv51tdr900yauhm8vep96ors	Biker leather jacket, size M	fashion	Good	5000	Real leather, broken in nicely. All zips work.	{/demo/jacket.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	396	2026-10-11 08:48:23.884
cmv51tdrj00yiuhm86gx2nu4l	cmv51tdr900yauhm8vep96ors	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Pune	Kothrud	SOLD	\N	0	2026-09-19 09:27:23.886
cmv51tdry00yruhm8z6xqrmzj	cmv51tdrv00ypuhm86dbijx4a	Bluetooth over-ear headphones	electronics	Good	2800	Good battery, cushions in decent shape.	{/demo/headphones-2.jpg,/demo/headphones.jpg}	t	t	Pune	Karve Nagar	ACTIVE	\N	327	2026-10-12 00:14:23.901
cmv51tds100ytuhm8stjgxvo4	cmv51tdrv00ypuhm86dbijx4a	Fiction bestsellers bundle (25 books)	books	Good	1500	Mix of thrillers and literary fiction, all paperbacks.	{/demo/books.jpg}	t	t	Pune	Karve Nagar	ACTIVE	\N	380	2026-10-11 13:01:23.904
cmv51tds300yvuhm8d91a9p8e	cmv51tdrv00ypuhm86dbijx4a	Acoustic guitar with gig bag	other	Excellent	4900	Beginner-friendly, new strings fitted.	{/demo/guitar.jpg}	t	t	Pune	Karve Nagar	ACTIVE	\N	433	2026-10-11 01:48:23.907
cmv51tds600yxuhm8ke600g49	cmv51tdrv00ypuhm86dbijx4a	Children’s story books set	books	Good	800	Children’s story books set in good condition.	{/demo/books.jpg}	t	t	Pune	Karve Nagar	SOLD	\N	0	2026-09-14 09:27:23.909
cmv51tdsl00z6uhm82ttqtc9y	cmv51tdsj00z4uhm8owzgcwef	Mixer grinder 750 W, 3 jars	appliances	Excellent	2700	Motor strong, jars have no cracks.	{/demo/blender.jpg}	t	t	Pune	Karve Nagar	ACTIVE	\N	364	2026-10-11 17:14:23.924
cmv51tdso00z8uhm80u235yht	cmv51tdsj00z4uhm8owzgcwef	Sony 50" 4K smart TV	electronics	Good	33000	Google TV, crisp picture. Remote and wall mount included.	{/demo/tv.jpg,/demo/tv-2.jpg}	t	f	Pune	Karve Nagar	ACTIVE	\N	417	2026-10-11 06:01:23.927
cmv51tdsq00zauhm8a8qrshuv	cmv51tdsj00z4uhm8owzgcwef	IFB 6 kg front-load washing machine	appliances	Good	11500	All programs work. Drum cleaned recently.	{/demo/washer.jpg}	t	f	Pune	Karve Nagar	ACTIVE	\N	70	2026-10-10 18:48:23.93
cmv51tdst00zcuhm8n2enrmdf	cmv51tdsj00z4uhm8owzgcwef	Toaster oven 12 L	appliances	Good	1800	Toaster oven 12 L in good condition.	{/demo/oven.jpg}	t	t	Pune	Karve Nagar	SOLD	\N	0	2026-09-09 09:27:23.932
cmv51tdt800zluhm8xq1ur977	cmv51tdt500zjuhm8ppl8gnu2	Impact drill 650 W with bits	tools	Good	2300	Works on concrete and wood. 15 bits included.	{/demo/drill-2.jpg}	t	t	Pune	Karve Nagar	ACTIVE	\N	401	2026-10-11 10:14:23.947
cmv51tdta00znuhm8at5qhp4c	cmv51tdt500zjuhm8ppl8gnu2	Workbench study desk, solid wood	furniture	Good	5400	Heavy and sturdy, great for a workshop or study.	{/demo/desk.jpg}	t	f	Pune	Karve Nagar	ACTIVE	\N	54	2026-10-10 23:01:23.949
cmv51tdtd00zpuhm80rrpkzlf	cmv51tdt500zjuhm8ppl8gnu2	Cordless drill driver 18 V, 2 batteries	tools	Excellent	6200	Light use, both batteries hold charge. Case included.	{/demo/drill.jpg,/demo/drill-2.jpg}	t	t	Pune	Karve Nagar	ACTIVE	\N	107	2026-10-10 11:48:23.952
cmv51tdtf00zruhm8x4w0se9s	cmv51tdt500zjuhm8ppl8gnu2	Screwdriver set	tools	Good	700	Screwdriver set in good condition.	{/demo/toolkit.jpg}	t	t	Pune	Karve Nagar	SOLD	\N	0	2026-09-04 09:27:23.954
cmv51tdts0100uhm8j7950kjm	cmv51tdtq00zyuhm83gt0nnq6	5-shelf wooden bookshelf	furniture	Good	3900	Solid and steady. Minor scratches on one side.	{/demo/bookshelf.jpg}	t	f	Pune	Baner	ACTIVE	\N	438	2026-10-11 03:14:23.967
cmv51tdtv0102uhm8gaf94aoc	cmv51tdtq00zyuhm83gt0nnq6	Computer desk with drawers, walnut finish	furniture	Good	5400	Spacious top with cable cut-out. Can be dismantled for moving.	{/demo/desk.jpg,/demo/office-setup.jpg}	t	f	Pune	Baner	ACTIVE	\N	91	2026-10-10 16:01:23.97
cmv51tdtx0104uhm8eto3jsqy	cmv51tdtq00zyuhm83gt0nnq6	Study table with bookshelf	furniture	Good	5100	Compact, fits in a bedroom corner. A few marks on top.	{/demo/desk.jpg,/demo/bookshelf.jpg}	t	f	Pune	Baner	ACTIVE	\N	144	2026-10-10 04:48:23.972
cmv51tdu00106uhm8ef5gvxlz	cmv51tdtq00zyuhm83gt0nnq6	2-seater dining table, sheesham	furniture	Good	3500	2-seater dining table, sheesham in good condition.	{/demo/dining-2.jpg}	t	t	Pune	Baner	SOLD	\N	0	2026-08-30 09:27:23.975
cmv51tduj010fuhm8tg66hka5	cmv51tdug010duhm85ll0kqov	Acoustic guitar with gig bag	other	Excellent	5200	Beginner-friendly, new strings fitted.	{/demo/guitar.jpg}	t	t	Pune	Baner	ACTIVE	\N	75	2026-10-10 20:14:23.994
cmv51tdul010huhm8miq03bhm	cmv51tdug010duhm85ll0kqov	UPSC preparation books set (20)	books	Good	2400	Laxmikanth, Spectrum, NCERTs and more. Some notes in pencil.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Pune	Baner	ACTIVE	\N	128	2026-10-10 09:01:23.997
cmv51tduo010juhm8yuucsn2t	cmv51tdug010duhm85ll0kqov	JEE / NEET reference books (15)	books	Good	1800	HC Verma, MS Chouhan and more. Clean pages.	{/demo/books.jpg,/demo/bookshelf.jpg}	t	t	Pune	Baner	ACTIVE	\N	181	2026-10-09 21:48:23.999
cmv51tduq010luhm8ggehasl9	cmv51tdug010duhm85ll0kqov	Children’s story books set	books	Good	800	Children’s story books set in good condition.	{/demo/books.jpg}	t	t	Pune	Baner	SOLD	\N	0	2026-08-25 09:27:24.001
cmv51tdv3010uuhm8bdzwcgqo	cmv51tdv0010suhm84ynyknma	Vintage film camera (working)	cameras	Good	6400	Light meter works, tested with a roll last month.	{/demo/camera-retro.jpg}	t	t	Pune	Viman Nagar	ACTIVE	\N	112	2026-10-10 13:14:24.014
cmv51tdv7010wuhm8axr6zq70	cmv51tdv0010suhm84ynyknma	Nikon D5600 with 18–55 mm VR lens	cameras	Excellent	36500	Shutter count about 9,000. Two batteries, charger and a 64 GB card.	{/demo/dslr.jpg,/demo/dslr-2.jpg}	t	t	Pune	Viman Nagar	ACTIVE	\N	165	2026-10-10 02:01:24.018
cmv51tdva010yuhm8mghh4rfl	cmv51tdv0010suhm84ynyknma	Canon 50 mm f/1.8 STM prime lens	cameras	Excellent	8100	Clean glass, no haze. Caps and pouch included.	{/demo/lens.jpg}	t	t	Pune	Viman Nagar	ACTIVE	\N	218	2026-10-09 14:48:24.021
cmv51tdvd0110uhm8p1zyhd97	cmv51tdv0010suhm84ynyknma	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Pune	Viman Nagar	SOLD	\N	0	2026-08-20 09:27:24.025
cmv51tdvr0119uhm840unapk0	cmv51tdvo0117uhm8s25m88ah	Car tool kit + tyre inflator	tools	Like New	1900	Digital inflator and 40-piece tool set.	{/demo/toolkit.jpg}	t	t	Pune	Viman Nagar	ACTIVE	\N	149	2026-10-10 06:14:24.038
cmv51tdvt011buhm8rfqbg3az	cmv51tdvo0117uhm8s25m88ah	Hyundai i20 Asta 2019, 39,000 km	vehicles	Excellent	664000	Top variant with sunroof. No accidents, papers clear.	{/demo/car-2.jpg,/demo/car.jpg}	t	f	Pune	Viman Nagar	ACTIVE	\N	202	2026-10-09 19:01:24.04
cmv51tdvv011duhm86boys9js	cmv51tdvo0117uhm8s25m88ah	Royal Enfield Meteor 350 (2022), 9,000 km	vehicles	Excellent	161500	Tripper navigation, crash guard and backrest fitted.	{/demo/motorcycle.jpg}	t	f	Pune	Viman Nagar	ACTIVE	\N	255	2026-10-09 07:48:24.042
cmv51tdvx011fuhm8wsn12z16	cmv51tdvo0117uhm8s25m88ah	Bike riding jacket	vehicles	Good	2600	Bike riding jacket in good condition.	{/demo/jacket.jpg}	t	t	Pune	Viman Nagar	SOLD	\N	0	2026-09-24 09:27:24.044
cmv51tdw9011ouhm8t05zmoif	cmv51tdw7011muhm8acqd0ur7	LG 27" 4K IPS monitor	electronics	Excellent	16500	Factory calibrated, no dead pixels. Stand and cables included.	{/demo/monitor.jpg}	t	f	Hyderabad	Gachibowli	ACTIVE	\N	186	2026-10-09 23:14:24.056
cmv51tdwb011quhm8xgwy9u54	cmv51tdw7011muhm8acqd0ur7	Mechanical keyboard + wireless mouse combo	electronics	Excellent	3100	Brown switches, hot-swappable. Mouse is silent-click.	{/demo/office-setup.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	239	2026-10-09 12:01:24.058
cmv51tdwd011suhm83kk65sim	cmv51tdw7011muhm8acqd0ur7	MacBook Air M1 8/256 GB, Space Grey	laptops	Excellent	54500	Around 150 battery cycles. No dents. Charger and box included.	{/demo/macbook.jpg,/demo/macbook-2.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	292	2026-10-09 00:48:24.06
cmv51tdwf011uuhm839l5bi55	cmv51tdw7011muhm8acqd0ur7	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Hyderabad	Gachibowli	SOLD	\N	0	2026-09-19 09:27:24.062
cmv51tdwq0123uhm8de3g89m2	cmv51tdwo0121uhm8pm9z258g	Quilted sling bag, black	fashion	Like New	4600	Used for two events. Chain strap included.	{/demo/handbag-2.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	223	2026-10-09 16:14:24.074
cmv51tdwt0125uhm8cwsqni7n	cmv51tdwo0121uhm8pm9z258g	Analog wristwatch, steel strap	fashion	Excellent	5000	New battery fitted. Box and warranty card included.	{/demo/watch.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	276	2026-10-09 05:01:24.076
cmv51tdwv0127uhm8nw5uqbng	cmv51tdwo0121uhm8pm9z258g	White sneakers, size 7	fashion	Like New	2500	Worn twice, wrong size.	{/demo/sneakers-2.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	329	2026-10-08 17:48:24.078
cmv51tdwx0129uhm81qkhturv	cmv51tdwo0121uhm8pm9z258g	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Hyderabad	Gachibowli	SOLD	\N	0	2026-09-14 09:27:24.08
cmv51tdxa012iuhm8vis5l5zn	cmv51tdx8012guhm8hhwhph59	Canon 50 mm f/1.8 STM prime lens	cameras	Excellent	7200	Clean glass, no haze. Caps and pouch included.	{/demo/lens.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	260	2026-10-09 09:14:24.093
cmv51tdxc012kuhm864q89c33	cmv51tdx8012guhm8hhwhph59	Vintage film camera (working)	cameras	Good	6200	Light meter works, tested with a roll last month.	{/demo/camera-retro.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	313	2026-10-08 22:01:24.095
cmv51tdxe012muhm89vn4dwky	cmv51tdx8012guhm8hhwhph59	Nikon D5600 with 18–55 mm VR lens	cameras	Excellent	35500	Shutter count about 9,000. Two batteries, charger and a 64 GB card.	{/demo/dslr.jpg,/demo/dslr-2.jpg}	t	t	Hyderabad	Gachibowli	ACTIVE	\N	366	2026-10-08 10:48:24.097
cmv51tdxg012ouhm869ro61o5	cmv51tdx8012guhm8hhwhph59	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Hyderabad	Gachibowli	SOLD	\N	0	2026-09-09 09:27:24.099
cmv51tdxs012xuhm8fgjr7wd4	cmv51tdxq012vuhm82jm3aclj	Cricket kit — bat, pads, gloves, helmet	sports	Good	4200	Full kit in a wheeled bag. Bat oiled and knocked in.	{/demo/cricket.jpg}	t	t	Hyderabad	Kondapur	ACTIVE	\N	297	2026-10-09 02:14:24.111
cmv51tdxu012zuhm84fjxj3b3	cmv51tdxq012vuhm82jm3aclj	Sports sunglasses, polarised	fashion	Excellent	1500	Wrap-around frame, case included.	{/demo/sunglasses-2.jpg}	t	t	Hyderabad	Kondapur	ACTIVE	\N	350	2026-10-08 15:01:24.114
cmv51tdxx0131uhm8zhucmajc	cmv51tdxq012vuhm82jm3aclj	Road bike, aluminium frame, size M	sports	Excellent	23000	Shimano Claris groupset. Very light, ridden mostly on weekends.	{/demo/roadbike.jpg}	t	f	Hyderabad	Kondapur	ACTIVE	\N	403	2026-10-12 03:48:24.116
cmv51tdxz0133uhm8paaknslk	cmv51tdxq012vuhm82jm3aclj	Cricket bat, English willow	sports	Good	1600	Cricket bat, English willow in good condition.	{/demo/cricket.jpg}	t	t	Hyderabad	Kondapur	SOLD	\N	0	2026-09-04 09:27:24.119
cmv51tdyb013cuhm8ppzlwpet	cmv51tdy9013auhm8t2ifvjag	iPhone 13 128 GB, Blue	mobiles	Excellent	41000	Battery health 88%. Always used with a case and screen guard. Box and bill included.	{/demo/iphone.jpg,/demo/iphone-2.jpg}	t	t	Hyderabad	Kondapur	ACTIVE	\N	334	2026-10-08 19:14:24.13
cmv51tdye013euhm8cr53sme7	cmv51tdy9013auhm8t2ifvjag	Samsung Galaxy A54 5G, 128 GB	mobiles	Like New	18000	Seven months old, still under warranty. No scratches.	{/demo/phone.jpg,/demo/android.jpg}	t	t	Hyderabad	Kondapur	ACTIVE	\N	387	2026-10-12 08:01:24.133
cmv51tdyh013guhm8llko9azv	cmv51tdy9013auhm8t2ifvjag	Redmi Note 13 Pro, 8/256 GB	mobiles	Excellent	15500	Bought as a backup phone, barely used. Box and bill included.	{/demo/android.jpg}	t	t	Hyderabad	Kondapur	ACTIVE	\N	40	2026-10-11 20:48:24.136
cmv51tdyj013iuhm81wfkxdlp	cmv51tdy9013auhm8t2ifvjag	Pixel 6a 128 GB	mobiles	Good	14500	Pixel 6a 128 GB in good condition.	{/demo/android.jpg}	t	t	Hyderabad	Kondapur	SOLD	\N	0	2026-08-30 09:27:24.138
cmv51tdyx013ruhm8m6d2ci92	cmv51tdyv013puhm8gfh0n8ai	IFB 6 kg front-load washing machine	appliances	Good	12000	All programs work. Drum cleaned recently.	{/demo/washer.jpg}	t	f	Hyderabad	Madhapur	ACTIVE	\N	371	2026-10-08 12:14:24.152
cmv51tdyz013tuhm8wao7wfvq	cmv51tdyv013puhm8gfh0n8ai	OTG oven 35 L with rotisserie	appliances	Good	4600	Used for weekend baking. Trays included.	{/demo/oven.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	424	2026-10-12 01:01:24.154
cmv51tdz1013vuhm8szqngreg	cmv51tdyv013puhm8gfh0n8ai	Drip coffee maker with carafe	appliances	Like New	3500	Used a handful of times. Reusable filter included.	{/demo/coffee.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	77	2026-10-11 13:48:24.156
cmv51tdz3013xuhm84ies6bf2	cmv51tdyv013puhm8gfh0n8ai	Toaster oven 12 L	appliances	Good	1800	Toaster oven 12 L in good condition.	{/demo/oven.jpg}	t	t	Hyderabad	Madhapur	SOLD	\N	0	2026-08-25 09:27:24.159
cmv51tdzf0146uhm8nylbxf5g	cmv51tdzd0144uhm8uhia8tr2	Mechanic tool kit, 108 pieces	tools	Like New	3400	Socket set, spanners and screwdrivers in a hard case.	{/demo/toolkit.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	408	2026-10-12 05:14:24.17
cmv51tdzi0148uhm80mbpho01	cmv51tdzd0144uhm8uhia8tr2	Angle grinder 4 inch	tools	Good	2000	Runs smoothly, guard and two discs included.	{/demo/drill-2.jpg,/demo/toolkit.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	61	2026-10-11 18:01:24.173
cmv51tdzk014auhm84rgekx1f	cmv51tdzd0144uhm8uhia8tr2	Impact drill 650 W with bits	tools	Good	2200	Works on concrete and wood. 15 bits included.	{/demo/drill-2.jpg}	t	t	Hyderabad	Madhapur	ACTIVE	\N	114	2026-10-11 06:48:24.175
cmv51tdzm014cuhm87qciaffx	cmv51tdzd0144uhm8uhia8tr2	Screwdriver set	tools	Good	700	Screwdriver set in good condition.	{/demo/toolkit.jpg}	t	t	Hyderabad	Madhapur	SOLD	\N	0	2026-08-20 09:27:24.177
cmv51tdzx014luhm859s2lpkd	cmv51tdzu014juhm84jkmz4ig	Study table with bookshelf	furniture	Good	4500	Compact, fits in a bedroom corner. A few marks on top.	{/demo/desk.jpg,/demo/bookshelf.jpg}	t	f	Jaipur	Malviya Nagar	ACTIVE	\N	45	2026-10-11 22:14:24.188
cmv51tdzz014nuhm8t2toyuv6	cmv51tdzu014juhm84jkmz4ig	Accent armchair, teal velvet	furniture	Like New	6900	Used in the living room as a display piece.	{/demo/lounge-chair.jpg}	t	f	Jaipur	Malviya Nagar	ACTIVE	\N	98	2026-10-11 11:01:24.19
cmv51te01014puhm8vv7ibbdl	cmv51tdzu014juhm84jkmz4ig	3-seater fabric sofa, beige	furniture	Good	14500	Comfortable and sturdy. Covers dry-cleaned last month.	{/demo/sofa.jpg,/demo/sofa-2.jpg}	t	f	Jaipur	Malviya Nagar	ACTIVE	\N	151	2026-10-10 23:48:24.192
cmv51te03014ruhm8zesg6lw6	cmv51tdzu014juhm84jkmz4ig	2-seater dining table, sheesham	furniture	Good	3500	2-seater dining table, sheesham in good condition.	{/demo/dining-2.jpg}	t	t	Jaipur	Malviya Nagar	SOLD	\N	0	2026-09-24 09:27:24.194
cmv51te0j0150uhm8awqv6trr	cmv51te0g014yuhm8okz9rdef	Bluetooth over-ear headphones	electronics	Good	2900	Good battery, cushions in decent shape.	{/demo/headphones-2.jpg,/demo/headphones.jpg}	t	t	Jaipur	Malviya Nagar	ACTIVE	\N	82	2026-10-11 15:14:24.21
cmv51te0m0152uhm83bunnv4w	cmv51te0g014yuhm8okz9rdef	Fiction bestsellers bundle (25 books)	books	Good	1500	Mix of thrillers and literary fiction, all paperbacks.	{/demo/books.jpg}	t	t	Jaipur	Malviya Nagar	ACTIVE	\N	135	2026-10-11 04:01:24.213
cmv51te0p0154uhm82rv84nho	cmv51te0g014yuhm8okz9rdef	Acoustic guitar with gig bag	other	Excellent	5100	Beginner-friendly, new strings fitted.	{/demo/guitar.jpg}	t	t	Jaipur	Malviya Nagar	ACTIVE	\N	188	2026-10-10 16:48:24.216
cmv51te0r0156uhm86mrfc3zx	cmv51te0g014yuhm8okz9rdef	Children’s story books set	books	Good	800	Children’s story books set in good condition.	{/demo/books.jpg}	t	t	Jaipur	Malviya Nagar	SOLD	\N	0	2026-09-19 09:27:24.219
cmv51te16015fuhm82wt73bri	cmv51te13015duhm8qppusbxy	Drip coffee maker with carafe	appliances	Like New	3600	Used a handful of times. Reusable filter included.	{/demo/coffee.jpg}	t	t	Jaipur	Malviya Nagar	ACTIVE	\N	119	2026-10-11 08:14:24.233
cmv51te19015huhm8xy03h5j5	cmv51te13015duhm8qppusbxy	LG 260 L frost-free double-door fridge	appliances	Good	14500	Cools well, no noise. Five years old.	{/demo/fridge.jpg}	t	f	Jaipur	Malviya Nagar	ACTIVE	\N	172	2026-10-10 21:01:24.236
cmv51te1b015juhm8c5z0mdts	cmv51te13015duhm8qppusbxy	Samsung 28 L convection microwave	appliances	Excellent	7900	Convection, grill and solo modes all work.	{/demo/microwave.jpg,/demo/oven.jpg}	t	t	Jaipur	Malviya Nagar	ACTIVE	\N	225	2026-10-10 09:48:24.238
cmv51te1e015luhm8sovf8uyz	cmv51te13015duhm8qppusbxy	Toaster oven 12 L	appliances	Good	1800	Toaster oven 12 L in good condition.	{/demo/oven.jpg}	t	t	Jaipur	Malviya Nagar	SOLD	\N	0	2026-09-14 09:27:24.241
cmv51te1q015uuhm80lidu9o9	cmv51te1o015suhm82mapigal	Aviator sunglasses, gold frame	fashion	Good	1800	Lenses scratch-free. Case included.	{/demo/sunglasses.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	156	2026-10-11 01:14:24.253
cmv51te1s015wuhm8hqwkvm31	cmv51te1o015suhm82mapigal	Leather handbag, tan	fashion	Excellent	3800	Genuine leather with dust bag. No scuffs on corners.	{/demo/handbag.jpg,/demo/handbag-2.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	209	2026-10-10 14:01:24.256
cmv51te1u015yuhm85ck4v46d	cmv51te1o015suhm82mapigal	Biker leather jacket, size M	fashion	Good	5400	Real leather, broken in nicely. All zips work.	{/demo/jacket.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	262	2026-10-10 02:48:24.258
cmv51te1x0160uhm8pgqhew7u	cmv51te1o015suhm82mapigal	Designer tote bag	fashion	Good	2800	Designer tote bag in good condition.	{/demo/handbag.jpg}	t	t	Jaipur	C-Scheme	SOLD	\N	0	2026-09-09 09:27:24.26
cmv51te280169uhm8cqgkqhry	cmv51te260167uhm86xp7qc4f	Camera bag + tripod + filters kit	cameras	Good	2900	Backpack-style bag, aluminium tripod and UV/CPL filters.	{/demo/camera-kit.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	193	2026-10-10 18:14:24.272
cmv51te2b016buhm8ku1i7b11	cmv51te260167uhm86xp7qc4f	Sony a6100 with 16–50 mm kit lens	cameras	Like New	55500	Under 2,500 shots. Box and bill included.	{/demo/mirrorless.jpg,/demo/camera-retro.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	246	2026-10-10 07:01:24.274
cmv51te2e016duhm8pg31dioo	cmv51te260167uhm86xp7qc4f	Canon EOS 200D II kit	cameras	Good	30500	Light wear on the grip. Works perfectly, includes bag.	{/demo/camera-kit.jpg,/demo/dslr.jpg}	t	t	Jaipur	C-Scheme	ACTIVE	\N	299	2026-10-09 19:48:24.277
cmv51te2g016fuhm8cltys8gc	cmv51te260167uhm86xp7qc4f	Godox speedlite flash	cameras	Good	4200	Godox speedlite flash in good condition.	{/demo/camera-kit.jpg}	t	t	Jaipur	C-Scheme	SOLD	\N	0	2026-09-04 09:27:24.279
cmv51te2t016ouhm89iyj40st	cmv51te2q016muhm8z7mpqxk3	PS5 Disc Edition + 1 controller	gaming	Excellent	36500	Warranty till next year. Includes two game discs.	{/demo/console.jpg,/demo/controller.jpg}	t	t	Jaipur	Vaishali Nagar	ACTIVE	\N	230	2026-10-10 11:14:24.292
cmv51te2v016quhm8erxplnau	cmv51te2q016muhm8z7mpqxk3	Gaming PC — i5 12400F, RTX 3060 Ti	gaming	Good	60000	16 GB RAM, 1 TB NVMe. Runs AAA titles at 1440p.	{/demo/gamingpc.jpg,/demo/gaming-setup.jpg}	t	f	Jaipur	Vaishali Nagar	ACTIVE	\N	283	2026-10-10 00:01:24.294
cmv51te2x016suhm82phjsvx3	cmv51te2q016muhm8z7mpqxk3	Gaming headset with mic	gaming	Good	2600	Clear mic, comfortable for long sessions.	{/demo/headphones.jpg,/demo/headphones-2.jpg}	t	t	Jaipur	Vaishali Nagar	ACTIVE	\N	336	2026-10-09 12:48:24.296
cmv51te2z016uuhm8fde4jje6	cmv51te2q016muhm8z7mpqxk3	Gaming mouse + mousepad	gaming	Good	1500	Gaming mouse + mousepad in good condition.	{/demo/gaming-setup.jpg}	t	t	Jaipur	Vaishali Nagar	SOLD	\N	0	2026-08-30 09:27:24.298
cmv51te3b0173uhm8c84g55z7	cmv51te390171uhm8r8m26fv9	Lenovo ThinkPad E14, i5, 16 GB	laptops	Good	33500	Business laptop, great keyboard. Battery lasts about 5 hours.	{/demo/laptop.jpg,/demo/laptop-2.jpg}	t	t	Jaipur	Vaishali Nagar	ACTIVE	\N	267	2026-10-10 04:14:24.311
cmv51te3d0175uhm8l5sm2a57	cmv51te390171uhm8r8m26fv9	iPad 10th gen 64 GB, Wi-Fi	electronics	Like New	30500	Used for streaming and notes. Folio case included.	{/demo/tablet.jpg,/demo/tablet-2.jpg}	t	t	Jaipur	Vaishali Nagar	ACTIVE	\N	320	2026-10-09 17:01:24.313
cmv51te3f0177uhm8mku3tbuh	cmv51te390171uhm8r8m26fv9	ASUS Vivobook 15, i3, 8 GB / 512 GB	laptops	Good	25500	Good for college work. Fresh Windows install, charger included.	{/demo/laptop.jpg}	t	t	Jaipur	Vaishali Nagar	ACTIVE	\N	373	2026-10-09 05:48:24.315
cmv51te3h0179uhm8dij0mql5	cmv51te390171uhm8r8m26fv9	Logitech wireless mouse	electronics	Good	900	Logitech wireless mouse in good condition.	{/demo/office-setup.jpg}	t	t	Jaipur	Vaishali Nagar	SOLD	\N	0	2026-08-25 09:27:24.317
cmv51tdqp00xxuhm84n5truig	cmv51tdqn00xvuhm890r05g7v	HP Victus gaming laptop, Ryzen 5, RTX 3050	laptops	Good	46000	16 GB RAM, 512 GB SSD. Runs cool, keyboard backlight works.	{/demo/laptop-2.jpg,/demo/laptop.jpg}	t	t	Pune	Kothrud	ACTIVE	\N	254	2026-10-08 14:14:23.856
cmuv6m95c001uuh7s6pcwi8zc	cmuv6m92d0008uh7sj5kq7ao9	iPhone 15 Plus 256 GB, Blue	mobiles	Excellent	58000	Minor scratch on frame.\n\nReason for selling: Upgrading.	{/demo/iphone-2.jpg,/demo/phone.jpg,/demo/iphone.jpg}	t	t	Gurgaon	DLF Phase 3	ACTIVE	\N	890	2026-10-05 00:04:07.63
cmuv6m961002cuh7sw4gj1ern	cmuv6m92w000duh7smxgvru0j	PS5 Slim Digital + 1 controller	gaming	Like New	34000	Mint.\n\nReason for selling: Not using.	{/demo/controller.jpg,/demo/console.jpg}	t	t	Bangalore	Koramangala	ACTIVE	\N	760	2026-10-05 05:04:07.655
cmuv6m98t003yuh7s8jc9oq23	cmuv6m91l0004uh7sn0nii9u7	Tripod — Digitek DTR 550	cameras	Good	1500	Tripod — Digitek DTR 550 in good condition.	{/demo/camera-kit.jpg,/demo/lens.jpg}	t	t	Noida	Sector 18	SOLD	\N	0	2026-07-12 11:44:07.755
cmuv6m96k002quh7snvtlelrm	cmuv6m91l0004uh7sn0nii9u7	Gaming chair with footrest	furniture	Good	7400	Ergonomic gaming chair with lumbar pillow and footrest. Used for a year, no tears in the leatherette.	{/demo/chair.jpg,/demo/office-setup.jpg}	t	t	Noida	Sector 18	PENDING_REVIEW	\N	0	2026-10-05 10:59:07.674
cmv51tcdl0022uhm8m7wlofd1	cmv51tcdc0020uhm89xbrvius	Honda City 2017 VX, petrol, 52,000 km	vehicles	Excellent	685000	Single owner, all services at the authorised centre. Insurance valid till March. No accidents.	{/demo/car.jpg,/demo/car-2.jpg}	t	f	Delhi	Rohini	ACTIVE	\N	279	2026-10-10 11:14:22.086
cmv51tdib00siuhm8wagawd8x	cmv51tdi900sguhm89dvu0p80	Canon 50 mm f/1.8 STM prime lens	cameras	Excellent	7300	Clean glass, no haze. Caps and pouch included.	{/demo/lens.jpg}	t	t	Mumbai	Bandra	ACTIVE	\N	172	2026-10-12 09:14:23.555
cmv51tddb00p6uhm8p66hxqtz	cmv51tdd900p4uhm89l74qfpy	Geared bicycle, 21-speed, disc brakes	sports	Good	10000	Serviced recently, new tubes. Stand and lights included.	{/demo/bicycle.jpg,/demo/roadbike.jpg}	t	f	Gurgaon	Golf Course Road	SOLD	\N	279	2026-10-10 17:14:23.374
cmv51td3f00jeuhm8xf6ljo46	cmv51td3900jauhm8a86jcb4t	LG 27" 4K IPS monitor	electronics	Excellent	17000	Factory calibrated, no dead pixels. Stand and cables included.	{/demo/monitor.jpg}	t	f	Delhi	Rohini	ACTIVE	\N	212	2026-10-10 08:01:23.018
cmuv6m93l000kuh7s7em80eg2	cmuv6m91l0004uh7sn0nii9u7	Canon EOS 1500D DSLR with 18–55mm lens	cameras	Like New	18000	Used on two trips and a few family functions. Shutter count about 6,200. No fungus, no haze, autofocus is quick and accurate. One tiny mark near the grip (see photo 4). Comes with original box, battery, charger, strap and a 32 GB SanDisk card. Bill available.\n\nReason for selling: Upgraded to a mirrorless body; this one has barely been used since.	{/demo/dslr.jpg,/demo/dslr-2.jpg,/demo/camera-kit.jpg}	t	t	Noida	Sector 18	ACTIVE	\N	843	2026-10-05 09:44:07.567
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Message" (id, "conversationId", "senderId", type, text, amount, "offerStatus", "readAt", "createdAt") FROM stdin;
cmuv6m96u002wuh7slmnfnc8o	cmuv6m96q002uuh7savwi3wr3	cmuv6m9180001uh7syb2m1tr0	TEXT	Hi Karan, is the Canon 1500D still available?	\N	\N	2026-10-05 10:10:07.684	2026-10-05 10:09:07.684
cmuv6m970002yuh7sun2cm0c5	cmuv6m96q002uuh7savwi3wr3	cmuv6m91l0004uh7sn0nii9u7	TEXT	Hi Aarav! Yes, it is. Shutter count is around 6,200 and it comes with the original box, charger and a 32 GB card.	\N	\N	2026-10-05 10:12:07.69	2026-10-05 10:11:07.69
cmuv6m9730030uh7st4iq8frb	cmuv6m96q002uuh7savwi3wr3	cmuv6m9180001uh7syb2m1tr0	TEXT	Any scratches on the body or fungus in the lens?	\N	\N	2026-10-05 10:13:07.693	2026-10-05 10:12:07.693
cmuv6m9760032uh7sr6yui4j5	cmuv6m96q002uuh7savwi3wr3	cmuv6m91l0004uh7sn0nii9u7	TEXT	No fungus, the glass is clear. There is one tiny mark near the grip.	\N	\N	2026-10-05 10:15:07.696	2026-10-05 10:14:07.696
cmuv6m9790034uh7sbu1aicy8	cmuv6m96q002uuh7savwi3wr3	cmuv6m9180001uh7syb2m1tr0	OFFER	\N	15000	COUNTERED	2026-10-05 10:19:07.699	2026-10-05 10:18:07.699
cmuv6m97d0036uh7svghvb3n0	cmuv6m96q002uuh7savwi3wr3	cmuv6m91l0004uh7sn0nii9u7	OFFER	\N	16500	PENDING	2026-10-05 10:22:07.703	2026-10-05 10:21:07.703
cmuv6m97f0038uh7sr1mvcvv7	cmuv6m96q002uuh7savwi3wr3	cmuv6m91l0004uh7sn0nii9u7	TEXT	I can do ₹16,500 — the box, card and bill are all included.	\N	\N	2026-10-05 10:22:07.705	2026-10-05 10:21:07.705
cmuv6m99c0048uh7sfje84mis	cmuv6m9980046uh7sd82dc90c	cmuv6m91c0002uh7sx14c2ye6	OFFER	\N	16000	ACCEPTED	\N	2026-10-05 10:34:07.774
cmuv6m99f004auh7srvjtgij2	cmuv6m9980046uh7sd82dc90c	cmuv6m91l0004uh7sn0nii9u7	SYSTEM	Deal agreed at ₹16,000	\N	\N	\N	2026-10-05 10:39:07.777
cmv579dpc0007uh8kslcowbtx	cmv57951r0005uh8k98bhsl9i	cmv5792510001uh8koogdh7vy	TEXT	Is this still available?	\N	\N	2026-10-12 12:04:33.486	2026-10-12 11:59:48.384
cmv57c8370009uh8k5q8ce1pj	cmv57951r0005uh8k98bhsl9i	cmv5792510001uh8koogdh7vy	TEXT	Can I see it today?	\N	\N	2026-10-12 12:04:33.486	2026-10-12 12:02:01.075
cmv57cbs3000buh8kzg0kb1mp	cmv57951r0005uh8k98bhsl9i	cmv5792510001uh8koogdh7vy	TEXT	hi deal done	\N	\N	2026-10-12 12:04:33.486	2026-10-12 12:02:05.859
cmv57fmgr000guh8kkkbi6uxz	cmv57951r0005uh8k98bhsl9i	cmv51tdd900p4uhm89l74qfpy	TEXT	Done	\N	\N	2026-10-12 12:04:40.034	2026-10-12 12:04:39.675
cmv57fuod000iuh8k13zoe6b2	cmv57951r0005uh8k98bhsl9i	cmv51tdd900p4uhm89l74qfpy	TEXT	Yes, it is available.	\N	\N	2026-10-12 12:04:55.011	2026-10-12 12:04:50.317
cmv69zfgn000kuh8kv4m4d5b5	cmv57951r0005uh8k98bhsl9i	cmv51tdd900p4uhm89l74qfpy	TEXT	Price is slightly negotiable.	\N	\N	2026-10-13 06:03:49.522	2026-10-13 06:03:49.128
cmv69zy5i000muh8kn99i5g2j	cmv57951r0005uh8k98bhsl9i	cmv5792510001uh8koogdh7vy	TEXT	Okay deal Done now	\N	\N	2026-10-13 06:04:13.502	2026-10-13 06:04:13.351
cmvp5lcnj0009uhsge9g21c2n	cmvp5hvxe0001uhsgjmen4pl6	cmuv6m9140000uh7sue4vhajf	SYSTEM	Order DB-2026-838993 placed. Cash on delivery — ₹2,300 to be paid to the seller at handover. The item is now marked SOLD.	\N	\N	\N	2026-10-26 11:08:31.183
cmv6bxvs40003uhv8rldbiiu1	cmv57951r0005uh8k98bhsl9i	cmv5792510001uh8koogdh7vy	OFFER	\N	9000	ACCEPTED	2026-10-13 06:58:37.515	2026-10-13 06:58:36.196
cmv6by1rh0005uhv8itp8tr2m	cmv57951r0005uh8k98bhsl9i	cmv51tdd900p4uhm89l74qfpy	SYSTEM	Deal done at ₹9,000 — the item is now reserved for ttg and hidden from other buyers.	\N	\N	2026-10-13 06:58:47.507	2026-10-13 06:58:43.95
cmv6bzof30009uhv8qim3lqtp	cmv57951r0005uh8k98bhsl9i	cmv5792510001uh8koogdh7vy	SYSTEM	Order DB-2026-851066 placed. Cash on delivery — ₹9,000 to be paid to the seller at handover. The item is now marked SOLD.	\N	\N	2026-10-13 07:00:23.333	2026-10-13 06:59:59.967
cmvp5i7ym0003uhsga0cq8qtr	cmvp5hvxe0001uhsgjmen4pl6	cmuv6m9140000uh7sue4vhajf	TEXT	Is this still available?	\N	\N	\N	2026-10-26 11:06:05.134
cmvp5izci0005uhsg46udcc6c	cmvp5hvxe0001uhsgjmen4pl6	cmuv6m9140000uh7sue4vhajf	SYSTEM	Deal done at ₹2,300 — the item is now reserved for Ritu and hidden from other buyers.	\N	\N	\N	2026-10-26 11:06:40.626
cmvp5owcy000euhsg5ufg81ub	cmvp5hvxe0001uhsgjmen4pl6	cmv51td3x00jpuhm8a3oeqzkz	SYSTEM	Order DB-2026-838993 was cancelled — the seller could not complete it.	\N	\N	2026-10-26 11:11:21.352	2026-10-26 11:11:16.69
cmvthmags0003uh24nretyzt1	cmvthm3ti0001uh24gh7e699v	cmuv6m9140000uh7sue4vhajf	TEXT	Is this still available?	\N	\N	\N	2026-10-29 11:56:15.1
cmvthq4h7000auh245fi04vkb	cmvthq1sm0008uh247bow1zqw	cmuv6m9140000uh7sue4vhajf	TEXT	Hi	\N	\N	2026-10-29 11:59:21.89	2026-10-29 11:59:13.963
cmvthqdv1000cuh245hdmhavv	cmvthq1sm0008uh247bow1zqw	cmuv6m9140000uh7sue4vhajf	TEXT	Can I see it today?	\N	\N	2026-10-29 11:59:27.492	2026-10-29 11:59:26.126
cmvthqhad000euh24h3s9d6uf	cmvthq1sm0008uh247bow1zqw	cmv51tc8v000luhm8gy1nhadz	TEXT	Yes, it is available.	\N	\N	2026-10-29 11:59:31.036	2026-10-29 11:59:30.565
cmvthqtw5000guh24vcytwgcu	cmvthq1sm0008uh247bow1zqw	cmuv6m9140000uh7sue4vhajf	OFFER	\N	1200	ACCEPTED	2026-10-29 11:59:48.048	2026-10-29 11:59:46.901
cmvthqxoh000iuh24b56sk0l3	cmvthq1sm0008uh247bow1zqw	cmv51tc8v000luhm8gy1nhadz	SYSTEM	Deal done at ₹1,200 — the item is now reserved for Ritu and hidden from other buyers.	\N	\N	2026-10-29 11:59:55.826	2026-10-29 11:59:51.809
cmvths752000muh2447wpn50o	cmvthq1sm0008uh247bow1zqw	cmuv6m9140000uh7sue4vhajf	SYSTEM	Order DB-2026-711178 placed. Cash on delivery — ₹1,200 to be paid to the seller at handover. The item is now marked SOLD.	\N	\N	2026-10-29 12:00:53.056	2026-10-29 12:00:50.727
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Order" (id, code, "listingId", "conversationId", "buyerId", "sellerId", "agreedPrice", "deliveryFee", total, mode, address, "pickupPlace", "pickupTime", "courierNote", status, "handoverOtp", "razorpayOrderId", "paymentId", "paymentMode", "paidAt", "acceptedAt", "shippedAt", "outAt", "readyAt", "deliveredAt", "completedAt", "cancelledAt", "createdAt") FROM stdin;
cmuv6m97n003auh7s0r9it04d	DB-2026-100231	cmuv6m953001ouh7sjgfmhyuw	\N	cmuv6m9180001uh7syb2m1tr0	cmuv6m91y0005uh7sne9aexuo	1200	79	1279	DELIVERY	B-204, Supertech Capetown, Sector 74, Noida 201301	\N	\N	\N	COMPLETED	4821	\N	demo_seed	demo	2026-09-26 11:44:07.713	2026-09-26 12:14:07.713	2026-09-27 11:44:07.713	2026-09-27 12:44:07.713	\N	2026-09-27 13:44:07.713	2026-09-28 11:44:07.713	\N	2026-09-26 11:44:07.713
cmuv6m987003kuh7s12knu2ft	DB-2026-09001	cmuv6m984003iuh7sgee95yx2	\N	cmuv6m91c0002uh7sx14c2ye6	cmuv6m91l0004uh7sn0nii9u7	9800	0	9800	PICKUP	\N	Sector 18 Metro Station, Gate 2	Evening	\N	COMPLETED	1111	\N	\N	demo	2026-08-13 11:44:07.733	2026-08-13 11:44:07.733	\N	\N	2026-08-14 11:44:07.733	2026-08-14 11:44:07.733	2026-08-15 11:44:07.733	\N	2026-08-13 11:44:07.733
cmuv6m98j003suh7svpxsj9p9	DB-2026-09002	cmuv6m98g003quh7sag6nc2mn	\N	cmuv6m91f0003uh7s75g6e8pw	cmuv6m91l0004uh7sn0nii9u7	14500	0	14500	PICKUP	\N	Sector 18 Metro Station, Gate 2	Evening	\N	COMPLETED	1111	\N	\N	demo	2026-07-29 11:44:07.745	2026-07-29 11:44:07.745	\N	\N	2026-07-30 11:44:07.745	2026-07-30 11:44:07.745	2026-07-31 11:44:07.745	\N	2026-07-29 11:44:07.745
cmuv6m98w0040uh7s3gj8pxuq	DB-2026-09003	cmuv6m98t003yuh7s8jc9oq23	\N	cmuv6m91c0002uh7sx14c2ye6	cmuv6m91l0004uh7sn0nii9u7	1500	0	1500	PICKUP	\N	Sector 18 Metro Station, Gate 2	Evening	\N	COMPLETED	1111	\N	\N	demo	2026-07-14 11:44:07.758	2026-07-14 11:44:07.758	\N	\N	2026-07-15 11:44:07.758	2026-07-15 11:44:07.758	2026-07-16 11:44:07.758	\N	2026-07-14 11:44:07.758
cmuv6m99i004cuh7sq5dhqyci	DB-2026-104872	cmuv6m94e0014uh7s93dyq64e	cmuv6m9980046uh7sd82dc90c	cmuv6m91c0002uh7sx14c2ye6	cmuv6m91l0004uh7sn0nii9u7	16000	79	16079	DELIVERY	C-12, Sector 50, Noida 201301	\N	\N	\N	PAID	4827	\N	demo_seed2	demo	2026-10-05 10:44:07.78	\N	\N	\N	\N	\N	\N	\N	2026-10-05 10:42:07.78
cmv51tc8g000guhm83p9p2te6	DB-2026-200011	cmv51tc8d000euhm8lek9j3dm	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tc7l0004uhm8v6egi0f3	4200	0	4200	PICKUP	\N	Sector 62, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:21.903	2026-09-21 09:27:21.903	\N	\N	2026-09-22 09:27:21.903	2026-09-22 09:27:21.903	2026-09-22 09:27:21.903	\N	2026-09-21 09:27:21.903
cmv51tc98000xuhm8a371yr6f	DB-2026-200021	cmv51tc96000vuhm89fo031nq	\N	cmv51tc750001uhm8fc07n2du	cmv51tc8v000luhm8gy1nhadz	1200	0	1200	PICKUP	\N	Sector 137, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:21.931	2026-09-16 09:27:21.931	\N	\N	2026-09-17 09:27:21.931	2026-09-17 09:27:21.931	2026-09-17 09:27:21.931	\N	2026-09-16 09:27:21.931
cmv51tcaf001euhm88s3ny0ok	DB-2026-200031	cmv51tca6001cuhm810zf02m4	\N	cmv51tc790002uhm8amm39sxb	cmv51tc9h0012uhm848ampvfo	6000	0	6000	PICKUP	\N	Sector 74, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:21.973	2026-09-11 09:27:21.973	\N	\N	2026-09-12 09:27:21.973	2026-09-12 09:27:21.973	2026-09-12 09:27:21.973	\N	2026-09-11 09:27:21.973
cmv51tcck001vuhm8latikw4d	DB-2026-200041	cmv51tccc001tuhm8ckog8mem	\N	cmv51tc7e0003uhm8dtplheat	cmv51tcb7001juhm86jt72j5y	2500	0	2500	PICKUP	\N	Dwarka, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:22.05	2026-09-06 09:27:22.05	\N	\N	2026-09-07 09:27:22.05	2026-09-07 09:27:22.05	2026-09-07 09:27:22.05	\N	2026-09-06 09:27:22.05
cmv51tce8002auhm8bxumehc3	DB-2026-200051	cmv51tce30028uhm88giv42d4	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tcdc0020uhm89xbrvius	3500	0	3500	PICKUP	\N	Rohini, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:22.11	2026-09-01 09:27:22.11	\N	\N	2026-09-02 09:27:22.11	2026-09-02 09:27:22.11	2026-09-02 09:27:22.11	\N	2026-09-01 09:27:22.11
cmv51tcf1002ruhm8jyw2rz0f	DB-2026-200061	cmv51tcey002puhm85syzeicj	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tcek002fuhm8bc53jn6p	7500	0	7500	PICKUP	\N	Karol Bagh, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:22.14	2026-08-27 09:27:22.14	\N	\N	2026-08-28 09:27:22.14	2026-08-28 09:27:22.14	2026-08-28 09:27:22.14	\N	2026-08-27 09:27:22.14
cmv51tcfr0038uhm8lmapwxoq	DB-2026-200071	cmv51tcfp0036uhm87p007w5t	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcfc002wuhm8kcykhz7c	3200	0	3200	PICKUP	\N	Indirapuram, Ghaziabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:22.166	2026-08-22 09:27:22.166	\N	\N	2026-08-23 09:27:22.166	2026-08-23 09:27:22.166	2026-08-23 09:27:22.166	\N	2026-08-22 09:27:22.166
cmv51tcgb003nuhm8uihvtbs5	DB-2026-200081	cmv51tcg9003luhm80yxs2owp	\N	cmv51tc750001uhm8fc07n2du	cmv51tcg0003duhm8civbu6c6	2400	0	2400	PICKUP	\N	Raj Nagar Extension, Ghaziabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:22.186	2026-09-26 09:27:22.186	\N	\N	2026-09-27 09:27:22.186	2026-09-27 09:27:22.186	2026-09-27 09:27:22.186	\N	2026-09-26 09:27:22.186
cmv51tcgy0044uhm8c0f4wgct	DB-2026-200091	cmv51tcgw0042uhm8d4ks93wf	\N	cmv51tc790002uhm8amm39sxb	cmv51tcgj003suhm8hl3ylyak	3200	0	3200	PICKUP	\N	Golf Course Road, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:22.209	2026-09-21 09:27:22.209	\N	\N	2026-09-22 09:27:22.209	2026-09-22 09:27:22.209	2026-09-22 09:27:22.209	\N	2026-09-21 09:27:22.209
cmv51tcho004luhm8azqlbvhf	DB-2026-200101	cmv51tchl004juhm8w7mdmq9o	\N	cmv51tc7e0003uhm8dtplheat	cmv51tch60049uhm8kwvp1g5f	4500	0	4500	PICKUP	\N	Sohna Road, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:22.235	2026-09-16 09:27:22.235	\N	\N	2026-09-17 09:27:22.235	2026-09-17 09:27:22.235	2026-09-17 09:27:22.235	\N	2026-09-16 09:27:22.235
cmv51tcia0050uhm85o8m08ht	DB-2026-200111	cmv51tci8004yuhm8ljewwl0o	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tchx004quhm8o1c09yoo	28000	0	28000	PICKUP	\N	Bandra, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:22.257	2026-09-11 09:27:22.257	\N	\N	2026-09-12 09:27:22.257	2026-09-12 09:27:22.257	2026-09-12 09:27:22.257	\N	2026-09-11 09:27:22.257
cmv51tcix005huhm8fx2enhre	DB-2026-200121	cmv51tciu005fuhm8ackywwgk	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tcij0055uhm8dwq91l9x	6500	0	6500	PICKUP	\N	Powai, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:22.28	2026-09-06 09:27:22.28	\N	\N	2026-09-07 09:27:22.28	2026-09-07 09:27:22.28	2026-09-07 09:27:22.28	\N	2026-09-06 09:27:22.28
cmv51tcji005wuhm88yp69w4c	DB-2026-200131	cmv51tcjg005uuhm8umcl4k99	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcj5005muhm8fcscj8o9	2200	0	2200	PICKUP	\N	Versova, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:22.302	2026-09-01 09:27:22.302	\N	\N	2026-09-02 09:27:22.302	2026-09-02 09:27:22.302	2026-09-02 09:27:22.302	\N	2026-09-01 09:27:22.302
cmv51tck5006duhm8nkw3pmz6	DB-2026-200141	cmv51tck2006buhm8kixc14l0	\N	cmv51tc750001uhm8fc07n2du	cmv51tcjr0061uhm81w14fvbq	3500	0	3500	PICKUP	\N	Whitefield, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:22.324	2026-08-27 09:27:22.324	\N	\N	2026-08-28 09:27:22.324	2026-08-28 09:27:22.324	2026-08-28 09:27:22.324	\N	2026-08-27 09:27:22.324
cmv51tcku006uuhm86tepdb6n	DB-2026-200151	cmv51tcks006suhm831nqdzsq	\N	cmv51tc790002uhm8amm39sxb	cmv51tcke006iuhm8n33euzeb	9000	0	9000	PICKUP	\N	Koramangala, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:22.35	2026-08-22 09:27:22.35	\N	\N	2026-08-23 09:27:22.35	2026-08-23 09:27:22.35	2026-08-23 09:27:22.35	\N	2026-08-22 09:27:22.35
cmv51tcld0079uhm8sox2kymc	DB-2026-200161	cmv51tclb0077uhm8x8al6w44	\N	cmv51tc7e0003uhm8dtplheat	cmv51tcl3006zuhm8g2ieril4	1500	0	1500	PICKUP	\N	HSR Layout, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:22.368	2026-09-26 09:27:22.368	\N	\N	2026-09-27 09:27:22.368	2026-09-27 09:27:22.368	2026-09-27 09:27:22.368	\N	2026-09-26 09:27:22.368
cmv51tclv007ouhm8yn4s7il8	DB-2026-200171	cmv51tclt007muhm85ti35dkx	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tcll007euhm8upawpjlw	2800	0	2800	PICKUP	\N	Baner, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:22.386	2026-09-21 09:27:22.386	\N	\N	2026-09-22 09:27:22.386	2026-09-22 09:27:22.386	2026-09-22 09:27:22.386	\N	2026-09-21 09:27:22.386
cmv51tcmg0085uhm8oyzv6msw	DB-2026-200181	cmv51tcme0083uhm8tk4wq3ws	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tcm2007tuhm8j5ky6d21	1900	0	1900	PICKUP	\N	Viman Nagar, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:22.407	2026-09-16 09:27:22.407	\N	\N	2026-09-17 09:27:22.407	2026-09-17 09:27:22.407	2026-09-17 09:27:22.407	\N	2026-09-16 09:27:22.407
cmv51tcn3008muhm8jpf7eykh	DB-2026-200191	cmv51tcn1008kuhm8ape6rn5d	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcmo008auhm8d4bvpab3	14000	0	14000	PICKUP	\N	Madhapur, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:22.431	2026-09-11 09:27:22.431	\N	\N	2026-09-12 09:27:22.431	2026-09-12 09:27:22.431	2026-09-12 09:27:22.431	\N	2026-09-11 09:27:22.431
cmv51tcnu0091uhm8sgah35uz	DB-2026-200201	cmv51tcnr008zuhm899x5b8z1	\N	cmv51tc750001uhm8fc07n2du	cmv51tcnf008ruhm8sk15hj8c	2200	0	2200	PICKUP	\N	Kondapur, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:22.457	2026-09-06 09:27:22.457	\N	\N	2026-09-07 09:27:22.457	2026-09-07 09:27:22.457	2026-09-07 09:27:22.457	\N	2026-09-06 09:27:22.457
cmv51tcog009iuhm83nwfe4eb	DB-2026-200211	cmv51tcoe009guhm8z7745rxe	\N	cmv51tc790002uhm8amm39sxb	cmv51tco20096uhm83ziqhjzl	1800	0	1800	PICKUP	\N	Vaishali Nagar, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:22.48	2026-09-01 09:27:22.48	\N	\N	2026-09-02 09:27:22.48	2026-09-02 09:27:22.48	2026-09-02 09:27:22.48	\N	2026-09-01 09:27:22.48
cmv51tcp3009zuhm8kq9ujs3n	DB-2026-200221	cmv51tcp1009xuhm88ccjxk19	\N	cmv51tc7e0003uhm8dtplheat	cmv51tcoo009nuhm8ipomqjvq	7200	0	7200	PICKUP	\N	C-Scheme, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:22.502	2026-08-27 09:27:22.502	\N	\N	2026-08-28 09:27:22.502	2026-08-28 09:27:22.502	2026-08-28 09:27:22.502	\N	2026-08-27 09:27:22.502
cmv51tcpp00aeuhm80g1czlct	DB-2026-200231	cmv51tcpm00acuhm88p53deoz	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tcpc00a4uhm8oc5qxijn	900	0	900	PICKUP	\N	Sector 18, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:22.524	2026-08-22 09:27:22.524	\N	\N	2026-08-23 09:27:22.524	2026-08-23 09:27:22.524	2026-08-23 09:27:22.524	\N	2026-08-22 09:27:22.524
cmv51tcqb00atuhm8q12c5w6g	DB-2026-200241	cmv51tcq800aruhm8kxeh687m	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tcpy00ajuhm8emqmn0z2	2800	0	2800	PICKUP	\N	Sector 18, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:22.546	2026-09-26 09:27:22.546	\N	\N	2026-09-27 09:27:22.546	2026-09-27 09:27:22.546	2026-09-27 09:27:22.546	\N	2026-09-26 09:27:22.546
cmv51tcqz00b8uhm8fa8q9h97	DB-2026-200251	cmv51tcqw00b6uhm8tt559ko0	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcqk00ayuhm8ofjcpehc	4200	0	4200	PICKUP	\N	Sector 18, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:22.57	2026-09-21 09:27:22.57	\N	\N	2026-09-22 09:27:22.57	2026-09-22 09:27:22.57	2026-09-22 09:27:22.57	\N	2026-09-21 09:27:22.57
cmv51tcrj00bnuhm8lmum5b7p	DB-2026-200261	cmv51tcrg00bluhm8ogi4y10k	\N	cmv51tc750001uhm8fc07n2du	cmv51tcr700bduhm8j50zp6hr	1600	0	1600	PICKUP	\N	Sector 50, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:22.59	2026-09-16 09:27:22.59	\N	\N	2026-09-17 09:27:22.59	2026-09-17 09:27:22.59	2026-09-17 09:27:22.59	\N	2026-09-16 09:27:22.59
cmv51tcs500c2uhm8xg744i6i	DB-2026-200271	cmv51tcs200c0uhm8ps04cj6h	\N	cmv51tc790002uhm8amm39sxb	cmv51tcrs00bsuhm8c5q9kc1i	14500	0	14500	PICKUP	\N	Sector 50, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:22.612	2026-09-11 09:27:22.612	\N	\N	2026-09-12 09:27:22.612	2026-09-12 09:27:22.612	2026-09-12 09:27:22.612	\N	2026-09-11 09:27:22.612
cmv51tcsp00chuhm8j5xunor7	DB-2026-200281	cmv51tcsn00cfuhm8vsdbvdgn	\N	cmv51tc7e0003uhm8dtplheat	cmv51tcsd00c7uhm8tmo56vlo	1800	0	1800	PICKUP	\N	Sector 61, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:22.632	2026-09-06 09:27:22.632	\N	\N	2026-09-07 09:27:22.632	2026-09-07 09:27:22.632	2026-09-07 09:27:22.632	\N	2026-09-06 09:27:22.632
cmv51tct900cwuhm85byosyud	DB-2026-200291	cmv51tct700cuuhm8qly3446v	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tcsx00cmuhm8hznxusn2	700	0	700	PICKUP	\N	Sector 61, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:22.652	2026-09-01 09:27:22.652	\N	\N	2026-09-02 09:27:22.652	2026-09-02 09:27:22.652	2026-09-02 09:27:22.652	\N	2026-09-01 09:27:22.652
cmv51tctv00dbuhm815o02rx6	DB-2026-200301	cmv51tcts00d9uhm89jtayoow	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tcti00d1uhm8xkgp5mta	3500	0	3500	PICKUP	\N	Sector 62, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:22.674	2026-08-27 09:27:22.674	\N	\N	2026-08-28 09:27:22.674	2026-08-28 09:27:22.674	2026-08-28 09:27:22.674	\N	2026-08-27 09:27:22.674
cmv51tcug00dquhm8g537k38x	DB-2026-200311	cmv51tcue00douhm8zzukfz1s	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcu500dguhm88atkf6z3	800	0	800	PICKUP	\N	Sector 62, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:22.695	2026-08-22 09:27:22.695	\N	\N	2026-08-23 09:27:22.695	2026-08-23 09:27:22.695	2026-08-23 09:27:22.695	\N	2026-08-22 09:27:22.695
cmv51tcv100e5uhm8q5ncyyf4	DB-2026-200321	cmv51tcuz00e3uhm8wtw1a1x5	\N	cmv51tc750001uhm8fc07n2du	cmv51tcup00dvuhm8ons2j78m	4200	0	4200	PICKUP	\N	Sector 74, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:22.716	2026-09-26 09:27:22.716	\N	\N	2026-09-27 09:27:22.716	2026-09-27 09:27:22.716	2026-09-27 09:27:22.716	\N	2026-09-26 09:27:22.716
cmv51tcvo00ekuhm82nbqrjan	DB-2026-200331	cmv51tcvl00eiuhm8wgyusfe7	\N	cmv51tc790002uhm8amm39sxb	cmv51tcva00eauhm801p8125h	2600	0	2600	PICKUP	\N	Sector 74, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:22.739	2026-09-21 09:27:22.739	\N	\N	2026-09-22 09:27:22.739	2026-09-22 09:27:22.739	2026-09-22 09:27:22.739	\N	2026-09-21 09:27:22.739
cmv51tcwa00ezuhm8goajwmc4	DB-2026-200341	cmv51tcw800exuhm81pkyybej	\N	cmv51tc7e0003uhm8dtplheat	cmv51tcvx00epuhm81f0vvd48	900	0	900	PICKUP	\N	Sector 76, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:22.762	2026-09-16 09:27:22.762	\N	\N	2026-09-17 09:27:22.762	2026-09-17 09:27:22.762	2026-09-17 09:27:22.762	\N	2026-09-16 09:27:22.762
cmv51tcwy00feuhm85mu0i797	DB-2026-200351	cmv51tcww00fcuhm8ps1jmiij	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tcwl00f4uhm8xd2n2dpo	2800	0	2800	PICKUP	\N	Sector 76, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:22.785	2026-09-11 09:27:22.785	\N	\N	2026-09-12 09:27:22.785	2026-09-12 09:27:22.785	2026-09-12 09:27:22.785	\N	2026-09-11 09:27:22.785
cmv51tcxk00ftuhm88dwq50gq	DB-2026-200361	cmv51tcxh00fruhm8zrojlq7j	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tcx800fjuhm8gtn4c7i7	14500	0	14500	PICKUP	\N	Sector 137, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:22.807	2026-09-06 09:27:22.807	\N	\N	2026-09-07 09:27:22.807	2026-09-07 09:27:22.807	2026-09-07 09:27:22.807	\N	2026-09-06 09:27:22.807
cmv51tcye00g8uhm8tj2fa4sv	DB-2026-200371	cmv51tcyb00g6uhm8d0oqtzez	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcy100fyuhm8kz5j5o5z	1500	0	1500	PICKUP	\N	Sector 137, Noida	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:22.837	2026-09-01 09:27:22.837	\N	\N	2026-09-02 09:27:22.837	2026-09-02 09:27:22.837	2026-09-02 09:27:22.837	\N	2026-09-01 09:27:22.837
cmv51tcz400gnuhm8bsord18k	DB-2026-200381	cmv51tcz100gluhm81vxhuyqx	\N	cmv51tc750001uhm8fc07n2du	cmv51tcyo00gduhm80czpt8wj	700	0	700	PICKUP	\N	Saket, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:22.863	2026-08-27 09:27:22.863	\N	\N	2026-08-28 09:27:22.863	2026-08-28 09:27:22.863	2026-08-28 09:27:22.863	\N	2026-08-27 09:27:22.863
cmv51tczs00h2uhm81jln6fv8	DB-2026-200391	cmv51tczp00h0uhm80cqo2tv7	\N	cmv51tc790002uhm8amm39sxb	cmv51tcze00gsuhm8wx06xo2s	1600	0	1600	PICKUP	\N	Saket, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:22.887	2026-08-22 09:27:22.887	\N	\N	2026-08-23 09:27:22.887	2026-08-23 09:27:22.887	2026-08-23 09:27:22.887	\N	2026-08-22 09:27:22.887
cmv51td0f00hhuhm8r0bxvdgb	DB-2026-200401	cmv51td0c00hfuhm8xt5fxbfx	\N	cmv51tc7e0003uhm8dtplheat	cmv51td0100h7uhm8i1idvzp7	14500	0	14500	PICKUP	\N	Saket, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:22.91	2026-09-26 09:27:22.91	\N	\N	2026-09-27 09:27:22.91	2026-09-27 09:27:22.91	2026-09-27 09:27:22.91	\N	2026-09-26 09:27:22.91
cmv51td1200hwuhm8989vi5c0	DB-2026-200411	cmv51td1000huuhm8suvw0ghi	\N	cmuv6m9180001uh7syb2m1tr0	cmv51td0o00hmuhm8spwsa97c	3500	0	3500	PICKUP	\N	Lajpat Nagar, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:22.934	2026-09-21 09:27:22.934	\N	\N	2026-09-22 09:27:22.934	2026-09-22 09:27:22.934	2026-09-22 09:27:22.934	\N	2026-09-21 09:27:22.934
cmv51td1q00ibuhm8wcsdjxq2	DB-2026-200421	cmv51td1n00i9uhm8393ux3x7	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51td1c00i1uhm8xu5jqybo	800	0	800	PICKUP	\N	Lajpat Nagar, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:22.957	2026-09-16 09:27:22.957	\N	\N	2026-09-17 09:27:22.957	2026-09-17 09:27:22.957	2026-09-17 09:27:22.957	\N	2026-09-16 09:27:22.957
cmv51td2d00iquhm8p6fiscu1	DB-2026-200431	cmv51td2a00iouhm81skd48en	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51td1z00iguhm8vdgvm19j	4200	0	4200	PICKUP	\N	Dwarka, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:22.98	2026-09-11 09:27:22.98	\N	\N	2026-09-12 09:27:22.98	2026-09-12 09:27:22.98	2026-09-12 09:27:22.98	\N	2026-09-11 09:27:22.98
cmv51td3000j5uhm8coiiplps	DB-2026-200441	cmv51td2x00j3uhm8j2xdbpcf	\N	cmv51tc750001uhm8fc07n2du	cmv51td2n00ivuhm8nc5681p5	2600	0	2600	PICKUP	\N	Dwarka, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:23.003	2026-09-06 09:27:23.003	\N	\N	2026-09-07 09:27:23.003	2026-09-07 09:27:23.003	2026-09-07 09:27:23.003	\N	2026-09-06 09:27:23.003
cmv51td3o00jkuhm8h17gczci	DB-2026-200451	cmv51td3l00jiuhm8z7eml1h3	\N	cmv51tc790002uhm8amm39sxb	cmv51td3900jauhm8a86jcb4t	900	0	900	PICKUP	\N	Rohini, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:23.027	2026-09-01 09:27:23.027	\N	\N	2026-09-02 09:27:23.027	2026-09-02 09:27:23.027	2026-09-02 09:27:23.027	\N	2026-09-01 09:27:23.027
cmv51td4900jzuhm8nd41f734	DB-2026-200461	cmv51td4700jxuhm8gr6fpxys	\N	cmv51tc7e0003uhm8dtplheat	cmv51td3x00jpuhm8a3oeqzkz	2800	0	2800	PICKUP	\N	Rohini, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:23.048	2026-08-27 09:27:23.048	\N	\N	2026-08-28 09:27:23.048	2026-08-28 09:27:23.048	2026-08-28 09:27:23.048	\N	2026-08-27 09:27:23.048
cmv51td4t00keuhm8mzxltlv6	DB-2026-200471	cmv51td4q00kcuhm8ilytrzb3	\N	cmuv6m9180001uh7syb2m1tr0	cmv51td4h00k4uhm8ps06px67	14500	0	14500	PICKUP	\N	Karol Bagh, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:23.068	2026-08-22 09:27:23.068	\N	\N	2026-08-23 09:27:23.068	2026-08-23 09:27:23.068	2026-08-23 09:27:23.068	\N	2026-08-22 09:27:23.068
cmv51td5e00ktuhm8qykfbom0	DB-2026-200481	cmv51td5b00kruhm8gtye217v	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51td5200kjuhm8uf7iq953	1500	0	1500	PICKUP	\N	Karol Bagh, Delhi	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:23.089	2026-09-26 09:27:23.089	\N	\N	2026-09-27 09:27:23.089	2026-09-27 09:27:23.089	2026-09-27 09:27:23.089	\N	2026-09-26 09:27:23.089
cmv51td5z00l8uhm8p86ukqxq	DB-2026-200491	cmv51td5x00l6uhm819b7eg6q	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51td5l00kyuhm8k816nrq0	14500	0	14500	PICKUP	\N	Indirapuram, Ghaziabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:23.11	2026-09-21 09:27:23.11	\N	\N	2026-09-22 09:27:23.11	2026-09-22 09:27:23.11	2026-09-22 09:27:23.11	\N	2026-09-21 09:27:23.11
cmv51td6o00lnuhm8iu43n0k2	DB-2026-200501	cmv51td6l00lluhm8hyym57qh	\N	cmv51tc750001uhm8fc07n2du	cmv51td6900lduhm8x84bxr3q	1500	0	1500	PICKUP	\N	Indirapuram, Ghaziabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:23.135	2026-09-16 09:27:23.135	\N	\N	2026-09-17 09:27:23.135	2026-09-17 09:27:23.135	2026-09-17 09:27:23.135	\N	2026-09-16 09:27:23.135
cmv51td7800m2uhm8o02ulctu	DB-2026-200511	cmv51td7500m0uhm8g2n8naao	\N	cmv51tc790002uhm8amm39sxb	cmv51td6w00lsuhm8vfmd0cgu	800	0	800	PICKUP	\N	Vaishali, Ghaziabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:23.155	2026-09-11 09:27:23.155	\N	\N	2026-09-12 09:27:23.155	2026-09-12 09:27:23.155	2026-09-12 09:27:23.155	\N	2026-09-11 09:27:23.155
cmv51td7r00mhuhm8cutbo8fb	DB-2026-200521	cmv51td7p00mfuhm8no01h80k	\N	cmv51tc7e0003uhm8dtplheat	cmv51td7f00m7uhm8b4l6hyk2	1800	0	1800	PICKUP	\N	Vaishali, Ghaziabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:23.174	2026-09-06 09:27:23.174	\N	\N	2026-09-07 09:27:23.174	2026-09-07 09:27:23.174	2026-09-07 09:27:23.174	\N	2026-09-06 09:27:23.174
cmv51td8d00mwuhm824d9fhad	DB-2026-200531	cmv51td8a00muuhm8mp1dthj5	\N	cmuv6m9180001uh7syb2m1tr0	cmv51td7z00mmuhm8ngklrx4o	800	0	800	PICKUP	\N	Raj Nagar Extension, Ghaziabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:23.196	2026-09-01 09:27:23.196	\N	\N	2026-09-02 09:27:23.196	2026-09-02 09:27:23.196	2026-09-02 09:27:23.196	\N	2026-09-01 09:27:23.196
cmv51td8y00nbuhm8jui70dy2	DB-2026-200541	cmv51td8w00n9uhm873ivvekk	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51td8m00n1uhm8nerfktld	4200	0	4200	PICKUP	\N	DLF Phase 3, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:23.217	2026-08-27 09:27:23.217	\N	\N	2026-08-28 09:27:23.217	2026-08-28 09:27:23.217	2026-08-28 09:27:23.217	\N	2026-08-27 09:27:23.217
cmv51td9q00nquhm8vg798gko	DB-2026-200551	cmv51td9m00nouhm84oqmca96	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51td9a00nguhm8xo8mdqu8	2600	0	2600	PICKUP	\N	DLF Phase 3, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:23.244	2026-08-22 09:27:23.244	\N	\N	2026-08-23 09:27:23.244	2026-08-23 09:27:23.244	2026-08-23 09:27:23.244	\N	2026-08-22 09:27:23.244
cmv51tdbj00o5uhm86j6kh1ao	DB-2026-200561	cmv51tdbe00o3uhm8q1csm72d	\N	cmv51tc750001uhm8fc07n2du	cmv51tda000nvuhm8zwxizw4q	3500	0	3500	PICKUP	\N	DLF Phase 3, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:23.308	2026-09-26 09:27:23.308	\N	\N	2026-09-27 09:27:23.308	2026-09-27 09:27:23.308	2026-09-27 09:27:23.308	\N	2026-09-26 09:27:23.308
cmv51tdce00okuhm862o9o87z	DB-2026-200571	cmv51tdcb00oiuhm8cgagg93d	\N	cmv51tc790002uhm8amm39sxb	cmv51tdbz00oauhm8omxibygu	1500	0	1500	PICKUP	\N	Sohna Road, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:23.341	2026-09-21 09:27:23.341	\N	\N	2026-09-22 09:27:23.341	2026-09-22 09:27:23.341	2026-09-22 09:27:23.341	\N	2026-09-21 09:27:23.341
cmv51tdd100ozuhm8izo9ejsm	DB-2026-200581	cmv51tdcy00oxuhm8nz3q6r5q	\N	cmv51tc7e0003uhm8dtplheat	cmv51tdco00opuhm8w8yd45sm	900	0	900	PICKUP	\N	Sohna Road, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:23.364	2026-09-16 09:27:23.364	\N	\N	2026-09-17 09:27:23.364	2026-09-17 09:27:23.364	2026-09-17 09:27:23.364	\N	2026-09-16 09:27:23.364
cmv51tddl00peuhm8q2am078a	DB-2026-200591	cmv51tddj00pcuhm8t83qkigj	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tdd900p4uhm89l74qfpy	1600	0	1600	PICKUP	\N	Golf Course Road, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:23.384	2026-09-11 09:27:23.384	\N	\N	2026-09-12 09:27:23.384	2026-09-12 09:27:23.384	2026-09-12 09:27:23.384	\N	2026-09-11 09:27:23.384
cmv51tde600ptuhm8puh6pwiq	DB-2026-200601	cmv51tde300pruhm8ydv55lce	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tddu00pjuhm8wt0p0hpr	14500	0	14500	PICKUP	\N	Golf Course Road, Gurgaon	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:23.405	2026-09-06 09:27:23.405	\N	\N	2026-09-07 09:27:23.405	2026-09-07 09:27:23.405	2026-09-07 09:27:23.405	\N	2026-09-06 09:27:23.405
cmv51tder00q8uhm8jijxhmku	DB-2026-200611	cmv51tdeo00q6uhm8wacflou6	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdee00pyuhm8mx8iayt1	1800	0	1800	PICKUP	\N	Andheri West, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:23.426	2026-09-01 09:27:23.426	\N	\N	2026-09-02 09:27:23.426	2026-09-02 09:27:23.426	2026-09-02 09:27:23.426	\N	2026-09-01 09:27:23.426
cmv51tdfc00qnuhm823z4l502	DB-2026-200621	cmv51tdf900qluhm8575dsdla	\N	cmv51tc750001uhm8fc07n2du	cmv51tdez00qduhm8i8yw4wnk	700	0	700	PICKUP	\N	Andheri West, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:23.447	2026-08-27 09:27:23.447	\N	\N	2026-08-28 09:27:23.447	2026-08-28 09:27:23.447	2026-08-28 09:27:23.447	\N	2026-08-27 09:27:23.447
cmv51tdg100r2uhm8s6plgx1y	DB-2026-200631	cmv51tdfy00r0uhm8cahouin6	\N	cmv51tc790002uhm8amm39sxb	cmv51tdfm00qsuhm883vw6g8t	1600	0	1600	PICKUP	\N	Andheri West, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:23.472	2026-08-22 09:27:23.472	\N	\N	2026-08-23 09:27:23.472	2026-08-23 09:27:23.472	2026-08-23 09:27:23.472	\N	2026-08-22 09:27:23.472
cmv51tdgp00rhuhm8u930s56e	DB-2026-200641	cmv51tdgm00rfuhm80cl4yev4	\N	cmv51tc7e0003uhm8dtplheat	cmv51tdga00r7uhm8ia6axlrn	2600	0	2600	PICKUP	\N	Versova, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:23.496	2026-09-26 09:27:23.496	\N	\N	2026-09-27 09:27:23.496	2026-09-27 09:27:23.496	2026-09-27 09:27:23.496	\N	2026-09-26 09:27:23.496
cmv51tdhd00rwuhm8c4po939c	DB-2026-200651	cmv51tdha00ruuhm804gw261n	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tdgy00rmuhm8n3otph93	3500	0	3500	PICKUP	\N	Versova, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:23.52	2026-09-21 09:27:23.52	\N	\N	2026-09-22 09:27:23.52	2026-09-22 09:27:23.52	2026-09-22 09:27:23.52	\N	2026-09-21 09:27:23.52
cmv51tdhy00sbuhm8iclkzhdr	DB-2026-200661	cmv51tdhv00s9uhm8p016m4l5	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tdhm00s1uhm84c40hf27	2800	0	2800	PICKUP	\N	Bandra, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:23.541	2026-09-16 09:27:23.541	\N	\N	2026-09-17 09:27:23.541	2026-09-17 09:27:23.541	2026-09-17 09:27:23.541	\N	2026-09-16 09:27:23.541
cmv51tdim00squhm8redynqii	DB-2026-200671	cmv51tdij00souhm80c9qtpso	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdi900sguhm89dvu0p80	4200	0	4200	PICKUP	\N	Bandra, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:23.565	2026-09-11 09:27:23.565	\N	\N	2026-09-12 09:27:23.565	2026-09-12 09:27:23.565	2026-09-12 09:27:23.565	\N	2026-09-11 09:27:23.565
cmv51tdj700t5uhm8v0cvi53f	DB-2026-200681	cmv51tdj400t3uhm8wl2lzwpb	\N	cmv51tc750001uhm8fc07n2du	cmv51tdit00svuhm8c3tkn9xq	1500	0	1500	PICKUP	\N	Powai, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:23.586	2026-09-06 09:27:23.586	\N	\N	2026-09-07 09:27:23.586	2026-09-07 09:27:23.586	2026-09-07 09:27:23.586	\N	2026-09-06 09:27:23.586
cmv51tdjt00tkuhm88xum0hnj	DB-2026-200691	cmv51tdjr00tiuhm8oqsyn4sv	\N	cmv51tc790002uhm8amm39sxb	cmv51tdjg00tauhm8jkqzx6b7	900	0	900	PICKUP	\N	Powai, Mumbai	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:23.609	2026-09-01 09:27:23.609	\N	\N	2026-09-02 09:27:23.609	2026-09-02 09:27:23.609	2026-09-02 09:27:23.609	\N	2026-09-01 09:27:23.609
cmv51tdke00tzuhm81z2cmiw6	DB-2026-200701	cmv51tdkc00txuhm8u1pkypi5	\N	cmv51tc7e0003uhm8dtplheat	cmv51tdk100tpuhm80l7cdar4	1600	0	1600	PICKUP	\N	Indiranagar, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:23.629	2026-08-27 09:27:23.629	\N	\N	2026-08-28 09:27:23.629	2026-08-28 09:27:23.629	2026-08-28 09:27:23.629	\N	2026-08-27 09:27:23.629
cmv51tdky00ueuhm8q2qscrtk	DB-2026-200711	cmv51tdkw00ucuhm8nfsp7khm	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tdkn00u4uhm84zbj002k	14500	0	14500	PICKUP	\N	Indiranagar, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:23.65	2026-08-22 09:27:23.65	\N	\N	2026-08-23 09:27:23.65	2026-08-23 09:27:23.65	2026-08-23 09:27:23.65	\N	2026-08-22 09:27:23.65
cmv51tdli00utuhm86j95ejtl	DB-2026-200721	cmv51tdlg00uruhm86luss2g3	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tdl600ujuhm8gkh2m2z0	1800	0	1800	PICKUP	\N	Koramangala, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:23.669	2026-09-26 09:27:23.669	\N	\N	2026-09-27 09:27:23.669	2026-09-27 09:27:23.669	2026-09-27 09:27:23.669	\N	2026-09-26 09:27:23.669
cmv51tdm200v8uhm8lcu8zmfo	DB-2026-200731	cmv51tdlz00v6uhm8ecfdxdwj	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdlq00uyuhm87ibtd394	700	0	700	PICKUP	\N	Koramangala, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:23.689	2026-09-21 09:27:23.689	\N	\N	2026-09-22 09:27:23.689	2026-09-22 09:27:23.689	2026-09-22 09:27:23.689	\N	2026-09-21 09:27:23.689
cmv51tdmm00vnuhm8lylyqxsv	DB-2026-200741	cmv51tdmk00vluhm8m9tz4gp3	\N	cmv51tc750001uhm8fc07n2du	cmv51tdmb00vduhm8zuvxwxdq	1600	0	1600	PICKUP	\N	Koramangala, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:23.709	2026-09-16 09:27:23.709	\N	\N	2026-09-17 09:27:23.709	2026-09-17 09:27:23.709	2026-09-17 09:27:23.709	\N	2026-09-16 09:27:23.709
cmv51tdn700w2uhm80b2ylmcf	DB-2026-200751	cmv51tdn400w0uhm86zm2cq2t	\N	cmv51tc790002uhm8amm39sxb	cmv51tdmu00vsuhm8r0ii6tt1	2600	0	2600	PICKUP	\N	HSR Layout, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:23.73	2026-09-11 09:27:23.73	\N	\N	2026-09-12 09:27:23.73	2026-09-12 09:27:23.73	2026-09-12 09:27:23.73	\N	2026-09-11 09:27:23.73
cmv51tdnu00whuhm8rv73xvsk	DB-2026-200761	cmv51tdnq00wfuhm866b9pocj	\N	cmv51tc7e0003uhm8dtplheat	cmv51tdnf00w7uhm83ao4b4yq	3500	0	3500	PICKUP	\N	HSR Layout, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:23.752	2026-09-06 09:27:23.752	\N	\N	2026-09-07 09:27:23.752	2026-09-07 09:27:23.752	2026-09-07 09:27:23.752	\N	2026-09-06 09:27:23.752
cmv51tdos00wwuhm8a38bb3s7	DB-2026-200771	cmv51tdoo00wuuhm8d3xbnz4b	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tdo900wmuhm8k2isgtds	2800	0	2800	PICKUP	\N	Whitefield, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:23.787	2026-09-01 09:27:23.787	\N	\N	2026-09-02 09:27:23.787	2026-09-02 09:27:23.787	2026-09-02 09:27:23.787	\N	2026-09-01 09:27:23.787
cmv51tdpm00xbuhm8aeu1zkwk	DB-2026-200781	cmv51tdpj00x9uhm89p9vfxcg	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tdp400x1uhm8aw9nl0eo	4200	0	4200	PICKUP	\N	Whitefield, Bangalore	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:23.817	2026-08-27 09:27:23.817	\N	\N	2026-08-28 09:27:23.817	2026-08-28 09:27:23.817	2026-08-28 09:27:23.817	\N	2026-08-27 09:27:23.817
cmv51tdqd00xquhm8qtls1dze	DB-2026-200791	cmv51tdqa00xouhm8bgaoosxh	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdpx00xguhm8pl0m36an	1500	0	1500	PICKUP	\N	Kothrud, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:23.844	2026-08-22 09:27:23.844	\N	\N	2026-08-23 09:27:23.844	2026-08-23 09:27:23.844	2026-08-23 09:27:23.844	\N	2026-08-22 09:27:23.844
cmv51tdr000y5uhm8fjkja33b	DB-2026-200801	cmv51tdqx00y3uhm8kvss089z	\N	cmv51tc750001uhm8fc07n2du	cmv51tdqn00xvuhm890r05g7v	900	0	900	PICKUP	\N	Kothrud, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:23.867	2026-09-26 09:27:23.867	\N	\N	2026-09-27 09:27:23.867	2026-09-27 09:27:23.867	2026-09-27 09:27:23.867	\N	2026-09-26 09:27:23.867
cmv51tdrm00ykuhm83okj1rvk	DB-2026-200811	cmv51tdrj00yiuhm86gx2nu4l	\N	cmv51tc790002uhm8amm39sxb	cmv51tdr900yauhm8vep96ors	2800	0	2800	PICKUP	\N	Kothrud, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:23.889	2026-09-21 09:27:23.889	\N	\N	2026-09-22 09:27:23.889	2026-09-22 09:27:23.889	2026-09-22 09:27:23.889	\N	2026-09-21 09:27:23.889
cmv51tds900yzuhm8uo1gcmby	DB-2026-200821	cmv51tds600yxuhm8ke600g49	\N	cmv51tc7e0003uhm8dtplheat	cmv51tdrv00ypuhm86dbijx4a	800	0	800	PICKUP	\N	Karve Nagar, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:23.912	2026-09-16 09:27:23.912	\N	\N	2026-09-17 09:27:23.912	2026-09-17 09:27:23.912	2026-09-17 09:27:23.912	\N	2026-09-16 09:27:23.912
cmv51tdsv00zeuhm8m6pi7aiq	DB-2026-200831	cmv51tdst00zcuhm8n2enrmdf	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tdsj00z4uhm8owzgcwef	1800	0	1800	PICKUP	\N	Karve Nagar, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:23.934	2026-09-11 09:27:23.934	\N	\N	2026-09-12 09:27:23.934	2026-09-12 09:27:23.934	2026-09-12 09:27:23.934	\N	2026-09-11 09:27:23.934
cmv51tdti00ztuhm855tvmjbv	DB-2026-200841	cmv51tdtf00zruhm8x4w0se9s	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tdt500zjuhm8ppl8gnu2	700	0	700	PICKUP	\N	Karve Nagar, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:23.957	2026-09-06 09:27:23.957	\N	\N	2026-09-07 09:27:23.957	2026-09-07 09:27:23.957	2026-09-07 09:27:23.957	\N	2026-09-06 09:27:23.957
cmv51tdu40108uhm8p77hidkj	DB-2026-200851	cmv51tdu00106uhm8ef5gvxlz	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdtq00zyuhm83gt0nnq6	3500	0	3500	PICKUP	\N	Baner, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:23.979	2026-09-01 09:27:23.979	\N	\N	2026-09-02 09:27:23.979	2026-09-02 09:27:23.979	2026-09-02 09:27:23.979	\N	2026-09-01 09:27:23.979
cmv51tdut010nuhm8c0obievs	DB-2026-200861	cmv51tduq010luhm8ggehasl9	\N	cmv51tc750001uhm8fc07n2du	cmv51tdug010duhm85ll0kqov	800	0	800	PICKUP	\N	Baner, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:24.004	2026-08-27 09:27:24.004	\N	\N	2026-08-28 09:27:24.004	2026-08-28 09:27:24.004	2026-08-28 09:27:24.004	\N	2026-08-27 09:27:24.004
cmv51tdvg0112uhm84av5nkq9	DB-2026-200871	cmv51tdvd0110uhm8p1zyhd97	\N	cmv51tc790002uhm8amm39sxb	cmv51tdv0010suhm84ynyknma	4200	0	4200	PICKUP	\N	Viman Nagar, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:24.028	2026-08-22 09:27:24.028	\N	\N	2026-08-23 09:27:24.028	2026-08-23 09:27:24.028	2026-08-23 09:27:24.028	\N	2026-08-22 09:27:24.028
cmv51tdvz011huhm86jwnmrpj	DB-2026-200881	cmv51tdvx011fuhm8wsn12z16	\N	cmv51tc7e0003uhm8dtplheat	cmv51tdvo0117uhm8s25m88ah	2600	0	2600	PICKUP	\N	Viman Nagar, Pune	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:24.046	2026-09-26 09:27:24.046	\N	\N	2026-09-27 09:27:24.046	2026-09-27 09:27:24.046	2026-09-27 09:27:24.046	\N	2026-09-26 09:27:24.046
cmv51tdwh011wuhm8k271tts0	DB-2026-200891	cmv51tdwf011uuhm839l5bi55	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tdw7011muhm8acqd0ur7	900	0	900	PICKUP	\N	Gachibowli, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:24.064	2026-09-21 09:27:24.064	\N	\N	2026-09-22 09:27:24.064	2026-09-22 09:27:24.064	2026-09-22 09:27:24.064	\N	2026-09-21 09:27:24.064
cmv51tdwz012buhm8zj3shixd	DB-2026-200901	cmv51tdwx0129uhm81qkhturv	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tdwo0121uhm8pm9z258g	2800	0	2800	PICKUP	\N	Gachibowli, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:24.082	2026-09-16 09:27:24.082	\N	\N	2026-09-17 09:27:24.082	2026-09-17 09:27:24.082	2026-09-17 09:27:24.082	\N	2026-09-16 09:27:24.082
cmv51tdxi012quhm89mitsau7	DB-2026-200911	cmv51tdxg012ouhm869ro61o5	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdx8012guhm8hhwhph59	4200	0	4200	PICKUP	\N	Gachibowli, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:24.101	2026-09-11 09:27:24.101	\N	\N	2026-09-12 09:27:24.101	2026-09-12 09:27:24.101	2026-09-12 09:27:24.101	\N	2026-09-11 09:27:24.101
cmv51tdy20135uhm8fqynd3n5	DB-2026-200921	cmv51tdxz0133uhm8paaknslk	\N	cmv51tc750001uhm8fc07n2du	cmv51tdxq012vuhm82jm3aclj	1600	0	1600	PICKUP	\N	Kondapur, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:24.121	2026-09-06 09:27:24.121	\N	\N	2026-09-07 09:27:24.121	2026-09-07 09:27:24.121	2026-09-07 09:27:24.121	\N	2026-09-06 09:27:24.121
cmv51tdym013kuhm8xsy16c3g	DB-2026-200931	cmv51tdyj013iuhm81wfkxdlp	\N	cmv51tc790002uhm8amm39sxb	cmv51tdy9013auhm8t2ifvjag	14500	0	14500	PICKUP	\N	Kondapur, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:24.141	2026-09-01 09:27:24.141	\N	\N	2026-09-02 09:27:24.141	2026-09-02 09:27:24.141	2026-09-02 09:27:24.141	\N	2026-09-01 09:27:24.141
cmv51tdz5013zuhm8b7qk11cs	DB-2026-200941	cmv51tdz3013xuhm84ies6bf2	\N	cmv51tc7e0003uhm8dtplheat	cmv51tdyv013puhm8gfh0n8ai	1800	0	1800	PICKUP	\N	Madhapur, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:24.161	2026-08-27 09:27:24.161	\N	\N	2026-08-28 09:27:24.161	2026-08-28 09:27:24.161	2026-08-28 09:27:24.161	\N	2026-08-27 09:27:24.161
cmv51tdzn014euhm8ufjdhju2	DB-2026-200951	cmv51tdzm014cuhm87qciaffx	\N	cmuv6m9180001uh7syb2m1tr0	cmv51tdzd0144uhm8uhia8tr2	700	0	700	PICKUP	\N	Madhapur, Hyderabad	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-22 09:27:24.179	2026-08-22 09:27:24.179	\N	\N	2026-08-23 09:27:24.179	2026-08-23 09:27:24.179	2026-08-23 09:27:24.179	\N	2026-08-22 09:27:24.179
cmv51te05014tuhm8okdrqy10	DB-2026-200961	cmv51te03014ruhm8zesg6lw6	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51tdzu014juhm84jkmz4ig	3500	0	3500	PICKUP	\N	Malviya Nagar, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-26 09:27:24.196	2026-09-26 09:27:24.196	\N	\N	2026-09-27 09:27:24.196	2026-09-27 09:27:24.196	2026-09-27 09:27:24.196	\N	2026-09-26 09:27:24.196
cmv51te0u0158uhm8lg42oq08	DB-2026-200971	cmv51te0r0156uhm86mrfc3zx	\N	cmv51tc6j0000uhm8i9f9wa7o	cmv51te0g014yuhm8okz9rdef	800	0	800	PICKUP	\N	Malviya Nagar, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-21 09:27:24.221	2026-09-21 09:27:24.221	\N	\N	2026-09-22 09:27:24.221	2026-09-22 09:27:24.221	2026-09-22 09:27:24.221	\N	2026-09-21 09:27:24.221
cmv51te1h015nuhm8u9xvkpp0	DB-2026-200981	cmv51te1e015luhm8sovf8uyz	\N	cmv51tc750001uhm8fc07n2du	cmv51te13015duhm8qppusbxy	1800	0	1800	PICKUP	\N	Malviya Nagar, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-16 09:27:24.244	2026-09-16 09:27:24.244	\N	\N	2026-09-17 09:27:24.244	2026-09-17 09:27:24.244	2026-09-17 09:27:24.244	\N	2026-09-16 09:27:24.244
cmv51te1z0162uhm8p5l3369c	DB-2026-200991	cmv51te1x0160uhm8pgqhew7u	\N	cmv51tc790002uhm8amm39sxb	cmv51te1o015suhm82mapigal	2800	0	2800	PICKUP	\N	C-Scheme, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-11 09:27:24.262	2026-09-11 09:27:24.262	\N	\N	2026-09-12 09:27:24.262	2026-09-12 09:27:24.262	2026-09-12 09:27:24.262	\N	2026-09-11 09:27:24.262
cmv51te2i016huhm8dv174xyd	DB-2026-201001	cmv51te2g016fuhm8cltys8gc	\N	cmv51tc7e0003uhm8dtplheat	cmv51te260167uhm86xp7qc4f	4200	0	4200	PICKUP	\N	C-Scheme, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-06 09:27:24.281	2026-09-06 09:27:24.281	\N	\N	2026-09-07 09:27:24.281	2026-09-07 09:27:24.281	2026-09-07 09:27:24.281	\N	2026-09-06 09:27:24.281
cmv51te32016wuhm80vducvo0	DB-2026-201011	cmv51te2z016uuhm8fde4jje6	\N	cmuv6m9180001uh7syb2m1tr0	cmv51te2q016muhm8z7mpqxk3	1500	0	1500	PICKUP	\N	Vaishali Nagar, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-09-01 09:27:24.301	2026-09-01 09:27:24.301	\N	\N	2026-09-02 09:27:24.301	2026-09-02 09:27:24.301	2026-09-02 09:27:24.301	\N	2026-09-01 09:27:24.301
cmv51te3k017buhm8005yzjj9	DB-2026-201021	cmv51te3h0179uhm8dij0mql5	\N	cmuv6m91c0002uh7sx14c2ye6	cmv51te390171uhm8r8m26fv9	900	0	900	PICKUP	\N	Vaishali Nagar, Jaipur	Evening	\N	COMPLETED	2222	\N	\N	demo	2026-08-27 09:27:24.319	2026-08-27 09:27:24.319	\N	\N	2026-08-28 09:27:24.319	2026-08-28 09:27:24.319	2026-08-28 09:27:24.319	\N	2026-08-27 09:27:24.319
cmvp5l2fo0007uhsgztl6e312	DB-2026-838993	cmv51td3z00jruhm8j8spxdzk	cmvp5hvxe0001uhsgjmen4pl6	cmuv6m9140000uh7sue4vhajf	cmv51td3x00jpuhm8a3oeqzkz	2300	0	2300	PICKUP	\N	jsjsjs	19/11/2026	\N	CANCELLED	2324	\N	cod_1793012911167	cod	2026-10-26 11:08:31.171	\N	\N	\N	\N	\N	\N	2026-10-26 11:11:16.661	2026-10-26 11:08:17.94
cmv6bzeas0007uhv8lbsge12a	DB-2026-851066	cmv51tddb00p6uhm8p66hxqtz	cmv57951r0005uh8k98bhsl9i	cmv5792510001uh8koogdh7vy	cmv51tdd900p4uhm89l74qfpy	9000	0	9000	PICKUP	\N	Fate ke samne	12 baaje	\N	COMPLETED	9478	\N	cod_1791874799950	cod	2026-10-13 06:59:59.957	2026-10-13 07:07:43.02	\N	\N	2026-10-13 07:07:47.334	2026-10-13 07:08:46.879	2026-10-13 07:09:20.018	\N	2026-10-13 06:59:46.852
cmvthrypg000kuh24fs102dsz	DB-2026-711178	cmv51tc94000tuhm8vumk98rw	cmvthq1sm0008uh247bow1zqw	cmuv6m9140000uh7sue4vhajf	cmv51tc8v000luhm8gy1nhadz	1200	0	1200	PICKUP	\N	shs	sjhshs	\N	COMPLETED	2726	\N	cod_1793275250710	cod	2026-10-29 12:00:50.716	2026-10-29 12:01:11.147	\N	\N	2026-10-29 12:01:14.938	2026-10-29 12:01:43.963	2026-10-29 12:02:10.653	\N	2026-10-29 12:00:39.796
\.


--
-- Data for Name: Payout; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payout" (id, "orderId", "sellerId", amount, status, "paidAt", "createdAt") FROM stdin;
cmuv6m97r003cuh7sctgmtenk	cmuv6m97n003auh7s0r9it04d	cmuv6m91y0005uh7sne9aexuo	1200	PAID	2026-09-29 11:44:07.717	2026-10-05 11:44:07.72
cmuv6m98b003muh7szf8wbel5	cmuv6m987003kuh7s12knu2ft	cmuv6m91l0004uh7sn0nii9u7	9800	PAID	2026-08-16 11:44:07.737	2026-10-05 11:44:07.739
cmuv6m98n003uuh7s0lg83iqp	cmuv6m98j003suh7svpxsj9p9	cmuv6m91l0004uh7sn0nii9u7	14500	PAID	2026-08-01 11:44:07.749	2026-10-05 11:44:07.752
cmuv6m9900042uh7s8vdvgv35	cmuv6m98w0040uh7s3gj8pxuq	cmuv6m91l0004uh7sn0nii9u7	1500	PAID	2026-07-17 11:44:07.762	2026-10-05 11:44:07.764
cmv51tc8l000iuhm8eex5f8ds	cmv51tc8g000guhm83p9p2te6	cmv51tc7l0004uhm8v6egi0f3	4200	PAID	2026-09-23 09:27:21.908	2026-10-12 09:27:21.909
cmv51tc9b000zuhm8q0xhwbzm	cmv51tc98000xuhm8a371yr6f	cmv51tc8v000luhm8gy1nhadz	1200	PAID	2026-09-18 09:27:21.934	2026-10-12 09:27:21.935
cmv51tcan001guhm8m5azafwk	cmv51tcaf001euhm88s3ny0ok	cmv51tc9h0012uhm848ampvfo	6000	PAID	2026-09-13 09:27:21.982	2026-10-12 09:27:21.984
cmv51tcct001xuhm8x1kvdjit	cmv51tcck001vuhm8latikw4d	cmv51tcb7001juhm86jt72j5y	2500	PAID	2026-09-08 09:27:22.059	2026-10-12 09:27:22.061
cmv51tceb002cuhm8amh9dmax	cmv51tce8002auhm8bxumehc3	cmv51tcdc0020uhm89xbrvius	3500	PAID	2026-09-03 09:27:22.114	2026-10-12 09:27:22.116
cmv51tcf4002tuhm8b6l7qzfw	cmv51tcf1002ruhm8jyw2rz0f	cmv51tcek002fuhm8bc53jn6p	7500	PAID	2026-08-29 09:27:22.144	2026-10-12 09:27:22.145
cmv51tcfu003auhm8s9e6r9ah	cmv51tcfr0038uhm8lmapwxoq	cmv51tcfc002wuhm8kcykhz7c	3200	PAID	2026-08-24 09:27:22.169	2026-10-12 09:27:22.17
cmv51tcge003puhm81hd5222p	cmv51tcgb003nuhm8uihvtbs5	cmv51tcg0003duhm8civbu6c6	2400	PAID	2026-09-28 09:27:22.189	2026-10-12 09:27:22.19
cmv51tch10046uhm836xfg5dx	cmv51tcgy0044uhm8c0f4wgct	cmv51tcgj003suhm8hl3ylyak	3200	PAID	2026-09-23 09:27:22.212	2026-10-12 09:27:22.213
cmv51tchr004nuhm80l67uv5c	cmv51tcho004luhm8azqlbvhf	cmv51tch60049uhm8kwvp1g5f	4500	PAID	2026-09-18 09:27:22.238	2026-10-12 09:27:22.239
cmv51tcid0052uhm87m5qgshn	cmv51tcia0050uhm85o8m08ht	cmv51tchx004quhm8o1c09yoo	28000	PAID	2026-09-13 09:27:22.26	2026-10-12 09:27:22.262
cmv51tciz005juhm8nwq2r8i7	cmv51tcix005huhm8fx2enhre	cmv51tcij0055uhm8dwq91l9x	6500	PAID	2026-09-08 09:27:22.282	2026-10-12 09:27:22.283
cmv51tcjl005yuhm8r7okp0bk	cmv51tcji005wuhm88yp69w4c	cmv51tcj5005muhm8fcscj8o9	2200	PAID	2026-09-03 09:27:22.304	2026-10-12 09:27:22.305
cmv51tck7006fuhm8vfjttdpz	cmv51tck5006duhm8nkw3pmz6	cmv51tcjr0061uhm81w14fvbq	3500	PAID	2026-08-29 09:27:22.327	2026-10-12 09:27:22.328
cmv51tckx006wuhm8563f7xoj	cmv51tcku006uuhm86tepdb6n	cmv51tcke006iuhm8n33euzeb	9000	PAID	2026-08-24 09:27:22.352	2026-10-12 09:27:22.353
cmv51tclg007buhm8ogiyu421	cmv51tcld0079uhm8sox2kymc	cmv51tcl3006zuhm8g2ieril4	1500	PAID	2026-09-28 09:27:22.371	2026-10-12 09:27:22.372
cmv51tclx007quhm8jgiy2nmu	cmv51tclv007ouhm8yn4s7il8	cmv51tcll007euhm8upawpjlw	2800	PAID	2026-09-23 09:27:22.389	2026-10-12 09:27:22.39
cmv51tcmj0087uhm8yq0z765f	cmv51tcmg0085uhm8oyzv6msw	cmv51tcm2007tuhm8j5ky6d21	1900	PAID	2026-09-18 09:27:22.41	2026-10-12 09:27:22.411
cmv51tcn6008ouhm8dd0rch6m	cmv51tcn3008muhm8jpf7eykh	cmv51tcmo008auhm8d4bvpab3	14000	PAID	2026-09-13 09:27:22.433	2026-10-12 09:27:22.435
cmv51tcnw0093uhm8enmgar8h	cmv51tcnu0091uhm8sgah35uz	cmv51tcnf008ruhm8sk15hj8c	2200	PAID	2026-09-08 09:27:22.46	2026-10-12 09:27:22.461
cmv51tcoj009kuhm81fp1jjuu	cmv51tcog009iuhm83nwfe4eb	cmv51tco20096uhm83ziqhjzl	1800	PAID	2026-09-03 09:27:22.482	2026-10-12 09:27:22.483
cmv51tcp600a1uhm8fg5uf8op	cmv51tcp3009zuhm8kq9ujs3n	cmv51tcoo009nuhm8ipomqjvq	7200	PAID	2026-08-29 09:27:22.505	2026-10-12 09:27:22.506
cmv51tcps00aguhm8bdrwihus	cmv51tcpp00aeuhm80g1czlct	cmv51tcpc00a4uhm8oc5qxijn	900	PAID	2026-08-24 09:27:22.527	2026-10-12 09:27:22.528
cmv51tcqe00avuhm8s022yhae	cmv51tcqb00atuhm8q12c5w6g	cmv51tcpy00ajuhm8emqmn0z2	2800	PAID	2026-09-28 09:27:22.549	2026-10-12 09:27:22.55
cmv51tcr200bauhm8wml2ztge	cmv51tcqz00b8uhm8fa8q9h97	cmv51tcqk00ayuhm8ofjcpehc	4200	PAID	2026-09-23 09:27:22.573	2026-10-12 09:27:22.574
cmv51tcrm00bpuhm81e31xupo	cmv51tcrj00bnuhm8lmum5b7p	cmv51tcr700bduhm8j50zp6hr	1600	PAID	2026-09-18 09:27:22.593	2026-10-12 09:27:22.594
cmv51tcs700c4uhm8vq3kduue	cmv51tcs500c2uhm8xg744i6i	cmv51tcrs00bsuhm8c5q9kc1i	14500	PAID	2026-09-13 09:27:22.614	2026-10-12 09:27:22.615
cmv51tcsr00cjuhm8k6fzczb7	cmv51tcsp00chuhm8j5xunor7	cmv51tcsd00c7uhm8tmo56vlo	1800	PAID	2026-09-08 09:27:22.634	2026-10-12 09:27:22.636
cmv51tctc00cyuhm8mki2j4my	cmv51tct900cwuhm85byosyud	cmv51tcsx00cmuhm8hznxusn2	700	PAID	2026-09-03 09:27:22.655	2026-10-12 09:27:22.656
cmv51tctz00dduhm8q12arsu4	cmv51tctv00dbuhm815o02rx6	cmv51tcti00d1uhm8xkgp5mta	3500	PAID	2026-08-29 09:27:22.678	2026-10-12 09:27:22.679
cmv51tcuj00dsuhm8tfst3tqt	cmv51tcug00dquhm8g537k38x	cmv51tcu500dguhm88atkf6z3	800	PAID	2026-08-24 09:27:22.698	2026-10-12 09:27:22.699
cmv51tcv400e7uhm8goohy32d	cmv51tcv100e5uhm8q5ncyyf4	cmv51tcup00dvuhm8ons2j78m	4200	PAID	2026-09-28 09:27:22.719	2026-10-12 09:27:22.72
cmv51tcvr00emuhm8r2ksg6l3	cmv51tcvo00ekuhm82nbqrjan	cmv51tcva00eauhm801p8125h	2600	PAID	2026-09-23 09:27:22.742	2026-10-12 09:27:22.743
cmv51tcwd00f1uhm80b23zn7z	cmv51tcwa00ezuhm8goajwmc4	cmv51tcvx00epuhm81f0vvd48	900	PAID	2026-09-18 09:27:22.765	2026-10-12 09:27:22.766
cmv51tcx100fguhm85lakauwb	cmv51tcwy00feuhm85mu0i797	cmv51tcwl00f4uhm8xd2n2dpo	2800	PAID	2026-09-13 09:27:22.788	2026-10-12 09:27:22.789
cmv51tcxt00fvuhm88nc7lza4	cmv51tcxk00ftuhm88dwq50gq	cmv51tcx800fjuhm8gtn4c7i7	14500	PAID	2026-09-08 09:27:22.816	2026-10-12 09:27:22.817
cmv51tcyi00gauhm8fvktp2jo	cmv51tcye00g8uhm8tj2fa4sv	cmv51tcy100fyuhm8kz5j5o5z	1500	PAID	2026-09-03 09:27:22.841	2026-10-12 09:27:22.842
cmv51tcz700gpuhm8q1tmnqyq	cmv51tcz400gnuhm8bsord18k	cmv51tcyo00gduhm80czpt8wj	700	PAID	2026-08-29 09:27:22.866	2026-10-12 09:27:22.867
cmv51tczv00h4uhm8vtnxcz4l	cmv51tczs00h2uhm81jln6fv8	cmv51tcze00gsuhm8wx06xo2s	1600	PAID	2026-08-24 09:27:22.89	2026-10-12 09:27:22.891
cmv51td0i00hjuhm8162tetw4	cmv51td0f00hhuhm8r0bxvdgb	cmv51td0100h7uhm8i1idvzp7	14500	PAID	2026-09-28 09:27:22.913	2026-10-12 09:27:22.914
cmv51td1500hyuhm8ieztuimj	cmv51td1200hwuhm8989vi5c0	cmv51td0o00hmuhm8spwsa97c	3500	PAID	2026-09-23 09:27:22.936	2026-10-12 09:27:22.938
cmv51td1t00iduhm8rk53l2w6	cmv51td1q00ibuhm8wcsdjxq2	cmv51td1c00i1uhm8xu5jqybo	800	PAID	2026-09-18 09:27:22.96	2026-10-12 09:27:22.961
cmv51td2f00isuhm8fuof11dr	cmv51td2d00iquhm8p6fiscu1	cmv51td1z00iguhm8vdgvm19j	4200	PAID	2026-09-13 09:27:22.982	2026-10-12 09:27:22.984
cmv51td3300j7uhm8tklmv5i3	cmv51td3000j5uhm8coiiplps	cmv51td2n00ivuhm8nc5681p5	2600	PAID	2026-09-08 09:27:23.006	2026-10-12 09:27:23.007
cmv51td3r00jmuhm8lees6wgt	cmv51td3o00jkuhm8h17gczci	cmv51td3900jauhm8a86jcb4t	900	PAID	2026-09-03 09:27:23.03	2026-10-12 09:27:23.031
cmv51td4b00k1uhm8smay910e	cmv51td4900jzuhm8nd41f734	cmv51td3x00jpuhm8a3oeqzkz	2800	PAID	2026-08-29 09:27:23.051	2026-10-12 09:27:23.052
cmv51td4w00kguhm8qlgc14sv	cmv51td4t00keuhm8mzxltlv6	cmv51td4h00k4uhm8ps06px67	14500	PAID	2026-08-24 09:27:23.071	2026-10-12 09:27:23.072
cmv51td5g00kvuhm8coo8794g	cmv51td5e00ktuhm8qykfbom0	cmv51td5200kjuhm8uf7iq953	1500	PAID	2026-09-28 09:27:23.091	2026-10-12 09:27:23.092
cmv51td6200lauhm8uoxnasg5	cmv51td5z00l8uhm8p86ukqxq	cmv51td5l00kyuhm8k816nrq0	14500	PAID	2026-09-23 09:27:23.113	2026-10-12 09:27:23.114
cmv51td6q00lpuhm8vuj6j34w	cmv51td6o00lnuhm8iu43n0k2	cmv51td6900lduhm8x84bxr3q	1500	PAID	2026-09-18 09:27:23.138	2026-10-12 09:27:23.139
cmv51td7a00m4uhm86ij6nus9	cmv51td7800m2uhm8o02ulctu	cmv51td6w00lsuhm8vfmd0cgu	800	PAID	2026-09-13 09:27:23.157	2026-10-12 09:27:23.159
cmv51td7u00mjuhm8uyr42s7g	cmv51td7r00mhuhm8cutbo8fb	cmv51td7f00m7uhm8b4l6hyk2	1800	PAID	2026-09-08 09:27:23.177	2026-10-12 09:27:23.178
cmv51td8f00myuhm89ctmlbr1	cmv51td8d00mwuhm824d9fhad	cmv51td7z00mmuhm8ngklrx4o	800	PAID	2026-09-03 09:27:23.198	2026-10-12 09:27:23.2
cmv51td9100nduhm85iplybl7	cmv51td8y00nbuhm8jui70dy2	cmv51td8m00n1uhm8nerfktld	4200	PAID	2026-08-29 09:27:23.22	2026-10-12 09:27:23.222
cmv51td9t00nsuhm8bue81zcj	cmv51td9q00nquhm8vg798gko	cmv51td9a00nguhm8xo8mdqu8	2600	PAID	2026-08-24 09:27:23.248	2026-10-12 09:27:23.249
cmv51tdbr00o7uhm8adss64fz	cmv51tdbj00o5uhm86j6kh1ao	cmv51tda000nvuhm8zwxizw4q	3500	PAID	2026-09-28 09:27:23.318	2026-10-12 09:27:23.319
cmv51tdci00omuhm8uwncm7o6	cmv51tdce00okuhm862o9o87z	cmv51tdbz00oauhm8omxibygu	1500	PAID	2026-09-23 09:27:23.345	2026-10-12 09:27:23.346
cmv51tdd300p1uhm845u0o8lx	cmv51tdd100ozuhm8izo9ejsm	cmv51tdco00opuhm8w8yd45sm	900	PAID	2026-09-18 09:27:23.366	2026-10-12 09:27:23.367
cmv51tddo00pguhm8mpntyu2j	cmv51tddl00peuhm8q2am078a	cmv51tdd900p4uhm89l74qfpy	1600	PAID	2026-09-13 09:27:23.387	2026-10-12 09:27:23.388
cmv51tde800pvuhm8tlp5hkhg	cmv51tde600ptuhm8puh6pwiq	cmv51tddu00pjuhm8wt0p0hpr	14500	PAID	2026-09-08 09:27:23.407	2026-10-12 09:27:23.409
cmv51tdet00qauhm88t5guhr1	cmv51tder00q8uhm8jijxhmku	cmv51tdee00pyuhm8mx8iayt1	1800	PAID	2026-09-03 09:27:23.428	2026-10-12 09:27:23.43
cmv51tdfe00qpuhm86qko7dgj	cmv51tdfc00qnuhm823z4l502	cmv51tdez00qduhm8i8yw4wnk	700	PAID	2026-08-29 09:27:23.449	2026-10-12 09:27:23.45
cmv51tdg400r4uhm8f8kg8r3q	cmv51tdg100r2uhm8s6plgx1y	cmv51tdfm00qsuhm883vw6g8t	1600	PAID	2026-08-24 09:27:23.475	2026-10-12 09:27:23.476
cmv51tdgs00rjuhm80y5uxyae	cmv51tdgp00rhuhm8u930s56e	cmv51tdga00r7uhm8ia6axlrn	2600	PAID	2026-09-28 09:27:23.499	2026-10-12 09:27:23.5
cmv51tdhg00ryuhm8guoquedn	cmv51tdhd00rwuhm8c4po939c	cmv51tdgy00rmuhm8n3otph93	3500	PAID	2026-09-23 09:27:23.523	2026-10-12 09:27:23.524
cmv51tdi100sduhm89kiz2qy8	cmv51tdhy00sbuhm8iclkzhdr	cmv51tdhm00s1uhm84c40hf27	2800	PAID	2026-09-18 09:27:23.544	2026-10-12 09:27:23.546
cmv51tdio00ssuhm852qcjqii	cmv51tdim00squhm8redynqii	cmv51tdi900sguhm89dvu0p80	4200	PAID	2026-09-13 09:27:23.567	2026-10-12 09:27:23.568
cmv51tdj900t7uhm8m69211gg	cmv51tdj700t5uhm8v0cvi53f	cmv51tdit00svuhm8c3tkn9xq	1500	PAID	2026-09-08 09:27:23.588	2026-10-12 09:27:23.59
cmv51tdjw00tmuhm8s0fhjhux	cmv51tdjt00tkuhm88xum0hnj	cmv51tdjg00tauhm8jkqzx6b7	900	PAID	2026-09-03 09:27:23.611	2026-10-12 09:27:23.612
cmv51tdkg00u1uhm8c96vgw60	cmv51tdke00tzuhm81z2cmiw6	cmv51tdk100tpuhm80l7cdar4	1600	PAID	2026-08-29 09:27:23.632	2026-10-12 09:27:23.633
cmv51tdl100uguhm8dyod7c7w	cmv51tdky00ueuhm8q2qscrtk	cmv51tdkn00u4uhm84zbj002k	14500	PAID	2026-08-24 09:27:23.652	2026-10-12 09:27:23.653
cmv51tdlk00uvuhm8kiu9obs5	cmv51tdli00utuhm86j95ejtl	cmv51tdl600ujuhm8gkh2m2z0	1800	PAID	2026-09-28 09:27:23.672	2026-10-12 09:27:23.673
cmv51tdm500vauhm85npe03tn	cmv51tdm200v8uhm8lcu8zmfo	cmv51tdlq00uyuhm87ibtd394	700	PAID	2026-09-23 09:27:23.692	2026-10-12 09:27:23.693
cmv51tdmp00vpuhm809mmamqz	cmv51tdmm00vnuhm8lylyqxsv	cmv51tdmb00vduhm8zuvxwxdq	1600	PAID	2026-09-18 09:27:23.712	2026-10-12 09:27:23.713
cmv51tdn900w4uhm88692yczk	cmv51tdn700w2uhm80b2ylmcf	cmv51tdmu00vsuhm8r0ii6tt1	2600	PAID	2026-09-13 09:27:23.732	2026-10-12 09:27:23.734
cmv51tdny00wjuhm8acc1waem	cmv51tdnu00whuhm8rv73xvsk	cmv51tdnf00w7uhm83ao4b4yq	3500	PAID	2026-09-08 09:27:23.757	2026-10-12 09:27:23.759
cmv51tdow00wyuhm8tfc6sz0b	cmv51tdos00wwuhm8a38bb3s7	cmv51tdo900wmuhm8k2isgtds	2800	PAID	2026-09-03 09:27:23.791	2026-10-12 09:27:23.793
cmv51tdpq00xduhm8v3xdxx3j	cmv51tdpm00xbuhm8aeu1zkwk	cmv51tdp400x1uhm8aw9nl0eo	4200	PAID	2026-08-29 09:27:23.821	2026-10-12 09:27:23.822
cmv51tdqg00xsuhm8852i01b5	cmv51tdqd00xquhm8qtls1dze	cmv51tdpx00xguhm8pl0m36an	1500	PAID	2026-08-24 09:27:23.847	2026-10-12 09:27:23.848
cmv51tdr200y7uhm8kmiobt2v	cmv51tdr000y5uhm8fjkja33b	cmv51tdqn00xvuhm890r05g7v	900	PAID	2026-09-28 09:27:23.87	2026-10-12 09:27:23.871
cmv51tdrp00ymuhm8x9mhds65	cmv51tdrm00ykuhm83okj1rvk	cmv51tdr900yauhm8vep96ors	2800	PAID	2026-09-23 09:27:23.892	2026-10-12 09:27:23.893
cmv51tdsc00z1uhm8qtc834hs	cmv51tds900yzuhm8uo1gcmby	cmv51tdrv00ypuhm86dbijx4a	800	PAID	2026-09-18 09:27:23.915	2026-10-12 09:27:23.916
cmv51tdsy00zguhm8p385uaz9	cmv51tdsv00zeuhm8m6pi7aiq	cmv51tdsj00z4uhm8owzgcwef	1800	PAID	2026-09-13 09:27:23.937	2026-10-12 09:27:23.939
cmv51tdtk00zvuhm83p1gw99s	cmv51tdti00ztuhm855tvmjbv	cmv51tdt500zjuhm8ppl8gnu2	700	PAID	2026-09-08 09:27:23.96	2026-10-12 09:27:23.961
cmv51tdu8010auhm8p6r3gssd	cmv51tdu40108uhm8p77hidkj	cmv51tdtq00zyuhm83gt0nnq6	3500	PAID	2026-09-03 09:27:23.983	2026-10-12 09:27:23.985
cmv51tduv010puhm8fqcxpjq8	cmv51tdut010nuhm8c0obievs	cmv51tdug010duhm85ll0kqov	800	PAID	2026-08-29 09:27:24.006	2026-10-12 09:27:24.007
cmv51tdvj0114uhm89y19o1k5	cmv51tdvg0112uhm84av5nkq9	cmv51tdv0010suhm84ynyknma	4200	PAID	2026-08-24 09:27:24.03	2026-10-12 09:27:24.031
cmv51tdw1011juhm8tawuq3gz	cmv51tdvz011huhm86jwnmrpj	cmv51tdvo0117uhm8s25m88ah	2600	PAID	2026-09-28 09:27:24.048	2026-10-12 09:27:24.05
cmv51tdwj011yuhm80yw5rtbb	cmv51tdwh011wuhm8k271tts0	cmv51tdw7011muhm8acqd0ur7	900	PAID	2026-09-23 09:27:24.066	2026-10-12 09:27:24.068
cmv51tdx1012duhm833u0ynwf	cmv51tdwz012buhm8zj3shixd	cmv51tdwo0121uhm8pm9z258g	2800	PAID	2026-09-18 09:27:24.085	2026-10-12 09:27:24.086
cmv51tdxl012suhm8mpptdbeq	cmv51tdxi012quhm89mitsau7	cmv51tdx8012guhm8hhwhph59	4200	PAID	2026-09-13 09:27:24.104	2026-10-12 09:27:24.105
cmv51tdy40137uhm87lb9d54p	cmv51tdy20135uhm8fqynd3n5	cmv51tdxq012vuhm82jm3aclj	1600	PAID	2026-09-08 09:27:24.123	2026-10-12 09:27:24.125
cmv51tdyp013muhm8ffqa4z6s	cmv51tdym013kuhm8xsy16c3g	cmv51tdy9013auhm8t2ifvjag	14500	PAID	2026-09-03 09:27:24.144	2026-10-12 09:27:24.145
cmv51tdz80141uhm8bxdlcs7n	cmv51tdz5013zuhm8b7qk11cs	cmv51tdyv013puhm8gfh0n8ai	1800	PAID	2026-08-29 09:27:24.163	2026-10-12 09:27:24.164
cmv51tdzp014guhm8mr8juovp	cmv51tdzn014euhm8ufjdhju2	cmv51tdzd0144uhm8uhia8tr2	700	PAID	2026-08-24 09:27:24.181	2026-10-12 09:27:24.182
cmv51te09014vuhm8z28jswlf	cmv51te05014tuhm8okdrqy10	cmv51tdzu014juhm84jkmz4ig	3500	PAID	2026-09-28 09:27:24.2	2026-10-12 09:27:24.201
cmv51te0x015auhm8xno9xxuz	cmv51te0u0158uhm8lg42oq08	cmv51te0g014yuhm8okz9rdef	800	PAID	2026-09-23 09:27:24.224	2026-10-12 09:27:24.225
cmv51te1j015puhm87gj9tkin	cmv51te1h015nuhm8u9xvkpp0	cmv51te13015duhm8qppusbxy	1800	PAID	2026-09-18 09:27:24.246	2026-10-12 09:27:24.248
cmv51te210164uhm8xdk38qju	cmv51te1z0162uhm8p5l3369c	cmv51te1o015suhm82mapigal	2800	PAID	2026-09-13 09:27:24.264	2026-10-12 09:27:24.265
cmv51te2k016juhm8h9ciht2i	cmv51te2i016huhm8dv174xyd	cmv51te260167uhm86xp7qc4f	4200	PAID	2026-09-08 09:27:24.283	2026-10-12 09:27:24.284
cmv51te34016yuhm8xpkigqc4	cmv51te32016wuhm80vducvo0	cmv51te2q016muhm8z7mpqxk3	1500	PAID	2026-09-03 09:27:24.303	2026-10-12 09:27:24.305
cmv51te3m017duhm8mz0cjv0y	cmv51te3k017buhm8005yzjj9	cmv51te390171uhm8r8m26fv9	900	PAID	2026-08-29 09:27:24.321	2026-10-12 09:27:24.323
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "orderId", "fromUserId", "toUserId", rating, tags, text, "createdAt") FROM stdin;
cmuv6m97v003euh7sjv46gigg	cmuv6m97n003auh7s0r9it04d	cmuv6m9180001uh7syb2m1tr0	cmuv6m91y0005uh7sne9aexuo	5	{"As described","Well packed"}	Sealed box as promised, quick delivery.	2026-10-05 11:44:07.723
cmuv6m97z003guh7szeubpw8s	cmuv6m97n003auh7s0r9it04d	cmuv6m91y0005uh7sne9aexuo	cmuv6m9180001uh7syb2m1tr0	5	{"Paid on time","Clear communication"}	\N	2026-10-05 11:44:07.728
cmuv6m98d003ouh7svubdjb42	cmuv6m987003kuh7s12knu2ft	cmuv6m91c0002uh7sx14c2ye6	cmuv6m91l0004uh7sn0nii9u7	5	{"As described","Quick replies"}	Lens exactly as described, even packed it with silica gel. Karan answered every question within minutes.	2026-10-05 11:44:07.742
cmuv6m98q003wuh7spx3bkbor	cmuv6m98j003suh7svpxsj9p9	cmuv6m91f0003uh7s75g6e8pw	cmuv6m91l0004uh7sn0nii9u7	5	{"As described","Quick replies"}	Smooth handover at the metro station. Bill and box were included as promised.	2026-10-05 11:44:07.754
cmuv6m9930044uh7svmdhj7an	cmuv6m98w0040uh7s3gj8pxuq	cmuv6m91c0002uh7sx14c2ye6	cmuv6m91l0004uh7sn0nii9u7	4	{"As described","Quick replies"}	Good tripod, one leg lock is slightly stiff which he had mentioned. Fair deal.	2026-10-05 11:44:07.767
cmv51tc8q000kuhm8wv81kye8	cmv51tc8g000guhm83p9p2te6	cmv51tc6j0000uhm8i9f9wa7o	cmv51tc7l0004uhm8v6egi0f3	5	{"As described","Quick replies",Friendly}	Exactly as described and she replied within minutes. Smooth pickup at Sector 62 metro.	2026-10-12 09:27:21.914
cmv51tc9d0011uhm88qbh4w9i	cmv51tc98000xuhm8a371yr6f	cmv51tc750001uhm8fc07n2du	cmv51tc8v000luhm8gy1nhadz	4	{"As described"}	Good condition, fair price. Pickup took a bit of coordination but all fine.	2026-10-12 09:27:21.938
cmv51tcav001iuhm8k6nhgq5y	cmv51tcaf001euhm88s3ny0ok	cmv51tc790002uhm8amm39sxb	cmv51tc9h0012uhm848ampvfo	5	{"As described","Quick replies",Friendly}	Beautiful chair, spotless condition. Shalini even helped load it in the cab.	2026-10-12 09:27:21.991
cmv51tcd0001zuhm8c1rsna2m	cmv51tcck001vuhm8latikw4d	cmv51tc7e0003uhm8dtplheat	cmv51tcb7001juhm86jt72j5y	5	{"As described","Quick replies",Friendly}	Very honest seller, the cycle was even better than the photos.	2026-10-12 09:27:22.068
cmv51tcee002euhm8axy9rcke	cmv51tce8002auhm8bxumehc3	cmuv6m9180001uh7syb2m1tr0	cmv51tcdc0020uhm89xbrvius	4	{"As described"}	Jacket was in good shape. One velcro strap is weak but it was mentioned up front.	2026-10-12 09:27:22.119
cmv51tcf7002vuhm891303vfo	cmv51tcf1002ruhm8jyw2rz0f	cmuv6m91c0002uh7sx14c2ye6	cmv51tcek002fuhm8bc53jn6p	5	{"As described","Quick replies",Friendly}	Phone was fully tested in front of me. Very professional.	2026-10-12 09:27:22.147
cmv51tcfw003cuhm8ibiplmxj	cmv51tcfr0038uhm8lmapwxoq	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcfc002wuhm8kcykhz7c	5	{"As described","Quick replies",Friendly}	Worked perfectly, well packed for delivery.	2026-10-12 09:27:22.172
cmv51tcgg003ruhm8i0n2xpzp	cmv51tcgb003nuhm8uihvtbs5	cmv51tc750001uhm8fc07n2du	cmv51tcg0003duhm8civbu6c6	4	{"As described"}	Tool was fine. Deepak was a little late for pickup but polite.	2026-10-12 09:27:22.192
cmv51tch30048uhm8ky362pjj	cmv51tcgy0044uhm8c0f4wgct	cmv51tc790002uhm8amm39sxb	cmv51tcgj003suhm8hl3ylyak	5	{"As described","Quick replies",Friendly}	Mint condition and very quick replies.	2026-10-12 09:27:22.215
cmv51tcht004puhm8b7fox0ru	cmv51tcho004luhm8azqlbvhf	cmv51tc7e0003uhm8dtplheat	cmv51tch60049uhm8kwvp1g5f	5	{"As described","Quick replies",Friendly}	Gorgeous jacket, exactly as in the photos. Lovely to deal with.	2026-10-12 09:27:22.242
cmv51tcig0054uhm8z1jirqyc	cmv51tcia0050uhm85o8m08ht	cmuv6m9180001uh7syb2m1tr0	cmv51tchx004quhm8o1c09yoo	5	{"As described","Quick replies",Friendly}	Farhan explained everything about the camera. Highly recommended.	2026-10-12 09:27:22.264
cmv51tcj1005luhm8yy98fxu6	cmv51tcix005huhm8fx2enhre	cmuv6m91c0002uh7sx14c2ye6	cmv51tcij0055uhm8dwq91l9x	4	{"As described"}	Good condition. A small scratch on the back that wasn’t in the photos, but fine.	2026-10-12 09:27:22.285
cmv51tcjn0060uhm8v7er6uv7	cmv51tcji005wuhm88yp69w4c	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcj5005muhm8fcscj8o9	5	{"As described","Quick replies",Friendly}	Clean, well kept and fairly priced.	2026-10-12 09:27:22.307
cmv51tcka006huhm8osrmzgdd	cmv51tck5006duhm8nkw3pmz6	cmv51tc750001uhm8fc07n2du	cmv51tcjr0061uhm81w14fvbq	5	{"As described","Quick replies",Friendly}	Fast replies and quick doorstep delivery.	2026-10-12 09:27:22.33
cmv51tckz006yuhm8zs7rapsi	cmv51tcku006uuhm86tepdb6n	cmv51tc790002uhm8amm39sxb	cmv51tcke006iuhm8n33euzeb	5	{"As described","Quick replies",Friendly}	Divya was super helpful, even shared mover contacts.	2026-10-12 09:27:22.356
cmv51tcli007duhm8603stbwk	cmv51tcld0079uhm8sox2kymc	cmv51tc7e0003uhm8dtplheat	cmv51tcl3006zuhm8g2ieril4	4	{"As described"}	Decent bat for the price. Pranav was on time.	2026-10-12 09:27:22.374
cmv51tclz007suhm8c4bak6ba	cmv51tclv007ouhm8yn4s7il8	cmuv6m9180001uh7syb2m1tr0	cmv51tcll007euhm8upawpjlw	5	{"As described","Quick replies",Friendly}	Lovely person, the speaker works great.	2026-10-12 09:27:22.392
cmv51tcml0089uhm8k8vjw9yl	cmv51tcmg0085uhm8oyzv6msw	cmuv6m91c0002uh7sx14c2ye6	cmv51tcm2007tuhm8j5ky6d21	5	{"As described","Quick replies",Friendly}	Everything as described. Easy pickup.	2026-10-12 09:27:22.413
cmv51tcna008quhm8qyqp0q3w	cmv51tcn3008muhm8jpf7eykh	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcmo008auhm8d4bvpab3	5	{"As described","Quick replies",Friendly}	Genuine product with bill, very quick handover.	2026-10-12 09:27:22.438
cmv51tcnz0095uhm8xjgaq70c	cmv51tcnu0091uhm8sgah35uz	cmv51tc750001uhm8fc07n2du	cmv51tcnf008ruhm8sk15hj8c	4	{"As described"}	Works fine, slight stick drift as mentioned in the listing.	2026-10-12 09:27:22.463
cmv51tcol009muhm8wd9rh1e9	cmv51tcog009iuhm83nwfe4eb	cmv51tc790002uhm8amm39sxb	cmv51tco20096uhm83ziqhjzl	5	{"As described","Quick replies",Friendly}	Very trustworthy, item was sealed.	2026-10-12 09:27:22.485
cmv51tcp800a3uhm8b17p8pnj	cmv51tcp3009zuhm8kq9ujs3n	cmv51tc7e0003uhm8dtplheat	cmv51tcoo009nuhm8ipomqjvq	5	{"As described","Quick replies",Friendly}	Beautiful chairs, Pallavi arranged a tempo for delivery too.	2026-10-12 09:27:22.509
cmv51tcpu00aiuhm8nttpti5s	cmv51tcpp00aeuhm80g1czlct	cmuv6m9180001uh7syb2m1tr0	cmv51tcpc00a4uhm8oc5qxijn	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:22.53
cmv51tcqg00axuhm8tx84lvyr	cmv51tcqb00atuhm8q12c5w6g	cmuv6m91c0002uh7sx14c2ye6	cmv51tcpy00ajuhm8emqmn0z2	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:22.552
cmv51tcr400bcuhm8kgh2s5vd	cmv51tcqz00b8uhm8fa8q9h97	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcqk00ayuhm8ofjcpehc	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:22.576
cmv51tcro00bruhm8mdsthye3	cmv51tcrj00bnuhm8lmum5b7p	cmv51tc750001uhm8fc07n2du	cmv51tcr700bduhm8j50zp6hr	5	{"As described","Quick replies",Friendly}	Bat was in great shape, quick handover.	2026-10-12 09:27:22.596
cmv51tcs900c6uhm8dljplfta	cmv51tcs500c2uhm8xg744i6i	cmv51tc790002uhm8amm39sxb	cmv51tcrs00bsuhm8c5q9kc1i	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:22.618
cmv51tcst00cluhm8w2dvhvxk	cmv51tcsp00chuhm8j5xunor7	cmv51tc7e0003uhm8dtplheat	cmv51tcsd00c7uhm8tmo56vlo	4	{"As described"}	Works fine, the seller was flexible with the pickup time.	2026-10-12 09:27:22.638
cmv51tcte00d0uhm8gyrjrri7	cmv51tct900cwuhm85byosyud	cmuv6m9180001uh7syb2m1tr0	cmv51tcsx00cmuhm8hznxusn2	4	{"As described"}	Good tools, fair price.	2026-10-12 09:27:22.659
cmv51tcu100dfuhm80yg0hsx8	cmv51tctv00dbuhm815o02rx6	cmuv6m91c0002uh7sx14c2ye6	cmv51tcti00d1uhm8xkgp5mta	5	{"As described","Quick replies",Friendly}	Lovely solid table and the seller helped load it.	2026-10-12 09:27:22.682
cmv51tcul00duuhm805qmsf3t	cmv51tcug00dquhm8g537k38x	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcu500dguhm88atkf6z3	5	{"As described","Quick replies",Friendly}	Books were in great condition, the kids love them.	2026-10-12 09:27:22.701
cmv51tcv600e9uhm8ln0whsda	cmv51tcv100e5uhm8q5ncyyf4	cmv51tc750001uhm8fc07n2du	cmv51tcup00dvuhm8ons2j78m	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:22.723
cmv51tcvu00eouhm8fgqaukvz	cmv51tcvo00ekuhm82nbqrjan	cmv51tc790002uhm8amm39sxb	cmv51tcva00eauhm801p8125h	5	{"As described","Quick replies",Friendly}	Jacket in great shape, honest seller.	2026-10-12 09:27:22.746
cmv51tcwg00f3uhm8l6rgxv5s	cmv51tcwa00ezuhm8goajwmc4	cmv51tc7e0003uhm8dtplheat	cmv51tcvx00epuhm81f0vvd48	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:22.768
cmv51tcx300fiuhm8wpgr7dy4	cmv51tcwy00feuhm85mu0i797	cmuv6m9180001uh7syb2m1tr0	cmv51tcwl00f4uhm8xd2n2dpo	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:22.792
cmv51tcxw00fxuhm8k3olzjvf	cmv51tcxk00ftuhm88dwq50gq	cmuv6m91c0002uh7sx14c2ye6	cmv51tcx800fjuhm8gtn4c7i7	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:22.821
cmv51tcyk00gcuhm8uiajnfrs	cmv51tcye00g8uhm8tj2fa4sv	cmv51tc6j0000uhm8i9f9wa7o	cmv51tcy100fyuhm8kz5j5o5z	5	{"As described","Quick replies",Friendly}	Item was clean and well packed. Recommended.	2026-10-12 09:27:22.844
cmv51tcza00gruhm82sauovpo	cmv51tcz400gnuhm8bsord18k	cmv51tc750001uhm8fc07n2du	cmv51tcyo00gduhm80czpt8wj	4	{"As described"}	Good tools, fair price.	2026-10-12 09:27:22.87
cmv51tczx00h6uhm8vwq2xp7n	cmv51tczs00h2uhm81jln6fv8	cmv51tc790002uhm8amm39sxb	cmv51tcze00gsuhm8wx06xo2s	5	{"As described","Quick replies",Friendly}	Bat was in great shape, quick handover.	2026-10-12 09:27:22.894
cmv51td0k00hluhm88y1sbf1b	cmv51td0f00hhuhm8r0bxvdgb	cmv51tc7e0003uhm8dtplheat	cmv51td0100h7uhm8i1idvzp7	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:22.917
cmv51td1800i0uhm8a2gt2n95	cmv51td1200hwuhm8989vi5c0	cmuv6m9180001uh7syb2m1tr0	cmv51td0o00hmuhm8spwsa97c	5	{"As described","Quick replies",Friendly}	Lovely solid table and the seller helped load it.	2026-10-12 09:27:22.94
cmv51td1v00ifuhm8urj62np5	cmv51td1q00ibuhm8wcsdjxq2	cmuv6m91c0002uh7sx14c2ye6	cmv51td1c00i1uhm8xu5jqybo	5	{"As described","Quick replies",Friendly}	Books were in great condition, the kids love them.	2026-10-12 09:27:22.963
cmv51td2j00iuuhm85721yhj8	cmv51td2d00iquhm8p6fiscu1	cmv51tc6j0000uhm8i9f9wa7o	cmv51td1z00iguhm8vdgvm19j	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:22.987
cmv51td3600j9uhm8iznefklx	cmv51td3000j5uhm8coiiplps	cmv51tc750001uhm8fc07n2du	cmv51td2n00ivuhm8nc5681p5	5	{"As described","Quick replies",Friendly}	Jacket in great shape, honest seller.	2026-10-12 09:27:23.01
cmv51td3t00jouhm8yokw5ful	cmv51td3o00jkuhm8h17gczci	cmv51tc790002uhm8amm39sxb	cmv51td3900jauhm8a86jcb4t	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:23.034
cmv51td4e00k3uhm8zy7wher0	cmv51td4900jzuhm8nd41f734	cmv51tc7e0003uhm8dtplheat	cmv51td3x00jpuhm8a3oeqzkz	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:23.054
cmv51td4y00kiuhm8iyaz0sw9	cmv51td4t00keuhm8mzxltlv6	cmuv6m9180001uh7syb2m1tr0	cmv51td4h00k4uhm8ps06px67	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:23.075
cmv51td5i00kxuhm8si7zfe0u	cmv51td5e00ktuhm8qykfbom0	cmuv6m91c0002uh7sx14c2ye6	cmv51td5200kjuhm8uf7iq953	5	{"As described","Quick replies",Friendly}	Item was clean and well packed. Recommended.	2026-10-12 09:27:23.094
cmv51td6400lcuhm88mgmkvj7	cmv51td5z00l8uhm8p86ukqxq	cmv51tc6j0000uhm8i9f9wa7o	cmv51td5l00kyuhm8k816nrq0	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:23.117
cmv51td6t00lruhm84gvdth20	cmv51td6o00lnuhm8iu43n0k2	cmv51tc750001uhm8fc07n2du	cmv51td6900lduhm8x84bxr3q	5	{"As described","Quick replies",Friendly}	Item was clean and well packed. Recommended.	2026-10-12 09:27:23.141
cmv51td7c00m6uhm8ht5c959l	cmv51td7800m2uhm8o02ulctu	cmv51tc790002uhm8amm39sxb	cmv51td6w00lsuhm8vfmd0cgu	5	{"As described","Quick replies",Friendly}	Books were in great condition, the kids love them.	2026-10-12 09:27:23.161
cmv51td7w00mluhm8839o8e2p	cmv51td7r00mhuhm8cutbo8fb	cmv51tc7e0003uhm8dtplheat	cmv51td7f00m7uhm8b4l6hyk2	4	{"As described"}	Works fine, the seller was flexible with the pickup time.	2026-10-12 09:27:23.18
cmv51td8i00n0uhm8kpst5hyg	cmv51td8d00mwuhm824d9fhad	cmuv6m9180001uh7syb2m1tr0	cmv51td7z00mmuhm8ngklrx4o	5	{"As described","Quick replies",Friendly}	Books were in great condition, the kids love them.	2026-10-12 09:27:23.202
cmv51td9500nfuhm872qr1aea	cmv51td8y00nbuhm8jui70dy2	cmuv6m91c0002uh7sx14c2ye6	cmv51td8m00n1uhm8nerfktld	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:23.225
cmv51td9v00nuuhm8re8e1j1m	cmv51td9q00nquhm8vg798gko	cmv51tc6j0000uhm8i9f9wa7o	cmv51td9a00nguhm8xo8mdqu8	5	{"As described","Quick replies",Friendly}	Jacket in great shape, honest seller.	2026-10-12 09:27:23.252
cmv51tdbu00o9uhm829croy12	cmv51tdbj00o5uhm86j6kh1ao	cmv51tc750001uhm8fc07n2du	cmv51tda000nvuhm8zwxizw4q	5	{"As described","Quick replies",Friendly}	Lovely solid table and the seller helped load it.	2026-10-12 09:27:23.323
cmv51tdcl00oouhm8ri49ia1p	cmv51tdce00okuhm862o9o87z	cmv51tc790002uhm8amm39sxb	cmv51tdbz00oauhm8omxibygu	5	{"As described","Quick replies",Friendly}	Item was clean and well packed. Recommended.	2026-10-12 09:27:23.349
cmv51tdd500p3uhm8nrpdpr8b	cmv51tdd100ozuhm8izo9ejsm	cmv51tc7e0003uhm8dtplheat	cmv51tdco00opuhm8w8yd45sm	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:23.37
cmv51tddq00piuhm8366ro9dg	cmv51tddl00peuhm8q2am078a	cmuv6m9180001uh7syb2m1tr0	cmv51tdd900p4uhm89l74qfpy	5	{"As described","Quick replies",Friendly}	Bat was in great shape, quick handover.	2026-10-12 09:27:23.39
cmv51tdea00pxuhm8x0ipvvy5	cmv51tde600ptuhm8puh6pwiq	cmuv6m91c0002uh7sx14c2ye6	cmv51tddu00pjuhm8wt0p0hpr	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:23.411
cmv51tdev00qcuhm8hmzzl0vn	cmv51tder00q8uhm8jijxhmku	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdee00pyuhm8mx8iayt1	4	{"As described"}	Works fine, the seller was flexible with the pickup time.	2026-10-12 09:27:23.432
cmv51tdfh00qruhm83w2lzzla	cmv51tdfc00qnuhm823z4l502	cmv51tc750001uhm8fc07n2du	cmv51tdez00qduhm8i8yw4wnk	4	{"As described"}	Good tools, fair price.	2026-10-12 09:27:23.453
cmv51tdg600r6uhm89400fxdj	cmv51tdg100r2uhm8s6plgx1y	cmv51tc790002uhm8amm39sxb	cmv51tdfm00qsuhm883vw6g8t	5	{"As described","Quick replies",Friendly}	Bat was in great shape, quick handover.	2026-10-12 09:27:23.478
cmv51tdgu00rluhm8h7bwlmyk	cmv51tdgp00rhuhm8u930s56e	cmv51tc7e0003uhm8dtplheat	cmv51tdga00r7uhm8ia6axlrn	5	{"As described","Quick replies",Friendly}	Jacket in great shape, honest seller.	2026-10-12 09:27:23.502
cmv51tdhi00s0uhm8jxnidseg	cmv51tdhd00rwuhm8c4po939c	cmuv6m9180001uh7syb2m1tr0	cmv51tdgy00rmuhm8n3otph93	5	{"As described","Quick replies",Friendly}	Lovely solid table and the seller helped load it.	2026-10-12 09:27:23.526
cmv51tdi400sfuhm8hleep3tk	cmv51tdhy00sbuhm8iclkzhdr	cmuv6m91c0002uh7sx14c2ye6	cmv51tdhm00s1uhm84c40hf27	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:23.549
cmv51tdiq00suuhm82lkpay7f	cmv51tdim00squhm8redynqii	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdi900sguhm89dvu0p80	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:23.57
cmv51tdjc00t9uhm8cvm3nayr	cmv51tdj700t5uhm8v0cvi53f	cmv51tc750001uhm8fc07n2du	cmv51tdit00svuhm8c3tkn9xq	5	{"As described","Quick replies",Friendly}	Item was clean and well packed. Recommended.	2026-10-12 09:27:23.592
cmv51tdjy00touhm87q19n6sw	cmv51tdjt00tkuhm88xum0hnj	cmv51tc790002uhm8amm39sxb	cmv51tdjg00tauhm8jkqzx6b7	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:23.614
cmv51tdkj00u3uhm83koinymi	cmv51tdke00tzuhm81z2cmiw6	cmv51tc7e0003uhm8dtplheat	cmv51tdk100tpuhm80l7cdar4	5	{"As described","Quick replies",Friendly}	Bat was in great shape, quick handover.	2026-10-12 09:27:23.635
cmv51tdl300uiuhm8yk0tiuc3	cmv51tdky00ueuhm8q2qscrtk	cmuv6m9180001uh7syb2m1tr0	cmv51tdkn00u4uhm84zbj002k	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:23.655
cmv51tdln00uxuhm8ofrf2bup	cmv51tdli00utuhm86j95ejtl	cmuv6m91c0002uh7sx14c2ye6	cmv51tdl600ujuhm8gkh2m2z0	4	{"As described"}	Works fine, the seller was flexible with the pickup time.	2026-10-12 09:27:23.675
cmv51tdm800vcuhm80ie1a88r	cmv51tdm200v8uhm8lcu8zmfo	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdlq00uyuhm87ibtd394	4	{"As described"}	Good tools, fair price.	2026-10-12 09:27:23.696
cmv51tdmr00vruhm8qu7w1xqv	cmv51tdmm00vnuhm8lylyqxsv	cmv51tc750001uhm8fc07n2du	cmv51tdmb00vduhm8zuvxwxdq	5	{"As described","Quick replies",Friendly}	Bat was in great shape, quick handover.	2026-10-12 09:27:23.715
cmv51tdnb00w6uhm8op0zfze7	cmv51tdn700w2uhm80b2ylmcf	cmv51tc790002uhm8amm39sxb	cmv51tdmu00vsuhm8r0ii6tt1	5	{"As described","Quick replies",Friendly}	Jacket in great shape, honest seller.	2026-10-12 09:27:23.736
cmv51tdo300wluhm8as15nipy	cmv51tdnu00whuhm8rv73xvsk	cmv51tc7e0003uhm8dtplheat	cmv51tdnf00w7uhm83ao4b4yq	5	{"As described","Quick replies",Friendly}	Lovely solid table and the seller helped load it.	2026-10-12 09:27:23.763
cmv51tdoz00x0uhm86iny0f71	cmv51tdos00wwuhm8a38bb3s7	cmuv6m9180001uh7syb2m1tr0	cmv51tdo900wmuhm8k2isgtds	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:23.796
cmv51tdpt00xfuhm8e007wknu	cmv51tdpm00xbuhm8aeu1zkwk	cmuv6m91c0002uh7sx14c2ye6	cmv51tdp400x1uhm8aw9nl0eo	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:23.825
cmv51tdqi00xuuhm8xr6sfr8s	cmv51tdqd00xquhm8qtls1dze	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdpx00xguhm8pl0m36an	5	{"As described","Quick replies",Friendly}	Item was clean and well packed. Recommended.	2026-10-12 09:27:23.851
cmv51tdr500y9uhm81l1d07ga	cmv51tdr000y5uhm8fjkja33b	cmv51tc750001uhm8fc07n2du	cmv51tdqn00xvuhm890r05g7v	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:23.873
cmv51tdrr00youhm8irpeq2y3	cmv51tdrm00ykuhm83okj1rvk	cmv51tc790002uhm8amm39sxb	cmv51tdr900yauhm8vep96ors	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:23.895
cmv51tdse00z3uhm8g2umepsy	cmv51tds900yzuhm8uo1gcmby	cmv51tc7e0003uhm8dtplheat	cmv51tdrv00ypuhm86dbijx4a	5	{"As described","Quick replies",Friendly}	Books were in great condition, the kids love them.	2026-10-12 09:27:23.918
cmv51tdt100ziuhm82j85ujkr	cmv51tdsv00zeuhm8m6pi7aiq	cmuv6m9180001uh7syb2m1tr0	cmv51tdsj00z4uhm8owzgcwef	4	{"As described"}	Works fine, the seller was flexible with the pickup time.	2026-10-12 09:27:23.941
cmv51tdtm00zxuhm8cfip1a5n	cmv51tdti00ztuhm855tvmjbv	cmuv6m91c0002uh7sx14c2ye6	cmv51tdt500zjuhm8ppl8gnu2	4	{"As described"}	Good tools, fair price.	2026-10-12 09:27:23.963
cmv51tduc010cuhm8capazvr0	cmv51tdu40108uhm8p77hidkj	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdtq00zyuhm83gt0nnq6	5	{"As described","Quick replies",Friendly}	Lovely solid table and the seller helped load it.	2026-10-12 09:27:23.988
cmv51tdux010ruhm8e22l13xj	cmv51tdut010nuhm8c0obievs	cmv51tc750001uhm8fc07n2du	cmv51tdug010duhm85ll0kqov	5	{"As described","Quick replies",Friendly}	Books were in great condition, the kids love them.	2026-10-12 09:27:24.009
cmv51tdvl0116uhm8iwcibfxs	cmv51tdvg0112uhm84av5nkq9	cmv51tc790002uhm8amm39sxb	cmv51tdv0010suhm84ynyknma	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:24.033
cmv51tdw3011luhm8xp1zj2r0	cmv51tdvz011huhm86jwnmrpj	cmv51tc7e0003uhm8dtplheat	cmv51tdvo0117uhm8s25m88ah	5	{"As described","Quick replies",Friendly}	Jacket in great shape, honest seller.	2026-10-12 09:27:24.052
cmv51tdwl0120uhm8906cn6ol	cmv51tdwh011wuhm8k271tts0	cmuv6m9180001uh7syb2m1tr0	cmv51tdw7011muhm8acqd0ur7	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:24.07
cmv51tdx4012fuhm8i59a3zlu	cmv51tdwz012buhm8zj3shixd	cmuv6m91c0002uh7sx14c2ye6	cmv51tdwo0121uhm8pm9z258g	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:24.089
cmv51tdxn012uuhm8d7qdpvu3	cmv51tdxi012quhm89mitsau7	cmv51tc6j0000uhm8i9f9wa7o	cmv51tdx8012guhm8hhwhph59	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:24.108
cmv51tdy60139uhm8qcwzmfge	cmv51tdy20135uhm8fqynd3n5	cmv51tc750001uhm8fc07n2du	cmv51tdxq012vuhm82jm3aclj	5	{"As described","Quick replies",Friendly}	Bat was in great shape, quick handover.	2026-10-12 09:27:24.126
cmv51tdyr013ouhm8yl8ocszj	cmv51tdym013kuhm8xsy16c3g	cmv51tc790002uhm8amm39sxb	cmv51tdy9013auhm8t2ifvjag	5	{"As described","Quick replies",Friendly}	Phone was exactly as described and factory reset in front of me.	2026-10-12 09:27:24.148
cmv51tdza0143uhm8g9817gkr	cmv51tdz5013zuhm8b7qk11cs	cmv51tc7e0003uhm8dtplheat	cmv51tdyv013puhm8gfh0n8ai	4	{"As described"}	Works fine, the seller was flexible with the pickup time.	2026-10-12 09:27:24.166
cmv51tdzr014iuhm8ooijy4x4	cmv51tdzn014euhm8ufjdhju2	cmuv6m9180001uh7syb2m1tr0	cmv51tdzd0144uhm8uhia8tr2	4	{"As described"}	Good tools, fair price.	2026-10-12 09:27:24.184
cmv51te0b014xuhm82wac199y	cmv51te05014tuhm8okdrqy10	cmuv6m91c0002uh7sx14c2ye6	cmv51tdzu014juhm84jkmz4ig	5	{"As described","Quick replies",Friendly}	Lovely solid table and the seller helped load it.	2026-10-12 09:27:24.204
cmv51te0z015cuhm8dfq76wbe	cmv51te0u0158uhm8lg42oq08	cmv51tc6j0000uhm8i9f9wa7o	cmv51te0g014yuhm8okz9rdef	5	{"As described","Quick replies",Friendly}	Books were in great condition, the kids love them.	2026-10-12 09:27:24.228
cmv51te1l015ruhm8wkb07kr7	cmv51te1h015nuhm8u9xvkpp0	cmv51tc750001uhm8fc07n2du	cmv51te13015duhm8qppusbxy	4	{"As described"}	Works fine, the seller was flexible with the pickup time.	2026-10-12 09:27:24.25
cmv51te230166uhm8p7rxgzng	cmv51te1z0162uhm8p5l3369c	cmv51tc790002uhm8amm39sxb	cmv51te1o015suhm82mapigal	5	{"As described","Quick replies",Friendly}	Bag was in pristine condition, quick replies.	2026-10-12 09:27:24.267
cmv51te2m016luhm83jgnt7eo	cmv51te2i016huhm8dv174xyd	cmv51tc7e0003uhm8dtplheat	cmv51te260167uhm86xp7qc4f	5	{"As described","Quick replies",Friendly}	Flash works great, came with the original box.	2026-10-12 09:27:24.286
cmv51te360170uhm87jt5vsg6	cmv51te32016wuhm80vducvo0	cmuv6m9180001uh7syb2m1tr0	cmv51te2q016muhm8z7mpqxk3	5	{"As described","Quick replies",Friendly}	Item was clean and well packed. Recommended.	2026-10-12 09:27:24.307
cmv51te3o017fuhm8izgkg9o5	cmv51te3k017buhm8005yzjj9	cmuv6m91c0002uh7sx14c2ye6	cmv51te390171uhm8r8m26fv9	5	{"As described","Quick replies",Friendly}	Quick and easy deal, item was as good as new.	2026-10-12 09:27:24.324
cmv6cc1u6000buhv85lbav6hl	cmv6bzeas0007uhv8lbsge12a	cmv5792510001uh8koogdh7vy	cmv51tdd900p4uhm89l74qfpy	5	{"As described","Fair price"}	Good	2026-10-13 07:09:37.23
cmvthu7i1000ouh241mdowq8u	cmvthrypg000kuh24fs102dsz	cmuv6m9140000uh7sue4vhajf	cmv51tc8v000luhm8gy1nhadz	5	{"Quick replies","Fair price"}	gdhgd	2026-10-29 12:02:24.505
cmvthv51r000quh24toauqi0h	cmvthrypg000kuh24fs102dsz	cmv51tc8v000luhm8gy1nhadz	cmuv6m9140000uh7sue4vhajf	5	{"Clear communication"}	\N	2026-10-29 12:03:07.983
cmvthvcoh000suh24p8gj5v9z	cmv51tc98000xuhm8a371yr6f	cmv51tc8v000luhm8gy1nhadz	cmv51tc750001uhm8fc07n2du	5	{"Clear communication"}	\N	2026-10-29 12:03:17.873
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, name, city, area, address, "isAdmin", "isBlocked", "createdAt", "sellerStatus", "sellerPhone", "sellerNote", "sellerRejectReason", "sellerAppliedAt") FROM stdin;
cmuv6m9180001uh7syb2m1tr0	aarav@dobara.test	Aarav Mehta	Noida	Sector 62	B-204, Supertech Capetown, Sector 74, Noida 201301	f	f	2025-02-12 11:44:07.483	NONE	\N	\N	\N	\N
cmuv6m91c0002uh7sx14c2ye6	rhea@dobara.test	Rhea Kapoor	Noida	Sector 50	C-12, Sector 50, Noida 201301	f	f	2026-10-05 11:44:07.488	NONE	\N	\N	\N	\N
cmuv6m91l0004uh7sn0nii9u7	karan@dobara.test	Karan Malhotra	Noida	Sector 18	\N	f	f	2025-12-09 11:44:07.495	APPROVED	9810000000	Photography hobbyist. I keep my gear in dry boxes and sell only when I upgrade. Bills available for most items.	\N	2025-12-19 11:44:07.495
cmuv6m91y0005uh7sne9aexuo	rohan@dobara.test	Rohan Kapoor	Noida	Sector 50	\N	f	f	2025-10-30 11:44:07.508	APPROVED	9810000001	Tech enthusiast. All phones sold with original box and bill.	\N	2025-11-09 11:44:07.508
cmuv6m9230006uh7sxuv38bzw	priya@dobara.test	Priya Nair	Ghaziabad	Indirapuram	\N	f	f	2025-09-20 11:44:07.513	APPROVED	9810000002	Moving to Bangalore in November — selling home and camera gear.	\N	2025-09-30 11:44:07.513
cmuv6m9280007uh7svoealavk	aditya@dobara.test	Aditya Verma	Delhi	Saket	\N	f	f	2025-08-11 11:44:07.518	APPROVED	9810000003	Final-year student. Weekend pickups preferred.	\N	2025-08-21 11:44:07.518
cmuv6m92d0008uh7sj5kq7ao9	sneha@dobara.test	Sneha Gupta	Gurgaon	DLF Phase 3	\N	f	f	2025-07-02 11:44:07.523	APPROVED	9810000004	Gamer and PC builder. Every build stress-tested before handover.	\N	2025-07-12 11:44:07.523
cmuv6m92h0009uh7scay6bdzr	mohammed@dobara.test	Mohammed Faizan	Noida	Sector 61	\N	f	f	2025-05-23 11:44:07.527	APPROVED	9810000005	Selling tools and furniture from my old flat.	\N	2025-06-02 11:44:07.527
cmuv6m92l000auh7shjhieuj1	neha@dobara.test	Neha Sharma	Delhi	Lajpat Nagar	\N	f	f	2025-04-13 11:44:07.531	APPROVED	9810000006	Declutter mode. Fair prices, honest descriptions.	\N	2025-04-23 11:44:07.531
cmuv6m92p000buh7syoeezluk	vikas@dobara.test	Vikas Yadav	Ghaziabad	Raj Nagar Extension	\N	f	f	2025-03-04 11:44:07.535	APPROVED	9810000007	Weekday evenings after 7 PM for viewing.	\N	2025-03-14 11:44:07.535
cmuv6m92s000cuh7sxusr9e11	arjun@dobara.test	Arjun Reddy	Hyderabad	Gachibowli	\N	f	f	2025-01-23 11:44:07.539	APPROVED	9810000008		\N	2025-02-02 11:44:07.539
cmuv6m92w000duh7smxgvru0j	kavya@dobara.test	Kavya Iyer	Bangalore	Indiranagar	\N	f	f	2024-12-14 11:44:07.542	APPROVED	9810000009		\N	2024-12-24 11:44:07.542
cmuv6m930000euh7s8dv7t3bf	rahul@dobara.test	Rahul Deshmukh	Pune	Kothrud	\N	f	f	2024-11-04 11:44:07.546	APPROVED	9810000010		\N	2024-11-14 11:44:07.546
cmuv6m934000fuh7snmsllk3o	meera@dobara.test	Meera Joshi	Mumbai	Andheri West	\N	f	f	2024-09-25 11:44:07.55	APPROVED	9810000011		\N	2024-10-05 11:44:07.55
cmuv6m937000guh7sxrn2e4tz	devendra@dobara.test	Devendra Singh Rathore	Jaipur	Malviya Nagar	\N	f	f	2024-08-16 11:44:07.553	APPROVED	9810000012		\N	2024-08-26 11:44:07.553
cmuv6m93b000huh7s6gdjihgo	ankit@dobara.test	Ankit Bansal	Ghaziabad	Vaishali	\N	f	f	2024-07-07 11:44:07.557	APPROVED	9810000013		\N	2024-07-17 11:44:07.557
cmuv6m93f000iuh7szsqcd2w6	ishita@dobara.test	Ishita Arora	Noida	Sector 76	\N	f	f	2024-05-28 11:44:07.561	APPROVED	9810000014		\N	2024-06-07 11:44:07.561
cmv51tcij0055uhm8dwq91l9x	aditi@dobara.test	Aditi Patil	Mumbai	Powai	\N	f	f	2025-09-11 09:27:22.266	APPROVED	9810452212	IIT Bombay researcher. Selling books and electronics before relocating.	\N	2025-09-21 09:27:22.266
cmv51tcj5005muhm8fcscj8o9	rohit@dobara.test	Rohit Naik	Mumbai	Versova	\N	f	f	2025-08-19 09:27:22.288	APPROVED	9810452213	Bike commuter and home cook in Versova.	\N	2025-08-29 09:27:22.288
cmv51tcjr0061uhm81w14fvbq	karthik@dobara.test	Karthik Subramanian	Bangalore	Whitefield	\N	f	f	2025-07-27 09:27:22.31	APPROVED	9810452214	Tech lead at an ITPL startup. Work-from-home gear, all in great shape.	\N	2025-08-06 09:27:22.31
cmv51tcke006iuhm8n33euzeb	divya@dobara.test	Divya Hegde	Bangalore	Koramangala	\N	f	f	2025-07-04 09:27:22.333	APPROVED	9810452215	Designer, minimalist living. Furniture and decor from my Koramangala flat.	\N	2025-07-14 09:27:22.333
cmuwm3h4v0001uhosxdhhoe90	yogi586400@gmail.com	Yogi	Noida	Sector 50	\N	f	f	2026-10-06 11:45:11.551	APPROVED	9867768899	Indian Rupees	\N	2026-10-06 11:46:07.484
cmv51tc6j0000uhm8i9f9wa7o	pooja@dobara.test	Pooja Singh	Delhi	Dwarka	Dwarka, Delhi	f	f	2026-10-12 09:27:21.835	NONE	\N	\N	\N	\N
cmv51tc750001uhm8fc07n2du	siddharth@dobara.test	Siddharth Rao	Bangalore	Koramangala	Koramangala, Bangalore	f	f	2026-10-12 09:27:21.857	NONE	\N	\N	\N	\N
cmv51tc790002uhm8amm39sxb	tanvi@dobara.test	Tanvi Kulkarni	Pune	Baner	Baner, Pune	f	f	2026-10-12 09:27:21.861	NONE	\N	\N	\N	\N
cmv51tc7e0003uhm8dtplheat	imran@dobara.test	Imran Qureshi	Hyderabad	Madhapur	Madhapur, Hyderabad	f	f	2026-10-12 09:27:21.866	NONE	\N	\N	\N	\N
cmv51tc7l0004uhm8v6egi0f3	ananya@dobara.test	Ananya Saxena	Noida	Sector 62	\N	f	f	2026-05-22 09:27:21.871	APPROVED	9810452201	Software engineer in Sector 62. I upgrade gadgets often and keep every bill and box.	\N	2026-06-01 09:27:21.871
cmv51tc8v000luhm8gy1nhadz	gaurav@dobara.test	Gaurav Chauhan	Noida	Sector 137	\N	f	f	2026-04-29 09:27:21.918	APPROVED	9810452202	Fitness and outdoors. Weekend pickups from Paras Tierea, Sector 137.	\N	2026-05-09 09:27:21.918
cmv51tc9h0012uhm848ampvfo	shalini@dobara.test	Shalini Mishra	Noida	Sector 74	\N	f	f	2026-04-06 09:27:21.94	APPROVED	9810452203	Home decor lover. Furniture is solid wood and kept in a smoke-free, pet-free home.	\N	2026-04-16 09:27:21.94
cmv51tcb7001juhm86jt72j5y	harpreet@dobara.test	Harpreet Kaur	Delhi	Dwarka	\N	f	f	2026-03-14 09:27:22.001	APPROVED	9810452204	Teacher in Dwarka. Selling things from my kids’ rooms and our old study.	\N	2026-03-24 09:27:22.001
cmv51tcdc0020uhm89xbrvius	sameer@dobara.test	Sameer Khan	Delhi	Rohini	\N	f	f	2026-02-19 09:27:22.079	APPROVED	9810452205	Bike and car enthusiast. All vehicles with papers, service history and NOC.	\N	2026-03-01 09:27:22.079
cmv51tcek002fuhm8bc53jn6p	nitin@dobara.test	Nitin Aggarwal	Delhi	Karol Bagh	\N	f	f	2026-01-27 09:27:22.123	APPROVED	9810452206	I run a small electronics repair shop in Karol Bagh. Every device is tested before sale.	\N	2026-02-06 09:27:22.123
cmv51tcfc002wuhm8kcykhz7c	ritika@dobara.test	Ritika Goel	Ghaziabad	Indirapuram	\N	f	f	2026-01-04 09:27:22.151	APPROVED	9810452207	Moving to Dubai in December — everything must go, at fair prices.	\N	2026-01-14 09:27:22.151
cmv51tcg0003duhm8civbu6c6	deepak@dobara.test	Deepak Tyagi	Ghaziabad	Raj Nagar Extension	\N	f	f	2025-12-12 09:27:22.175	APPROVED	9810452208	Contractor — selling spare power tools and some home items.	\N	2025-12-22 09:27:22.175
cmv51tcgj003suhm8hl3ylyak	varun@dobara.test	Varun Khanna	Gurgaon	Golf Course Road	\N	f	f	2025-11-19 09:27:22.194	APPROVED	9810452209	Product manager and gamer. Consoles and PCs are kept dust-free in an AC room.	\N	2025-11-29 09:27:22.194
cmv51tch60049uhm8kwvp1g5f	simran@dobara.test	Simran Ahuja	Gurgaon	Sohna Road	\N	f	f	2025-10-27 09:27:22.218	APPROVED	9810452210	Fashion and lifestyle — wardrobe clear-out every season.	\N	2025-11-06 09:27:22.218
cmv51tchx004quhm8o1c09yoo	farhan@dobara.test	Farhan Shaikh	Mumbai	Bandra	\N	f	f	2025-10-04 09:27:22.245	APPROVED	9810452211	Wedding and travel photographer. I sell older gear when I upgrade bodies.	\N	2025-10-14 09:27:22.245
cmv51tcl3006zuhm8g2ieril4	pranav@dobara.test	Pranav Rao	Bangalore	HSR Layout	\N	f	f	2025-06-11 09:27:22.358	APPROVED	9810452216	Weekend cyclist and gamer in HSR. Quick replies, flexible pickups.	\N	2025-06-21 09:27:22.358
cmv51tcll007euhm8upawpjlw	shruti@dobara.test	Shruti Kulkarni	Pune	Baner	\N	f	f	2025-05-19 09:27:22.376	APPROVED	9810452217	Musician and teacher. Instruments and books from my Baner studio.	\N	2025-05-29 09:27:22.376
cmuv6m9140000uh7sue4vhajf	admin@dobara.test	Ritu Sharma	Noida	Sector 62	\N	t	f	2025-08-31 11:44:07.476	NONE	\N	\N	\N	\N
cmv51tcm2007tuhm8j5ky6d21	omkar@dobara.test	Omkar Jadhav	Pune	Viman Nagar	\N	f	f	2025-04-26 09:27:22.393	APPROVED	9810452218	Mechanical engineer. Bikes, tools and appliances — all tested.	\N	2025-05-06 09:27:22.393
cmv51tcmo008auhm8d4bvpab3	lakshmi@dobara.test	Lakshmi Prasad	Hyderabad	Madhapur	\N	f	f	2025-04-03 09:27:22.415	APPROVED	9810452219	Working in HITEC City. Selling gadgets and home appliances after upgrading.	\N	2025-04-13 09:27:22.415
cmv51tcnf008ruhm8sk15hj8c	sai@dobara.test	Sai Teja	Hyderabad	Kondapur	\N	f	f	2025-03-11 09:27:22.442	APPROVED	9810452220	Gym trainer and gamer. Fitness gear and consoles, all in great shape.	\N	2025-03-21 09:27:22.442
cmv51tco20096uhm83ziqhjzl	yash@dobara.test	Yash Agarwal	Jaipur	Vaishali Nagar	\N	f	f	2025-02-16 09:27:22.466	APPROVED	9810452221	Family business in electronics retail. Tested phones and laptops with bills.	\N	2025-02-26 09:27:22.466
cmv51tcoo009nuhm8ipomqjvq	pallavi@dobara.test	Pallavi Rathore	Jaipur	C-Scheme	\N	f	f	2026-06-08 09:27:22.488	APPROVED	9810452222	Interior designer in C-Scheme. Handpicked furniture and decor pieces.	\N	2026-06-18 09:27:22.488
cmv51tcpc00a4uhm8oc5qxijn	abhishek.srivastava@dobara.test	Abhishek Srivastava	Noida	Sector 18	\N	f	f	2026-05-16 09:27:22.511	APPROVED	9810510001	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Sector 18, Noida.	\N	2026-05-26 09:27:22.511
cmv51tcpy00ajuhm8emqmn0z2	nidhi.agarwal@dobara.test	Nidhi Agarwal	Noida	Sector 18	\N	f	f	2026-04-23 09:27:22.533	APPROVED	9810510002	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in Sector 18, Noida.	\N	2026-05-03 09:27:22.533
cmv51tcqk00ayuhm8ofjcpehc	rajat.bhatia@dobara.test	Rajat Bhatia	Noida	Sector 18	\N	f	f	2026-03-31 09:27:22.556	APPROVED	9810510003	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in Sector 18, Noida.	\N	2026-04-10 09:27:22.556
cmv51tcr700bduhm8j50zp6hr	swati.pandey@dobara.test	Swati Pandey	Noida	Sector 50	\N	f	f	2026-03-08 09:27:22.578	APPROVED	9810510004	Fitness and outdoor gear. Weekend pickups, everything wiped down and checked. Based in Sector 50, Noida.	\N	2026-03-18 09:27:22.578
cmv51tcrs00bsuhm8c5q9kc1i	kunal.sethi@dobara.test	Kunal Sethi	Noida	Sector 50	\N	f	f	2026-02-13 09:27:22.599	APPROVED	9810510005	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Sector 50, Noida.	\N	2026-02-23 09:27:22.599
cmv51tcsd00c7uhm8tmo56vlo	megha.rastogi@dobara.test	Megha Rastogi	Noida	Sector 61	\N	f	f	2026-01-21 09:27:22.62	APPROVED	9810510006	Home appliances after upgrading the kitchen. Everything working and cleaned before sale. Based in Sector 61, Noida.	\N	2026-01-31 09:27:22.62
cmv51tcsx00cmuhm8hznxusn2	vivek.chaudhary@dobara.test	Vivek Chaudhary	Noida	Sector 61	\N	f	f	2025-12-29 09:27:22.641	APPROVED	9810510007	Carpenter and DIY enthusiast. Power tools with batteries and cases, all tested. Based in Sector 61, Noida.	\N	2026-01-08 09:27:22.641
cmv51tcti00d1uhm8xkgp5mta	tanya.malik@dobara.test	Tanya Malik	Noida	Sector 62	\N	f	f	2025-12-06 09:27:22.661	APPROVED	9810510008	Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport. Based in Sector 62, Noida.	\N	2025-12-16 09:27:22.661
cmv51tcu500dguhm88atkf6z3	saurabh.dubey@dobara.test	Saurabh Dubey	Noida	Sector 62	\N	f	f	2025-11-13 09:27:22.684	APPROVED	9810510009	Books, music and hobby things from a home library. Happy to bundle for a discount. Based in Sector 62, Noida.	\N	2025-11-23 09:27:22.684
cmv51tcup00dvuhm8ons2j78m	kritika.jain@dobara.test	Kritika Jain	Noida	Sector 74	\N	f	f	2025-10-21 09:27:22.704	APPROVED	9810510010	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in Sector 74, Noida.	\N	2025-10-31 09:27:22.704
cmv51tcva00eauhm801p8125h	ashish.tomar@dobara.test	Ashish Tomar	Noida	Sector 74	\N	f	f	2025-09-28 09:27:22.725	APPROVED	9810510011	Vehicles with papers, service records and NOC. Test ride on request. Based in Sector 74, Noida.	\N	2025-10-08 09:27:22.725
cmv51tcvx00epuhm81f0vvd48	pooja.bisht@dobara.test	Pooja Bisht	Noida	Sector 76	\N	f	f	2025-09-05 09:27:22.749	APPROVED	9810510012	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Sector 76, Noida.	\N	2025-09-15 09:27:22.749
cmv51tcwl00f4uhm8xd2n2dpo	mayank.goyal@dobara.test	Mayank Goyal	Noida	Sector 76	\N	f	f	2025-08-13 09:27:22.772	APPROVED	9810510013	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in Sector 76, Noida.	\N	2025-08-23 09:27:22.772
cmv51tcx800fjuhm8gtn4c7i7	shreya.tripathi@dobara.test	Shreya Tripathi	Noida	Sector 137	\N	f	f	2025-07-21 09:27:22.795	APPROVED	9810510014	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Sector 137, Noida.	\N	2025-07-31 09:27:22.795
cmv51tcy100fyuhm8kz5j5o5z	rakesh.negi@dobara.test	Rakesh Negi	Noida	Sector 137	\N	f	f	2025-06-28 09:27:22.824	APPROVED	9810510015	Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover. Based in Sector 137, Noida.	\N	2025-07-08 09:27:22.824
cmv51tcyo00gduhm80czpt8wj	aman.bhalla@dobara.test	Aman Bhalla	Delhi	Saket	\N	f	f	2025-06-05 09:27:22.848	APPROVED	9810510016	Carpenter and DIY enthusiast. Power tools with batteries and cases, all tested. Based in Saket, Delhi.	\N	2025-06-15 09:27:22.848
cmv51tcze00gsuhm8wx06xo2s	ritu.khurana@dobara.test	Ritu Khurana	Delhi	Saket	\N	f	f	2025-05-13 09:27:22.873	APPROVED	9810510017	Fitness and outdoor gear. Weekend pickups, everything wiped down and checked. Based in Saket, Delhi.	\N	2025-05-23 09:27:22.873
cmv51td0100h7uhm8i1idvzp7	siddhant.arora@dobara.test	Siddhant Arora	Delhi	Saket	\N	f	f	2025-04-20 09:27:22.896	APPROVED	9810510018	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Saket, Delhi.	\N	2025-04-30 09:27:22.896
cmv51td0o00hmuhm8spwsa97c	jasleen.gill@dobara.test	Jasleen Gill	Delhi	Lajpat Nagar	\N	f	f	2025-03-28 09:27:22.919	APPROVED	9810510019	Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport. Based in Lajpat Nagar, Delhi.	\N	2025-04-07 09:27:22.919
cmv51td1c00i1uhm8xu5jqybo	varun.chopra@dobara.test	Varun Chopra	Delhi	Lajpat Nagar	\N	f	f	2025-03-05 09:27:22.943	APPROVED	9810510020	Books, music and hobby things from a home library. Happy to bundle for a discount. Based in Lajpat Nagar, Delhi.	\N	2025-03-15 09:27:22.943
cmv51td1z00iguhm8vdgvm19j	naina.batra@dobara.test	Naina Batra	Delhi	Dwarka	\N	f	f	2025-02-10 09:27:22.966	APPROVED	9810510021	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in Dwarka, Delhi.	\N	2025-02-20 09:27:22.966
cmv51td2n00ivuhm8nc5681p5	manoj.rawat@dobara.test	Manoj Rawat	Delhi	Dwarka	\N	f	f	2026-06-02 09:27:22.99	APPROVED	9810510022	Vehicles with papers, service records and NOC. Test ride on request. Based in Dwarka, Delhi.	\N	2026-06-12 09:27:22.99
cmv51td3900jauhm8a86jcb4t	akanksha.sood@dobara.test	Akanksha Sood	Delhi	Rohini	\N	f	f	2026-05-10 09:27:23.012	APPROVED	9810510023	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Rohini, Delhi.	\N	2026-05-20 09:27:23.012
cmv51td3x00jpuhm8a3oeqzkz	harsh.vohra@dobara.test	Harsh Vohra	Delhi	Rohini	\N	f	f	2026-04-17 09:27:23.036	APPROVED	9810510024	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in Rohini, Delhi.	\N	2026-04-27 09:27:23.036
cmv51td4h00k4uhm8ps06px67	komal.dhingra@dobara.test	Komal Dhingra	Delhi	Karol Bagh	\N	f	f	2026-03-25 09:27:23.056	APPROVED	9810510025	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Karol Bagh, Delhi.	\N	2026-04-04 09:27:23.056
cmv51td5200kjuhm8uf7iq953	rajiv.talwar@dobara.test	Rajiv Talwar	Delhi	Karol Bagh	\N	f	f	2026-03-02 09:27:23.077	APPROVED	9810510026	Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover. Based in Karol Bagh, Delhi.	\N	2026-03-12 09:27:23.077
cmv51td5l00kyuhm8k816nrq0	sachin.tyagi@dobara.test	Sachin Tyagi	Ghaziabad	Indirapuram	\N	f	f	2026-02-07 09:27:23.096	APPROVED	9810510027	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Indirapuram, Ghaziabad.	\N	2026-02-17 09:27:23.096
cmv51td6900lduhm8x84bxr3q	prerna.garg@dobara.test	Prerna Garg	Ghaziabad	Indirapuram	\N	f	f	2026-01-15 09:27:23.12	APPROVED	9810510028	Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover. Based in Indirapuram, Ghaziabad.	\N	2026-01-25 09:27:23.12
cmv51td6w00lsuhm8vfmd0cgu	ajay.sirohi@dobara.test	Ajay Sirohi	Ghaziabad	Vaishali	\N	f	f	2025-12-23 09:27:23.143	APPROVED	9810510029	Books, music and hobby things from a home library. Happy to bundle for a discount. Based in Vaishali, Ghaziabad.	\N	2026-01-02 09:27:23.143
cmv51td7f00m7uhm8b4l6hyk2	monika.bhardwaj@dobara.test	Monika Bhardwaj	Ghaziabad	Vaishali	\N	f	f	2025-11-30 09:27:23.163	APPROVED	9810510030	Home appliances after upgrading the kitchen. Everything working and cleaned before sale. Based in Vaishali, Ghaziabad.	\N	2025-12-10 09:27:23.163
cmv51td7z00mmuhm8ngklrx4o	tarun.mittal@dobara.test	Tarun Mittal	Ghaziabad	Raj Nagar Extension	\N	f	f	2025-11-07 09:27:23.182	APPROVED	9810510031	Books, music and hobby things from a home library. Happy to bundle for a discount. Based in Raj Nagar Extension, Ghaziabad.	\N	2025-11-17 09:27:23.182
cmv51td8m00n1uhm8nerfktld	rohit.yadav@dobara.test	Rohit Yadav	Gurgaon	DLF Phase 3	\N	f	f	2025-10-15 09:27:23.205	APPROVED	9810510032	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in DLF Phase 3, Gurgaon.	\N	2025-10-25 09:27:23.205
cmv51td9a00nguhm8xo8mdqu8	anjali.dahiya@dobara.test	Anjali Dahiya	Gurgaon	DLF Phase 3	\N	f	f	2025-09-22 09:27:23.229	APPROVED	9810510033	Vehicles with papers, service records and NOC. Test ride on request. Based in DLF Phase 3, Gurgaon.	\N	2025-10-02 09:27:23.229
cmv51tda000nvuhm8zwxizw4q	nikhil.sangwan@dobara.test	Nikhil Sangwan	Gurgaon	DLF Phase 3	\N	f	f	2025-08-30 09:27:23.255	APPROVED	9810510034	Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport. Based in DLF Phase 3, Gurgaon.	\N	2025-09-09 09:27:23.255
cmv51tdbz00oauhm8omxibygu	payal.hooda@dobara.test	Payal Hooda	Gurgaon	Sohna Road	\N	f	f	2025-08-07 09:27:23.326	APPROVED	9810510035	Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover. Based in Sohna Road, Gurgaon.	\N	2025-08-17 09:27:23.326
cmv51tdco00opuhm8w8yd45sm	gaurav.kataria@dobara.test	Gaurav Kataria	Gurgaon	Sohna Road	\N	f	f	2025-07-15 09:27:23.351	APPROVED	9810510036	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Sohna Road, Gurgaon.	\N	2025-07-25 09:27:23.351
cmv51tdd900p4uhm89l74qfpy	sakshi.phogat@dobara.test	Sakshi Phogat	Gurgaon	Golf Course Road	\N	f	f	2025-06-22 09:27:23.372	APPROVED	9810510037	Fitness and outdoor gear. Weekend pickups, everything wiped down and checked. Based in Golf Course Road, Gurgaon.	\N	2025-07-02 09:27:23.372
cmv51tddu00pjuhm8wt0p0hpr	vikram.rao@dobara.test	Vikram Rao	Gurgaon	Golf Course Road	\N	f	f	2025-05-30 09:27:23.393	APPROVED	9810510038	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Golf Course Road, Gurgaon.	\N	2025-06-09 09:27:23.393
cmv51tdee00pyuhm8mx8iayt1	aniket.sawant@dobara.test	Aniket Sawant	Mumbai	Andheri West	\N	f	f	2025-05-07 09:27:23.413	APPROVED	9810510039	Home appliances after upgrading the kitchen. Everything working and cleaned before sale. Based in Andheri West, Mumbai.	\N	2025-05-17 09:27:23.413
cmv51tdez00qduhm8i8yw4wnk	pooja.desai@dobara.test	Pooja Desai	Mumbai	Andheri West	\N	f	f	2025-04-14 09:27:23.434	APPROVED	9810510040	Carpenter and DIY enthusiast. Power tools with batteries and cases, all tested. Based in Andheri West, Mumbai.	\N	2025-04-24 09:27:23.434
cmv51tdfm00qsuhm883vw6g8t	zaid.merchant@dobara.test	Zaid Merchant	Mumbai	Andheri West	\N	f	f	2025-03-22 09:27:23.457	APPROVED	9810510041	Fitness and outdoor gear. Weekend pickups, everything wiped down and checked. Based in Andheri West, Mumbai.	\N	2025-04-01 09:27:23.457
cmv51tdga00r7uhm8ia6axlrn	neha.pillai@dobara.test	Neha Pillai	Mumbai	Versova	\N	f	f	2025-02-27 09:27:23.482	APPROVED	9810510042	Vehicles with papers, service records and NOC. Test ride on request. Based in Versova, Mumbai.	\N	2025-03-09 09:27:23.482
cmv51tdgy00rmuhm8n3otph93	siddharth.mhatre@dobara.test	Siddharth Mhatre	Mumbai	Versova	\N	f	f	2025-02-04 09:27:23.505	APPROVED	9810510043	Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport. Based in Versova, Mumbai.	\N	2025-02-14 09:27:23.506
cmv51tdhm00s1uhm84c40hf27	riya.fernandes@dobara.test	Riya Fernandes	Mumbai	Bandra	\N	f	f	2026-05-27 09:27:23.529	APPROVED	9810510044	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in Bandra, Mumbai.	\N	2026-06-06 09:27:23.529
cmv51tdi900sguhm89dvu0p80	kunal.shah@dobara.test	Kunal Shah	Mumbai	Bandra	\N	f	f	2026-05-04 09:27:23.552	APPROVED	9810510045	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in Bandra, Mumbai.	\N	2026-05-14 09:27:23.552
cmv51tdit00svuhm8c3tkn9xq	sanya.mehta@dobara.test	Sanya Mehta	Mumbai	Powai	\N	f	f	2026-04-11 09:27:23.573	APPROVED	9810510046	Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover. Based in Powai, Mumbai.	\N	2026-04-21 09:27:23.573
cmv51tdjg00tauhm8jkqzx6b7	tejas.gokhale@dobara.test	Tejas Gokhale	Mumbai	Powai	\N	f	f	2026-03-19 09:27:23.595	APPROVED	9810510047	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Powai, Mumbai.	\N	2026-03-29 09:27:23.595
cmv51tdk100tpuhm80l7cdar4	arvind.gowda@dobara.test	Arvind Gowda	Bangalore	Indiranagar	\N	f	f	2026-02-24 09:27:23.617	APPROVED	9810510048	Fitness and outdoor gear. Weekend pickups, everything wiped down and checked. Based in Indiranagar, Bangalore.	\N	2026-03-06 09:27:23.617
cmv51tdkn00u4uhm84zbj002k	deepa.shetty@dobara.test	Deepa Shetty	Bangalore	Indiranagar	\N	f	f	2026-02-01 09:27:23.638	APPROVED	9810510049	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Indiranagar, Bangalore.	\N	2026-02-11 09:27:23.638
cmv51tdl600ujuhm8gkh2m2z0	naveen.kumar@dobara.test	Naveen Kumar	Bangalore	Koramangala	\N	f	f	2026-01-09 09:27:23.657	APPROVED	9810510050	Home appliances after upgrading the kitchen. Everything working and cleaned before sale. Based in Koramangala, Bangalore.	\N	2026-01-19 09:27:23.657
cmv51tdlq00uyuhm87ibtd394	sneha.murthy@dobara.test	Sneha Murthy	Bangalore	Koramangala	\N	f	f	2025-12-17 09:27:23.677	APPROVED	9810510051	Carpenter and DIY enthusiast. Power tools with batteries and cases, all tested. Based in Koramangala, Bangalore.	\N	2025-12-27 09:27:23.677
cmv51tdmb00vduhm8zuvxwxdq	rakshit.bhat@dobara.test	Rakshit Bhat	Bangalore	Koramangala	\N	f	f	2025-11-24 09:27:23.699	APPROVED	9810510052	Fitness and outdoor gear. Weekend pickups, everything wiped down and checked. Based in Koramangala, Bangalore.	\N	2025-12-04 09:27:23.699
cmv51tdmu00vsuhm8r0ii6tt1	anusha.reddy@dobara.test	Anusha Reddy	Bangalore	HSR Layout	\N	f	f	2025-11-01 09:27:23.717	APPROVED	9810510053	Vehicles with papers, service records and NOC. Test ride on request. Based in HSR Layout, Bangalore.	\N	2025-11-11 09:27:23.717
cmv51tdnf00w7uhm83ao4b4yq	vinay.prabhu@dobara.test	Vinay Prabhu	Bangalore	HSR Layout	\N	f	f	2025-10-09 09:27:23.738	APPROVED	9810510054	Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport. Based in HSR Layout, Bangalore.	\N	2025-10-19 09:27:23.738
cmv51tdo900wmuhm8k2isgtds	keerthi.rao@dobara.test	Keerthi Rao	Bangalore	Whitefield	\N	f	f	2025-09-16 09:27:23.768	APPROVED	9810510055	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in Whitefield, Bangalore.	\N	2025-09-26 09:27:23.768
cmv51tdp400x1uhm8aw9nl0eo	suhas.nayak@dobara.test	Suhas Nayak	Bangalore	Whitefield	\N	f	f	2025-08-24 09:27:23.799	APPROVED	9810510056	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in Whitefield, Bangalore.	\N	2025-09-03 09:27:23.799
cmv51tdpx00xguhm8pl0m36an	aditya.kale@dobara.test	Aditya Kale	Pune	Kothrud	\N	f	f	2025-08-01 09:27:23.828	APPROVED	9810510057	Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover. Based in Kothrud, Pune.	\N	2025-08-11 09:27:23.828
cmv51tdqn00xvuhm890r05g7v	mrunal.joshi@dobara.test	Mrunal Joshi	Pune	Kothrud	\N	f	f	2025-07-09 09:27:23.854	APPROVED	9810510058	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Kothrud, Pune.	\N	2025-07-19 09:27:23.854
cmv51tdr900yauhm8vep96ors	ninad.bapat@dobara.test	Ninad Bapat	Pune	Kothrud	\N	f	f	2025-06-16 09:27:23.876	APPROVED	9810510059	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in Kothrud, Pune.	\N	2025-06-26 09:27:23.876
cmv51tdrv00ypuhm86dbijx4a	sayali.pawar@dobara.test	Sayali Pawar	Pune	Karve Nagar	\N	f	f	2025-05-24 09:27:23.899	APPROVED	9810510060	Books, music and hobby things from a home library. Happy to bundle for a discount. Based in Karve Nagar, Pune.	\N	2025-06-03 09:27:23.899
cmv51tdsj00z4uhm8owzgcwef	chinmay.gadgil@dobara.test	Chinmay Gadgil	Pune	Karve Nagar	\N	f	f	2025-05-01 09:27:23.922	APPROVED	9810510061	Home appliances after upgrading the kitchen. Everything working and cleaned before sale. Based in Karve Nagar, Pune.	\N	2025-05-11 09:27:23.922
cmv51tdt500zjuhm8ppl8gnu2	rutuja.shinde@dobara.test	Rutuja Shinde	Pune	Karve Nagar	\N	f	f	2025-04-08 09:27:23.944	APPROVED	9810510062	Carpenter and DIY enthusiast. Power tools with batteries and cases, all tested. Based in Karve Nagar, Pune.	\N	2025-04-18 09:27:23.944
cmv51tdtq00zyuhm83gt0nnq6	akshay.more@dobara.test	Akshay More	Pune	Baner	\N	f	f	2025-03-16 09:27:23.965	APPROVED	9810510063	Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport. Based in Baner, Pune.	\N	2025-03-26 09:27:23.965
cmv51tdug010duhm85ll0kqov	gauri.deshpande@dobara.test	Gauri Deshpande	Pune	Baner	\N	f	f	2025-02-21 09:27:23.991	APPROVED	9810510064	Books, music and hobby things from a home library. Happy to bundle for a discount. Based in Baner, Pune.	\N	2025-03-03 09:27:23.991
cmv51tdv0010suhm84ynyknma	prathamesh.bhosale@dobara.test	Prathamesh Bhosale	Pune	Viman Nagar	\N	f	f	2026-06-13 09:27:24.011	APPROVED	9810510065	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in Viman Nagar, Pune.	\N	2026-06-23 09:27:24.011
cmv51tdvo0117uhm8s25m88ah	ketaki.apte@dobara.test	Ketaki Apte	Pune	Viman Nagar	\N	f	f	2026-05-21 09:27:24.036	APPROVED	9810510066	Vehicles with papers, service records and NOC. Test ride on request. Based in Viman Nagar, Pune.	\N	2026-05-31 09:27:24.036
cmv51tdw7011muhm8acqd0ur7	ravi.teja@dobara.test	Ravi Teja	Hyderabad	Gachibowli	\N	f	f	2026-04-28 09:27:24.054	APPROVED	9810510067	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Gachibowli, Hyderabad.	\N	2026-05-08 09:27:24.054
cmv51tdwo0121uhm8pm9z258g	swathi.reddy@dobara.test	Swathi Reddy	Hyderabad	Gachibowli	\N	f	f	2026-04-05 09:27:24.072	APPROVED	9810510068	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in Gachibowli, Hyderabad.	\N	2026-04-15 09:27:24.072
cmv51tdx8012guhm8hhwhph59	kiran.varma@dobara.test	Kiran Varma	Hyderabad	Gachibowli	\N	f	f	2026-03-13 09:27:24.091	APPROVED	9810510069	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in Gachibowli, Hyderabad.	\N	2026-03-23 09:27:24.091
cmv51tdxq012vuhm82jm3aclj	mounika.rao@dobara.test	Mounika Rao	Hyderabad	Kondapur	\N	f	f	2026-02-18 09:27:24.109	APPROVED	9810510070	Fitness and outdoor gear. Weekend pickups, everything wiped down and checked. Based in Kondapur, Hyderabad.	\N	2026-02-28 09:27:24.109
cmv51tdy9013auhm8t2ifvjag	abdul.rahman@dobara.test	Abdul Rahman	Hyderabad	Kondapur	\N	f	f	2026-01-26 09:27:24.128	APPROVED	9810510071	Gadget upgrader. Phones and accessories with bills, factory reset before handover. Based in Kondapur, Hyderabad.	\N	2026-02-05 09:27:24.128
cmv51tdyv013puhm8gfh0n8ai	harika.chowdary@dobara.test	Harika Chowdary	Hyderabad	Madhapur	\N	f	f	2026-01-03 09:27:24.15	APPROVED	9810510072	Home appliances after upgrading the kitchen. Everything working and cleaned before sale. Based in Madhapur, Hyderabad.	\N	2026-01-13 09:27:24.15
cmv51tdzd0144uhm8uhia8tr2	srikanth.goud@dobara.test	Srikanth Goud	Hyderabad	Madhapur	\N	f	f	2025-12-11 09:27:24.168	APPROVED	9810510073	Carpenter and DIY enthusiast. Power tools with batteries and cases, all tested. Based in Madhapur, Hyderabad.	\N	2025-12-21 09:27:24.168
cmv51tdzu014juhm84jkmz4ig	mahendra.shekhawat@dobara.test	Mahendra Shekhawat	Jaipur	Malviya Nagar	\N	f	f	2025-11-18 09:27:24.186	APPROVED	9810510074	Relocating soon — selling well-kept furniture from a smoke-free home. Buyer arranges transport. Based in Malviya Nagar, Jaipur.	\N	2025-11-28 09:27:24.186
cmv51te0g014yuhm8okz9rdef	ruchi.khandelwal@dobara.test	Ruchi Khandelwal	Jaipur	Malviya Nagar	\N	f	f	2025-10-26 09:27:24.207	APPROVED	9810510075	Books, music and hobby things from a home library. Happy to bundle for a discount. Based in Malviya Nagar, Jaipur.	\N	2025-11-05 09:27:24.207
cmv51te13015duhm8qppusbxy	lokesh.saini@dobara.test	Lokesh Saini	Jaipur	Malviya Nagar	\N	f	f	2025-10-03 09:27:24.23	APPROVED	9810510076	Home appliances after upgrading the kitchen. Everything working and cleaned before sale. Based in Malviya Nagar, Jaipur.	\N	2025-10-13 09:27:24.23
cmv51te1o015suhm82mapigal	ankita.sharma@dobara.test	Ankita Sharma	Jaipur	C-Scheme	\N	f	f	2025-09-10 09:27:24.251	APPROVED	9810510077	Wardrobe clear-out — authentic brands, worn only a few times. Delivery available. Based in C-Scheme, Jaipur.	\N	2025-09-20 09:27:24.251
cmv51te260167uhm86xp7qc4f	himanshu.jangid@dobara.test	Himanshu Jangid	Jaipur	C-Scheme	\N	f	f	2025-08-18 09:27:24.269	APPROVED	9810510078	Photography hobbyist. Gear stored in a dry box, no fungus, shutter counts shared on request. Based in C-Scheme, Jaipur.	\N	2025-08-28 09:27:24.269
cmv51te2q016muhm8z7mpqxk3	nisha.choudhary@dobara.test	Nisha Choudhary	Jaipur	Vaishali Nagar	\N	f	f	2025-07-26 09:27:24.289	APPROVED	9810510079	Gamer — consoles and PC parts kept dust-free in an AC room. Stress-tested before handover. Based in Vaishali Nagar, Jaipur.	\N	2025-08-05 09:27:24.289
cmv51te390171uhm8r8m26fv9	rajendra.meena@dobara.test	Rajendra Meena	Jaipur	Vaishali Nagar	\N	f	f	2025-07-03 09:27:24.308	APPROVED	9810510080	Works in IT, upgrades laptops and monitors every couple of years. All tested and cleaned. Based in Vaishali Nagar, Jaipur.	\N	2025-07-13 09:27:24.308
cmuv6m91f0003uh7s75g6e8pw	manish@dobara.test	Manish Tiwari	Noida	Sector 137	Tower 4, Paras Tierea, Sector 137, Noida	f	f	2026-10-05 11:44:07.491	PENDING	9811022334	I want to sell a few old kitchen appliances and a study table I no longer need.	\N	2026-10-05 10:14:07.563
cmv5792510001uh8koogdh7vy	yogendrapratapsinghdas@gmail.com	ttg	Gurgaon	Golf Course Road	\N	f	f	2026-10-12 11:59:33.397	NONE	\N	\N	\N	\N
\.


--
-- Name: Complaint Complaint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_pkey" PRIMARY KEY (id);


--
-- Name: ContactMessage ContactMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContactMessage"
    ADD CONSTRAINT "ContactMessage_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: EmailOtp EmailOtp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailOtp"
    ADD CONSTRAINT "EmailOtp_pkey" PRIMARY KEY (id);


--
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Conversation_listingId_buyerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Conversation_listingId_buyerId_key" ON public."Conversation" USING btree ("listingId", "buyerId");


--
-- Name: EmailOtp_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmailOtp_email_idx" ON public."EmailOtp" USING btree (email);


--
-- Name: Listing_status_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Listing_status_city_idx" ON public."Listing" USING btree (status, city);


--
-- Name: Message_conversationId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_conversationId_createdAt_idx" ON public."Message" USING btree ("conversationId", "createdAt");


--
-- Name: Order_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_code_key" ON public."Order" USING btree (code);


--
-- Name: Payout_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payout_orderId_key" ON public."Payout" USING btree ("orderId");


--
-- Name: Review_orderId_fromUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Review_orderId_fromUserId_key" ON public."Review" USING btree ("orderId", "fromUserId");


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Complaint Complaint_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Complaint Complaint_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Listing Listing_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payout Payout_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payout Payout_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_fromUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_toUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict lsNFHsxUIyAvDuDgtrjEX2DYt8rezkMpP8CAH0nlkN6KUfHYdxXF0lJAkGOr4d0

