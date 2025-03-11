import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Appointments from './components/Appointment'
import DoctorList from './components/DoctorList'
import BookAppointment from './components/BookAppointments'
import Profile from './components/Profile'
import Auth from './components/Auth'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/book/:doctorId" element={<BookAppointment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  )
}

export default App