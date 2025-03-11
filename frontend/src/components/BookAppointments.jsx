import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, startOfToday } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: 'user-id-placeholder', // Replace with actual user ID logic
          doctor_id: doctorId,
          appointment_date: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
          service,
          notes
        })
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to book appointment');
  
      toast.success('Appointment booked successfully!');
      navigate('/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };
  

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  if (!doctor) {
    return <div className="text-center py-12">Doctor not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img src={doctor.image_url || `https://source.unsplash.com/random/400x300?doctor&sig=${doctor.id}`} 
                 alt={doctor.name} className="w-full h-full object-cover" />
          </div>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
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
  );
};

export default BookAppointment;
