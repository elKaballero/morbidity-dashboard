# Exo Morb - Sistema de Morbilidad

Este proyecto consta de un Frontend (React + Vite) y un Backend (Node.js + Express + PostgreSQL).

## 🚀 Guía de Despliegue Manual

### 1. Base de Datos (Aiven PostgreSQL)
Ya tienes configurado el acceso a Aiven en el archivo `server/.env`.
Para crear las tablas en la nube, ejecuta desde la carpeta `server`:
```bash
node init-db.js
```

### 2. Backend (Render / Vercel)
- **Render**: Conecta tu repositorio de GitHub, selecciona la carpeta `server`. El comando de inicio es `npm start`. Asegúrate de copiar las variables de entorno de `server/.env` a la configuración de Render.
- **Vercel**: Ya tienes un archivo `vercel.json` en la carpeta `server`. Puedes desplegar directamente esa carpeta.

### 3. Frontend (SiteGround / Vercel / Netlify)
1. Abre el archivo `.env.production` en la raíz y actualiza `VITE_API_URL` con la URL real de tu backend desplegado (ejemplo: `https://tu-api.onrender.com/api`).
2. Genera los archivos de producción:
   ```bash
   npm run build
   ```
3. Sube el contenido de la carpeta `dist` que se generó a tu servidor (SiteGround via FTP o arrastrando a Vercel/Netlify).

---

## 🛠️ Desarrollo Local

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```
