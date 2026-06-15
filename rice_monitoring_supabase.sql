--
-- Cleaned schema extracted from rice_monitoring.sql for Supabase SQL Editor.
-- Keeps schema objects, constraints, indexes, and foreign keys.
-- Removes pg_dump meta-commands, ownership changes, COPY data blocks, and setval calls.
--

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

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE public.analysis_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    flight_height_m numeric,
    source_type text DEFAULT 'upload'::text NOT NULL,
    notes text,
    profile_id text,
    profile_name text,
    planted_date date,
    planted_time time without time zone,
    rice_variety text,
    maturity_days integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT analysis_batches_category_check CHECK ((category = ANY (ARRAY['whole_field'::text, 'partial_field'::text, 'close_up'::text])))
);

CREATE TABLE public.analysis_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batch_id uuid NOT NULL,
    health_status text NOT NULL,
    health_score integer NOT NULL,
    green_percentage numeric DEFAULT 0 NOT NULL,
    yellow_percentage numeric DEFAULT 0 NOT NULL,
    brown_percentage numeric DEFAULT 0 NOT NULL,
    harvest_ready boolean DEFAULT false,
    recommendations text,
    interpretation text,
    total_sections integer,
    healthy_sections integer,
    warning_sections integer,
    poor_sections integer,
    grid_estimate text,
    analyzed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    grid_rows integer,
    grid_cols integer,
    analysis_version integer DEFAULT 1 NOT NULL,
    parent_analysis_result_id uuid,
    CONSTRAINT analysis_results_health_score_check CHECK (((health_score >= 0) AND (health_score <= 100)))
);

CREATE TABLE public.analysis_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    analysis_result_id uuid NOT NULL,
    section_label text NOT NULL,
    row_index integer,
    col_index integer,
    health_status text NOT NULL,
    health_score integer NOT NULL,
    green_percentage numeric DEFAULT 0 NOT NULL,
    yellow_percentage numeric DEFAULT 0 NOT NULL,
    brown_percentage numeric DEFAULT 0 NOT NULL,
    recommendations text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_excluded boolean DEFAULT false NOT NULL,
    excluded_at timestamp with time zone,
    exclude_reason text,
    parent_section_id uuid,
    level integer DEFAULT 1 NOT NULL,
    grid_rows integer,
    grid_cols integer,
    plant_image_id uuid,
    CONSTRAINT analysis_sections_health_score_check CHECK (((health_score >= 0) AND (health_score <= 100)))
);

CREATE TABLE public.plant_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_data text NOT NULL,
    captured_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    source_type text DEFAULT 'webcam'::text,
    drone_model text,
    flight_session_id uuid,
    latitude numeric,
    longitude numeric,
    altitude numeric,
    batch_id uuid,
    original_image_data text,
    image_order integer
);

CREATE TABLE public.supabase_sync_queue (
    id bigint NOT NULL,
    batch_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    retry_count integer DEFAULT 0 NOT NULL,
    last_error text,
    last_attempt_at timestamp with time zone,
    synced_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT supabase_sync_queue_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'synced'::text, 'failed'::text])))
);

CREATE SEQUENCE public.supabase_sync_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.supabase_sync_queue_id_seq OWNED BY public.supabase_sync_queue.id;

ALTER TABLE ONLY public.supabase_sync_queue
    ALTER COLUMN id SET DEFAULT nextval('public.supabase_sync_queue_id_seq'::regclass);

ALTER TABLE ONLY public.analysis_batches
    ADD CONSTRAINT analysis_batches_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_batch_id_unique UNIQUE (batch_id);

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.analysis_sections
    ADD CONSTRAINT analysis_sections_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.plant_images
    ADD CONSTRAINT plant_images_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.supabase_sync_queue
    ADD CONSTRAINT supabase_sync_queue_pkey PRIMARY KEY (id);

CREATE INDEX idx_analysis_batches_created_at ON public.analysis_batches USING btree (created_at DESC);

CREATE INDEX idx_analysis_batches_profile_id ON public.analysis_batches USING btree (profile_id);

CREATE INDEX idx_analysis_batches_profile_name ON public.analysis_batches USING btree (profile_name);

CREATE INDEX idx_analysis_batches_source_type ON public.analysis_batches USING btree (source_type);

CREATE INDEX idx_analysis_results_analyzed_at ON public.analysis_results USING btree (analyzed_at DESC);

CREATE INDEX idx_analysis_results_batch_id ON public.analysis_results USING btree (batch_id);

CREATE INDEX idx_analysis_results_parent_analysis_result_id ON public.analysis_results USING btree (parent_analysis_result_id);

CREATE INDEX idx_analysis_sections_excluded ON public.analysis_sections USING btree (is_excluded);

CREATE INDEX idx_analysis_sections_label ON public.analysis_sections USING btree (section_label);

CREATE INDEX idx_analysis_sections_parent_section_id ON public.analysis_sections USING btree (parent_section_id);

CREATE INDEX idx_analysis_sections_plant_image_id ON public.analysis_sections USING btree (plant_image_id);

CREATE INDEX idx_analysis_sections_result_id ON public.analysis_sections USING btree (analysis_result_id);

CREATE INDEX idx_plant_images_batch_id ON public.plant_images USING btree (batch_id);

CREATE INDEX idx_plant_images_captured_at ON public.plant_images USING btree (captured_at DESC);

CREATE INDEX idx_plant_images_flight_session_id ON public.plant_images USING btree (flight_session_id);

CREATE INDEX idx_plant_images_source_type ON public.plant_images USING btree (source_type);

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.analysis_batches(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.analysis_results
    ADD CONSTRAINT analysis_results_parent_result_fkey FOREIGN KEY (parent_analysis_result_id) REFERENCES public.analysis_results(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.analysis_sections
    ADD CONSTRAINT analysis_sections_parent_section_fkey FOREIGN KEY (parent_section_id) REFERENCES public.analysis_sections(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.analysis_sections
    ADD CONSTRAINT analysis_sections_plant_image_id_fkey FOREIGN KEY (plant_image_id) REFERENCES public.plant_images(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.analysis_sections
    ADD CONSTRAINT analysis_sections_result_fkey FOREIGN KEY (analysis_result_id) REFERENCES public.analysis_results(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.plant_images
    ADD CONSTRAINT plant_images_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.analysis_batches(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.supabase_sync_queue
    ADD CONSTRAINT supabase_sync_queue_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.analysis_batches(id) ON DELETE CASCADE;
