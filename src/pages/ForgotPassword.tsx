import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

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
      setMessage("Si el correo existe, recibirás un enlace de recuperación.");
    } catch (err) {
      setError("No se pudo procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-gray-400">
            Ingresa tu correo institucional para recibir un enlace de restablecimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input 
                    type="email" 
                    placeholder="correo@sudamericano.edu.ec" 
                    className="pl-10 bg-gray-900 border-gray-600 text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Enlace"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            </div>
          )}
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-cyan-500 hover:text-cyan-400 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Volver al Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}