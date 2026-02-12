import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams(); // Obtenemos el token de la URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    // Validación de seguridad simple
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,15}$/;
    if(!regex.test(password)){
        setError("La contraseña debe tener Mayúscula, minúscula, número y símbolo.");
        return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      alert("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "El enlace ha expirado o es inválido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">Nueva Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Nueva contraseña" 
                  className="pl-10 pr-10 bg-gray-900 border-gray-600 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input 
                  type="password" 
                  placeholder="Confirmar contraseña" 
                  className="pl-10 bg-gray-900 border-gray-600 text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cambiar Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}