import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import api from "@/api/axios"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Check} from "lucide-react"
import { Link } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react" 
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"

type Career = {
  id: string
  name: string
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [careerId, setCareerId] = useState('')
  const [errorAlert, setErrorAlert] = useState(false)
  const [careers, setCareers] = useState<Career[]>([])
  const [validationError, setValidationError] = useState(false)
  
  // Requisitos de seguridad para la contraseña
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isPasswordValid = hasMinLength && hasNumber && hasUpperCase && hasLowerCase && hasSymbol;

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get('/api/careers?limit=100')
        // Manejamos la estructura de respuesta de tu API (data.data o data)
        setCareers(res.data.data || res.data) 
      } catch (error) {
        console.error('Error al obtener las carreras', error)
      }
    }
    fetchCareers()
    // Nota: Ya no buscamos roles aquí. El backend asignará 'user' por defecto.
  }, [])

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault() 

    if (!isPasswordValid) {
      setValidationError(true);
      setTimeout(() => setValidationError(false), 3000);
      return; 
    }

    if (!careerId) {
      alert("Por favor, selecciona una carrera académica.");
      return;
    }

    setLoading(true) 
    
    try {
      // CORRECCIÓN: Usamos el endpoint de autenticación pública /api/auth/register
      // NO enviamos roleId, el backend lo asignará automáticamente como lector.
      await api.post('/api/auth/register', {
        name,
        email,
        password,
        careerId
      })
      
      navigate("/login")
    } catch (error: any) {
      console.error('Error en el registro:', error.response?.data || error.message)
      setErrorAlert(true)
      setLoading(false) 
      setTimeout(() => setErrorAlert(false), 3000)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean, text: string }) => (
    <div className={`flex items-center space-x-2 text-xs ${met ? "text-green-400" : "text-gray-500"}`}>
      {met ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-500" />}
      <span>{text}</span>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <form onSubmit={handleRegister} className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-lg space-y-6 text-gray-100">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
            <p className="text-sm text-gray-400">Regístrate para acceder como lector al repositorio.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              required
              placeholder="Ej. Luis Torres"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail Institucional</Label>
            <Input
              required
              type="email"
              placeholder="usuario@sudamericano.edu.ec"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <Label>Carrera Académica</Label>
            <select 
              required
              className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:outline-none text-sm" 
              value={careerId} 
              onChange={(e) => setCareerId(e.target.value)}
            >
              <option value="">Selecciona tu carrera...</option> 
              {careers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative" >
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-gray-700 border-gray-600 text-white pr-10 focus:border-cyan-400 ${validationError ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Indicadores de requisitos de contraseña */}
            <div className="mt-3 space-y-1.5 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
              <PasswordRequirement met={hasMinLength} text="Mínimo 8 caracteres" />
              <PasswordRequirement met={hasUpperCase} text="Una letra mayúscula" />
              <PasswordRequirement met={hasLowerCase} text="Una letra minúscula" />
              <PasswordRequirement met={hasNumber} text="Un número" />
              <PasswordRequirement met={hasSymbol} text="Un símbolo (!@#$%)" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6" disabled={loading}>
            {loading ? "Procesando registro..." : "Registrarse"}
          </Button>
          
          <p className="text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline font-medium">
              Inicia Sesión
            </Link>
          </p>
        </form>
      </div>

      {/* Alertas de error */}
      {errorAlert && (
        <Alert className="fixed top-4 right-4 w-auto bg-red-700 text-white border-none shadow-2xl z-[100]">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error de Registro</AlertTitle>
          <AlertDescription>El correo ya existe o hubo un problema con el servidor.</AlertDescription>
        </Alert>
      )}

      {validationError && (
        <Alert className="fixed top-4 right-4 w-auto bg-orange-600 text-white border-none shadow-2xl z-[100]">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Seguridad Insuficiente</AlertTitle>
          <AlertDescription>La contraseña no cumple con los requisitos mínimos.</AlertDescription>
        </Alert>
      )}

      <LoadingOverlay isVisible={loading} message="Creando tu cuenta de lector..." />
    </>
  )
}

export default RegisterPage;