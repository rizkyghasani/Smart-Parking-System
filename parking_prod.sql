--
-- PostgreSQL database dump
--

\restrict oHIY5w3c94j3XzRxprhauhstAClFmaiojXLjGF6PvzkXK1AGG79l7jAfN1Y4puK

-- Dumped from database version 17.9
-- Dumped by pg_dump version 18.0

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: balance_topups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.balance_topups (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT balance_topups_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['virtual_account'::character varying, 'qris'::character varying, 'debit_card'::character varying])::text[]))),
    CONSTRAINT balance_topups_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'success'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: balance_topups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.balance_topups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: balance_topups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.balance_topups_id_seq OWNED BY public.balance_topups.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    phone_number character varying(255),
    registered_plate_number character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    balance numeric(12,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: edges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edges (
    id bigint NOT NULL,
    source_node_id bigint NOT NULL,
    target_node_id bigint NOT NULL,
    weight double precision NOT NULL,
    description character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: COLUMN edges.weight; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.edges.weight IS 'Jarak fisik Euclidean (meter)';


--
-- Name: COLUMN edges.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.edges.description IS 'Keterangan opsional jalur';


--
-- Name: edges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.edges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.edges_id_seq OWNED BY public.edges.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: manual_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manual_verifications (
    id bigint NOT NULL,
    transaction_id bigint NOT NULL,
    verified_plate character varying(255) NOT NULL,
    vehicle_model character varying(255) NOT NULL,
    vehicle_color character varying(255) NOT NULL,
    driver_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    staff_id bigint
);


--
-- Name: manual_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.manual_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: manual_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.manual_verifications_id_seq OWNED BY public.manual_verifications.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    expired_at date NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nodes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    parking_slot_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT nodes_type_check CHECK (((type)::text = ANY ((ARRAY['exit'::character varying, 'slot'::character varying])::text[])))
);


--
-- Name: COLUMN nodes.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nodes.name IS 'Misal: EXIT1, NODE_S1';


--
-- Name: COLUMN nodes.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nodes.type IS 'Tipe titik dalam graf';


--
-- Name: COLUMN nodes.x; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nodes.x IS 'Koordinat X';


--
-- Name: COLUMN nodes.y; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nodes.y IS 'Koordinat Y';


--
-- Name: nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nodes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nodes_id_seq OWNED BY public.nodes.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    type character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    from_user_id bigint,
    to_user_id bigint,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    transaction_id bigint,
    resolved_by bigint,
    resolved_at timestamp(0) without time zone,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['violation'::character varying, 'system'::character varying, 'info'::character varying, 'manual_tapout_request'::character varying])::text[])))
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: parking_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_slots (
    id bigint NOT NULL,
    slot_code character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'available'::character varying NOT NULL,
    roi_coordinates json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    x_coord double precision,
    y_coord double precision,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT parking_slots_status_check CHECK (((status)::text = ANY (ARRAY['available'::text, 'occupied'::text, 'maintenance'::text, 'violation'::text])))
);


--
-- Name: COLUMN parking_slots.x_coord; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parking_slots.x_coord IS 'Koordinat X (meter)';


--
-- Name: COLUMN parking_slots.y_coord; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.parking_slots.y_coord IS 'Koordinat Y (meter)';


--
-- Name: parking_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parking_slots_id_seq OWNED BY public.parking_slots.id;


--
-- Name: parking_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_transactions (
    id bigint NOT NULL,
    card_id character varying(255) NOT NULL,
    plate_number character varying(255) NOT NULL,
    parking_slot_id bigint NOT NULL,
    entry_time timestamp(0) without time zone NOT NULL,
    exit_time timestamp(0) without time zone,
    is_violation boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    duration_minutes integer,
    fee integer,
    revenue_config_id bigint,
    customer_id bigint,
    is_member boolean DEFAULT false NOT NULL,
    detected_slot_id bigint,
    requires_manual_verification boolean DEFAULT false NOT NULL
);


--
-- Name: parking_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parking_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parking_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parking_transactions_id_seq OWNED BY public.parking_transactions.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: revenue_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revenue_configs (
    id bigint NOT NULL,
    rate_per_hour integer NOT NULL,
    effective_from timestamp(0) without time zone NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: revenue_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.revenue_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: revenue_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.revenue_configs_id_seq OWNED BY public.revenue_configs.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: slot_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slot_overrides (
    id bigint NOT NULL,
    transaction_id bigint NOT NULL,
    old_slot_id bigint NOT NULL,
    new_slot_id bigint NOT NULL,
    staff_id bigint NOT NULL,
    reason text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: slot_overrides_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.slot_overrides_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: slot_overrides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.slot_overrides_id_seq OWNED BY public.slot_overrides.id;


--
-- Name: staffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staffs (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    phone_number character varying(255),
    shift_group character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: staffs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staffs_id_seq OWNED BY public.staffs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    role character varying(255) DEFAULT 'customer'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'staff'::character varying, 'customer'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: balance_topups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_topups ALTER COLUMN id SET DEFAULT nextval('public.balance_topups_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: edges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edges ALTER COLUMN id SET DEFAULT nextval('public.edges_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: manual_verifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_verifications ALTER COLUMN id SET DEFAULT nextval('public.manual_verifications_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: nodes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nodes ALTER COLUMN id SET DEFAULT nextval('public.nodes_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: parking_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots ALTER COLUMN id SET DEFAULT nextval('public.parking_slots_id_seq'::regclass);


--
-- Name: parking_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_transactions ALTER COLUMN id SET DEFAULT nextval('public.parking_transactions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: revenue_configs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_configs ALTER COLUMN id SET DEFAULT nextval('public.revenue_configs_id_seq'::regclass);


--
-- Name: slot_overrides id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_overrides ALTER COLUMN id SET DEFAULT nextval('public.slot_overrides_id_seq'::regclass);


--
-- Name: staffs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs ALTER COLUMN id SET DEFAULT nextval('public.staffs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: balance_topups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.balance_topups (id, customer_id, amount, payment_method, status, created_at, updated_at) FROM stdin;
1	11	100000.00	qris	success	2026-10-05 10:15:19	2026-10-05 10:15:19
2	12	20000.00	qris	success	2026-10-05 10:15:20	2026-10-05 10:15:20
3	13	100000.00	qris	success	2026-10-05 10:15:49	2026-10-05 10:15:50
4	13	50000.00	debit_card	failed	2026-10-05 10:15:50	2026-10-05 10:15:50
5	16	100000.00	qris	success	2026-10-05 10:16:26	2026-10-05 10:16:26
6	16	50000.00	debit_card	failed	2026-10-05 10:16:26	2026-10-05 10:16:26
7	17	100000.00	qris	success	2026-10-05 10:16:33	2026-10-05 10:16:34
8	17	50000.00	debit_card	failed	2026-10-05 10:16:34	2026-10-05 10:16:34
9	18	100000.00	qris	success	2026-10-05 10:16:54	2026-10-05 10:16:54
10	18	50000.00	debit_card	failed	2026-10-05 10:16:54	2026-10-05 10:16:54
11	1	50000.00	virtual_account	success	2026-10-05 10:18:50	2026-10-05 10:19:01
12	1	20000.00	qris	failed	2026-10-05 10:20:42	2026-10-05 10:20:45
13	1	20002.00	debit_card	success	2026-10-05 10:22:07	2026-10-05 10:22:08
14	1	20000.00	qris	failed	2026-10-09 09:14:28	2026-10-09 09:15:15
15	1	2000000.00	virtual_account	failed	2026-10-09 09:15:27	2026-10-09 09:15:34
16	1	20000.00	qris	pending	2026-10-09 09:16:22	2026-10-09 09:16:22
17	1	20000.00	qris	pending	2026-10-09 09:17:39	2026-10-09 09:17:39
18	1	20000.00	debit_card	pending	2026-10-09 09:18:00	2026-10-09 09:18:00
19	1	20000.00	qris	pending	2026-10-09 09:18:32	2026-10-09 09:18:32
20	1	200000.00	qris	success	2026-10-16 19:29:39	2026-10-16 19:29:41
21	1	20000.00	virtual_account	success	2026-10-16 19:37:47	2026-10-16 19:38:02
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, user_id, phone_number, registered_plate_number, created_at, updated_at, balance) FROM stdin;
2	4	32682368	B 3367 ACT	2026-06-28 17:17:59	2026-06-28 17:17:59	0.00
3	5	085338279686	EA 1559 Uz	2026-06-28 18:49:01	2026-06-28 18:49:01	0.00
4	6	123456789	B 537 RUM	2026-06-29 10:22:34	2026-06-29 10:22:34	0.00
5	9	111111111	b 1 nus	2026-08-20 16:40:57	2026-08-20 16:40:57	0.00
6	11	11111111119939	L 4 YU	2026-08-26 14:32:31	2026-08-26 14:32:31	0.00
11	54	081111	PA55892883	2026-10-05 10:15:18	2026-10-05 10:15:19	95999.00
12	55	082222	PB55892883	2026-10-05 10:15:20	2026-10-05 10:15:20	15999.00
7	50	081111	PA179117	2026-10-05 10:14:38	2026-10-05 10:15:41	91998.00
8	51	082222	PB179117	2026-10-05 10:14:41	2026-10-05 10:15:41	91998.00
13	58	08123456789	TST 179117	2026-10-05 10:15:49	2026-10-05 10:15:50	100000.00
16	67	08123456789	TST-1791170185-41165	2026-10-05 10:16:25	2026-10-05 10:16:26	100000.00
17	70	08123456789	TST-1791170189-41338	2026-10-05 10:16:29	2026-10-05 10:16:34	100000.00
18	73	08123456789	TST-1791170209-42128	2026-10-05 10:16:50	2026-10-05 10:16:54	100000.00
1	3	08123456789	K 141 KU	2026-06-28 15:56:05	2026-10-16 19:38:02	58000.00
\.


--
-- Data for Name: edges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.edges (id, source_node_id, target_node_id, weight, description, created_at, updated_at) FROM stdin;
255	120	79	2.25	Otomatis terhubung ke NODE_S2	2026-09-14 16:58:04	2026-09-14 16:58:04
256	79	120	2.25	Otomatis terhubung ke NODE_S1	2026-09-14 16:58:04	2026-09-14 16:58:04
147	80	79	2.5	Otomatis terhubung ke NODE_S2	2026-07-22 16:28:07	2026-07-22 16:28:07
148	79	80	2.5	Otomatis terhubung ke NODE_S3	2026-07-22 16:28:07	2026-07-22 16:28:07
149	81	80	2.5	Otomatis terhubung ke NODE_S3	2026-07-22 16:28:07	2026-07-22 16:28:07
150	80	81	2.5	Otomatis terhubung ke NODE_S4	2026-07-22 16:28:07	2026-07-22 16:28:07
151	82	81	2.5	Otomatis terhubung ke NODE_S4	2026-07-22 16:28:07	2026-07-22 16:28:07
152	81	82	2.5	Otomatis terhubung ke NODE_S5	2026-07-22 16:28:07	2026-07-22 16:28:07
153	83	82	2.5	Otomatis terhubung ke NODE_S5	2026-07-22 16:28:07	2026-07-22 16:28:07
154	82	83	2.5	Otomatis terhubung ke NODE_S6	2026-07-22 16:28:07	2026-07-22 16:28:07
155	84	83	2.5	Otomatis terhubung ke NODE_S6	2026-07-22 16:28:07	2026-07-22 16:28:07
156	83	84	2.5	Otomatis terhubung ke NODE_S7	2026-07-22 16:28:07	2026-07-22 16:28:07
157	85	84	2.5	Otomatis terhubung ke NODE_S7	2026-07-22 16:28:07	2026-07-22 16:28:07
158	84	85	2.5	Otomatis terhubung ke NODE_S8	2026-07-22 16:28:07	2026-07-22 16:28:07
159	86	85	2.5	Otomatis terhubung ke NODE_S8	2026-07-22 16:28:07	2026-07-22 16:28:07
160	85	86	2.5	Otomatis terhubung ke NODE_S9	2026-07-22 16:28:07	2026-07-22 16:28:07
161	87	86	2.5	Otomatis terhubung ke NODE_S9	2026-07-22 16:28:07	2026-07-22 16:28:07
162	86	87	2.5	Otomatis terhubung ke NODE_S10	2026-07-22 16:28:07	2026-07-22 16:28:07
163	88	87	2.5	Otomatis terhubung ke NODE_S10	2026-07-22 16:28:07	2026-07-22 16:28:07
164	87	88	2.5	Otomatis terhubung ke NODE_S11	2026-07-22 16:28:07	2026-07-22 16:28:07
165	89	88	2.5	Otomatis terhubung ke NODE_S11	2026-07-22 16:28:07	2026-07-22 16:28:07
166	88	89	2.5	Otomatis terhubung ke NODE_S12	2026-07-22 16:28:07	2026-07-22 16:28:07
167	90	89	2.5	Otomatis terhubung ke NODE_S12	2026-07-22 16:28:07	2026-07-22 16:28:07
168	89	90	2.5	Otomatis terhubung ke NODE_S13	2026-07-22 16:28:07	2026-07-22 16:28:07
169	91	90	2.5	Otomatis terhubung ke NODE_S13	2026-07-22 16:28:07	2026-07-22 16:28:07
170	90	91	2.5	Otomatis terhubung ke NODE_S14	2026-07-22 16:28:07	2026-07-22 16:28:07
171	92	91	2.5	Otomatis terhubung ke NODE_S14	2026-07-22 16:28:07	2026-07-22 16:28:07
172	91	92	2.5	Otomatis terhubung ke NODE_S15	2026-07-22 16:28:07	2026-07-22 16:28:07
173	93	92	2.5	Otomatis terhubung ke NODE_S15	2026-07-22 16:28:07	2026-07-22 16:28:07
174	92	93	2.5	Otomatis terhubung ke NODE_S16	2026-07-22 16:28:07	2026-07-22 16:28:07
175	94	93	2.5	Otomatis terhubung ke NODE_S16	2026-07-22 16:28:07	2026-07-22 16:28:07
176	93	94	2.5	Otomatis terhubung ke NODE_S17	2026-07-22 16:28:07	2026-07-22 16:28:07
177	95	94	2.5	Otomatis terhubung ke NODE_S17	2026-07-22 16:28:07	2026-07-22 16:28:07
178	94	95	2.5	Otomatis terhubung ke NODE_S18	2026-07-22 16:28:07	2026-07-22 16:28:07
179	96	95	2.5	Otomatis terhubung ke NODE_S18	2026-07-22 16:28:07	2026-07-22 16:28:07
180	95	96	2.5	Otomatis terhubung ke NODE_S19	2026-07-22 16:28:07	2026-07-22 16:28:07
181	97	96	2.5	Otomatis terhubung ke NODE_S19	2026-07-22 16:28:07	2026-07-22 16:28:07
182	96	97	2.5	Otomatis terhubung ke NODE_S20	2026-07-22 16:28:07	2026-07-22 16:28:07
183	98	97	2.5	Otomatis terhubung ke NODE_S20	2026-07-22 16:28:07	2026-07-22 16:28:07
184	97	98	2.5	Otomatis terhubung ke NODE_S21	2026-07-22 16:28:07	2026-07-22 16:28:07
185	99	81	6	Otomatis terhubung ke NODE_S4	2026-07-22 16:28:07	2026-07-22 16:28:07
186	81	99	6	Otomatis terhubung ke NODE_S22	2026-07-22 16:28:07	2026-07-22 16:28:07
220	100	82	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
221	83	101	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
222	101	83	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
223	84	102	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
224	102	84	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
225	85	103	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
226	103	85	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
227	86	104	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
228	104	86	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
187	100	99	2.5	Otomatis terhubung ke NODE_S22	2026-07-22 16:28:07	2026-07-22 16:28:07
188	99	100	2.5	Otomatis terhubung ke NODE_S23	2026-07-22 16:28:07	2026-07-22 16:28:07
189	101	100	2.5	Otomatis terhubung ke NODE_S23	2026-07-22 16:28:07	2026-07-22 16:28:07
190	100	101	2.5	Otomatis terhubung ke NODE_S24	2026-07-22 16:28:07	2026-07-22 16:28:07
191	102	101	2.5	Otomatis terhubung ke NODE_S24	2026-07-22 16:28:07	2026-07-22 16:28:07
192	101	102	2.5	Otomatis terhubung ke NODE_S25	2026-07-22 16:28:07	2026-07-22 16:28:07
193	103	102	2.5	Otomatis terhubung ke NODE_S25	2026-07-22 16:28:07	2026-07-22 16:28:07
194	102	103	2.5	Otomatis terhubung ke NODE_S26	2026-07-22 16:28:07	2026-07-22 16:28:07
195	104	103	2.5	Otomatis terhubung ke NODE_S26	2026-07-22 16:28:07	2026-07-22 16:28:07
196	103	104	2.5	Otomatis terhubung ke NODE_S27	2026-07-22 16:28:07	2026-07-22 16:28:07
197	105	104	2.5	Otomatis terhubung ke NODE_S27	2026-07-22 16:28:07	2026-07-22 16:28:07
198	104	105	2.5	Otomatis terhubung ke NODE_S28	2026-07-22 16:28:07	2026-07-22 16:28:07
199	106	105	2.5	Otomatis terhubung ke NODE_S28	2026-07-22 16:28:07	2026-07-22 16:28:07
200	105	106	2.5	Otomatis terhubung ke NODE_S29	2026-07-22 16:28:07	2026-07-22 16:28:07
201	107	106	2.5	Otomatis terhubung ke NODE_S29	2026-07-22 16:28:07	2026-07-22 16:28:07
202	106	107	2.5	Otomatis terhubung ke NODE_S30	2026-07-22 16:28:07	2026-07-22 16:28:07
203	108	107	2.5	Otomatis terhubung ke NODE_S30	2026-07-22 16:28:07	2026-07-22 16:28:07
204	107	108	2.5	Otomatis terhubung ke NODE_S31	2026-07-22 16:28:07	2026-07-22 16:28:07
205	109	108	2.5	Otomatis terhubung ke NODE_S31	2026-07-22 16:28:07	2026-07-22 16:28:07
206	108	109	2.5	Otomatis terhubung ke NODE_S32	2026-07-22 16:28:07	2026-07-22 16:28:07
207	110	109	2.5	Otomatis terhubung ke NODE_S32	2026-07-22 16:28:07	2026-07-22 16:28:07
208	109	110	2.5	Otomatis terhubung ke NODE_S33	2026-07-22 16:28:07	2026-07-22 16:28:07
209	111	110	2.5	Otomatis terhubung ke NODE_S33	2026-07-22 16:28:07	2026-07-22 16:28:07
210	110	111	2.5	Otomatis terhubung ke NODE_S34	2026-07-22 16:28:07	2026-07-22 16:28:07
211	112	111	2.5	Otomatis terhubung ke NODE_S34	2026-07-22 16:28:07	2026-07-22 16:28:07
212	111	112	2.5	Otomatis terhubung ke NODE_S35	2026-07-22 16:28:07	2026-07-22 16:28:07
213	113	112	2.5	Otomatis terhubung ke NODE_S35	2026-07-22 16:39:16	2026-07-22 16:39:16
214	112	113	2.5	Otomatis terhubung ke NODE_S36	2026-07-22 16:39:16	2026-07-22 16:39:16
215	114	87	5.52	Jalur utama dari EXIT1	2026-07-22 16:45:37	2026-07-22 16:45:37
216	87	114	5.52	Jalur keluar menuju EXIT1	2026-07-22 16:45:37	2026-07-22 16:45:37
217	115	89	5.52	Jalur utama dari EXIT2	2026-07-22 16:45:51	2026-07-22 16:45:51
218	89	115	5.52	Jalur keluar menuju EXIT2	2026-07-22 16:45:51	2026-07-22 16:45:51
219	82	100	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
229	87	105	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
230	105	87	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
231	88	106	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
232	106	88	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
233	89	107	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
234	107	89	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
235	90	108	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
236	108	90	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
237	91	109	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
238	109	91	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
239	92	110	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
240	110	92	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
241	93	111	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
242	111	93	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
243	94	112	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
244	112	94	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
245	95	113	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
246	113	95	6	Lorong menyeberang	2026-07-29 10:18:49	2026-07-29 10:18:49
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: manual_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manual_verifications (id, transaction_id, verified_plate, vehicle_model, vehicle_color, driver_name, created_at, updated_at, staff_id) FROM stdin;
53	419	H 21 S	jhb	kjb	kj	2026-09-15 10:26:14	2026-09-15 10:26:14	8
55	421	JB 32 DS	jhg	ihujg	ijkhj	2026-09-15 10:29:16	2026-09-15 10:29:16	8
57	423	L 3	kjn	jk	jk	2026-09-15 10:42:51	2026-09-15 10:42:51	8
59	430	P 23 SD	kjb	sd	jkh	2026-09-15 17:02:34	2026-09-15 17:02:34	2
61	434	B 343 JJK	ihuk	khj	khj	2026-09-16 10:24:37	2026-09-16 10:24:37	2
63	459	K 141 KU	Voxy	Hitam	nano	2026-09-16 13:58:19	2026-09-16 13:58:19	2
65	521	L 99 K	ijon	ojkn	ojknl	2026-10-13 15:50:44	2026-10-13 15:50:44	2
1	147	B 334 JJS	innova	merah	rudi	2026-08-20 10:33:07	2026-08-20 10:33:07	\N
2	149	B 993 JKS	test	merah	juju	2026-08-20 10:42:36	2026-08-20 10:42:36	\N
3	150	B 332	ds	er	edfs	2026-08-20 10:44:15	2026-08-20 10:44:15	\N
4	151	B 343 JJ	fortuner	biru	budiman	2026-08-20 10:47:27	2026-08-20 10:47:27	\N
5	152	K 141 KU	djsk	emk	kdsjn	2026-08-20 10:49:38	2026-08-20 10:49:38	\N
6	153	B 332	sac	sd	scd	2026-08-20 10:52:00	2026-08-20 10:52:00	\N
7	154	B 562 JJ	pajero	biru	budimir	2026-08-20 10:54:15	2026-08-20 10:54:15	\N
8	155	B 332 AA	ferari	merah	kiki	2026-08-20 11:05:16	2026-08-20 11:05:16	\N
9	156	B 8378 JJK	xtrail	gray	zunaidi	2026-08-20 11:17:55	2026-08-20 11:17:55	\N
10	165	B 8819 AGF	brio	putih	jundi	2026-08-20 13:36:25	2026-08-20 13:36:25	\N
11	166	J 8892 SS	avanza	pink	nuni	2026-08-20 13:37:09	2026-08-20 13:37:09	\N
12	167	EA 1559 UZ	Brio	Putih	Salsa	2026-08-20 13:43:22	2026-08-20 13:43:22	\N
13	172	EB 9918 UHA	panther	abu	prio	2026-08-20 15:46:09	2026-08-20 15:46:09	\N
14	173	L 1 ACT	alphard	hitam	rudi	2026-08-20 15:54:02	2026-08-20 15:54:02	\N
15	174	N 3818 ACT	vario	hitam	nano	2026-08-20 15:56:16	2026-08-20 15:56:16	\N
16	177	U 5590 KK	apv	gray	bunti	2026-08-20 16:35:45	2026-08-20 16:35:45	\N
17	178	J 3345 KKI	xpeng	gray	fitra	2026-08-21 09:13:11	2026-08-21 09:13:11	\N
18	182	B 1 RIO	brio	putih	salsa	2026-08-21 09:49:25	2026-08-21 09:49:25	\N
19	191	L 44 AU	pajero	biru	nosi	2026-08-21 14:21:21	2026-08-21 14:21:21	\N
20	192	N 4 NO	vario	merah	nano	2026-08-21 14:23:49	2026-08-21 14:23:49	\N
21	193	EA 4826 SF	crf	merah	syarif	2026-08-21 15:41:18	2026-08-21 15:41:18	2
22	201	B 789 UZ	pajero	hitam	budi	2026-08-24 18:56:57	2026-08-24 18:56:57	2
23	205	B 1234 ABC	Avanza	Putih	Rudi	2026-08-24 19:27:43	2026-08-24 19:27:43	2
24	210	L 90 A	jk	kln	kln	2026-08-26 11:11:58	2026-08-26 11:11:58	8
25	212	EB 332 AB	askln	lkn	ldskcjn	2026-08-26 11:14:10	2026-08-26 11:14:10	2
26	273	M 98 HH	ishud	jhds	sdhgj	2026-08-28 15:40:50	2026-08-28 15:40:50	2
27	265	J 92	djbhs	hdc	kjkd	2026-08-28 15:41:01	2026-08-28 15:41:01	2
28	254	L 90 HJ	jkb	kjnbjk	kjb	2026-08-28 15:41:15	2026-08-28 15:41:15	2
29	281	J 9832	hksjbd	uhkjb	uhkjb	2026-08-28 15:41:28	2026-08-28 15:41:28	2
30	246	J98U	bjsdh	hkjb	hkjb	2026-08-28 15:42:07	2026-08-28 15:42:07	2
31	238	O 876 DWS	khj	kjbm	k	2026-08-28 15:43:17	2026-08-28 15:43:17	2
32	230	P 1076 MU	brio	iobi	knj	2026-08-28 15:44:06	2026-08-28 15:44:06	2
33	226	LK 12 W	jkn	jkn	nk	2026-08-28 15:44:34	2026-08-28 15:44:34	2
34	222	M 232 DS	lkjnm	kjn	lkj	2026-08-28 15:44:51	2026-08-28 15:44:51	2
35	289	L 00 JJ	kajnjk	kj	kjh	2026-08-28 15:52:39	2026-08-28 15:52:39	2
41	306	B 9306 TEST	Toyota	Putih	Uji	2026-09-03 11:19:35	2026-09-03 11:19:35	16
43	308	B 9308 TEST	Toyota	Putih	Uji	2026-09-03 11:19:35	2026-09-03 11:19:35	16
47	318	L 132 S	dc	dfs	ddew	2026-09-03 13:28:54	2026-09-03 13:28:54	2
48	320	L 190 JJ	fortuner	Hitam	Mathew	2026-09-04 10:05:13	2026-09-04 10:05:13	2
49	343	H 32 EW	jk	kj	kj	2026-09-11 14:35:52	2026-09-11 14:35:52	2
50	354	P 1076 MU	brio	putih	salsa	2026-09-11 16:04:35	2026-09-11 16:04:35	2
51	352	J 2882 NKJ	kjh	jkn	jnk	2026-09-11 16:05:37	2026-09-11 16:05:37	2
52	356	B 1 NO	rr	gold	mt	2026-09-11 16:07:31	2026-09-11 16:07:31	2
54	422	P 90	jbh	jkhb	kjb	2026-09-15 10:29:04	2026-09-15 10:29:04	8
56	420	CD 98	hkjb	khjb	jkhb	2026-09-15 10:29:25	2026-09-15 10:29:25	8
58	424	L 90	OIHU	IUHKJ	HKJ	2026-09-15 10:48:52	2026-09-15 10:48:52	8
60	432	B 32 WSD	jk	kj	kj	2026-09-15 17:21:17	2026-09-15 17:21:17	2
62	450	L 92	kj	jk	jk	2026-09-16 13:44:15	2026-09-16 13:44:15	2
64	487	K 141 KU	BRIO	hijau	chairul	2026-09-30 10:37:38	2026-09-30 10:37:38	2
66	534	F 23 H	Brio	putih	chairul	2026-10-16 19:28:50	2026-10-16 19:28:50	2
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (id, customer_id, expired_at, is_active, created_at, updated_at) FROM stdin;
2	2	2026-06-30	f	2026-06-28 17:17:59	2026-08-17 13:35:28
4	3	2026-08-20	f	2026-06-30 11:16:04	2026-08-21 10:00:52
3	4	2026-08-21	f	2026-06-29 10:23:41	2026-08-24 11:20:26
5	5	2026-09-13	f	2026-09-11 15:55:53	2026-09-14 09:45:27
1	1	2026-09-30	f	2026-06-28 15:56:12	2026-10-05 10:26:17
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_04_28_032156_create_parking_system_tables	1
5	2026_04_28_035948_create_personal_access_tokens_table	1
6	2026_05_31_091328_add_role_and_status_to_users_table	1
7	2026_05_31_091417_create_revenue_configs_table	1
8	2026_05_31_091859_add_financial_and_config_to_parking_transactions_table	1
9	2026_05_31_091940_create_slot_overrides_table	1
10	2026_05_31_092002_create_notifications_table	1
11	2026_06_28_082827_create_admins_table	1
12	2026_06_28_082843_create_staffs_table	1
13	2026_06_28_082852_create_customers_table	1
14	2026_06_28_082859_create_members_table	1
15	2026_06_28_082907_add_customer_id_to_parking_transactions_table	1
16	2026_06_28_092506_add_is_member_to_parking_transactions_table	2
17	2026_07_22_064457_alter_parking_slots_for_dijkstra	3
18	2026_07_22_064531_create_graph_routing_tables	3
19	2026_08_19_074715_add_violation_status_to_parking_slots	4
20	2026_08_19_092420_add_detected_slot_id_to_parking_transactions_table	5
21	2026_08_20_025559_create_manual_verifications_table	6
22	2026_08_20_031652_add_transaction_id_to_notifications_table	7
23	2026_08_20_033055_extend_notification_type_enum	8
24	2026_08_20_083236_add_supervision_columns_to_tables	9
25	2026_08_21_033401_add_deleted_at_to_parking_slots_table	10
26	2026_09_03_000000_add_requires_manual_verification_to_parking_transactions_table	11
27	2026_09_14_000001_convert_timestamps_to_wib	12
28	2026_09_14_000002_replace_slot_code_unique_with_partial_index	13
29	2026_10_05_000001_add_balance_to_customers_table	14
30	2026_10_05_000002_create_balance_topups_table	14
\.


--
-- Data for Name: nodes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nodes (id, name, type, x, y, parking_slot_id, created_at, updated_at) FROM stdin;
79	NODE_S2	slot	5	11	75	2026-07-22 16:28:07	2026-07-22 16:28:07
80	NODE_S3	slot	7.5	11	76	2026-07-22 16:28:07	2026-07-22 16:28:07
81	NODE_S4	slot	10	11	77	2026-07-22 16:28:07	2026-07-22 16:28:07
82	NODE_S5	slot	12.5	11	78	2026-07-22 16:28:07	2026-07-22 16:28:07
83	NODE_S6	slot	15	11	79	2026-07-22 16:28:07	2026-07-22 16:28:07
84	NODE_S7	slot	17.5	11	80	2026-07-22 16:28:07	2026-07-22 16:28:07
85	NODE_S8	slot	20	11	46	2026-07-22 16:28:07	2026-07-22 16:28:07
86	NODE_S9	slot	22.5	11	47	2026-07-22 16:28:07	2026-07-22 16:28:07
87	NODE_S10	slot	25	11	48	2026-07-22 16:28:07	2026-07-22 16:28:07
88	NODE_S11	slot	27.5	11	49	2026-07-22 16:28:07	2026-07-22 16:28:07
89	NODE_S12	slot	30	11	50	2026-07-22 16:28:07	2026-07-22 16:28:07
90	NODE_S13	slot	32.5	11	51	2026-07-22 16:28:07	2026-07-22 16:28:07
114	EXIT1	exit	24.5	16.5	\N	2026-07-22 16:45:37	2026-07-22 16:45:37
91	NODE_S14	slot	35	11	52	2026-07-22 16:28:07	2026-07-22 16:28:07
92	NODE_S15	slot	37.5	11	53	2026-07-22 16:28:07	2026-07-22 16:28:07
93	NODE_S16	slot	40	11	54	2026-07-22 16:28:07	2026-07-22 16:28:07
94	NODE_S17	slot	42.5	11	55	2026-07-22 16:28:07	2026-07-22 16:28:07
95	NODE_S18	slot	45	11	56	2026-07-22 16:28:07	2026-07-22 16:28:07
96	NODE_S19	slot	47.5	11	57	2026-07-22 16:28:07	2026-07-22 16:28:07
97	NODE_S20	slot	50	11	58	2026-07-22 16:28:07	2026-07-22 16:28:07
98	NODE_S21	slot	52.5	11	59	2026-07-22 16:28:07	2026-07-22 16:28:07
99	NODE_S22	slot	10	5	60	2026-07-22 16:28:07	2026-07-22 16:28:07
100	NODE_S23	slot	12.5	5	61	2026-07-22 16:28:07	2026-07-22 16:28:07
101	NODE_S24	slot	15	5	62	2026-07-22 16:28:07	2026-07-22 16:28:07
102	NODE_S25	slot	17.5	5	63	2026-07-22 16:28:07	2026-07-22 16:28:07
103	NODE_S26	slot	20	5	64	2026-07-22 16:28:07	2026-07-22 16:28:07
104	NODE_S27	slot	22.5	5	65	2026-07-22 16:28:07	2026-07-22 16:28:07
105	NODE_S28	slot	25	5	66	2026-07-22 16:28:07	2026-07-22 16:28:07
106	NODE_S29	slot	27.5	5	67	2026-07-22 16:28:07	2026-07-22 16:28:07
107	NODE_S30	slot	30	5	68	2026-07-22 16:28:07	2026-07-22 16:28:07
108	NODE_S31	slot	32.5	5	69	2026-07-22 16:28:07	2026-07-22 16:28:07
109	NODE_S32	slot	35	5	70	2026-07-22 16:28:07	2026-07-22 16:28:07
110	NODE_S33	slot	37.5	5	71	2026-07-22 16:28:07	2026-07-22 16:28:07
111	NODE_S34	slot	40	5	72	2026-07-22 16:28:07	2026-07-22 16:28:07
112	NODE_S35	slot	42.5	5	73	2026-07-22 16:28:07	2026-07-22 16:28:07
113	NODE_S36	slot	45	5	81	2026-07-22 16:39:16	2026-07-22 16:39:16
115	EXIT2	exit	30.5	16.5	\N	2026-07-22 16:45:51	2026-07-22 16:45:51
120	NODE_S1	slot	2.5	11	74	2026-09-14 16:58:04	2026-09-14 16:58:41
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, type, title, body, from_user_id, to_user_id, read_at, created_at, updated_at, transaction_id, resolved_by, resolved_at) FROM stdin;
210	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S29 (Seharusnya di S12).	\N	\N	2026-09-15 10:24:42	2026-09-15 10:23:42	2026-09-15 10:24:42	418	8	2026-09-15 10:24:42
225	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S32 (Seharusnya di S12).	\N	\N	2026-09-16 13:08:55	2026-09-16 13:08:47	2026-09-16 13:08:55	445	2	2026-09-16 13:08:55
240	violation	Pelanggaran Lokasi!	Plat B 5117 parkir di S23 (Seharusnya di S9).	\N	\N	2026-09-16 13:40:49	2026-09-16 13:38:34	2026-09-16 13:40:49	455	2	2026-09-16 13:40:49
255	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S11 (Seharusnya di S12).	\N	\N	2026-09-16 15:48:03	2026-09-16 15:47:47	2026-09-16 15:48:03	462	2	2026-09-16 15:48:03
270	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S20 (Seharusnya di S10).	\N	\N	2026-10-14 15:22:53	2026-10-14 15:21:07	2026-10-14 15:22:53	531	2	2026-10-14 15:22:53
211	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S29.	8	\N	2026-09-15 10:26:23	2026-09-15 10:24:42	2026-09-15 10:26:23	\N	8	2026-09-15 10:26:23
226	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S32.	2	\N	2026-09-16 13:20:38	2026-09-16 13:08:55	2026-09-16 13:20:38	\N	2	2026-09-16 13:20:38
241	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S25 (Seharusnya di S13).	\N	\N	2026-09-16 13:40:55	2026-09-16 13:39:44	2026-09-16 13:40:55	456	2	2026-09-16 13:40:55
256	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S11.	2	\N	2026-09-30 10:37:01	2026-09-16 15:48:03	2026-09-30 10:37:01	\N	2	2026-09-30 10:37:01
271	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S20.	2	\N	\N	2026-10-14 15:22:53	2026-10-14 15:22:53	\N	2	2026-10-14 15:22:53
212	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:26:14	2026-09-15 10:25:47	2026-09-15 10:26:14	419	8	2026-09-15 10:26:14
227	violation	Pelanggaran Lokasi!	Plat B 5565 parkir di S27 (Seharusnya di S12).	\N	\N	2026-09-16 13:17:21	2026-09-16 13:16:55	2026-09-16 13:17:21	446	2	2026-09-16 13:17:21
242	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S14.	2	\N	\N	2026-09-16 13:40:34	2026-09-16 13:40:34	\N	2	2026-09-16 13:40:34
257	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan dari Slot S29 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-09-16 15:49:11	2026-09-16 15:48:59	2026-09-16 15:49:11	460	\N	\N
272	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S9 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-10-16 19:28:50	2026-10-14 15:28:58	2026-10-16 19:28:50	534	2	2026-10-16 19:28:50
213	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S9 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:29:04	2026-09-15 10:27:48	2026-09-15 10:29:04	422	8	2026-09-15 10:29:04
228	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S27.	2	\N	2026-09-16 13:20:38	2026-09-16 13:17:21	2026-09-16 13:20:38	\N	2	2026-09-16 13:20:38
243	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S29.	2	\N	\N	2026-09-16 13:40:41	2026-09-16 13:40:41	\N	2	2026-09-16 13:40:41
258	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S12 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-09-30 10:37:38	2026-09-30 10:37:13	2026-09-30 10:37:38	487	2	2026-09-30 10:37:38
273	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S9 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-10-16 19:28:50	2026-10-16 19:28:31	2026-10-16 19:28:50	534	2	2026-10-16 19:28:50
214	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:29:16	2026-09-15 10:27:53	2026-09-15 10:29:16	421	8	2026-09-15 10:29:16
229	violation	Pelanggaran Lokasi!	Plat B 3054 parkir di S2 (Seharusnya di S12).	\N	\N	2026-09-16 13:18:29	2026-09-16 13:17:53	2026-09-16 13:18:29	448	2	2026-09-16 13:18:29
244	info	Slot Overriden	Staff memindahkan transaksi dari S9 ke S23.	2	\N	\N	2026-09-16 13:40:49	2026-09-16 13:40:49	\N	2	2026-09-16 13:40:49
259	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S24 (Seharusnya di S28).	\N	\N	2026-10-05 10:16:32	2026-10-05 10:16:31	2026-10-05 10:16:32	502	69	2026-10-05 10:16:32
274	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S10 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-10-16 19:45:32	2026-10-16 19:45:10	2026-10-16 19:45:32	535	\N	\N
215	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:29:25	2026-09-15 10:27:57	2026-09-15 10:29:25	420	8	2026-09-15 10:29:25
230	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S2.	2	\N	2026-09-16 13:20:38	2026-09-16 13:18:29	2026-09-16 13:20:38	\N	2	2026-09-16 13:20:38
245	info	Slot Overriden	Staff memindahkan transaksi dari S13 ke S25.	2	\N	\N	2026-09-16 13:40:55	2026-09-16 13:40:55	\N	2	2026-09-16 13:40:55
260	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S15 meminta bantuan petugas untuk tap-out manual.	\N	\N	\N	2026-10-05 10:16:32	2026-10-05 10:16:32	503	\N	\N
216	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:29:25	2026-09-15 10:28:38	2026-09-15 10:29:25	420	8	2026-09-15 10:29:25
231	violation	Pelanggaran Lokasi!	Plat B 7503 parkir di S20 (Seharusnya di S12).	\N	\N	2026-09-16 13:20:27	2026-09-16 13:20:13	2026-09-16 13:20:27	449	2	2026-09-16 13:20:27
246	violation	Pelanggaran Lokasi!	Plat B 8428 parkir di S25 (Seharusnya di S10).	\N	\N	2026-09-16 13:43:15	2026-09-16 13:43:00	2026-09-16 13:43:15	458	2	2026-09-16 13:43:15
261	info	Slot Overriden	Staff memindahkan transaksi dari S28 ke S24.	69	\N	2026-10-05 10:16:32	2026-10-05 10:16:32	2026-10-05 10:16:32	\N	69	2026-10-05 10:16:32
217	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:29:16	2026-09-15 10:28:44	2026-09-15 10:29:16	421	8	2026-09-15 10:29:16
232	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S20.	2	\N	2026-09-16 13:20:38	2026-09-16 13:20:27	2026-09-16 13:20:38	\N	2	2026-09-16 13:20:38
247	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S25.	2	\N	\N	2026-09-16 13:43:15	2026-09-16 13:43:15	\N	2	2026-09-16 13:43:15
262	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan dari Slot S15 meminta bantuan petugas untuk tap-out manual.	\N	\N	\N	2026-10-05 10:16:32	2026-10-05 10:16:32	503	\N	\N
218	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S9 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:29:04	2026-09-15 10:28:51	2026-09-15 10:29:04	422	8	2026-09-15 10:29:04
233	violation	Pelanggaran Lokasi!	Plat S12-UNKNOWN parkir di S31 (Seharusnya di S12).	\N	\N	2026-09-16 13:21:40	2026-09-16 13:21:30	2026-09-16 13:21:40	450	2	2026-09-16 13:21:40
248	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S31 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-09-16 13:44:15	2026-09-16 13:43:52	2026-09-16 13:44:15	450	2	2026-09-16 13:44:15
263	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S33 (Seharusnya di S27).	\N	\N	2026-10-05 10:16:52	2026-10-05 10:16:52	2026-10-05 10:16:52	511	72	2026-10-05 10:16:52
219	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:42:51	2026-09-15 10:42:09	2026-09-15 10:42:51	423	8	2026-09-15 10:42:51
234	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S31.	2	\N	\N	2026-09-16 13:21:40	2026-09-16 13:21:40	\N	2	2026-09-16 13:21:40
249	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S12 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-09-16 13:58:19	2026-09-16 13:57:55	2026-09-16 13:58:19	459	2	2026-09-16 13:58:19
264	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S29 meminta bantuan petugas untuk tap-out manual.	\N	\N	\N	2026-10-05 10:16:52	2026-10-05 10:16:52	512	\N	\N
220	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:48:52	2026-09-15 10:48:23	2026-09-15 10:48:52	424	8	2026-09-15 10:48:52
235	violation	Pelanggaran Lokasi!	Plat B 3631 parkir di S6 (Seharusnya di S12).	\N	\N	2026-09-16 13:25:24	2026-09-16 13:24:54	2026-09-16 13:25:24	451	2	2026-09-16 13:25:24
250	violation	Pelanggaran Lokasi!	Plat B 1686 parkir di S29 (Seharusnya di S12).	\N	\N	2026-09-16 15:27:53	2026-09-16 15:27:14	2026-09-16 15:27:53	460	2	2026-09-16 15:27:53
265	info	Slot Overriden	Staff memindahkan transaksi dari S27 ke S33.	72	\N	2026-10-05 10:16:52	2026-10-05 10:16:52	2026-10-05 10:16:52	\N	72	2026-10-05 10:16:52
2	info	Slot Overriden	Staff memindahkan transaksi dari S21 ke S3.	2	\N	2026-08-19 14:55:15	2026-08-19 14:25:17	2026-08-19 14:55:15	\N	\N	\N
1	info	Slot Overriden	Staff memindahkan transaksi dari S3 ke S21.	2	\N	2026-08-19 14:55:19	2026-08-19 14:20:48	2026-08-19 14:55:19	\N	\N	\N
54	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S34.	2	\N	2026-08-20 11:21:27	2026-08-20 11:21:19	2026-08-20 11:21:27	\N	\N	\N
77	info	[ESKALASI ADMIN] Slot Overriden	Staff memindahkan transaksi dari S12 ke S7.	\N	\N	2026-08-20 16:11:28	2026-08-20 16:11:23	2026-08-21 09:32:00	\N	\N	\N
88	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S16.	2	\N	2026-08-21 09:41:54	2026-08-21 09:41:46	2026-08-21 09:41:54	\N	\N	\N
92	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S3.	2	\N	2026-08-21 09:47:37	2026-08-21 09:47:18	2026-08-21 09:47:37	\N	\N	\N
9	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S16.	2	\N	2026-08-19 15:39:59	2026-08-19 15:39:37	2026-08-19 15:39:59	\N	\N	\N
11	info	Slot Overriden	Staff memindahkan transaksi dari S16 ke S15.	2	\N	2026-08-19 15:46:20	2026-08-19 15:40:25	2026-08-19 15:46:20	\N	\N	\N
15	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S14.	2	\N	2026-08-19 16:05:18	2026-08-19 15:51:40	2026-08-19 16:05:18	\N	\N	\N
17	info	Slot Overriden	Staff memindahkan transaksi dari S9 ke S23.	2	\N	2026-08-19 16:05:19	2026-08-19 16:03:50	2026-08-19 16:05:19	\N	\N	\N
13	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S14.	2	\N	2026-08-19 16:05:21	2026-08-19 15:46:34	2026-08-19 16:05:21	\N	\N	\N
221	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 10:48:52	2026-09-15 10:48:38	2026-09-15 10:48:52	424	8	2026-09-15 10:48:52
236	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S6.	2	\N	\N	2026-09-16 13:25:24	2026-09-16 13:25:24	\N	2	2026-09-16 13:25:24
19	info	Slot Overriden	Staff memindahkan transaksi dari S9 ke S21.	2	\N	2026-08-19 16:17:17	2026-08-19 16:11:42	2026-08-19 16:17:17	\N	\N	\N
21	info	Slot Overriden	Staff memindahkan transaksi dari S9 ke S25.	2	\N	2026-08-19 16:17:17	2026-08-19 16:14:44	2026-08-19 16:17:17	\N	\N	\N
251	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S29.	2	\N	\N	2026-09-16 15:27:53	2026-09-16 15:27:53	\N	2	2026-09-16 15:27:53
23	info	Slot Overriden	Staff memindahkan transaksi dari S9 ke S31.	2	\N	2026-08-19 16:28:10	2026-08-19 16:27:40	2026-08-19 16:28:10	\N	\N	\N
25	info	Slot Overriden	Staff memindahkan transaksi dari S13 ke S25.	2	\N	2026-08-19 16:30:55	2026-08-19 16:29:38	2026-08-19 16:30:55	\N	\N	\N
26	info	Slot Overriden	Staff memindahkan transaksi dari S9 ke S24.	2	\N	2026-08-19 16:30:55	2026-08-19 16:29:50	2026-08-19 16:30:55	\N	\N	\N
28	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S33.	2	\N	2026-08-19 16:59:29	2026-08-19 16:56:07	2026-08-19 16:59:29	\N	\N	\N
266	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan dari Slot S29 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-10-13 15:49:21	2026-10-05 10:16:52	2026-10-13 15:49:21	512	\N	\N
30	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S19.	2	\N	2026-08-19 17:14:32	2026-08-19 17:01:27	2026-08-19 17:14:32	\N	\N	\N
32	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S12.	2	\N	2026-08-19 17:14:32	2026-08-19 17:02:19	2026-08-19 17:14:32	\N	\N	\N
34	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S36.	2	\N	2026-08-19 17:19:55	2026-08-19 17:14:47	2026-08-19 17:19:55	\N	\N	\N
36	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S25.	2	\N	2026-08-19 17:19:55	2026-08-19 17:19:33	2026-08-19 17:19:55	\N	\N	\N
38	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S35.	2	\N	2026-08-20 10:06:58	2026-08-20 10:06:47	2026-08-20 10:06:58	\N	\N	\N
56	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S22.	2	\N	2026-08-20 11:22:57	2026-08-20 11:22:22	2026-08-20 11:22:57	\N	\N	\N
58	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S24.	2	\N	2026-08-20 11:28:42	2026-08-20 11:26:55	2026-08-20 11:28:42	\N	\N	\N
60	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S35.	8	\N	2026-08-20 13:35:06	2026-08-20 13:34:57	2026-08-20 13:35:06	\N	\N	\N
76	info	[ESKALASI ADMIN] Slot Overriden	Staff memindahkan transaksi dari S12 ke S7.	\N	\N	2026-08-20 16:07:39	2026-08-20 16:07:30	2026-08-21 09:32:00	\N	\N	\N
65	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S4.	2	\N	2026-08-20 13:43:41	2026-08-20 13:43:36	2026-08-20 13:43:41	\N	\N	\N
78	info	[ESKALASI ADMIN] Slot Overriden	Staff memindahkan transaksi dari S12 ke S7.	\N	\N	2026-08-20 16:11:53	2026-08-20 16:11:45	2026-08-21 09:32:00	\N	\N	\N
67	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S27.	2	\N	2026-08-20 14:17:20	2026-08-20 14:17:13	2026-08-20 14:17:20	\N	\N	\N
222	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-15 17:02:34	2026-09-15 17:02:16	2026-09-15 17:02:34	430	2	2026-09-15 17:02:34
79	info	[ESKALASI ADMIN] Slot Overriden	Staff memindahkan transaksi dari S12 ke S7.	\N	\N	2026-08-20 16:12:13	2026-08-20 16:12:07	2026-08-21 09:32:00	\N	\N	\N
237	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S11.	2	\N	\N	2026-09-16 13:25:30	2026-09-16 13:25:30	\N	2	2026-09-16 13:25:30
252	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S26 (Seharusnya di S12).	\N	\N	2026-09-16 15:32:08	2026-09-16 15:28:21	2026-09-16 15:32:08	461	2	2026-09-16 15:32:08
75	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S7.	8	\N	2026-08-20 16:07:18	2026-08-20 16:06:56	2026-08-20 16:07:18	\N	\N	\N
267	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S9 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-10-13 15:50:44	2026-10-13 15:49:52	2026-10-13 15:50:44	521	2	2026-10-13 15:50:44
223	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S10 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-09-15 17:21:17	2026-09-15 17:20:41	2026-09-15 17:21:17	432	2	2026-09-15 17:21:17
238	violation	Pelanggaran Lokasi!	Plat B 5226 parkir di S14 (Seharusnya di S12).	\N	\N	2026-09-16 13:40:34	2026-09-16 13:38:14	2026-09-16 13:40:34	453	2	2026-09-16 13:40:34
253	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S26.	2	\N	\N	2026-09-16 15:32:08	2026-09-16 15:32:08	\N	2	2026-09-16 15:32:08
268	violation	Pelanggaran Lokasi!	Plat B 1927 parkir di S27 (Seharusnya di S9).	\N	\N	2026-10-14 13:55:33	2026-10-14 13:54:59	2026-10-14 13:55:33	523	2	2026-10-14 13:55:33
150	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S36 (Seharusnya di S4).	\N	\N	2026-08-28 15:26:52	2026-08-28 15:26:52	2026-08-28 15:26:52	264	33	2026-08-28 15:26:52
101	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S28 (Seharusnya di S10).	\N	\N	2026-08-23 11:44:35	2026-08-23 11:43:29	2026-08-23 11:44:35	197	2	2026-08-23 11:44:35
147	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S17 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:15	2026-08-28 15:24:41	2026-08-28 15:41:15	254	2	2026-08-28 15:41:15
87	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S16 (Seharusnya di S10).	\N	\N	2026-08-21 09:41:46	2026-08-21 09:41:22	2026-08-21 09:41:46	180	2	2026-08-21 09:41:46
107	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S24.	2	\N	2026-08-24 18:58:41	2026-08-24 18:58:34	2026-08-24 18:58:41	\N	2	2026-08-24 18:58:41
89	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S3 (Seharusnya di S10).	\N	\N	2026-08-21 09:47:18	2026-08-21 09:46:26	2026-08-21 09:47:18	181	2	2026-08-21 09:47:18
91	violation	[ESKALASI ADMIN] Pelanggaran Lokasi!	Plat K 141 KU parkir di S3 (Seharusnya di S10).	\N	\N	2026-08-21 09:47:18	2026-08-21 09:47:06	2026-08-21 09:47:18	181	2	2026-08-21 09:47:18
154	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S36 (Seharusnya di S3).	\N	\N	2026-08-28 15:27:51	2026-08-28 15:27:50	2026-08-28 15:27:51	272	35	2026-08-28 15:27:51
156	info	Slot Overriden	Staff memindahkan transaksi dari S3 ke S36.	35	\N	2026-08-28 15:27:51	2026-08-28 15:27:51	2026-08-28 15:27:51	\N	35	2026-08-28 15:27:51
158	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S22 (Seharusnya di S2).	\N	\N	2026-08-28 15:29:09	2026-08-28 15:29:09	2026-08-28 15:29:09	280	37	2026-08-28 15:29:09
145	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S16 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:42:07	2026-08-28 15:04:06	2026-08-28 15:42:07	246	2	2026-08-28 15:42:07
106	violation	[ESKALASI ADMIN] Pelanggaran Lokasi!	Plat K 141 KU parkir di S24 (Seharusnya di S10).	\N	\N	2026-08-24 18:58:34	2026-08-24 18:58:18	2026-08-24 18:58:34	203	2	2026-08-24 18:58:34
90	violation	[ESKALASI ADMIN] Pelanggaran Lokasi!	Plat K 141 KU parkir di S3 (Seharusnya di S10).	\N	\N	2026-08-21 09:47:18	2026-08-21 09:46:39	2026-08-21 09:47:18	181	2	2026-08-21 09:47:18
108	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S9 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-24 19:27:43	2026-08-24 19:26:14	2026-08-24 19:27:43	205	2	2026-08-24 19:27:43
96	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-21 14:23:49	2026-08-21 14:23:00	2026-08-21 14:23:49	192	2	2026-08-21 14:23:49
98	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S8 (Seharusnya di S12).	\N	\N	2026-08-21 15:46:42	2026-08-21 15:45:19	2026-08-21 15:46:42	194	2	2026-08-21 15:46:42
100	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S8.	2	\N	2026-08-21 15:48:27	2026-08-21 15:46:42	2026-08-21 15:48:27	\N	2	2026-08-21 15:48:27
126	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S21 (Seharusnya di S10).	\N	\N	2026-08-28 14:56:18	2026-08-28 14:56:18	2026-08-28 14:56:18	221	16	2026-08-28 14:56:18
102	violation	[ESKALASI ADMIN] Pelanggaran Lokasi!	Plat K 141 KU parkir di S28 (Seharusnya di S10).	\N	\N	2026-08-23 11:44:35	2026-08-23 11:44:14	2026-08-23 11:44:35	197	2	2026-08-23 11:44:35
110	violation	[ESKALASI ADMIN] Pelanggaran Lokasi!	Plat K 141 KU parkir di S29 (Seharusnya di S13).	\N	\N	2026-08-24 19:58:42	2026-08-24 19:58:07	2026-08-24 19:58:42	206	2	2026-08-24 19:58:42
104	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-24 18:56:57	2026-08-24 18:56:17	2026-08-24 18:56:57	201	2	2026-08-24 18:56:57
118	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-26 11:14:10	2026-08-26 11:13:25	2026-08-26 11:14:10	212	2	2026-08-26 11:14:10
112	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S32 (Seharusnya di S13).	\N	\N	2026-08-24 20:01:44	2026-08-24 20:01:19	2026-08-24 20:01:44	208	2	2026-08-24 20:01:44
114	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S2 (Seharusnya di S11).	\N	\N	2026-08-25 11:11:53	2026-08-24 20:22:43	2026-08-25 11:11:53	209	2	2026-08-25 11:11:53
116	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-26 11:11:58	2026-08-26 11:11:09	2026-08-26 11:11:58	210	8	2026-08-26 11:11:58
128	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S21.	16	\N	2026-08-28 14:56:19	2026-08-28 14:56:18	2026-08-28 14:56:19	\N	16	2026-08-28 14:56:19
122	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S32 (Seharusnya di S12).	\N	\N	2026-08-26 11:53:36	2026-08-26 11:52:49	2026-08-26 11:53:36	215	8	2026-08-26 11:53:36
124	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S28 (Seharusnya di S12).	\N	\N	2026-08-26 12:02:57	2026-08-26 12:02:39	2026-08-26 12:02:57	218	8	2026-08-26 12:02:57
130	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S16 (Seharusnya di S10).	\N	\N	2026-08-28 14:57:47	2026-08-28 14:57:47	2026-08-28 14:57:47	225	19	2026-08-28 14:57:47
134	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S2 (Seharusnya di S10).	\N	\N	2026-08-28 14:59:54	2026-08-28 14:59:53	2026-08-28 14:59:54	229	21	2026-08-28 14:59:54
136	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S2.	21	\N	2026-08-28 14:59:54	2026-08-28 14:59:54	2026-08-28 14:59:54	\N	21	2026-08-28 14:59:54
138	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S21 (Seharusnya di S28).	\N	\N	2026-08-28 15:03:45	2026-08-28 15:03:45	2026-08-28 15:03:45	237	23	2026-08-28 15:03:45
140	info	Slot Overriden	Staff memindahkan transaksi dari S28 ke S21.	23	\N	2026-08-28 15:03:45	2026-08-28 15:03:45	2026-08-28 15:03:45	\N	23	2026-08-28 15:03:45
206	violation	Pelanggaran Lokasi!	Plat EA 1559 Uz parkir di S27 (Seharusnya di S10).	\N	\N	2026-09-14 11:02:07	2026-09-14 11:01:24	2026-09-14 11:02:07	375	8	2026-09-14 11:02:07
207	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S36 (Seharusnya di S12).	\N	\N	2026-09-14 11:02:19	2026-09-14 11:01:46	2026-09-14 11:02:19	376	8	2026-09-14 11:02:19
208	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S36.	8	\N	2026-09-14 11:02:31	2026-09-14 11:02:07	2026-09-14 11:02:31	\N	8	2026-09-14 11:02:31
142	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S4 (Seharusnya di S27).	\N	\N	2026-08-28 15:04:06	2026-08-28 15:04:06	2026-08-28 15:04:06	245	25	2026-08-28 15:04:06
148	info	Slot Overriden	Staff memindahkan transaksi dari S26 ke S3.	29	\N	2026-08-28 15:24:42	2026-08-28 15:24:41	2026-08-28 15:24:42	\N	29	2026-08-28 15:24:42
132	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S16.	19	\N	2026-08-28 15:41:32	2026-08-28 14:57:47	2026-08-28 15:41:32	\N	2	2026-08-28 15:41:32
93	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-21 09:49:25	2026-08-21 09:48:45	2026-08-21 09:49:25	182	2	2026-08-21 09:49:25
109	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S29 (Seharusnya di S13).	\N	\N	2026-08-24 19:58:42	2026-08-24 19:56:08	2026-08-24 19:58:42	206	2	2026-08-24 19:58:42
74	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S7 (Seharusnya di S12).	\N	\N	2026-08-20 16:06:56	2026-08-20 16:06:23	2026-08-21 09:32:00	175	8	2026-08-20 16:06:56
111	info	Slot Overriden	Staff memindahkan transaksi dari S13 ke S29.	2	\N	2026-08-24 19:58:49	2026-08-24 19:58:42	2026-08-24 19:58:49	\N	2	2026-08-24 19:58:49
97	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-21 15:41:18	2026-08-21 15:40:53	2026-08-21 15:41:18	193	2	2026-08-21 15:41:18
99	violation	[ESKALASI ADMIN] Pelanggaran Lokasi!	Plat K 141 KU parkir di S8 (Seharusnya di S12).	\N	\N	2026-08-21 15:46:42	2026-08-21 15:45:56	2026-08-21 15:46:42	194	2	2026-08-21 15:46:42
113	info	Slot Overriden	Staff memindahkan transaksi dari S13 ke S32.	2	\N	2026-08-24 20:04:53	2026-08-24 20:01:44	2026-08-24 20:04:53	\N	2	2026-08-24 20:04:53
103	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S28.	2	\N	2026-08-24 11:18:18	2026-08-23 11:44:35	2026-08-24 11:18:18	\N	2	2026-08-24 11:18:18
105	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S24 (Seharusnya di S10).	\N	\N	2026-08-24 18:58:34	2026-08-24 18:57:49	2026-08-24 18:58:34	203	2	2026-08-24 18:58:34
115	info	Slot Overriden	Staff memindahkan transaksi dari S11 ke S2.	2	\N	2026-08-26 11:10:39	2026-08-25 11:11:53	2026-08-26 11:10:39	\N	2	2026-08-26 11:10:39
81	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S28 (Seharusnya di S10).	\N	\N	2026-08-20 16:17:59	2026-08-20 16:17:40	2026-08-21 09:32:00	176	8	2026-08-20 16:17:59
117	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S26 (Seharusnya di S12).	\N	\N	2026-08-26 11:13:54	2026-08-26 11:12:52	2026-08-26 11:13:54	211	8	2026-08-26 11:13:54
119	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S26.	8	\N	2026-08-26 11:14:16	2026-08-26 11:13:54	2026-08-26 11:14:16	\N	2	2026-08-26 11:14:16
123	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S32.	8	\N	2026-08-26 11:53:41	2026-08-26 11:53:36	2026-08-26 11:53:41	\N	8	2026-08-26 11:53:41
125	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S28.	8	\N	2026-08-26 13:39:31	2026-08-26 12:02:57	2026-08-26 13:39:31	\N	8	2026-08-26 13:39:31
146	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S3 (Seharusnya di S26).	\N	\N	2026-08-28 15:24:41	2026-08-28 15:24:41	2026-08-28 15:24:41	253	29	2026-08-28 15:24:41
143	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S16 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:42:07	2026-08-28 15:04:06	2026-08-28 15:42:07	246	2	2026-08-28 15:42:07
131	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S13 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:34	2026-08-28 14:57:47	2026-08-28 15:44:34	226	2	2026-08-28 15:44:34
129	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S11 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:51	2026-08-28 14:56:19	2026-08-28 15:44:51	222	2	2026-08-28 15:44:51
139	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S7 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:43:17	2026-08-28 15:03:45	2026-08-28 15:43:17	238	2	2026-08-28 15:43:17
141	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S7 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:43:17	2026-08-28 15:03:46	2026-08-28 15:43:17	238	2	2026-08-28 15:43:17
135	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S14 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:06	2026-08-28 14:59:54	2026-08-28 15:44:06	230	2	2026-08-28 15:44:06
137	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S14 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:06	2026-08-28 14:59:54	2026-08-28 15:44:06	230	2	2026-08-28 15:44:06
133	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S13 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:34	2026-08-28 14:57:48	2026-08-28 15:44:34	226	2	2026-08-28 15:44:34
127	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S11 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:51	2026-08-28 14:56:18	2026-08-28 15:44:51	222	2	2026-08-28 15:44:51
149	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S17 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:15	2026-08-28 15:24:42	2026-08-28 15:41:15	254	2	2026-08-28 15:41:15
157	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S35 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:40:50	2026-08-28 15:27:51	2026-08-28 15:40:50	273	2	2026-08-28 15:40:50
155	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S35 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:40:50	2026-08-28 15:27:51	2026-08-28 15:40:50	273	2	2026-08-28 15:40:50
152	info	Slot Overriden	Staff memindahkan transaksi dari S4 ke S36.	33	\N	2026-08-28 15:41:18	2026-08-28 15:26:52	2026-08-28 15:41:18	\N	2	2026-08-28 15:41:18
151	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S24 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:01	2026-08-28 15:26:52	2026-08-28 15:41:01	265	2	2026-08-28 15:41:01
153	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S24 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:01	2026-08-28 15:26:52	2026-08-28 15:41:01	265	2	2026-08-28 15:41:01
159	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S21 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:28	2026-08-28 15:29:09	2026-08-28 15:41:28	281	2	2026-08-28 15:41:28
161	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S21 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:28	2026-08-28 15:29:10	2026-08-28 15:41:28	281	2	2026-08-28 15:41:28
162	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S21 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:28	2026-08-28 15:30:04	2026-08-28 15:41:28	281	2	2026-08-28 15:41:28
163	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S21 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:28	2026-08-28 15:30:36	2026-08-28 15:41:28	281	2	2026-08-28 15:41:28
164	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S21 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:28	2026-08-28 15:33:03	2026-08-28 15:41:28	281	2	2026-08-28 15:41:28
165	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S21 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:28	2026-08-28 15:33:19	2026-08-28 15:41:28	281	2	2026-08-28 15:41:28
166	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S21 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:41:28	2026-08-28 15:35:39	2026-08-28 15:41:28	281	2	2026-08-28 15:41:28
144	info	Slot Overriden	Staff memindahkan transaksi dari S27 ke S4.	25	\N	2026-08-28 15:41:32	2026-08-28 15:04:06	2026-08-28 15:41:32	\N	2	2026-08-28 15:41:32
160	info	Slot Overriden	Staff memindahkan transaksi dari S2 ke S22.	37	\N	2026-08-28 15:41:32	2026-08-28 15:29:09	2026-08-28 15:41:32	\N	2	2026-08-28 15:41:32
167	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S16 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:42:07	2026-08-28 15:41:58	2026-08-28 15:42:07	246	2	2026-08-28 15:42:07
190	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S28 (Seharusnya di S12).	\N	\N	2026-09-11 14:42:00	2026-09-11 14:41:42	2026-09-11 14:42:00	346	2	2026-09-11 14:42:00
169	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S7 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:43:17	2026-08-28 15:43:05	2026-08-28 15:43:17	238	2	2026-08-28 15:43:17
170	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S14 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:06	2026-08-28 15:43:44	2026-08-28 15:44:06	230	2	2026-08-28 15:44:06
185	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-04 10:05:13	2026-09-04 10:03:59	2026-09-04 10:05:13	320	2	2026-09-04 10:05:13
171	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S13 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:34	2026-08-28 15:44:13	2026-08-28 15:44:34	226	2	2026-08-28 15:44:34
172	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S11 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:44:51	2026-08-28 15:44:42	2026-08-28 15:44:51	222	2	2026-08-28 15:44:51
174	violation	Pelanggaran Lokasi!	Plat B9999VIOL parkir di S35 (Seharusnya di S10).	\N	\N	2026-08-28 15:51:28	2026-08-28 15:51:27	2026-08-28 15:51:28	288	49	2026-08-28 15:51:28
176	info	Slot Overriden	Staff memindahkan transaksi dari S10 ke S35.	49	\N	2026-08-28 15:51:28	2026-08-28 15:51:28	2026-08-28 15:51:28	\N	49	2026-08-28 15:51:28
175	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S13 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:52:39	2026-08-28 15:51:28	2026-08-28 15:52:39	289	2	2026-08-28 15:52:39
177	manual_tapout_request	[ESKALASI ADMIN] Permintaan Tap-Out Manual	Kendaraan di Slot S13 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-08-28 15:52:39	2026-08-28 15:51:29	2026-08-28 15:52:39	289	2	2026-08-28 15:52:39
191	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S28.	2	\N	2026-09-11 14:42:21	2026-09-11 14:42:00	2026-09-11 14:42:21	\N	2	2026-09-11 14:42:21
186	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S32 (Seharusnya di S12).	\N	\N	2026-09-08 17:04:11	2026-09-08 17:03:44	2026-09-08 17:04:11	340	2	2026-09-08 17:04:11
178	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-03 11:10:10	2026-09-03 11:09:02	2026-09-03 11:10:10	\N	2	2026-09-03 11:10:10
179	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-03 11:11:02	2026-09-03 11:10:45	2026-09-03 11:11:02	\N	2	2026-09-03 11:11:02
180	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-03 11:25:08	2026-09-03 11:24:51	2026-09-03 11:25:08	\N	2	2026-09-03 11:25:08
181	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-03 13:20:11	2026-09-03 13:19:50	2026-09-03 13:20:11	\N	2	2026-09-03 13:20:11
187	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S32.	2	\N	2026-09-08 17:04:16	2026-09-08 17:04:11	2026-09-08 17:04:16	\N	2	2026-09-08 17:04:16
182	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-03 13:28:54	2026-09-03 13:28:30	2026-09-03 13:28:54	318	2	2026-09-03 13:28:54
183	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S27 (Seharusnya di S12).	\N	\N	2026-09-03 13:32:45	2026-09-03 13:31:22	2026-09-03 13:32:45	319	2	2026-09-03 13:32:45
184	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S27.	2	\N	2026-09-03 13:32:49	2026-09-03 13:32:45	2026-09-03 13:32:49	\N	2	2026-09-03 13:32:49
198	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S7.	2	\N	2026-09-11 15:58:28	2026-09-11 15:57:10	2026-09-11 15:58:28	\N	2	2026-09-11 15:58:28
188	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-11 14:35:52	2026-09-11 14:34:53	2026-09-11 14:35:52	343	2	2026-09-11 14:35:52
189	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-11 14:35:52	2026-09-11 14:35:38	2026-09-11 14:35:52	343	2	2026-09-11 14:35:52
194	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S17 (Seharusnya di S12).	\N	\N	2026-09-11 15:39:05	2026-09-11 15:38:38	2026-09-11 15:39:05	351	2	2026-09-11 15:39:05
201	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S7 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-11 16:05:37	2026-09-11 16:05:11	2026-09-11 16:05:37	352	2	2026-09-11 16:05:37
196	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S7 (Seharusnya di S12).	\N	\N	2026-09-11 15:57:10	2026-09-11 15:56:23	2026-09-11 15:57:10	352	2	2026-09-11 15:57:10
197	violation	[ESKALASI ADMIN] Pelanggaran Lokasi!	Plat K 141 KU parkir di S7 (Seharusnya di S12).	\N	\N	2026-09-11 15:57:10	2026-09-11 15:56:57	2026-09-11 15:57:10	352	2	2026-09-11 15:57:10
199	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-11 16:04:35	2026-09-11 15:59:07	2026-09-11 16:04:35	354	2	2026-09-11 16:04:35
200	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S10 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-11 16:04:35	2026-09-11 16:04:06	2026-09-11 16:04:35	354	2	2026-09-11 16:04:35
202	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan di Slot S12 meminta bantuan petugas untuk tap-out manual (plat tidak terbaca).	\N	\N	2026-09-11 16:07:31	2026-09-11 16:07:11	2026-09-11 16:07:31	356	2	2026-09-11 16:07:31
204	violation	Pelanggaran Lokasi!	Plat K 141 KU parkir di S30 (Seharusnya di S12).	\N	\N	2026-09-14 10:48:30	2026-09-14 10:47:59	2026-09-14 10:48:30	374	2	2026-09-14 10:48:30
205	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S30.	2	\N	2026-09-14 10:48:46	2026-09-14 10:48:30	2026-09-14 10:48:46	\N	8	2026-09-14 10:48:46
209	info	Slot Overriden	Staff memindahkan transaksi dari S12 ke S27.	8	\N	2026-09-14 11:02:31	2026-09-14 11:02:19	2026-09-14 11:02:31	\N	8	2026-09-14 11:02:31
269	info	Slot Overriden	Staff memindahkan transaksi dari S9 ke S27.	2	\N	\N	2026-10-14 13:55:33	2026-10-14 13:55:33	\N	2	2026-10-14 13:55:33
224	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S12 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-09-16 10:24:37	2026-09-16 10:23:57	2026-09-16 10:24:37	434	2	2026-09-16 10:24:37
239	violation	Pelanggaran Lokasi!	Plat B 7794 parkir di S29 (Seharusnya di S10).	\N	\N	2026-09-16 13:40:41	2026-09-16 13:38:26	2026-09-16 13:40:41	454	2	2026-09-16 13:40:41
254	manual_tapout_request	Permintaan Tap-Out Manual	Kendaraan dari Slot S29 meminta bantuan petugas untuk tap-out manual.	\N	\N	2026-09-16 15:49:21	2026-09-16 15:37:09	2026-09-16 15:49:21	460	\N	\N
\.


--
-- Data for Name: parking_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_slots (id, slot_code, status, roi_coordinates, created_at, updated_at, x_coord, y_coord, deleted_at) FROM stdin;
81	S36	available	\N	2026-07-22 16:39:16	2026-09-14 17:03:16	45	5	\N
73	S35	available	\N	2026-07-22 16:19:20	2026-09-14 17:03:17	42.5	5	\N
78	S5	available	\N	2026-07-22 16:23:15	2026-09-14 17:03:42	12.5	11	\N
59	S21	available	\N	2026-07-22 16:19:20	2026-09-14 17:04:17	52.5	11	\N
75	S2	available	\N	2026-07-22 16:23:15	2026-09-16 13:48:57	5	11	\N
62	S24	available	\N	2026-07-22 16:19:20	2026-10-05 10:16:32	15	5	\N
47	S9	available	\N	2026-07-22 16:19:20	2026-10-16 19:28:50	22.5	11	\N
65	S27	available	\N	2026-07-22 16:19:20	2026-10-16 19:29:05	22.5	5	\N
71	S33	available	\N	2026-07-22 16:19:20	2026-10-05 10:16:52	37.5	5	\N
50	S12	maintenance	\N	2026-07-22 16:19:20	2026-09-30 10:41:05	30	11	\N
66	S28	available	\N	2026-07-22 16:19:20	2026-10-05 10:17:54	25	5	\N
52	S14	available	\N	2026-07-22 16:19:20	2026-10-05 10:18:08	35	11	\N
54	S16	available	\N	2026-07-22 16:19:20	2026-10-05 10:18:10	40	11	\N
53	S15	available	\N	2026-07-22 16:19:20	2026-10-05 10:18:12	37.5	11	\N
72	S34	maintenance	\N	2026-07-22 16:19:20	2026-08-21 14:07:08	40	5	\N
49	S11	available	\N	2026-07-22 16:19:20	2026-10-14 14:27:13	27.5	11	\N
74	S1	available	\N	2026-07-22 16:23:15	2026-09-14 17:02:57	2.5	11	\N
76	S3	available	\N	2026-07-22 16:23:15	2026-09-14 17:03:02	7.5	11	\N
85	S187	available	\N	2026-09-11 15:52:23	2026-09-11 15:52:41	43.5	5	2026-09-11 15:52:41
80	S7	available	\N	2026-07-22 16:23:15	2026-10-05 10:17:51	17.5	11	\N
68	S30	available	\N	2026-07-22 16:19:20	2026-10-05 10:17:58	30	5	\N
69	S31	available	\N	2026-07-22 16:19:20	2026-10-05 10:18:02	32.5	5	\N
67	S29	available	\N	2026-07-22 16:19:20	2026-10-05 10:18:05	27.5	5	\N
46	S8	available	\N	2026-07-22 16:19:20	2026-10-05 10:18:20	20	11	\N
70	S32	available	\N	2026-07-22 16:19:20	2026-09-16 13:16:21	35	5	\N
51	S13	maintenance	\N	2026-07-22 16:19:20	2026-09-30 10:41:11	32.5	11	\N
58	S20	available	\N	2026-07-22 16:19:20	2026-10-14 15:25:14	50	11	\N
84	S37	available	\N	2026-08-21 10:23:26	2026-10-15 16:15:40	44	8	2026-10-15 16:15:40
48	S10	occupied	\N	2026-07-22 16:19:20	2026-10-16 19:45:04	25	11	\N
60	S22	available	\N	2026-07-22 16:19:20	2026-09-14 17:03:39	10	5	\N
63	S25	available	\N	2026-07-22 16:19:20	2026-09-16 13:49:05	17.5	5	\N
55	S17	available	\N	2026-07-22 16:19:20	2026-09-14 17:04:08	42.5	11	\N
56	S18	available	\N	2026-07-22 16:19:20	2026-09-14 17:04:11	45	11	\N
57	S19	available	\N	2026-07-22 16:19:20	2026-09-14 17:04:13	47.5	11	\N
61	S23	available	\N	2026-07-22 16:19:20	2026-09-16 13:49:07	12.5	5	\N
79	S6	available	\N	2026-07-22 16:23:15	2026-09-16 13:49:19	15	11	\N
77	S4	maintenance	\N	2026-07-22 16:23:15	2026-09-15 10:55:17	10	11	\N
64	S26	available	\N	2026-07-22 16:19:20	2026-09-16 15:47:27	20	5	\N
\.


--
-- Data for Name: parking_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_transactions (id, card_id, plate_number, parking_slot_id, entry_time, exit_time, is_violation, created_at, updated_at, duration_minutes, fee, revenue_config_id, customer_id, is_member, detected_slot_id, requires_manual_verification) FROM stdin;
408	TCK-LWPBP9BR	B 7949	76	2026-09-14 17:02:28	2026-09-14 17:03:02	f	2026-09-14 17:02:28	2026-09-14 17:03:02	1	4000	2	\N	f	\N	f
383	TCK-SQGGJROL	B 3582	50	2026-09-14 17:01:23	2026-09-14 17:03:57	f	2026-09-14 17:01:23	2026-09-14 17:03:57	3	4000	2	\N	f	\N	f
433	TCK-UDOYKD7D	B 5787	50	2026-09-16 09:50:11	2026-09-16 09:50:37	f	2026-09-16 09:50:11	2026-09-16 09:50:37	1	4000	2	\N	f	\N	f
476	TCK-O9FIVSFE	K 141 KU	50	2026-09-24 10:45:44	2026-09-24 10:48:39	f	2026-09-24 10:45:44	2026-09-24 10:48:39	3	0	2	1	t	\N	f
458	TCK-MZ9ULQ1U	B 8428	63	2026-09-16 13:42:55	2026-09-16 13:49:05	f	2026-09-16 13:42:55	2026-09-16 13:49:05	7	4000	2	\N	f	\N	f
501	TCK-9QABXDZY	B5678TEST	68	2026-10-05 10:16:31	2026-10-05 10:17:58	f	2026-10-05 10:16:31	2026-10-05 10:17:58	2	4001	3	\N	f	68	f
526	TCK-KNLLYMVO	B 6402	47	2026-10-14 14:23:07	2026-10-14 14:25:55	f	2026-10-14 14:23:07	2026-10-14 14:25:55	3	4000	4	\N	f	\N	f
384	TCK-QFAFQQ2V	B 3461	48	2026-09-14 17:01:25	2026-09-14 17:03:53	f	2026-09-14 17:01:25	2026-09-14 17:03:53	3	4000	2	\N	f	\N	f
409	TCK-HPMFXCTU	B 2878	57	2026-09-14 17:02:30	2026-09-14 17:04:13	f	2026-09-14 17:02:30	2026-09-14 17:04:13	2	4000	2	\N	f	\N	f
434	TCK-H0WN0NJP	B 343 JJK	50	2026-09-16 10:11:03	2026-09-16 10:24:37	f	2026-09-16 10:11:03	2026-09-16 10:24:37	14	4000	2	\N	f	\N	t
477	TCK-EILJZ6SO	B 9243	48	2026-09-24 10:47:29	2026-09-24 10:51:56	f	2026-09-24 10:47:29	2026-09-24 10:51:56	5	4000	2	\N	f	\N	f
459	TCK-OUI4GOIA	K 141 KU	50	2026-09-16 13:57:49	2026-09-16 13:58:19	f	2026-09-16 13:57:49	2026-09-16 13:58:19	1	4000	2	\N	f	\N	t
502	TCK-GC58AFFU	B9999VIOL	62	2026-10-05 10:16:31	2026-10-05 10:16:32	f	2026-10-05 10:16:31	2026-10-05 10:16:32	1	4001	3	\N	f	\N	f
527	TCK-9IN5HYHC	B 9864	47	2026-10-14 14:26:18	2026-10-14 14:26:28	f	2026-10-14 14:26:18	2026-10-14 14:26:28	1	4000	4	\N	f	\N	f
410	TCK-6H5PFVWV	B 5938	73	2026-09-14 17:02:31	2026-09-14 17:03:17	f	2026-09-14 17:02:31	2026-09-14 17:03:17	1	4000	2	\N	f	\N	f
385	TCK-ES74WJPJ	B 1885	47	2026-09-14 17:01:28	2026-09-14 17:03:50	f	2026-09-14 17:01:28	2026-09-14 17:03:50	3	4000	2	\N	f	\N	f
435	TCK-XLCJQXFY	B 4189	48	2026-09-16 10:22:22	2026-09-16 10:25:03	f	2026-09-16 10:22:22	2026-09-16 10:25:03	3	4000	2	\N	f	\N	f
478	TCK-R5OOB2LC	K 141 KU	50	2026-09-24 10:48:51	2026-09-24 10:50:53	f	2026-09-24 10:48:51	2026-09-24 10:50:53	3	0	2	1	t	\N	f
460	TCK-4RNVPPA9	B 1686	67	2026-09-16 15:27:07	2026-09-16 15:47:22	f	2026-09-16 15:27:07	2026-09-16 15:47:22	21	4000	2	\N	f	\N	f
503	TCK-ROYW00C6	B7777HELP	53	2026-10-05 10:16:32	2026-10-05 10:18:12	f	2026-10-05 10:16:32	2026-10-05 10:18:12	2	4001	3	\N	f	\N	f
528	TCK-JJZ46V51	B 3431	47	2026-10-14 14:26:40	2026-10-14 14:27:16	f	2026-10-14 14:26:40	2026-10-14 14:27:16	1	4000	4	\N	f	\N	f
411	TCK-APRW8SFB	B 8747	61	2026-09-14 17:02:36	2026-09-14 17:03:36	f	2026-09-14 17:02:36	2026-09-14 17:03:36	2	4000	2	\N	f	\N	f
386	TCK-WCC8MIWD	B 5569	49	2026-09-14 17:01:30	2026-09-14 17:03:55	f	2026-09-14 17:01:30	2026-09-14 17:03:55	3	4000	2	\N	f	\N	f
436	TCK-XFIJTR9U	B 1592	50	2026-09-16 10:25:05	2026-09-16 10:25:18	f	2026-09-16 10:25:05	2026-09-16 10:25:18	1	4000	2	\N	f	\N	f
479	TCK-AQ1YNH7N	B 6449	50	2026-09-24 10:52:12	2026-09-25 10:48:20	f	2026-09-24 10:52:12	2026-09-25 10:48:20	1437	96000	2	\N	f	\N	f
461	TCK-6ZE32FAA	K 141 KU	64	2026-09-16 15:28:16	2026-09-16 15:47:27	f	2026-09-16 15:28:16	2026-09-16 15:47:27	20	0	2	1	t	\N	f
504	TCK-YWUANA0Q	B8888STF	66	2026-10-05 10:16:33	2026-10-05 10:16:33	f	2026-10-05 10:16:33	2026-10-05 10:16:33	1	4001	3	\N	f	\N	f
529	TCK-KTOB2BZP	B 4123	49	2026-10-14 14:27:09	2026-10-14 14:27:13	f	2026-10-14 14:27:09	2026-10-14 14:27:13	1	4000	4	\N	f	\N	f
412	TCK-UNBEQC8H	B 9044	75	2026-09-14 17:02:38	2026-09-14 17:03:00	f	2026-09-14 17:02:38	2026-09-14 17:03:00	1	4000	2	\N	f	\N	f
387	TCK-IRW2Y02G	B 3769	51	2026-09-14 17:01:32	2026-09-14 17:04:00	f	2026-09-14 17:01:32	2026-09-14 17:04:00	3	4000	2	\N	f	\N	f
437	TCK-NCRUJLVE	K 141 KU	50	2026-09-16 10:42:05	2026-09-16 13:08:35	f	2026-09-16 10:42:05	2026-09-16 13:08:35	147	0	2	1	t	\N	f
480	TCK-YKAH4YWN	K 141 KU	48	2026-09-24 10:56:40	2026-09-24 10:56:49	f	2026-09-24 10:56:40	2026-09-24 10:56:49	1	0	2	1	t	\N	f
462	TCK-VWOZ7LRF	K 141 KU	49	2026-09-16 15:47:44	2026-09-16 15:48:08	f	2026-09-16 15:47:44	2026-09-16 15:48:08	1	0	2	1	t	\N	f
505	MOB-6AC31691B5B70	TST-1791170189-41338	66	2026-10-05 10:16:33	2026-10-05 10:16:33	f	2026-10-05 10:16:33	2026-10-05 10:16:33	1	5000	\N	17	f	\N	f
530	TCK-80EH2E78	K 141 KU	47	2026-10-14 15:17:24	2026-10-14 15:25:12	f	2026-10-14 15:17:24	2026-10-14 15:25:12	8	4000	4	1	f	\N	f
388	TCK-FQMDRG84	B 2578	52	2026-09-14 17:01:34	2026-09-14 17:04:02	f	2026-09-14 17:01:34	2026-09-14 17:04:02	3	4000	2	\N	f	\N	f
413	TCK-N1CDMAH1	B 1740	58	2026-09-14 17:02:41	2026-09-14 17:04:15	f	2026-09-14 17:02:41	2026-09-14 17:04:15	2	4000	2	\N	f	\N	f
438	TCK-IRH6DYNN	B 6981	48	2026-09-16 11:35:19	2026-09-16 13:16:31	f	2026-09-16 11:35:19	2026-09-16 13:16:31	102	8000	2	\N	f	\N	f
463	TCK-XEJJFDGJ	K 141 KU	50	2026-09-16 16:06:32	2026-09-22 11:13:59	f	2026-09-16 16:06:32	2026-09-22 11:13:59	8348	0	2	1	t	\N	f
481	TCK-NM2RTFSC	K 141 KU	48	2026-09-24 10:56:55	2026-09-24 10:57:51	f	2026-09-24 10:56:55	2026-09-24 10:57:51	1	0	2	1	t	\N	f
506	TCK-O6R91484	B1111EDGE	66	2026-10-05 10:16:35	2026-10-05 10:16:35	f	2026-10-05 10:16:35	2026-10-05 10:16:35	1	4001	3	\N	f	\N	f
531	TCK-X2EKSETF	K 141 KU	58	2026-10-14 15:20:26	2026-10-14 15:25:14	f	2026-10-14 15:20:26	2026-10-14 15:25:14	5	4000	4	1	f	\N	f
414	TCK-774XI9Q6	B 7973	81	2026-09-14 17:02:46	2026-09-14 17:03:16	f	2026-09-14 17:02:46	2026-09-14 17:03:16	1	4000	2	\N	f	\N	f
389	TCK-QNN2U7QC	B 4393	46	2026-09-14 17:01:36	2026-09-14 17:03:46	f	2026-09-14 17:01:36	2026-09-14 17:03:46	3	4000	2	\N	f	\N	f
439	TCK-NMNB4PPF	B 5972	47	2026-09-16 11:35:50	2026-09-16 13:16:34	f	2026-09-16 11:35:50	2026-09-16 13:16:34	101	8000	2	\N	f	\N	f
464	TCK-MRGMHOKR	B 3246	50	2026-09-22 14:19:50	2026-09-22 16:08:21	f	2026-09-22 14:19:50	2026-09-22 16:08:21	109	8000	2	\N	f	\N	f
482	TCK-POS7NQ6Z	K 141 KU	48	2026-09-24 10:57:58	2026-09-24 10:58:04	f	2026-09-24 10:57:58	2026-09-24 10:58:04	1	0	2	1	t	\N	f
507	TCK-BC8VQTCS	B2222OV1	66	2026-10-05 10:16:35	2026-10-05 10:17:54	f	2026-10-05 10:16:35	2026-10-05 10:17:54	2	4001	3	\N	f	\N	f
532	TCK-KHERYKRV	B 2116	48	2026-10-14 15:23:44	2026-10-14 15:25:10	f	2026-10-14 15:23:44	2026-10-14 15:25:10	2	4000	4	\N	f	\N	f
390	TCK-6M2HTSKA	B 3336	66	2026-09-14 17:01:39	2026-09-14 17:03:29	f	2026-09-14 17:01:39	2026-09-14 17:03:29	2	4000	2	\N	f	\N	f
415	TCK-EJVK65FU	B 9312	60	2026-09-14 17:02:49	2026-09-14 17:03:39	f	2026-09-14 17:02:49	2026-09-14 17:03:39	1	4000	2	\N	f	\N	f
440	TCK-4TPZZLBE	B 7958	49	2026-09-16 11:35:53	2026-09-16 13:16:29	f	2026-09-16 11:35:53	2026-09-16 13:16:29	101	8000	2	\N	f	\N	f
465	TCK-JRIS35A9	K 141 KU	50	2026-09-22 16:08:34	2026-09-22 16:08:53	f	2026-09-22 16:08:34	2026-09-22 16:08:53	1	0	2	1	t	\N	f
483	TCK-CCSQ8CY9	K 141 KU	48	2026-09-24 11:02:00	2026-09-24 11:02:06	f	2026-09-24 11:02:00	2026-09-24 11:02:06	1	0	2	1	t	\N	f
508	TCK-UDR8FHPE	B2222OV2	80	2026-10-05 10:16:35	2026-10-05 10:17:51	f	2026-10-05 10:16:35	2026-10-05 10:17:51	2	4001	3	\N	f	\N	f
533	TCK-EF8DDUBU	K 141 KU	48	2026-10-14 15:26:29	2026-10-16 19:29:49	f	2026-10-14 15:26:29	2026-10-16 19:29:49	3124	212000	4	1	f	\N	f
416	TCK-NWARS4ZJ	B 3160	74	2026-09-14 17:02:51	2026-09-14 17:02:57	f	2026-09-14 17:02:51	2026-09-14 17:02:57	1	4000	2	\N	f	\N	f
391	TCK-FWQLLBQ8	B 4064	68	2026-09-14 17:01:41	2026-09-14 17:03:24	f	2026-09-14 17:01:41	2026-09-14 17:03:24	2	4000	2	\N	f	\N	f
441	TCK-51UTDFHF	B 7772	51	2026-09-16 13:06:35	2026-09-16 13:16:25	f	2026-09-16 13:06:35	2026-09-16 13:16:25	10	4000	2	\N	f	\N	f
466	TCK-ODJ3YFQR	B 8938	50	2026-09-23 11:37:24	2026-09-23 11:37:40	f	2026-09-23 11:37:24	2026-09-23 11:37:40	1	4000	2	\N	f	\N	f
484	TCK-K8XTT1YF	B 9653	48	2026-09-24 11:12:21	2026-09-24 11:12:28	f	2026-09-24 11:12:21	2026-09-24 11:12:28	1	4000	2	\N	f	\N	f
509	TCK-PVSOFGTU	B1234TEST	65	2026-10-05 10:16:51	2026-10-05 10:16:51	f	2026-10-05 10:16:51	2026-10-05 10:16:51	1	4001	3	\N	f	\N	f
534	TCK-VOMQ4HWH	F 23 H	47	2026-10-14 15:28:28	2026-10-16 19:28:50	f	2026-10-14 15:28:28	2026-10-16 19:28:50	3121	212000	4	\N	f	\N	t
392	TCK-B4IUZUSJ	B 2402	53	2026-09-14 17:01:45	2026-09-14 17:04:04	f	2026-09-14 17:01:45	2026-09-14 17:04:04	3	4000	2	\N	f	\N	f
417	TCK-3FYY9F5N	B 5432	59	2026-09-14 17:02:54	2026-09-14 17:04:17	f	2026-09-14 17:02:54	2026-09-14 17:04:17	2	4000	2	\N	f	\N	f
442	TCK-Z93EJ2S7	B 1098	52	2026-09-16 13:06:49	2026-09-16 13:16:27	f	2026-09-16 13:06:49	2026-09-16 13:16:27	10	4000	2	\N	f	\N	f
467	TCK-I10K8QDQ	B 8952	50	2026-09-23 11:37:44	2026-09-23 11:37:58	f	2026-09-23 11:37:44	2026-09-23 11:37:58	1	4000	2	\N	f	\N	f
485	TCK-E0DUXL3U	K 141 KU	50	2026-09-25 11:00:07	2026-09-25 11:00:18	f	2026-09-25 11:00:07	2026-09-25 11:00:18	1	0	2	1	t	\N	f
510	TCK-VZA27BGE	B5678TEST	69	2026-10-05 10:16:51	2026-10-05 10:18:02	f	2026-10-05 10:16:51	2026-10-05 10:18:02	2	4001	3	\N	f	69	f
535	TCK-QUKHYI8R	B 9831	48	2026-10-16 19:45:04	\N	f	2026-10-16 19:45:04	2026-10-16 19:45:04	\N	\N	\N	\N	f	\N	f
393	TCK-M80J2CY0	B 4328	80	2026-09-14 17:01:47	2026-09-14 17:03:49	f	2026-09-14 17:01:47	2026-09-14 17:03:49	3	4000	2	\N	f	\N	f
486	TCK-2G9ICF0T	K 141 KU	50	2026-09-25 19:47:02	2026-09-25 20:05:30	f	2026-09-25 19:47:02	2026-09-25 20:05:30	19	0	2	1	t	\N	f
418	TCK-ZRTW3SYE	K 141 KU	67	2026-09-15 10:23:35	2026-09-15 10:24:49	f	2026-09-15 10:23:35	2026-09-15 10:24:49	2	0	2	1	t	\N	f
443	TCK-HX2QPOU0	B 4501	46	2026-09-16 13:07:17	2026-09-16 13:16:36	f	2026-09-16 13:07:17	2026-09-16 13:16:36	10	4000	2	\N	f	\N	f
468	TCK-GQ5BQUMN	B 8540	50	2026-09-24 10:09:56	2026-09-24 10:11:55	f	2026-09-24 10:09:56	2026-09-24 10:11:55	2	4000	2	\N	f	\N	f
511	TCK-OTFUGVE8	B9999VIOL	71	2026-10-05 10:16:51	2026-10-05 10:16:52	f	2026-10-05 10:16:51	2026-10-05 10:16:52	1	4001	3	\N	f	\N	f
394	TCK-E9C6YK1K	B 6770	65	2026-09-14 17:01:49	2026-09-14 17:03:32	f	2026-09-14 17:01:49	2026-09-14 17:03:32	2	4000	2	\N	f	\N	f
419	TCK-RVJZAA00	H 21 S	50	2026-09-15 10:25:32	2026-09-15 10:26:14	f	2026-09-15 10:25:32	2026-09-15 10:26:14	1	4000	2	\N	f	\N	t
444	TCK-SRRBX9WI	B 4284	66	2026-09-16 13:07:25	2026-09-16 13:16:23	f	2026-09-16 13:07:25	2026-09-16 13:16:23	9	4000	2	\N	f	\N	f
469	TCK-ITR1OEOO	B 7540	50	2026-09-24 10:19:24	2026-09-24 10:37:18	f	2026-09-24 10:19:24	2026-09-24 10:37:18	18	4000	2	\N	f	\N	f
487	TCK-CNVKOJIO	K 141 KU	50	2026-09-29 10:42:54	2026-09-30 10:37:38	f	2026-09-29 10:42:54	2026-09-30 10:37:38	1435	96000	2	\N	f	\N	t
512	TCK-PIFXQXBY	B7777HELP	67	2026-10-05 10:16:52	2026-10-05 10:18:05	f	2026-10-05 10:16:52	2026-10-05 10:18:05	2	4001	3	\N	f	\N	f
395	TCK-FREEJJJR	B 8786	67	2026-09-14 17:01:51	2026-09-14 17:03:26	f	2026-09-14 17:01:51	2026-09-14 17:03:26	2	4000	2	\N	f	\N	f
420	TCK-WH3N7KCR	CD 98	50	2026-09-15 10:27:39	2026-09-15 10:29:25	f	2026-09-15 10:27:39	2026-09-15 10:29:25	2	4000	2	\N	f	\N	f
488	TCK-8XVTIPYS	B 9908	47	2026-09-30 10:41:21	2026-09-30 10:41:25	f	2026-09-30 10:41:21	2026-09-30 10:41:25	1	4001	3	\N	f	\N	f
445	TCK-YOMIWOPA	K 141 KU	70	2026-09-16 13:08:42	2026-09-16 13:16:21	f	2026-09-16 13:08:42	2026-09-16 13:16:21	8	0	2	1	t	\N	f
470	TCK-QC722A0J	B 1231	48	2026-09-24 10:20:38	2026-09-24 10:37:21	f	2026-09-24 10:20:38	2026-09-24 10:37:21	17	4000	2	\N	f	\N	f
513	TCK-AJTUJYWL	B8888STF	65	2026-10-05 10:16:53	2026-10-05 10:16:53	f	2026-10-05 10:16:53	2026-10-05 10:16:53	1	4001	3	\N	f	\N	f
396	TCK-DAWTDMTV	B 1785	69	2026-09-14 17:01:53	2026-09-14 17:03:12	f	2026-09-14 17:01:53	2026-09-14 17:03:12	2	4000	2	\N	f	\N	f
421	TCK-6ISMKJN9	JB 32 DS	48	2026-09-15 10:27:41	2026-09-15 10:29:16	f	2026-09-15 10:27:41	2026-09-15 10:29:16	2	4000	2	\N	f	\N	f
514	MOB-6AC316A5C60A3	TST-1791170209-42128	65	2026-10-05 10:16:53	2026-10-05 10:16:53	f	2026-10-05 10:16:53	2026-10-05 10:16:53	1	5000	\N	18	f	\N	f
446	TCK-LZHRLGWL	B 5565	65	2026-09-16 13:16:45	2026-09-16 13:49:00	f	2026-09-16 13:16:45	2026-09-16 13:49:00	33	4000	2	\N	f	\N	f
471	TCK-JNVBHDVB	B 7715	47	2026-09-24 10:21:26	2026-09-24 10:24:47	f	2026-09-24 10:21:26	2026-09-24 10:24:47	4	4000	2	\N	f	\N	f
489	TCK-YTKRXM2N	B 8040	47	2026-10-02 19:43:33	2026-10-05 10:18:18	f	2026-10-02 19:43:33	2026-10-05 10:18:18	3755	252063	3	\N	f	\N	f
397	TCK-AMWIED1H	B 6227	54	2026-09-14 17:01:55	2026-09-14 17:04:06	f	2026-09-14 17:01:55	2026-09-14 17:04:06	3	4000	2	\N	f	\N	f
422	TCK-MRZY419U	P 90	47	2026-09-15 10:27:43	2026-09-15 10:29:04	f	2026-09-15 10:27:43	2026-09-15 10:29:04	2	4000	2	\N	f	\N	f
447	TCK-GJNW9RLH	B 3391	48	2026-09-16 13:17:02	2026-09-16 13:17:30	f	2026-09-16 13:17:02	2026-09-16 13:17:30	1	4000	2	\N	f	\N	f
472	TCK-TYEGHWVZ	K 141 KU	47	2026-09-24 10:26:11	2026-09-24 10:26:33	f	2026-09-24 10:26:11	2026-09-24 10:26:33	1	0	2	1	t	\N	f
515	TCK-8OOT3AAJ	B1111EDGE	65	2026-10-05 10:16:54	2026-10-05 10:16:54	f	2026-10-05 10:16:54	2026-10-05 10:16:54	1	4001	3	\N	f	\N	f
490	TCK-FLXOW8AH	B 8085	49	2026-10-02 19:43:35	2026-10-05 10:18:15	f	2026-10-02 19:43:35	2026-10-05 10:18:15	3755	252063	3	\N	f	\N	f
398	TCK-DUC61OCI	B 9483	79	2026-09-14 17:01:57	2026-09-14 17:03:44	f	2026-09-14 17:01:57	2026-09-14 17:03:44	2	4000	2	\N	f	\N	f
423	TCK-107R9W6I	L 3	50	2026-09-15 10:42:05	2026-09-15 10:42:51	f	2026-09-15 10:42:05	2026-09-15 10:42:51	1	4000	2	\N	f	\N	f
516	TCK-ZIHC9Q4V	B2222OV1	65	2026-10-05 10:16:55	2026-10-05 10:17:56	f	2026-10-05 10:16:55	2026-10-05 10:17:56	2	4001	3	\N	f	\N	f
448	TCK-VWRFRX0W	B 3054	75	2026-09-16 13:17:44	2026-09-16 13:48:57	f	2026-09-16 13:17:44	2026-09-16 13:48:57	32	4000	2	\N	f	\N	f
473	TCK-UKIPGRNR	K 141 KU	47	2026-09-24 10:36:28	2026-09-24 10:37:23	f	2026-09-24 10:36:28	2026-09-24 10:37:23	1	0	2	1	t	\N	f
491	TCK-DH7GC2TS	B 1779	52	2026-10-02 19:43:37	2026-10-05 10:18:08	f	2026-10-02 19:43:37	2026-10-05 10:18:08	3755	252063	3	\N	f	\N	f
399	TCK-ZKV9IBZC	B 2350	70	2026-09-14 17:01:59	2026-09-14 17:03:21	f	2026-09-14 17:01:59	2026-09-14 17:03:21	2	4000	2	\N	f	\N	f
424	TCK-1AVYTC9O	L 90	50	2026-09-15 10:48:18	2026-09-15 10:48:52	f	2026-09-15 10:48:18	2026-09-15 10:48:52	1	4000	2	\N	f	\N	f
517	TCK-PHC6GHK1	B2222OV2	54	2026-10-05 10:16:55	2026-10-05 10:18:10	f	2026-10-05 10:16:55	2026-10-05 10:18:10	2	4001	3	\N	f	\N	f
449	TCK-QOEGTFMN	B 7503	58	2026-09-16 13:20:08	2026-09-16 13:49:17	f	2026-09-16 13:20:08	2026-09-16 13:49:17	30	4000	2	\N	f	\N	f
474	TCK-SLJDD5ZT	K 141 KU	50	2026-09-24 10:44:23	2026-09-24 10:44:38	f	2026-09-24 10:44:23	2026-09-24 10:44:38	1	0	2	1	t	\N	f
492	TCK-DXNGDVBW	B 2439	46	2026-10-02 19:43:39	2026-10-05 10:18:20	f	2026-10-02 19:43:39	2026-10-05 10:18:20	3755	252063	3	\N	f	\N	f
400	TCK-HWWCD3EK	B 5740	64	2026-09-14 17:02:01	2026-09-14 17:03:10	f	2026-09-14 17:02:01	2026-09-14 17:03:10	2	4000	2	\N	f	\N	f
425	TCK-L27AGQGF	B 2301	50	2026-09-15 15:24:51	2026-09-15 15:24:55	f	2026-09-15 15:24:51	2026-09-15 15:24:55	1	4000	2	\N	f	\N	f
493	TCK-P6Y1EORZ	K 141 KU	66	2026-10-02 19:43:59	2026-10-02 19:50:19	f	2026-10-02 19:43:59	2026-10-02 19:50:19	7	4001	3	1	f	\N	f
450	TCK-YOCPOEBQ	L 92	69	2026-09-16 13:21:22	2026-09-16 13:44:15	f	2026-09-16 13:21:22	2026-09-16 13:44:15	23	4000	2	\N	f	\N	t
475	TCK-9NGZSMHI	K 141 KU	50	2026-09-24 10:44:50	2026-09-24 10:45:06	f	2026-09-24 10:44:50	2026-09-24 10:45:06	1	0	2	1	t	\N	f
518	TCK-U7DX9LAD	K 141 KU	47	2026-10-05 10:19:20	2026-10-05 10:19:27	f	2026-10-05 10:19:20	2026-10-05 10:19:27	1	4001	3	1	f	\N	f
401	TCK-9DZO9W8D	B 6787	78	2026-09-14 17:02:02	2026-09-14 17:03:42	f	2026-09-14 17:02:02	2026-09-14 17:03:42	2	4000	2	\N	f	\N	f
426	TCK-EEYAZ3L9	K 141 KU	50	2026-09-15 15:25:27	2026-09-15 15:25:33	f	2026-09-15 15:25:27	2026-09-15 15:25:33	1	0	2	1	t	\N	f
494	TCK-AYVR7USY	PA179117	66	2026-10-05 10:14:40	2026-10-05 10:15:41	f	2026-10-05 10:14:40	2026-10-05 10:15:41	2	4001	3	7	f	\N	f
451	TCK-B1KMD22G	B 3631	79	2026-09-16 13:24:48	2026-09-16 13:49:19	f	2026-09-16 13:24:48	2026-09-16 13:49:19	25	4000	2	\N	f	\N	f
519	TCK-UGCVFTIK	K 141 KU	47	2026-10-05 10:19:39	2026-10-05 10:19:52	f	2026-10-05 10:19:39	2026-10-05 10:19:52	1	4001	3	1	f	\N	f
402	TCK-2SOXS7ND	B 7876	55	2026-09-14 17:02:04	2026-09-14 17:04:08	f	2026-09-14 17:02:04	2026-09-14 17:04:08	3	4000	2	\N	f	\N	f
427	TCK-IKZQHNEK	K 141 KU	50	2026-09-15 15:26:18	2026-09-15 15:26:22	f	2026-09-15 15:26:18	2026-09-15 15:26:22	1	0	2	1	t	\N	f
452	TCK-TJDE8B81	B 8107	49	2026-09-16 13:24:56	2026-09-16 13:49:14	f	2026-09-16 13:24:56	2026-09-16 13:49:14	25	4000	2	\N	f	\N	f
495	TCK-PDAHPJQA	PB179117	68	2026-10-05 10:14:41	2026-10-05 10:15:41	f	2026-10-05 10:14:41	2026-10-05 10:15:41	2	4001	3	8	f	\N	f
520	TCK-005TTOIB	K 141 KU	47	2026-10-05 10:22:22	2026-10-05 10:22:33	f	2026-10-05 10:22:22	2026-10-05 10:22:33	1	4000	4	1	f	\N	f
403	TCK-NXAO7I8M	B 7228	71	2026-09-14 17:02:07	2026-09-14 17:03:14	f	2026-09-14 17:02:07	2026-09-14 17:03:14	2	4000	2	\N	f	\N	f
428	TCK-OYVSTMSC	B 1603	50	2026-09-15 16:01:54	2026-09-15 16:01:59	f	2026-09-15 16:01:54	2026-09-15 16:01:59	1	4000	2	\N	f	\N	f
496	TCK-4EFWJHQX	PA179117	53	2026-10-05 10:14:49	2026-10-05 10:15:41	f	2026-10-05 10:14:49	2026-10-05 10:15:41	1	4001	3	7	f	\N	f
453	TCK-EREV2CGL	B 5226	52	2026-09-16 13:38:09	2026-09-16 13:49:12	f	2026-09-16 13:38:09	2026-09-16 13:49:12	12	4000	2	\N	f	\N	f
521	TCK-LFT7S4B7	L 99 K	47	2026-10-13 15:47:39	2026-10-13 15:50:44	f	2026-10-13 15:47:39	2026-10-13 15:50:44	4	4000	4	\N	f	\N	t
404	TCK-T26DKOFX	B 3729	63	2026-09-14 17:02:09	2026-09-14 17:03:34	f	2026-09-14 17:02:09	2026-09-14 17:03:34	2	4000	2	\N	f	\N	f
429	TCK-SL6HBFRL	B 6472	50	2026-09-15 16:12:32	2026-09-15 17:21:58	f	2026-09-15 16:12:32	2026-09-15 17:21:58	70	8000	2	\N	f	\N	f
497	TCK-D2VDQ8I8	PB179117	80	2026-10-05 10:14:50	2026-10-05 10:15:41	f	2026-10-05 10:14:50	2026-10-05 10:15:41	1	4001	3	8	f	\N	f
454	TCK-OGZTEGO2	B 7794	67	2026-09-16 13:38:20	2026-09-16 13:49:02	f	2026-09-16 13:38:20	2026-09-16 13:49:02	11	4000	2	\N	f	\N	f
522	TCK-HF2JPHZK	B 1822	47	2026-10-13 15:51:08	2026-10-13 15:51:15	f	2026-10-13 15:51:08	2026-10-13 15:51:15	1	4000	4	\N	f	\N	f
405	TCK-YRNOG040	B 8949	56	2026-09-14 17:02:23	2026-09-14 17:04:11	f	2026-09-14 17:02:23	2026-09-14 17:04:11	2	4000	2	\N	f	\N	f
430	TCK-RQ8OTTO2	P 23 SD	48	2026-09-15 16:12:44	2026-09-15 17:02:34	f	2026-09-15 16:12:44	2026-09-15 17:02:34	50	4000	2	\N	f	\N	t
498	TCK-NRGD0Q8P	PA55892883	65	2026-10-05 10:15:19	2026-10-05 10:15:19	f	2026-10-05 10:15:19	2026-10-05 10:15:19	1	4001	3	11	f	\N	f
455	TCK-MEJNYMJN	B 5117	61	2026-09-16 13:38:31	2026-09-16 13:49:07	f	2026-09-16 13:38:31	2026-09-16 13:49:07	11	4000	2	\N	f	\N	f
523	TCK-U85LXMPY	B 1927	65	2026-10-14 13:54:54	2026-10-16 19:29:05	f	2026-10-14 13:54:54	2026-10-16 19:29:05	3215	216000	4	\N	f	\N	f
406	TCK-HQKAXQS2	B 7932	77	2026-09-14 17:02:24	2026-09-14 17:03:06	f	2026-09-14 17:02:24	2026-09-14 17:03:06	1	4000	2	\N	f	\N	f
431	TCK-UNQZOXI2	K 141 KU	48	2026-09-15 17:11:52	2026-09-15 17:11:58	f	2026-09-15 17:11:52	2026-09-15 17:11:58	1	0	2	1	t	\N	f
499	TCK-HGNKYGSJ	PB55892883	65	2026-10-05 10:15:20	2026-10-05 10:15:20	f	2026-10-05 10:15:20	2026-10-05 10:15:20	1	4001	3	12	f	\N	f
456	TCK-ITVZQMSO	K 141 KU	63	2026-09-16 13:39:40	2026-09-16 13:42:47	f	2026-09-16 13:39:40	2026-09-16 13:42:47	4	0	2	1	t	\N	f
524	TCK-GBZOLAXQ	B 3789	47	2026-10-14 14:20:45	2026-10-14 14:20:56	f	2026-10-14 14:20:45	2026-10-14 14:20:56	1	4000	4	\N	f	\N	f
34	TCK-RZNFD3CI	B 6559	48	2026-07-22 16:46:16	2026-07-22 16:47:16	f	2026-07-22 16:46:16	2026-07-22 16:47:16	2	5000	1	\N	f	\N	f
40	TCK-LDIISJRW	K 141 KU	46	2026-07-22 16:51:40	2026-07-22 16:52:21	f	2026-07-22 16:51:40	2026-07-22 16:52:21	1	0	1	1	t	\N	f
38	TCK-YETZ3ECP	B 2617	51	2026-07-22 16:46:37	2026-07-22 17:08:44	f	2026-07-22 16:46:37	2026-07-22 17:08:44	23	5000	1	\N	f	\N	f
35	TCK-MZX7MJ5V	B 7624	50	2026-07-22 16:46:22	2026-07-22 17:08:49	f	2026-07-22 16:46:22	2026-07-22 17:08:49	23	5000	1	\N	f	\N	f
37	TCK-ZPXLYNRI	B 8551	49	2026-07-22 16:46:30	2026-07-22 17:08:53	f	2026-07-22 16:46:30	2026-07-22 17:08:53	23	5000	1	\N	f	\N	f
39	TCK-517X08EL	B 7518	48	2026-07-22 16:47:19	2026-07-22 17:08:57	f	2026-07-22 16:47:19	2026-07-22 17:08:57	22	5000	1	\N	f	\N	f
36	TCK-QZULQUT5	B 5853	47	2026-07-22 16:46:26	2026-07-22 17:09:01	f	2026-07-22 16:46:26	2026-07-22 17:09:01	23	5000	1	\N	f	\N	f
41	TCK-YOSIRNC8	B 8900	48	2026-07-22 17:13:05	2026-07-22 17:13:18	f	2026-07-22 17:13:05	2026-07-22 17:13:18	1	5000	1	\N	f	\N	f
42	TCK-NBORN7WR	B 2392	50	2026-07-22 17:13:10	2026-07-22 17:13:21	f	2026-07-22 17:13:10	2026-07-22 17:13:21	1	5000	1	\N	f	\N	f
43	TCK-VTHOLUVW	B 5658	47	2026-07-22 17:13:12	2026-07-22 17:13:24	f	2026-07-22 17:13:12	2026-07-22 17:13:24	1	5000	1	\N	f	\N	f
64	TCK-MLJ8YMHF	B 1887	74	2026-07-22 17:22:03	2026-07-22 17:22:20	f	2026-07-22 17:22:03	2026-07-22 17:22:20	1	5000	1	\N	f	\N	f
50	TCK-IJNL7KB5	B 4178	52	2026-07-22 17:18:09	2026-07-22 17:22:23	f	2026-07-22 17:18:09	2026-07-22 17:22:23	5	5000	1	\N	f	\N	f
95	TCK-LL2JRMAM	B 2741	48	2026-08-03 19:25:12	2026-08-03 19:25:19	f	2026-08-03 19:25:12	2026-08-03 19:25:19	1	5000	1	\N	f	\N	f
96	MOB-6A82A85D6C9F8	K 141 KU	48	2026-08-17 13:21:17	2026-08-17 13:23:52	f	2026-08-17 13:21:17	2026-08-17 13:23:52	3	5000	\N	1	f	\N	f
136	TCK-I3SCJPLO	B 9132	47	2026-08-19 16:57:51	2026-08-19 16:58:09	f	2026-08-19 16:57:51	2026-08-19 16:58:09	1	5000	1	\N	f	\N	f
134	TCK-T0JF477A	B 2940	48	2026-08-19 16:57:46	2026-08-19 16:58:19	f	2026-08-19 16:57:46	2026-08-19 16:58:19	1	5000	1	\N	f	\N	f
155	TCK-0YM3YP5N	B 332 AA	48	2026-08-20 11:04:42	2026-08-20 11:05:16	f	2026-08-20 11:04:42	2026-08-20 11:05:16	1	5000	1	\N	f	\N	f
139	TCK-JKBQ9DM1	B 5571	47	2026-08-19 17:01:57	2026-08-19 17:02:03	f	2026-08-19 17:01:57	2026-08-19 17:02:03	1	5000	1	\N	f	\N	f
166	TCK-ONWM7FYF	J 8892 SS	48	2026-08-20 13:36:42	2026-08-20 13:37:09	f	2026-08-20 13:36:42	2026-08-20 13:37:09	1	5000	1	\N	f	\N	f
156	TCK-FH5190AA	B 8378 JJK	48	2026-08-20 11:16:39	2026-08-20 11:17:55	f	2026-08-20 11:16:39	2026-08-20 11:17:55	2	5000	1	\N	f	\N	f
157	TCK-UZJC8QKG	B 8335	48	2026-08-20 11:18:05	2026-08-20 11:18:25	f	2026-08-20 11:18:05	2026-08-20 11:18:25	1	5000	1	\N	f	\N	f
141	TCK-CVL8A9GB	B 5545	50	2026-08-19 17:18:58	2026-08-19 17:20:10	f	2026-08-19 17:18:58	2026-08-19 17:20:10	2	5000	1	\N	f	\N	f
143	TCK-LZKANBOG	B 2893	48	2026-08-19 17:25:56	2026-08-19 17:26:32	f	2026-08-19 17:25:56	2026-08-19 17:26:32	1	5000	1	\N	f	\N	f
144	TCK-9SZB4P2S	K 141 KU	50	2026-08-19 21:12:51	2026-08-19 21:19:07	f	2026-08-19 21:12:51	2026-08-19 21:19:07	7	0	1	1	t	\N	f
158	TCK-E2Y61Q4D	K 141 KU	48	2026-08-20 11:20:37	2026-08-20 11:20:45	f	2026-08-20 11:20:37	2026-08-20 11:20:45	1	0	1	1	t	\N	f
146	TCK-ZG13CQ5J	B 5324	50	2026-08-20 10:08:01	2026-08-20 10:08:11	f	2026-08-20 10:08:01	2026-08-20 10:08:11	1	5000	1	\N	f	\N	f
147	TCK-AL8CKHXA	B 334 JJS	48	2026-08-20 10:27:57	2026-08-20 10:33:07	f	2026-08-20 10:27:57	2026-08-20 10:33:07	6	5000	1	\N	f	\N	f
148	TCK-1EKYCEKA	B 5633	50	2026-08-20 10:37:11	2026-08-20 10:37:36	f	2026-08-20 10:37:11	2026-08-20 10:37:36	1	5000	1	\N	f	\N	f
149	TCK-T3Y2BNGY	B 993 JKS	48	2026-08-20 10:42:06	2026-08-20 10:42:36	f	2026-08-20 10:42:06	2026-08-20 10:42:36	1	5000	1	\N	f	\N	f
150	TCK-ADGNQOM2	B 332	50	2026-08-20 10:43:20	2026-08-20 10:44:15	f	2026-08-20 10:43:20	2026-08-20 10:44:15	1	5000	1	\N	f	\N	f
151	TCK-YTWMHYZ2	B 343 JJ	48	2026-08-20 10:46:52	2026-08-20 10:47:27	f	2026-08-20 10:46:52	2026-08-20 10:47:27	1	5000	1	\N	f	\N	f
190	TCK-OC088P8X	B 1050	48	2026-08-21 14:10:04	2026-08-21 14:10:26	f	2026-08-21 14:10:04	2026-08-21 14:10:26	1	4000	2	\N	f	\N	f
191	TCK-M9FHVNBE	L 44 AU	50	2026-08-21 14:20:10	2026-08-21 14:21:21	f	2026-08-21 14:20:10	2026-08-21 14:21:21	2	4000	2	\N	f	\N	f
210	TCK-ZBVYHHO0	L 90 A	48	2026-08-26 11:10:57	2026-08-26 11:11:58	f	2026-08-26 11:10:57	2026-08-26 11:11:58	2	4000	2	\N	f	\N	f
192	TCK-N4IBSHIA	N 4 NO	48	2026-08-21 14:22:33	2026-08-21 14:23:49	f	2026-08-21 14:22:33	2026-08-21 14:23:49	2	4000	2	\N	f	\N	f
193	TCK-68VH6KJW	EA 4826 SF	50	2026-08-21 15:40:46	2026-08-21 15:41:18	f	2026-08-21 15:40:46	2026-08-21 15:41:18	1	4000	2	\N	f	\N	f
195	TCK-CDYOF7IK	B 1922	50	2026-08-23 10:58:32	2026-08-23 10:58:37	f	2026-08-23 10:58:32	2026-08-23 10:58:37	1	4000	2	\N	f	\N	f
198	TCK-QSLUKITV	K 141 KU	48	2026-08-23 12:51:07	2026-08-23 12:51:11	f	2026-08-23 12:51:07	2026-08-23 12:51:11	1	0	2	1	t	\N	f
199	TCK-ECCDGYSZ	T 1192 EV	48	2026-08-23 12:51:36	2026-08-23 12:51:42	f	2026-08-23 12:51:36	2026-08-23 12:51:42	1	4000	2	\N	f	\N	f
200	TCK-XPWR71YD	K 141 KU	48	2026-08-24 14:21:18	2026-08-24 14:21:23	f	2026-08-24 14:21:18	2026-08-24 14:21:23	1	0	2	1	t	\N	f
196	TCK-SYEQQOSN	B 8776	50	2026-08-23 10:59:12	2026-08-24 14:21:31	f	2026-08-23 10:59:12	2026-08-24 14:21:31	1643	112000	2	\N	f	\N	f
212	TCK-ETFEZNMY	EB 332 AB	48	2026-08-26 11:13:01	2026-08-26 11:14:10	f	2026-08-26 11:13:01	2026-08-26 11:14:10	2	4000	2	\N	f	\N	f
201	TCK-MFW6N0AG	B 789 UZ	48	2026-08-24 16:29:50	2026-08-24 18:56:58	f	2026-08-24 16:29:50	2026-08-24 18:56:58	148	12000	2	\N	f	\N	f
205	TCK-HXT15YOC	B 1234 ABC	47	2026-08-24 19:25:25	2026-08-24 19:27:43	f	2026-08-24 19:25:25	2026-08-24 19:27:43	3	4000	2	\N	f	\N	f
213	TCK-XBNFFLTE	K 141 KU	50	2026-08-26 11:14:56	2026-08-26 11:15:15	t	2026-08-26 11:14:56	2026-08-26 11:15:15	1	0	2	1	t	48	f
207	TCK-LE3ZGWRH	K 141 KU	47	2026-08-24 19:59:56	2026-08-24 20:01:01	f	2026-08-24 19:59:56	2026-08-24 20:01:01	2	0	2	1	t	\N	f
214	TCK-IHGY4P6C	B 2974	49	2026-08-26 11:15:06	2026-08-26 11:15:37	f	2026-08-26 11:15:06	2026-08-26 11:15:37	1	4000	2	\N	f	\N	f
204	TCK-RMTA35T8	B 6519	48	2026-08-24 19:23:09	2026-08-25 11:12:02	f	2026-08-24 19:23:09	2026-08-25 11:12:02	949	64000	2	\N	f	\N	f
202	TCK-QS06GUTV	B 4249	50	2026-08-24 18:57:20	2026-08-25 11:12:05	f	2026-08-24 18:57:20	2026-08-25 11:12:05	975	68000	2	\N	f	\N	f
216	TCK-B8PVKTP2	B 5416	48	2026-08-26 11:53:16	2026-08-26 11:53:21	f	2026-08-26 11:53:16	2026-08-26 11:53:21	1	4000	2	\N	f	\N	f
217	TCK-FTQJHBSD	B 5118	48	2026-08-26 11:57:25	2026-08-26 11:57:29	f	2026-08-26 11:57:25	2026-08-26 11:57:29	1	4000	2	\N	f	\N	f
240	TCK-MTDJCR2P	B1111EDGE	66	2026-08-28 15:03:47	2026-08-28 15:03:47	f	2026-08-28 15:03:47	2026-08-28 15:03:47	1	4000	2	\N	f	\N	f
48	TCK-FS0CNZ3D	B 3915	51	2026-07-22 17:17:30	2026-07-22 17:22:26	f	2026-07-22 17:17:30	2026-07-22 17:22:26	5	5000	1	\N	f	\N	f
45	TCK-XLD3E50X	B 5538	50	2026-07-22 17:14:21	2026-07-22 17:22:28	f	2026-07-22 17:14:21	2026-07-22 17:22:28	9	5000	1	\N	f	\N	f
58	TCK-ZEPHLODA	B 1246	56	2026-07-22 17:21:46	2026-07-22 17:22:31	f	2026-07-22 17:21:46	2026-07-22 17:22:31	1	5000	1	\N	f	\N	f
68	TCK-PMGZBL76	K 141 KU	50	2026-07-22 17:24:24	2026-07-22 17:24:36	f	2026-07-22 17:24:24	2026-07-22 17:24:36	1	0	1	1	t	\N	f
44	TCK-0SDVWYKK	B 9371	48	2026-07-22 17:13:44	2026-07-29 10:12:51	f	2026-07-22 17:13:44	2026-07-29 10:12:51	9660	805000	1	\N	f	\N	f
71	TCK-QET72VNA	B 1779	52	2026-07-29 10:07:45	2026-07-29 10:19:59	f	2026-07-29 10:07:45	2026-07-29 10:19:59	13	5000	1	\N	f	\N	f
55	TCK-FGDPPL8I	B 4680	78	2026-07-22 17:20:03	2026-07-29 10:20:05	f	2026-07-22 17:20:03	2026-07-29 10:20:05	9661	810000	1	\N	f	\N	f
49	TCK-LIOOTYGQ	B 8661	46	2026-07-22 17:17:33	2026-07-29 10:20:12	f	2026-07-22 17:17:33	2026-07-29 10:20:12	9663	810000	1	\N	f	\N	f
47	TCK-9X2MCG44	B 7598	49	2026-07-22 17:16:57	2026-07-29 10:20:21	f	2026-07-22 17:16:57	2026-07-29 10:20:21	9664	810000	1	\N	f	\N	f
65	TCK-DMX63TTC	B 7439	59	2026-07-22 17:22:07	2026-07-29 10:25:45	f	2026-07-22 17:22:07	2026-07-29 10:25:45	9664	810000	1	\N	f	\N	f
73	TCK-ZAJFQWLW	B 1090	74	2026-07-29 10:07:55	2026-07-29 10:30:45	f	2026-07-29 10:07:55	2026-07-29 10:30:45	23	5000	1	\N	f	\N	f
46	TCK-VY23QSNZ	B 1335	47	2026-07-22 17:16:37	2026-07-29 10:31:24	f	2026-07-22 17:16:37	2026-07-29 10:31:24	9675	810000	1	\N	f	\N	f
92	TCK-CL2ZXH3D	B 5539	59	2026-07-29 10:30:57	2026-07-29 10:32:04	f	2026-07-29 10:30:57	2026-07-29 10:32:04	2	5000	1	\N	f	\N	f
75	TCK-1HPQY35R	B 1208	48	2026-07-29 10:13:02	2026-07-29 10:48:58	f	2026-07-29 10:13:02	2026-07-29 10:48:58	36	5000	1	\N	f	\N	f
54	TCK-EHTMSFX5	B 1545	54	2026-07-22 17:19:08	2026-07-29 11:00:03	f	2026-07-22 17:19:08	2026-07-29 11:00:03	9701	810000	1	\N	f	\N	f
88	TCK-YSU2MWKJ	B 8178	72	2026-07-29 10:27:52	2026-07-29 11:13:00	f	2026-07-29 10:27:52	2026-07-29 11:13:00	46	5000	1	\N	f	\N	f
91	TCK-35MJRLK9	B 6598	74	2026-07-29 10:30:56	2026-07-29 11:14:30	f	2026-07-29 10:30:56	2026-07-29 11:14:30	44	5000	1	\N	f	\N	f
77	TCK-IAPHHXDO	B 6371	66	2026-07-29 10:19:35	2026-07-29 14:26:01	f	2026-07-29 10:19:35	2026-07-29 14:26:01	247	25000	1	\N	f	\N	f
93	TCK-SWJRSY9K	B 3255	48	2026-07-29 11:13:39	2026-08-03 16:44:35	f	2026-07-29 11:13:39	2026-08-03 16:44:35	7531	630000	1	\N	f	\N	f
66	TCK-CJTUX1BI	B 5056	62	2026-07-22 17:22:10	2026-08-03 16:44:44	f	2026-07-22 17:22:10	2026-08-03 16:44:44	17243	1440000	1	\N	f	\N	f
61	TCK-M0RQPXPJ	B 8678	75	2026-07-22 17:21:53	2026-08-13 09:51:55	f	2026-07-22 17:21:53	2026-08-13 09:51:55	31231	2605000	1	\N	f	\N	f
79	TCK-BQQPBVEO	B 6646	49	2026-07-29 10:27:30	2026-08-17 16:00:23	f	2026-07-29 10:27:30	2026-08-17 16:00:23	27693	2310000	1	\N	f	\N	f
84	TCK-7HFISMLE	B 3360	69	2026-07-29 10:27:40	2026-08-17 16:00:26	f	2026-07-29 10:27:40	2026-08-17 16:00:26	27693	2310000	1	\N	f	\N	f
80	TCK-6H7OVWSJ	B 8744	46	2026-07-29 10:27:32	2026-08-17 16:00:35	f	2026-07-29 10:27:32	2026-08-17 16:00:35	27694	2310000	1	\N	f	\N	f
52	TCK-XMJGSJPL	B 7497	53	2026-07-22 17:18:19	2026-08-17 16:00:38	f	2026-07-22 17:18:19	2026-08-17 16:00:38	37363	3115000	1	\N	f	\N	f
86	TCK-LEXDR95T	B 8440	78	2026-07-29 10:27:46	2026-08-17 16:00:43	f	2026-07-29 10:27:46	2026-08-17 16:00:43	27693	2310000	1	\N	f	\N	f
62	TCK-DH3QBJMN	B 5955	58	2026-07-22 17:21:55	2026-08-17 16:00:46	f	2026-07-22 17:21:55	2026-08-17 16:00:46	37359	3115000	1	\N	f	\N	f
83	TCK-JXBRXFXR	B 4006	67	2026-07-29 10:27:38	2026-08-17 16:00:54	f	2026-07-29 10:27:38	2026-08-17 16:00:54	27694	2310000	1	\N	f	\N	f
70	TCK-ZXAF6CJB	B 4869	51	2026-07-29 10:07:42	2026-08-17 16:00:59	f	2026-07-29 10:07:42	2026-08-17 16:00:59	27714	2310000	1	\N	f	\N	f
90	TCK-C0QQHWL1	B 7163	81	2026-07-29 10:30:53	2026-08-19 14:58:14	f	2026-07-29 10:30:53	2026-08-19 14:58:14	30508	2545000	1	\N	f	\N	f
51	TCK-FY9IOQAB	B 2125	80	2026-07-22 17:18:15	2026-08-19 15:32:22	f	2026-07-22 17:18:15	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
53	TCK-KFC3RCXE	B 2655	79	2026-07-22 17:18:55	2026-08-19 15:32:22	f	2026-07-22 17:18:55	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
97	MOB-6A82AAB771120	K 141 KU	48	2026-08-17 13:31:19	2026-08-17 13:31:46	f	2026-08-17 13:31:19	2026-08-17 13:31:46	1	5000	\N	1	f	\N	f
98	MOB-6A82AB0792F6C	K 141 KU	48	2026-08-17 13:32:39	2026-08-17 13:32:44	f	2026-08-17 13:32:39	2026-08-17 13:32:44	1	0	\N	1	t	\N	f
99	MOB-6A82ACC822CA6	K 141 KU	48	2026-08-17 13:40:08	2026-08-17 13:40:25	f	2026-08-17 13:40:08	2026-08-17 13:40:25	1	0	\N	1	t	\N	f
100	TCK-RWJ14PCX	K 141 KU	48	2026-08-17 13:41:46	2026-08-17 13:41:57	f	2026-08-17 13:41:46	2026-08-17 13:41:57	1	0	1	1	t	\N	f
101	MOB-6A82BEE05AB45	K 141 KU	48	2026-08-17 14:57:20	2026-08-17 14:57:22	f	2026-08-17 14:57:20	2026-08-17 14:57:22	1	0	\N	1	t	\N	f
102	MOB-6A82BEE563E74	K 141 KU	48	2026-08-17 14:57:25	2026-08-17 14:57:28	f	2026-08-17 14:57:25	2026-08-17 14:57:28	1	0	\N	1	t	\N	f
103	MOB-6A82BEEA09634	K 141 KU	48	2026-08-17 14:57:30	2026-08-17 14:57:32	f	2026-08-17 14:57:30	2026-08-17 14:57:32	1	0	\N	1	t	\N	f
104	MOB-6A82BEEE9C0C6	K 141 KU	48	2026-08-17 14:57:34	2026-08-17 14:57:37	f	2026-08-17 14:57:34	2026-08-17 14:57:37	1	0	\N	1	t	\N	f
105	MOB-6A82BEF433267	K 141 KU	48	2026-08-17 14:57:40	2026-08-17 14:57:43	f	2026-08-17 14:57:40	2026-08-17 14:57:43	1	0	\N	1	t	\N	f
76	TCK-J3OWZWSX	B 8052	64	2026-07-29 10:13:17	2026-08-17 16:00:32	f	2026-07-29 10:13:17	2026-08-17 16:00:32	27708	2310000	1	\N	f	\N	f
72	TCK-UE9WVGRU	B 8653	56	2026-07-29 10:07:50	2026-08-17 16:00:49	f	2026-07-29 10:07:50	2026-08-17 16:00:49	27713	2310000	1	\N	f	\N	f
106	TCK-NCHTLD8E	B 3321 HH	48	2026-08-19 14:42:13	2026-08-19 14:46:33	f	2026-08-19 14:42:13	2026-08-19 14:46:33	5	5000	1	\N	f	\N	f
107	TCK-ZKJ3BXWV	K 141 KU	51	2026-08-19 14:45:32	2026-08-19 14:46:37	f	2026-08-19 14:45:32	2026-08-19 14:46:37	2	0	1	1	t	\N	f
108	TCK-XZKDPYMH	B 5365	48	2026-08-19 14:52:03	2026-08-19 14:52:08	f	2026-08-19 14:52:03	2026-08-19 14:52:08	1	5000	1	\N	f	\N	f
109	TCK-UERLH6W1	K 141 KU	48	2026-08-19 14:57:10	2026-08-19 14:58:11	f	2026-08-19 14:57:10	2026-08-19 14:58:11	2	0	1	1	t	\N	f
89	TCK-7DFWC18F	B 3290	73	2026-07-29 10:30:51	2026-08-19 14:58:20	f	2026-07-29 10:30:51	2026-08-19 14:58:20	30508	2545000	1	\N	f	\N	f
56	TCK-LKM5583Q	B 5470	55	2026-07-22 17:21:33	2026-08-19 15:32:22	f	2026-07-22 17:21:33	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
57	TCK-NWNHUBDX	B 9311	77	2026-07-22 17:21:41	2026-08-19 15:32:22	f	2026-07-22 17:21:41	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
60	TCK-3J7KNXX9	B 4774	57	2026-07-22 17:21:52	2026-08-19 15:32:22	f	2026-07-22 17:21:52	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
63	TCK-UWVAVMEJ	B 2456	60	2026-07-22 17:21:58	2026-08-19 15:32:22	f	2026-07-22 17:21:58	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
67	TCK-AAXB1GFO	B 6965	63	2026-07-22 17:22:14	2026-08-19 15:32:22	f	2026-07-22 17:22:14	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
69	TCK-MMSMCWME	B 3605	50	2026-07-22 17:25:49	2026-08-19 15:32:22	f	2026-07-22 17:25:49	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
74	TCK-UGJEO1LB	B 6155	61	2026-07-29 10:12:20	2026-08-19 15:32:22	f	2026-07-29 10:12:20	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
78	TCK-295SHKVN	B 6280	68	2026-07-29 10:19:41	2026-08-19 15:32:22	f	2026-07-29 10:19:41	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
81	TCK-BBRF2EXA	B 9836	52	2026-07-29 10:27:35	2026-08-19 15:32:22	f	2026-07-29 10:27:35	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
82	TCK-BY6BCLUO	B 4473	65	2026-07-29 10:27:36	2026-08-19 15:32:22	f	2026-07-29 10:27:36	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
85	TCK-7BO7YA1T	B 3894	70	2026-07-29 10:27:41	2026-08-19 15:32:22	f	2026-07-29 10:27:41	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
87	TCK-CC1H3LCN	B 9169	71	2026-07-29 10:27:48	2026-08-19 15:32:22	f	2026-07-29 10:27:48	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
94	TCK-BPT4GJXS	B 2546	47	2026-07-29 11:13:49	2026-08-19 15:32:22	f	2026-07-29 11:13:49	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
59	TCK-YLNU8MKL	B 1500	76	2026-07-22 17:21:50	2026-08-19 15:32:22	f	2026-07-22 17:21:50	2026-08-19 15:32:22	\N	0	\N	\N	f	\N	f
110	TCK-UGCOLFR3	K 141 KU	48	2026-08-19 14:58:45	2026-08-19 15:32:22	f	2026-08-19 14:58:45	2026-08-19 15:32:22	\N	0	\N	1	f	\N	f
113	TCK-PONNNNVW	K 141 KU	48	2026-08-19 15:50:25	2026-08-19 15:50:49	f	2026-08-19 15:50:25	2026-08-19 15:50:50	1	0	1	1	t	\N	f
111	TCK-HILJ2EU0	K 141 KU	53	2026-08-19 15:33:47	2026-08-19 15:45:37	f	2026-08-19 15:33:47	2026-08-19 15:45:37	12	0	1	1	t	\N	f
112	TCK-TFVS3O7K	K 141 KU	52	2026-08-19 15:45:56	2026-08-19 15:46:51	f	2026-08-19 15:45:56	2026-08-19 15:46:51	1	0	1	1	t	\N	f
114	TCK-56VXVFMQ	K 141 KU	52	2026-08-19 15:50:54	2026-08-19 15:51:46	f	2026-08-19 15:50:54	2026-08-19 15:51:46	1	0	1	1	t	\N	f
117	TCK-KW5P5ETE	K 141 KU	51	2026-08-19 15:52:05	2026-08-19 15:52:37	f	2026-08-19 15:52:05	2026-08-19 15:52:37	1	0	1	1	t	\N	f
118	TCK-NCXGWMFX	K 141 KU	51	2026-08-19 15:52:40	2026-08-19 15:54:20	f	2026-08-19 15:52:40	2026-08-19 15:54:20	2	0	1	1	t	\N	f
119	TCK-A5NFO6DS	K 141 KU	51	2026-08-19 15:54:25	2026-08-19 15:54:54	f	2026-08-19 15:54:25	2026-08-19 15:54:54	1	0	1	1	t	\N	f
120	TCK-ORDCFXCD	K 141 KU	51	2026-08-19 15:54:57	2026-08-19 15:55:28	f	2026-08-19 15:54:57	2026-08-19 15:55:28	1	0	1	1	t	\N	f
122	TCK-UGTRPWS6	K 141 KU	47	2026-08-19 15:57:15	2026-08-19 16:01:01	f	2026-08-19 15:57:15	2026-08-19 16:01:01	4	0	1	1	t	\N	f
123	TCK-OJH8KWHH	K 141 KU	47	2026-08-19 16:01:42	2026-08-19 16:02:02	f	2026-08-19 16:01:42	2026-08-19 16:02:02	1	0	1	1	t	\N	f
124	TCK-SCUGPOQW	K 141 KU	47	2026-08-19 16:02:06	2026-08-19 16:03:10	f	2026-08-19 16:02:06	2026-08-19 16:03:10	2	0	1	1	t	\N	f
125	TCK-BE2HUOWF	K 141 KU	61	2026-08-19 16:03:13	2026-08-19 16:10:02	f	2026-08-19 16:03:13	2026-08-19 16:10:02	7	0	1	1	t	\N	f
128	TCK-F1BT9DRB	K 141 KU	69	2026-08-19 16:17:26	2026-08-19 16:28:16	f	2026-08-19 16:17:26	2026-08-19 16:28:16	11	0	1	1	t	\N	f
126	TCK-00TP2EDO	K 141 KU	59	2026-08-19 16:10:05	2026-08-19 16:11:56	f	2026-08-19 16:10:05	2026-08-19 16:11:56	2	0	1	1	t	\N	f
127	TCK-LJNAXCSF	K 141 KU	63	2026-08-19 16:12:00	2026-08-19 16:17:23	f	2026-08-19 16:12:00	2026-08-19 16:17:23	6	0	1	1	t	\N	f
115	TCK-MFFMREE6	B 5767	48	2026-08-19 15:51:57	2026-08-19 16:42:40	f	2026-08-19 15:51:57	2026-08-19 16:42:40	51	5000	1	\N	f	\N	f
116	TCK-LW3KVAUV	B 4201	50	2026-08-19 15:51:59	2026-08-19 16:42:45	f	2026-08-19 15:51:59	2026-08-19 16:42:45	51	5000	1	\N	f	\N	f
121	TCK-6NF8ROGC	B 8126	63	2026-08-19 15:55:38	2026-08-19 16:33:44	f	2026-08-19 15:55:38	2026-08-19 16:33:44	39	5000	1	\N	f	\N	f
130	TCK-WQEYT87E	B 1441	48	2026-08-19 16:42:49	2026-08-19 16:55:28	f	2026-08-19 16:42:49	2026-08-19 16:55:28	13	5000	1	\N	f	\N	f
132	TCK-0YDFG36M	B 4266	48	2026-08-19 16:56:41	2026-08-19 16:56:52	f	2026-08-19 16:56:41	2026-08-19 16:56:52	1	5000	1	\N	f	\N	f
135	TCK-PWF0WFYI	B 1136	51	2026-08-19 16:57:49	2026-08-19 16:59:19	f	2026-08-19 16:57:49	2026-08-19 16:59:19	2	5000	1	\N	f	\N	f
133	TCK-J0LSFTR1	B 3570	50	2026-08-19 16:57:32	2026-08-19 16:59:23	f	2026-08-19 16:57:32	2026-08-19 16:59:23	2	5000	1	\N	f	\N	f
131	TCK-XRKFRW0S	K 141 KU	71	2026-08-19 16:55:42	2026-08-19 16:56:35	f	2026-08-19 16:55:42	2026-08-19 16:56:35	1	0	1	1	t	\N	f
173	TCK-BTW8XNTS	L 1 ACT	50	2026-08-20 15:53:35	2026-08-20 15:54:02	f	2026-08-20 15:53:35	2026-08-20 15:54:02	1	5000	1	\N	f	\N	f
152	TCK-XDWPTD4Q	K 141 KU	48	2026-08-20 10:48:57	2026-08-20 10:49:38	f	2026-08-20 10:48:57	2026-08-20 10:49:38	1	5000	1	\N	f	\N	f
153	TCK-NVPMOERM	B 332	48	2026-08-20 10:51:36	2026-08-20 10:52:00	f	2026-08-20 10:51:36	2026-08-20 10:52:00	1	5000	1	\N	f	\N	f
154	TCK-ZV96UXWP	B 562 JJ	48	2026-08-20 10:53:45	2026-08-20 10:54:15	f	2026-08-20 10:53:45	2026-08-20 10:54:15	1	5000	1	\N	f	\N	f
167	TCK-QMWNDTXY	EA 1559 UZ	50	2026-08-20 13:41:02	2026-08-20 13:43:22	f	2026-08-20 13:41:02	2026-08-20 13:43:22	3	5000	1	\N	f	\N	f
162	TCK-HKLPVTMY	K 141 KU	48	2026-08-20 11:27:39	2026-08-20 11:28:29	f	2026-08-20 11:27:39	2026-08-20 11:28:29	1	0	1	1	t	\N	f
163	TCK-NGABCMFQ	B 4580	50	2026-08-20 11:28:07	2026-08-20 11:28:32	f	2026-08-20 11:28:07	2026-08-20 11:28:32	1	5000	1	\N	f	\N	f
174	TCK-ICL1IFJB	N 3818 ACT	48	2026-08-20 15:54:48	2026-08-20 15:56:16	f	2026-08-20 15:54:48	2026-08-20 15:56:16	2	5000	1	\N	f	\N	f
165	TCK-85L1MA8O	B 8819 AGF	50	2026-08-20 13:35:45	2026-08-20 13:36:25	f	2026-08-20 13:35:45	2026-08-20 13:36:25	1	5000	1	\N	f	\N	f
170	TCK-C4ZJ8RP9	B 3655	48	2026-08-20 14:17:55	2026-08-20 14:37:48	f	2026-08-20 14:17:55	2026-08-20 14:37:48	20	5000	1	\N	f	\N	f
171	TCK-BQAUMQRL	B 8643	50	2026-08-20 14:17:58	2026-08-20 14:37:54	f	2026-08-20 14:17:58	2026-08-20 14:37:54	20	5000	1	\N	f	\N	f
177	TCK-TB8SPCAN	U 5590 KK	50	2026-08-20 16:34:54	2026-08-20 16:35:45	f	2026-08-20 16:34:54	2026-08-20 16:35:45	1	5000	1	\N	f	\N	f
172	TCK-31USV7WA	EB 9918 UHA	48	2026-08-20 15:41:37	2026-08-20 15:46:09	f	2026-08-20 15:41:37	2026-08-20 15:46:09	5	5000	1	\N	f	\N	f
178	TCK-311LXWNT	J 3345 KKI	48	2026-08-21 09:12:29	2026-08-21 09:13:11	f	2026-08-21 09:12:29	2026-08-21 09:13:11	1	5000	1	\N	f	\N	f
182	TCK-PFTQUPJP	B 1 RIO	48	2026-08-21 09:48:38	2026-08-21 09:49:25	f	2026-08-21 09:48:38	2026-08-21 09:49:25	1	5000	1	\N	f	\N	f
185	TCK-METBGSAA	B 3136	84	2026-08-21 10:23:44	2026-08-21 10:23:55	f	2026-08-21 10:23:44	2026-08-21 10:23:55	1	5000	1	\N	f	\N	f
183	TCK-D4CWTRL3	B 1057	48	2026-08-21 10:23:36	2026-08-21 10:24:00	f	2026-08-21 10:23:36	2026-08-21 10:24:00	1	5000	1	\N	f	\N	f
184	TCK-BSPUBGHX	B 2459	50	2026-08-21 10:23:41	2026-08-21 10:24:03	f	2026-08-21 10:23:41	2026-08-21 10:24:03	1	5000	1	\N	f	\N	f
186	TCK-T5DRQ4BC	B 7855	48	2026-08-21 10:50:55	2026-08-21 10:51:00	f	2026-08-21 10:50:55	2026-08-21 10:51:00	1	4000	2	\N	f	\N	f
188	TCK-HFXIVSO5	B 6974	48	2026-08-21 14:09:12	2026-08-21 14:09:51	f	2026-08-21 14:09:12	2026-08-21 14:09:51	1	4000	2	\N	f	\N	f
189	TCK-VUSPLT1U	B 1503	50	2026-08-21 14:09:15	2026-08-21 14:09:54	f	2026-08-21 14:09:15	2026-08-21 14:09:54	1	4000	2	\N	f	\N	f
176	TCK-PSCYZAI4	K 141 KU	66	2026-08-20 16:17:35	2026-08-20 16:34:49	f	2026-08-20 16:17:35	2026-08-20 16:34:49	18	0	1	1	t	\N	f
169	TCK-G6AEUOLK	K 141 KU	65	2026-08-20 14:16:38	2026-08-20 14:37:58	f	2026-08-20 14:16:38	2026-08-20 14:37:58	22	0	1	1	t	\N	f
180	TCK-IFEKX3Z7	K 141 KU	54	2026-08-21 09:41:18	2026-08-21 09:46:13	f	2026-08-21 09:41:18	2026-08-21 09:46:13	5	0	1	1	t	\N	f
197	TCK-X3ZGCMOZ	K 141 KU	66	2026-08-23 11:43:23	2026-08-23 11:44:44	f	2026-08-23 11:43:23	2026-08-23 11:44:44	2	0	2	1	t	\N	f
161	TCK-YJFZ6ENN	K 141 KU	62	2026-08-20 11:26:18	2026-08-20 11:27:16	f	2026-08-20 11:26:18	2026-08-20 11:27:16	1	0	1	1	t	\N	f
160	TCK-UHYII5QS	K 141 KU	60	2026-08-20 11:22:02	2026-08-20 11:23:56	f	2026-08-20 11:22:02	2026-08-20 11:23:56	2	0	1	1	t	\N	f
209	TCK-USIUCMUM	K 141 KU	75	2026-08-24 20:22:09	2026-08-25 11:11:59	f	2026-08-24 20:22:09	2026-08-25 11:11:59	890	0	2	1	t	\N	f
179	TCK-KKHW5ULO	K 141 KU	78	2026-08-21 09:13:43	2026-08-21 09:15:56	f	2026-08-21 09:13:43	2026-08-21 09:15:56	3	0	1	1	t	\N	f
138	TCK-HV876CXW	K 141 KU	50	2026-08-19 17:01:48	2026-08-19 17:02:27	f	2026-08-19 17:01:48	2026-08-19 17:02:27	1	0	1	1	t	\N	f
181	TCK-F2NATEWT	K 141 KU	76	2026-08-21 09:46:20	2026-08-21 09:59:49	f	2026-08-21 09:46:20	2026-08-21 09:59:49	14	0	1	1	t	\N	f
168	TCK-QG9HQZBX	K 141 KU	77	2026-08-20 13:41:56	2026-08-20 13:43:56	f	2026-08-20 13:41:56	2026-08-20 13:43:56	3	0	1	1	t	\N	f
175	TCK-ONLHKJH8	K 141 KU	80	2026-08-20 16:06:15	2026-08-20 16:16:46	f	2026-08-20 16:06:15	2026-08-20 16:16:46	11	0	1	1	t	\N	f
194	TCK-UMELCHTV	K 141 KU	46	2026-08-21 15:45:00	2026-08-21 15:48:51	f	2026-08-21 15:45:00	2026-08-21 15:48:51	4	0	2	1	t	\N	f
142	TCK-HYWSLZUM	K 141 KU	63	2026-08-19 17:19:11	2026-08-19 17:20:06	f	2026-08-19 17:19:11	2026-08-19 17:20:06	1	0	1	1	t	\N	f
206	TCK-Q4SYIHAQ	K 141 KU	67	2026-08-24 19:55:43	2026-08-24 19:59:52	f	2026-08-24 19:55:43	2026-08-24 19:59:52	5	0	2	1	t	\N	f
140	TCK-PBCADH0Q	K 141 KU	81	2026-08-19 17:14:07	2026-08-19 17:19:07	f	2026-08-19 17:14:07	2026-08-19 17:19:07	6	0	1	1	t	\N	f
164	TCK-UDT7UBF8	K 141 KU	73	2026-08-20 13:34:26	2026-08-20 13:35:21	f	2026-08-20 13:34:26	2026-08-20 13:35:21	1	0	1	1	t	\N	f
137	TCK-KLMGXPKM	K 141 KU	57	2026-08-19 17:00:25	2026-08-19 17:01:36	f	2026-08-19 17:00:25	2026-08-19 17:01:36	2	0	1	1	t	\N	f
208	TCK-OEYOHSIY	K 141 KU	70	2026-08-24 20:01:13	2026-08-24 20:20:44	f	2026-08-24 20:01:13	2026-08-24 20:20:44	20	0	2	1	t	\N	f
159	TCK-HKUHWLBG	K 141 KU	72	2026-08-20 11:20:48	2026-08-20 11:21:46	f	2026-08-20 11:20:48	2026-08-20 11:21:46	1	0	1	1	t	\N	f
211	TCK-YV61UIHN	K 141 KU	64	2026-08-26 11:12:43	2026-08-26 11:14:35	f	2026-08-26 11:12:43	2026-08-26 11:14:35	2	0	2	1	t	\N	f
145	TCK-IKLSQ9R6	K 141 KU	73	2026-08-19 21:19:16	2026-08-20 10:07:51	f	2026-08-19 21:19:16	2026-08-20 10:07:51	769	0	1	1	t	\N	f
129	TCK-T7IZUSAC	K 141 KU	62	2026-08-19 16:28:20	2026-08-19 16:29:59	f	2026-08-19 16:28:20	2026-08-19 16:29:59	2	0	1	1	t	\N	f
203	TCK-JTVQ898W	K 141 KU	62	2026-08-24 18:57:40	2026-08-24 19:32:33	f	2026-08-24 18:57:40	2026-08-24 19:32:33	35	0	2	1	t	\N	f
215	TCK-DVL1EZWQ	K 141 KU	70	2026-08-26 11:52:44	2026-08-26 12:02:30	f	2026-08-26 11:52:44	2026-08-26 12:02:30	10	0	2	1	t	\N	f
218	TCK-J7QJFTRN	K 141 KU	66	2026-08-26 12:02:35	2026-08-26 12:03:06	f	2026-08-26 12:02:35	2026-08-26 12:03:06	1	0	2	1	t	\N	f
219	TCK-XRZUUV54	B1234TEST	48	2026-08-28 14:56:17	2026-08-28 14:56:17	f	2026-08-28 14:56:17	2026-08-28 14:56:17	1	4000	2	\N	f	\N	f
241	TCK-9VSJO5OP	B2222OV1	66	2026-08-28 15:03:47	2026-08-28 15:48:47	f	2026-08-28 15:03:47	2026-08-28 15:48:47	46	4000	2	\N	f	\N	f
221	TCK-YKJ2IQOO	B9999VIOL	59	2026-08-28 14:56:18	2026-08-28 14:56:18	f	2026-08-28 14:56:18	2026-08-28 14:56:18	1	4000	2	\N	f	\N	f
223	TCK-HPOK6RHC	B1234TEST	48	2026-08-28 14:57:46	2026-08-28 14:57:47	f	2026-08-28 14:57:46	2026-08-28 14:57:47	1	4000	2	\N	f	\N	f
228	TCK-H3XG69V5	B5678TEST	46	2026-08-28 14:59:53	2026-08-28 15:48:56	f	2026-08-28 14:59:53	2026-08-28 15:48:56	50	4000	2	\N	f	46	f
243	TCK-M0KX9INS	B1234TEST	65	2026-08-28 15:04:05	2026-08-28 15:04:05	f	2026-08-28 15:04:05	2026-08-28 15:04:05	1	4000	2	\N	f	\N	f
225	TCK-VIGFHR7O	B9999VIOL	54	2026-08-28 14:57:47	2026-08-28 14:57:48	f	2026-08-28 14:57:47	2026-08-28 14:57:48	1	4000	2	\N	f	\N	f
227	TCK-GPONZ3SQ	B1234TEST	48	2026-08-28 14:59:53	2026-08-28 14:59:53	f	2026-08-28 14:59:53	2026-08-28 14:59:53	1	4000	2	\N	f	\N	f
250	TCK-1GZHVZRO	B2222OV2	79	2026-08-28 15:04:08	2026-08-28 15:49:01	f	2026-08-28 15:04:08	2026-08-28 15:49:01	45	4000	2	\N	f	\N	f
258	TCK-SW1IX6IS	B2222OV2	78	2026-08-28 15:24:43	2026-08-28 15:48:29	f	2026-08-28 15:24:43	2026-08-28 15:48:29	24	4000	2	\N	f	\N	f
229	TCK-PERB9SXR	B9999VIOL	75	2026-08-28 14:59:53	2026-08-28 14:59:54	f	2026-08-28 14:59:53	2026-08-28 14:59:54	1	4000	2	\N	f	\N	f
231	TCK-SQE9IZMW	B8888STF	48	2026-08-28 14:59:55	2026-08-28 14:59:55	f	2026-08-28 14:59:55	2026-08-28 14:59:55	1	4000	2	\N	f	\N	f
232	TCK-8SYDSFIS	B1111EDGE	48	2026-08-28 14:59:56	2026-08-28 14:59:56	f	2026-08-28 14:59:56	2026-08-28 14:59:56	1	4000	2	\N	f	\N	f
235	TCK-7KDAUXLH	B1234TEST	66	2026-08-28 15:03:44	2026-08-28 15:03:44	f	2026-08-28 15:03:44	2026-08-28 15:03:44	1	4000	2	\N	f	\N	f
220	TCK-PFWHMM7K	B5678TEST	50	2026-08-28 14:56:17	2026-08-28 15:48:45	f	2026-08-28 14:56:17	2026-08-28 15:48:45	53	4000	2	\N	f	50	f
253	TCK-QRSFIIG3	B9999VIOL	76	2026-08-28 15:24:41	2026-08-28 15:24:41	f	2026-08-28 15:24:41	2026-08-28 15:24:41	1	4000	2	\N	f	\N	f
237	TCK-EXFHJL2X	B9999VIOL	59	2026-08-28 15:03:44	2026-08-28 15:03:45	f	2026-08-28 15:03:44	2026-08-28 15:03:45	1	4000	2	\N	f	\N	f
239	TCK-HAOUFQFT	B8888STF	66	2026-08-28 15:03:46	2026-08-28 15:03:46	f	2026-08-28 15:03:46	2026-08-28 15:03:46	1	4000	2	\N	f	\N	f
245	TCK-4DLBUK7T	B9999VIOL	77	2026-08-28 15:04:05	2026-08-28 15:04:06	f	2026-08-28 15:04:05	2026-08-28 15:04:06	1	4000	2	\N	f	\N	f
247	TCK-QU9LCWBD	B8888STF	65	2026-08-28 15:04:07	2026-08-28 15:04:07	f	2026-08-28 15:04:07	2026-08-28 15:04:07	1	4000	2	\N	f	\N	f
248	TCK-CA6Z9NDF	B1111EDGE	65	2026-08-28 15:04:07	2026-08-28 15:04:07	f	2026-08-28 15:04:07	2026-08-28 15:04:07	1	4000	2	\N	f	\N	f
251	TCK-7KBJ6URN	B1234TEST	64	2026-08-28 15:24:40	2026-08-28 15:24:40	f	2026-08-28 15:24:40	2026-08-28 15:24:40	1	4000	2	\N	f	\N	f
260	TCK-IAY0MMCS	B2222OV1	71	2026-08-28 15:26:21	2026-08-28 15:48:33	f	2026-08-28 15:26:21	2026-08-28 15:48:33	23	4000	2	\N	f	\N	f
255	TCK-VSE8Z3NO	B8888STF	64	2026-08-28 15:24:42	2026-08-28 15:24:42	f	2026-08-28 15:24:42	2026-08-28 15:24:42	1	4000	2	\N	f	\N	f
256	TCK-T6PK9HZY	B1111EDGE	64	2026-08-28 15:24:43	2026-08-28 15:24:43	f	2026-08-28 15:24:43	2026-08-28 15:24:43	1	4000	2	\N	f	\N	f
259	TCK-CMEFKUTJ	B1111EDGE	63	2026-08-28 15:26:20	2026-08-28 15:26:20	f	2026-08-28 15:26:20	2026-08-28 15:26:20	1	4000	2	\N	f	\N	f
262	TCK-YAICVJUX	B1234TEST	77	2026-08-28 15:26:51	2026-08-28 15:26:51	f	2026-08-28 15:26:51	2026-08-28 15:26:51	1	4000	2	\N	f	\N	f
249	TCK-2E4OYZC2	B2222OV1	65	2026-08-28 15:04:08	2026-08-28 15:48:49	f	2026-08-28 15:04:08	2026-08-28 15:48:49	45	4000	2	\N	f	\N	f
264	TCK-ELONLLP3	B9999VIOL	81	2026-08-28 15:26:51	2026-08-28 15:26:52	f	2026-08-28 15:26:51	2026-08-28 15:26:52	1	4000	2	\N	f	\N	f
266	TCK-IYHXXV6K	B8888STF	77	2026-08-28 15:26:53	2026-08-28 15:26:53	f	2026-08-28 15:26:53	2026-08-28 15:26:53	1	4000	2	\N	f	\N	f
267	TCK-ECAUQJJS	B1111EDGE	77	2026-08-28 15:26:53	2026-08-28 15:26:53	f	2026-08-28 15:26:53	2026-08-28 15:26:53	1	4000	2	\N	f	\N	f
233	TCK-RJ4GDVIV	B2222OV1	48	2026-08-28 14:59:56	2026-08-28 15:45:45	f	2026-08-28 14:59:56	2026-08-28 15:45:45	46	4000	2	\N	f	\N	f
254	TCK-54OFD6CY	L 90 HJ	55	2026-08-28 15:24:41	2026-08-28 15:41:15	f	2026-08-28 15:24:41	2026-08-28 15:41:15	17	4000	2	\N	f	\N	f
246	TCK-IKY59UAR	J98U	54	2026-08-28 15:04:06	2026-08-28 15:42:07	f	2026-08-28 15:04:06	2026-08-28 15:42:07	39	4000	2	\N	f	\N	f
238	TCK-9OKQBHFA	O 876 DWS	80	2026-08-28 15:03:45	2026-08-28 15:43:17	f	2026-08-28 15:03:45	2026-08-28 15:43:17	40	4000	2	\N	f	\N	f
230	TCK-09FIV3NM	P 1076 MU	52	2026-08-28 14:59:54	2026-08-28 15:44:06	f	2026-08-28 14:59:54	2026-08-28 15:44:06	45	4000	2	\N	f	\N	f
222	TCK-LQWQR0CZ	M 232 DS	49	2026-08-28 14:56:18	2026-08-28 15:44:51	f	2026-08-28 14:56:18	2026-08-28 15:44:51	49	4000	2	\N	f	\N	f
244	TCK-F8GGZWYW	B5678TEST	67	2026-08-28 15:04:05	2026-08-28 15:45:51	f	2026-08-28 15:04:05	2026-08-28 15:45:51	42	4000	2	\N	f	67	f
234	TCK-ZO6HOMAO	B2222OV2	68	2026-08-28 14:59:56	2026-08-28 15:48:35	f	2026-08-28 14:59:56	2026-08-28 15:48:35	49	4000	2	\N	f	\N	f
242	TCK-YACR3WUM	B2222OV2	69	2026-08-28 15:03:47	2026-08-28 15:48:37	f	2026-08-28 15:03:47	2026-08-28 15:48:37	45	4000	2	\N	f	\N	f
263	TCK-Y8MSVZOD	B5678TEST	56	2026-08-28 15:26:51	2026-08-28 15:48:41	f	2026-08-28 15:26:51	2026-08-28 15:48:41	22	4000	2	\N	f	56	f
261	TCK-GYAUP7BQ	B2222OV2	63	2026-08-28 15:26:21	2026-08-28 15:48:51	f	2026-08-28 15:26:21	2026-08-28 15:48:51	23	4000	2	\N	f	\N	f
224	TCK-ZVFH65BY	B5678TEST	47	2026-08-28 14:57:46	2026-08-28 15:48:53	f	2026-08-28 14:57:46	2026-08-28 15:48:53	52	4000	2	\N	f	47	f
268	TCK-5LAW7SHV	B2222OV1	77	2026-08-28 15:26:53	2026-08-28 15:49:05	f	2026-08-28 15:26:53	2026-08-28 15:49:05	23	4000	2	\N	f	\N	f
269	TCK-P1EMY639	B2222OV2	57	2026-08-28 15:26:54	2026-08-28 15:49:14	f	2026-08-28 15:26:54	2026-08-28 15:49:14	23	4000	2	\N	f	\N	f
270	TCK-XJZ9FEL0	B1234TEST	76	2026-08-28 15:27:50	2026-08-28 15:27:50	f	2026-08-28 15:27:50	2026-08-28 15:27:50	1	4000	2	\N	f	\N	f
289	TCK-19UFCIBY	L 00 JJ	51	2026-08-28 15:51:27	2026-08-28 15:52:39	f	2026-08-28 15:51:27	2026-08-28 15:52:39	2	4000	2	\N	f	\N	f
272	TCK-ESKDTZXE	B9999VIOL	81	2026-08-28 15:27:50	2026-08-28 15:27:51	f	2026-08-28 15:27:50	2026-08-28 15:27:51	1	4000	2	\N	f	\N	f
274	TCK-1NVZFANF	B8888STF	76	2026-08-28 15:27:52	2026-08-28 15:27:52	f	2026-08-28 15:27:52	2026-08-28 15:27:52	1	4000	2	\N	f	\N	f
275	TCK-ZB04ITRO	B1111EDGE	76	2026-08-28 15:27:52	2026-08-28 15:27:52	f	2026-08-28 15:27:52	2026-08-28 15:27:52	1	4000	2	\N	f	\N	f
278	TCK-5DYGPZEJ	B1234TEST	75	2026-08-28 15:29:08	2026-08-28 15:29:09	f	2026-08-28 15:29:08	2026-08-28 15:29:09	1	4000	2	\N	f	\N	f
292	TCK-7CXJ7B8V	B2222OV1	48	2026-08-28 15:51:30	2026-08-28 15:52:53	f	2026-08-28 15:51:30	2026-08-28 15:52:53	2	4000	2	\N	f	\N	f
287	TCK-NWHO6AGM	B5678TEST	50	2026-08-28 15:51:26	2026-08-28 15:52:55	f	2026-08-28 15:51:26	2026-08-28 15:52:55	2	4000	2	\N	f	50	f
293	TCK-HUXE4PRM	B2222OV2	49	2026-08-28 15:51:30	2026-08-28 15:52:58	f	2026-08-28 15:51:30	2026-08-28 15:52:58	2	4000	2	\N	f	\N	f
280	TCK-Y6HXMZ3V	B9999VIOL	60	2026-08-28 15:29:09	2026-08-28 15:29:09	f	2026-08-28 15:29:09	2026-08-28 15:29:09	1	4000	2	\N	f	\N	f
282	TCK-JJVKUJIZ	B8888STF	75	2026-08-28 15:29:10	2026-08-28 15:29:10	f	2026-08-28 15:29:10	2026-08-28 15:29:10	1	4000	2	\N	f	\N	f
283	TCK-0DCROFA6	B1111EDGE	75	2026-08-28 15:29:11	2026-08-28 15:29:11	f	2026-08-28 15:29:11	2026-08-28 15:29:11	1	4000	2	\N	f	\N	f
273	TCK-JKXIRDXY	M 98 HH	73	2026-08-28 15:27:51	2026-08-28 15:40:50	f	2026-08-28 15:27:51	2026-08-28 15:40:50	13	4000	2	\N	f	\N	f
265	TCK-NSOF6S8H	J 92	62	2026-08-28 15:26:52	2026-08-28 15:41:01	f	2026-08-28 15:26:52	2026-08-28 15:41:01	15	4000	2	\N	f	\N	f
281	TCK-GSYMJJWB	J 9832	59	2026-08-28 15:29:09	2026-08-28 15:41:28	f	2026-08-28 15:29:09	2026-08-28 15:41:28	13	4000	2	\N	f	\N	f
226	TCK-MMEUN48W	LK 12 W	51	2026-08-28 14:57:47	2026-08-28 15:44:34	f	2026-08-28 14:57:47	2026-08-28 15:44:34	47	4000	2	\N	f	\N	f
284	TCK-HRN9PNRO	B2222OV1	75	2026-08-28 15:29:11	2026-08-28 15:48:27	f	2026-08-28 15:29:11	2026-08-28 15:48:27	20	4000	2	\N	f	\N	f
252	TCK-CD2Y5IPK	B5678TEST	70	2026-08-28 15:24:40	2026-08-28 15:48:31	f	2026-08-28 15:24:40	2026-08-28 15:48:31	24	4000	2	\N	f	70	f
279	TCK-TCL4OWR6	B5678TEST	81	2026-08-28 15:29:09	2026-08-28 15:48:39	f	2026-08-28 15:29:09	2026-08-28 15:48:39	20	4000	2	\N	f	81	f
236	TCK-HAJS3HFQ	B5678TEST	53	2026-08-28 15:03:44	2026-08-28 15:48:43	f	2026-08-28 15:03:44	2026-08-28 15:48:43	45	4000	2	\N	f	53	f
257	TCK-FDCSSWZT	B2222OV1	64	2026-08-28 15:24:43	2026-08-28 15:48:54	f	2026-08-28 15:24:43	2026-08-28 15:48:54	25	4000	2	\N	f	\N	f
271	TCK-JGZJDMCK	B5678TEST	61	2026-08-28 15:27:50	2026-08-28 15:48:59	f	2026-08-28 15:27:50	2026-08-28 15:48:59	22	4000	2	\N	f	61	f
285	TCK-MXB3UZHI	B2222OV2	60	2026-08-28 15:29:11	2026-08-28 15:49:03	f	2026-08-28 15:29:11	2026-08-28 15:49:03	20	4000	2	\N	f	\N	f
276	TCK-OR4YLKHQ	B2222OV1	76	2026-08-28 15:27:53	2026-08-28 15:49:08	f	2026-08-28 15:27:53	2026-08-28 15:49:08	22	4000	2	\N	f	\N	f
277	TCK-ZXTV420Q	B2222OV2	58	2026-08-28 15:27:53	2026-08-28 15:49:12	f	2026-08-28 15:27:53	2026-08-28 15:49:12	22	4000	2	\N	f	\N	f
286	TCK-CQWPSYTD	B1234TEST	48	2026-08-28 15:51:26	2026-08-28 15:51:27	f	2026-08-28 15:51:26	2026-08-28 15:51:27	1	4000	2	\N	f	\N	f
295	TCK-VDRRDKZN	B 8733	50	2026-09-03 10:25:58	2026-09-03 10:26:11	f	2026-09-03 10:25:58	2026-09-03 10:26:11	1	4000	2	\N	f	\N	f
288	TCK-WPQMYX0X	B9999VIOL	73	2026-08-28 15:51:27	2026-08-28 15:51:28	f	2026-08-28 15:51:27	2026-08-28 15:51:28	1	4000	2	\N	f	\N	f
290	TCK-30GDNFKD	B8888STF	48	2026-08-28 15:51:29	2026-08-28 15:51:29	f	2026-08-28 15:51:29	2026-08-28 15:51:29	1	4000	2	\N	f	\N	f
291	TCK-OAYREFBH	B1111EDGE	48	2026-08-28 15:51:30	2026-08-28 15:51:30	f	2026-08-28 15:51:30	2026-08-28 15:51:30	1	4000	2	\N	f	\N	f
318	TCK-6ZZ5J0ET	L 132 S	48	2026-09-03 13:28:22	2026-09-03 13:28:54	f	2026-09-03 13:28:22	2026-09-03 13:28:54	1	4000	2	\N	f	\N	t
294	TCK-UPER0WEW	B 2544	48	2026-09-03 10:25:35	2026-09-03 10:28:31	f	2026-09-03 10:25:35	2026-09-03 10:28:31	3	4000	2	\N	f	\N	f
298	TCK-S5OEZ3YA	B 5497	49	2026-09-03 10:27:35	2026-09-03 10:28:34	f	2026-09-03 10:27:35	2026-09-03 10:28:34	1	4000	2	\N	f	\N	f
296	TCK-FMYIBZLM	B 9868	50	2026-09-03 10:26:53	2026-09-03 10:28:36	f	2026-09-03 10:26:53	2026-09-03 10:28:36	2	4000	2	\N	f	\N	f
297	TCK-2RC3HPPE	B 2229	51	2026-09-03 10:27:30	2026-09-03 10:28:38	f	2026-09-03 10:27:30	2026-09-03 10:28:38	2	4000	2	\N	f	\N	f
308	TCK-78YGFMPO	B 9308 TEST	51	2026-09-03 11:17:29	2026-09-03 11:19:35	f	2026-09-03 11:17:29	2026-09-03 11:19:35	3	4000	2	\N	f	\N	f
320	TCK-P697HANW	L 190 JJ	48	2026-09-04 10:03:47	2026-09-04 10:05:13	f	2026-09-04 10:03:47	2026-09-04 10:05:13	2	4000	2	\N	f	\N	t
305	TCK-BJZR5GAH	K 141 KU	48	2026-09-03 11:12:39	2026-09-03 11:12:44	f	2026-09-03 11:12:39	2026-09-03 11:12:44	1	4000	2	1	f	\N	f
310	TCK-GTVHISYK	K 141 KU	50	2026-09-03 11:20:58	2026-09-03 11:24:11	f	2026-09-03 11:20:58	2026-09-03 11:24:11	4	4000	2	1	f	\N	f
306	TCK-EYYGH5ME	B 9306 TEST	48	2026-09-03 11:17:28	2026-09-03 11:19:35	f	2026-09-03 11:17:28	2026-09-03 11:19:35	3	4000	2	\N	f	\N	f
319	TCK-0KOMOU0G	K 141 KU	65	2026-09-03 13:31:19	2026-09-03 13:34:14	f	2026-09-03 13:31:19	2026-09-03 13:34:14	3	4000	2	1	f	\N	f
309	TCK-AKLWLENM	B 2892	48	2026-09-03 11:20:30	2026-09-03 11:20:36	f	2026-09-03 11:20:30	2026-09-03 11:20:36	1	4000	2	\N	f	\N	f
313	TCK-VT32DXCA	B 3643	49	2026-09-03 11:24:25	2026-09-03 11:24:31	f	2026-09-03 11:24:25	2026-09-03 11:24:31	1	4000	2	\N	f	\N	f
312	TCK-BFZLJXMM	K 141 KU	50	2026-09-03 11:24:17	2026-09-03 11:25:18	f	2026-09-03 11:24:17	2026-09-03 11:25:18	2	4000	2	1	f	\N	f
314	TCK-DBO4OHGJ	B 6705	48	2026-09-03 13:17:48	2026-09-03 13:17:52	f	2026-09-03 13:17:48	2026-09-03 13:17:52	1	4000	2	\N	f	\N	f
315	TCK-NGMWOTI5	BJ 5370 RUM	50	2026-09-03 13:18:11	2026-09-03 13:18:19	f	2026-09-03 13:18:11	2026-09-03 13:18:19	1	4000	2	\N	f	\N	f
316	TCK-ZY2KYUWQ	B 1970 SSH	48	2026-09-03 13:18:50	2026-09-03 13:18:55	f	2026-09-03 13:18:50	2026-09-03 13:18:55	1	4000	2	\N	f	\N	f
330	TCK-FMKBI3BD	B 6812	80	2026-09-04 10:21:51	2026-09-07 15:49:55	f	2026-09-04 10:21:51	2026-09-07 15:49:55	4649	312000	2	\N	f	\N	f
326	TCK-5TPGTE4A	B 2879	52	2026-09-04 10:21:34	2026-09-07 15:49:58	f	2026-09-04 10:21:34	2026-09-07 15:49:58	4649	312000	2	\N	f	\N	f
323	TCK-RGO2MYNY	B 7021	51	2026-09-04 10:21:18	2026-09-07 15:50:06	f	2026-09-04 10:21:18	2026-09-07 15:50:06	4649	312000	2	\N	f	\N	f
324	TCK-TYGSQKSM	B 3881	49	2026-09-04 10:21:20	2026-09-07 16:00:46	f	2026-09-04 10:21:20	2026-09-07 16:00:46	4660	312000	2	\N	f	\N	f
322	TCK-9E8UPRJL	B 1729	48	2026-09-04 10:21:16	2026-09-07 16:01:01	f	2026-09-04 10:21:16	2026-09-07 16:01:01	4660	312000	2	\N	f	\N	f
325	TCK-8NIALPJC	B 9631	47	2026-09-04 10:21:26	2026-09-07 16:01:03	f	2026-09-04 10:21:26	2026-09-07 16:01:03	4660	312000	2	\N	f	\N	f
329	TCK-PUPQZS7X	B 3149	66	2026-09-04 10:21:46	2026-09-07 16:01:18	f	2026-09-04 10:21:46	2026-09-07 16:01:18	4660	312000	2	\N	f	\N	f
327	TCK-VGWZ2PXA	B 8786	46	2026-09-04 10:21:38	2026-09-07 16:01:24	f	2026-09-04 10:21:38	2026-09-07 16:01:24	4660	312000	2	\N	f	\N	f
321	TCK-HOXLZVFU	B 2826	50	2026-09-04 10:21:14	2026-09-04 15:42:26	f	2026-09-04 10:21:14	2026-09-04 15:42:26	322	24000	2	\N	f	\N	f
328	TCK-DSJSPVHB	B 1683	68	2026-09-04 10:21:42	2026-09-04 15:42:28	f	2026-09-04 10:21:42	2026-09-04 15:42:28	321	24000	2	\N	f	\N	f
333	TCK-V4QCNAW3	B 3411	69	2026-09-04 10:23:33	2026-09-04 15:42:30	f	2026-09-04 10:23:33	2026-09-04 15:42:30	319	24000	2	\N	f	\N	f
338	TCK-PG4UVR4K	B 9306	54	2026-09-04 15:42:53	2026-09-04 15:42:56	f	2026-09-04 15:42:53	2026-09-04 15:42:56	1	4000	2	\N	f	\N	f
339	TCK-SFTZYMXB	K 141 KU	54	2026-09-07 15:42:52	2026-09-07 15:49:08	f	2026-09-07 15:42:52	2026-09-07 15:49:08	7	4000	2	1	f	\N	f
335	TCK-FETE6U4O	B 3987	50	2026-09-04 15:42:36	2026-09-07 15:50:44	f	2026-09-04 15:42:36	2026-09-07 15:50:44	4329	292000	2	\N	f	\N	f
336	TCK-1LHG7XIU	B 1895	68	2026-09-04 15:42:38	2026-09-07 15:50:50	f	2026-09-04 15:42:38	2026-09-07 15:50:50	4329	292000	2	\N	f	\N	f
331	TCK-DI829VVM	B 6562	53	2026-09-04 10:21:59	2026-09-07 16:00:53	f	2026-09-04 10:21:59	2026-09-07 16:00:53	4659	312000	2	\N	f	\N	f
332	TCK-RLA1DZ9F	B 2673	67	2026-09-04 10:23:31	2026-09-07 16:00:58	f	2026-09-04 10:23:31	2026-09-07 16:00:58	4658	312000	2	\N	f	\N	f
337	TCK-1CATKHYM	B 2450	69	2026-09-04 15:42:45	2026-09-07 16:01:07	f	2026-09-04 15:42:45	2026-09-07 16:01:07	4339	292000	2	\N	f	\N	f
334	TCK-TF9CYRLT	B 3149	65	2026-09-04 10:23:40	2026-09-07 16:01:21	f	2026-09-04 10:23:40	2026-09-07 16:01:21	4658	312000	2	\N	f	\N	f
366	TCK-TEU2GDEA	K 141 KU	47	2026-09-11 16:42:25	2026-09-11 16:42:34	f	2026-09-11 16:42:25	2026-09-11 16:42:34	1	0	2	1	t	\N	f
354	TCK-KZNXQURC	P 1076 MU	48	2026-09-11 15:58:07	2026-09-11 16:04:35	f	2026-09-11 15:58:07	2026-09-11 16:04:35	7	4000	2	\N	f	\N	t
340	TCK-7D8LXOJY	K 141 KU	70	2026-09-08 17:03:30	2026-09-08 17:04:19	f	2026-09-08 17:03:30	2026-09-08 17:04:19	1	4000	2	1	f	\N	f
341	TCK-XDU3VTDK	B 8133	48	2026-09-11 14:32:32	2026-09-11 14:32:39	f	2026-09-11 14:32:32	2026-09-11 14:32:39	1	4000	2	\N	f	\N	f
364	TCK-LKHD6FBD	K 141 KU	48	2026-09-11 16:42:21	2026-09-11 16:42:36	f	2026-09-11 16:42:21	2026-09-11 16:42:36	1	0	2	1	t	\N	f
343	TCK-BASRC690	H 32 EW	48	2026-09-11 14:34:08	2026-09-11 14:35:52	f	2026-09-11 14:34:08	2026-09-11 14:35:52	2	4000	2	\N	f	\N	f
342	TCK-CM1WILZK	B 7952	50	2026-09-11 14:33:45	2026-09-11 14:36:01	f	2026-09-11 14:33:45	2026-09-11 14:36:01	3	4000	2	\N	f	\N	f
344	TCK-HZX9WFGI	K 141 KU	48	2026-09-11 14:36:19	2026-09-11 14:36:23	f	2026-09-11 14:36:19	2026-09-11 14:36:23	1	4000	2	1	f	\N	f
345	TCK-OQR7K4JX	K 141 KU	50	2026-09-11 14:41:28	2026-09-11 14:41:34	f	2026-09-11 14:41:28	2026-09-11 14:41:34	1	4000	2	1	f	\N	f
352	TCK-HUM1067H	J 2882 NKJ	80	2026-09-11 15:56:15	2026-09-11 16:05:37	f	2026-09-11 15:56:15	2026-09-11 16:05:37	10	0	2	1	t	\N	f
353	TCK-0UYAFZIB	B 4736	50	2026-09-11 15:57:25	2026-09-11 16:05:43	f	2026-09-11 15:57:25	2026-09-11 16:05:43	9	4000	2	\N	f	\N	f
346	TCK-OZBL8TL3	K 141 KU	66	2026-09-11 14:41:37	2026-09-11 14:42:15	f	2026-09-11 14:41:37	2026-09-11 14:42:15	1	4000	2	1	f	\N	f
347	TCK-TJ6MSXJE	K 141 KU	50	2026-09-11 15:13:16	2026-09-11 15:13:21	f	2026-09-11 15:13:16	2026-09-11 15:13:21	1	0	2	1	t	\N	f
348	TCK-BM504E9H	B 5326	50	2026-09-11 15:30:31	2026-09-11 15:30:52	f	2026-09-11 15:30:31	2026-09-11 15:30:52	1	4000	2	\N	f	\N	f
349	TCK-JKSGNHNY	B 5912	50	2026-09-11 15:33:54	2026-09-11 15:34:32	f	2026-09-11 15:33:54	2026-09-11 15:34:32	1	4000	2	\N	f	\N	f
355	TCK-AIWQDDHE	K 141 KU	48	2026-09-11 16:06:39	2026-09-11 16:06:50	f	2026-09-11 16:06:39	2026-09-11 16:06:50	1	0	2	1	t	\N	f
350	TCK-MJTHJQ5E	K 141 KU	60	2026-09-11 15:37:04	2026-09-11 15:38:31	f	2026-09-11 15:37:04	2026-09-11 15:38:31	2	0	2	1	t	\N	f
365	TCK-KUICJWK9	K 141 KU	50	2026-09-11 16:42:23	2026-09-11 16:42:38	f	2026-09-11 16:42:23	2026-09-11 16:42:38	1	0	2	1	t	\N	f
351	TCK-HODMUO3B	K 141 KU	55	2026-09-11 15:38:35	2026-09-11 15:39:11	f	2026-09-11 15:38:35	2026-09-11 15:39:11	1	0	2	1	t	\N	f
356	TCK-Y487HT2F	B 1 NO	50	2026-09-11 16:07:05	2026-09-11 16:07:31	f	2026-09-11 16:07:05	2026-09-11 16:07:31	1	0	2	1	t	\N	f
367	TCK-REKSGJTW	K 141 KU	49	2026-09-11 16:42:28	2026-09-11 16:42:41	f	2026-09-11 16:42:28	2026-09-11 16:42:41	1	0	2	1	t	\N	f
357	TCK-MG5NGJI1	B 1771	48	2026-09-11 16:09:47	2026-09-11 16:09:56	f	2026-09-11 16:09:47	2026-09-11 16:09:56	1	4000	2	\N	f	\N	f
362	TCK-R5QU4DOG	K 141 KU	47	2026-09-11 16:39:34	2026-09-11 16:39:43	f	2026-09-11 16:39:34	2026-09-11 16:39:43	1	0	2	1	t	\N	f
359	TCK-GMKLCEDA	K 141 KU	48	2026-09-11 16:39:28	2026-09-11 16:39:45	f	2026-09-11 16:39:28	2026-09-11 16:39:45	1	0	2	1	t	\N	f
361	TCK-OALCRSPA	K 141 KU	49	2026-09-11 16:39:32	2026-09-11 16:39:48	f	2026-09-11 16:39:32	2026-09-11 16:39:48	1	0	2	1	t	\N	f
358	TCK-GPSXYD33	K 141 KU	50	2026-09-11 16:39:26	2026-09-11 16:39:50	f	2026-09-11 16:39:26	2026-09-11 16:39:50	1	0	2	1	t	\N	f
360	TCK-LUJOKD5E	K 141 KU	51	2026-09-11 16:39:30	2026-09-11 16:39:51	f	2026-09-11 16:39:30	2026-09-11 16:39:51	1	0	2	1	t	\N	f
363	TCK-S3YGXMF5	K 141 KU	52	2026-09-11 16:39:36	2026-09-11 16:39:53	f	2026-09-11 16:39:36	2026-09-11 16:39:53	1	0	2	1	t	\N	f
368	TCK-HOVZ3QHP	K 141 KU	48	2026-09-11 16:44:06	2026-09-11 16:44:16	f	2026-09-11 16:44:06	2026-09-11 16:44:16	1	0	2	1	t	\N	f
369	TCK-KP7QNTHC	K 141 KU	50	2026-09-11 16:44:09	2026-09-11 16:44:18	f	2026-09-11 16:44:09	2026-09-11 16:44:18	1	0	2	1	t	\N	f
370	TCK-SCFSWWPM	K 141 KU	51	2026-09-11 16:44:10	2026-09-11 16:44:20	f	2026-09-11 16:44:10	2026-09-11 16:44:20	1	0	2	1	t	\N	f
371	TCK-K5F8KLKO	K 141 KU	48	2026-09-11 16:53:31	2026-09-11 16:53:41	f	2026-09-11 16:53:31	2026-09-11 16:53:41	1	0	2	1	t	\N	f
372	TCK-VUU7MXAD	K 141 KU	50	2026-09-11 16:57:43	2026-09-11 16:57:48	f	2026-09-11 16:57:43	2026-09-11 16:57:48	1	0	2	1	t	\N	f
373	TCK-8TKNULXF	T 1192 EV	48	2026-09-12 22:56:06	2026-09-12 22:56:10	f	2026-09-12 22:56:06	2026-09-12 22:56:10	1	4000	2	\N	f	\N	f
375	TCK-GDYZWHUJ	EA 1559 Uz	81	2026-09-14 11:01:20	2026-09-14 13:17:52	f	2026-09-14 11:01:20	2026-09-14 13:17:52	137	12000	2	3	f	\N	f
374	TCK-87LXVR7J	K 141 KU	68	2026-09-14 10:47:55	2026-09-14 10:48:57	f	2026-09-14 10:47:55	2026-09-14 10:48:57	2	0	2	1	t	\N	f
377	TCK-27CLPAG8	B 9415	50	2026-09-14 15:22:46	2026-09-14 15:23:14	f	2026-09-14 15:22:46	2026-09-14 15:23:14	1	4000	2	\N	f	\N	f
376	TCK-2YVT2AX7	K 141 KU	65	2026-09-14 11:01:35	2026-09-14 13:17:40	f	2026-09-14 11:01:35	2026-09-14 13:17:40	137	0	2	1	t	\N	f
378	TCK-AINPGGTS	B 1995	50	2026-09-14 15:36:30	2026-09-14 15:36:34	f	2026-09-14 15:36:30	2026-09-14 15:36:34	1	4000	2	\N	f	\N	f
379	TCK-6JCLOQXP	B 1035	50	2026-09-14 15:36:37	2026-09-14 15:36:40	f	2026-09-14 15:36:37	2026-09-14 15:36:40	1	4000	2	\N	f	\N	f
380	TCK-84F0ZQU7	B 9837	50	2026-09-14 15:53:06	2026-09-14 15:53:10	f	2026-09-14 15:53:06	2026-09-14 15:53:10	1	4000	2	\N	f	\N	f
381	TCK-93I19LZI	B 8676	50	2026-09-14 16:07:40	2026-09-14 16:07:47	f	2026-09-14 16:07:40	2026-09-14 16:07:47	1	4000	2	\N	f	\N	f
382	TCK-GOGVRSCZ	B 2843	50	2026-09-14 16:07:54	2026-09-14 16:07:58	f	2026-09-14 16:07:54	2026-09-14 16:07:58	1	4000	2	\N	f	\N	f
407	TCK-N20REJ8B	B 9885	62	2026-09-14 17:02:26	2026-09-14 17:03:08	f	2026-09-14 17:02:26	2026-09-14 17:03:08	1	4000	2	\N	f	\N	f
432	TCK-6ZMSH7QV	B 32 WSD	48	2026-09-15 17:20:20	2026-09-15 17:21:17	f	2026-09-15 17:20:20	2026-09-15 17:21:17	1	4000	2	\N	f	\N	t
457	TCK-VNPCMLNO	B 6681	50	2026-09-16 13:42:50	2026-09-16 13:49:10	f	2026-09-16 13:42:50	2026-09-16 13:49:10	7	4000	2	\N	f	\N	f
500	TCK-IKIYA3PI	B1234TEST	66	2026-10-05 10:16:31	2026-10-05 10:16:31	f	2026-10-05 10:16:31	2026-10-05 10:16:31	1	4001	3	\N	f	\N	f
525	TCK-5VAQ7RWS	B 5976	47	2026-10-14 14:21:09	2026-10-14 14:22:57	f	2026-10-14 14:21:09	2026-10-14 14:22:57	2	4000	4	\N	f	\N	f
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
277	App\\Models\\User	3	customer_token	e01e47c3a3a43a5642ac448e97f028b435544201a07c3495668f076f47d9ac9c	["*"]	2026-09-15 14:44:45	\N	2026-09-15 14:33:50	2026-09-15 14:44:45
345	App\\Models\\User	3	customer_token	53009c86e437c1d23c819dbdfc2b225cdae5e172a2b084bd5be6703ec259d5f0	["*"]	2026-10-16 19:58:09	\N	2026-10-16 19:58:09	2026-10-16 19:58:09
280	App\\Models\\User	3	customer_token	510a843503e3f0c5b77b7fb8ce8aeaaa73aa5e90a90d33c8179200efc0868194	["*"]	2026-09-15 17:18:42	\N	2026-09-15 17:11:44	2026-09-15 17:18:42
299	App\\Models\\User	3	customer_token	c7ea294c234a947e2b3109dbef08b2990bfae6e84ecf6732c197dffa0af97f7d	["*"]	2026-10-02 23:39:42	\N	2026-10-02 19:41:49	2026-10-02 23:39:42
301	App\\Models\\User	50	customer_token	9165e885bea0532bcb9511c6b1e71de8a6ab70e99bb6d8e4aa08dbd6384a0f2a	["*"]	\N	\N	2026-10-05 10:14:38	2026-10-05 10:14:38
308	App\\Models\\User	59	admin_auth_token	7894d42881cfa08f8d9a4caf2c85a3b562c3a88ae12727f095a98030a352c045	["*"]	2026-10-05 10:16:01	\N	2026-10-05 10:16:01	2026-10-05 10:16:01
314	App\\Models\\User	67	customer_token	98ff30b6c97d1d577bd242250f17375129f02309c3d7a727c434ee51ebe8fd7a	["*"]	2026-10-05 10:16:26	\N	2026-10-05 10:16:26	2026-10-05 10:16:26
287	App\\Models\\User	3	customer_token	2a6c9600a36c93654199937fcdd6553e1c896b77a24746a1cb79afac2246405d	["*"]	2026-09-16 20:26:14	\N	2026-09-16 15:47:37	2026-09-16 20:26:14
294	App\\Models\\User	3	customer_token	36eb79ddbd2d5c3ea3f19efaed9b43e01d058f4b4ffa6d6d1c72f154358d9c48	["*"]	2026-09-25 15:39:38	\N	2026-09-25 10:56:48	2026-09-25 15:39:38
320	App\\Models\\User	72	auth_token	7c120a89ccb20f4a5e6e9f2f8ee7603e7da91faf66bda4be3b0682c936a3cca6	["*"]	2026-10-05 10:16:55	\N	2026-10-05 10:16:49	2026-10-05 10:16:55
288	App\\Models\\User	3	customer_token	e11b64f51e04ba14081b2de40f4f730ef1fc500bd2bd940457cce43379822e26	["*"]	2026-09-19 00:46:41	\N	2026-09-18 20:09:50	2026-09-19 00:46:41
273	App\\Models\\User	3	customer_token	6fa0684e82579cec107c4d68ab12ba38ba27c1c6d278a49baa28474191360dbe	["*"]	2026-09-14 16:09:40	\N	2026-09-14 16:09:11	2026-09-14 16:09:40
278	App\\Models\\User	3	customer_token	5bfa28aea6a8716ed8e32e71211d8fb7ff75e93fc8e3bb4e34beffa91bf08c0e	["*"]	2026-09-15 15:25:34	\N	2026-09-15 15:25:20	2026-09-15 15:25:34
315	App\\Models\\User	68	admin_auth_token	226eeef44f2343fa76d6ab39a12784ee62142bf2abf8595ef4bbdb8c8f1b4e13	["*"]	2026-10-05 10:16:33	\N	2026-10-05 10:16:28	2026-10-05 10:16:33
295	App\\Models\\User	3	customer_token	c28a9a7ad01aabf5b1b3be896245a6c26a95ec61792825e3229b08e8bd21d86c	["*"]	2026-09-25 22:50:49	\N	2026-09-25 19:46:26	2026-09-25 22:50:49
321	App\\Models\\User	73	customer_token	931197d7385df3727b8539f4c6b1e976275fbf63b17d2f72d47926738b5dd371	["*"]	2026-10-05 10:16:54	\N	2026-10-05 10:16:50	2026-10-05 10:16:54
346	App\\Models\\User	3	customer_token	1f5bf6cf91151ad030131c4fc0d3632a1fff2da14c37afa4e1ce3f854d1b578f	["*"]	2026-10-16 22:30:02	\N	2026-10-16 20:07:40	2026-10-16 22:30:02
285	App\\Models\\User	3	customer_token	6db7b258cdb377bb654874658a5b65dab325f7cae725ad8f877a79c8ff61626e	["*"]	2026-09-16 15:32:12	\N	2026-09-16 15:28:07	2026-09-16 15:32:12
291	App\\Models\\User	3	customer_token	aed17512df3f462cd2f022bbe98a914643cce01332d5205f0bed31299c07fba4	["*"]	2026-09-22 20:55:25	\N	2026-09-22 16:07:58	2026-09-22 20:55:25
302	App\\Models\\User	51	customer_token	31ff5ffcc79743ffd40f7efac439f9e4492137eda1ce99942b0829756c6c30ee	["*"]	\N	\N	2026-10-05 10:14:41	2026-10-05 10:14:41
309	App\\Models\\User	60	auth_token	0f1290e846477d902274844ddcba07c98b3f95edb3c6fae264e0c92d813ac51c	["*"]	\N	\N	2026-10-05 10:16:01	2026-10-05 10:16:01
303	App\\Models\\User	54	customer_token	b90a4cb6a9b8a74917be26ca5282d4939c04cd9f452220e7b3f218d1f98f4807	["*"]	2026-10-05 10:15:19	\N	2026-10-05 10:15:19	2026-10-05 10:15:19
274	App\\Models\\User	3	customer_token	8f22cb0d5fd1197f46405951d20e5db02e627ba272ae5a80bfa1d56f4bb951bf	["*"]	2026-09-15 10:24:49	\N	2026-09-15 10:23:20	2026-09-15 10:24:49
310	App\\Models\\User	62	admin_auth_token	317726b87302a4c823e9a99b2a8887225fc3f9720238818a146d81a40915513b	["*"]	2026-10-05 10:16:07	\N	2026-10-05 10:16:07	2026-10-05 10:16:07
316	App\\Models\\User	69	auth_token	74fc0ea84a8fa19b2791356d580fe5842de466f4d686420d10761c6e266c507c	["*"]	2026-10-05 10:16:35	\N	2026-10-05 10:16:29	2026-10-05 10:16:35
282	App\\Models\\User	3	customer_token	5545fa777eb7abf093d2f6545bdcab6e5619338894d81dadfa0165369fb3677d	["*"]	2026-09-16 13:42:47	\N	2026-09-16 10:41:58	2026-09-16 13:42:47
342	App\\Models\\User	2	auth_token	e7ab9a966a88e03a199d3a369c878ab997302c1ca3013a6b080c8cda0c1e0e56	["*"]	2026-10-17 00:07:27	\N	2026-10-16 19:28:11	2026-10-17 00:07:27
292	App\\Models\\User	3	customer_token	0052c34a6c3938ee2a289fea48c5adae125a817585c0d799ae1abeba28627c62	["*"]	2026-09-23 15:33:52	\N	2026-09-23 10:55:29	2026-09-23 15:33:52
304	App\\Models\\User	55	customer_token	68095e0a2f90be25ed541de9c01f4672bfe2933251e6d305f01d7110ef236c42	["*"]	2026-10-05 10:15:20	\N	2026-10-05 10:15:20	2026-10-05 10:15:20
311	App\\Models\\User	63	auth_token	2fd227971375a615c143de433caf9ebe4791bfde4e54c5f64ac881d67c203c98	["*"]	\N	\N	2026-10-05 10:16:07	2026-10-05 10:16:07
293	App\\Models\\User	3	customer_token	117d7e1b87f0df9badc956953dbc903082ffee54bad8df4e30d199b4a1ab15e0	["*"]	2026-09-24 11:17:05	\N	2026-09-24 10:36:18	2026-09-24 11:17:05
317	App\\Models\\User	70	customer_token	797975ccd74af741229ae537f8110d78fdcbe8e1902c1ab68f8a264028b2d462	["*"]	2026-10-05 10:16:34	\N	2026-10-05 10:16:30	2026-10-05 10:16:34
328	App\\Models\\User	12	auth_token	cc35fd3bded9009afad7b733077d292a8771e73f3da055cf64e0fa1242604d12	["*"]	2026-10-05 10:31:20	\N	2026-10-05 10:31:20	2026-10-05 10:31:20
336	App\\Models\\User	3	customer_token	c44e16f05e75d957afc4f02aed18178ea475695b0a693b1e308abce881f90a99	["*"]	2026-10-14 15:26:29	\N	2026-10-14 15:25:01	2026-10-14 15:26:29
343	App\\Models\\User	1	auth_token	a32a648794347e0013a574246a50566ea33970064b52301140e6917708721965	["*"]	2026-10-17 00:07:27	\N	2026-10-16 19:28:23	2026-10-17 00:07:27
323	App\\Models\\User	3	customer_token	e21be2f96834d6bcf3d03d79f1fdaf08e3591620ad13327c7a5b70ea2385eebb	["*"]	2026-10-05 14:14:14	\N	2026-10-05 10:18:34	2026-10-05 14:14:14
275	App\\Models\\User	8	auth_token	43fab3bafe4634e382a3acb93f833c95caa6dbaf017f849e3c42b547aa170cea	["*"]	2026-09-15 15:23:42	\N	2026-09-15 10:23:56	2026-09-15 15:23:42
305	App\\Models\\User	56	admin_auth_token	15e18adb027aa38ac7d6b79c46709238e64b763993e8013710afe3796b0d4841	["*"]	2026-10-05 10:15:48	\N	2026-10-05 10:15:48	2026-10-05 10:15:48
312	App\\Models\\User	65	admin_auth_token	3092da2742bcc2e56cc5cb9f2e513d03a7bcd849ae68838481f543c2cc230238	["*"]	2026-10-05 10:16:24	\N	2026-10-05 10:16:24	2026-10-05 10:16:24
344	App\\Models\\User	3	customer_token	28870b413f4ae350d83d8339ba71aff487cd95d67d49f6fa2252e4872d5ea424	["*"]	2026-10-16 19:38:02	\N	2026-10-16 19:29:29	2026-10-16 19:38:02
200	App\\Models\\User	36	admin_auth_token	b4862e1928990f167ea8f8d85c17b7d7feacabbb216a7a09f2cbe86e89fb967c	["*"]	2026-08-28 15:29:10	\N	2026-08-28 15:29:07	2026-08-28 15:29:10
33	App\\Models\\User	5	customer_token	accb15b0d9f4258ba2dd7905793e542864652c5ea7abcba531ae65614992ea78	["*"]	2026-06-29 10:15:18	\N	2026-06-29 10:15:17	2026-06-29 10:15:18
262	App\\Models\\User	3	customer_token	33df9b1203b7f391945cbc29fd3e79561c68546976938c245b77aa2d9651e058	["*"]	2026-09-11 17:17:13	\N	2026-09-11 16:49:50	2026-09-11 17:17:13
38	App\\Models\\User	6	customer_token	9994f393711561ba2dd098a11874160c3e1ede57b5ea6251f16b84d0a1e6340c	["*"]	2026-06-29 10:36:18	\N	2026-06-29 10:36:18	2026-06-29 10:36:18
85	App\\Models\\User	5	customer_token	57b284326d21daac60d335bf8303735677ca407f698f9e623f7783376b017f53	["*"]	2026-08-17 12:53:03	\N	2026-08-17 12:53:03	2026-08-17 12:53:03
201	App\\Models\\User	37	auth_token	6d9f5629174147dd27fc4bac6d3e4114c2dddad4502263794fed7530bc8d5e29	["*"]	2026-08-28 15:29:11	\N	2026-08-28 15:29:07	2026-08-28 15:29:11
180	App\\Models\\User	22	admin_auth_token	847d91b01411eccc197fe05e28b05f76590f2c97d99d37768e0652d2f0d4aa1c	["*"]	2026-08-28 15:03:46	\N	2026-08-28 15:03:42	2026-08-28 15:03:46
259	App\\Models\\User	3	customer_token	feeb28489f941b0846a09cd969c07efd3fd4cceb6ac3c43b5d8961b917e0167e	["*"]	2026-09-11 16:39:36	\N	2026-09-11 16:38:55	2026-09-11 16:39:36
306	App\\Models\\User	57	auth_token	995a27df62f292213c0edd26690bbd79fa9e8014686096b7e108a20238cb8aac	["*"]	\N	\N	2026-10-05 10:15:49	2026-10-05 10:15:49
35	App\\Models\\User	5	customer_token	b2f2bdbd910159563ad4ef0e7c58f41220277b60219799a512c9109887ceaf2a	["*"]	2026-06-29 10:16:04	\N	2026-06-29 10:16:04	2026-06-29 10:16:04
9	App\\Models\\User	5	customer_token	59dda90435a47bd4a23dc63f6ec5d7443d2ec760270288c7d7c084d17b3f9142	["*"]	\N	\N	2026-06-28 18:49:42	2026-06-28 18:49:42
10	App\\Models\\User	5	customer_token	b91b194a582bbf04bdbffedfbfdc4643c18e695b33791f4582ba81339c221a7c	["*"]	\N	\N	2026-06-28 18:50:02	2026-06-28 18:50:02
11	App\\Models\\User	5	customer_token	9113ad5a8124b13e3d6dde86c07da6678443e01347e63e8df5b69cdfc7593de0	["*"]	\N	\N	2026-06-28 18:51:03	2026-06-28 18:51:03
12	App\\Models\\User	5	customer_token	8e367016f1e5429986ff43844833e69b71f0f9d9e135be2c0a7bf1d0281ae4a4	["*"]	\N	\N	2026-06-28 18:51:19	2026-06-28 18:51:19
14	App\\Models\\User	5	customer_token	dde62d4b5828a056b512b85057bbfe5f27385857304cf4fbea5b0a4c242a98fd	["*"]	\N	\N	2026-06-28 18:57:46	2026-06-28 18:57:46
13	App\\Models\\User	5	customer_token	c04456220c73ffeeadc1eaa44a875600c1392e0ee42d03048f633a43ffd94a6e	["*"]	2026-06-28 18:54:26	\N	2026-06-28 18:54:26	2026-06-28 18:54:26
15	App\\Models\\User	5	customer_token	a7e1db8ce30328eca669053611bb5544a7ea0dd8671d41171237a65dbcbd95f4	["*"]	2026-06-28 19:02:06	\N	2026-06-28 19:02:06	2026-06-28 19:02:06
16	App\\Models\\User	5	customer_token	fdb4909f69b71ab9a6b91987f5876b95bb711b9a4cb2e27114ec68da6e2056df	["*"]	2026-06-28 19:03:50	\N	2026-06-28 19:03:50	2026-06-28 19:03:50
17	App\\Models\\User	5	customer_token	c850fa90c1102120a4ac737f267b8cadeadbfb975f363ac09cbd3271cab313a4	["*"]	2026-06-28 19:05:51	\N	2026-06-28 19:05:51	2026-06-28 19:05:51
18	App\\Models\\User	5	customer_token	a2dbba72eab6be049b6808ca1d88b38e3ee459669eb645763e8e417a41e9cda9	["*"]	2026-06-28 19:07:34	\N	2026-06-28 19:07:34	2026-06-28 19:07:34
19	App\\Models\\User	5	customer_token	13f7e2c5f0d1a4079c7e5b249b3d9fee454483cef66f7d786f0f729ac3778243	["*"]	2026-06-28 19:07:50	\N	2026-06-28 19:07:50	2026-06-28 19:07:50
20	App\\Models\\User	5	customer_token	7933cea3c742309f4fdb22dd13d699a034e277bdf2c82729e74f591a0991181e	["*"]	2026-06-28 19:18:30	\N	2026-06-28 19:18:30	2026-06-28 19:18:30
21	App\\Models\\User	5	customer_token	7eae8670b61d7c86b66b91c7ffda07ae41cdcf22991e8547a3f40abeba932ce7	["*"]	2026-06-28 19:21:04	\N	2026-06-28 19:21:04	2026-06-28 19:21:04
27	App\\Models\\User	5	customer_token	72cb5dd2124121d9ce0248b2dc9ef312af91583238b15d7a7f9393f7071a4567	["*"]	2026-06-28 19:32:19	\N	2026-06-28 19:32:19	2026-06-28 19:32:19
36	App\\Models\\User	6	customer_token	9c14e1ff0d8a55f9c2c4dbcea063d52a00fe07a3bdabe9c8748a83c307a886bb	["*"]	2026-06-29 10:22:47	\N	2026-06-29 10:22:47	2026-06-29 10:22:47
254	App\\Models\\User	3	customer_token	0a0d7c702456d79c44f2a54b44bb7040c17cfe71d716dc42465631f462c4d032	["*"]	2026-09-11 14:36:23	\N	2026-09-11 14:36:16	2026-09-11 14:36:23
269	App\\Models\\User	3	customer_token	8737e485f07277addf22dbdfeccb641f10eca6ae9bcb824df53d472a5463f724	["*"]	2026-09-14 13:17:40	\N	2026-09-14 10:47:44	2026-09-14 13:17:40
260	App\\Models\\User	3	customer_token	3c3bf30b6a42c6cf47ac4234ceedff1450bb36270230d0a4707c697c6256301f	["*"]	2026-09-11 16:42:28	\N	2026-09-11 16:40:06	2026-09-11 16:42:28
263	App\\Models\\User	3	customer_token	7b23138e7c56d1ce818fed39a9d3bdb5d53020eba74ad2a4803c1542d1f663c5	["*"]	2026-09-11 17:22:06	\N	2026-09-11 17:20:50	2026-09-11 17:22:06
116	App\\Models\\User	9	customer_token	a4e9c8fbf62516c1ce9d980a11faac493a7ee204065893e18b111a497d4a6a0e	["*"]	2026-08-20 17:04:29	\N	2026-08-20 16:41:05	2026-08-20 17:04:29
162	App\\Models\\User	11	customer_token	c8f1c315ad8fd2adb5d76bd47b778c999a879cc76f3a9403d88e6bbfc4d35af3	["*"]	2026-08-26 19:27:59	\N	2026-08-26 14:32:43	2026-08-26 19:27:59
160	App\\Models\\User	10	auth_token	d96d2b7d8a13959d426aa4ddfe72435290a6a773e46f3b30f457f458b2925e0e	["*"]	2026-08-26 19:27:59	\N	2026-08-26 14:29:53	2026-08-26 19:27:59
177	App\\Models\\User	20	admin_auth_token	1f60395901436056240ab6f0aec95bbd72990abec0caa2978ce779f2e320b65b	["*"]	2026-08-28 14:59:55	\N	2026-08-28 14:59:50	2026-08-28 14:59:55
174	App\\Models\\User	18	admin_auth_token	41f6a7d72ff0b6b92aabd58043001ea4b68c93643dd20cb1131210fbef9b2ff0	["*"]	2026-08-28 14:57:48	\N	2026-08-28 14:57:44	2026-08-28 14:57:48
170	App\\Models\\User	15	admin_auth_token	31a1363856f79cd45d8e9333ae681488d01f5519d728dba45d61c7c0e3c3fb33	["*"]	2026-08-28 14:56:19	\N	2026-08-28 14:56:15	2026-08-28 14:56:19
178	App\\Models\\User	21	auth_token	8be0a69ff77738c6c9ce952de84f7d13450cb65a6a16ad4be5968938f8528718	["*"]	2026-08-28 14:59:56	\N	2026-08-28 14:59:51	2026-08-28 14:59:56
175	App\\Models\\User	19	auth_token	f62b35558657f9a3cec61699030461e729475d5cf6b82becc0ce9ef157de41cb	["*"]	2026-08-28 14:57:48	\N	2026-08-28 14:57:45	2026-08-28 14:57:48
172	App\\Models\\User	17	admin_auth_token	163cfba27c299b3898a0b51ea5e144c755c28e64ee0bbd75a4ca843ca4247a48	["*"]	\N	\N	2026-08-28 14:56:16	2026-08-28 14:56:16
166	App\\Models\\User	13	admin_auth_token	ab8e3c67201d27ba6bb110d06b4af1e772bbba1d9bbdb33eefc69b8491434a35	["*"]	\N	\N	2026-08-28 14:51:00	2026-08-28 14:51:00
184	App\\Models\\User	25	auth_token	4e1f61481175f6d1fc11e761183a99d0d6a75b266780fefcf4b0c18025ab1c0b	["*"]	2026-08-28 15:04:08	\N	2026-08-28 15:04:04	2026-08-28 15:04:08
181	App\\Models\\User	23	auth_token	ad7da045fb1a0377e23f19256403170f71dcf892f9064f1a5f68de3adae9b0ba	["*"]	2026-08-28 15:03:47	\N	2026-08-28 15:03:43	2026-08-28 15:03:47
189	App\\Models\\User	28	admin_auth_token	b52e4f2ff2624340381521762dd5fb2e318cc8bea17fca1d19afcc2599d5630a	["*"]	2026-08-28 15:24:42	\N	2026-08-28 15:24:38	2026-08-28 15:24:42
183	App\\Models\\User	24	admin_auth_token	261b50c3c048349f1852d468f58ef4dfabbda1aa0edd4f4aa44a1d00ed38a5d6	["*"]	2026-08-28 15:04:07	\N	2026-08-28 15:04:03	2026-08-28 15:04:07
187	App\\Models\\User	27	auth_token	e16ae7b4b377dfff9bae8e2a3f1a193f4e964064dbd5664b86e83a90339f1464	["*"]	2026-08-28 15:22:31	\N	2026-08-28 15:22:31	2026-08-28 15:22:31
186	App\\Models\\User	26	admin_auth_token	03bfa6b1e286dd61e6ff0f4590e47ea0184ec089efd06e2bd98479af2233d2ad	["*"]	2026-08-28 15:22:31	\N	2026-08-28 15:22:30	2026-08-28 15:22:31
190	App\\Models\\User	29	auth_token	1d57e478266b1c0b350a50aab830add48dfc0851f45cacbfc80b0134dff7a56f	["*"]	2026-08-28 15:24:43	\N	2026-08-28 15:24:39	2026-08-28 15:24:43
192	App\\Models\\User	30	admin_auth_token	ca3ee7d8eaf1bd2a6694dc16a62998c63f8627278416deaf43c5cfa76d5a208c	["*"]	2026-08-28 15:26:20	\N	2026-08-28 15:26:19	2026-08-28 15:26:20
193	App\\Models\\User	31	auth_token	15adb231d3a18b4e724aab43fa85f0589ea05664ceda77a6c42c69cd76fae440	["*"]	2026-08-28 15:26:21	\N	2026-08-28 15:26:20	2026-08-28 15:26:21
261	App\\Models\\User	3	customer_token	c43876ed1346415c411ed0c54a128f16b2d11214701d6114b480906cd2a51dad	["*"]	2026-09-11 16:44:11	\N	2026-09-11 16:43:49	2026-09-11 16:44:11
204	App\\Models\\User	39	auth_token	bfe1337a97f4c4aaa953a1d529a6d715416c0d8f2fc397c4ecaa90991cdfc8d8	["*"]	2026-08-28 15:30:04	\N	2026-08-28 15:30:02	2026-08-28 15:30:04
203	App\\Models\\User	38	admin_auth_token	f8e21bc77127ad5a9e1ec85f8eb10909a895388fb73b5801d20b5c261fd7d744	["*"]	2026-08-28 15:30:04	\N	2026-08-28 15:30:01	2026-08-28 15:30:04
194	App\\Models\\User	32	admin_auth_token	588d9279b40e7e00670ad2ec2a4ff84fc7b68744aa845d8c33f856d40a60235a	["*"]	2026-08-28 15:26:53	\N	2026-08-28 15:26:49	2026-08-28 15:26:53
249	App\\Models\\User	3	auth_token	b8472c2d1b5270979f31c41c9afef4c66ab71a94f772ef958c1e912e979df39a	["*"]	\N	\N	2026-09-11 14:31:59	2026-09-11 14:31:59
195	App\\Models\\User	33	auth_token	e7dbe38f433fcd48064048642642b4f773c3c425aaa5002d90add448d9ae19c9	["*"]	2026-08-28 15:26:54	\N	2026-08-28 15:26:50	2026-08-28 15:26:54
270	App\\Models\\User	5	customer_token	d2869552156b29fda1ef89a83328b0ac61d67092d35e0d1ca03148bfda1575d2	["*"]	2026-09-14 15:53:11	\N	2026-09-14 11:01:10	2026-09-14 15:53:11
215	App\\Models\\User	46	admin_auth_token	a722c440423c385b565c9b1d5f2058517456d301d98ca5d71b704878edc0e9fe	["*"]	2026-08-28 15:35:39	\N	2026-08-28 15:35:36	2026-08-28 15:35:39
197	App\\Models\\User	34	admin_auth_token	8ac407c5dc8ae4f0c9adf9513684fa28e60d90899af3479d4f9e74898b07ce6c	["*"]	2026-08-28 15:27:52	\N	2026-08-28 15:27:48	2026-08-28 15:27:52
198	App\\Models\\User	35	auth_token	597630ce83a8c056df098308bcc7effcee8452d4f775470e95a91b5c5d010ab5	["*"]	2026-08-28 15:27:53	\N	2026-08-28 15:27:49	2026-08-28 15:27:53
216	App\\Models\\User	47	auth_token	7f3d0ba7e01ec91f0d00060d63588d68ce87bec6dfbac4114fe6869c865ebd68	["*"]	2026-08-28 15:35:39	\N	2026-08-28 15:35:37	2026-08-28 15:35:39
207	App\\Models\\User	41	auth_token	fab1816fc7c4c6b477427aa747db5342f7762df78af10ddf81936cf9004e33c6	["*"]	2026-08-28 15:30:36	\N	2026-08-28 15:30:34	2026-08-28 15:30:36
206	App\\Models\\User	40	admin_auth_token	a8f3812be070943bb878d54cb3c0fc85aade3c8c8127d817aa4712f0c5e82a80	["*"]	2026-08-28 15:30:37	\N	2026-08-28 15:30:34	2026-08-28 15:30:37
255	App\\Models\\User	3	customer_token	4cab1d05c858517762a7534699f55576f933b59b4d831adc4ef6f36b7693eccf	["*"]	2026-09-11 14:42:15	\N	2026-09-11 14:41:18	2026-09-11 14:42:15
264	App\\Models\\User	3	customer_token	f778c043f7dfe6c24e875451fcbbe3d09de025683509341c90e3ffc9faf95c3a	["*"]	2026-09-12 22:56:10	\N	2026-09-12 22:54:39	2026-09-12 22:56:10
209	App\\Models\\User	42	admin_auth_token	c1013e328ad6f5c98b9d2e8fffb77664ccfe574e978c38a85ce8aeeff7676523	["*"]	2026-08-28 15:33:03	\N	2026-08-28 15:33:01	2026-08-28 15:33:03
210	App\\Models\\User	43	auth_token	7d5d6d09ce8149a35395cb807085109a1a44c9ae9748d39f85d40d211987529b	["*"]	2026-08-28 15:33:03	\N	2026-08-28 15:33:01	2026-08-28 15:33:03
258	App\\Models\\User	3	customer_token	4a0967e7e2ab1bf120842443508c61b22e0804595238bcd6877ca6dee2b3bca4	["*"]	2026-09-11 15:57:10	\N	2026-09-11 15:37:00	2026-09-11 15:57:10
212	App\\Models\\User	44	admin_auth_token	78a62b545e3bdbc7260a1bdb32153bd94b28431fd95004843fb3f2d5b63d2ad7	["*"]	2026-08-28 15:33:19	\N	2026-08-28 15:33:17	2026-08-28 15:33:19
213	App\\Models\\User	45	auth_token	8f58a19734bb4590f873a09b05e0d0c7f54af168a1701fc728081e5569150bf0	["*"]	2026-08-28 15:33:19	\N	2026-08-28 15:33:17	2026-08-28 15:33:19
220	App\\Models\\User	48	admin_auth_token	f5ffe73f6dce14974e3de09c88de091514292962d14525de171d5216c073de57	["*"]	2026-08-28 15:51:29	\N	2026-08-28 15:51:24	2026-08-28 15:51:29
221	App\\Models\\User	49	auth_token	abe24b748cbebb9297ab5f0987da71e87a7e582e2e0888c7f0e77afb76262ce3	["*"]	2026-08-28 15:51:31	\N	2026-08-28 15:51:25	2026-08-28 15:51:31
236	App\\Models\\User	16	auth_token	259d87ea1793b770721ee7685c47ec1b1159619db2f7b391116578ff318899fb	["*"]	2026-09-03 11:19:49	\N	2026-09-03 11:19:49	2026-09-03 11:19:49
251	App\\Models\\User	3	customer_token	abca14c4af7196bfac5c076e5df3ff76815ecbf00d62fa4e3de966d32babe97d	["*"]	2026-09-11 14:32:56	\N	2026-09-11 14:32:55	2026-09-11 14:32:56
307	App\\Models\\User	58	customer_token	217ceb00e5a0f4dd02698b0b8220f1bd538efd7fd9736188920383ff0e19eb7d	["*"]	2026-10-05 10:15:50	\N	2026-10-05 10:15:49	2026-10-05 10:15:50
313	App\\Models\\User	66	auth_token	4c4605b0a1ffe3cae54a8dc504230f20dffbbce56f2142d8d96e1fa877acd31c	["*"]	\N	\N	2026-10-05 10:16:25	2026-10-05 10:16:25
330	App\\Models\\User	3	customer_token	033e21f4ab52abe998d13626346656d41772fa6ce8556e2b81c22cf52028073f	["*"]	2026-10-09 10:55:00	\N	2026-10-09 09:14:15	2026-10-09 10:55:00
338	App\\Models\\User	3	customer_token	637c00372b651157c2d32e41c0d8c0470818f56edf9a8c7471162fa4089792d6	["*"]	2026-10-14 15:37:13	\N	2026-10-14 15:37:12	2026-10-14 15:37:13
319	App\\Models\\User	71	admin_auth_token	417dcc484966f5da30dd932068af2e034d20d36d9b679ccf2bc7fe4e62fea4e5	["*"]	2026-10-05 10:16:53	\N	2026-10-05 10:16:49	2026-10-05 10:16:53
\.


--
-- Data for Name: revenue_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.revenue_configs (id, rate_per_hour, effective_from, created_by, created_at, updated_at) FROM stdin;
1	5000	2026-06-29 07:00:00	1	2026-06-28 15:54:34	2026-06-28 15:54:34
2	4000	2026-08-21 07:00:00	1	2026-08-21 10:50:48	2026-08-21 10:50:48
3	4001	2026-10-01 00:00:00	1	2026-09-30 10:38:40	2026-09-30 10:38:40
4	4000	2026-10-05 00:00:00	1	2026-10-05 10:21:41	2026-10-05 10:21:41
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
spqFxCQLXfWPc2uqqcOOfD9CfVuYGcskXZuIxRAI	\N	172.217.194.102	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiUzNBb05nbGFQVWNDakk0UE9RRmNBVVFnOWZiU253WkFjTFJ4SlZkZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1792070846
\.


--
-- Data for Name: slot_overrides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.slot_overrides (id, transaction_id, old_slot_id, new_slot_id, staff_id, reason, created_at, updated_at) FROM stdin;
58	418	50	67	8	Penyesuaian ke Slot S29	2026-09-15 10:24:42	2026-09-15 10:24:42
61	448	50	75	2	Penyesuaian ke Slot S2	2026-09-16 13:18:29	2026-09-16 13:18:29
64	451	50	79	2	Penyesuaian ke Slot S6	2026-09-16 13:25:24	2026-09-16 13:25:24
67	454	48	67	2	Penyesuaian ke Slot S29	2026-09-16 13:40:41	2026-09-16 13:40:41
70	458	48	63	2	Penyesuaian ke Slot S25	2026-09-16 13:43:15	2026-09-16 13:43:15
73	462	50	49	2	Penyesuaian ke Slot S11	2026-09-16 15:48:03	2026-09-16 15:48:03
76	523	47	65	2	Penyesuaian ke Slot S27	2026-10-14 13:55:33	2026-10-14 13:55:33
59	445	50	70	2	Penyesuaian ke Slot S32	2026-09-16 13:08:54	2026-09-16 13:08:54
62	449	50	58	2	Penyesuaian ke Slot S20	2026-09-16 13:20:27	2026-09-16 13:20:27
65	452	48	49	2	Penyesuaian ke Slot S10	2026-09-16 13:25:30	2026-09-16 13:25:30
68	455	47	61	2	Penyesuaian ke Slot S23	2026-09-16 13:40:49	2026-09-16 13:40:49
71	460	50	67	2	Penyesuaian ke Slot S29	2026-09-16 15:27:53	2026-09-16 15:27:53
74	502	66	62	69	Test override regresi	2026-10-05 10:16:32	2026-10-05 10:16:32
77	531	48	58	2	Penyesuaian ke Slot S20	2026-10-14 15:22:53	2026-10-14 15:22:53
1	59	76	59	2	salah parkir	2026-08-19 14:20:48	2026-08-19 14:20:48
2	59	59	76	2	pindah slot	2026-08-19 14:25:17	2026-08-19 14:25:17
3	111	48	54	2	pindah slot	2026-08-19 15:39:37	2026-08-19 15:39:37
4	111	54	53	2	pindah slot	2026-08-19 15:40:25	2026-08-19 15:40:25
5	112	48	52	2	pindah	2026-08-19 15:46:34	2026-08-19 15:46:34
6	114	48	52	2	pindah	2026-08-19 15:51:40	2026-08-19 15:51:40
7	125	47	61	2	pindah	2026-08-19 16:03:50	2026-08-19 16:03:50
8	126	47	59	2	pindah	2026-08-19 16:11:42	2026-08-19 16:11:42
9	127	47	63	2	pindah	2026-08-19 16:14:44	2026-08-19 16:14:44
10	128	47	69	2	pindah	2026-08-19 16:27:40	2026-08-19 16:27:40
11	121	51	63	2	pindah	2026-08-19 16:29:38	2026-08-19 16:29:38
12	129	47	62	2	pindah	2026-08-19 16:29:50	2026-08-19 16:29:50
13	131	50	71	2	pindah	2026-08-19 16:56:07	2026-08-19 16:56:07
14	137	48	57	2	pindah	2026-08-19 17:01:27	2026-08-19 17:01:27
15	138	48	50	2	pindah	2026-08-19 17:02:19	2026-08-19 17:02:19
16	140	48	81	2	pindah	2026-08-19 17:14:47	2026-08-19 17:14:47
17	142	48	63	2	pindah	2026-08-19 17:19:33	2026-08-19 17:19:33
18	145	48	73	2	pindah	2026-08-20 10:06:47	2026-08-20 10:06:47
19	159	48	72	2	pindah	2026-08-20 11:21:19	2026-08-20 11:21:19
20	160	48	60	2	pindah	2026-08-20 11:22:21	2026-08-20 11:22:21
21	161	48	62	2	pindah	2026-08-20 11:26:55	2026-08-20 11:26:55
22	164	48	73	8	pindah	2026-08-20 13:34:57	2026-08-20 13:34:57
23	168	48	77	2	pindah	2026-08-20 13:43:36	2026-08-20 13:43:36
24	169	50	65	2	Penyesuaian ke fisik S27	2026-08-20 14:17:13	2026-08-20 14:17:13
25	175	50	80	8	Penyesuaian ke Slot S7	2026-08-20 16:06:56	2026-08-20 16:06:56
26	176	48	66	8	Penyesuaian ke Slot S28	2026-08-20 16:17:59	2026-08-20 16:17:59
27	179	50	78	2	Penyesuaian ke Slot S5	2026-08-21 09:15:38	2026-08-21 09:15:38
28	180	48	54	2	Penyesuaian ke Slot S16	2026-08-21 09:41:46	2026-08-21 09:41:46
29	181	48	76	2	Penyesuaian ke Slot S3	2026-08-21 09:47:18	2026-08-21 09:47:18
30	194	50	46	2	Penyesuaian ke Slot S8	2026-08-21 15:46:42	2026-08-21 15:46:42
31	197	48	66	2	Penyesuaian ke Slot S28	2026-08-23 11:44:35	2026-08-23 11:44:35
32	203	48	62	2	Penyesuaian ke Slot S24	2026-08-24 18:58:34	2026-08-24 18:58:34
33	206	51	67	2	Penyesuaian ke Slot S29	2026-08-24 19:58:42	2026-08-24 19:58:42
34	208	51	70	2	Penyesuaian ke Slot S32	2026-08-24 20:01:44	2026-08-24 20:01:44
35	209	49	75	2	Penyesuaian ke Slot S2	2026-08-25 11:11:53	2026-08-25 11:11:53
36	211	50	64	8	Penyesuaian ke Slot S26	2026-08-26 11:13:54	2026-08-26 11:13:54
37	215	50	70	8	Penyesuaian ke Slot S32	2026-08-26 11:53:36	2026-08-26 11:53:36
38	218	50	66	8	Penyesuaian ke Slot S28	2026-08-26 12:02:57	2026-08-26 12:02:57
39	221	48	59	16	Test override regresi	2026-08-28 14:56:18	2026-08-28 14:56:18
40	225	48	54	19	Test override regresi	2026-08-28 14:57:47	2026-08-28 14:57:47
41	229	48	75	21	Test override regresi	2026-08-28 14:59:54	2026-08-28 14:59:54
42	237	66	59	23	Test override regresi	2026-08-28 15:03:45	2026-08-28 15:03:45
43	245	65	77	25	Test override regresi	2026-08-28 15:04:06	2026-08-28 15:04:06
44	253	64	76	29	Test override regresi	2026-08-28 15:24:41	2026-08-28 15:24:41
45	264	77	81	33	Test override regresi	2026-08-28 15:26:52	2026-08-28 15:26:52
46	272	76	81	35	Test override regresi	2026-08-28 15:27:51	2026-08-28 15:27:51
47	280	75	60	37	Test override regresi	2026-08-28 15:29:09	2026-08-28 15:29:09
48	288	48	73	49	Test override regresi	2026-08-28 15:51:28	2026-08-28 15:51:28
49	319	50	65	2	Penyesuaian ke Slot S27	2026-09-03 13:32:45	2026-09-03 13:32:45
50	340	50	70	2	Penyesuaian ke Slot S32	2026-09-08 17:04:11	2026-09-08 17:04:11
51	346	50	66	2	Penyesuaian ke Slot S28	2026-09-11 14:42:00	2026-09-11 14:42:00
52	350	50	60	2	Penyesuaian ke Slot S22	2026-09-11 15:37:52	2026-09-11 15:37:52
53	351	50	55	2	Penyesuaian ke Slot S17	2026-09-11 15:39:05	2026-09-11 15:39:05
54	352	50	80	2	Penyesuaian ke Slot S7	2026-09-11 15:57:10	2026-09-11 15:57:10
55	374	50	68	2	Penyesuaian ke Slot S30	2026-09-14 10:48:30	2026-09-14 10:48:30
56	375	48	81	8	Penyesuaian ke Slot S27	2026-09-14 11:02:07	2026-09-14 11:02:07
57	376	50	65	8	Penyesuaian ke Slot S36	2026-09-14 11:02:19	2026-09-14 11:02:19
60	446	50	65	2	Penyesuaian ke Slot S27	2026-09-16 13:17:21	2026-09-16 13:17:21
63	450	50	69	2	Penyesuaian ke Slot S31	2026-09-16 13:21:40	2026-09-16 13:21:40
66	453	50	52	2	Penyesuaian ke Slot S14	2026-09-16 13:40:34	2026-09-16 13:40:34
69	456	51	63	2	Penyesuaian ke Slot S25	2026-09-16 13:40:55	2026-09-16 13:40:55
72	461	50	64	2	Penyesuaian ke Slot S26	2026-09-16 15:32:08	2026-09-16 15:32:08
75	511	65	71	72	Test override regresi	2026-10-05 10:16:52	2026-10-05 10:16:52
\.


--
-- Data for Name: staffs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staffs (id, user_id, phone_number, shift_group, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, is_active) FROM stdin;
50	Smoke Rich	rich_1791170077N@t.com	\N	$2y$12$NE.vFVus0n0xy2zW/tcqEO2UD6OjCu1hOysPMXM9rlUf/VLpeFqzG	\N	2026-10-05 10:14:38	2026-10-05 10:14:38	customer	t
54	Smoke Rich	rich_1791170118_594440202@t.com	\N	$2y$12$CfhSAG3CwqUj.pOohE3yIOP88bCoKn8WN9sC/Kdcv88nTPI./FSuW	\N	2026-10-05 10:15:18	2026-10-05 10:15:18	customer	t
58	SPS Customer Test	sps_customer_1791170148N@test.com	\N	$2y$12$dfqhWctrBBzqhudtkD8FtOBp1pN03mfGYfsYcnwwZPQLVqO3D2OpK	\N	2026-10-05 10:15:49	2026-10-05 10:15:49	customer	t
62	SPS Admin Test	sps_admin_1791170166N@test.com	\N	$2y$12$tVXPQzOVHvIX1mPML2i7kOaaHTwUVRZeDE2Jc180S9K8qBDH8fiya	\N	2026-10-05 10:16:07	2026-10-05 10:16:07	admin	t
66	SPS Staff Test	sps_staff_1791170184N.41165@test.com	\N	$2y$12$0HnGVcHcIhkGszl858tGJOnEfmw2IswwTEqc32zxwaipcoX3YTiGy	\N	2026-10-05 10:16:25	2026-10-05 10:16:25	staff	t
70	SPS Customer Test	sps_customer_1791170188N.41338@test.com	\N	$2y$12$gtXFuPuDxsLUpGk/kOtWjeuyFRohNP3ocBItacKcpajy2eWnOx.3C	\N	2026-10-05 10:16:29	2026-10-05 10:16:29	customer	t
51	Smoke Poor	poor_1791170077N@t.com	\N	$2y$12$yGNJKiYIOZLZL.cPOSiFJukYPCejVPSsB82lAfGc0FI2DeFLg7yg6	\N	2026-10-05 10:14:41	2026-10-05 10:14:41	customer	t
55	Smoke Poor	poor_1791170118_594440202@t.com	\N	$2y$12$5Vc0e5Ds9B0Ajj/dSFKy5.T6VUCn0ylDSZMdGrmw1guQo4PWxho1i	\N	2026-10-05 10:15:20	2026-10-05 10:15:20	customer	t
59	SPS Admin Test	sps_admin_1791170160N@test.com	\N	$2y$12$CHRT2tR30HSalYLU/THJaOyipEzkEvUYqnoMSyBlZ.qi7Xg8N35nS	\N	2026-10-05 10:16:01	2026-10-05 10:16:01	admin	t
63	SPS Staff Test	sps_staff_1791170166N@test.com	\N	$2y$12$OFGWuFqAH8pkQCqcYabwF.cix8f1sXwYweq91G3KbyPn.6/RZ3f92	\N	2026-10-05 10:16:07	2026-10-05 10:16:07	staff	t
67	SPS Customer Test	sps_customer_1791170184N.41165@test.com	\N	$2y$12$RGjQ.3JbcUQIaodXJMmS6u/xO.V3acCx7oSCSheQHbSLWNEo0waui	\N	2026-10-05 10:16:25	2026-10-05 10:16:25	customer	t
71	SPS Admin Test	sps_admin_1791170208N.42128@test.com	\N	$2y$12$1sESrGut1k6spztHxBHgD.2WYpqnKg3hZciIt./gO2/HdGG8U2cdW	\N	2026-10-05 10:16:49	2026-10-05 10:16:49	admin	t
56	SPS Admin Test	sps_admin_1791170148N@test.com	\N	$2y$12$8hHyf0r3CBYgiQ5IGPXAz.ZMJ3SwJdothwDhxSswtR56HYYtACXyO	\N	2026-10-05 10:15:48	2026-10-05 10:15:48	admin	t
60	SPS Staff Test	sps_staff_1791170160N@test.com	\N	$2y$12$xcshZ/w3MqeAGfn6thkKfeZvj4k4ZlEI7cDUDDQsDWNd2OrEKmQ3m	\N	2026-10-05 10:16:01	2026-10-05 10:16:01	staff	t
68	SPS Admin Test	sps_admin_1791170188N.41338@test.com	\N	$2y$12$XzrBth1VrV.SwVT3bi5W/eOhjvf1.X62A0StHqCuixZ29Jbji6b7S	\N	2026-10-05 10:16:28	2026-10-05 10:16:28	admin	t
72	SPS Staff Test	sps_staff_1791170208N.42128@test.com	\N	$2y$12$zVBjzRXjOrtcyeJzmqEIcO2VDnNWxtc3qT0o7AAZynS4e3xtMIGZ2	\N	2026-10-05 10:16:49	2026-10-05 10:16:49	staff	t
1	kiki	kiki@gmail.com	\N	$2y$12$AiLRfrTKv06LTNYmDd6/nu.oLnxuwJWDRa7vjmXO4FqkCswi3YYqG	\N	2026-06-28 15:53:39	2026-06-28 15:53:39	admin	t
3	Rizky Customer	rizky@member.com	\N	$2y$12$vkOU8h26NqgPN4EXQCPtSOuEntv7wTxxwCTuvQyKmIgo.0RZwgGFu	\N	2026-06-28 15:55:55	2026-06-28 15:55:55	customer	t
4	yanto	yanto@gmail.com	\N	$2y$12$LwLIEq/4kRM7JsB6vwcF3.1jp1Gfkcgc1qGGaPOX/VKtW6Z1ugVP6	\N	2026-06-28 17:17:59	2026-06-28 17:17:59	customer	t
5	M. Rizky Faiq Ghasani	nano@gmail.com	\N	$2y$12$w9vEfQdmAIrjSfIsFaspm.nAazo7Ky.CXoYuZQepvdvEt4FAxW1cq	\N	2026-06-28 18:49:01	2026-06-28 18:49:01	customer	t
6	ridwan hanif	ridwan@gmail.com	\N	$2y$12$YKFfE7VdfHdzALmDVPdjiuQ6vX0SZkW650ZxNpTSebiFsOHhiQfc.	\N	2026-06-29 10:22:34	2026-06-29 10:22:34	customer	t
37	SPS Staff Test	sps_staff_1787905746N@test.com	\N	$2y$12$m5c8JV8gQ/Im2Ij0hW5CXuaWRXJYJ7LA4cbVYN2dklJgGZpXUQSrG	\N	2026-08-28 15:29:07	2026-08-28 15:29:07	staff	t
38	SPS Admin Test	sps_admin_1787905801N@test.com	\N	$2y$12$RgKIXKMNxWlft0GnxqhYEOqglD0Te9tLYqdA.EJ90o65kGzAwNfkG	\N	2026-08-28 15:30:01	2026-08-28 15:30:01	admin	t
7	kiki1	kiki1@gmail.com	\N	$2y$12$LMsgrrSjHx4yWUXRwND/lO85FeWIwoh0rvQXTCr9COhqexF4Ps/gi	\N	2026-07-06 10:31:21	2026-07-06 10:31:21	admin	t
39	SPS Staff Test	sps_staff_1787905801N@test.com	\N	$2y$12$XVaq20yXN/cM.m3luFZBxOZLdzqeaChZwAQ05I.XmqcOqI2bxk/8m	\N	2026-08-28 15:30:02	2026-08-28 15:30:02	staff	t
2	staff1	staff1@gmail.com	\N	$2y$12$oMvcJjVyGKeIRbIQND/Pc.nL.MhQHasRHs3l7DRqNKZd99GMzbhhy	\N	2026-06-28 15:54:21	2026-08-19 17:25:34	staff	t
9	binus	binus@gmail.com	\N	$2y$12$m6Zsh6TxTFetltNzroj1HOLtP1.h58L/7mvu2fGKQBopdrkKmCbxu	\N	2026-08-20 16:40:57	2026-08-20 16:40:57	customer	t
40	SPS Admin Test	sps_admin_1787905834N@test.com	\N	$2y$12$Ee/14CcmMwVsDlPvrKVtq.OwQCj63YZP8ZEu1TlumLUScOW3FJ8K2	\N	2026-08-28 15:30:34	2026-08-28 15:30:34	admin	t
41	SPS Staff Test	sps_staff_1787905834N@test.com	\N	$2y$12$zrPiknRXPIzxA/JEHueeiu5kULLmYKY8hRkaDeSuj9KxAglO7t7xy	\N	2026-08-28 15:30:34	2026-08-28 15:30:34	staff	t
42	SPS Admin Test	sps_admin_1787905980N@test.com	\N	$2y$12$krJavrmQaE37Bnrsd3Zd2eFACINn5C0CZdxQHtE4j/ijIsSWFP20C	\N	2026-08-28 15:33:01	2026-08-28 15:33:01	admin	t
8	staff2	staff2@gmail.com	\N	$2y$12$bLC1C53ehFfjFBiTrEKbAOX5W6z68iDsDENSdPNyV6lFsbRe6I7ha	\N	2026-08-20 13:30:44	2026-08-24 11:20:57	staff	t
10	Admin Test	admin_test@test.com	\N	$2y$12$bIcwQa.b0CLYPc.0mhY0O.UnqFV9GBv.AI0wN.P3qEpoumuyPH0de	\N	2026-08-26 14:28:34	2026-08-26 14:28:34	admin	t
11	customer test	customer_test@gmail.com	\N	$2y$12$tmiFLy7L.Twe2GJjVQ/kKOPACh/GqBjEZXY.Lapmjxk1/92bwmDgG	\N	2026-08-26 14:32:31	2026-08-26 14:32:31	customer	t
12	Admin	admin@admin.com	\N	$2y$12$IyF3tLa0Sf83/PhHW5lBBujcJmSCXPM0shYoaphtVusMfh9ORn8ha	\N	2026-08-28 14:33:53	2026-08-28 14:33:53	admin	t
13	SPS Admin X	sps_x_1787903459N@test.com	\N	$2y$12$mHpV1fLyeBZ9dRf30nt43OjKnKhEZDZo7tOAiaxhOKaqFDrNpz2w.	\N	2026-08-28 14:51:00	2026-08-28 14:51:00	admin	t
14	Dbg Staff	dbg_1787903750@test.com	\N	$2y$12$6xbY8T24yoBKvVKp3iGxhuo.piniLSjIpPS5dRaJumSXYlORRMR9i	\N	2026-08-28 14:55:51	2026-08-28 14:55:51	staff	t
15	SPS Admin Test	sps_admin_1787903775N@test.com	\N	$2y$12$WtKTKwwk1efaOWpIh1TNmeqoGHi7u4hLDKwF1Tz2Lopls1JD2IvRS	\N	2026-08-28 14:56:15	2026-08-28 14:56:15	admin	t
16	SPS Staff Test	sps_staff_1787903775N@test.com	\N	$2y$12$2bZl2LrVtZdE4wxYC/K2kemF0/s/.9gbFPFuGfXZQ1gjx.g8caQHe	\N	2026-08-28 14:56:15	2026-08-28 14:56:15	staff	t
17	Admin Test 2	admin_test_2@test.com	\N	$2y$12$Phv489xUaaTiuzcX2q9PHuvh8G9bSbb3NEFVr/HyIA8zrGLqSlFQi	\N	2026-08-28 14:56:16	2026-08-28 14:56:16	admin	t
18	SPS Admin Test	sps_admin_1787903864N@test.com	\N	$2y$12$gzqZh77rYHvzOhVFcL2Z0.BBFlVrDZptxW55lq.1uhc/hf4PmSvVu	\N	2026-08-28 14:57:44	2026-08-28 14:57:44	admin	t
20	SPS Admin Test	sps_admin_1787903990N@test.com	\N	$2y$12$FaflAgM/qA8/8pwoVv.9RuQC73dZZQfBO7aVse.6M6kZec4Ne2vom	\N	2026-08-28 14:59:50	2026-08-28 14:59:50	admin	t
21	SPS Staff Test	sps_staff_1787903990N@test.com	\N	$2y$12$XFK8fh7DKDeSzoiYNgzgTOkxwpWUem8JF8haKJoT5fzy1M1Xyb8wq	\N	2026-08-28 14:59:51	2026-08-28 14:59:51	staff	t
22	SPS Admin Test	sps_admin_1787904222N@test.com	\N	$2y$12$uqegEStbgbas2kFy0W7Eqe2H.1STxZz9SG6XfE18yU6wo6DWdQjHi	\N	2026-08-28 15:03:42	2026-08-28 15:03:42	admin	t
24	SPS Admin Test	sps_admin_1787904243N@test.com	\N	$2y$12$B9rOp9Pbtd5UHokJWiLwteIpQvKRmPjzPGReU5KFvdU7/NRumZOr.	\N	2026-08-28 15:04:03	2026-08-28 15:04:03	admin	t
25	SPS Staff Test	sps_staff_1787904243N@test.com	\N	$2y$12$95sZ5U8WESWdjQtcYl.o2Oe9FGvHDHYe70nfN6eaTVHBc11zn/Pcm	\N	2026-08-28 15:04:03	2026-08-28 15:04:03	staff	t
26	SPS Admin Test	sps_admin_1787905350N@test.com	\N	$2y$12$gtj3oqeDG/EdLcoVFrxQXONKwM8ddpQCIbH6hpAKvZeK5C3npfNGq	\N	2026-08-28 15:22:30	2026-08-28 15:22:30	admin	t
27	SPS Staff Test	sps_staff_1787905350N@test.com	\N	$2y$12$MqnrQ3cM5ARuQlIx9lyJe.fYSOMa4wg6kL8gj..Rp25K5DncQA11i	\N	2026-08-28 15:22:30	2026-08-28 15:22:30	staff	t
28	SPS Admin Test	sps_admin_1787905478N@test.com	\N	$2y$12$OOzC4mtJfY8G3UWDzXJzuu4n0FVJjRfKy2ZVoBoYP4r5kJBM8/cBi	\N	2026-08-28 15:24:38	2026-08-28 15:24:38	admin	t
29	SPS Staff Test	sps_staff_1787905478N@test.com	\N	$2y$12$db7ktiV56ilBzXzXtcm40e8h.xd7CHc.Fj5AKiuhW05r8ksM.becu	\N	2026-08-28 15:24:39	2026-08-28 15:24:39	staff	t
30	SPS Admin Test	sps_admin_1787905579N@test.com	\N	$2y$12$27IQnVMS2Noi4ot1xY/Is.B4WvvispYe5Tgl./rZmNMlZ1nAw9Mim	\N	2026-08-28 15:26:19	2026-08-28 15:26:19	admin	t
31	SPS Staff Test	sps_staff_1787905579N@test.com	\N	$2y$12$iKv8JTNoqJybEYaNKlz/vuDPN/1BM5s8HSKndiISrjtDoJCdCB1yK	\N	2026-08-28 15:26:20	2026-08-28 15:26:20	staff	t
32	SPS Admin Test	sps_admin_1787905609N@test.com	\N	$2y$12$S.TPL/TQrUQMafWwHdgR/eki1Ggaqc5YtEuD4YbRr5XEk3XsAR9ri	\N	2026-08-28 15:26:49	2026-08-28 15:26:49	admin	t
33	SPS Staff Test	sps_staff_1787905609N@test.com	\N	$2y$12$DEuP1D9QJGUG0r1Y91VYkeqJfZ4G9kTmF/wteMTTNgC3fkaYxOSPK	\N	2026-08-28 15:26:50	2026-08-28 15:26:50	staff	t
34	SPS Admin Test	sps_admin_1787905668N@test.com	\N	$2y$12$O/yvn8muHHbZiFjkbAQble0zL3oF1zhyH9QES09pMnD5ZXJQjVZbq	\N	2026-08-28 15:27:48	2026-08-28 15:27:48	admin	t
35	SPS Staff Test	sps_staff_1787905668N@test.com	\N	$2y$12$05OsN8iCtStNeNHFTiXCM.SiT9ISV.Sqm1lzWbN7NPynFBwaF1g4C	\N	2026-08-28 15:27:49	2026-08-28 15:27:49	staff	t
36	SPS Admin Test	sps_admin_1787905746N@test.com	\N	$2y$12$onGz8ITIBTrgMqbMOgQ89OCJ4m6UScIKu5IvfnkOXsVCIqnTRLbne	\N	2026-08-28 15:29:07	2026-08-28 15:29:07	admin	t
43	SPS Staff Test	sps_staff_1787905980N@test.com	\N	$2y$12$ENp57Fb9IWRzULOg5LX70eg2n7vlyXz0RoxvRC5xvxp1E2GKH0f4O	\N	2026-08-28 15:33:01	2026-08-28 15:33:01	staff	t
44	SPS Admin Test	sps_admin_1787905996N@test.com	\N	$2y$12$he8uTK0cuOjxZtQrZAxipOlpZVqnDLQUMsjx4MjLyRIFg1ceI.tVG	\N	2026-08-28 15:33:17	2026-08-28 15:33:17	admin	t
47	SPS Staff Test	sps_staff_1787906136N@test.com	\N	$2y$12$80DqVAMr5NJtX/hJqRs3VuQcxzx62mllk2Bl/b7Nwzem4vCg1lToi	\N	2026-08-28 15:35:37	2026-08-28 15:35:37	staff	t
45	SPS Staff Test	sps_staff_1787905996N@test.com	\N	$2y$12$3qY2YpyaJJfS9iqMvOEAFuW0w/VrDoxOajKxaEWz9q0kSi32ucc7u	\N	2026-08-28 15:33:17	2026-08-28 15:33:17	staff	t
46	SPS Admin Test	sps_admin_1787906136N@test.com	\N	$2y$12$7jiuFndl8e24olI2EJ8hl.9qiBRF0grRg4pmXmAkpfLhRWFm9rpB6	\N	2026-08-28 15:35:36	2026-08-28 15:35:36	admin	t
19	SPS Staff Test	sps_staff_1787903864N@test.com	\N	$2y$12$NGX40km9cAGOUqZBj2PwKuJ8rjFDBjQMkt967KyEMSmU.t3IKkJla	\N	2026-08-28 14:57:45	2026-08-28 16:07:30	staff	f
48	SPS Admin Test	sps_admin_1787907084N@test.com	\N	$2y$12$5jl.Es082xII27HALPBzROzXia3Dl22k5aRQoqAw4tKf8w9t6EjaS	\N	2026-08-28 15:51:24	2026-08-28 15:51:24	admin	t
49	SPS Staff Test	sps_staff_1787907084N@test.com	\N	$2y$12$0A8/hlTEsEw8azJuFRwsxOTzXlywCIIJ/ssr587S6PrQCt7poZRdu	\N	2026-08-28 15:51:25	2026-08-28 15:51:25	staff	t
23	SPS Staff Test	sps_staff_1787904222N@test.com	\N	$2y$12$U3Y.DungCn9PXr4ccaPNHercNbOIG.UFPTkowCu35XVjsfSu0Tj3y	\N	2026-08-28 15:03:42	2026-08-28 16:07:49	staff	t
57	SPS Staff Test	sps_staff_1791170148N@test.com	\N	$2y$12$DmIRwo4vNIBKZA/3maqJaeQknF9tp9AVoAFXyfD.7A38WxrxP4uA2	\N	2026-10-05 10:15:49	2026-10-05 10:15:49	staff	t
65	SPS Admin Test	sps_admin_1791170184N.41165@test.com	\N	$2y$12$v4bSk0m.E8d1BeS3oK6FFOMuMmsh6LDvgJSx9T/tT8LMTibGTxvJq	\N	2026-10-05 10:16:24	2026-10-05 10:16:24	admin	t
69	SPS Staff Test	sps_staff_1791170188N.41338@test.com	\N	$2y$12$O8QxRZhBUHpV/6eJnm8ZQ.2LooSqwgOztH1RrUwvEb9njSyO8fF3q	\N	2026-10-05 10:16:29	2026-10-05 10:16:29	staff	t
73	SPS Customer Test	sps_customer_1791170208N.42128@test.com	\N	$2y$12$aBsRSYl5XacSnjwd7hpd..L9Ud95oLGgPnq8hfsdOwutprxcYp.Ye	\N	2026-10-05 10:16:50	2026-10-05 10:16:50	customer	t
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, false);


--
-- Name: balance_topups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.balance_topups_id_seq', 21, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 18, true);


--
-- Name: edges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.edges_id_seq', 258, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: manual_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.manual_verifications_id_seq', 66, true);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.members_id_seq', 5, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 30, true);


--
-- Name: nodes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nodes_id_seq', 121, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 274, true);


--
-- Name: parking_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parking_slots_id_seq', 85, true);


--
-- Name: parking_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.parking_transactions_id_seq', 535, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 346, true);


--
-- Name: revenue_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.revenue_configs_id_seq', 4, true);


--
-- Name: slot_overrides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.slot_overrides_id_seq', 77, true);


--
-- Name: staffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staffs_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 73, true);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_user_id_unique UNIQUE (user_id);


--
-- Name: balance_topups balance_topups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_topups
    ADD CONSTRAINT balance_topups_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_registered_plate_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_registered_plate_number_unique UNIQUE (registered_plate_number);


--
-- Name: customers customers_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_unique UNIQUE (user_id);


--
-- Name: edges edges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edges
    ADD CONSTRAINT edges_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: manual_verifications manual_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_verifications
    ADD CONSTRAINT manual_verifications_pkey PRIMARY KEY (id);


--
-- Name: members members_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_customer_id_unique UNIQUE (customer_id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: nodes nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parking_slots parking_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_pkey PRIMARY KEY (id);


--
-- Name: parking_transactions parking_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_transactions
    ADD CONSTRAINT parking_transactions_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: revenue_configs revenue_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_configs
    ADD CONSTRAINT revenue_configs_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: slot_overrides slot_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_overrides
    ADD CONSTRAINT slot_overrides_pkey PRIMARY KEY (id);


--
-- Name: staffs staffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_pkey PRIMARY KEY (id);


--
-- Name: staffs staffs_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_user_id_unique UNIQUE (user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: balance_topups_customer_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX balance_topups_customer_id_index ON public.balance_topups USING btree (customer_id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: parking_slots_slot_code_active_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parking_slots_slot_code_active_unique ON public.parking_slots USING btree (slot_code) WHERE (deleted_at IS NULL);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: admins admins_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: balance_topups balance_topups_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_topups
    ADD CONSTRAINT balance_topups_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customers customers_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: edges edges_source_node_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edges
    ADD CONSTRAINT edges_source_node_id_foreign FOREIGN KEY (source_node_id) REFERENCES public.nodes(id) ON DELETE CASCADE;


--
-- Name: edges edges_target_node_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edges
    ADD CONSTRAINT edges_target_node_id_foreign FOREIGN KEY (target_node_id) REFERENCES public.nodes(id) ON DELETE CASCADE;


--
-- Name: manual_verifications manual_verifications_staff_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_verifications
    ADD CONSTRAINT manual_verifications_staff_id_foreign FOREIGN KEY (staff_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: manual_verifications manual_verifications_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manual_verifications
    ADD CONSTRAINT manual_verifications_transaction_id_foreign FOREIGN KEY (transaction_id) REFERENCES public.parking_transactions(id) ON DELETE CASCADE;


--
-- Name: members members_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: nodes nodes_parking_slot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nodes
    ADD CONSTRAINT nodes_parking_slot_id_foreign FOREIGN KEY (parking_slot_id) REFERENCES public.parking_slots(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_from_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_from_user_id_foreign FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_resolved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_resolved_by_foreign FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_to_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_to_user_id_foreign FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_transaction_id_foreign FOREIGN KEY (transaction_id) REFERENCES public.parking_transactions(id) ON DELETE SET NULL;


--
-- Name: parking_transactions parking_transactions_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_transactions
    ADD CONSTRAINT parking_transactions_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: parking_transactions parking_transactions_detected_slot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_transactions
    ADD CONSTRAINT parking_transactions_detected_slot_id_foreign FOREIGN KEY (detected_slot_id) REFERENCES public.parking_slots(id) ON DELETE SET NULL;


--
-- Name: parking_transactions parking_transactions_parking_slot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_transactions
    ADD CONSTRAINT parking_transactions_parking_slot_id_foreign FOREIGN KEY (parking_slot_id) REFERENCES public.parking_slots(id);


--
-- Name: parking_transactions parking_transactions_revenue_config_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_transactions
    ADD CONSTRAINT parking_transactions_revenue_config_id_foreign FOREIGN KEY (revenue_config_id) REFERENCES public.revenue_configs(id) ON DELETE SET NULL;


--
-- Name: revenue_configs revenue_configs_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenue_configs
    ADD CONSTRAINT revenue_configs_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: slot_overrides slot_overrides_new_slot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_overrides
    ADD CONSTRAINT slot_overrides_new_slot_id_foreign FOREIGN KEY (new_slot_id) REFERENCES public.parking_slots(id) ON DELETE CASCADE;


--
-- Name: slot_overrides slot_overrides_old_slot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_overrides
    ADD CONSTRAINT slot_overrides_old_slot_id_foreign FOREIGN KEY (old_slot_id) REFERENCES public.parking_slots(id) ON DELETE CASCADE;


--
-- Name: slot_overrides slot_overrides_staff_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_overrides
    ADD CONSTRAINT slot_overrides_staff_id_foreign FOREIGN KEY (staff_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: slot_overrides slot_overrides_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_overrides
    ADD CONSTRAINT slot_overrides_transaction_id_foreign FOREIGN KEY (transaction_id) REFERENCES public.parking_transactions(id) ON DELETE CASCADE;


--
-- Name: staffs staffs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict oHIY5w3c94j3XzRxprhauhstAClFmaiojXLjGF6PvzkXK1AGG79l7jAfN1Y4puK

