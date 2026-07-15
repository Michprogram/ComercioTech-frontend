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
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [errorLogin, setErrorLogin] = useState('');

  // 3. useEffect hace que este código se ejecute SOLO UNA VEZ cuando la página carga
  useEffect(() => {
    fetch('https://comerciotech-backend.onrender.com/api/clientes')
      //fetch('http://localhost:3000/api/clientes')
      .then(respuesta => respuesta.json()) // Convertimos la respuesta cruda a JSON
      .then(datos => {
        console.log("Datos recibidos del backend:", datos);
        setClientes(datos); // Guardamos los datos en nuestra variable de estado
        setCargando(false);
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

  // Detectar lo que se escribe en el formulario de login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    try {
      const respuesta = await fetch('https://comerciotech-backend.onrender.com/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const datos = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem('token', datos.token);
        setToken(datos.token);
      } else {
        setErrorLogin(datos.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setErrorLogin('Error de conexión con el servidor de seguridad');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken('');
  };


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
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">


      {/* PANTALLA DE LOGIN (Se muestra si NO hay token)          */}

      {!token ? (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-blue-900 to-slate-900">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-blue-900">ComercioTech</h1>
              <p className="text-gray-500 mt-2">Ingresa tus credenciales para acceder</p>
            </div>

            {errorLogin && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                ⚠️ {errorLogin}
              </div>
            )}

            <form onSubmit={iniciarSesion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ejemplo@comerciotech.cl"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-6"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      ) : (

        /* PANEL DE ADMINISTRACIÓN (Se muestra si SÍ hay token)      */
        <div className="p-8">
          <div className="max-w-6xl mx-auto">

            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-blue-900">ComercioTech</h1>
                <p className="text-gray-500 mt-1">Panel de Administración de Clientes</p>
              </div>

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
                <button
                  onClick={cerrarSesion}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition-colors border border-red-200"
                >
                  Salir
                </button>
              </div>
            </header>

            <div className="mb-6 flex justify-end">
              <input
                type="text"
                placeholder="Buscar por nombre, RUT o comuna..."
                className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
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
                                setFormulario(cliente);
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
            </div>

            {/* Modal para el Formulario */}
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

          </div>
        </div>
      )}
    </div>
  );
}

export default App;