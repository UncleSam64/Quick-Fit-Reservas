import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

type ViewState = 'loading' | 'error' | 'success';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class BookingListComponent implements OnInit {
  state: ViewState = 'loading';
  bookings: Booking[] = [];
  selectedBookingId: number | null = null;

  constructor(private readonly bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.state = 'loading';

    this.bookingService
      .getBookings()
      .pipe(
        catchError(() => {
          this.state = 'error';
          return of<Booking[]>([]);
        }),
      )
      .subscribe((bookings) => {
        if (this.state === 'error') {
          return;
        }
        this.bookings = bookings;
        this.state = 'success';
      });
  }

  onSelect(booking: Booking): void {
    this.selectedBookingId = booking.id;
    this.bookingService.selectBooking(booking);
  }
}
