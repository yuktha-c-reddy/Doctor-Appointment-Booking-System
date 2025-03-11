import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Star } from 'lucide-react'

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl text-white">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Health, Your Schedule
          </h1>
          <p className="text-xl mb-8">
            Book appointments with top doctors in your area instantly
          </p>
          <Link
            to="/doctors"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Find a Doctor
          </Link>
        </div>
      </section>

      {/* Features */}
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

      {/* Featured Doctors Preview */}
      <section className="bg-white rounded-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Doctors</h2>
          <Link to="/doctors" className="text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <img
                src={`https://source.unsplash.com/random/400x300?doctor&sig=${i}`}
                alt="Doctor"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg">Dr. Sarah Johnson</h3>
              <p className="text-gray-600 mb-2">Cardiologist</p>
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <span className="text-gray-600 ml-2">(120 reviews)</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home