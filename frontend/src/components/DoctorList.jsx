import React from 'react'
import { Link } from 'react-router-dom'
import { Doctor } from '../types'
import { MapPin, Star, Search } from 'lucide-react'

const DoctorList = () => {
  const [doctors, setDoctors] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedSpecialization, setSelectedSpecialization] = React.useState('')

  React.useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/doctors') // Your API endpoint
        const data = await response.json()
        setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const specializations = React.useMemo(() => {
    const specs = new Set(doctors.map(doctor => doctor.specialization))
    return Array.from(specs).sort()
  }, [doctors])

  const filteredDoctors = React.useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization
      
      return matchesSearch && matchesSpecialization
    })
  }, [doctors, searchTerm, selectedSpecialization])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, specialization, or location..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={doctor.image_url || `https://source.unsplash.com/random/400x300?doctor&sig=${doctor.id}`}
              alt={doctor.name}
              className="w-full h-48 object-cover"
            />
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{doctor.name}</h2>
              <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{doctor.location}</span>
              </div>

              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
                <span className="text-gray-600 ml-2">
                  ({doctor.reviews?.length || 0} reviews)
                </span>
              </div>

              <Link
                to={`/book/${doctor.id}`}
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h2>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}

export default DoctorList