import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const [user, setUser] = useState(null);
  const { userId: paramUserId } = useParams();
  const [userId, setUserId] = useState(paramUserId || localStorage.getItem("userId"));
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone: "", address: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/profile/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        });
        if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setUser(data);
        setFormData({ full_name: data.full_name || "", phone: data.phone || "", address: data.address || "" });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/appointments/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        });
        if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [userId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await fetch(`http://localhost:5000/appointments/cancel/${appointmentId}`, {
        method: "PUT",
      });
      toast.success("Appointment cancelled successfully");
      setAppointments(appointments.filter((appt) => appt.id !== appointmentId));
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 style={{ color: "#0752e8", fontSize: "30px", fontWeight: "bold", marginBottom: "16px" }}>User Profile</h1>
      {user && (
        <div className="bg-gray-100 p-4 rounded-md shadow-md mb-6">
          {editing ? (
            <form onSubmit={handleSubmit}>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="block w-full p-2 mb-2 border rounded" />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="block w-full p-2 mb-2 border rounded" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="block w-full p-2 mb-2 border rounded" />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="ml-2 text-gray-600">Cancel</button>
            </form>
          ) : (
            <div style={{ color: "#34495e", fontSize: "20px"}}>
              <p><strong>Name:</strong> {user.full_name}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Address:</strong> {user.address}</p>
              <button onClick={() => setEditing(true)} className="bg-gray-600 text-white px-4 py-2 rounded mt-2">Edit</button>
            </div>
          )}
        </div>
      )}
      <h2 style={{ color: "#0752e8", fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>Appointments</h2>
      {appointments.length > 0 ? (
        <ul className="bg-gray-100 p-4 rounded-md shadow-md">
          {appointments.map((appointment) => (
            <li style={{ color: "#34495e", fontSize: "20px"}} key={appointment.id} className="border-b py-2">
              <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
              <p><strong>Specialization:</strong> {appointment.specialization}</p>
              <p><strong>Date:</strong> {appointment.appointment_date}</p>
              <p><strong>Status:</strong> {appointment.status}</p>
              {appointment.status !== "cancelled" && (
                <button onClick={() => handleCancelAppointment(appointment.id)} className="bg-red-500 text-white px-4 py-2 rounded mt-2">Cancel</button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
};

export default Profile;
