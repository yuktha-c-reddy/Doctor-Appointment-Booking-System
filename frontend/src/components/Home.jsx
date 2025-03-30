import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star, Bell, FileText } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000'; // Adjust this to your backend URL

const Home = () => {
  const [notifications, setNotifications] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [cancellations, setCancellations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      // Fetch user profile
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
        
        // Fetch notifications
        const notificationsResponse = await fetch(`${API_URL}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData);
        }
        
        // Fetch services
        const servicesResponse = await fetch(`${API_URL}/api/services`);
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData);
        }
        
        // Fetch appointments (to replace invoices in the UI)
        const appointmentsResponse = await fetch(`${API_URL}/appointments/${userData.user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          // Convert appointments to invoice-like format for UI
          const invoicesData = appointmentsData.map(appointment => ({
            id: appointment.id,
            status: appointment.status,
            amount: 50.00, // Since there's no invoice table in your backend, using a placeholder
            created_at: appointment.created_at,
            appointment: appointment
          }));
          setInvoices(invoicesData);
        }
        
        // For locations, doctors, and reviews, fetch from appropriate endpoints
        // Since your backend doesn't have a locations endpoint, using doctors for now
        const doctorsResponse = await fetch(`${API_URL}/api/doctors`);
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          
          // Use doctor's office locations as general locations
          const locationsData = doctorsData.map(doctor => ({
            id: doctor.id,
            name: `${doctor.name}'s Care`,
            address: doctor.location,
            country: "India"
          }));
          
          setLocations(locationsData);
          
          // Extract reviews from doctors data
          const userReviews = [];
          doctorsData.forEach(doctor => {
            if (doctor.reviews) {
              doctor.reviews.forEach(review => {
                if (review.patient_id === userData.user.id) {
                  userReviews.push({
                    ...review,
                    doctors: doctor
                  });
                }
              });
            }
          });
          
          setReviews(userReviews);
        }
      } else {
        // If user fetch fails, clear token
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" >
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl " style={{ textShadow: "-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white", color: "blue" ,backgroundImage: "url('https://img.theweek.in/content/dam/week/week/magazine/theweek/cover/images/2024/12/8/49-The-accident-and-emergency-team.jpg')" }}>
        <div className="max-w-3xl mx-auto px-4">
        <p className="text-xl mb-8 text-white" >
            Book appointments with top doctors in your area instantly
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Health, Your Schedule
          </h1>
          
          <Link
            to="/auth"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started!
          </Link>
        </div>
      </section>
      <br/><br/>
      <section className="grid md:grid-cols-3 gap-8">
     
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Calendar className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
          <p className="text-gray-600">
            Book appointments 24/7 at your convenience
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Clock className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Instant Confirmation</h3>
          <p className="text-gray-600">
            Get immediate confirmation for your bookings
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <MapPin className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Multiple Locations</h3>
          <p className="text-gray-600">
            Find doctors across different locations
          </p>
        </div>
      </section>
<br/><br/>
      {user ? (
        <>
          {/* User Dashboard */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Notifications */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Notifications
                </h2>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg ${
                        notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                      }`}
                    >
                      <p className="text-gray-800">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(notification.created_at), 'PPp')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No new notifications</p>
              )}
            </section>

            {/* Recent Appointments/Invoices */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Appointments
                </h2>
                <Link to="/appointments" className="text-blue-600 hover:text-blue-800 text-sm">
                  View All
                </Link>
              </div>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-3 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">#{invoice.id}</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          invoice.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        Doctor: {invoice.appointment?.doctor_name || "N/A"}
                      </p>
                      <p className="text-gray-600 mt-1">
                        Service: {invoice.appointment?.service || "Check-up"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {invoice.appointment?.appointment_date ? 
                          format(new Date(invoice.appointment.appointment_date), 'PP') : 
                          format(new Date(invoice.created_at), 'PP')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No appointments found</p>
              )}
            </section>
          </div>

          {/* Reviews and Services */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Your Reviews */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Your Reviews
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <h3 className="font-medium">{review.doctors.name}</h3>
                        <br/>
                        <div className="ml-auto flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {format(new Date(review.created_at), 'PP')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </section>

            {/* Available Services */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Available Services</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                    <span className="font-medium">Rs. {service.price || "N/A"}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Locations */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Our Locations
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {locations.map((location) => (
                <div key={location.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{location.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{location.address}</p>
                  <p className="text-gray-600 text-sm"> {location.country}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Features for non-authenticated users */}


          {/* Featured Doctors Preview */}
          
        </>
      )}
    </div>
  );
};

export default Home;