import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { format } from 'date-fns'
import { Calendar, Clock, X, RefreshCw } from 'lucide-react'

const Appointments = () => {
  const { userId: paramUserId } = useParams();
  const [userId, setUserId] = useState(paramUserId || localStorage.getItem("userId"));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId, showCancelled]); // Refetch when showCancelled changes

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

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const res = await fetch(`http://localhost:5000/appointments/cancel/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (!res.ok) {
        throw new Error(`Failed to cancel appointment: ${res.status} ${res.statusText}`);
      }

      // Refresh appointments after cancellation
      fetchAppointments();
      setCancelling(null);
      setCancelReason("");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
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

  const filteredAppointments = showCancelled 
    ? appointments.filter(app => app.status === 'cancelled')
    : appointments.filter(app => app.status !== 'cancelled');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#0752e8", fontSize: "30px"}}>
          {showCancelled ? "Cancelled Appointments" : "My Appointments"}
        </h1>
        <button 
          onClick={() => setShowCancelled(!showCancelled)}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          {showCancelled ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              View Active Appointments
            </>
          ) : (
            <>
              <X className="w-4 h-4 mr-2" />
              View Cancelled Appointments
            </>
          )}
        </button>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {showCancelled ? "No Cancelled Appointments" : "No Appointments Found"}
          </h2>
          <p className="text-gray-500">
            {showCancelled 
              ? "You don't have any cancelled appointments." 
              : "You haven't booked any appointments yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
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

              {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                <div className="mt-4 pt-4 border-t">
                  {cancelling === appointment.id ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Cancel this appointment?</h4>
                      <textarea 
                        placeholder="Reason for cancellation (optional)"
                        className="w-full p-2 border rounded-lg text-sm"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows="2"
                      />
                      <div className="flex space-x-2">
                        <button style={{backgroundColor:"red",color:"white"}}
                          className="px-4 py-1 bg-red-600 text-white rounded-lg text-sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Confirm Cancel
                        </button>
                        <button style={{ backgroundColor:"blue",color:"white",marginLeft:"5px"}}
                          className="px-4 py-1 bg-gray-200 text-gray-800 rounded-lg text-sm"
                          onClick={() => setCancelling(null)}
                        >
                          Keep Appointment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button style={{backgroundColor:"red",color:"white"}}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      onClick={() => setCancelling(appointment.id)}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Appointments;