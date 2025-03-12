// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// ----- AUTH ROUTES -----

// Login route
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // In a real app, you would use bcrypt.compare
    // For simplicity in this example, we're doing a direct comparison
    // const validPassword = await bcrypt.compare(password, user.password);
    const validPassword = password === user.password;
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Register route
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // In a real app, you would hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password;
    
    // Get the next ID (in a real app, you'd use auto-increment)
    const [maxIdResult] = await pool.query('SELECT MAX(id) as maxId FROM users');
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    
    // Insert new user
    await pool.query(
      'INSERT INTO users (id, full_name, email, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [nextId, full_name, email, hashedPassword]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Get user profile
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, phone, address, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// ----- DOCTOR ROUTES -----

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const [doctors] = await pool.query('SELECT * FROM doctors ORDER BY name');
    
    // For each doctor, fetch their reviews
    for (let doctor of doctors) {
      const [reviews] = await pool.query(
        'SELECT * FROM reviews WHERE doctor_id = ?',
        [doctor.id]
      );
      doctor.reviews = reviews;
      
      // Convert available_days from JSON string to array
      try {
        doctor.available_days = JSON.parse(doctor.available_days);
      } catch (e) {
        doctor.available_days = [];
      }
    }
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get single doctor
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const [doctors] = await pool.query(
      'SELECT * FROM doctors WHERE id = ?', 
      [req.params.id]
    );
    
    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const doctor = doctors[0];
    
    // Get reviews for this doctor
    const [reviews] = await pool.query(
      'SELECT r.*, u.full_name as patient_name FROM reviews r JOIN users u ON r.patient_id = u.id WHERE r.doctor_id = ?',
      [doctor.id]
    );
    
    doctor.reviews = reviews;
    
    // Convert available_days from JSON string to array
    try {
      doctor.available_days = JSON.parse(doctor.available_days);
    } catch (e) {
      doctor.available_days = [];
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor details' });
  }
});

// ----- APPOINTMENT ROUTES -----

// Get user appointments
app.get('/appointments/:userId', authenticateToken, async (req, res) => {
  try {
    // Ensure the user can only see their own appointments
    if (parseInt(req.params.userId) !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [appointments] = await pool.query(
      `SELECT a.*, s.name as service,  
      d.id AS doctor_id, d.name AS doctor_name, d.specialization  
FROM appointments a  
JOIN services s ON a.service_id = s.id  
JOIN doctors d ON a.doctor_id = d.id  
WHERE a.patient_id = ?  
ORDER BY a.appointment_date DESC;
`,
      [req.params.userId]
    );
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create new appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { doctor_id, appointment_date, service, notes } = req.body;
    const patient_id = req.user.id;
    
    // Find the service ID based on the service name
    const [services] = await pool.query('SELECT id FROM services WHERE name = ?', [service]);
    
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const service_id = services[0].id;
    
    // Get next ID
    const [maxIdResult] = await pool.query('SELECT MAX(id) as maxId FROM appointments');
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    formattedDate=appointment_date.split("T")[0];
    // Create the appointment
    await pool.query(
      'INSERT INTO appointments (id, patient_id, doctor_id, service_id, appointment_date, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [nextId, patient_id, doctor_id, service_id,formattedDate , notes, 'confirmed']
    );
    
    // Create a notification for the user
    const [maxNotifIdResult] = await pool.query('SELECT MAX(id) as maxId FROM notifications');
    const nextNotifId = (maxNotifIdResult[0].maxId || 0) + 1;
    
    // Get doctor name
    const [doctors] = await pool.query('SELECT name FROM doctors WHERE id = ?', [doctor_id]);
    const doctorName = doctors[0]?.name || 'the doctor';
    
    await pool.query(
      'INSERT INTO notifications (id, message, user_id, is_read, created_at) VALUES (?, ?, ?, FALSE, NOW())',
      [nextNotifId, `Your appointment with ${doctorName} is  confirmed.`, patient_id]
    );
    
    // Return the newly created appointment
    const [newAppointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [nextId]
    );
    
    res.status(201).json(newAppointments[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Cancel appointment
app.put('/appointments/cancel/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Check if the appointment exists and belongs to the authenticated user
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );
    
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appointment = appointments[0];
    
    if (appointment.patient_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update appointment status
    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      ['cancelled', appointmentId]
    );
    
    // Create cancellation record
    const [maxIdResult] = await pool.query('SELECT MAX(id) as maxId FROM cancellations');
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    
    await pool.query(
      'INSERT INTO cancellations (id, appointment_id, reason, cancellation_date, created_at) VALUES (?, ?, ?, NOW(), NOW())',
      [nextId, appointmentId, req.body.reason || 'User cancelled']
    );
    
    // Create notification
    const [maxNotifIdResult] = await pool.query('SELECT MAX(id) as maxId FROM notifications');
    const nextNotifId = (maxNotifIdResult[0].maxId || 0) + 1;
    
    await pool.query(
      'INSERT INTO notifications (id, message, user_id, is_read, created_at) VALUES (?, ?, ?, FALSE, NOW())',
      [nextNotifId, `Your appointment #${appointmentId} has been cancelled.`, req.user.id]
    );
    
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

app.get('/locations', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM locations ORDER BY name');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });
// ----- PROFILE ROUTES -----

// Get user profile
app.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    // Ensure the user can only see their own profile
    console.log( "id" ,req.user.id);
    console.log(req.params.userId);
    if (parseInt(req.params.userId) !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const [users] = await pool.query(
      'SELECT id, full_name, email, phone, address, created_at FROM users WHERE id = ?',
      [req.params.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    console.log( "id" ,req.user.id);
    console.log(req.params.userId);
    // Ensure the user can only update their own profile
    if (parseInt(req.params.userId) !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { full_name, phone, address } = req.body;
    
    await pool.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, req.params.userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ----- SERVICES ROUTES -----

// Get available services
app.get('/api/services', async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// ----- REVIEW ROUTES -----

// Create new review
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { doctor_id, rating, comment } = req.body;
    const patient_id = req.user.id;
    
    // Check if user has had an appointment with this doctor
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = ? AND doctor_id = ? AND status = ?',
      [patient_id, doctor_id, 'confirmed']
    );
    
    if (appointments.length === 0) {
      return res.status(400).json({ error: 'You can only review doctors you have had appointments with' });
    }
    
    // Check if user has already reviewed this doctor
    const [existingReviews] = await pool.query(
      'SELECT * FROM reviews WHERE patient_id = ? AND doctor_id = ?',
      [patient_id, doctor_id]
    );
    
    // Get next ID
    const [maxIdResult] = await pool.query('SELECT MAX(id) as maxId FROM reviews');
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    
    if (existingReviews.length > 0) {
      // Update existing review
      await pool.query(
        'UPDATE reviews SET rating = ?, comment = ? WHERE patient_id = ? AND doctor_id = ?',
        [rating, comment, patient_id, doctor_id]
      );
    } else {
      // Create new review
      await pool.query(
        'INSERT INTO reviews (id, patient_id, doctor_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [nextId, patient_id, doctor_id, rating, comment]
      );
    }
    
    // Return the review
    const [reviews] = await pool.query(
      'SELECT r.*, u.full_name as patient_name FROM reviews r JOIN users u ON r.patient_id = u.id WHERE r.id = ?',
      [nextId]
    );
    
    res.status(201).json(reviews[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});
// Add this to your server.js file
app.get('/api/doctors/:doctorId/reviews', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Query to get all reviews for this doctor along with patient names
    const [reviews] = await pool.query(
      'SELECT r.*, u.full_name as patient_name FROM reviews r ' +
      'JOIN users u ON r.patient_id = u.id ' +
      'WHERE r.doctor_id = ? ' +
      'ORDER BY r.created_at DESC',
      [doctorId]
    );
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});
// ----- NOTIFICATIONS ROUTES -----

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the notification exists and belongs to the authenticated user
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    
    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = notifications[0];
    
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update notification status
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API available at http://localhost:${port}`);
});