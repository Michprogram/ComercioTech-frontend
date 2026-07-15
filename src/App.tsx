import { useEffect, useState } from 'react';
import './App.css';

// 1. Le enseñamos a TypeScript qué estructura tiene un Cliente
interface Cliente {
  _id: string;
  rut: string;
  nombre: string;
  username: string;
  region: string;
  comuna: string;
}

function App() {
  // 2. Creamos una variable de estado para guardar los clientes (inicia como un arreglo vacío)
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // 3. useEffect hace que este código se ejecute SOLO UNA VEZ cuando la página carga
  useEffect(() => {
    fetch('https://comerciotech-backend.onrender.com/api/clientes')
      //fetch('http://localhost:3000/api/clientes')
      .then(respuesta => respuesta.json()) // Convertimos la respuesta cruda a JSON
      .then(datos => {
        console.log("Datos recibidos del backend:", datos);
        setClientes(datos); // Guardamos los datos en nuestra variable de estado
      })
      .catch(error => console.error("Error de conexión:", error));
  }, []);

  // 4. Lo que el usuario verá en la pantalla
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Panel de Clientes - ComercioTech</h1>

      {clientes.length === 0 ? (
        <p>Cargando clientes desde la nube...</p>
      ) : (
        <ul>
          {clientes.map(cliente => (
            <li key={cliente._id} style={{ marginBottom: '10px' }}>
              <strong>{cliente.nombre}</strong> - RUT: {cliente.rut} (<em>{cliente.comuna}</em>)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;