import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

type ViewState = 'loading' | 'error' | 'success';

interface BookingListView {
  state: ViewState;
  bookings: Booking[];
}

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class BookingListComponent {
  selectedBookingId: number | null = null;

  private readonly retryTrigger$ = new BehaviorSubject<void>(undefined);

  readonly vm$: Observable<BookingListView> = this.retryTrigger$.pipe(
    switchMap(() =>
      this.bookingService.getBookings().pipe(
        map((bookings) => ({ state: 'success' as ViewState, bookings })),
        catchError(() => of({ state: 'error' as ViewState, bookings: [] })),
        startWith({ state: 'loading' as ViewState, bookings: [] }),
      ),
    ),
  );

  constructor(private readonly bookingService: BookingService) {}

  retry(): void {
    this.retryTrigger$.next();
  }

  onSelect(booking: Booking): void {
    this.selectedBookingId = booking.id;
    this.bookingService.selectBooking(booking);
  }
}
