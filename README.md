# MeetMed Backend

## Descripción del Proyecto

### Arquitectura
El proyecto implementa una **Arquitectura en Capas**. La estructura se divide en:
- **Controladores (Controllers)**: Manejan las peticiones HTTP y la validación de entrada.
- **Servicios (Services)**: Contienen la lógica de negocio y orquestan las transacciones.
- **Repositorios (Repositories)**: Capa de abstracción de datos personalizada que encapsula el uso de TypeORM. Los servicios nunca acceden directamente al `EntityManager` o al repositorio base de TypeORM, lo que facilita el mantenimiento y las pruebas unitarias.

### Modelado de Datos
Se utiliza un modelo relacional en **PostgreSQL** con las siguientes entidades principales:
- **User**: Gestiona la identidad, credenciales (hasheadas con bcryptjs) y roles (`ADMIN`, `CLIENT`).
- **MedicalService**: Representa los servicios ofrecidos (nombre, descripción, precio).
- **Availability**: Relación 1:N con `MedicalService`, permitiendo definir múltiples franjas horarias para un mismo servicio.
El sistema utiliza **Soft Deletes** para mantener la integridad histórica de los datos.

### Estructura del Proyecto
- `src/modules`: Contiene la lógica de negocio organizada por dominios (Auth, Users, Medical Services). Cada módulo sigue esta estructura interna:
  - `controllers/`: Puntos de entrada de la API y manejo de respuestas HTTP.
  - `services/`: Lógica de negocio y orquestación de transacciones.
  - `repositories/`: Capa de persistencia utilizando TypeORM.
  - `entities/`: Definición de modelos de base de datos.
  - `dto/`: Objetos de transferencia de datos para entrada y salida.
- `src/common`: Decoradores, filtros de excepciones, guards de seguridad y configuración del logger.

### Estrategia de Autenticación y Justificación
Se ha implementado una estrategia de autenticación basada en **JWT (JSON Web Tokens)** con una capa de seguridad adicional:
- **Almacenamiento en Cookies HTTP-Only**: Se uso cookies con el flag `httpOnly` para el sesionamiento para garantizar que el token sea inaccesible para scripts de JavaScript en el cliente. Esto proporciona una defensa robusta contra ataques de **XSS (Cross-Site Scripting)**.
- **Seguridad**: Las cookies están configuradas con `SameSite: Strict` y el flag `Secure` (en producción) para mitigar ataques de **CSRF** y asegurar la transmisión cifrada.

## Características Principales
- **Arquitectura por Capas Estricta**: Los servicios no acceden directamente a la base de datos; utilizan una capa de Repositorio personalizada.
- **Seguridad**: Autenticación JWT almacenada en **cookies HTTP-only** para prevenir ataques XSS.
- **Autorización**: Control de acceso basado en roles (`ADMIN`, `CLIENT`).
- **Gestión Médica**: Creación y búsqueda de servicios médicos con múltiples horarios de disponibilidad.
- **Transacciones**: Manejo de transacciones atómicas en la capa de servicio mediante `EntityManager`.
- **Logging**: Registro centralizado con **Winston** y filtros de excepciones globales.
- **Documentación**: Swagger UI integrado y configurado para soportar autenticación por cookies.
- **Contenedores**: Soporte completo para Docker y Docker Compose.

## Configuración
1. Clona el repositorio.
2. Crea un archivo `.env` en la raíz basado en el .env.ejemplo:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=meetmed
JWT_SECRET=tu_secreto_super_seguro
COOKIE_SECRET=secreto_para_cookies
NODE_ENV=development
```

## Ejecución con Docker (Recomendado)
Para levantar todo el entorno (App + Base de Datos) automáticamente:
```bash
docker compose up --build
```
La API estará disponible en `http://localhost:3000/api` y la base de datos se inicializará automáticamente.

## Ejecución Local
1. Instalar dependencias:
```bash
npm install
```
2. Iniciar en modo desarrollo:
```bash
npm run start:dev
```

## Documentación de la API
Una vez que la aplicación esté en ejecución, puedes acceder a la documentación interactiva en:
`http://localhost:3000/docs`

## Pruebas (Testing)
El proyecto incluye pruebas de integración (E2E) que cubren el flujo de autenticación y servicios médicos:
```bash
# Ejecutar pruebas E2E
npm run test:e2e
```