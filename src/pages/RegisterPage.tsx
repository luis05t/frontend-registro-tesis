import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import api from "@/api/axios"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Check, AlertCircleIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"

type Career = {
  id: string
  name: string
}

const RegisterPage = () => {
  const navigate = useNavigate()
  
  // Estados del formulario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [careerId, setCareerId] = useState('')
  
  // Estados de interfaz
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estados de errores específicos
  const [errorAlert, setErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState("") // Para dinámicamente cambiar entre "Ya registrado" o "Inválido"
  const [emailError, setEmailError] = useState(false) // Para poner el borde en rojo
  const [validationError, setValidationError] = useState(false)
  const [matchError, setMatchError] = useState(false)
  
  const [careers, setCareers] = useState<Career[]>([])
  
  // Requisitos de seguridad
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  const isPasswordValid = hasMinLength && hasNumber && hasUpperCase && hasLowerCase && hasSymbol;

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get('/api/careers?limit=100')
        setCareers(res.data.data || res.data) 
      } catch (error) {
        console.error('Error al obtener las carreras', error)
      }
    }
    fetchCareers()
  }, [])

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault() 

    // Resetear estados de error antes de intentar
    setEmailError(false);
    setErrorAlert(false);

    if (!isPasswordValid) {
      setValidationError(true);
      setTimeout(() => setValidationError(false), 3000);
      return; 
    }

    if (password !== confirmPassword) {
        setMatchError(true);
        setTimeout(() => setMatchError(false), 3000);
        return;
    }

    if (!careerId) {
      alert("Por favor, selecciona una carrera académica.");
      return;
    }

    setLoading(true) 
    
    try {
      await api.post('/api/auth/register', {
        name,
        email,
        password,
        careerId
      })
      
      navigate("/login")
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "";
      console.error('Error en el registro:', backendMessage);

      // --- LÓGICA DE DETECCIÓN DE ERRORES DE EMAIL ---
      if (backendMessage.includes("ya se encuentra registrado")) {
        setErrorMessage("Este correo ya está registrado.");
        setEmailError(true);
      } 
      else if (backendMessage.includes("no es válido") || backendMessage.includes("no existe")) {
        setErrorMessage("El correo ingresado no existe o es inválido.");
        setEmailError(true);
      } 
      else {
        setErrorMessage("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }

      setErrorAlert(true);
      setLoading(false);
      
      // El alerta se quita solo en 4 segundos, pero el borde rojo se queda hasta que escriba
      setTimeout(() => setErrorAlert(false), 4000);
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean, text: string }) => (
    <div className={`flex items-center space-x-2 text-xs ${met ? "text-green-400 font-medium" : "text-gray-500"}`}>
      {met ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-500" />}
      <span>{text}</span>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <form onSubmit={handleRegister} className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-lg space-y-5 text-gray-100">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          </div>

          {/* NOMBRE */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              required
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              required
              type="email"
              placeholder="usuario@sudamericano.edu.ec"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if(emailError) setEmailError(false); // Quitar rojo al escribir
              }}
              className={`bg-gray-700 text-white placeholder-gray-500 focus:border-cyan-400 ${
                emailError ? "border-red-500 ring-1 ring-red-500" : "border-gray-600"
              }`}
            />
            {emailError && <p className="text-[10px] text-red-500 font-medium ml-1">{errorMessage}</p>}
          </div>

          {/* CARRERA */}
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

          {/* CONTRASEÑA */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-gray-700 border-gray-600 text-white pr-10 focus:border-cyan-400 ${validationError ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-cyan-400"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                required
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-gray-700 border-gray-600 text-white pr-10 focus:border-cyan-400 ${
                    matchError || (confirmPassword && !passwordsMatch) ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-cyan-400"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-3 space-y-1.5 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <PasswordRequirement met={hasMinLength} text="Mín. 6 caracteres" />
                <PasswordRequirement met={hasUpperCase} text="Mayúscula" />
                <PasswordRequirement met={hasLowerCase} text="Minúscula" />
                <PasswordRequirement met={hasNumber} text="Número" />
                <PasswordRequirement met={hasSymbol} text="Símbolo" />
                <PasswordRequirement met={passwordsMatch} text="Coincidencia" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 mt-4" disabled={loading}>
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

      {/* ALERTAS DINÁMICAS */}
      {errorAlert && (
        <Alert className="fixed top-4 right-4 w-auto bg-red-700 text-white border-none shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {validationError && (
        <Alert className="fixed top-4 right-4 w-auto bg-orange-600 text-white border-none shadow-2xl z-[100]">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Seguridad Insuficiente</AlertTitle>
          <AlertDescription>La contraseña no cumple con los requisitos.</AlertDescription>
        </Alert>
      )}

      {matchError && (
        <Alert className="fixed top-4 right-4 w-auto bg-red-600 text-white border-none shadow-2xl z-[100]">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error de Contraseña</AlertTitle>
          <AlertDescription>Las contraseñas no coinciden.</AlertDescription>
        </Alert>
      )}

      <LoadingOverlay isVisible={loading} message="Creando tu cuenta de lector..." />
    </>
  )
}

export default RegisterPage;