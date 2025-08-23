--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

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
-- Name: ensure_single_active_announcement(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ensure_single_active_announcement() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- E??er yeni duyuru aktif ediliyorsa, di??er t??m aktif duyurular?? pasif yap
    IF NEW.is_active = true THEN
        UPDATE announcements 
        SET is_active = false 
        WHERE is_active = true AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title text,
    content text,
    is_active boolean DEFAULT true,
    display_once_per_session boolean DEFAULT false,
    image_url text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: contact_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_info (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    icon character varying(100),
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: contact_info_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_info_id_seq OWNED BY public.contact_info.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    file_url character varying(500) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size integer,
    document_type character varying(100) NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id text NOT NULL,
    resource_id text,
    original_name text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    file_type text NOT NULL,
    bucket_name text DEFAULT 'materials'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT grades_category_check CHECK ((category = ANY (ARRAY['İlkokul'::text, 'Ortaokul'::text, 'Lise'::text, 'Yabancı Dil'::text, 'Evraklar'::text, 'ELT Arena Ekibi'::text, 'Bize Ulaşın'::text])))
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id text NOT NULL,
    unit_id integer NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    description text,
    link text,
    preview_link text,
    download_link text,
    file_url text,
    file_name text,
    file_size bigint,
    file_type text,
    category character varying(50),
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resources_type_check CHECK ((type = ANY (ARRAY['book-presentation'::text, 'game'::text, 'summary'::text, 'quiz'::text, 'video'::text, 'worksheet'::text, 'file'::text]))),
    CONSTRAINT resources_game_category_check CHECK (((type <> 'game'::text) OR ((type = 'game'::text) AND (category IS NOT NULL) AND (category = ANY (ARRAY['Fortune Match'::character varying, 'Tower Game'::character varying, 'Wordwall'::character varying, 'Baamboozle'::character varying, 'Words of Wisdom'::character varying, 'Kahoot!'::character varying])))))
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    bio text,
    photo_url character varying(500),
    email character varying(255),
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units (
    id integer NOT NULL,
    grade_id text NOT NULL,
    title text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: contact_info id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_info ALTER COLUMN id SET DEFAULT nextval('public.contact_info_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: units id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: contact_info contact_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_info
    ADD CONSTRAINT contact_info_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: units unique_grade_unit_order; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT unique_grade_unit_order UNIQUE (grade_id, title, order_index);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_users_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_users_active ON public.admin_users USING btree (is_active);


--
-- Name: idx_admin_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_users_username ON public.admin_users USING btree (username);


--
-- Name: idx_announcements_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcements_created_by ON public.announcements USING btree (created_by);


--
-- Name: idx_announcements_image_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcements_image_url ON public.announcements USING btree (image_url);


--
-- Name: idx_announcements_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcements_is_active ON public.announcements USING btree (is_active);


--
-- Name: idx_files_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_files_resource_id ON public.files USING btree (resource_id);


--
-- Name: idx_resources_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_created_by ON public.resources USING btree (created_by);


--
-- Name: idx_resources_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_type ON public.resources USING btree (type);


--
-- Name: idx_resources_unit_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_unit_id ON public.resources USING btree (unit_id);

--
-- Name: idx_resources_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_category ON public.resources USING btree (category);


--
-- Name: idx_units_grade_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_units_grade_id ON public.units USING btree (grade_id);


--
-- Name: announcements single_active_announcement_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER single_active_announcement_trigger BEFORE INSERT OR UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.ensure_single_active_announcement();


--
-- Name: announcements update_announcements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: grades update_grades_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: resources update_resources_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: units update_units_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: files files_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: resources resources_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: resources resources_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE CASCADE;


--
-- Name: units units_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

