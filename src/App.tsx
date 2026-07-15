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
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({ _id: '', nombre: '', rut: '', username: '', region: '', comuna: '' });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarCliente = async () => {
    const url = modoEdicion
      ? `https://comerciotech-backend.onrender.com/api/clientes/${formulario._id}`
      : 'https://comerciotech-backend.onrender.com/api/clientes';

    try {
      const respuesta = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      if (respuesta.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const eliminarCliente = async (id: string) => {
    if (!window.confirm('¿Estás segura de que deseas eliminar este cliente para siempre?')) return;

    try {
      const respuesta = await fetch(`https://comerciotech-backend.onrender.com/api/clientes/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) window.location.reload();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };



  return (
    <>
      <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
        <div className="max-w-6xl mx-auto">

          {/* Encabezado del Panel */}
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm">
                Total: {clientesFiltrados.length}
              </div>
              <button
                onClick={() => {
                  setFormulario({ _id: '', nombre: '', rut: '', username: '', region: '', comuna: '' });
                  setModoEdicion(false);
                  setMostrarModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md font-semibold transition-colors"
              >
                + Nuevo Cliente
              </button>
            </div>
          </header>

          <div className="mb-6 flex justify-end">
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o comuna..."
              className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

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
                      <th className="p-4 font-semibold text-right">Acciones</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map((cliente) => (
                        <tr key={cliente._id} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="p-4 font-medium text-gray-900">{cliente.nombre}</td>
                          <td className="p-4">{cliente.rut}</td>
                          <td className="p-4 text-gray-500">@{cliente.username}</td>
                          <td className="p-4">{cliente.region}</td>
                          <td className="p-4 italic text-sm">{cliente.comuna}</td>

                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setFormulario(cliente); // ¡Esto auto-rellena el formulario!
                                setModoEdicion(true);
                                setMostrarModal(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 font-medium px-2">
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarCliente(cliente._id)}
                              className="text-red-500 hover:text-red-700 font-medium px-2">
                              Eliminar
                            </button>
                          </td>
                        </tr>

                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No se encontraron clientes que coincidan con "{busqueda}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {modoEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" name="nombre" placeholder="Nombre completo" value={formulario.nombre} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" name="rut" placeholder="RUT (ej: 12.345.678-9)" value={formulario.rut} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
              <input type="text" name="username" placeholder="Nombre de usuario" value={formulario.username} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
              <div className="flex gap-4">
                <input type="text" name="region" placeholder="Región" value={formulario.region} onChange={handleChange} className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                <input type="text" name="comuna" placeholder="Comuna" value={formulario.comuna} onChange={handleChange} className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setMostrarModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={guardarCliente} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Guardar Cliente</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// Fin del componente principal de la aplicación.
export default App;