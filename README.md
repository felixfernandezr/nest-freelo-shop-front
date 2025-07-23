# Proyecto Angular - Sistema de Gestión de Productos y Usuarios

## Carátula

**Autor:** Fernández Rolón, Félix  
**Materia:** Programación Web I  
**Fecha de Presentación:** 23 de julio de 2025  

---

## Descripción del Sistema

Este sistema es una aplicación web desarrollada en Angular que permite gestionar productos y usuarios, integrando funcionalidades como catálogo de productos, detalles, administración de productos, autenticación de usuarios y búsqueda avanzada. Se construyó con el enfoque en el manejo eficiente del estado utilizando *signals*, recursos reactivos (`rxResource`) y cachés locales para optimizar el rendimiento y la experiencia de usuario.

El sistema incluye:

- **Gestión de productos**: visualización, creación, edición, y actualización con soporte para imágenes.
- **Autenticación y autorización**: registro, login, chequeo de sesión, y gestión de roles (incluyendo administrador).
- **Carrito de compras**: manejo de ítems y compartición entre usuarios.
- **Búsqueda dinámica de usuarios**: búsqueda con debounce y navegación por resultados con teclado.
- **Paginación avanzada**: componente reutilizable para manejar paginación con señales vinculadas.

---

## Detalles del Desarrollo

- **Framework:** Angular 20 con *standalone components* para mayor modularidad.
- **Estado reactivo:** Uso extensivo de `signal`, `computed` y `toSignal` para manejo reactivo de datos.
- **Comunicación HTTP:** Servicios inyectables con `HttpClient`, que incluyen caché local para minimizar llamadas redundantes.
- **RxJS:** Integración con operadores para manejo de flujos asíncronos, por ejemplo en búsqueda y autenticación.
- **Formularios reactivos:** Para validación y edición de productos, con manejo de errores personalizado.
- **Componentes personalizados:** Ejemplo destacado con `UserSearchComponent` que permite búsqueda con manejo de teclado y filtrado excluyendo usuario actual.
- **Routing:** Uso de rutas y recursos reactivos para cargar datos asociados a rutas dinámicas.

---

## Bibliotecas de terceros

- Angular core y common modules.
- RxJS para manejo de streams y operadores.
- `@angular/forms` para formularios reactivos.
- Herramientas propias de Angular 20 como `@angular/core/rxjs-interop` para integración Signals-RxJS.
- El backend utilizado en este proyecto fue desarrollado por [Fernando Herrera](https://github.com/klerith), tomado de GitHub y se integra mediante servicios HTTP RESTful.
- Se utilizaron las librerías externas Tailwind y DaisyUI para UI y componentes.

---

## Manual / Instrucciones de Uso

1. **Inicio de sesión y registro**: Los usuarios pueden registrarse y autenticarse mediante email y contraseña. El sistema almacena token JWT localmente para mantener la sesión.
2. **Explorar productos**: En la página principal, los productos se cargan paginados. Los usuarios pueden navegar entre páginas y filtrar productos por género.
3. **Detalle de producto**: Al seleccionar un producto, se muestra información detallada, galería de imágenes y opciones para editar (si el usuario tiene permisos).
4. **Administración de productos**: Los administradores pueden crear, editar, subir imágenes y eliminar productos desde la interfaz administrativa.
5. **Carrito de compras**: Los usuarios pueden agregar productos al carrito, modificar cantidades, eliminar productos y compartir el carrito con otros usuarios registrados.
6. **Búsqueda avanzada**: La búsqueda de usuarios se activa al ingresar al menos 2 caracteres, mostrando resultados en tiempo real y permitiendo selección mediante teclado o mouse.

---

## Notas Finales

Este proyecto pone énfasis en la reactividad nativa de Angular y la integración fluida con RxJS para construir una aplicación escalable y mantenible. Se priorizó la usabilidad con componentes reutilizables y una experiencia de usuario limpia y responsiva.

---

**Autor:** Félix Fernández Rolón  
**Fecha:** 23 de julio de 2025  
