CREATE DATABASE doctorAppointment;
USE doctorAppointment;

-- Users table (extends authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  image_url TEXT,
  location TEXT NOT NULL,
  available_days TEXT NOT NULL, -- Stored as JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  location_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  service_id INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY,
  message TEXT NOT NULL,
  user_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY,
  appointment_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Cancellations table
CREATE TABLE IF NOT EXISTS cancellations (
  id INT PRIMARY KEY,
  appointment_id INT NOT NULL,
  reason TEXT,
  refund_amount DECIMAL(10,2),
  cancellation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);



-- Insert users
INSERT INTO users (id, full_name, email, phone, address, password, created_at) VALUES
(1, 'Amit Sharma', 'amit.sharma@example.com', '9876543210', 'Bangalore, Karnataka', 'password123', NOW()),
(2, 'Priya Iyer', 'priya.iyer@example.com', '8765432109', 'Chennai, Tamil Nadu', 'securepass', NOW()),
(3, 'Ravi Verma', 'ravi.verma@example.com', '7654321098', 'Mumbai, Maharashtra', 'mypassword', NOW()),
(4, 'Sneha Kapoor', 'sneha.kapoor@example.com', '6543210987', 'Delhi, India', 'pass@123', NOW()),
(5, 'Arjun Reddy', 'arjun.reddy@example.com', '5432109876', 'Hyderabad, Telangana', 'reddypass', NOW());

-- Insert locations (Hospitals/Clinics)
INSERT INTO locations (id, name, address, city, country, created_at) VALUES
(1, 'Apollo Hospitals', 'Bannerghatta Road', 'Bangalore', 'India', NOW()),
(2, 'Fortis Hospital', 'Adyar', 'Chennai', 'India', NOW()),
(3, 'Nanavati Hospital', 'Vile Parle', 'Mumbai', 'India', NOW()),
(4, 'Max Super Specialty Hospital', 'Saket', 'Delhi', 'India', NOW()),
(5, 'Care Hospitals', 'Banjara Hills', 'Hyderabad', 'India', NOW());

-- Insert doctors
INSERT INTO doctors (id, name, specialization, location, available_days, created_at) VALUES
(1, 'Dr. Ramesh Kumar', 'Cardiologist', 'Apollo Hospitals', '["Monday","Wednesday","Friday"]', NOW()),
(2, 'Dr. Meena Nair', 'Dermatologist', 'Fortis Hospital', '["Tuesday","Thursday","Saturday"]', NOW()),
(3, 'Dr. Anil Deshmukh', 'Orthopedic', 'Nanavati Hospital', '["Monday","Tuesday","Thursday"]', NOW()),
(4, 'Dr. Sunita Aggarwal', 'Pediatrician', 'Max Super Specialty Hospital', '["Wednesday","Friday","Sunday"]', NOW()),
(5, 'Dr. Kiran Reddy', 'Neurologist', 'Care Hospitals', '["Monday","Thursday","Saturday"]', NOW());

-- Insert services
INSERT INTO services (id, name, description, price, location_id, created_at) VALUES
(1, 'General Consultation', 'Regular health check-up', 800.00, 1, NOW()),
(2, 'Dermatology Consultation', 'Skin and hair treatment', 1200.00, 2, NOW()),
(3, 'Orthopedic Consultation', 'Bone and joint treatment', 1500.00, 3, NOW()),
(4, 'Child Health Checkup', 'Pediatric consultation', 900.00, 4, NOW()),
(5, 'Neurology Consultation', 'Brain and nerve-related issues', 1800.00, 5, NOW());

-- Insert appointments
INSERT INTO appointments (id, patient_id, doctor_id, service_id, appointment_date, notes, status, created_at) VALUES
(1, 1, 1, 1, '2025-03-15 10:00:00', 'Regular check-up', 'confirmed', NOW()),
(2, 2, 2, 2, '2025-03-16 11:30:00', 'Skin allergy', 'pending', NOW()),
(3, 3, 3, 3, '2025-03-17 09:45:00', 'Knee pain', 'confirmed', NOW()),
(4, 4, 4, 4, '2025-03-18 14:00:00', 'Routine child check-up', 'pending', NOW()),
(5, 5, 5, 5, '2025-03-19 16:00:00', 'Headaches', 'confirmed', NOW());

-- Insert reviews
INSERT INTO reviews (id, patient_id, doctor_id, rating, comment, created_at) VALUES
(1, 1, 1, 5, 'Excellent consultation and guidance.', NOW()),
(2, 2, 2, 4, 'Good dermatologist, but waiting time was long.', NOW()),
(3, 3, 3, 5, 'Very knowledgeable orthopedic.', NOW()),
(4, 4, 4, 3, 'Decent pediatrician, but consultation felt rushed.', NOW()),
(5, 5, 5, 4, 'Helpful neurologist with great insights.', NOW());

-- Insert notifications
INSERT INTO notifications (id, message, user_id, is_read, created_at) VALUES
(1, 'Your appointment with Dr. Ramesh Kumar is confirmed.', 1, FALSE, NOW()),
(2, 'Reminder: Your dermatology consultation is tomorrow.', 2, FALSE, NOW()),
(3, 'Invoice for your orthopedic consultation is generated.', 3, TRUE, NOW()),
(4, 'Your appointment with Dr. Sunita Aggarwal is pending approval.', 4, FALSE, NOW()),
(5, 'Reminder: Neurology consultation scheduled at 4 PM.', 5, TRUE, NOW());

-- Insert invoices
INSERT INTO invoices (id, appointment_id, amount, status, invoice_date, created_at) VALUES
(1, 1, 800.00, 'paid', NOW(), NOW()),
(2, 2, 1200.00, 'pending', NOW(), NOW()),
(3, 3, 1500.00, 'paid', NOW(), NOW()),
(4, 4, 900.00, 'cancelled', NOW(), NOW()),
(5, 5, 1800.00, 'paid', NOW(), NOW());

-- Insert cancellations
INSERT INTO cancellations (id, appointment_id, reason, refund_amount, cancellation_date, created_at) VALUES
(1, 4, 'Scheduling conflict', 900.00, NOW(), NOW()),
(2, 2, 'Personal reasons', 0.00, NOW(), NOW()),
(3, NULL, NULL, NULL, NULL, NULL), -- No cancellation for this record
(4, NULL, NULL, NULL, NULL, NULL), -- No cancellation for this record
(5, NULL, NULL, NULL, NULL, NULL); -- No cancellation for this record
