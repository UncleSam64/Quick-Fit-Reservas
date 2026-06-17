import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { BookingService } from './services/booking.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getBookings'], {
      selectedBooking$: of(null),
    });
    bookingServiceSpy.getBookings.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: BookingService, useValue: bookingServiceSpy }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the page title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('PulsoFit');
  });

  it('should render both the booking list and detail components', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-booking-list')).toBeTruthy();
    expect(compiled.querySelector('app-booking-detail')).toBeTruthy();
  });
});