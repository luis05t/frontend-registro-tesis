import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import axios from "axios"
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

type Role = {
  id: string,
  name: string
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<Role[]>([])
  const [careerId, setCareerId] = useState('')
  const [errorAlert, setErrorAlert] = useState(false)
  const [careers, setCareers] = useState<Career[]>([])
  const [validationError, setValidationError] = useState(false)
  
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isPasswordValid = hasMinLength && hasNumber && hasUpperCase && hasLowerCase && hasSymbol;

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/careers')
        setCareers(res.data.data)
      } catch (error) {
        console.log('Error al obtener las carreras', error)
      }
    }
    fetchCareers()

    const fetchRole = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/roles')
        setRole(res.data.data)
      } catch (error) {
        console.log('Error al obtener roles')
      }
    }
    fetchRole()
  }, [])

  const roleId = role
    ? role.find(r => r.name === 'TEACHER')?.id
    : "";

  // MODIFICADO: Recibe el evento para prevenir recarga
  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault() // <--- IMPORTANTE: Previene que la página se recargue al dar Enter

    if (!isPasswordValid) {
      setValidationError(true);
      setTimeout(() => setValidationError(false), 3000);
      return; 
    }

    setLoading(true) 
    
    try {
      const res = await axios.post('http://localhost:8000/api/users', {
        name,
        email,
        roleId,
        password,
        careerId
      })
      console.log('Usuario registrado', res.data)
      
      // Navegamos inmediatamente al Login
      navigate("/login")

    } catch (error) {
      console.log('Error al intentar crear el usuario')
      setErrorAlert(true)
      setLoading(false) 
      setTimeout(() => {
        setErrorAlert(false)
      }, 3000)
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
        {/* MODIFICADO: Cambié el div principal por form y agregué onSubmit */}
        <form onSubmit={handleRegister} className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-lg space-y-6 text-gray-100">
          <h1 className="text-xl font-semibold text-center text-white">Registrarse</h1>
          <Label htmlFor="name">Nombre</Label>
          <Input
            required={true}
            placeholder="Nombres"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400"
          />

          <Label htmlFor="email">E-mail</Label>
          <Input
            required={true}
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400"
          />
          <Label>Carrera</Label>
          <select className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:ring-cyan-400" value={careerId} onChange={(e) => setCareerId(e.target.value)}>
            <option value="">ㅤㅤ</option>
            {careers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative py-4" >
              <Input
                required={true}
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`placeholder-gray-400 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400 ${validationError ? "border-red-500 focus:border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 space-y-1 bg-gray-900/50 p-3 rounded-md border border-gray-700">
              <p className="text-xs text-gray-400 font-semibold mb-2">La contraseña debe contener:</p>
              <PasswordRequirement met={hasMinLength} text="Mínimo 8 caracteres" />
              <PasswordRequirement met={hasUpperCase} text="Una letra mayúscula" />
              <PasswordRequirement met={hasLowerCase} text="Una letra minúscula" />
              <PasswordRequirement met={hasNumber} text="Un número" />
              <PasswordRequirement met={hasSymbol} text="Un símbolo (!@#$%)" />
            </div>
          </div>

          <Button
            type="submit" // MODIFICADO: Agregado type="submit" para que el Enter funcione
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white "
            disabled={loading}
            // Quitamos onClick={handleRegister} porque el form onSubmit ya lo maneja
          >
            {loading ? "Cargando..." : "Registrarse"}
          </Button>
          <p className="text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </form>
      </div>

      {errorAlert && (
        <Alert className="fixed top-4 right-4 w-auto bg-red-700 text-white border-red-800 z-[10000]">
          <AlertCircleIcon />
          <AlertTitle>Error al crear usuario</AlertTitle>
          <AlertDescription>
            Ha ocurrido un error en el servidor, intente nuevamente.
          </AlertDescription>
        </Alert>
      )}
      {validationError && (
        <Alert className="fixed top-4 right-4 w-auto bg-orange-600 text-white border-orange-700 z-[10000]">
          <AlertCircleIcon />
          <AlertTitle>Contraseña Débil</AlertTitle>
          <AlertDescription>
            Por favor cumple con todos los requisitos de la contraseña.
          </AlertDescription>
        </Alert>
      )}

      <LoadingOverlay isVisible={loading} message="Creando tu cuenta..." />
    </>
  )
}

export default RegisterPage