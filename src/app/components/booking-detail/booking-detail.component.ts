import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

type ReservationState = 'idle' | 'confirmed';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss',
})
export class BookingDetailComponent {
  readonly booking$: Observable<Booking | null>;
  readonly reservedBookings$: Observable<Booking[]>;
  reservationState: ReservationState = 'idle';
  confirmedBooking: Booking | null = null;
  confirmedName = '';

  readonly reservationForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    telefono: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[+]?[\d\s\-]{7,15}$/),
    ]),
  });

  constructor(private readonly bookingService: BookingService) {
    this.booking$ = this.bookingService.selectedBooking$;
    this.reservedBookings$ = this.bookingService.reservedBookings$;
  }

  get nombreInvalid(): boolean {
    const c = this.reservationForm.get('nombre')!;
    return c.invalid && c.touched;
  }

  get telefonoInvalid(): boolean {
    const c = this.reservationForm.get('telefono')!;
    return c.invalid && c.touched;
  }

  onReserve(booking: Booking): void {
    if (booking.availableSpots === 0) return;

    this.reservationForm.markAllAsTouched();
    if (this.reservationForm.invalid) return;

    this.bookingService.reserveSpot(booking).subscribe((updated) => {
      this.confirmedBooking = updated;
      this.confirmedName = this.reservationForm.value.nombre ?? '';
      this.reservationState = 'confirmed';
      this.bookingService.clearSelection();
      this.reservationForm.reset();
    });
  }

  onCancelReservation(bookingId: number): void {
    this.bookingService.cancelReservation(bookingId);
  }

  onCloseModal(): void {
    this.reservationState = 'idle';
    this.confirmedBooking = null;
    this.confirmedName = '';
  }

  onClose(): void {
    this.reservationState = 'idle';
    this.confirmedBooking = null;
    this.confirmedName = '';
    this.reservationForm.reset();
    this.bookingService.clearSelection();
  }
}
