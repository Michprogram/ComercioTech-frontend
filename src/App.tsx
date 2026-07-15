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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({ _id: '', nombre: '', rut: '', username: '', region: '', comuna: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [errorLogin, setErrorLogin] = useState('');
  const [pestaña, setPestaña] = useState<'clientes' | 'productos' | 'pedidos'>('clientes');
  const [productos, setProductos] = useState<any[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [modoEdicionProducto, setModoEdicionProducto] = useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
  const [modoEdicionPedido, setModoEdicionPedido] = useState(false);

  const [formPedido, setFormPedido] = useState({
    _id: '',
    cliente_id: '',    // Guardará el ID del cliente seleccionado
    productos: '',   // Guardará el ID del producto seleccionado
    cantidad: 1,
    estado: 'Pendiente'
  });

  const [formProducto, setFormProducto] = useState({
    _id: '',
    nombre: '',
    precio: 0,
    stock: 0,
    categoria: ''
  });

  // Cargar clientes al iniciar la app 
  useEffect(() => {
    fetch('https://comerciotech-backend.onrender.com/api/clientes')
      //fetch('http://localhost:3000/api/clientes')
      .then(respuesta => respuesta.json()) // Convertimos la respuesta cruda a JSON
      .then(datos => {
        console.log("Datos recibidos del backend:", datos);
        setClientes(datos); // Guardamos los datos en nuestra variable de estado

      })
      .catch(error => {
        console.error("Error de conexión:", error);

      });
  }, []);

  // 1. Obtener todos los pedidos
  const obtenerPedidos = async () => {
    setCargandoPedidos(true);
    try {
      const respuesta = await fetch('https://comerciotech-backend.onrender.com/api/pedidos');
      const datos = await respuesta.json();
      if (respuesta.ok) {
        setPedidos(datos);
      }
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    } finally {
      setCargandoPedidos(false);
    }
  };

  // 2. Cargar pedidos automáticamente al entrar a la pestaña
  useEffect(() => {
    if (token && pestaña === 'pedidos') {
      obtenerPedidos();
    }
  }, [token, pestaña]);

  // 3. Manejar cambios en el formulario de pedidos
  const handlePedidoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormPedido({
      ...formPedido,
      [name]: name === 'cantidad' ? Number(value) : value
    });
  };

  // 4. Crear o Editar un pedido
  const guardarPedido = async () => {

    if (!formPedido.cliente_id || !formPedido.productos) {
      alert('Por favor, selecciona un cliente y un producto.');
      return;
    }

    const url = modoEdicionPedido
      ? `https://comerciotech-backend.onrender.com/api/pedidos/${formPedido._id}`
      : 'https://comerciotech-backend.onrender.com/api/pedidos';

    const metodo = modoEdicionPedido ? 'PUT' : 'POST';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPedido)
      });

      if (respuesta.ok) {
        setMostrarModalPedido(false);
        obtenerPedidos();
      } else {
        const errorDatos = await respuesta.json();
        alert(errorDatos.message || 'Error al guardar el pedido');
      }
    } catch (error) {
      console.error('Error en la petición de pedido:', error);
    }
  };

  // 5. Eliminar un pedido
  const eliminarPedido = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;

    try {
      const respuesta = await fetch(`https://comerciotech-backend.onrender.com/api/pedidos/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        obtenerPedidos();
      } else {
        alert('No se pudo eliminar el pedido');
      }
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
    }
  };






  // 1. Bloque independiente para filtrar Clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(textoBusqueda) ||
      cliente.rut.toLowerCase().includes(textoBusqueda) ||
      cliente.comuna.toLowerCase().includes(textoBusqueda)
    );
  });

  // 2. Bloque independiente para filtrar Productos
  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(busquedaProducto.toLowerCase())
  );



  // Login  
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

  // Guardar y eliminar clientes
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

  // 1. Obtener todos los productos
  const obtenerProductos = async () => {
    setCargandoProductos(true);
    try {
      const respuesta = await fetch('https://comerciotech-backend.onrender.com/api/productos');
      const datos = await respuesta.json();
      if (respuesta.ok) {
        setProductos(datos);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setCargandoProductos(false);
    }
  };

  // 2. Ejecutar la carga de productos si cambiamos a esa pestaña
  useEffect(() => {
    if (token && pestaña === 'productos') {
      obtenerProductos();
    }
  }, [token, pestaña]);

  // 3. Manejar cambios en el formulario de productos
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormProducto({
      ...formProducto,
      [name]: name === 'precio' || name === 'stock' ? Number(value) : value
    });
  };

  // 4. Crear o Editar un producto
  const guardarProducto = async () => {
    const url = modoEdicionProducto
      ? `https://comerciotech-backend.onrender.com/api/productos/${formProducto._id}`
      : 'https://comerciotech-backend.onrender.com/api/productos';

    const metodo = modoEdicionProducto ? 'PUT' : 'POST';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formProducto)
      });

      if (respuesta.ok) {
        setMostrarModalProducto(false);
        obtenerProductos();
      } else {
        alert('Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error en la petición de producto:', error);
    }
  };

  // 5. Eliminar un producto
  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const respuesta = await fetch(`https://comerciotech-backend.onrender.com/api/productos/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        obtenerProductos();
      } else {
        alert('No se pudo eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">

      {!token ? (
        /* ================= PANTALLA DE LOGIN ================= */
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
                  type="email" name="email" required placeholder="ejemplo@comerciotech.cl"
                  value={loginForm.email} onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Contraseña</label>
                <input
                  type="password" name="password" required placeholder="••••••••"
                  value={loginForm.password} onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-6">
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      ) : (

        /* ================= PANEL DE ADMINISTRACIÓN ================= */
        <div className="p-8">
          <div className="max-w-6xl mx-auto">

            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-blue-900">ComercioTech</h1>
                <p className="text-gray-500 mt-1">Panel de Administración Central</p>
              </div>
              <button
                onClick={cerrarSesion}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition-colors border border-red-200"
              >
                Salir
              </button>
            </header>

            {/* MENÚ DE PESTAÑAS */}
            <div className="flex border-b border-gray-200 mb-6 space-x-6">
              <button
                onClick={() => setPestaña('clientes')}
                className={`py-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${pestaña === 'clientes'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Directorio de Clientes
              </button>
              <button
                onClick={() => setPestaña('productos')}
                className={`py-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${pestaña === 'productos'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Catálogo de Productos
              </button>
              <button
                onClick={() => setPestaña('pedidos')}
                className={`py-3 px-4 font-bold text-sm uppercase tracking-wider transition-all ${pestaña === 'pedidos'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Gestión de Pedidos
              </button>
            </div>

            {/* ================= PESTAÑA: CLIENTES ================= */}
            {pestaña === 'clientes' && (
              <div className="animate-fade-in-up">
                <div className="mb-6 flex justify-between items-center">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm">
                    Total Clientes: {clientesFiltrados.length}
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <input
                      type="text" placeholder="Buscar cliente..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={() => { setFormulario({ _id: '', nombre: '', rut: '', username: '', region: '', comuna: '' }); setModoEdicion(false); setMostrarModal(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold whitespace-nowrap"
                    >
                      + Nuevo Cliente
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
                        <th className="p-4 font-semibold">Nombre</th>
                        <th className="p-4 font-semibold">RUT</th>
                        <th className="p-4 font-semibold">Usuario</th>
                        <th className="p-4 font-semibold">Ubicación</th>
                        <th className="p-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clientesFiltrados.map((cliente) => (
                        <tr key={cliente._id} className="hover:bg-blue-50">
                          <td className="p-4 font-medium text-gray-900">{cliente.nombre}</td>
                          <td className="p-4">{cliente.rut}</td>
                          <td className="p-4 text-gray-500">@{cliente.username}</td>
                          <td className="p-4 text-gray-600">{cliente.comuna}, {cliente.region}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => { setFormulario(cliente); setModoEdicion(true); setMostrarModal(true); }} className="text-blue-500 hover:text-blue-700 font-medium px-2">Editar</button>
                            <button onClick={() => eliminarCliente(cliente._id)} className="text-red-500 hover:text-red-700 font-medium px-2">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= PESTAÑA: PRODUCTOS ================= */}
            {pestaña === 'productos' && (
              <div className="animate-fade-in-up">
                <div className="mb-6 flex justify-between items-center">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium text-sm">
                    Total Productos: {productosFiltrados.length}
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <input
                      type="text" placeholder="Buscar por nombre o categoría..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)}
                      className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <button
                      onClick={() => { setFormProducto({ _id: '', nombre: '', precio: 0, stock: 0, categoria: '' }); setModoEdicionProducto(false); setMostrarModalProducto(true); }}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold whitespace-nowrap"
                    >
                      + Nuevo Producto
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  {cargandoProductos ? (
                    <div className="p-8 text-center text-gray-500">Cargando catálogo...</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
                          <th className="p-4 font-semibold">Producto</th>
                          <th className="p-4 font-semibold">Categoría</th>
                          <th className="p-4 font-semibold">Precio</th>
                          <th className="p-4 font-semibold">Stock</th>
                          <th className="p-4 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {productosFiltrados.map((prod) => (
                          <tr key={prod._id} className="hover:bg-green-50">
                            <td className="p-4 font-medium text-gray-900">{prod.nombre}</td>
                            <td className="p-4">
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{prod.categoria}</span>
                            </td>
                            <td className="p-4 font-bold text-green-600">${prod.precio}</td>
                            <td className={`p-4 font-bold ${prod.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{prod.stock}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => { setFormProducto(prod); setModoEdicionProducto(true); setMostrarModalProducto(true); }} className="text-blue-500 hover:text-blue-700 font-medium px-2">Editar</button>
                              <button onClick={() => eliminarProducto(prod._id)} className="text-red-500 hover:text-red-700 font-medium px-2">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ================= PESTAÑA: PEDIDOS ================= */}
            {pestaña === 'pedidos' && (
              <div className="animate-fade-in-up">
                <div className="mb-6 flex justify-between items-center">
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium text-sm">
                    Total Pedidos: {pedidos.length}
                  </div>
                  <button
                    onClick={() => {
                      setFormPedido({ _id: '', cliente_id: '', productos: '', cantidad: 1, estado: 'Pendiente' });
                      setModoEdicionPedido(false);
                      setMostrarModalPedido(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold whitespace-nowrap"
                  >
                    + Nuevo Pedido
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  {cargandoPedidos ? (
                    <div className="p-8 text-center text-gray-500">Cargando pedidos...</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
                          <th className="p-4 font-semibold">Cliente</th>
                          <th className="p-4 font-semibold">Producto</th>
                          <th className="p-4 font-semibold">Cantidad</th>
                          <th className="p-4 font-semibold">Estado</th>
                          <th className="p-4 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pedidos.length > 0 ? (
                          pedidos.map((pedido) => (
                            <tr key={pedido._id} className="hover:bg-purple-50">
                              <td className="p-4 font-medium text-gray-900">
                                {pedido.cliente_id?.nombre || 'Cliente no disponible'}
                              </td>



                              <td className="p-4">
                                {pedido.productos?.nombre || 'Producto no disponible'}
                              </td>
                              <td className="p-4 font-semibold">{pedido.cantidad}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pedido.estado === 'Completado'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                  {pedido.estado}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => {
                                    setFormPedido({
                                      _id: pedido._id,
                                      cliente_id: pedido.cliente?._id || '',
                                      productos: pedido.producto?._id || '',
                                      cantidad: pedido.cantidad,
                                      estado: pedido.estado
                                    });
                                    setModoEdicionPedido(true);
                                    setMostrarModalPedido(true);
                                  }}
                                  className="text-blue-500 hover:text-blue-700 font-medium px-2"
                                >
                                  Editar
                                </button>
                                <button onClick={() => eliminarPedido(pedido._id)} className="text-red-500 hover:text-red-700 font-medium px-2">Eliminar</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                              No hay pedidos registrados. ¡Crea el primero!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* MODAL CLIENTES */}
            {mostrarModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">{modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                    <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                  </div>
                  <div className="p-6 space-y-4">
                    <input type="text" name="nombre" placeholder="Nombre completo" value={formulario.nombre} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                    <input type="text" name="rut" placeholder="RUT" value={formulario.rut} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                    <input type="text" name="username" placeholder="Usuario" value={formulario.username} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                    <div className="flex gap-4">
                      <input type="text" name="region" placeholder="Región" value={formulario.region} onChange={handleChange} className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                      <input type="text" name="comuna" placeholder="Comuna" value={formulario.comuna} onChange={handleChange} className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={() => setMostrarModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={guardarCliente} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL PRODUCTOS */}
            {mostrarModalProducto && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">{modoEdicionProducto ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={() => setMostrarModalProducto(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                  </div>
                  <div className="p-6 space-y-4">
                    <input type="text" name="nombre" placeholder="Nombre del producto" value={formProducto.nombre} onChange={handleProductChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                    <input type="text" name="categoria" placeholder="Categoría" value={formProducto.categoria} onChange={handleProductChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Precio ($)</label>
                        <input type="number" name="precio" placeholder="0" value={formProducto.precio} onChange={handleProductChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Stock (Unidades)</label>
                        <input type="number" name="stock" placeholder="0" value={formProducto.stock} onChange={handleProductChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={() => setMostrarModalProducto(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={guardarProducto} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Guardar</button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= MODAL PEDIDOS ================= */}
            {mostrarModalPedido && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">{modoEdicionPedido ? 'Editar Pedido' : 'Nuevo Pedido'}</h3>
                    <button onClick={() => setMostrarModalPedido(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                  </div>
                  <div className="p-6 space-y-4">

                    {/* SELECT DE CLIENTES */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seleccionar Cliente</label>
                      <select
                        name="cliente_id"
                        value={formPedido.cliente_id}
                        onChange={handlePedidoChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-white"
                      >
                        <option value="">-- Selecciona un cliente --</option>
                        {clientes.map(cli => (
                          <option key={cli._id} value={cli._id}>{cli.nombre} ({cli.rut})</option>
                        ))}
                      </select>
                    </div>

                    {/* SELECT DE PRODUCTOS */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seleccionar Producto</label>
                      <select
                        name="productos"
                        value={formPedido.productos}
                        onChange={handlePedidoChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-white"
                      >
                        <option value="">-- Selecciona un producto --</option>
                        {productos.map(prod => (
                          <option key={prod._id} value={prod._id}>{prod.nombre} - ${prod.precio}</option>
                        ))}
                      </select>
                    </div>

                    {/* CANTIDAD */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad</label>
                      <input
                        type="number"
                        name="cantidad"
                        min="1"
                        value={formPedido.cantidad}
                        onChange={handlePedidoChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    {/* ESTADO */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado del Pedido</label>
                      <select
                        name="estado"
                        value={formPedido.estado}
                        onChange={handlePedidoChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 outline-none bg-white"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </div>

                  </div>
                  <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={() => setMostrarModalPedido(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={guardarPedido} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Guardar Pedido</button>
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