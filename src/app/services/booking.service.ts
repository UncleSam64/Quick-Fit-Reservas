import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly bookingsSubject = new BehaviorSubject<Booking[]>(MOCK_BOOKINGS);

  private readonly selectedBookingSubject = new BehaviorSubject<Booking | null>(null);
  readonly selectedBooking$: Observable<Booking | null> = this.selectedBookingSubject.asObservable();

  private readonly reservedBookingsSubject = new BehaviorSubject<Booking[]>([]);
  readonly reservedBookings$: Observable<Booking[]> = this.reservedBookingsSubject.asObservable();

  getBookings(): Observable<Booking[]> {
    return this.bookingsSubject.asObservable();
  }

  selectBooking(booking: Booking): void {
    this.selectedBookingSubject.next(booking);
  }

  clearSelection(): void {
    this.selectedBookingSubject.next(null);
  }

  cancelReservation(bookingId: number): void {
    const updatedList = this.bookingsSubject.value.map((b) =>
      b.id === bookingId ? { ...b, availableSpots: b.availableSpots + 1 } : b,
    );
    this.bookingsSubject.next(updatedList);

    const selected = this.selectedBookingSubject.value;
    if (selected?.id === bookingId) {
      const restored = updatedList.find((b) => b.id === bookingId) ?? null;
      this.selectedBookingSubject.next(restored);
    }

    this.reservedBookingsSubject.next(
      this.reservedBookingsSubject.value.filter((b) => b.id !== bookingId),
    );
  }

  reserveSpot(booking: Booking): Observable<Booking> {
    const updated: Booking = {
      ...booking,
      availableSpots: Math.max(booking.availableSpots - 1, 0),
    };

    // Actualiza el cupo en la lista principal
    this.bookingsSubject.next(
      this.bookingsSubject.value.map((b) => (b.id === updated.id ? updated : b)),
    );

    // Propaga el booking actualizado al panel de detalle
    this.selectedBookingSubject.next(updated);

    // Registra o actualiza la reserva del usuario
    const reserved = this.reservedBookingsSubject.value;
    const idx = reserved.findIndex((b) => b.id === updated.id);
    if (idx >= 0) {
      const next = [...reserved];
      next[idx] = updated;
      this.reservedBookingsSubject.next(next);
    } else {
      this.reservedBookingsSubject.next([...reserved, updated]);
    }

    return of(updated);
  }
}
