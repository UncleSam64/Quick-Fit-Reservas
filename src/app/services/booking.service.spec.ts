import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { Booking } from '../models/booking.model';

describe('BookingService', () => {
  let service: BookingService;

  const mockBooking: Booking = {
    id: 1,
    className: 'Yoga',
    instructor: 'Laura Gómez',
    schedule: 'Lunes 18:00',
    availableSpots: 10,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the list of mock bookings', (done) => {
    service.getBookings().subscribe((bookings) => {
      expect(bookings.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should start with no booking selected', (done) => {
    service.selectedBooking$.subscribe((booking) => {
      expect(booking).toBeNull();
      done();
    });
  });

  it('should emit the selected booking to subscribers', (done) => {
    service.selectBooking(mockBooking);

    service.selectedBooking$.subscribe((booking) => {
      expect(booking).toEqual(mockBooking);
      done();
    });
  });

  it('should clear the selection', (done) => {
    service.selectBooking(mockBooking);
    service.clearSelection();

    service.selectedBooking$.subscribe((booking) => {
      expect(booking).toBeNull();
      done();
    });
  });

  it('should decrement available spots when reserving', (done) => {
    service.reserveSpot(mockBooking).subscribe((updated) => {
      expect(updated.availableSpots).toBe(9);
      done();
    });
  });

  it('should update the booking in the main list after reserving', (done) => {
    service.reserveSpot(mockBooking).subscribe(() => {
      service.getBookings().subscribe((bookings) => {
        const updated = bookings.find((b) => b.id === mockBooking.id);
        expect(updated?.availableSpots).toBe(9);
        done();
      });
    });
  });

  it('should add the booking to the reserved list after reserving', (done) => {
    service.reserveSpot(mockBooking).subscribe(() => {
      service.reservedBookings$.subscribe((reserved) => {
        expect(reserved.length).toBe(1);
        expect(reserved[0].id).toBe(mockBooking.id);
        done();
      });
    });
  });

  it('should never let available spots go below zero', (done) => {
    const fullBooking: Booking = { ...mockBooking, availableSpots: 0 };

    service.reserveSpot(fullBooking).subscribe((updated) => {
      expect(updated.availableSpots).toBe(0);
      done();
    });
  });
});
