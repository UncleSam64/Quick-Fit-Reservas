# Quick Fit - Reservaciones

Prueba técnica Frontend (Angular) — sistema de reservas de turnos para un gimnasio. Permite visualizar el listado de clases disponibles, ver el detalle de una clase y simular la reserva de un cupo.

---

## Instalacion y ejecucion

```bash
npm install
ng serve
```

La aplicacion queda disponible en `http://localhost:4200/`.

### Versiones utilizadas

| Herramienta  | Version  |
| ------------ | -------- |
| Node.js      | 22.22.3+ |
| Angular CLI  | 22.0.x   |
| Angular      | 22.0.x   |
| TypeScript   | 6.0.x    |

---

## Arquitectura de componentes

```
AppComponent (layout principal, grilla responsiva de 2 columnas)
├── BookingListComponent   → listado de clases (tarjetas) + estados loading/error/empty
└── BookingDetailComponent → panel de reservas confirmadas + modales de detalle y confirmacion
```

- **AppComponent**: define el shell de la pagina (header + grilla) y compone los dos componentes de feature. No tiene logica de negocio.
- **BookingListComponent**: expone un observable `vm$` que combina el estado de UI (`loading` / `error` / `success`) y la lista de clases en un unico stream. El template se suscribe con `async` pipe, lo que garantiza que el contador de cupos se actualiza en tiempo real cuando otro componente confirma una reserva. Al hacer clic en "Ver mas" notifica la seleccion al servicio.
- **BookingDetailComponent**: muestra el panel "Tus reservas" en la columna derecha. Al seleccionar una clase abre un modal con el detalle y un formulario para ingresar nombre y telefono. Al confirmar la reserva, abre un popup de confirmacion. Permite cancelar reservas existentes.

Carpetas organizadas por tipo (`components/`, `services/`, `models/`, `interceptors/`), con un componente por carpeta junto a su template y estilos.

---

## Estrategia de comunicacion entre componentes

Se eligio un **servicio compartido con `BehaviorSubject`** en lugar de `@Input()`/`@Output()`.

Por que:

- `BookingListComponent` y `BookingDetailComponent` son hermanos en el arbol de componentes (ambos hijos directos de `AppComponent`), no padre-hijo. Comunicarlos con `@Input()`/`@Output()` hubiera requerido subir el estado a `AppComponent` y bajarlo de nuevo, agregando una capa intermedia sin responsabilidad propia.
- Un `BehaviorSubject` mantiene el ultimo valor emitido, de modo que cualquier componente que se suscriba tarde igual recibe el valor actual.
- El mismo mecanismo se reutiliza para tres streams independientes: la clase seleccionada (`selectedBooking$`), el listado completo (`bookingsSubject`) y las reservas del usuario (`reservedBookings$`).

Ambos templates se suscriben con el pipe `async`, evitando suscripciones manuales y el manejo explicito de `unsubscribe`. Esto es especialmente importante para `BookingListComponent`: dado que el evento de reserva ocurre en su componente hermano (`BookingDetailComponent`), una suscripcion manual no dispara el ciclo de change detection en Angular 22; el `async` pipe resuelve esto llamando a `markForCheck()` internamente cada vez que llega un nuevo valor.

---

## Simulacion de la API

El `BookingService` mantiene el estado de las clases en un `BehaviorSubject<Booking[]>` inicializado con datos mock. `getBookings()` devuelve ese observable directamente, lo que permite que la lista reaccione en tiempo real cuando `reserveSpot()` o `cancelReservation()` actualizan los cupos.

El archivo `src/app/interceptors/booking-mock.interceptor.ts` queda como referencia de la alternativa con HTTP Interceptor; no esta activo en la configuracion actual.

---

## Modelo de datos

```ts
interface Booking {
  id: number;
  className: string;
  instructor: string;
  schedule: string;
  availableSpots: number;
}
```

---

## Formulario de reserva

Al seleccionar una clase se abre un modal con un Reactive Form que solicita:

| Campo            | Validaciones                                      |
| ---------------- | ------------------------------------------------- |
| Nombre completo  | Requerido, minimo 2 caracteres                    |
| Telefono         | Requerido, 7-15 digitos (acepta +, espacios, -)   |

El boton "Reservar" activa la validacion al hacer clic. Si el formulario es invalido no avanza. Al confirmar, el popup muestra el nombre del reservante y el formulario se resetea.

---

## Tests unitarios

```bash
ng test
```

Cobertura actual:

| Archivo                              | Casos cubiertos                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `booking.service.spec.ts`            | creacion, getBookings, selectedBooking$, selectBooking, clearSelection, reserveSpot (actualizacion de lista y panel), cancelReservation, spots minimo cero |
| `booking-list.component.spec.ts`     | estado loading (Subject sin emitir) / success / error / empty, contadores de cupos, seleccion de tarjeta   |
| `booking-detail.component.spec.ts`   | modal de detalle, validacion del form, errores por campo, reserva exitosa, confirmacion, cancelacion, restauracion de cupos |
| `app.component.spec.ts`              | creacion, titulo, presencia de componentes hijos                                |

---

## Atributos data-testid para pruebas E2E (Selenium / Playwright)

Todos los elementos interactivos e informativos clave tienen un atributo `data-testid` estatico para facilitar la seleccion desde pruebas de integracion sin depender de clases CSS o estructura del DOM.

### BookingListComponent

| data-testid              | Elemento                                      |
| ------------------------ | --------------------------------------------- |
| `booking-list`           | Contenedor principal del listado              |
| `state-loading`          | Panel de carga                                |
| `state-error`            | Panel de error                                |
| `state-empty`            | Panel de lista vacia                          |
| `retry-btn`              | Boton "Reintentar"                            |
| `booking-card-{id}`      | Tarjeta de cada clase (ej. `booking-card-1`)  |
| `booking-spots-{id}`     | Contador de cupos de cada tarjeta             |
| `select-btn-{id}`        | Boton "Ver mas" de cada tarjeta               |

### BookingDetailComponent

| data-testid              | Elemento                                      |
| ------------------------ | --------------------------------------------- |
| `reserved-empty`         | Placeholder cuando no hay reservas            |
| `reserved-section`       | Panel "Tus reservas"                          |
| `reserved-item-{id}`     | Fila de cada reserva confirmada               |
| `cancel-btn-{id}`        | Boton "Cancelar" de cada reserva              |
| `detail-modal`           | Modal de detalle de la clase                  |
| `detail-modal-close`     | Boton de cierre del modal de detalle          |
| `detail-modal-class`     | Nombre de la clase en el modal                |
| `detail-modal-instructor`| Nombre del instructor                         |
| `detail-modal-schedule`  | Horario de la clase                           |
| `detail-modal-spots`     | Cupos disponibles en el modal                 |
| `form-nombre`            | Input de nombre completo                      |
| `form-telefono`          | Input de telefono                             |
| `error-nombre`           | Mensaje de error del campo nombre             |
| `error-telefono`         | Mensaje de error del campo telefono           |
| `reserve-btn`            | Boton "Reservar" (submit del form)            |
| `confirmation-modal`     | Popup de confirmacion de reserva              |
| `confirmation-name`      | Nombre del reservante en la confirmacion      |
| `confirmation-class`     | Nombre de la clase en la confirmacion         |
| `confirmation-schedule`  | Horario en la confirmacion                    |
| `confirmation-accept`    | Boton "Aceptar" del popup de confirmacion     |

### Ejemplo de uso en Selenium (Python)

```python
driver.find_element(By.CSS_SELECTOR, '[data-testid="select-btn-1"]').click()
driver.find_element(By.CSS_SELECTOR, '[data-testid="form-nombre"]').send_keys("Maria Garcia")
driver.find_element(By.CSS_SELECTOR, '[data-testid="form-telefono"]').send_keys("1123456789")
driver.find_element(By.CSS_SELECTOR, '[data-testid="reserve-btn"]').click()
assert driver.find_element(By.CSS_SELECTOR, '[data-testid="confirmation-modal"]').is_displayed()
```

---

## Decisiones de diseno

Paleta oscura con acento lima como color de accion/datos, tipografia `Oswald` (display, condensada, estilo cartel deportivo) + `Inter` (cuerpo) + `Roboto Mono` (numeros de cupos y horarios). El conteo de cupos disponibles se muestra como un numero grande tipo contador deportivo en cada tarjeta, cambiando de color cuando la clase esta llena.

Layout en grilla de 2 columnas desde 768px (listado + panel de reservas lado a lado). En pantallas mas chicas el panel se apila debajo del listado.

La reserva es completamente simulada en memoria — decrementa `availableSpots` en el `BehaviorSubject` local, sin persistencia real, tal como pide el enunciado. No se uso ninguna libreria de UI: todo el diseno esta resuelto con HTML + SCSS puro, usando variables CSS (`:root`) como sistema de design tokens.
