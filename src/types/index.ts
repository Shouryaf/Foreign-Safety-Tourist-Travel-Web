export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface Train {
  id: string;
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  distance: number;
  available_seats: number;
  total_seats: number;
  fare: number;
  train_type: 'express' | 'superfast' | 'local' | 'rajdhani' | 'shatabdi';
  days_of_operation: string[];
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  train_id: string;
  booking_date: string;
  journey_date: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: 'male' | 'female' | 'other';
  seat_number: string;
  booking_status: 'confirmed' | 'waiting' | 'cancelled';
  fare_paid: number;
  pnr_number: string;
  created_at: string;
  train?: Train;
}

export interface Station {
  id: string;
  station_code: string;
  station_name: string;
  city: string;
  state: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Tourist {
  name: string;
  email: string;
  passportNumber: string;
  registrationTime: number;
  isActive: boolean;
  locationHash: string;
}

export interface SafeZone {
  _id: string;
  name: string;
  coordinates: number[][];
  type: 'safe' | 'restricted';
  createdBy: string;
  createdAt: string;
}

export interface Alert {
  _id: string;
  touristID: string;
  type: 'sos' | 'geofence_breach' | 'anomaly';
  location: {
    lat: number;
    lng: number;
  };
  message: string;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'resolved';
}

export interface Location {
  lat: number;
  lng: number;
}