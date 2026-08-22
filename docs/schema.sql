-- Reference schema (Hibernate auto-generates this from entities with ddl-auto=update,
-- but this file is provided so you understand the exact structure, and can use it directly
-- for a fresh production database if you prefer explicit schema management).
--
-- If you are UPGRADING an existing database from the earlier CRUD-based version of this
-- project, see docs/MIGRATION_NOTES.md for the exact ALTER/DROP statements instead of
-- running this file (which assumes a brand-new database).

CREATE DATABASE IF NOT EXISTS homestay_db CHARACTER SET utf8mb4;
USE homestay_db;

CREATE TABLE admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ADMIN'
);

-- Room is intentionally minimal: identity + capacity + pricing only.
-- Photos, descriptions, and facility lists live in frontend/src/content/rooms.js —
-- that file's `id` field must match this table's `id` column per physical room.
CREATE TABLE room (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    max_guests INT NOT NULL,
    base_occupancy INT NOT NULL DEFAULT 2,
    weekday_price DECIMAL(10,2) NOT NULL,
    weekend_price DECIMAL(10,2) NOT NULL,
    extra_guest_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE booking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    email VARCHAR(150),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (room_id) REFERENCES room(id),
    INDEX idx_booking_room_dates (room_id, check_in, check_out, status)
);

CREATE TABLE blocked_date (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(200),
    FOREIGN KEY (room_id) REFERENCES room(id),
    INDEX idx_blocked_room_dates (room_id, start_date, end_date)
);

-- ===== Sample data matching frontend/src/content/rooms.js =====
-- IMPORTANT: these two rows' auto-generated IDs (1 and 2, on a fresh database) must match
-- the `id` fields used in frontend/src/content/rooms.js. If you already have data and the
-- IDs come out differently, update rooms.js to match — do NOT force specific IDs with
-- manual INSERT ID values on a running system, as that can conflict with AUTO_INCREMENT.
--
-- PRICES BELOW ARE PLACEHOLDER ZEROS — the client said real prices would be provided
-- separately. Set the real weekday_price / weekend_price / extra_guest_price / discount_percent
-- via the Admin -> Pricing screen before going live. Do not leave these at 0.

INSERT INTO room (name, max_guests, base_occupancy, weekday_price, weekend_price, extra_guest_price, discount_percent) VALUES
('Double Bed', 4, 2, 0.00, 0.00, 0.00, 0),
('Double Bed with View', 4, 2, 0.00, 0.00, 0.00, 0);
