import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import About from './pages/About'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Gallery from './pages/Gallery'
import Location from './pages/Location'
import Contact from './pages/Contact'
import BookingConfirmation from './pages/BookingConfirmation'

import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminBookings from './admin/AdminBookings'
import AdminBlockedDates from './admin/AdminBlockedDates'
import AdminPricing from './admin/AdminPricing'
import ProtectedRoute from './admin/ProtectedRoute'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/rooms" element={<PublicLayout><Rooms /></PublicLayout>} />
      <Route path="/rooms/:id" element={<PublicLayout><RoomDetail /></PublicLayout>} />
      <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
      <Route path="/location" element={<PublicLayout><Location /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      {/* <Route path="/booking-confirmation" element={<PublicLayout><BookingConfirmation /></PublicLayout>} /> */}

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="blocked-dates" element={<AdminBlockedDates />} />
        <Route path="pricing" element={<AdminPricing />} />
      </Route>
    </Routes>
  )
}
