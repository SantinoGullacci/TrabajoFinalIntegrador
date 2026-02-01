
---


# Trabajo Final Integrador: Web de Peluquería

## Integrantes
* Josué Chazarreta
* Santino Gullacci

---

## Manual de instalación y ejecución

### Levantar el proyecto

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/SantinoGullacci/TrabajoFinalIntegrador.git
2. Instalar dependencias:
* Dentro de `/backend`:
```bash
npm i
```


* Dentro de `/frontend`:
```bash
npm i
```





### Ejecución Local

* Dentro de `/backend`:
```bash
npm run dev
```


* Dentro de `/frontend`:
```bash
npm run dev
```


* Ingresar a: [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)

### URL Pública

* Ingresar a: [https://trabajo-final-integrador-pi.vercel.app](https://trabajo-final-integrador-pi.vercel.app)
*(El backend puede tardar unos segundos en levantarse, luego estará lista para usar).*

---

## Uso

Ya sea de manera local o mediante la URL pública, podés ingresar con las siguientes credenciales:

**Como ADMIN:**

* **Email:** `admin@test.com`
* **Pass:** `123`

**Como CLIENTE:**

* **Email:** `user@test.com`
* **Pass:** `123`

> Cada rol tiene su propia interfaz y propias herramientas.

También podés registrarte como cliente de manera manual. Para convertir ese cliente en **ADMIN**:

1. Inicia sesión en la web como ADMIN.
2. Anda a la sección **Clientes**.
3. Edita el rol del usuario que quieras cambiar.
4. **Importante:** Para que el cambio se vea reflejado, cerrá y volvé a iniciar sesión con la cuenta modificada.

### Crear usuarios mediante POSTMAN

**Local:**
Realizar un `POST` a: `http://localhost:3001/register`

**URL Pública:**
Realizar un `POST` a: `https://trabajofinalintegrador.onrender.com/register`

**Body (JSON):**

```json
{
  "name": "TU NOMBRE COMPLETO",
  "email": "TU MAIL",
  "password": "TU CONTRASEÑA", 
  "role": "admin", 
  "phone": "TU CELULAR",
  "securityAnswer": "NOMBRE DE TU PRIMER MASCOTA"
}

```

*(Nota: En "role", para crear un cliente, escribir "client").*

---

## Consideraciones finales o limitaciones

Otras URLs útiles para trabajar con Postman:

* **Local:** `GET` en `http://localhost:3001/users` (Para recibir la lista de usuarios creados).
* **URL Pública:** `GET` en `https://trabajofinalintegrador.onrender.com/users` (Para recibir la lista de usuarios creados).

También consideramos importante aclarar que nuestro proyecto **ES compatible para dispositivos móviles**. 

---

## Introducción y objetivos del proyecto

Nuestro proyecto se trata de una web de una peluquería donde principalmente podés pedir turnos y comprar artículos.

### Funcionalidades Generales

* **HOME:** Donde se puede apreciar información relevante sobre la peluquería, tal como horarios, dirección, logos e incluso un pequeño carrete de fotografías de referencia, las cuales si pulsás te llevarán mediante un hipervínculo a la página de Instagram oficial del negocio. 


* **TIENDA:** Donde podés elegir entre los productos del local y realizar las compras que necesites. 



### Funcionalidades de Cliente

Si desplegas la sección **"Mis Turnos"**, te encontrarás con tres opciones: 

* **Agendar:** Para solicitar un nuevo turno.
* **Pendientes:** Para ver los turnos que tengas en el futuro. Podés generar un **EXCEL** o **PDF** que te mostrará un resumen de los mismos. 


* **Historial:** Para verificar tus turnos pasados. 



**Otras secciones:**

* **Mis Compras:** Podrás ver un historial de las compras que hayas realizado.
* **Mi Perfil:** Podrás modificar la información que necesites, como tu nombre, celular o contraseña. 



### Funcionalidades de Admin

* **Resumen:** Debajo de Home, vas a tener a mano las estadísticas principales de tu negocio. 


* **Turnos:** Vas a poder visualizar los que tengas pendientes y los que ya hayan caducado, pudiendo también generar un **EXCEL** o **PDF** con un resumen de los mismos. 


* *Asignación Manual:* En esta misma sección, también podrás asignar turnos a clientes que lo necesiten, sin necesidad de que ellos ingresen a la web. En caso de que el cliente no tenga cuenta, simplemente marca la opción **"Es un cliente sin cuenta (Invitado)"**. 




* **Servicios:** Serás capaz de crear, editar y eliminar los servicios que el negocio necesite. Cada servicio cuenta con un nombre, un precio y una duración. 


* **Administrar Tienda:** Si desplegas esta opción te encontrarás con: 


* *Tienda:* Para visualizar la tienda como un cliente normal.
* *Administrar Productos:* Para realizar una ágil e intuitiva gestión de stock, pudiendo crear, editar y eliminar productos. 


* *Asignar Ventas:* Similar a cuanto asignabas un turno a alguien como admin, solo que esta vez le asignas un producto. 


* *Historial Ventas:* Acá podrás ver el historial de compras en tu negocio. 




* **Clientes:** Podrás ver y editar a los usuarios registrados, pudiendo modificar nombres, teléfonos o roles, e incluso eliminarlos.
* *Ficha Técnica:* Contarás con una Ficha por cada cliente, donde podrás dejar por escrito información que consideres necesaria (solo visible para admins). 





---

## Diseño de la arquitectura

<img width="2555" height="1558" alt="mermaid-diagram-2026-02-01-182557" src="https://github.com/user-attachments/assets/b3084238-b4b8-431c-a2f1-16c4df2820f4" />


---

## Tecnologías, librerías y frameworks utilizados

## Tecnologías, librerías y frameworks utilizados

### Frontend
* **React:** Librería principal para la construcción de la interfaz de usuario.
* **TypeScript:** Superset de JavaScript que añade tipado estático para un código más robusto.
* **Vite:** Empaquetador y entorno de desarrollo rápido.
* **React Router DOM:** Para el manejo de rutas y navegación en la SPA (Single Page Application).
* **Context API:** Para el manejo del estado global (Autenticación).
* **Vitest & React Testing Library:** Para la ejecución de pruebas unitarias y de integración.
* **@react-pdf/renderer:** Librería utilizada para la generación y descarga de reportes en formato PDF.

### Backend
* **Node.js:** Entorno de ejecución para el servidor.
* **Express:** Framework para manejar las rutas y peticiones HTTP.
* **Sequelize:** ORM (Object-Relational Mapping) para interactuar con la base de datos SQL.
* **PostgreSQL:** Base de datos relacional.
* **Bcryptjs:** Para el hasheo y encriptación de contraseñas y respuestas de seguridad.
* **Mermaid:** Utilizado para la diagramación de la base de datos en la documentación.

### Herramientas y Despliegue
* **Git:** Control de versiones.
* **Postman:** Herramienta para testear los endpoints de la API.
* **Vercel:** Plataforma utilizada para el despliegue del Frontend.
* **Render:** Plataforma utilizada para el despliegue del Backend y la Base de Datos.
