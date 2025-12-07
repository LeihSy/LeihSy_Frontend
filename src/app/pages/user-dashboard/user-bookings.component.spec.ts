import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { UserBookingsComponent } from './user-bookings.component';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Booking, BookingStatus } from '../../models/booking.model';
import { User } from '../../models/user.model';

describe('UserBookingsComponent', () => {
  let component: UserBookingsComponent;
  let fixture: ComponentFixture<UserBookingsComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockKeycloakId = 'test-keycloak-id-123';
  const mockUser: User = {
    id: 1,
    uniqueId: mockKeycloakId,
    name: 'Test User',
    budget: 1000
  };

  const mockBookings: Booking[] = [
    {
      id: 1,
      userId: 1,
      userName: 'Test User',
      receiverId: 2,
      receiverName: 'Receiver Name',
      itemId: 10,
      itemInvNumber: 'INV-001',
      productId: 5,
      productName: 'VR Headset',
      message: 'Test message',
      status: 'PENDING' as BookingStatus,
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-01-20T00:00:00Z',
      proposalPickup: '2024-01-15T10:00:00Z',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: '',
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      userName: 'Test User',
      receiverId: 2,
      receiverName: 'Receiver Name',
      itemId: 11,
      itemInvNumber: 'INV-002',
      productId: 6,
      productName: 'Laptop',
      message: 'Another test',
      status: 'CONFIRMED' as BookingStatus,
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-05T00:00:00Z',
      proposalPickup: '2024-02-01T10:00:00Z',
      confirmedPickup: '2024-02-01T10:00:00Z',
      distributionDate: '',
      returnDate: '',
      createdAt: '2024-01-25T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'getBookingsByUserId',
      'cancelBooking'
    ]);
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getCurrentUser'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAdmin',
      'getUsername',
      'getUserId'
    ]);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [UserBookingsComponent, HttpClientTestingModule],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserBookingsComponent);
    component = fixture.componentInstance;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    confirmationService = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;

    authService.getUserId.and.returnValue(mockUser.id);
    userService.getCurrentUser.and.returnValue(of(mockUser));
    bookingService.getBookingsByUserId.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load current user via /me endpoint and bookings on init', () => {
      authService.getUserId.and.returnValue(mockUser.id);
      bookingService.getBookingsByUserId.and.returnValue(of(mockBookings));

      component.ngOnInit();

      expect(authService.getUserId).toHaveBeenCalled();
      expect(bookingService.getBookingsByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(component.bookings()).toEqual(mockBookings);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('filteredBookings', () => {
    beforeEach(() => {
      component.bookings.set(mockBookings);
    });

    it('should return all bookings when search query is empty', () => {
      component.searchQuery.set('');
      expect(component.filteredBookings()).toEqual(mockBookings);
    });

    it('should filter bookings by product name', () => {
      component.searchQuery.set('VR');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(1);
      expect(filtered[0].productName).toBe('VR Headset');
    });

    it('should filter bookings by inventory number', () => {
      component.searchQuery.set('INV-002');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(1);
      expect(filtered[0].itemInvNumber).toBe('INV-002');
    });

    it('should filter bookings by status', () => {
      component.searchQuery.set('CONFIRMED');
      const filtered = component.filteredBookings();
      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe('CONFIRMED');
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity for each status', () => {
      expect(component.getStatusSeverity('PENDING')).toBe('warn');
      expect(component.getStatusSeverity('CONFIRMED')).toBe('info');
      expect(component.getStatusSeverity('PICKED_UP')).toBe('success');
      expect(component.getStatusSeverity('RETURNED')).toBe('secondary');
      expect(component.getStatusSeverity('REJECTED')).toBe('danger');
      expect(component.getStatusSeverity('EXPIRED')).toBe('danger');
      expect(component.getStatusSeverity('CANCELLED')).toBe('contrast');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct German label for each status', () => {
      expect(component.getStatusLabel('PENDING')).toBe('Ausstehend');
      expect(component.getStatusLabel('CONFIRMED')).toBe('Bestätigt');
      expect(component.getStatusLabel('PICKED_UP')).toBe('Ausgeliehen');
      expect(component.getStatusLabel('RETURNED')).toBe('Zurückgegeben');
      expect(component.getStatusLabel('REJECTED')).toBe('Abgelehnt');
      expect(component.getStatusLabel('EXPIRED')).toBe('Abgelaufen');
      expect(component.getStatusLabel('CANCELLED')).toBe('Storniert');
    });
  });

  describe('canCancelBooking', () => {
    it('should return true for PENDING bookings', () => {
      const booking = { ...mockBookings[0], status: 'PENDING' as BookingStatus };
      expect(component.canCancelBooking(booking)).toBe(true);
    });

    it('should return true for CONFIRMED bookings', () => {
      const booking = { ...mockBookings[0], status: 'CONFIRMED' as BookingStatus };
      expect(component.canCancelBooking(booking)).toBe(true);
    });

    it('should return false for PICKED_UP bookings', () => {
      const booking = { ...mockBookings[0], status: 'PICKED_UP' as BookingStatus };
      expect(component.canCancelBooking(booking)).toBe(false);
    });

    it('should return false for RETURNED bookings', () => {
      const booking = { ...mockBookings[0], status: 'RETURNED' as BookingStatus };
      expect(component.canCancelBooking(booking)).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string to German format with time', () => {
      const result = component.formatDate('2024-01-15T10:30:00Z');
      expect(result).toContain('15.01.2024');
    });

    it('should return "-" for empty date string', () => {
      expect(component.formatDate('')).toBe('-');
    });
  });

  describe('formatDateShort', () => {
    it('should format ISO date string to German format without time', () => {
      const result = component.formatDateShort('2024-01-15T10:30:00Z');
      expect(result).toBe('15.01.2024');
    });

    it('should return "-" for empty date string', () => {
      expect(component.formatDateShort('')).toBe('-');
    });
  });
});

