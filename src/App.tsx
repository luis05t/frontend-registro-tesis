import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import UserProfile from './pages/UserProfile'
import RegisterPage from './pages/RegisterPage'
import Dashboad from './pages/Dashboard'
import ProyectPage from './pages/ProyectPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage/>} /> 
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboad  />} />
      
      <Route path="/projects" element={<ProyectPage  />} />
      <Route path="/projects/:id" element={<ProyectPage  />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  )
}

export default App