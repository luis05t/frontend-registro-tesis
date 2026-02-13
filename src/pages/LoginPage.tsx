import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useNavigate, Link } from "react-router-dom"
import api from "@/api/axios" 
import { useAuthStore } from "@/store/authStore"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"

// 1. REGEX ESTRICTA (Mantenida para bloquear gml.com, mail.com, etc.)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@((gmail|outlook|hotmail|yahoo|icloud|live|msn|me|zoho)\.com|(yahoo)\.es|sudamericano\.edu\.ec|.*\.(edu\.ec|gob\.ec|org\.ec|edu|gob|gov))$/i;

const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Estados de error independientes (Solo aparecerán debajo de los inputs)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Limpiar errores previos
    setEmailError("")
    setPasswordError("")
    setGeneralError("")
    
    // 2. VALIDACIONES LOCALES
    if (!email.trim()) {
        setEmailError("El correo es obligatorio");
        return;
    } 
    
    // Si el formato está mal (ej: gml.com), sale abajo del correo
    if (!EMAIL_REGEX.test(email)) {
        setEmailError("correo incorrecto");
        return;
    }

    if (!password.trim()) {
        setPasswordError("La contraseña es obligatoria");
        return;
    }

    setLoading(true)
    
    try {
      const res = await api.post("/api/auth/login", { email, password })
      const { accessToken, userId, userRole } = res.data

      localStorage.setItem("token", accessToken)
      localStorage.setItem("id", userId)
      localStorage.setItem("role", userRole)
      login(accessToken, userId, userRole)
      
      navigate("/dashboard")
      
    } catch (err: any) {
      console.log(err)
      let backendMsg = "";
      
      if (err.response && err.response.data && err.response.data.message) {
        const rawMsg = err.response.data.message;
        backendMsg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg;
      } else {
        backendMsg = "Error de conexión";
      }

      const lowerMsg = backendMsg.toLowerCase();

      // 3. CLASIFICACIÓN DE ERRORES (Solo se muestran debajo del input respectivo)
      if (lowerMsg.includes("no registrado")) {
          setEmailError("correo no registrado"); // SALE AQUÍ DEBAJO
      } 
      else if (lowerMsg.includes("contraseña incorrecta") || lowerMsg.includes("password") || lowerMsg.includes("credential")) {
          setPasswordError("contraseña incorrecta"); // SALE AQUÍ DEBAJO
      } 
      else {
          setGeneralError(backendMsg);
      }
      
      setLoading(false) 
    } 
  }, [email, password, login, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-lg space-y-6 text-gray-100">
        <h1 className="text-2xl font-bold text-center text-white ">Iniciar Sesión</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* EMAIL */}
          <div>
            <Label className="text-gray-300 py-3">Email</Label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(""); // Limpiar al escribir
              }}
              disabled={loading}
              // Borde ROJO si hay error
              className={`bg-gray-700 text-white placeholder-gray-400 focus:ring-cyan-400 ${
                  emailError ? "border-red-500 focus:border-red-500 ring-1 ring-red-500" : "border-gray-600 focus:border-cyan-400"
              }`}
            />
            {/* MENSAJE DEBAJO DEL CORREO */}
            {emailError && (
                <p className="mt-1 text-red-500 font-bold text-[11px] ml-1 animate-in fade-in">
                  {emailError}
                </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <Label className="text-gray-300 py-3">Contraseña</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(""); // Limpiar al escribir
                }}
                className={`placeholder-gray-400 focus:ring-cyan-400 ${
                    passwordError ? "border-red-500 focus:border-red-500 ring-1 ring-red-500" : "border-gray-600 focus:border-cyan-400"
                }`}
              />
              
              <button
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* MENSAJE DEBAJO DE LA CONTRASEÑA */}
            {passwordError && (
                <p className="mt-1 text-red-500 font-bold text-[11px] ml-1 animate-in fade-in">
                  {passwordError}
                </p>
            )}
          </div>

          <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-xs text-cyan-500 hover:text-cyan-400 hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit" 
            disabled={loading} 
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white mt-4"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
        </form>
        
        {/* Error General (Solo si no es de correo o clave) */}
        {generalError && (
             <div className="flex items-center gap-2 bg-red-900/20 border border-red-900/50 p-3 rounded mt-2">
               <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
               <p className="text-red-400 text-xs font-medium">{generalError}</p>
             </div>
        )}

        <p className="text-center text-sm text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Regístrate
          </Link>
        </p>

      </div>
      <LoadingOverlay isVisible={loading} message="Iniciando sesión..." />
    </div>
  )
}

export default LoginPage;