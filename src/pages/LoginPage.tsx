import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useNavigate, Link } from "react-router-dom"
// CAMBIO 1: Importamos nuestra instancia 'api' en lugar de 'axios'
import api from "@/api/axios" 
import { useAuthStore } from "@/store/authStore"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"

const LoginPage = () => {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setEmailError("")
    setPasswordError("")
    setGeneralError("")
    
    let hasLocalError = false;
    if (!email.trim()) {
        setEmailError("El correo es obligatorio");
        hasLocalError = true;
    } else if (!email.includes("@")) {
        setEmailError("Correo incorrecto");
        hasLocalError = true;
    }

    if (!password.trim()) {
        setPasswordError("La contraseña es obligatoria");
        hasLocalError = true;
    }

    if (hasLocalError) return; 

    setLoading(true)
    
    try {
      // CAMBIO 2: Usamos 'api.post' y quitamos 'http://localhost:8000'
      const res = await api.post("/api/auth/login", { email, password })
      const { accessToken, userId, userRole } = res.data

      localStorage.setItem("token", accessToken)
      localStorage.setItem("id", userId)
      localStorage.setItem("role", userRole)
      login(accessToken, userId, userRole)
      
      navigate("/dashboard")
      
    } catch (err: any) {
      console.log(err)
      let messages: string[] = [];
      
      if (err.response && err.response.data && err.response.data.message) {
        const rawMsg = err.response.data.message;
        messages = Array.isArray(rawMsg) ? rawMsg : [rawMsg];
      } else {
        messages = ["Error de conexión"];
      }

      let newEmailError = "";
      let newPasswordError = "";
      let newGeneralError = "";

      messages.forEach(msg => {
          const m = msg.toLowerCase();
          if (m.includes("correo")) {
              newEmailError = msg;
          } else if (m.includes("contraseña")) {
              newPasswordError = msg;
          } else {
              newGeneralError = msg;
          }
      });

      if (newEmailError) setEmailError(newEmailError);
      if (newPasswordError) setPasswordError(newPasswordError);
      if (newGeneralError) setGeneralError(newGeneralError);
      
      setLoading(false) 
    } 
  }, [email, password, login, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-lg space-y-6 text-gray-100">
        <h1 className="text-2xl font-bold text-center text-white ">Iniciar Sesión</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-gray-300 py-3">Email</Label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`bg-gray-700 text-white placeholder-gray-400 focus:ring-cyan-400 ${
                  emailError ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-cyan-400"
              }`}
            />
            {emailError && (
                <div className="flex items-center gap-1 mt-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={14} />
                    <span>{emailError}</span>
                </div>
            )}
          </div>

          <div>
            <Label className="text-gray-300 py-3">Contraseña</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`placeholder-gray-400 focus:ring-cyan-400 ${
                    passwordError ? "border-red-500 focus:border-red-500" : "border-gray-600 focus:border-cyan-400"
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
            {passwordError && (
                <div className="flex items-center gap-1 mt-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={14} />
                    <span>{passwordError}</span>
                </div>
            )}
          </div>

          <Button
            type="submit" 
            disabled={loading} 
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white mt-4"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
        </form>
        
        {generalError && (
             <p className="text-red-400 text-sm text-center mt-2 border border-red-900/50 bg-red-900/20 p-2 rounded">
               {generalError}
             </p>
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

export default LoginPage