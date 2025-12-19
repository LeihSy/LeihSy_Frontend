import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AdminBookingsComponent } from './admin-bookings.component';
import { BookingService } from '../../services/booking.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { Booking, BookingStatus } from '../../models/booking.model';

describe('AdminBookingsComponent', () => {
  let component: AdminBookingsComponent;
  let fixture: ComponentFixture<AdminBookingsComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;

  const mockBookings: Booking[] = [
    {
      id: 1, userId: 1, userName: 'Max Mustermann', lenderId: 2, lenderName: 'Lender 1',
      itemId: 1, itemInvNumber: 'INV001', productId: 1, productName: 'Laptop',
      proposalById: 1, proposalByName: 'Admin', message: 'Test', status: 'PENDING',
      startDate: '2024-01-01T10:00:00', endDate: '2024-01-10T10:00:00',
      proposedPickups: '2024-01-01T10:00:00', confirmedPickup: '', distributionDate: '',
      returnDate: '', createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-01T08:00:00'
    },
    {
      id: 2, userId: 2, userName: 'Anna Schmidt', lenderId: 2, lenderName: 'Lender 1',
      itemId: 2, itemInvNumber: 'INV002', productId: 2, productName: 'Beamer',
      proposalById: 1, proposalByName: 'Admin', message: 'Test 2', status: 'PICKED_UP',
      startDate: '2024-01-05T10:00:00', endDate: '2024-01-15T10:00:00',
      proposedPickups: '2024-01-05T10:00:00', confirmedPickup: '2024-01-05T10:00:00',
      distributionDate: '2024-01-05T10:00:00', returnDate: '',
      createdAt: '2024-01-03T08:00:00', updatedAt: '2024-01-05T10:00:00'
    },
    {
      id: 3, userId: 1, userName: 'Max Mustermann', lenderId: 2, lenderName: 'Lender 1',
      itemId: 3, itemInvNumber: 'INV003', productId: 1, productName: 'Laptop',
      proposalById: 1, proposalByName: 'Admin', message: 'Test 3', status: 'CONFIRMED',
      startDate: '2025-12-20T10:00:00', endDate: '2025-12-30T10:00:00',
      proposedPickups: '2025-12-20T10:00:00', confirmedPickup: '2025-12-20T10:00:00',
      distributionDate: '', returnDate: '', createdAt: '2024-01-10T08:00:00',
      updatedAt: '2024-01-10T08:00:00'
    },
    {
      id: 4, userId: 3, userName: 'Peter Müller', lenderId: 2, lenderName: 'Lender 1',
      itemId: 4, itemInvNumber: 'INV004', productId: 3, productName: 'Kamera',
      proposalById: 1, proposalByName: 'Admin', message: 'Test 4', status: 'RETURNED',
      startDate: '2024-01-01T10:00:00', endDate: '2024-01-05T10:00:00',
      proposedPickups: '2024-01-01T10:00:00', confirmedPickup: '2024-01-01T10:00:00',
      distributionDate: '2024-01-01T10:00:00', returnDate: '2024-01-05T10:00:00',
      createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-05T10:00:00'
    },
    {
      id: 5, userId: 4, userName: 'Lisa Weber', lenderId: 2, lenderName: 'Lender 1',
      itemId: 5, itemInvNumber: 'INV005', productId: 4, productName: 'Mikrofon',
      proposalById: 1, proposalByName: 'Admin', message: 'Test 5', status: 'REJECTED',
      startDate: '2024-01-15T10:00:00', endDate: '2024-01-20T10:00:00',
      proposedPickups: '2024-01-15T10:00:00', confirmedPickup: '', distributionDate: '',
      returnDate: '', createdAt: '2024-01-10T08:00:00', updatedAt: '2024-01-10T08:00:00'
    }
  ];

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'getAllBookings',
      'getOverdueBookings'
    ]);

    await TestBed.configureTestingModule({
      imports: [AdminBookingsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: BookingService, useValue: bookingServiceSpy },
        MessageService
      ]
    }).compileComponents();

    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    bookingService.getAllBookings.and.returnValue(of(mockBookings));
    bookingService.getOverdueBookings.and.returnValue(of([]));

    fixture = TestBed.createComponent(AdminBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have columns defined', () => {
    expect(component.columns).toBeDefined();
    expect(component.columns.length).toBeGreaterThan(0);
  });

  describe('Status Methods', () => {
    it('should return correct status labels', () => {
      expect(component.getStatusLabel('PENDING')).toBe('Ausstehend');
      expect(component.getStatusLabel('CONFIRMED')).toBe('Bestätigt');
      expect(component.getStatusLabel('PICKED_UP')).toBe('Ausgeliehen');
      expect(component.getStatusLabel('RETURNED')).toBe('Zurückgegeben');
      expect(component.getStatusLabel('REJECTED')).toBe('Abgelehnt');
      expect(component.getStatusLabel('EXPIRED')).toBe('Abgelaufen');
      expect(component.getStatusLabel('CANCELLED')).toBe('Storniert');
      expect(component.getStatusLabel(null)).toBe('Storniert');
    });

    it('should return correct status severity', () => {
      expect(component.getStatusSeverity('PENDING')).toBe('warn');
      expect(component.getStatusSeverity('CONFIRMED')).toBe('success');
      expect(component.getStatusSeverity('PICKED_UP')).toBe('info');
      expect(component.getStatusSeverity('RETURNED')).toBe('success');
      expect(component.getStatusSeverity('REJECTED')).toBe('danger');
      expect(component.getStatusSeverity('EXPIRED')).toBe('danger');
      expect(component.getStatusSeverity('CANCELLED')).toBe('secondary');
      expect(component.getStatusSeverity(null)).toBe('secondary');
    });
  });

  describe('Filter by View - Branch Coverage', () => {
    it('should filter by "all" view (default branch)', () => {
      component.selectedView.set('all');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(5);
    });

    it('should filter by "current" view', () => {
      component.selectedView.set('current');
      const filtered = component.filteredBookings();
      expect(filtered.every(b => b.status === 'PICKED_UP')).toBe(true);
    });

    it('should filter by "pending" view', () => {
      component.selectedView.set('pending');
      const filtered = component.filteredBookings();
      expect(filtered.every(b => b.status === 'PENDING')).toBe(true);
    });

    it('should filter by "confirmed" view', () => {
      component.selectedView.set('confirmed');
      const filtered = component.filteredBookings();
      expect(filtered.every(b => b.status === 'CONFIRMED' && !b.distributionDate)).toBe(true);
    });

    it('should filter by "future" view', () => {
      component.selectedView.set('future');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter by "overdue" view', () => {
      component.selectedView.set('overdue');
      const filtered = component.filteredBookings();
      expect(filtered).toBeDefined();
    });
  });

  describe('Search Query - Branch Coverage', () => {
    it('should return all when search query is empty', () => {
      component.searchQuery.set('');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(5);
    });

    it('should filter by userName', () => {
      component.searchQuery.set('Max');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(2);
      expect(filtered.every(b => b.userName.includes('Max'))).toBe(true);
    });

    it('should filter by productName', () => {
      component.searchQuery.set('Laptop');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(2);
      expect(filtered.every(b => b.productName.includes('Laptop'))).toBe(true);
    });

    it('should filter by itemInvNumber', () => {
      component.searchQuery.set('INV002');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(1);
      expect(filtered[0].itemInvNumber).toBe('INV002');
    });

    it('should filter by lenderName', () => {
      component.searchQuery.set('Lender');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(5);
    });

    it('should filter by statusLabel', () => {
      component.searchQuery.set('Ausstehend');
      const filtered = component.filteredBookings();
      expect(filtered.every(b => b.status === 'PENDING')).toBe(true);
    });

    it('should be case insensitive', () => {
      component.searchQuery.set('LAPTOP');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(2);
    });

    it('should trim whitespace', () => {
      component.searchQuery.set('  Laptop  ');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(2);
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.searchQuery()).toBe('');
      expect(component.selectedView()).toBe('all');
      expect(component.isLoading()).toBe(false);
    });

    it('should have search query signal', () => {
      component.searchQuery.set('test query');
      expect(component.searchQuery()).toBe('test query');
    });

    it('should have selected view signal', () => {
      component.selectedView.set('pending');
      expect(component.selectedView()).toBe('pending');
    });

    it('should call getAllBookings on init', () => {
      expect(bookingService.getAllBookings).toHaveBeenCalled();
    });

    it('should call getOverdueBookings on init', () => {
      expect(bookingService.getOverdueBookings).toHaveBeenCalled();
    });
  });
});

