-- ============================================================
-- Habesha Event Management System — Database Schema
-- ============================================================

-- Drop tables if they exist to allow recreation
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payment_method_configs;
DROP TABLE IF EXISTS pricing_rules;
DROP TABLE IF EXISTS gallery_reactions;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id           CHAR(36) PRIMARY KEY,
    profileImage VARCHAR(255),
    firstName    VARCHAR(50)  NOT NULL,
    lastName     VARCHAR(50)  NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    phone        VARCHAR(50)  NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    role         ENUM('user','admin') NOT NULL DEFAULT 'user',
    status       ENUM('active','inactive','pending','suspended') NOT NULL DEFAULT 'active',
    emailVerified       TINYINT(1) NOT NULL DEFAULT 0,
    emailVerifyToken    VARCHAR(255),
    twoFactorEnabled    TINYINT(1) NOT NULL DEFAULT 0,
    twoFactorSecret     VARCHAR(255),
    twoFactorTempToken  VARCHAR(255),
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default admin (password: Admin@1234)
INSERT INTO users (id, firstName, lastName, email, phone, passwordHash, role, status, emailVerified)
VALUES (
    UUID(),
    'Admin', 'User',
    'admin@habesha-events.com',
    '0911000000',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin', 'active', 1
);

CREATE TABLE services (
    id          CHAR(36) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       INT          NOT NULL,
    currency    VARCHAR(10)  DEFAULT 'ETB',
    category    ENUM('catering','decoration','entertainment','photography','venue','other') NOT NULL,
    status      ENUM('active','inactive') DEFAULT 'active',
    featured    BOOLEAN DEFAULT FALSE,
    images      JSON,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id           CHAR(36) PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    eventType    ENUM('wedding','birthday','corporate','decoration','catering','other') NOT NULL DEFAULT 'other',
    location     VARCHAR(255),
    latitude     FLOAT,
    longitude    FLOAT,
    eventDate    DATE NOT NULL,
    eventTime    TIME NOT NULL,
    ticketPrice  INT  NOT NULL,
    totalTickets INT,
    soldTickets  INT  NOT NULL DEFAULT 0,
    imageUrl     VARCHAR(255),
    status       ENUM('active','inactive','cancelled') NOT NULL DEFAULT 'active',
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id              CHAR(36) PRIMARY KEY,
    userId          CHAR(36),
    customerName    VARCHAR(255) NOT NULL,
    customerEmail   VARCHAR(255) NOT NULL,
    customerPhone   VARCHAR(50)  NOT NULL,
    serviceId       CHAR(36),
    serviceSnapshot JSON,
    eventType       ENUM('wedding','birthday','corporate','other') DEFAULT 'wedding',
    eventDate       DATE,
    eventTime       TIME,
    guestCount      INT,
    durationHours   INT NOT NULL DEFAULT 5,
    totalPrice      INT NOT NULL DEFAULT 0,
    status          ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
    notes           TEXT,
    qrCode          TEXT,
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId)    REFERENCES users(id),
    FOREIGN KEY (serviceId) REFERENCES services(id)
);

CREATE TABLE payments (
    id            CHAR(36) PRIMARY KEY,
    bookingId     CHAR(36),
    eventId       CHAR(36),
    userId        CHAR(36),
    amount        INT          NOT NULL,
    currency      VARCHAR(10)  DEFAULT 'ETB',
    paymentMethod ENUM('telebirr','cbe','commercial','abisiniya','abyssinia') NOT NULL,
    phoneNumber   VARCHAR(50),
    status        ENUM('pending','completed','failed') DEFAULT 'pending',
    transactionId VARCHAR(255),
    proofUrl      VARCHAR(255),
    paymentDate   TIMESTAMP NULL,
    createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES bookings(id),
    FOREIGN KEY (eventId)   REFERENCES events(id),
    FOREIGN KEY (userId)    REFERENCES users(id)
);

CREATE TABLE gallery (
    id            CHAR(36) PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    category      ENUM('wedding','birthday','corporate','decoration','catering','other') NOT NULL,
    location      VARCHAR(255),
    date          DATE,
    imageFilename VARCHAR(255) NOT NULL,
    imageUrl      VARCHAR(255) NOT NULL,
    createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE gallery_reactions (
    id        CHAR(36) PRIMARY KEY,
    galleryId CHAR(36) NOT NULL,
    userId    CHAR(36) NOT NULL,
    reaction  ENUM('like','dislike') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (galleryId, userId),
    FOREIGN KEY (galleryId) REFERENCES gallery(id),
    FOREIGN KEY (userId)    REFERENCES users(id)
);

CREATE TABLE pricing_rules (
    id           CHAR(36) PRIMARY KEY,
    eventType    ENUM('wedding','birthday','corporate','other') NOT NULL UNIQUE,
    basePrice    INT NOT NULL,
    perGuest     INT NOT NULL,
    perHour      INT NOT NULL,
    defaultHours INT NOT NULL DEFAULT 5,
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default pricing rules
INSERT INTO pricing_rules (id, eventType, basePrice, perGuest, perHour, defaultHours) VALUES
(UUID(), 'wedding',   10000, 50, 500, 8),
(UUID(), 'birthday',   5000, 30, 300, 5),
(UUID(), 'corporate',  8000, 40, 400, 6),
(UUID(), 'other',      3000, 20, 200, 4);

CREATE TABLE payment_method_configs (
    id                    CHAR(36) PRIMARY KEY,
    method                VARCHAR(64) NOT NULL UNIQUE,
    receiverName          VARCHAR(255),
    receiverPhone         VARCHAR(50),
    receiverAccountNumber VARCHAR(64),
    note                  TEXT,
    active                BOOLEAN DEFAULT TRUE,
    createdAt             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default payment method configs
INSERT INTO payment_method_configs (id, method, receiverName, receiverPhone, receiverAccountNumber, note, active) VALUES
(UUID(), 'telebirr',   'Habesha Events', '0911000000', '',              'Send via Telebirr and upload screenshot', TRUE),
(UUID(), 'cbe',        'Habesha Events', '0911000000', '1000123456789', 'Send via CBE and upload screenshot',      TRUE),
(UUID(), 'commercial', 'Habesha Events', '',           '2000123456789', 'Send via Commercial Bank',                TRUE),
(UUID(), 'abyssinia',  'Habesha Events', '',           '3000123456789', 'Send via Abyssinia Bank',                 TRUE);

CREATE TABLE notifications (
    id        CHAR(36) PRIMARY KEY,
    userId    CHAR(36),
    type      ENUM('booking_created','payment_created','payment_completed','payment_failed',
                   'booking_confirmed','booking_cancelled','system','promotional') NOT NULL,
    title     VARCHAR(255) NOT NULL,
    message   TEXT         NOT NULL,
    `read`    BOOLEAN DEFAULT FALSE,
    metadata  TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id           CHAR(36) PRIMARY KEY,
    userId       CHAR(36),
    action       VARCHAR(255) NOT NULL,
    resourceType VARCHAR(255) NOT NULL,
    resourceId   VARCHAR(255),
    ip           VARCHAR(64),
    userAgent    TEXT,
    data         JSON,
    createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
