# Pokédex App - Taller Práctico React

Aplicación web interactiva construida con **React**, **Vite** y **Axios** que consume en tiempo real la API de [PokéAPI](https://pokeapi.co/), gestiona estados asíncronos (carga, error y éxito) y permite filtrado dinámico en tiempo real.

---

## 🚀 Tecnologías Utilizadas

- **React 19**
- **Vite**
- **Axios**
- **PokéAPI REST API v2**

---

## 📁 Estructura del Proyecto

```text
pokedex-app/
├── public/
├── src/
│   ├── components/
│   │   └── PokemonCard.jsx      # Tarjeta individual con detalles e imagen de cada Pokémon
│   ├── services/
│   │   └── pokemonService.js   # Peticiones HTTP a PokéAPI mediante Axios
│   ├── App.jsx                 # Vista principal, estado global y filtrado
│   ├── index.css               # Estilos globales normalizados
│   └── main.jsx                # Punto de entrada de la aplicación
├── .env                        # Variables de entorno (VITE_POKEAPI_URL)
├── index.html
├── package.json
└── vite.config.js
```

---

## 💻 Ejecución en Entorno Local

1. Acceder al directorio del proyecto:
   ```bash
   cd pokedex-app
   ```

2. Instalar dependencias (en caso de clonar el proyecto):
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador la URL indicada (generalmente `http://localhost:5173`).

---

## ☁️ Guía de Despliegue en Producción

### 1. Subir a GitHub
1. Crear un nuevo repositorio en tu cuenta de [GitHub](https://github.com/new) (ej. `pokedex-react-app`).
2. Vincular el repositorio remoto y subir los cambios:
   ```bash
   cd pokedex-app
   git remote add origin https://github.com/TU_USUARIO/pokedex-react-app.git
   git branch -M main
   git push -u origin main
   ```

### 2. Despliegue en Vercel
1. Ingresa a [Vercel](https://vercel.com/) e inicia sesión con GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Importa tu repositorio `pokedex-react-app`.
4. En la configuración del proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (o `pokedex-app` si subes la carpeta contenedora)
   - **Environment Variables**:
     - Nombre: `VITE_POKEAPI_URL`
     - Valor: `https://pokeapi.co/api/v2`
5. Haz clic en **Deploy**.

### 3. Despliegue en Netlify
1. Ingresa a [Netlify](https://www.netlify.com/) e inicia sesión con GitHub.
2. Selecciona **"Add new site"** > **"Import an existing project"**.
3. Selecciona tu repositorio de GitHub.
4. Parámetros de compilación:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**:
     - Clave: `VITE_POKEAPI_URL`
     - Valor: `https://pokeapi.co/api/v2`
5. Haz clic en **Deploy site**.
