import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingDetailComponent } from './booking-detail.component';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

describe('BookingDetailComponent', () => {
  let component: BookingDetailComponent;
  let fixture: ComponentFixture<BookingDetailComponent>;
  let service: BookingService;

  const mockBooking: Booking = {
    id: 1,
    className: 'Yoga',
    instructor: 'Laura Gómez',
    schedule: 'Lunes 18:00',
    availableSpots: 10,
  };

  const q = (testid: string) =>
    fixture.nativeElement.querySelector(`[data-testid="${testid}"]`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingDetailComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(BookingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ────────────────────────────────────────────────────

  it('should show the reserved-empty placeholder when no reservations exist', () => {
    expect(q('reserved-empty')).toBeTruthy();
    expect(q('reserved-section')).toBeFalsy();
  });

  it('should not show the detail modal when no booking is selected', () => {
    expect(q('detail-modal')).toBeFalsy();
  });

  // ── Modal de detalle ──────────────────────────────────────────────────

  it('should show the detail modal when a booking is selected', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(q('detail-modal')).toBeTruthy();
    expect(q('detail-modal-class').textContent).toContain('Yoga');
    expect(q('detail-modal-instructor').textContent).toContain('Laura Gómez');
    expect(q('detail-modal-schedule').textContent).toContain('Lunes 18:00');
  });

  it('should enable the reserve button when spots are available', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const btn = q('reserve-btn') as HTMLButtonElement;
    expect(btn.disabled).toBeFalse();
    expect(btn.textContent?.trim()).toBe('Reservar');
  });

  it('should disable the reserve button when no spots are available', async () => {
    service.selectBooking({ ...mockBooking, availableSpots: 0 });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((q('reserve-btn') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('should close the detail modal when the close button is clicked', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.onClose();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(q('detail-modal')).toBeFalsy();
    expect(component.reservationState).toBe('idle');
  });

  // ── Formulario de reserva ─────────────────────────────────────────────

  it('should not submit and show errors when the form is empty', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.onReserve(mockBooking);
    fixture.detectChanges();

    expect(component.reservationForm.invalid).toBeTrue();
    expect(component.reservationState).toBe('idle');
  });

  it('should show nombre error when field is touched and empty', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.reservationForm.get('nombre')!.markAsTouched();
    fixture.detectChanges();

    expect(q('error-nombre')).toBeTruthy();
  });

  it('should show telefono error when field is touched and invalid', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.reservationForm.get('telefono')!.setValue('abc');
    component.reservationForm.get('telefono')!.markAsTouched();
    fixture.detectChanges();

    expect(q('error-telefono')).toBeTruthy();
  });

  it('should submit and open confirmation modal when form is valid', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.reservationForm.setValue({ nombre: 'María García', telefono: '1123456789' });
    component.onReserve(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(q('confirmation-modal')).toBeTruthy();
    expect(q('confirmation-name').textContent).toContain('María García');
    expect(q('confirmation-class').textContent).toContain('Yoga');
  });

  it('should reset the form after a successful reservation', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.reservationForm.setValue({ nombre: 'María García', telefono: '1123456789' });
    component.onReserve(mockBooking);
    fixture.detectChanges();

    expect(component.reservationForm.value.nombre).toBeNull();
    expect(component.reservationForm.value.telefono).toBeNull();
  });

  // ── Modal de confirmación ─────────────────────────────────────────────

  it('should close the confirmation modal and reset state when accepted', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.reservationForm.setValue({ nombre: 'María García', telefono: '1123456789' });
    component.onReserve(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.onCloseModal();
    fixture.detectChanges();

    expect(q('confirmation-modal')).toBeFalsy();
    expect(component.reservationState).toBe('idle');
    expect(component.confirmedName).toBe('');
  });

  // ── Panel de reservas ─────────────────────────────────────────────────

  it('should show the reserved section after a successful reservation', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.reservationForm.setValue({ nombre: 'María García', telefono: '1123456789' });
    component.onReserve(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(q('reserved-section')).toBeTruthy();
    expect(q('reserved-item-1')).toBeTruthy();
  });

  it('should remove the reserved item and restore the spot when cancelled', async () => {
    service.selectBooking(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.reservationForm.setValue({ nombre: 'María García', telefono: '1123456789' });
    component.onReserve(mockBooking);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component.onCancelReservation(mockBooking.id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(q('reserved-item-1')).toBeFalsy();
    expect(q('reserved-empty')).toBeTruthy();

    let restoredSpots = 0;
    service.getBookings().subscribe((b) => {
      restoredSpots = b.find((x) => x.id === mockBooking.id)!.availableSpots;
    });
    expect(restoredSpots).toBe(mockBooking.availableSpots);
  });
});
