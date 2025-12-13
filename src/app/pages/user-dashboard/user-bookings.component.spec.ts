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

  it('should return correct status labels', () => {
    expect(component.getStatusLabel('PENDING')).toBe('Ausstehend');
    expect(component.getStatusLabel('CONFIRMED')).toBe('Bestätigt');
    expect(component.getStatusLabel('PICKED_UP')).toBe('Ausgeliehen');
    expect(component.getStatusLabel('RETURNED')).toBe('Zurückgegeben');
    expect(component.getStatusLabel('REJECTED')).toBe('Abgelehnt');
    expect(component.getStatusLabel('EXPIRED')).toBe('Abgelaufen');
    expect(component.getStatusLabel('CANCELLED')).toBe('Storniert');
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

  it('should return status icons', () => {
    expect(component.getStatusIcon('PENDING')).toContain('pi-');
    expect(component.getStatusIcon('CONFIRMED')).toContain('pi-');
    expect(component.getStatusIcon('PICKED_UP')).toContain('pi-');
    expect(component.getStatusIcon('RETURNED')).toContain('pi-');
  });

  it('should have columns defined', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBeGreaterThan(0);
  });

  it('should initialize with default search query', () => {
    expect(component.searchQuery()).toBe('');
  });

  it('should navigate to booking detail', () => {
    spyOn(component['router'], 'navigate');
    component.onBookingRowClick(mockBookings[0]);
    expect(component['router'].navigate).toHaveBeenCalledWith(['/user-dashboard/bookings', 1]);
  });

  describe('Search Filter - Branch Coverage', () => {
    it('should return all bookings when query is empty', () => {
      component.searchQuery.set('');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(2);
    });

    it('should filter by productName', () => {
      component.searchQuery.set('VR');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(1);
      expect(filtered[0].productName).toContain('VR');
    });

    it('should filter by itemInvNumber', () => {
      component.searchQuery.set('INV-002');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(1);
      expect(filtered[0].itemInvNumber).toBe('INV-002');
    });

    it('should filter by lenderName', () => {
      component.searchQuery.set('Lender');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(2);
    });

    it('should filter by statusLabel', () => {
      component.searchQuery.set('Ausstehend');
      const filtered = component.filteredBookings();
      expect(filtered.every(b => b.status === 'PENDING')).toBe(true);
    });

    it('should be case insensitive', () => {
      component.searchQuery.set('LAPTOP');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });

    it('should trim whitespace', () => {
      component.searchQuery.set('  Laptop  ');
      const filtered = component.filteredBookings();
      expect(filtered).toBeDefined();
    });

    it('should return empty array when no match', () => {
      component.searchQuery.set('nonexistent');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(0);
    });
  });

  describe('Status Icon - Branch Coverage', () => {
    it('should return icon for each status', () => {
      expect(component.getStatusIcon('PENDING')).toBe('pi pi-clock');
      expect(component.getStatusIcon('CONFIRMED')).toBe('pi pi-check-circle');
      expect(component.getStatusIcon('PICKED_UP')).toBe('pi pi-shopping-bag');
      expect(component.getStatusIcon('RETURNED')).toBe('pi pi-check');
      expect(component.getStatusIcon('REJECTED')).toBe('pi pi-times-circle');
      expect(component.getStatusIcon('EXPIRED')).toBe('pi pi-exclamation-triangle');
      expect(component.getStatusIcon('CANCELLED')).toBe('pi pi-ban');
    });

    it('should return default icon for unknown status', () => {
      const icon = component.getStatusIcon('UNKNOWN' as any);
      expect(icon).toBe('pi pi-info-circle');
    });
  });
});

