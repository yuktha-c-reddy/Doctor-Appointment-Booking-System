import React from 'react'
import { Appointment } from '../types'
import { format } from 'date-fns'
import { Calendar, Clock, X, Check } from 'lucide-react'

const Appointments = () => {
  const [appointments, setAppointments] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const userId = 'your_patient_id' // Replace with actual patient ID from auth system
  
      const response = await fetch(`http://localhost:5000/appointments/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch')
  
      const data = await response.json()
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }
  

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
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Found</h2>
          <p className="text-gray-500">You haven't booked any appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{appointment.doctors.name}</h3>
                  <p className="text-gray-600">{appointment.doctors.specialization}</p>
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
                <p className="text-gray-600">{appointment.service}</p>
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

export default Appointments