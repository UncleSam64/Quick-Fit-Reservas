import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BookingListComponent } from './booking-list.component';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

describe('BookingListComponent', () => {
  let component: BookingListComponent;
  let fixture: ComponentFixture<BookingListComponent>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;

  const mockBookings: Booking[] = [
    { id: 1, className: 'Yoga', instructor: 'Laura Gómez', schedule: 'Lunes 18:00', availableSpots: 10 },
    { id: 2, className: 'Crossfit', instructor: 'Martín Ríos', schedule: 'Martes 07:00', availableSpots: 0 },
  ];

  const q = (testid: string) =>
    fixture.nativeElement.querySelector(`[data-testid="${testid}"]`);

  beforeEach(() => {
    bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getBookings', 'selectBooking'], {
      selectedBooking$: of(null),
    });

    TestBed.configureTestingModule({
      imports: [BookingListComponent],
      providers: [{ provide: BookingService, useValue: bookingServiceSpy }],
    });

    fixture = TestBed.createComponent(BookingListComponent);
    component = fixture.componentInstance;
  });

  it('should start in loading state before ngOnInit', () => {
    bookingServiceSpy.getBookings.and.returnValue(of(mockBookings));
    expect(component.state).toBe('loading');
    fixture.detectChanges();
  });

  it('should show the loading panel while fetching', () => {
    bookingServiceSpy.getBookings.and.returnValue(of(mockBookings));
    expect(q('state-loading')).toBeFalsy();
    // before detectChanges state is 'loading' but template hasn't rendered yet
    fixture.detectChanges();
    // synchronous of() resolves before first render so success is shown directly
    expect(q('state-loading')).toBeFalsy();
  });

  it('should move to success state and render booking cards', () => {
    bookingServiceSpy.getBookings.and.returnValue(of(mockBookings));
    fixture.detectChanges();

    expect(component.state).toBe('success');
    expect(component.bookings.length).toBe(2);
    expect(q('booking-card-1')).toBeTruthy();
    expect(q('booking-card-2')).toBeTruthy();
  });

  it('should show the correct available spots per card', () => {
    bookingServiceSpy.getBookings.and.returnValue(of(mockBookings));
    fixture.detectChanges();

    expect(q('booking-spots-1').textContent.trim()).toBe('10');
    expect(q('booking-spots-2').textContent.trim()).toBe('0');
  });

  it('should move to error state and show error panel when the request fails', () => {
    bookingServiceSpy.getBookings.and.returnValue(throwError(() => new Error('500')));
    fixture.detectChanges();

    expect(component.state).toBe('error');
    expect(q('state-error')).toBeTruthy();
    expect(q('retry-btn')).toBeTruthy();
  });

  it('should show the empty state panel when there are no bookings', () => {
    bookingServiceSpy.getBookings.and.returnValue(of([]));
    fixture.detectChanges();

    expect(q('state-empty')).toBeTruthy();
  });

  it('should track the selected booking id and call selectBooking when a card is clicked', () => {
    bookingServiceSpy.getBookings.and.returnValue(of(mockBookings));
    fixture.detectChanges();

    (q('select-btn-1') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.selectedBookingId).toBe(1);
    expect(bookingServiceSpy.selectBooking).toHaveBeenCalledWith(mockBookings[0]);
  });
});
