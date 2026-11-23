# EwuarSoft - Backend API REST (Tienda y Licores La Farra)
## GA8-220501096-AA1-EV01: Despliegue de Servicios Web
**Aprendiz:** Edwar Montoya  
**Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) - SENA

---

## 1. Descripción
API REST desacoplada desarrollada en **Node.js** con **Express** y **MySQL** para la gestión integral de inventarios, pedidos a proveedores, autenticación de usuarios, punto de venta (POS) y reportería de la licorera **Tienda y Licores La Farra**.

El backend está preparado para funcionar tanto en **entorno local (XAMPP / MySQL local)** como en **servidores en la nube (Render, Railway, Koyeb)** conectado a bases de datos remotas seguras con SSL (**Aiven, TiDB Cloud, Clever Cloud**).

---

## 2. Estructura del Repositorio
```text
ewuarsoft-backend/
├── sql/
│   ├── database.sql       # Script DDL completo con las 7 tablas de MySQL
│   └── init-auth.js       # Script de inicialización y usuarios administradores
├── src/
│   ├── config/
│   │   └── database.js    # Pool de conexiones MySQL con soporte local y SSL cloud
│   ├── controllers/       # Controladores de lógica HTTP
│   ├── routes/            # Definición de rutas y endpoints de la API
│   ├── services/          # Lógica de negocio y transacciones MySQL
│   ├── app.js             # Configuración de Express, CORS y middlewares
│   └── server.js          # Punto de entrada y arranque del servidor
├── .env.example           # Plantilla de variables de entorno
├── .gitignore             # Archivos excluidos de Git (node_modules, .env)
├── package.json           # Dependencias y scripts
└── README.md              # Documentación técnica
```

---

## 3. Requisitos
- **Node.js:** Versión 18 o superior.
- **MySQL:** Versión 8.0 o compatible (MariaDB 10.4+).

---

## 4. Instalación y Ejecución en Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Ajusta los datos de conexión a tu MySQL local en el `.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ewarsoft
   DB_SSL=false
   ```

3. **Crear la Base de Datos en MySQL:**
   Ejecuta el script SQL en tu cliente MySQL (phpMyAdmin, DBeaver o consola):
   ```bash
   mysql -u root -p < sql/database.sql
   ```

4. **Inicializar usuarios por defecto (Opcional):**
   ```bash
   node sql/init-auth.js
   ```

5. **Iniciar el servidor:**
   - Modo producción:
     ```bash
     npm start
     ```
   - Modo desarrollo (con recarga automática):
     ```bash
     npm run dev
     ```

El servidor estará escuchando en `http://localhost:3000`. Puedes verificar su estado en `http://localhost:3000/health`.

---

## 5. Instrucciones de Despliegue en la Nube (Gratis)

### Paso A: Base de Datos en la Nube (Aiven.io / TiDB Cloud)
1. Crea un servicio MySQL gratuito en [Aiven](https://aiven.io/) o [TiDB Cloud](https://tidbcloud.com/).
2. Conecta tu gestor SQL (o la consola de la plataforma) y ejecuta todo el contenido de `sql/database.sql`.
3. Copia el Host, Puerto, Usuario, Contraseña y Base de Datos proporcionados.

### Paso B: Desplegar el Backend en Render.com
1. Crea una cuenta en [Render.com](https://render.com/).
2. Haz clic en **New + > Web Service** y conecta este repositorio (`ewuarsoft-backend`).
3. Configuración del servicio:
   - **Name:** `ewuarsoft-backend`
   - **Environment:** `Node`
   - **Region:** Elige la más cercana (ej. US East / Ohio).
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. En **Environment Variables**, agrega:
   | Clave | Valor |
   |---|---|
   | `PORT` | `3000` |
   | `DB_HOST` | *(Host de tu base de datos en Aiven/TiDB)* |
   | `DB_PORT` | *(Puerto de tu BD remota)* |
   | `DB_USER` | *(Usuario de tu BD remota)* |
   | `DB_PASSWORD` | *(Contraseña de tu BD remota)* |
   | `DB_NAME` | `ewarsoft` |
   | `DB_SSL` | `true` |
5. Haz clic en **Create Web Service**.  
   Render compilará e iniciará el backend proporcionándote una URL HTTPS pública (ej: `https://ewuarsoft-backend.onrender.com`).

---

## 6. Endpoints Principales de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servicio y disponibilidad |
| `POST` | `/api/auth/login` | Inicio de sesión y verificación de credenciales |
| `POST` | `/api/auth/register` | Registro de nuevos usuarios |
| `POST` | `/api/products/list` | Catálogo de productos activos e inactivos |
| `POST` | `/api/products/create` | Registro de producto con soporte de pedido inicial |
| `POST` | `/api/products/update` | Actualización de datos de producto |
| `POST` | `/api/inventory/entry` | Entrada de stock / Recepción de pedidos |
| `POST` | `/api/inventory/exit` | Salida de stock / Averías / Mermas |
| `POST` | `/api/inventory/movements` | Historial de movimientos de auditoría |
| `POST` | `/api/sales/create` | Procesamiento transaccional de venta POS |
| `POST` | `/api/reports/sales` | Reporte consolidado de ventas |
| `POST` | `/api/reports/inventory` | Reporte valorizado de inventario |
