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
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // 3. useEffect hace que este código se ejecute SOLO UNA VEZ cuando la página carga
  useEffect(() => {
    fetch('https://comerciotech-backend.onrender.com/api/clientes')
      //fetch('http://localhost:3000/api/clientes')
      .then(respuesta => respuesta.json()) // Convertimos la respuesta cruda a JSON
      .then(datos => {
        console.log("Datos recibidos del backend:", datos);
        setClientes(datos); // Guardamos los datos en nuestra variable de estado
        setCargando(false); // Indicamos que ya no estamos cargando
      })
      .catch(error => {
        console.error("Error de conexión:", error);
        setCargando(false);
      });
  }, []);

  const clientesFiltrados = clientes.filter(cliente => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(textoBusqueda) ||
      cliente.rut.toLowerCase().includes(textoBusqueda) ||
      cliente.comuna.toLowerCase().includes(textoBusqueda)
    );
  });


  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">

        {/* Encabezado del Panel */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900">ComercioTech</h1>
            <p className="text-gray-500 mt-1">Panel de Administración de Clientes</p>
          </div>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow font-medium">
            Total Registros: {clientes.length}
          </div>
        </header>

        {/* Contenedor de la Tabla */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {cargando ? (
            <div className="p-10 text-center text-blue-600 font-semibold animate-pulse">
              Cargando base de datos desde la nube...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Nombre del Cliente</th>
                    <th className="p-4 font-semibold">RUT</th>
                    <th className="p-4 font-semibold">Usuario</th>
                    <th className="p-4 font-semibold">Región</th>
                    <th className="p-4 font-semibold">Comuna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {clientes.map((cliente) => (
                    <tr key={cliente._id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="p-4 font-medium text-gray-900">{cliente.nombre}</td>
                      <td className="p-4">{cliente.rut}</td>
                      <td className="p-4 text-gray-500">@{cliente.username}</td>
                      <td className="p-4">{cliente.region}</td>
                      <td className="p-4 italic text-sm">{cliente.comuna}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;