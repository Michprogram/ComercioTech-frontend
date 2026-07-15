# ComercioTech - Panel de Administración (Frontend) 💻✨

Este es el frontend de **ComercioTech**, una aplicación web moderna que actúa como el Panel de Administración Central para la tienda. Está construida utilizando **React**, **Vite** y **TypeScript**, ofreciendo una interfaz de usuario interactiva, rápida y completamente adaptable a dispositivos móviles (diseño responsivo).

Se comunica directamente con la API de ComercioTech alojada en Render para realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) en tiempo real sobre clientes, productos y pedidos.

---

## 🛠️ Tecnologías y Herramientas Utilizadas

El desarrollo de la interfaz de usuario se basó en un stack moderno de desarrollo frontend:

* **Biblioteca Principal:** [React.js](https://react.dev/) (Arquitectura basada en componentes y manejo de estados dinámicos)
* **Herramienta de Construcción:** [Vite](https://vitejs.dev/) (Entorno de desarrollo ultra rápido y empaquetador eficiente)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado estricto para prevenir errores en tiempo de desarrollo)
* **Estilos y UI/UX:** CSS Moderno / Tailwind CSS (Paleta de colores azul/neutro, estética limpia, minimalista y profesional)
* **Control de Versiones:** Git & GitHub
* **Hosting de Producción:** [Vercel](https://vercel.com/) (Despliegue continuo integrado con GitHub)

---

## 🌟 Características Claves del Sistema

1. **Directorio de Clientes:**
   * Visualización de datos clave: Nombre, RUT, Nombre de Usuario y Ubicación (Comuna y Región).
   * Creación, edición y eliminación de clientes en tiempo real.
2. **Catálogo de Productos:**
   * Listado de productos con categorías estructuradas.
   * Gestión de inventario con control de **Stock** dinámico y precios.
   * Capacidad de añadir nuevos artículos o modificar los existentes desde la interfaz.
3. **Gestión de Pedidos (Checkout Interno):**
   * Creación de pedidos asociando de manera relacional un cliente existente con un producto.
   * Visualización del estado del pedido (Pendiente, En preparación, Enviado, Completado) y cantidades.
   * Actualización o eliminación dinámica de órdenes de compra.
4. **Diseño Responsivo:**
   * Interfaz optimizada para una navegación fluida tanto en computadores de escritorio como en teléfonos celulares.

---

## 💻 Instalación y Ejecución en Entorno Local

Sigue estos pasos para levantar la interfaz de usuario en tu computadora:

### Prerrequisitos

* Tener instalado [Node.js](https://nodejs.org/) (versión 16 o superior recomendada).

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Michprogram/ComercioTech-frontend.git
cd ComercioTech-fronend
```

### Paso 2: Instalar Dependencias

Instala los paquetes necesarios para que React y Vite funcionen:

```bash
npm install
```

### Paso 3: Configurar la Conexión al Backend

Asegúrate de que las llamadas de consulta (fetch) en tu archivo `App.tsx` apunten a la dirección correcta de tu API:

* Para desarrollo local: `http://localhost:5000`
* Para producción: La URL pública proporcionada por tu backend en Render (https://comercio-tech-frontend.vercel.app/).

### Paso 4: Levantar el Servidor de Desarrollo

Inicia el entorno de desarrollo local:

```bash
npm run dev
```

Abre en tu navegador la dirección que te indique la terminal (usualmente `http://localhost:5173`) para ver y probar la aplicación de forma local.

---

## 🚀 Construcción y Despliegue (Production Build)

Para compilar el proyecto y prepararlo para producción (como lo hace Vercel automáticamente al realizar un `git push`):

```bash
npm run build
```

Este comando genera una carpeta optimizada llamada `dist` con archivos HTML, CSS y JS listos para ser servidos de forma estática con un rendimiento de carga inferior a los 2 segundos.

--- 
