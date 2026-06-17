import { Component } from '@angular/core';
import { BookingListComponent } from './components/booking-list/booking-list.component';
import { BookingDetailComponent } from './components/booking-detail/booking-detail.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingListComponent, BookingDetailComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
