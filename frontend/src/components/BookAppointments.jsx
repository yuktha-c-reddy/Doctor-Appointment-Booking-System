import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, startOfToday } from 'date-fns';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { body } from 'express-validator';

const DoctorBookingAndReview = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  // User authentication state
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  
  // Doctor and booking states
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!token) {
      toast.error('Your session has expired. Please login again.');
      navigate('/auth/login');
      return;
    }
    
    if (doctorId) {
      fetchDoctor();
      fetchReviews();
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch doctor');
      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch reviews');
      
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const services = [
    'General Consultation',
    'Follow-up Visit',
    'Specialist Consultation',
    'Medical Check-up',
    'Emergency Care'
  ];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: userId, 
          doctor_id: doctorId,
          appointment_date: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
          service,
          notes
        })
      });
      console.log(body)
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to book appointment');
  
      toast.success('Appointment booked successfully!');
      // Reset form after successful booking
      setSelectedDate('');
      setSelectedTime('');
      setService('');
      setNotes('');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      
      toast.success('Review submitted successfully');
      setNewReview({ rating: 5, comment: '' });
      setReviewSubmitted(true);
      fetchReviews(); // Refresh reviews list
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  if (!doctor) {
    return <div className="text-center py-12">Doctor not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-8">
      {/* Doctor Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
            <p className="text-blue-600 font-medium mb-4">{doctor.specialization}</p>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{doctor.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>Available on: {doctor.available_days?.join(', ') || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="mb-8">
        <form onSubmit={handleBookingSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Book Appointment</h2>
          <div className="space-y-6">
            <label className="block text-sm font-medium">Select Date</label>
            <input type="date" className="w-full px-4 py-2 border rounded-lg" 
                   value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                   min={format(startOfToday(), 'yyyy-MM-dd')} max={format(addDays(new Date(), 30), 'yyyy-MM-dd')} required />
            
            <label className="block text-sm font-medium">Select Time</label>
            <select className="w-full px-4 py-2 border rounded-lg" value={selectedTime} 
                    onChange={(e) => setSelectedTime(e.target.value)} required>
              <option value="">Choose a time</option>
              {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
            </select>
            
            <label className="block text-sm font-medium">Service</label>
            <select className="w-full px-4 py-2 border rounded-lg" value={service} 
                    onChange={(e) => setService(e.target.value)} required>
              <option value="">Select a service</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <label className="block text-sm font-medium">Notes (Optional)</label>
            <textarea className="w-full px-4 py-2 border rounded-lg" rows={4} value={notes} 
                      onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements or conditions..." />
            
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg" 
                    disabled={submitting}>{submitting ? 'Booking...' : 'Book Appointment'}</button>
          </div>
        </form>
      </div>
      
      {/* Reviews Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
          
          {/* Existing Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-4 mb-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-gray-600 text-sm">
                      by {review.patient_name}
                    </span>
                  </div>
                  <p className="text-gray-800">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mb-4">No reviews yet. Be the first to leave a review!</p>
          )}
          
          {/* Submit Review Form */}
          {!reviewSubmitted ? (
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Leave a Review</h3>
              <div className="mb-4">
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${
                        star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    />
                  ))}
                </div>
              </div>
              <textarea
                className="w-full px-3 py-2 border rounded-lg mb-3"
                rows="3"
                placeholder="Share your experience with this doctor..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                disabled={submittingReview || !newReview.comment.trim()}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg text-green-700">
              <p>Thank you for your review!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorBookingAndReview;