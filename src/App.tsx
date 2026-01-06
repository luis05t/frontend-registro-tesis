import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import UserProfile from './pages/UserProfile'
import RegisterPage from './pages/RegisterPage'
import Dashboad from './pages/Dashboard'
import ProyectPage from './pages/ProyectPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage/>} /> 
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboad  />} />
      
      {/* RUTA DINÁMICA: IMPORTANTE */}
      <Route path="/projects" element={<ProyectPage  />} />
      <Route path="/projects/:id" element={<ProyectPage  />} />
    </Routes>
  )
}
export default App