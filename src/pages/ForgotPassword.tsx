import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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

    try {
      await api.post("/api/auth/forgot-password", { email });
      setMessage("Se ha enviado un enlace de recuperación a tu correo.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          <p className="text-gray-400 text-sm leading-relaxed">
            Ingresa tu correo para recibir un enlace de restablecimiento.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                {/* Ícono de Correo Perfectamente Centrado */}
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
                
                <Input
                  type="email"
                  placeholder="correo@sudamericano.edu.ec"
                  className="pl-10 bg-gray-900 border-gray-600 text-white focus:border-cyan-500 h-12 text-base transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mensajes de éxito o error */}
            {message && (
              <div className="flex items-center gap-2 bg-green-900/30 border border-green-800 p-3 rounded-md animate-in fade-in duration-300">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 p-3 rounded-md animate-in fade-in duration-300">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-lg font-bold shadow-lg shadow-cyan-900/20 transition-all"
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
                className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}