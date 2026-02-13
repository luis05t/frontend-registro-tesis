import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";

// 1. VALIDACIÓN ULTRA-ESTRICTA (Misma lógica que el Registro)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@((gmail|outlook|hotmail|yahoo|icloud|live|msn|me|zoho)\.com|(yahoo)\.es|sudamericano\.edu\.ec|.*\.(edu\.ec|gob\.ec|org\.ec|edu|gob|gov))$/i;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email.trim()) {
       setError("El correo es obligatorio.");
       setLoading(false);
       return;
    }

    if (!EMAIL_REGEX.test(email)) {
       setError("Correo incorrecto");
       setLoading(false);
       return;
    }

    try {
      await api.post("/api/auth/forgot-password", { email });
      // TEXTO EXACTO SOLICITADO
      setMessage("Se envió el enlace de recuperación a tu correo");
    } catch (err: any) {
      const backendMsg = err.response?.data?.message || "Ocurrió un error. Intenta de nuevo.";
      // Si el backend dice que no se encuentra, mostramos "Correo incorrecto" o el mensaje del server
      setError(backendMsg.toLowerCase().includes("encontrado") ? "Correo incorrecto" : backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
        
        {/* LÓGICA CONDICIONAL: Si NO hay mensaje, muestra el formulario */}
        {!message ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold text-cyan-400">Recuperar Contraseña</CardTitle>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ingresa tu correo para recibir un enlace de restablecimiento.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative group">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${error ? "text-red-500" : "text-gray-500 group-focus-within:text-cyan-500"}`} />
                    
                    <Input
                      type="email"
                      placeholder="correo@sudamericano.edu.ec"
                      className={`pl-10 bg-gray-900 text-white h-12 text-base transition-all ${
                        error 
                          ? "border-red-500 ring-1 ring-red-500 focus:border-red-500" 
                          : "border-gray-600 focus:border-cyan-500"
                      }`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(""); 
                      }}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 p-3 rounded-md animate-in fade-in duration-300">
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm font-bold">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg font-bold shadow-lg shadow-cyan-900/20 transition-all cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Enlace"
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center text-sm text-gray-400 hover:text-cyan-400 transition-colors font-medium hover:underline"
                  >
                    <ArrowLeft className="mr-2 h- w-4" />
                    Volver al Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          /* 2. VISTA DE ÉXITO: Se quita todo lo anterior y solo sale el mensaje y volver */
          <CardContent className="py-12 text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-green-500/10 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-green-400 text-xl font-bold px-4 leading-tight">
                {message}
              </p>
            </div>
            
            <div className="pt-4">
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center w-full bg-gray-700 hover:bg-gray-600 text-white h-12 rounded-md font-bold transition-all gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver al Login
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}