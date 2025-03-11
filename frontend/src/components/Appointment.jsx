import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

const Appointments = () => {
  const { userId: paramUserId } = useParams();
  const [userId, setUserId] = useState(paramUserId || localStorage.getItem("userId"));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]); // Fetch appointments only when userId is available

  const fetchAppointments = async () => {
    if (!userId) return; // Prevent unnecessary API calls if userId is missing

    try {
      setLoading(true); // Start loading

      const res = await fetch(`http://localhost:5000/appointments/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Include auth token
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch appointments: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#0752e8", fontSize: "30px"}}>My Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Found</h2>
          <p className="text-gray-500">You haven't booked any appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow p-6" style={{ color: "#34495e", fontSize: "20px"}}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{appointment.doctor_name || "Unknown Doctor"}</h3>
                  <p className="text-gray-600">{appointment.specialization || "Specialization not available"}</p>
                  <p className="text-gray-600 flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(new Date(appointment.appointment_date), 'PPP p')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Service</h4>
                <p className="text-gray-600">{appointment.service || "Not specified"}</p>
                {appointment.notes && (
                  <>
                    <h4 className="font-medium mb-2 mt-4">Notes</h4>
                    <p className="text-gray-600">{appointment.notes}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Appointments;
