export const Doctor = {
    id: "",
    name: "",
    specialization: "",
    image_url: "",
    location: "",
    available_days: [],
    created_at: ""
  };
  
  export const Appointment = {
    id: "",
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    status: "pending", // possible values: 'pending', 'confirmed', 'cancelled'
    created_at: "",
    service: "",
    notes: ""
  };
  
  export const User = {
    id: "",
    email: "",
    full_name: "",
    phone: "",
    created_at: ""
  };
  