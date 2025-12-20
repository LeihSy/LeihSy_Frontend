import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { UserBookingsComponent } from './user-bookings.component';
import { BookingService } from '../../services/booking.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { Booking, BookingStatus } from '../../models/booking.model';

describe('UserBookingsComponent', () => {
  let component: UserBookingsComponent;
  let fixture: ComponentFixture<UserBookingsComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;

  const mockBookings: Booking[] = [
    {
      id: 1,
      userId: 1,
      userName: 'Test User',
      lenderId: 2,
      lenderName: 'Lender Name',
      itemId: 10,
      itemInvNumber: 'INV-001',
      productId: 5,
      productName: 'VR Headset',
      proposalById: 1,
      proposalByName: 'Admin',
      message: 'Test message',
      status: 'PENDING' as BookingStatus,
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-01-20T00:00:00Z',
      proposedPickups: '2024-01-15T10:00:00Z',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: '',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      userName: 'Test User',
      lenderId: 2,
      lenderName: 'Lender Name',
      itemId: 11,
      itemInvNumber: 'INV-002',
      productId: 6,
      productName: 'Laptop',
      proposalById: 1,
      proposalByName: 'Admin',
      message: 'Another test',
      status: 'CONFIRMED' as BookingStatus,
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-05T00:00:00Z',
      proposedPickups: '2024-02-01T10:00:00Z',
      confirmedPickup: '2024-02-01T10:00:00Z',
      distributionDate: '',
      returnDate: '',
      createdAt: '2024-01-25T00:00:00Z',
      updatedAt: '2024-01-25T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'getMyBookings',
      'getMyDeletedBookings'
    ]);

    await TestBed.configureTestingModule({
      imports: [UserBookingsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: BookingService, useValue: bookingServiceSpy },
        MessageService
      ]
    }).compileComponents();

    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    bookingService.getMyBookings.and.returnValue(of(mockBookings));
    bookingService.getMyDeletedBookings.and.returnValue(of([]));

    fixture = TestBed.createComponent(UserBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bookings on init', () => {
    expect(bookingService.getMyBookings).toHaveBeenCalled();
    expect(bookingService.getMyDeletedBookings).toHaveBeenCalled();
  });

  it('should return correct status severity', () => {
    expect(component.getStatusSeverity('PENDING')).toBe('warn');
    expect(component.getStatusSeverity('CONFIRMED')).toBe('success');
    expect(component.getStatusSeverity('PICKED_UP')).toBe('info');
    expect(component.getStatusSeverity('RETURNED')).toBe('success');
    expect(component.getStatusSeverity('REJECTED')).toBe('danger');
    expect(component.getStatusSeverity('EXPIRED')).toBe('danger');
    expect(component.getStatusSeverity('CANCELLED')).toBe('secondary');
  });

  it('should have columns defined', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBeGreaterThan(0);
  });
});

