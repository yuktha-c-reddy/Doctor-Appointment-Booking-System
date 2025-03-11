import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, User, LogOut } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            MedBook
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/doctors" className="text-gray-600 hover:text-gray-800">
              Find Doctors
            </Link>
            {user ? (
              <>
                <Link
                  to="/appointments"
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <Calendar className="w-5 h-5 mr-1" />
                  Appointments
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <User className="w-5 h-5 mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
