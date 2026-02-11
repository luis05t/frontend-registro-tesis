export type User = {
  id: string;       // Agregado: El ID es fundamental para identificar al usuario
  name: string;
  email: string;
  careerId: string; // Corregido: Antes decía 'careedId', debe ser 'careerId' para coincidir con el backend
  image?: string;
  
  role?: {
    id: string;
    name: string;
  };
}