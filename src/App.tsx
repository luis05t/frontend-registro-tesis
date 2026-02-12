import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import UserProfile from './pages/UserProfile'
import RegisterPage from './pages/RegisterPage'
import Dashboad from './pages/Dashboard'
import ProyectPage from './pages/ProyectPage'

// 1. Asegúrate de que los nombres de importación coincidan con el uso abajo
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
      
      {/* 2. Usa los nombres exactos que importaste arriba */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* RUTA DINÁMICA */}
      <Route path="/projects" element={<ProyectPage  />} />
      <Route path="/projects/:id" element={<ProyectPage  />} />

      {/* RUTA PARA MANEJAR ERRORES 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
export default App