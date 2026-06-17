import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { Booking } from '../models/booking.model';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    className: 'Yoga',
    instructor: 'Laura Gómez',
    schedule: 'Lunes 18:00',
    availableSpots: 10,
  },
  {
    id: 2,
    className: 'Crossfit',
    instructor: 'Martín Ríos',
    schedule: 'Martes 07:00',
    availableSpots: 4,
  },
  {
    id: 3,
    className: 'Spinning',
    instructor: 'Carla Fernández',
    schedule: 'Miércoles 19:30',
    availableSpots: 0,
  },
  {
    id: 4,
    className: 'Pilates',
    instructor: 'Sofía Méndez',
    schedule: 'Jueves 09:00',
    availableSpots: 8,
  },
];

/**
 * Intercepta las peticiones a `/api/bookings` y devuelve datos mockeados,
 * simulando la latencia de una API real. Evita la necesidad de un backend
 * o de json-server para esta prueba técnica.
 */
export const bookingMockInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/api/bookings') && req.method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: MOCK_BOOKINGS,
      }),
    ).pipe(delay(800));
  }

  return next(req);
};
