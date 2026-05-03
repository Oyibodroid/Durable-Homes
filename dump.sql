--
-- PostgreSQL database dump
--

\restrict nzq4w3pOZSyJHMvupqOHlhmeH8MLKpcqlVdS3gbqEHZdHRsgP3i1A9UIqWV3lXb

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
    'ON_HOLD'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentProvider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentProvider" AS ENUM (
    'PAYSTACK',
    'FLUTTERWAVE',
    'STRIPE'
);


ALTER TYPE public."PaymentProvider" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
    'OUT_OF_STOCK'
);


ALTER TYPE public."ProductStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'MANAGER'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "productVariantId" text
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: PromoCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PromoCode" (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" text NOT NULL,
    "discountValue" double precision NOT NULL,
    "minPurchase" double precision,
    "maxDiscount" double precision,
    "usageLimit" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "validUntil" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PromoCode" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text DEFAULT 'NG'::text NOT NULL,
    phone text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    parent_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discounts (
    id text NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    value numeric(10,2) NOT NULL,
    min_purchase numeric(10,2),
    max_discount numeric(10,2),
    usage_limit integer,
    usage_count integer DEFAULT 0 NOT NULL,
    per_user_limit integer,
    "applicableProducts" jsonb,
    "applicableCategories" jsonb,
    exclude_products jsonb,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.discounts OWNER TO postgres;

--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verification_tokens (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_verification_tokens OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    variant_id text,
    name text NOT NULL,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    id text NOT NULL,
    order_id text NOT NULL,
    status public."OrderStatus" NOT NULL,
    note text,
    changed_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    user_id text,
    guest_email text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    payment_status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount_total numeric(10,2) DEFAULT 0 NOT NULL,
    shipping_total numeric(10,2) DEFAULT 0 NOT NULL,
    tax_total numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    discount_id text,
    notes text,
    "adminNotes" text,
    payment_reference text,
    payment_provider public."PaymentProvider",
    paid_at timestamp(3) without time zone,
    shipped_at timestamp(3) without time zone,
    delivered_at timestamp(3) without time zone,
    cancelled_at timestamp(3) without time zone,
    cancel_reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    order_id text NOT NULL,
    provider public."PaymentProvider" NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    reference text NOT NULL,
    transaction_id text,
    metadata jsonb,
    error_message text,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    product_id text NOT NULL,
    url text NOT NULL,
    alt text,
    "position" integer DEFAULT 0 NOT NULL,
    is_main boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    product_id text NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    price numeric(10,2),
    quantity integer DEFAULT 0 NOT NULL,
    options jsonb NOT NULL,
    image text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    short_description character varying(255),
    price double precision NOT NULL,
    compare_at_price double precision,
    cost double precision,
    sku text NOT NULL,
    barcode text,
    quantity integer DEFAULT 0 NOT NULL,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    status public."ProductStatus" DEFAULT 'DRAFT'::public."ProductStatus" NOT NULL,
    category_id text,
    featured boolean DEFAULT false NOT NULL,
    published_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    product_id text NOT NULL,
    user_id text NOT NULL,
    rating integer NOT NULL,
    title text,
    content text,
    is_verified boolean DEFAULT false NOT NULL,
    is_approved boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    session_token text NOT NULL,
    user_id text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    name text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    phone text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    user_id text NOT NULL,
    product_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "userId", "updatedAt", "createdAt") FROM stdin;
cmmw131310001wd6obzhrwu9i	cmmp0b88u0000wdf8jv8hcrd5	2026-03-18 12:39:19.673	2026-03-18 12:39:19.673
cmmwuxupb0005wdwoxwzaw22g	cmmtfeqln0008wdz8sf0icl4y	2026-03-19 02:35:07.056	2026-03-19 02:35:07.056
cmmxsys2u0003wdgkk10l6y52	cmmxswj980000wdgkjc88u7nz	2026-03-19 18:27:37.172	2026-03-19 18:27:37.172
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "productId", quantity, "createdAt", "updatedAt", "productVariantId") FROM stdin;
cmmx696v500b4wdwo8c8nbfwl	cmmwuxupb0005wdwoxwzaw22g	cmmt5h7iy002cwdioiyr7wphy	1	2026-03-19 07:51:51.81	2026-03-19 07:51:51.81	\N
cmmx696va00b6wdwoqkc3vph3	cmmwuxupb0005wdwoxwzaw22g	cmmtf8n380005wdz81vcwz6ps	1	2026-03-19 07:51:51.814	2026-03-19 07:51:51.814	\N
cmmx696ve00b8wdwo8c6zs7gn	cmmwuxupb0005wdwoxwzaw22g	cmmt5h7me003rwdioq5al0k6o	1	2026-03-19 07:51:51.818	2026-03-19 07:51:51.818	\N
cmmx696vi00bawdwo0ftj6rx3	cmmwuxupb0005wdwoxwzaw22g	cmmp0b9lj004zwdf8ef4izqkc	1	2026-03-19 07:51:51.822	2026-03-19 07:51:51.822	\N
cmmx696vl00bcwdwo8woe31he	cmmwuxupb0005wdwoxwzaw22g	cmmp0b9li004xwdf842l2j08o	1	2026-03-19 07:51:51.826	2026-03-19 07:51:51.826	\N
\.


--
-- Data for Name: PromoCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PromoCode" (id, code, description, "discountType", "discountValue", "minPurchase", "maxDiscount", "usageLimit", "usageCount", "isActive", "validUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
cf46b146-b836-4c32-8d22-f0d10ec82229	da995d27f61678b5747e4fc35a264d06c6ad60088c08336e6b375b608429f4d6	2026-03-13 11:10:13.25486+01	20260313101012_init	\N	\N	2026-03-13 11:10:12.484096+01	1
2317ffd2-68c8-4d83-a476-916ffc67b0a5	97da5a9d1aa62c3d754b178c76218aba25799966d4defbec7b9d2dea779aff91	2026-03-17 19:11:44.569717+01	20260317181141_add_cart_models	\N	\N	2026-03-17 19:11:41.991305+01	1
e7dad2cb-b0db-4e7b-9efd-522492522f46	168c9a83cc54723a5db3dd72347524045dfabb5acba8cd2f6a78e2d2f448628d	2026-03-19 10:29:07.777788+01	20260319092906_add_auth_tokens	\N	\N	2026-03-19 10:29:06.319901+01	1
8db2ee13-98d3-4161-b3a5-b17bfca1662f	e03bb6994f6d258b31de33518595ff6d69fdb9834a9a0345d45f54d54dbfb52c	2026-04-01 12:33:33.414401+01	20260401113331_add_settings	\N	\N	2026-04-01 12:33:31.570487+01	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, user_id, type, first_name, last_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default, created_at, updated_at) FROM stdin;
cmmwv0cb7000lwdwohcsckcx6	cmmtfeqln0008wdz8sf0icl4y	shipping	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-03-19 02:37:03.188	2026-03-19 02:37:03.188
cmmwv0cbc000nwdwoh0xj2c18	cmmtfeqln0008wdz8sf0icl4y	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-03-19 02:37:03.192	2026-03-19 02:37:03.192
cmmwhpb250018wdsghqzyteuw	cmmp0b88u0000wdf8jv8hcrd5	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	t	2026-03-18 20:24:33.341	2026-03-19 03:09:15.033
cmmx6ayia00bewdwo6uof2ndt	cmmtfeqln0008wdz8sf0icl4y	shipping	Fav	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 07:53:14.17	2026-03-19 07:53:14.17
cmmx6aykt00bgwdwo6k1ty92z	cmmtfeqln0008wdz8sf0icl4y	billing	Fav	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 07:53:14.381	2026-03-19 07:53:14.381
cmmxtymds000nwdgk4pg3pttn	cmmxswj980000wdgkjc88u7nz	shipping	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 18:55:29.458	2026-03-19 18:55:29.458
cmmxtymdy000pwdgkl71qia2t	cmmxswj980000wdgkjc88u7nz	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 18:55:29.494	2026-03-19 18:55:29.494
cmmxubwhf0020wdgk7btfl8sm	cmmxswj980000wdgkjc88u7nz	shipping	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 19:05:49.107	2026-03-19 19:05:49.107
cmmxubwho0022wdgkgofzpcpx	cmmxswj980000wdgkjc88u7nz	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 19:05:49.116	2026-03-19 19:05:49.116
cmmxuh1yq0033wdgk7xmbegjz	cmmxswj980000wdgkjc88u7nz	shipping	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 19:09:49.49	2026-03-19 19:09:49.49
cmmxuh1z10035wdgkzaqjje01	cmmxswj980000wdgkjc88u7nz	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Abuja	112107	NG	07079806360	f	2026-03-19 19:09:49.502	2026-03-19 19:09:49.502
cmn09jx0m000xwdd8hm8ngqkt	cmmxswj980000wdgkjc88u7nz	shipping	Daniel	Oyibo	20B Gasline Street	\N	Ifo	Lagos	112107	NG	07079806360	f	2026-03-21 11:47:29.485	2026-03-21 11:47:29.485
cmn09jxcy000zwdd8winjw3ds	cmmxswj980000wdgkjc88u7nz	billing	Daniel	Oyibo	20B Gasline Street	\N	Ifo	Lagos	112107	NG	07079806360	f	2026-03-21 11:47:30.082	2026-03-21 11:47:30.082
cmnexw17q0009wd18swkww2dw	cmmxswj980000wdgkjc88u7nz	shipping	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-03-31 18:17:32.198	2026-03-31 18:17:32.198
cmnexw17z000bwd18m7oqp6af	cmmxswj980000wdgkjc88u7nz	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-03-31 18:17:32.207	2026-03-31 18:17:32.207
cmomqvb1v0003wdpko212kutw	cmmxswj980000wdgkjc88u7nz	shipping	Daniel	Oyibo	20B Gasline Street	\N	Ifo	Lagos	112107	NG	07079806360	f	2026-05-01 10:02:52.723	2026-05-01 10:02:52.723
cmomqvbtc0005wdpkrz3qzk1f	cmmxswj980000wdgkjc88u7nz	billing	Daniel	Oyibo	20B Gasline Street	\N	Ifo	Lagos	112107	NG	07079806360	f	2026-05-01 10:02:53.712	2026-05-01 10:02:53.712
cmoo2yojd0003wd18ffeujo2s	cmmxswj980000wdgkjc88u7nz	shipping	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-05-02 08:29:11.738	2026-05-02 08:29:11.738
cmoo2yoor0005wd18k4nd9yjn	cmmxswj980000wdgkjc88u7nz	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-05-02 08:29:11.931	2026-05-02 08:29:11.931
cmoo37oc6000nwd18a9u897c0	cmmxswj980000wdgkjc88u7nz	shipping	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-05-02 08:36:11.382	2026-05-02 08:36:11.382
cmoo37ocf000pwd189hq9hwi3	cmmxswj980000wdgkjc88u7nz	billing	Oyibo	Daniel	20B Gasline Matogbun	\N	Matogbun	Lagos	112107	NG	07079806360	f	2026-05-02 08:36:11.391	2026-05-02 08:36:11.391
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, image, parent_id, created_at, updated_at) FROM stdin;
cmmp0b8yc0001wdf8288wjxr9	Roofing Materials	roofing-materials	Roofing sheets, tiles, and accessories	\N	\N	2026-03-13 14:43:20.724	2026-03-13 14:43:20.724
cmmp0b90i0002wdf8bg3p39fx	Electrical Fittings	electrical-fittings	Wiring, switches, conduits, and lighting	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b90m0003wdf865npk9fd	Tiles & Flooring	tiles-and-flooring	Ceramic, porcelain, and vinyl flooring solutions	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b90r0004wdf80a88mjo2	Lighting Design	lighting-design	Decorative and functional lighting solutions	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b90w0005wdf8oavrq5zx	Kitchen Fittings	kitchen-fittings	Cabinets, countertops, and kitchen accessories	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b9110006wdf85r0ndhd5	Wall Decor	wall-decor	Wallpapers, paneling, and decorative elements	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b91x0007wdf8hox6rinv	Bathroom Fittings	bathroom-fittings	WC, sinks, showers, and bathroom accessories	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b92t0008wdf85dx3a6f3	Doors & Windows	doors-and-windows	Interior and exterior doors, windows, and frames	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b92y0009wdf8w5wmo7ko	Plumbing Fixtures	plumbing-fixtures	Pipes, fittings, sinks, and bathroom fixtures	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b932000bwdf81phvirzi	Plaster & Ceiling	plaster-and-ceiling	Plaster of Paris, ceiling boards, and accessories	\N	\N	2026-03-13 14:43:20.726	2026-03-13 14:43:20.726
cmmp0b92z000awdf8kfxlhnxl	Wood & Timber	wood-and-timber	Quality timber for framing and finishing	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b934000cwdf8y3jn5axd	Cement & Blocks	cement-and-block	High-quality cement, blocks, and binding materials	\N	\N	2026-03-13 14:43:20.724	2026-03-13 14:43:20.724
cmmp0b95i000dwdf8g5ijv8x6	Paints & Coatings	paints-and-coatings	Interior and exterior paints, primers, and sealers	\N	\N	2026-03-13 14:43:20.725	2026-03-13 14:43:20.725
cmmp0b967000ewdf8o8r0e8in	Reinforcement Steel	reinforcement-steel	Iron rods, mesh, and structural steel	\N	\N	2026-03-13 14:43:20.724	2026-03-13 14:43:20.724
cmmtgnusk000cwdz8i7m4ta51	Carpenter Tools	carpenter-tools	\N	\N	\N	2026-03-16 17:32:07.406	2026-03-16 17:32:07.406
\.


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discounts (id, code, type, value, min_purchase, max_discount, usage_limit, usage_count, per_user_limit, "applicableProducts", "applicableCategories", exclude_products, start_date, end_date, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_verification_tokens (id, email, token, expires_at, created_at) FROM stdin;
cmmz8u5iz0001wdlc4s9b7zde	oyibodaniel15@gmail.com	6b74d504152d7a26d9a6a43b1dc64861161b345da429e7052f2758b023870bfd	2026-03-21 18:39:41.431	2026-03-20 18:39:41.435
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, variant_id, name, sku, price, quantity, total, created_at) FROM stdin;
cmmwerhf0001pwdmoydcy02jp	cmmwerhen001nwdmogk886u3b	cmmt5h7me003rwdioq5al0k6o	\N	Nigerian Paint Interior Silk (20L)	PNT-INT-022	45000.00	2	90000.00	2026-03-18 19:02:16.031
cmmwerhf0001qwdmo8bcmeo0b	cmmwerhen001nwdmogk886u3b	cmmt5h7iy002cwdioiyr7wphy	\N	Casement Window - Louvre Type (4ft x 4ft)	WIN-CAS-034	45000.00	4	180000.00	2026-03-18 19:02:16.031
cmmwerhf1001rwdmohwojxp87	cmmwerhen001nwdmogk886u3b	cmmt5h7jr003fwdior2qsoblq	\N	Dulux Exterior Weathershield Paint (20L)	PNT-EXT-021	65000.00	2	130000.00	2026-03-18 19:02:16.031
cmmwhl3pj000xwdsgccfevqea	cmmwhl3p2000vwdsgmzqm6ynm	cmmtf8n380005wdz81vcwz6ps	\N	Shovel	S-041	20000.00	5	100000.00	2026-03-18 20:21:17.156
cmmwhl3pj000ywdsgm9vdtgly	cmmwhl3p2000vwdsgmzqm6ynm	cmmtgqkq0000ewdz8zzxlnwzc	\N	Hammer	H-198	5000.00	4	20000.00	2026-03-18 20:21:17.156
cmmwhpb2n001cwdsg5o7zledj	cmmwhpb2n001awdsg2zx3yvd7	cmmtf8n380005wdz81vcwz6ps	\N	Shovel	S-041	20000.00	4	80000.00	2026-03-18 20:24:33.359
cmmwhpb2n001dwdsgja4rqj5e	cmmwhpb2n001awdsg2zx3yvd7	cmmtgqkq0000ewdz8zzxlnwzc	\N	Hammer	H-198	5000.00	2	10000.00	2026-03-18 20:24:33.359
cmmwv0cfm000rwdwoh11uaopa	cmmwv0cf6000pwdwoogjbnxnq	cmmt5h84v005zwdionx20qs16	\N	2.5mm Electrical Wire (Roll - 200m)	ELC-WIR-039	45000.00	1	45000.00	2026-03-19 02:37:03.322
cmmwv0cfm000swdwoxzp77t7s	cmmwv0cf6000pwdwoogjbnxnq	cmmt5h7me003rwdioq5al0k6o	\N	Nigerian Paint Interior Silk (20L)	PNT-INT-022	45000.00	1	45000.00	2026-03-19 02:37:03.322
cmmwv0cfn000twdwod0z9gojt	cmmwv0cf6000pwdwoogjbnxnq	cmmt5h7jr003fwdior2qsoblq	\N	Dulux Exterior Weathershield Paint (20L)	PNT-EXT-021	65000.00	1	65000.00	2026-03-19 02:37:03.322
cmmx6az6r00bkwdworhu9tkmx	cmmx6az5600biwdwoim3su869	cmmt5h7iy002cwdioiyr7wphy	\N	Casement Window - Louvre Type (4ft x 4ft)	WIN-CAS-034	45000.00	1	45000.00	2026-03-19 07:53:15.09
cmmx6az6r00blwdwoc2z09kfo	cmmx6az5600biwdwoim3su869	cmmtf8n380005wdz81vcwz6ps	\N	Shovel	S-041	20000.00	1	20000.00	2026-03-19 07:53:15.09
cmmx6az6r00bmwdwoenaf3y8s	cmmx6az5600biwdwoim3su869	cmmt5h7me003rwdioq5al0k6o	\N	Nigerian Paint Interior Silk (20L)	PNT-INT-022	45000.00	1	45000.00	2026-03-19 07:53:15.09
cmmx6az6r00bnwdwo4hi6ylnd	cmmx6az5600biwdwoim3su869	cmmp0b9lj004zwdf8ef4izqkc	\N	Decorative Wall Mirror (60cm x 80cm)	DEC-MIR-049	25000.00	1	25000.00	2026-03-19 07:53:15.09
cmmx6az6r00bowdwoe91a4zy1	cmmx6az5600biwdwoim3su869	cmmp0b9li004xwdf842l2j08o	\N	3D Wall Panel - White (Pack of 10)	DEC-WAL-047	32000.00	1	32000.00	2026-03-19 07:53:15.09
cmmxtymoy000twdgkcxfsiayb	cmmxtymnu000rwdgkveof423s	cmmtgqkq0000ewdz8zzxlnwzc	\N	Hammer	H-198	5000.00	1	5000.00	2026-03-19 18:55:29.848
cmmxtymoy000uwdgknjusk5h0	cmmxtymnu000rwdgkveof423s	cmmtf8n380005wdz81vcwz6ps	\N	Shovel	S-041	20000.00	1	20000.00	2026-03-19 18:55:29.848
cmmxtymoy000vwdgkn1cavlw1	cmmxtymnu000rwdgkveof423s	cmmt5h7ji0035wdioy3dhiklb	\N	Solid Wood Door Frame (Set)	TIM-DOOR-020	28500.00	1	28500.00	2026-03-19 18:55:29.848
cmmxtymoy000wwdgkuznz3di4	cmmxtymnu000rwdgkveof423s	cmmt5h7iy002cwdioiyr7wphy	\N	Casement Window - Louvre Type (4ft x 4ft)	WIN-CAS-034	45000.00	1	45000.00	2026-03-19 18:55:29.848
cmmxubwi60026wdgkm6vu9xg8	cmmxubwi60024wdgk20h3weck	cmmt5h84v005zwdionx20qs16	\N	2.5mm Electrical Wire (Roll - 200m)	ELC-WIR-039	45000.00	20	900000.00	2026-03-19 19:05:49.134
cmmxubwi60027wdgkvjtunqgo	cmmxubwi60024wdgk20h3weck	cmmt5h7me003rwdioq5al0k6o	\N	Nigerian Paint Interior Silk (20L)	PNT-INT-022	45000.00	20	900000.00	2026-03-19 19:05:49.134
cmmxuh1zg0039wdgkguwel9ug	cmmxuh1zg0037wdgkzgr776tx	cmmt5h7me003rwdioq5al0k6o	\N	Nigerian Paint Interior Silk (20L)	PNT-INT-022	45000.00	40	1800000.00	2026-03-19 19:09:49.516
cmn09jxns0013wdd84ccpykml	cmn09jxnd0011wdd8yeg8ou7s	cmmt5h8330047wdio2onxcurz	\N	Wallpaper Roll - Geometric Pattern (10m)	DEC-WPR-048	18500.00	1	18500.00	2026-03-21 11:47:30.31
cmn09jxns0014wdd8yvfs3t60	cmn09jxnd0011wdd8yeg8ou7s	cmmtf8n380005wdz81vcwz6ps	\N	Shovel	S-041	20000.00	1	20000.00	2026-03-21 11:47:30.31
cmn09jxns0015wdd8aqqdfnfc	cmn09jxnd0011wdd8yeg8ou7s	cmmt5h84v005zwdionx20qs16	\N	2.5mm Electrical Wire (Roll - 200m)	ELC-WIR-039	45000.00	1	45000.00	2026-03-21 11:47:30.31
cmn09jxns0016wdd8sf4jd8ot	cmn09jxnd0011wdd8yeg8ou7s	cmmp0b9lq005bwdf8al89pdk1	\N	Decorative Cornice/PVC (2.4m Length)	DEC-CRN-050	4500.00	1	4500.00	2026-03-21 11:47:30.31
cmnexw1es000fwd18k50o6m6s	cmnexw1en000dwd18r4m7ltd1	cmmtf8n380005wdz81vcwz6ps	\N	Shovel	S-041	20000.00	1	20000.00	2026-03-31 18:17:32.438
cmnexw1es000gwd18zvgf0ltr	cmnexw1en000dwd18r4m7ltd1	cmmt5h84v005zwdionx20qs16	\N	2.5mm Electrical Wire (Roll - 200m)	ELC-WIR-039	45000.00	1	45000.00	2026-03-31 18:17:32.438
cmomqvc5t0009wdpk8kxmj5f0	cmomqvc4z0007wdpkgffq9u1h	cmmp0b9lh004pwdf809ohyic9	\N	Outdoor Wall Light - Black	LIT-WAL-046	18500.00	3	55500.00	2026-05-01 10:02:54.101
cmoo2ypch0009wd1804sf6rh5	cmoo2ypax0007wd18h366n5ri	cmmt5h7jr003fwdior2qsoblq	\N	Dulux Exterior Weathershield Paint (20L)	PNT-EXT-021	65000.00	1	65000.00	2026-05-02 08:29:12.703
cmoo37odf000twd18wtg5vnwb	cmoo37odf000rwd18vqlw50un	cmmp0b9l3003zwdf8rmdjyp74	\N	8-Way Consumer Unit (Distribution Board)	ELC-DB-042	18500.00	1	18500.00	2026-05-02 08:36:11.427
cmoo37odf000uwd1836q8uldj	cmoo37odf000rwd18vqlw50un	cmmp0b9k7002bwdf88aeeahsb	\N	Marble Effect Floor Tiles (60x60cm)	TIL-MAR-028	18500.00	1	18500.00	2026-05-02 08:36:11.427
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status_history (id, order_id, status, note, changed_by, created_at) FROM stdin;
cmmwfjb170029wdmooa0qyyfv	cmmwerhen001nwdmogk886u3b	PROCESSING	Payment confirmed via Paystack. Reference: PS-1773861457162-0n8lq9	\N	2026-03-18 19:23:53.987
cmmwhs0gn001lwdsg94pkjvk7	cmmwhpb2n001awdsg2zx3yvd7	PROCESSING	Payment confirmed via Paystack. Reference: PS-1773865476431-ylt638	\N	2026-03-18 20:26:39.573
cmmwv24kl0013wdwoorp68icr	cmmwv0cf6000pwdwoogjbnxnq	PROCESSING	Payment confirmed via Paystack. Reference: PS-1773887880321-tfiagr	\N	2026-03-19 02:38:26.467
cmmwx6zc70026wdwouqkgflxs	cmmwhpb2n001awdsg2zx3yvd7	SHIPPED	Status updated to SHIPPED	\N	2026-03-19 03:38:12.161
cmmxtzrj00010wdgkb6r6swn2	cmmxtymnu000rwdgkveof423s	PROCESSING	Payment confirmed via Paystack. Reference: PS-1773946543296-lsqf8o	\N	2026-03-19 18:56:22.811
cmmxue2qd002bwdgktrop6ra0	cmmxubwi60024wdgk20h3weck	PROCESSING	Payment confirmed via Paystack. Reference: PS-1773947156054-vueb8m	\N	2026-03-19 19:07:30.515
cmmxui6e2003dwdgkoeivffeu	cmmxuh1zg0037wdgkzgr776tx	PROCESSING	Payment confirmed via Paystack. Reference: PS-1773947393022-onppsp	\N	2026-03-19 19:10:41.88
cmn0a434b001awdd8sa39rdiv	cmn09jxnd0011wdd8yeg8ou7s	PROCESSING	Payment confirmed via Paystack. Reference: PS-1774094441671-t8bj8p	\N	2026-03-21 12:03:10.649
cmnexyh9d000kwd18dy7oacjy	cmnexw1en000dwd18r4m7ltd1	PROCESSING	Payment confirmed via Paystack. Reference: PS-1774981084231-4un7zd	\N	2026-03-31 18:19:26.264
cmney1tdq000lwd181b3me5k6	cmnexw1en000dwd18r4m7ltd1	SHIPPED	Status updated to SHIPPED	\N	2026-03-31 18:22:01.959
cmney230h000mwd18qt57of4l	cmnexw1en000dwd18r4m7ltd1	DELIVERED	Status updated to DELIVERED	\N	2026-03-31 18:22:14.465
cmngbc9pb0002wdywdfccu981	cmnexw1en000dwd18r4m7ltd1	DELIVERED	Status updated to DELIVERED	\N	2026-04-01 17:21:50.86
cmoo2zugs000dwd18dmrjseg5	cmoo2ypax0007wd18h366n5ri	PROCESSING	Payment confirmed via Paystack. Reference: PS-1777710562289-7emcir	\N	2026-05-02 08:30:06.073
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", user_id, guest_email, status, payment_status, subtotal, discount_total, shipping_total, tax_total, total, currency, shipping_address_id, billing_address_id, discount_id, notes, "adminNotes", payment_reference, payment_provider, paid_at, shipped_at, delivered_at, cancelled_at, cancel_reason, created_at, updated_at) FROM stdin;
cmmwv0cf6000pwdwoogjbnxnq	ORD-MMWV0CAS-40U5Z	cmmtfeqln0008wdz8sf0icl4y	\N	PROCESSING	COMPLETED	155000.00	0.00	0.00	11625.00	166625.00	NGN	cmmwv0cb7000lwdwohcsckcx6	cmmwv0cbc000nwdwoh0xj2c18	\N	\N	\N	PS-1773887880321-tfiagr	PAYSTACK	2026-03-19 02:38:26.386	\N	\N	\N	\N	2026-03-19 02:37:03.322	2026-03-19 02:38:26.467
cmmwhl3p2000vwdsgmzqm6ynm	ORD-MMWHL3C9-DHNWJ	cmmp0b88u0000wdf8jv8hcrd5	\N	PENDING	PENDING	120000.00	0.00	0.00	9000.00	129000.00	NGN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-18 20:21:17.156	2026-03-18 20:21:17.156
cmmwerhen001nwdmogk886u3b	ORD-MMWERH18-72VHH	cmmp0b88u0000wdf8jv8hcrd5	\N	PROCESSING	COMPLETED	400000.00	0.00	0.00	30000.00	430000.00	NGN	\N	\N	\N	\N	\N	PS-1773861457162-0n8lq9	PAYSTACK	2026-03-18 19:23:53.594	\N	\N	\N	\N	2026-03-18 19:02:16.031	2026-03-18 19:23:53.987
cmmwhpb2n001awdsg2zx3yvd7	ORD-MMWHPB1J-PFV2V	cmmp0b88u0000wdf8jv8hcrd5	\N	SHIPPED	COMPLETED	90000.00	0.00	5000.00	6750.00	101750.00	NGN	\N	cmmwhpb250018wdsghqzyteuw	\N	\N	\N	PS-1773865476431-ylt638	PAYSTACK	2026-03-18 20:26:39.492	\N	\N	\N	\N	2026-03-18 20:24:33.359	2026-03-19 03:38:12.161
cmmx6az5600biwdwoim3su869	ORD-MMX6AYE2-5I4Q7	cmmtfeqln0008wdz8sf0icl4y	\N	PENDING	PENDING	167000.00	0.00	0.00	12525.00	179525.00	NGN	cmmx6ayia00bewdwo6uof2ndt	cmmx6aykt00bgwdwo6k1ty92z	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-19 07:53:15.09	2026-03-19 07:53:15.09
cmmxtymnu000rwdgkveof423s	ORD-MMXTYMCB-FBVE8	cmmxswj980000wdgkjc88u7nz	\N	PROCESSING	COMPLETED	98500.00	0.00	5000.00	7387.50	110887.50	NGN	cmmxtymds000nwdgk4pg3pttn	cmmxtymdy000pwdgkl71qia2t	\N	\N	\N	PS-1773946543296-lsqf8o	PAYSTACK	2026-03-19 18:56:22.802	\N	\N	\N	\N	2026-03-19 18:55:29.848	2026-03-19 18:56:22.811
cmmxubwi60024wdgk20h3weck	ORD-MMXUBWH2-P8T5U	cmmxswj980000wdgkjc88u7nz	\N	PROCESSING	COMPLETED	1800000.00	0.00	0.00	135000.00	1935000.00	NGN	cmmxubwhf0020wdgk7btfl8sm	cmmxubwho0022wdgkgofzpcpx	\N	\N	\N	PS-1773947156054-vueb8m	PAYSTACK	2026-03-19 19:07:30.506	\N	\N	\N	\N	2026-03-19 19:05:49.134	2026-03-19 19:07:30.515
cmmxuh1zg0037wdgkzgr776tx	ORD-MMXUH1YG-47HHS	cmmxswj980000wdgkjc88u7nz	\N	PROCESSING	COMPLETED	1800000.00	0.00	0.00	135000.00	1935000.00	NGN	cmmxuh1yq0033wdgk7xmbegjz	cmmxuh1z10035wdgkzaqjje01	\N	\N	\N	PS-1773947393022-onppsp	PAYSTACK	2026-03-19 19:10:41.873	\N	\N	\N	\N	2026-03-19 19:09:49.516	2026-03-19 19:10:41.88
cmn09jxnd0011wdd8yeg8ou7s	ORD-MN09JWIZ-BM1OL	cmmxswj980000wdgkjc88u7nz	\N	PROCESSING	COMPLETED	88000.00	0.00	5000.00	6600.00	99600.00	NGN	cmn09jx0m000xwdd8hm8ngqkt	cmn09jxcy000zwdd8winjw3ds	\N	\N	\N	PS-1774094441671-t8bj8p	PAYSTACK	2026-03-21 12:03:10.487	\N	\N	\N	\N	2026-03-21 11:47:30.31	2026-03-21 12:03:10.649
cmnexw1en000dwd18r4m7ltd1	ORD-MNEXW17B-UURD1	cmmxswj980000wdgkjc88u7nz	\N	DELIVERED	COMPLETED	65000.00	0.00	5000.00	4875.00	74875.00	NGN	cmnexw17q0009wd18swkww2dw	cmnexw17z000bwd18m7oqp6af	\N	\N	\N	PS-1774981084231-4un7zd	PAYSTACK	2026-03-31 18:19:25.927	\N	\N	\N	\N	2026-03-31 18:17:32.438	2026-04-01 17:21:50.86
cmomqvc4z0007wdpkgffq9u1h	ORD-MOMQVB1D-MLVR0	cmmxswj980000wdgkjc88u7nz	\N	PENDING	PENDING	55500.00	0.00	5000.00	4162.50	64662.50	NGN	cmomqvb1v0003wdpko212kutw	cmomqvbtc0005wdpkrz3qzk1f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-01 10:02:54.101	2026-05-01 10:02:54.101
cmoo2ypax0007wd18h366n5ri	ORD-MOO2YOHW-JRBIT	cmmxswj980000wdgkjc88u7nz	\N	PROCESSING	COMPLETED	65000.00	0.00	5000.00	4875.00	74875.00	NGN	cmoo2yojd0003wd18ffeujo2s	cmoo2yoor0005wd18k4nd9yjn	\N	\N	\N	PS-1777710562289-7emcir	PAYSTACK	2026-05-02 08:30:05.906	\N	\N	\N	\N	2026-05-02 08:29:12.703	2026-05-02 08:30:06.073
cmoo37odf000rwd18vqlw50un	ORD-MOO37OBU-84SQ8	cmmxswj980000wdgkjc88u7nz	\N	PENDING	PENDING	37000.00	0.00	5000.00	2775.00	44775.00	NGN	cmoo37oc6000nwd18a9u897c0	cmoo37ocf000pwd189hq9hwi3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-02 08:36:11.427	2026-05-02 08:36:11.427
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, email, token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, provider, amount, currency, status, reference, transaction_id, metadata, error_message, paid_at, created_at, updated_at) FROM stdin;
cmmwfbbft001vwdmobrjt6rqz	cmmwerhen001nwdmogk886u3b	PAYSTACK	430000.00	NGN	COMPLETED	PS-1773861457162-0n8lq9	5948424235	{"id": 5948424235, "log": {"input": [], "errors": 0, "mobile": true, "history": [{"time": 25, "type": "action", "message": "Set payment method to: card"}, {"time": 45, "type": "action", "message": "Set payment method to: bank_transfer"}, {"time": 60, "type": "action", "message": "Set payment method to: bank"}, {"time": 63, "type": "action", "message": "Set payment method to: ussd"}, {"time": 67, "type": "action", "message": "Set payment method to: card"}, {"time": 73, "type": "action", "message": "Attempted to pay with card"}, {"time": 77, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1773861481, "time_spent": 77}, "fees": 200000, "plan": null, "split": {}, "amount": 43000000, "domain": "test", "paidAt": "2026-03-18T19:19:19.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-03-18T19:19:19.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmmwerhen001nwdmogk886u3b", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MMWERH18-72VHH"}, "order_id": null, "createdAt": "2026-03-18T19:17:43.000Z", "reference": "PS-1773861457162-0n8lq9", "created_at": "2026-03-18T19:17:43.000Z", "fees_split": null, "ip_address": "105.113.109.231", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_BSK82ZwV9DNcUE7jfi98", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_cmfecjho8k", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 43000000, "transaction_date": "2026-03-18T19:17:43.000Z", "pos_transaction_data": null}	\N	2026-03-18 19:23:53.594	2026-03-18 19:17:41.417	2026-03-18 19:23:53.987
cmmwhlmlo0010wdsgx3845qyy	cmmwhl3p2000vwdsgmzqm6ynm	PAYSTACK	129000.00	NGN	PENDING	PS-1773865299258-gvsr4t	\N	\N	\N	\N	2026-03-18 20:21:41.677	2026-03-18 20:21:41.677
cmmwhqdgl001fwdsgjdeapdqk	cmmwhpb2n001awdsg2zx3yvd7	PAYSTACK	101750.00	NGN	COMPLETED	PS-1773865476431-ylt638	5948611902	{"id": 5948611902, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 36, "type": "action", "message": "Attempted to pay with card"}, {"time": 37, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1773865538, "time_spent": 37}, "fees": 162625, "plan": null, "split": {}, "amount": 10175000, "domain": "test", "paidAt": "2026-03-18T20:26:17.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-03-18T20:26:17.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmmwhpb2n001awdsg2zx3yvd7", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MMWHPB1J-PFV2V"}, "order_id": null, "createdAt": "2026-03-18T20:24:44.000Z", "reference": "PS-1773865476431-ylt638", "created_at": "2026-03-18T20:24:44.000Z", "fees_split": null, "ip_address": "105.113.109.231", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_BSK82ZwV9DNcUE7jfi98", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_ag8utn5o96", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 10175000, "transaction_date": "2026-03-18T20:24:44.000Z", "pos_transaction_data": null}	\N	2026-03-18 20:26:39.492	2026-03-18 20:25:23.108	2026-03-18 20:26:39.573
cmmwv1ldf000vwdwoeelcbf26	cmmwv0cf6000pwdwoogjbnxnq	PAYSTACK	166625.00	NGN	COMPLETED	PS-1773887880321-tfiagr	5949072908	{"id": 5949072908, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with card"}, {"time": 5, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1773887888, "time_spent": 5}, "fees": 200000, "plan": null, "split": {}, "amount": 16662500, "domain": "test", "paidAt": "2026-03-19T02:38:15.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-03-19T02:38:15.000Z", "currency": "NGN", "customer": {"id": 348336499, "email": "oyibodaniel15@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_ys6ffv5s1q498c9", "international_format_phone": null}, "metadata": {"orderId": "cmmwv0cf6000pwdwoogjbnxnq", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MMWV0CAS-40U5Z"}, "order_id": null, "createdAt": "2026-03-19T02:38:03.000Z", "reference": "PS-1773887880321-tfiagr", "created_at": "2026-03-19T02:38:03.000Z", "fees_split": null, "ip_address": "105.113.109.231", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_BSK82ZwV9DNcUE7jfi98", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_ukymjft05o", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 16662500, "transaction_date": "2026-03-19T02:38:03.000Z", "pos_transaction_data": null}	\N	2026-03-19 02:38:26.386	2026-03-19 02:38:01.587	2026-03-19 02:38:26.467
cmmx6b6xj00bqwdwoxpfximey	cmmx6az5600biwdwoim3su869	PAYSTACK	179525.00	NGN	PENDING	PS-1773906803352-tk4k4	\N	\N	\N	\N	2026-03-19 07:53:25.207	2026-03-19 07:53:25.207
cmmxtyyhi000ywdgkkvythvs4	cmmxtymnu000rwdgkveof423s	PAYSTACK	110887.50	NGN	COMPLETED	PS-1773946543296-lsqf8o	5951562821	{"id": 5951562821, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 12, "type": "action", "message": "Attempted to pay with card"}, {"time": 14, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1773946555, "time_spent": 14}, "fees": 176332, "plan": null, "split": {}, "amount": 11088750, "domain": "test", "paidAt": "2026-03-19T18:56:08.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-03-19T18:56:08.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmmxtymnu000rwdgkveof423s", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MMXTYMCB-FBVE8"}, "order_id": null, "createdAt": "2026-03-19T18:55:45.000Z", "reference": "PS-1773946543296-lsqf8o", "created_at": "2026-03-19T18:55:45.000Z", "fees_split": null, "ip_address": "105.113.109.231", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_BSK82ZwV9DNcUE7jfi98", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_u4r05nc3tx", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 11088750, "transaction_date": "2026-03-19T18:55:45.000Z", "pos_transaction_data": null}	\N	2026-03-19 18:56:22.802	2026-03-19 18:55:45.174	2026-03-19 18:56:22.811
cmmxuc9xt0029wdgk2zrak1ud	cmmxubwi60024wdgk20h3weck	PAYSTACK	1935000.00	NGN	COMPLETED	PS-1773947156054-vueb8m	5951591830	{"id": 5951591830, "log": {"input": [], "errors": 2, "mobile": false, "history": [{"time": 10, "type": "action", "message": "Attempted to pay with card"}, {"time": 12, "type": "error", "message": "Error: Insufficient Funds"}, {"time": 23, "type": "action", "message": "Attempted to pay with card"}, {"time": 23, "type": "error", "message": "Error: Insufficient Funds"}, {"time": 26, "type": "action", "message": "Set payment method to: bank_transfer"}, {"time": 35, "type": "success", "message": "Successfully paid with bank_transfer"}, {"time": 68, "type": "action", "message": "Set payment method to: card"}, {"time": 70, "type": "action", "message": "Attempted to pay with card"}, {"time": 71, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 3, "start_time": 1773947173, "time_spent": 71}, "fees": 200000, "plan": null, "split": {}, "amount": 193500000, "domain": "test", "paidAt": "2026-03-19T19:06:47.000Z", "source": null, "status": "success", "channel": "bank_transfer", "connect": null, "message": null, "paid_at": "2026-03-19T19:06:47.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmmxubwi60024wdgk20h3weck", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MMXUBWH2-P8T5U"}, "order_id": null, "createdAt": "2026-03-19T19:06:06.000Z", "reference": "PS-1773947156054-vueb8m", "created_at": "2026-03-19T19:06:06.000Z", "fees_split": null, "ip_address": "105.113.109.231", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "123XXX", "bank": null, "brand": "Managed Account", "last4": "X890", "channel": "bank_transfer", "exp_year": "2026", "reusable": false, "card_type": "transfer", "exp_month": "03", "narration": "Test transaction", "signature": null, "sender_bank": null, "sender_name": "TEST PAYER", "account_name": null, "country_code": "NG", "receiver_bank": null, "sender_country": "NG", "authorization_code": "AUTH_uaefzus8ua", "sender_bank_account_number": "XXXXXXX890", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Approved", "requested_amount": 193500000, "transaction_date": "2026-03-19T19:06:06.000Z", "pos_transaction_data": null}	\N	2026-03-19 19:07:30.506	2026-03-19 19:06:06.545	2026-03-19 19:07:30.515
cmmxuh862003bwdgk0bsxnqr0	cmmxuh1zg0037wdgkzgr776tx	PAYSTACK	1935000.00	NGN	COMPLETED	PS-1773947393022-onppsp	5951602753	{"id": 5951602753, "log": {"input": [], "errors": 3, "mobile": false, "history": [{"time": 3, "type": "action", "message": "Attempted to pay with card"}, {"time": 5, "type": "error", "message": "Error: Insufficient Funds"}, {"time": 9, "type": "action", "message": "Attempted to pay with card"}, {"time": 10, "type": "error", "message": "Error: Insufficient Funds"}, {"time": 16, "type": "action", "message": "Attempted to pay with card"}, {"time": 17, "type": "error", "message": "Error: Insufficient Funds"}, {"time": 20, "type": "action", "message": "Set payment method to: bank_transfer"}, {"time": 27, "type": "success", "message": "Successfully paid with bank_transfer"}, {"time": 30, "type": "action", "message": "Set payment method to: card"}, {"time": 32, "type": "action", "message": "Attempted to pay with card"}, {"time": 33, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 4, "start_time": 1773947401, "time_spent": 33}, "fees": 200000, "plan": null, "split": {}, "amount": 193500000, "domain": "test", "paidAt": "2026-03-19T19:10:28.000Z", "source": null, "status": "success", "channel": "bank_transfer", "connect": null, "message": null, "paid_at": "2026-03-19T19:10:28.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmmxuh1zg0037wdgkzgr776tx", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MMXUH1YG-47HHS"}, "order_id": null, "createdAt": "2026-03-19T19:09:57.000Z", "reference": "PS-1773947393022-onppsp", "created_at": "2026-03-19T19:09:57.000Z", "fees_split": null, "ip_address": "105.113.109.231", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "123XXX", "bank": null, "brand": "Managed Account", "last4": "X890", "channel": "bank_transfer", "exp_year": "2026", "reusable": false, "card_type": "transfer", "exp_month": "03", "narration": "Test transaction", "signature": null, "sender_bank": null, "sender_name": "TEST PAYER", "account_name": null, "country_code": "NG", "receiver_bank": null, "sender_country": "NG", "authorization_code": "AUTH_63tyzwd71x", "sender_bank_account_number": "XXXXXXX890", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Approved", "requested_amount": 193500000, "transaction_date": "2026-03-19T19:09:57.000Z", "pos_transaction_data": null}	\N	2026-03-19 19:10:41.873	2026-03-19 19:09:57.531	2026-03-19 19:10:41.88
cmn0a0yyv0018wdd84a087qv8	cmn09jxnd0011wdd8yeg8ou7s	PAYSTACK	99600.00	NGN	COMPLETED	PS-1774094441671-t8bj8p	5956787445	{"id": 5956787445, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with card"}, {"time": 5, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1774094476, "time_spent": 5}, "fees": 159400, "plan": null, "split": {}, "amount": 9960000, "domain": "test", "paidAt": "2026-03-21T12:01:22.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-03-21T12:01:22.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmn09jxnd0011wdd8yeg8ou7s", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MN09JWIZ-BM1OL"}, "order_id": null, "createdAt": "2026-03-21T12:00:45.000Z", "reference": "PS-1774094441671-t8bj8p", "created_at": "2026-03-21T12:00:45.000Z", "fees_split": null, "ip_address": "102.88.109.215", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_BSK82ZwV9DNcUE7jfi98", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_kjegpd2zyi", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 9960000, "transaction_date": "2026-03-21T12:00:45.000Z", "pos_transaction_data": null}	\N	2026-03-21 12:03:10.487	2026-03-21 12:00:44.833	2026-03-21 12:03:10.649
cmnexwr77000iwd18b03pfrvx	cmnexw1en000dwd18r4m7ltd1	PAYSTACK	74875.00	NGN	COMPLETED	PS-1774981084231-4un7zd	5990119736	{"id": 5990119736, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 27, "type": "action", "message": "Attempted to pay with card"}, {"time": 29, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1774981114, "time_spent": 29}, "fees": 122313, "plan": null, "split": {}, "amount": 7487500, "domain": "test", "paidAt": "2026-03-31T18:19:04.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-03-31T18:19:04.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmnexw1en000dwd18r4m7ltd1", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MNEXW17B-UURD1"}, "order_id": null, "createdAt": "2026-03-31T18:18:08.000Z", "reference": "PS-1774981084231-4un7zd", "created_at": "2026-03-31T18:18:08.000Z", "fees_split": null, "ip_address": "102.88.108.46", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_BSK82ZwV9DNcUE7jfi98", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_v3nfah585c", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 7487500, "transaction_date": "2026-03-31T18:18:08.000Z", "pos_transaction_data": null}	\N	2026-03-31 18:19:25.927	2026-03-31 18:18:05.876	2026-03-31 18:19:26.264
cmoo2yyk7000bwd18535kqk04	cmoo2ypax0007wd18h366n5ri	PAYSTACK	74875.00	NGN	COMPLETED	PS-1777710562289-7emcir	6102055416	{"id": 6102055416, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with card"}, {"time": 6, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1777710575, "time_spent": 6}, "fees": 122313, "plan": null, "split": {}, "amount": 7487500, "domain": "test", "paidAt": "2026-05-02T08:29:38.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-05-02T08:29:38.000Z", "currency": "NGN", "customer": {"id": 348270496, "email": "oyibodaniel247@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_1jequmqkhrlu54b", "international_format_phone": null}, "metadata": {"orderId": "cmoo2ypax0007wd18h366n5ri", "referrer": "http://localhost:3000/", "orderNumber": "ORD-MOO2YOHW-JRBIT"}, "order_id": null, "createdAt": "2026-05-02T08:29:22.000Z", "reference": "PS-1777710562289-7emcir", "created_at": "2026-05-02T08:29:22.000Z", "fees_split": null, "ip_address": "102.88.111.75", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_BSK82ZwV9DNcUE7jfi98", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_pdknc7qcm3", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 7487500, "transaction_date": "2026-05-02T08:29:22.000Z", "pos_transaction_data": null}	\N	2026-05-02 08:30:05.906	2026-05-02 08:29:24.727	2026-05-02 08:30:06.073
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, url, alt, "position", is_main, created_at) FROM stdin;
cmmp0b99i000wwdf8b5naftlh	cmmp0b99i000vwdf80izol1lq	/images/products/reinforcing-mesh.jpg	\N	0	t	2026-03-13 14:43:21.116
cmmp0b9j1001gwdf8vc3scpzj	cmmp0b9j0001cwdf83q9blgg6	/images/products/bua-cement-1.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9ji001pwdf83mvkydsv	cmmp0b9ji001mwdf8qljaiy1l	/images/products/wood-stain.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9k8002cwdf8gt31mqfm	cmmp0b9k7002bwdf88aeeahsb	/images/products/marble-tiles.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9kh002rwdf83yxctx6n	cmmp0b9kh002nwdf8d277pd90	/images/products/toilet-suite.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9kr003cwdf89dflv184	cmmp0b9kr003bwdf82mpm8pw1	/images/products/kitchen-sink.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9l0003rwdf8gkity7bz	cmmp0b9kz003pwdf8d7ufea5t	/images/products/hollow-block-1.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9l70044wdf8ml52ds2t	cmmp0b9l70043wdf83bz0tcy8	/images/products/iroko-plank.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9li004qwdf8cbd88ngw	cmmp0b9lh004pwdf809ohyic9	/images/products/outdoor-light.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b999000jwdf89u0tazk5	cmmp0b999000hwdf89wg4kpvs	/images/products/iron-rod-12mm.jpg	\N	0	t	2026-03-13 14:43:21.116
cmmp0b9j0001ewdf8bny3gkfq	cmmp0b9j00019wdf8z1su7954	/images/products/polycarbonate-roofing.jpg	\N	0	t	2026-03-13 14:43:21.143
cmmp0b9jj001uwdf86k98vmn2	cmmp0b9ji001swdf8bmk4k9pm	/images/products/iron-rod-20mm.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9k70028wdf8srfpe4u1	cmmp0b9k70026wdf8tiduf6be	/images/products/porcelain-tiles.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9kh002qwdf8j375fjwk	cmmp0b9kh002owdf8gv94sw5w	/images/products/tile-adhesive.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9kr003awdf8oyoq9bx7	cmmp0b9kr0037wdf8e61kkblj	/images/products/lafarge-cement-1.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9l1003wwdf8xj6v1mdu	cmmp0b9l1003vwdf8flzxe33u	/images/products/stone-coated-tiles.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9lb004hwdf8s0x9wchf	cmmp0b9lb004fwdf8uew6ghna	/images/products/led-strip.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9li004ywdf8heikwbpc	cmmp0b9li004xwdf842l2j08o	/images/products/3d-wall-panel.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9a00010wdf8nivvd6wa	cmmp0b9a0000zwdf83m5cjhy6	/images/products/longspan-roofing.jpg	\N	0	t	2026-03-13 14:43:21.143
cmmp0b9j0001dwdf8tu5p8a9g	cmmp0b9j0001bwdf84rjawvci	/images/products/metal-primer.jpg	\N	0	t	2026-03-13 14:43:21.143
cmmp0b9jj001wwdf8hr329z1u	cmmp0b9jj001vwdf8myomaq35	/images/products/textured-paint.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9k70027wdf8ny8vrb0l	cmmp0b9k70025wdf8fk2j7e9r	/images/products/ceramic-tiles.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9kh002swdf8s95ikjsf	cmmp0b9kh002pwdf8cbyfme5u	/images/products/bargin-wood.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9kr0039wdf81jpf58i6	cmmp0b9kr0038wdf88vpd5vxn	/images/products/interior-door.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9l0003swdf84l59afh8	cmmp0b9l0003qwdf8fnw4d2er	/images/products/socket-outlet.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9la004cwdf8d35y6jx0	cmmp0b9la004bwdf80qo57wbf	/images/products/hollow-block-2.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9lj0050wdf891v5x27d	cmmp0b9lj004zwdf8ef4izqkc	/images/products/wall-mirror.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b99a000swdf8neipji8q	cmmp0b99a000rwdf8qtnm0nes	/images/products/iron-rod-16mm.jpg	\N	0	t	2026-03-13 14:43:21.116
cmmp0b9j0001fwdf830eoqj8z	cmmp0b9j0001awdf8xyv8rjfy	/images/products/iron-rod-10mm.jpg	\N	0	t	2026-03-13 14:43:21.143
cmmp0b99a000pwdf860xkiyni	cmmp0b99a000nwdf8cdbcp9fh	/images/products/dangote-cement-1.jpg	\N	0	t	2026-03-13 14:43:21.117
cmmp0b99a000qwdf85jj11q5e	cmmp0b99a000nwdf8cdbcp9fh	/images/products/dangote-cement-2.jpg	\N	1	f	2026-03-13 14:43:21.117
cmmp0b9ji001owdf86wowvf1z	cmmp0b9ji001lwdf8ohj2oi39	/images/products/ridge-cap.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9k70024wdf8745euvce	cmmp0b9k70023wdf8oa36gi89	/images/products/roofing-nails.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9kd002gwdf8rk8tbrf1	cmmp0b9kd002fwdf8280p6hgv	/images/products/vinyl-flooring.jpg	\N	0	t	2026-03-13 14:43:21.144
cmmp0b9kj002wwdf8arqdzyfl	cmmp0b9kj002vwdf87xeu5xur	/images/products/basin-mixer.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9ko0030wdf8zx38ebsu	cmmp0b9ko002zwdf86w2jy42h	/images/products/pvc-pipe.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9kt003gwdf8t2t27diz	cmmp0b9kt003fwdf8mss26skf	/images/products/light-switch.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9kz003owdf802yqqoha	cmmp0b9kz003lwdf8i4mz2miz	/images/products/obeche-wood.jpg	\N	0	t	2026-03-13 14:43:21.145
cmmp0b9l30040wdf8vjipjqm8	cmmp0b9l3003zwdf8rmdjyp74	/images/products/consumer-unit.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9l90048wdf8lvbheax6	cmmp0b9l90047wdf8mo0klfls	/images/products/led-downlight.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9lb004kwdf81wzx0vn8	cmmp0b9lb004jwdf835v11uep	/images/products/pendant-light.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9li004swdf8pk8bum5h	cmmp0b9li004rwdf8o7wo5k1k	/images/products/plywood-sheet.jpg	\N	0	t	2026-03-13 14:43:21.146
cmmp0b9lq005ewdf8y4eh1y6g	cmmp0b9lq005bwdf8al89pdk1	/images/products/cornice.jpg	\N	0	t	2026-03-13 14:43:21.147
cmmp0b9lt005owdf82ev858p7	cmmp0b9lt005nwdf8nmfdqttd	/images/products/aluminum-window.jpg	\N	0	t	2026-03-13 14:43:21.147
cmmt5h7jr003gwdio936za8zr	cmmt5h7jr003fwdior2qsoblq	/images/products/dulux-exterior.jpg	\N	0	t	2026-03-16 12:19:01.423
cmmt5h7me003swdiol1jkn2q1	cmmt5h7me003rwdioq5al0k6o	/images/products/nigerian-paint.jpg	\N	0	t	2026-03-16 12:19:01.423
cmmt5h7iy002ewdio3y7uy7yp	cmmt5h7iy002cwdioiyr7wphy	/images/products/louvre-window.jpg	\N	0	t	2026-03-16 12:19:01.422
cmmt5h7io001zwdiout74nfny	cmmt5h7io001wwdiodvx1s2nl	/images/products/steel-door.jpg	\N	0	t	2026-03-16 12:19:01.421
cmmt5h7ji0036wdioixwg3arw	cmmt5h7ji0035wdioy3dhiklb	/images/products/door-frame.jpg	\N	0	t	2026-03-16 12:19:01.422
cmo8if8ac000ewdcwl9u4dvi1	cmmtf8n380005wdz81vcwz6ps	/uploads/8cc11685-cbaa-484d-a84e-d7152b20c54a.png	\N	0	t	2026-04-21 10:57:39.252
cmo8ig4fe000fwdcwlmvh2gyq	cmmtgqkq0000ewdz8zzxlnwzc	/uploads/78d4a3b7-4ee1-4326-811c-b448fc1f0479.png	\N	0	t	2026-04-21 10:58:20.89
cmo8ik8ic000iwdcwmnulv80k	cmmt5h84v005zwdionx20qs16	/images/products/electrical-wire.jpg	\N	0	t	2026-04-21 11:01:32.819
cmo8ik8ic000jwdcwztm8qpv1	cmmt5h84v005zwdionx20qs16	/uploads/31ae5305-7f44-4858-b1bd-4c475aed58f5.webp	\N	1	f	2026-04-21 11:01:32.819
cmo8io6vm000mwdcw8c2ch37z	cmmt5h8330047wdio2onxcurz	/images/products/wallpaper.jpg	\N	0	t	2026-04-21 11:04:37.329
cmo8io6vm000nwdcwa4xejh8b	cmmt5h8330047wdio2onxcurz	/uploads/7890f0ae-71b5-4386-9ff7-d88d10c83e3a.png	\N	1	f	2026-04-21 11:04:37.329
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, name, sku, price, quantity, options, image, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, description, short_description, price, compare_at_price, cost, sku, barcode, quantity, reserved_quantity, status, category_id, featured, published_at, created_at, updated_at) FROM stdin;
cmmp0b99i000vwdf80izol1lq	6-inch x 6-inch Reinforcing Mesh (2.4m x 1.2m)	6x6-reinforcing-mesh	Welded wire mesh for concrete reinforcement. Perfect for slabs, pathways, and foundations.	\N	18500	19500	\N	MSH-6IN-010	\N	300	0	PUBLISHED	cmmp0b967000ewdf8o8r0e8in	f	2026-03-13 14:43:21.024	2026-03-13 14:43:21.116	2026-03-13 14:43:21.116
cmmp0b9a0000zwdf83m5cjhy6	Longspan Aluminum Roofing Sheet (Natural)	longspan-aluminum-roofing-sheet	0.55mm gauge longspan aluminum roofing sheet, natural finish. Length 3.6m, excellent durability.	\N	12500	13500	\N	ROF-LS-011	\N	350	0	PUBLISHED	cmmp0b8yc0001wdf8288wjxr9	t	2026-03-13 14:43:21.024	2026-03-13 14:43:21.143	2026-03-13 14:43:21.143
cmmp0b9j0001bwdf84rjawvci	Metal Primer Paint (4L)	metal-primer-paint	Anti-corrosive metal primer for steel and iron surfaces. 4-liter can, red oxide.	\N	12500	13500	\N	PNT-PRM-023	\N	300	0	PUBLISHED	cmmp0b95i000dwdf8g5ijv8x6	f	2026-03-13 14:43:21.026	2026-03-13 14:43:21.143	2026-03-13 14:43:21.143
cmmp0b9j0001cwdf83q9blgg6	BUA Cement 42.5 (50kg)	bua-cement-42-5-50kg	High-strength Portland cement suitable for all building applications. Consistent quality and excellent workability.	\N	5400	5700	\N	CEM-BUA-002	\N	450	0	PUBLISHED	cmmp0b934000cwdf8y3jn5axd	f	2026-03-13 14:43:21.023	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9ji001mwdf8qljaiy1l	Wood Stain & Preservative (5L)	wood-stain-preservative	Protective wood stain with insecticide. 5-liter container, teak finish.	\N	18500	19500	\N	PNT-WDP-024	\N	180	0	PUBLISHED	cmmp0b95i000dwdf8g5ijv8x6	f	2026-03-13 14:43:21.026	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9jj001vwdf8myomaq35	Textured Paint - Sand Finish (25kg)	textured-paint-sand-finish	Ready-mixed textured paint for decorative wall finishes. 25kg bucket, off-white.	\N	32000	34000	\N	PNT-TEX-025	\N	120	0	PUBLISHED	cmmp0b95i000dwdf8g5ijv8x6	t	2026-03-13 14:43:21.026	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9k70025wdf8fk2j7e9r	Ceramic Floor Tiles - Beige (40x40cm)	ceramic-floor-tiles-beige	High-quality ceramic floor tiles, beige color. 40x40cm, box of 12 pieces (1.92sqm).	\N	8500	9000	\N	TIL-CER-026	\N	500	0	PUBLISHED	cmmp0b90m0003wdf865npk9fd	t	2026-03-13 14:43:21.026	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9kh002nwdf8d277pd90	Close-Coupled WC Suite - White	close-coupled-wc-suite	Complete toilet suite with cistern, seat, and flush mechanism. White vitreous china.	\N	55000	58000	\N	PLM-WC-035	\N	100	0	PUBLISHED	cmmp0b92y0009wdf8w5wmo7ko	t	2026-03-13 14:43:21.028	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9kh002pwdf8cbyfme5u	2" x 3" Nigerian Bargin (5ft)	2x3-nigerian-bargin	Kiln-dried Nigerian bargin wood, 2x3 inches x 5ft. Ideal for framing and general construction.	\N	1800	2000	\N	TIM-BRG-016	\N	800	0	PUBLISHED	cmmp0b92z000awdf8kfxlhnxl	t	2026-03-13 14:43:21.025	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9kr0038wdf88vpd5vxn	Interior Panel Door - White (30" x 80")	interior-panel-door-white	Hollow core interior panel door, primed white. 30" x 80" standard size with pre-drilled holes.	\N	45000	48000	\N	DR-INT-031	\N	150	0	PUBLISHED	cmmp0b92t0008wdf85dx3a6f3	t	2026-03-13 14:43:21.027	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9kr003bwdf82mpm8pw1	Stainless Steel Kitchen Sink (Single Bowl)	stainless-steel-kitchen-sink	18-gauge stainless steel kitchen sink with drainboard. 1000mm x 500mm, includes waste kit.	\N	45000	48000	\N	PLM-SNK-036	\N	120	0	PUBLISHED	cmmp0b92y0009wdf8w5wmo7ko	t	2026-03-13 14:43:21.028	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9kz003pwdf8d7ufea5t	6-Inch Hollow Blocks (Pieces)	6-inch-hollow-blocks	Standard 6-inch hollow sandcrete blocks, cured for 28 days for maximum strength. Perfect for load-bearing walls.	\N	400	450	\N	BLK-6IN-004	\N	2000	0	PUBLISHED	cmmp0b934000cwdf8y3jn5axd	f	2026-03-13 14:43:21.023	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9l0003qwdf8fnw4d2er	13A Double Socket Outlet - White	13a-double-socket-outlet	Double gang switched socket outlet with shutters. 13A rating, white finish.	\N	3500	3800	\N	ELC-SKT-041	\N	600	0	PUBLISHED	cmmp0b90i0002wdf8bg3p39fx	f	2026-03-13 14:43:21.028	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9l70043wdf83bz0tcy8	1" x 12" Iroko Plank (8ft)	1x12-iroko-plank	Premium Iroko hardwood plank, 1x12 inches x 8ft. Durable, weather-resistant, ideal for furniture.	\N	12500	13500	\N	TIM-IRO-018	\N	200	0	PUBLISHED	cmmp0b92z000awdf8kfxlhnxl	t	2026-03-13 14:43:21.025	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9la004bwdf80qo57wbf	9-Inch Hollow Blocks (Pieces)	9-inch-hollow-blocks	Heavy-duty 9-inch hollow blocks for foundation and structural walls. High compressive strength.	\N	550	600	\N	BLK-9IN-005	\N	1500	0	PUBLISHED	cmmp0b934000cwdf8y3jn5axd	t	2026-03-13 14:43:21.023	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9lj004zwdf8ef4izqkc	Decorative Wall Mirror (60cm x 80cm)	decorative-wall-mirror	Elegant wall mirror with aluminum frame. Beveled edges, ready to hang.	\N	25000	26500	\N	DEC-MIR-049	\N	79	0	PUBLISHED	cmmp0b9110006wdf85r0ndhd5	t	2026-03-13 14:43:21.029	2026-03-13 14:43:21.146	2026-03-19 07:53:15.024
cmmp0b9lh004pwdf809ohyic9	Outdoor Wall Light - Black	outdoor-wall-light-black	Weatherproof outdoor wall light with motion sensor. Black finish, IP44 rated.	\N	18500	19500	\N	LIT-WAL-046	\N	177	0	PUBLISHED	cmmp0b90r0004wdf80a88mjo2	t	2026-03-13 14:43:21.029	2026-03-13 14:43:21.146	2026-05-01 10:02:53.754
cmmp0b9k7002bwdf88aeeahsb	Marble Effect Floor Tiles (60x60cm)	marble-effect-floor-tiles	Luxury marble-look porcelain floor tiles. 60x60cm, box of 4 pieces (1.44sqm).	\N	18500	20000	\N	TIL-MAR-028	\N	299	0	PUBLISHED	cmmp0b90m0003wdf865npk9fd	t	2026-03-13 14:43:21.026	2026-03-13 14:43:21.144	2026-05-02 08:36:11.418
cmmp0b99a000nwdf8cdbcp9fh	Dangote Cement 42.5R (50kg)	dangote-cement-42-5r-50kg	Premium quality Portland limestone cement, ideal for all construction purposes. 42.5R grade for rapid strength development.	Dangote Cement 50kg bag	5500	5800	\N	CEM-DG-001	\N	500	0	PUBLISHED	cmmp0b934000cwdf8y3jn5axd	t	2026-03-13 14:43:21.023	2026-03-13 14:43:21.117	2026-03-13 14:43:21.117
cmmp0b9k70023wdf8oa36gi89	Roofing Nail/Screw Pack (100pcs)	roofing-nail-screw-pack	Stainless steel roofing nails with rubber washers. 100 pieces per pack, weather-resistant.	\N	3500	3800	\N	ROF-FIX-015	\N	1000	0	PUBLISHED	cmmp0b8yc0001wdf8288wjxr9	f	2026-03-13 14:43:21.024	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9kj002vwdf87xeu5xur	Single Lever Basin Mixer - Chrome	single-lever-basin-mixer-chrome	Modern single lever basin mixer tap. Chrome finish, ceramic cartridge, flexible hoses.	\N	18500	20000	\N	PLM-MXR-037	\N	200	0	PUBLISHED	cmmp0b92y0009wdf8w5wmo7ko	f	2026-03-13 14:43:21.028	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9kt003fwdf8mss26skf	1-Gang Light Switch - White	1-gang-light-switch	Modern 1-gang light switch with LED indicator. Flush mount, white finish.	\N	1800	2000	\N	ELC-SWT-040	\N	800	0	PUBLISHED	cmmp0b90i0002wdf8bg3p39fx	f	2026-03-13 14:43:21.028	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9lb004jwdf835v11uep	Modern Pendant Light - Gold	modern-pendant-light-gold	Decorative pendant light with gold finish. Adjustable drop, suitable for dining areas.	\N	28500	30000	\N	LIT-PND-044	\N	120	0	PUBLISHED	cmmp0b90r0004wdf80a88mjo2	t	2026-03-13 14:43:21.029	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9lt005nwdf8nmfdqttd	Aluminum Sliding Window (1200mm x 1200mm)	aluminum-sliding-window	Aluminum sliding window with mosquito net. Clear 4mm glass, powder-coated frame.	\N	65000	68000	\N	WIN-AL-033	\N	120	0	PUBLISHED	cmmp0b92t0008wdf85dx3a6f3	t	2026-03-13 14:43:21.027	2026-03-13 14:43:21.147	2026-03-13 14:43:21.147
cmmp0b9l3003zwdf8rmdjyp74	8-Way Consumer Unit (Distribution Board)	8-way-consumer-unit	8-way metal consumer unit with main switch. IP40 rated, includes mounting rail.	\N	18500	19500	\N	ELC-DB-042	\N	149	0	PUBLISHED	cmmp0b90i0002wdf8bg3p39fx	t	2026-03-13 14:43:21.028	2026-03-13 14:43:21.146	2026-05-02 08:36:11.394
cmmp0b999000hwdf89wg4kpvs	12mm Reinforcement Iron Rod (Length)	12mm-reinforcement-iron-rod	High-tensile 12mm reinforcement bar, 12m length. Grade 460B, meets Nigerian standard specifications.	\N	7500	8000	\N	ROD-12MM-006	\N	800	0	PUBLISHED	cmmp0b967000ewdf8o8r0e8in	t	2026-03-13 14:43:21.023	2026-03-13 14:43:21.116	2026-03-13 14:43:21.116
cmmp0b9j00019wdf8z1su7954	Polycarbonate Roofing Sheet (Clear)	polycarbonate-roofing-sheet	2.1m x 6m clear polycarbonate roofing sheet. UV-protected, ideal for carports and patios.	\N	22000	24000	\N	ROF-PC-013	\N	150	0	PUBLISHED	cmmp0b8yc0001wdf8288wjxr9	f	2026-03-13 14:43:21.024	2026-03-13 14:43:21.143	2026-03-13 14:43:21.143
cmmp0b9ji001swdf8bmk4k9pm	20mm Heavy Reinforcement Rod (Length)	20mm-heavy-reinforcement-rod	Extra-heavy 20mm reinforcement bar for major structural elements. 12m length, high-grade steel.	\N	21000	22000	\N	ROD-20MM-009	\N	400	0	PUBLISHED	cmmp0b967000ewdf8o8r0e8in	f	2026-03-13 14:43:21.024	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9k70026wdf8tiduf6be	Porcelain Wall Tiles - White (30x60cm)	porcelain-wall-tiles-white	Premium porcelain wall tiles, glossy white finish. 30x60cm, box of 8 pieces (1.44sqm).	\N	12500	13500	\N	TIL-POR-027	\N	400	0	PUBLISHED	cmmp0b90m0003wdf865npk9fd	t	2026-03-13 14:43:21.026	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9kh002owdf8gv94sw5w	Tile Adhesive - 20kg Bag	tile-adhesive-20kg	Premium tile adhesive for floor and wall tiles. 20kg bag, cement-based.	\N	5500	5800	\N	TIL-ADH-030	\N	600	0	PUBLISHED	cmmp0b90m0003wdf865npk9fd	f	2026-03-13 14:43:21.027	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9kr0037wdf8e61kkblj	Lafarge Supaset 42.5R (50kg)	lafarge-supaset-42-5r-50kg	Rapid hardening cement for faster construction. Ideal for projects requiring quick formwork removal.	\N	5600	5900	\N	CEM-LAF-003	\N	300	0	PUBLISHED	cmmp0b934000cwdf8y3jn5axd	t	2026-03-13 14:43:21.023	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9l1003vwdf8flzxe33u	Stone-Coated Steel Roofing Tiles (Terracotta)	stone-coated-steel-roofing-tiles	Premium stone-coated steel roofing tiles in terracotta color. 20-year warranty, excellent insulation.	\N	18500	20000	\N	ROF-ST-012	\N	200	0	PUBLISHED	cmmp0b8yc0001wdf8288wjxr9	t	2026-03-13 14:43:21.024	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9lb004fwdf8uew6ghna	LED Strip Light - 5m (Warm White)	led-strip-light-5m	5-meter LED strip light with remote. Warm white (3000K), adhesive backing, includes power supply.	\N	15500	16500	\N	LIT-STR-045	\N	250	0	PUBLISHED	cmmp0b90r0004wdf80a88mjo2	f	2026-03-13 14:43:21.029	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9li004xwdf842l2j08o	3D Wall Panel - White (Pack of 10)	3d-wall-panel-white	Decorative 3D wall panels for feature walls. White, 500mm x 500mm, pack of 10 panels.	\N	32000	34000	\N	DEC-WAL-047	\N	149	0	PUBLISHED	cmmp0b9110006wdf85r0ndhd5	t	2026-03-13 14:43:21.029	2026-03-13 14:43:21.146	2026-03-19 07:53:15.027
cmmp0b99a000rwdf8qtnm0nes	16mm Reinforcement Iron Rod (Length)	16mm-reinforcement-iron-rod	Heavy-duty 16mm reinforcement bar, 12m length. Ideal for columns and beams in multi-story structures.	\N	13500	14200	\N	ROD-16MM-007	\N	600	0	PUBLISHED	cmmp0b967000ewdf8o8r0e8in	t	2026-03-13 14:43:21.024	2026-03-13 14:43:21.116	2026-03-13 14:43:21.116
cmmp0b9j0001awdf8xyv8rjfy	10mm Reinforcement Iron Rod (Length)	10mm-reinforcement-iron-rod	Versatile 10mm reinforcement bar, 12m length. Perfect for lintels, beams and general reinforcement.	\N	5200	5500	\N	ROD-10MM-008	\N	1000	0	PUBLISHED	cmmp0b967000ewdf8o8r0e8in	f	2026-03-13 14:43:21.024	2026-03-13 14:43:21.143	2026-03-13 14:43:21.143
cmmp0b9ji001lwdf8ohj2oi39	Aluminum Ridge Cap (3.6m)	aluminum-ridge-cap	Matching ridge cap for aluminum roofing sheets. 3.6m length, natural finish with sealing strips.	\N	5500	6000	\N	ROF-RID-014	\N	400	0	PUBLISHED	cmmp0b8yc0001wdf8288wjxr9	f	2026-03-13 14:43:21.024	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9kd002fwdf8280p6hgv	Vinyl Plank Flooring (Pack - 2.2sqm)	vinyl-plank-flooring	Waterproof vinyl plank flooring, oak finish. Easy click installation. Pack covers 2.2sqm.	\N	32000	34000	\N	TIL-VNL-029	\N	200	0	PUBLISHED	cmmp0b90m0003wdf865npk9fd	f	2026-03-13 14:43:21.027	2026-03-13 14:43:21.144	2026-03-13 14:43:21.144
cmmp0b9ko002zwdf86w2jy42h	PVC Pipe 4" x 3m (Pressure Grade)	pvc-pipe-4inch	High-pressure PVC pipe for plumbing and drainage. 4-inch diameter, 3-meter length.	\N	7500	8000	\N	PLM-PVC-038	\N	500	0	PUBLISHED	cmmp0b92y0009wdf8w5wmo7ko	t	2026-03-13 14:43:21.028	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9kz003lwdf8i4mz2miz	2" x 2" Nigerian Obeche (12ft)	2x2-nigerian-obeche	Lightweight Obeche wood, 2x2 inches x 12ft. Perfect for interior work and joinery.	\N	2500	2700	\N	TIM-OFE-017	\N	600	0	PUBLISHED	cmmp0b92z000awdf8kfxlhnxl	f	2026-03-13 14:43:21.025	2026-03-13 14:43:21.145	2026-03-13 14:43:21.145
cmmp0b9l90047wdf8mo0klfls	LED Ceiling Downlight (4-pack)	led-ceiling-downlight-4pack	4-pack LED downlights with driver. 7W each, cool white (6000K), cut-out 70mm.	\N	12500	13500	\N	LIT-LED-043	\N	400	0	PUBLISHED	cmmp0b90r0004wdf80a88mjo2	t	2026-03-13 14:43:21.029	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9li004rwdf8o7wo5k1k	12mm Plywood (8ft x 4ft)	12mm-plywood	Marine-grade 12mm plywood sheet. Water-resistant, perfect for cabinetry and construction.	\N	15500	16500	\N	TIM-PLY-019	\N	300	0	PUBLISHED	cmmp0b92z000awdf8kfxlhnxl	f	2026-03-13 14:43:21.025	2026-03-13 14:43:21.146	2026-03-13 14:43:21.146
cmmp0b9lq005bwdf8al89pdk1	Decorative Cornice/PVC (2.4m Length)	decorative-cornice-pvc	Lightweight PVC cornice for ceiling and wall transitions. 2.4m length, white, easy to install.	\N	4500	4800	\N	DEC-CRN-050	\N	499	0	PUBLISHED	cmmp0b9110006wdf85r0ndhd5	f	2026-03-13 14:43:21.029	2026-03-13 14:43:21.147	2026-03-21 11:47:30.293
cmmtf8n380005wdz81vcwz6ps	Shovel	shovel	this highly durable shovel lasts longer than the normal regular shovel	Shovel for digging	20000	20000	10000	S-041	\N	600	0	PUBLISHED	cmmp0b90m0003wdf865npk9fd	t	2026-03-16 16:52:17.777	2026-03-16 16:52:17.78	2026-04-21 10:57:39.252
cmmt5h7jr003fwdior2qsoblq	Dulux Exterior Weathershield Paint (20L)	dulux-exterior-weathershield-paint	Premium exterior paint with weather protection. 20-liter bucket, brilliant white.	\N	65000	68000	\N	PNT-EXT-021	\N	196	0	PUBLISHED	cmmp0b95i000dwdf8g5ijv8x6	t	2026-03-16 12:19:00.908	2026-03-16 12:19:01.423	2026-05-02 08:29:11.998
cmmt5h7ji0035wdioy3dhiklb	Solid Wood Door Frame (Set)	solid-wood-door-frame	Complete door frame set with architrave. Pre-assembled, ready to install.	\N	28500	30000	\N	TIM-DOOR-020	\N	149	0	PUBLISHED	cmmp0b92z000awdf8kfxlhnxl	t	2026-03-16 12:19:00.908	2026-03-16 12:19:01.422	2026-03-19 18:55:29.637
cmmt5h7iy002cwdioiyr7wphy	Casement Window - Louvre Type (4ft x 4ft)	casement-window-louvre	Louvre casement window with aluminum frame and glass blades. Complete with accessories.	\N	45000	47000	\N	WIN-CAS-034	\N	94	0	PUBLISHED	cmmp0b92t0008wdf85dx3a6f3	f	2026-03-16 12:19:00.909	2026-03-16 12:19:01.422	2026-03-19 18:55:29.641
cmmt5h7me003rwdioq5al0k6o	Nigerian Paint Interior Silk (20L)	nigerian-paint-interior-silk	High-quality interior silk paint. Washable, durable finish. 20-liter bucket, white base.	\N	45000	47000	\N	PNT-INT-022	\N	186	0	PUBLISHED	cmmp0b95i000dwdf8g5ijv8x6	t	2026-03-16 12:19:00.908	2026-03-16 12:19:01.423	2026-03-19 19:09:49.505
cmmtgqkq0000ewdz8zzxlnwzc	Hammer	hammer	Strong 40mm thick hammer		5000	\N	2000	H-198	\N	100	0	PUBLISHED	cmmtgnusk000cwdz8i7m4ta51	t	2026-03-16 17:34:14.351	2026-03-16 17:34:14.376	2026-04-21 10:58:20.89
cmmt5h84v005zwdionx20qs16	2.5mm Electrical Wire (Roll - 200m)	2-5mm-electrical-wire-roll-200m	High-quality copper electrical wire. 2.5mm², PVC insulated. 100-meter roll.		45000	47000	\N	ELC-WIR-039	\N	277	0	PUBLISHED	cmmp0b90i0002wdf8bg3p39fx	t	2026-03-16 12:19:00.91	2026-03-16 12:19:01.487	2026-04-21 11:01:32.819
cmmt5h7io001wwdiodvx1s2nl	Exterior Steel Door - Brown (36" x 84")	exterior-steel-door-brown	Security steel door with wood grain finish. Pre-hung, includes frame and hardware.	\N	125000	135000	\N	DR-EXT-032	\N	80	0	PUBLISHED	cmmp0b92t0008wdf85dx3a6f3	t	2026-03-16 12:19:00.909	2026-03-16 12:19:01.421	2026-03-16 12:19:01.421
cmmt5h8330047wdio2onxcurz	Wallpaper Roll - Geometric Pattern (10m)	wallpaper-roll-geometric-pattern-10m	Premium wallpaper roll, geometric pattern in grey and white. 10m length, 53cm width.		18500	19500	\N	DEC-WPR-048	\N	199	0	PUBLISHED	cmmp0b9110006wdf85r0ndhd5	f	2026-03-16 12:19:00.91	2026-03-16 12:19:01.423	2026-04-21 11:04:37.329
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, user_id, rating, title, content, is_verified, is_approved, created_at, updated_at) FROM stdin;
cmon3z0vi0005wdikfvts58tm	cmmtgqkq0000ewdz8zzxlnwzc	cmmxswj980000wdgkjc88u7nz	5	satisfactory	the quality of the products here are mind blowing	t	t	2026-05-01 16:09:41.133	2026-05-02 15:21:43.047
cmon2sv2h0003wdiks5tsctr9	cmmtf8n380005wdz81vcwz6ps	cmmxswj980000wdgkjc88u7nz	4	This shovel is very durable	I love the quality of products	t	t	2026-05-01 15:36:54.005	2026-05-02 15:21:54.976
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, session_token, user_id, expires) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, created_at, updated_at) FROM stdin;
cmnfzbck00001wdicijx1wip1	lowStockAlerts	true	2026-04-01 11:45:12.366	2026-04-01 11:45:12.366
cmnfzcrkr0003wdicu2yscynl	maintenanceMode	false	2026-04-01 11:46:18.651	2026-04-01 16:50:44.567
cmnfzbcp60002wdicbvx93zxh	lowStockThreshold	10	2026-04-01 11:45:12.365	2026-04-01 11:45:12.365
cmnfzcrks0004wdicetkvvvbq	maintenanceMessage	We are currently undergoing maintenance. Please check back soon.	2026-04-01 11:46:18.652	2026-04-01 16:50:44.567
cmnfzbcgm0000wdicpk8khr56	adminNotificationEmail	oyibodaniel247@gmail.com	2026-04-01 11:45:12.365	2026-04-01 11:45:12.365
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, role, "emailVerified", image, phone, created_at, updated_at) FROM stdin;
cmmpw7i9i0000wdycfk3c0l8r	johndoe@gmail.com	$2b$10$pKls5XsjNg4hLdsfdnSOeeUEAV4wJg6FWhavVqk0a3jqYSXq0u7Tm	John Doe	USER	\N	\N	\N	2026-03-14 05:36:13.635	2026-03-14 05:37:33.184
cmmp0b88u0000wdf8jv8hcrd5	admin@durablehomes.com	$2b$10$5x74v2g1B9Bdd4TqCPT8NOKKVO7pXq2dDlhGzXuTnFYdFMS/MIR9m	Alhaja Durable	ADMIN	\N	\N		2026-03-13 14:43:19.707	2026-03-16 12:44:08.368
cmmtfeqln0008wdz8sf0icl4y	dummyaccount@gmail.com	$2b$10$QyORkXKjmvgaxynEWDln0uKC8FPI89NFEUHPrqEb88deytlDqQONK	Dummy Account	ADMIN	\N	\N	\N	2026-03-16 16:57:02.479	2026-03-16 17:21:07.41
cmmxswj980000wdgkjc88u7nz	oyibodaniel247@gmail.com	$2b$12$xlzJCVUfI.Lbv8l5ZI2FvuP.reO4oEOJQz0PQn8sLwxB2C8NChphS	Daniel Oyibo	ADMIN	2026-03-20 19:03:08.065	\N	\N	2026-03-19 18:25:52.293	2026-03-20 19:03:08.311
cmmxuupb3003ewdgk1zripkb0	oyibodaniel15@gmail.com	$2b$10$jJ8b3dUh/YwBBWOxYQ6nPOg7hu9r5T9l/yDNdKDw9pTOD/LalNeAG	Ali Hamzat	MANAGER	\N	\N	\N	2026-03-19 19:20:26.227	2026-04-01 10:57:28.077
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_items (id, user_id, product_id, created_at) FROM stdin;
cmmzarver0004wdlcw0sn6kyd	cmmxswj980000wdgkjc88u7nz	cmmtf8n380005wdz81vcwz6ps	2026-03-20 19:33:53.879
cmmzau4m0000ewdlcmwcbapqh	cmmxswj980000wdgkjc88u7nz	cmmt5h7jr003fwdior2qsoblq	2026-03-20 19:35:39.481
cmn08h5cc000nwdd8xl9nxh0q	cmmxswj980000wdgkjc88u7nz	cmmp0b9la004bwdf80qo57wbf	2026-03-21 11:17:20.733
\.


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: PromoCode PromoCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: CartItem_cartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_cartId_idx" ON public."CartItem" USING btree ("cartId");


--
-- Name: CartItem_cartId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON public."CartItem" USING btree ("cartId", "productId");


--
-- Name: CartItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_productId_idx" ON public."CartItem" USING btree ("productId");


--
-- Name: Cart_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cart_userId_idx" ON public."Cart" USING btree ("userId");


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: PromoCode_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PromoCode_code_idx" ON public."PromoCode" USING btree (code);


--
-- Name: PromoCode_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PromoCode_code_key" ON public."PromoCode" USING btree (code);


--
-- Name: PromoCode_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PromoCode_isActive_idx" ON public."PromoCode" USING btree ("isActive");


--
-- Name: accounts_provider_provider_account_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON public.accounts USING btree (provider, provider_account_id);


--
-- Name: addresses_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX addresses_user_id_idx ON public.addresses USING btree (user_id);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_parent_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: discounts_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX discounts_code_idx ON public.discounts USING btree (code);


--
-- Name: discounts_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX discounts_code_key ON public.discounts USING btree (code);


--
-- Name: discounts_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX discounts_is_active_idx ON public.discounts USING btree (is_active);


--
-- Name: email_verification_tokens_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_verification_tokens_email_idx ON public.email_verification_tokens USING btree (email);


--
-- Name: email_verification_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_verification_tokens_token_idx ON public.email_verification_tokens USING btree (token);


--
-- Name: email_verification_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX email_verification_tokens_token_key ON public.email_verification_tokens USING btree (token);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- Name: order_status_history_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_status_history_order_id_idx ON public.order_status_history USING btree (order_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_orderNumber_idx" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_payment_status_idx ON public.orders USING btree (payment_status);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_user_id_idx ON public.orders USING btree (user_id);


--
-- Name: password_reset_tokens_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_reset_tokens_email_idx ON public.password_reset_tokens USING btree (email);


--
-- Name: password_reset_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_reset_tokens_token_idx ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: payments_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_order_id_idx ON public.payments USING btree (order_id);


--
-- Name: payments_reference_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_reference_idx ON public.payments USING btree (reference);


--
-- Name: payments_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payments_reference_key ON public.payments USING btree (reference);


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: product_images_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_idx ON public.product_images USING btree (product_id);


--
-- Name: product_images_product_id_position_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_images_product_id_position_key ON public.product_images USING btree (product_id, "position");


--
-- Name: product_variants_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: products_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_idx ON public.products USING btree (status);


--
-- Name: reviews_is_approved_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_is_approved_idx ON public.reviews USING btree (is_approved);


--
-- Name: reviews_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_product_id_idx ON public.reviews USING btree (product_id);


--
-- Name: reviews_product_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reviews_product_id_user_id_key ON public.reviews USING btree (product_id, user_id);


--
-- Name: reviews_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_user_id_idx ON public.reviews USING btree (user_id);


--
-- Name: sessions_session_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: wishlist_items_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wishlist_items_user_id_idx ON public.wishlist_items USING btree (user_id);


--
-- Name: wishlist_items_user_id_product_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX wishlist_items_user_id_product_id_key ON public.wishlist_items USING btree (user_id, product_id);


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_productVariantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_billing_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_discount_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_shipping_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict nzq4w3pOZSyJHMvupqOHlhmeH8MLKpcqlVdS3gbqEHZdHRsgP3i1A9UIqWV3lXb

