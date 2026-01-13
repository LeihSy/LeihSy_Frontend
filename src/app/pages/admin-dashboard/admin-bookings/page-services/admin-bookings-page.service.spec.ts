import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AdminBookingsPageService } from './admin-bookings-page.service';
import { BookingService } from '../../../../services/booking.service';
import { Booking, BookingStatus } from '../../../../models/booking.model';

describe('AdminBookingsPageService', () => {
  let service: AdminBookingsPageService;
  let bookingService: jasmine.SpyObj<BookingService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  const mockBooking: Booking = {
    id: 1,
    userId: 1,
    userName: 'Test User',
    productId: 1,
    productName: 'Test Product',
    itemId: 1,
    itemInvNumber: 'INV001',
    lenderId: 1,
    lenderName: 'Test Lender',
    status: 'PENDING' as BookingStatus,
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    createdAt: '2024-01-10T10:00:00',
    updatedAt: '2024-01-10T10:00:00',
    proposalById: 1,
    proposalByName: 'Test User',
    message: '',
    proposedPickups: '',
    confirmedPickup: '',
    distributionDate: '',
    returnDate: ''
  };

  beforeEach(() => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getAllBookings', 'getBookings']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminBookingsPageService,
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AdminBookingsPageService);
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAllBookings', () => {
    it('should load all bookings successfully', () => {
      const mockBookings: Booking[] = [mockBooking];
      bookingService.getAllBookings.and.returnValue(of(mockBookings));

      service.loadAllBookings();

      expect(service.isLoading()).toBe(false);
      expect(service.bookings()).toEqual(mockBookings);
      expect(bookingService.getAllBookings).toHaveBeenCalled();
    });

    it('should handle error when loading bookings fails', () => {
      const error = new Error('Failed to load');
      bookingService.getAllBookings.and.returnValue(throwError(() => error));

      service.loadAllBookings();

      expect(service.isLoading()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        summary: 'Fehler'
      }));
    });
  });

  describe('loadOverdueBookings', () => {
    it('should load overdue bookings successfully', () => {
      const overdueBookings: Booking[] = [{ ...mockBooking, status: 'PICKED_UP' as BookingStatus }];
      bookingService.getBookings.and.returnValue(of(overdueBookings));

      service.loadOverdueBookings();

      expect(service.overdueBookings()).toEqual(overdueBookings);
      expect(bookingService.getBookings).toHaveBeenCalledWith('overdue');
    });

    it('should handle error when loading overdue bookings fails', () => {
      const error = new Error('Failed to load');
      bookingService.getBookings.and.returnValue(throwError(() => error));

      service.loadOverdueBookings();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Die überfälligen Buchungen konnten nicht geladen werden.'
      });
    });
  });

  describe('computed signals', () => {
    it('should filter current loans correctly', () => {
      const pickedUpBooking = { ...mockBooking, status: 'PICKED_UP' as BookingStatus };
      service.bookings.set([mockBooking, pickedUpBooking]);

      expect(service.currentLoans()).toEqual([pickedUpBooking]);
    });

    it('should filter open requests correctly', () => {
      const pendingBooking = { ...mockBooking, status: 'PENDING' as BookingStatus };
      service.bookings.set([mockBooking, pendingBooking]);

      expect(service.openRequests()).toEqual([mockBooking, pendingBooking]);
    });

    it('should filter confirmed not picked up correctly', () => {
      const confirmedBooking = { ...mockBooking, status: 'CONFIRMED' as BookingStatus };
      service.bookings.set([mockBooking, confirmedBooking]);

      expect(service.confirmedNotPickedUp()).toEqual([confirmedBooking]);
    });
  });

  describe('setView', () => {
    it('should set selected view and clear search query', () => {
      service.searchQuery.set('test');

      service.setView('current');

      expect(service.selectedView()).toBe('current');
      expect(service.searchQuery()).toBe('');
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity for CONFIRMED', () => {
      expect(service.getStatusSeverity('CONFIRMED')).toBe('success');
    });

    it('should return correct severity for PENDING', () => {
      expect(service.getStatusSeverity('PENDING')).toBe('warn');
    });

    it('should return correct severity for REJECTED', () => {
      expect(service.getStatusSeverity('REJECTED')).toBe('danger');
    });

    it('should return secondary for null status', () => {
      expect(service.getStatusSeverity(null)).toBe('secondary');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for PENDING', () => {
      expect(service.getStatusLabel('PENDING')).toBe('Ausstehend');
    });

    it('should return correct label for CONFIRMED', () => {
      expect(service.getStatusLabel('CONFIRMED')).toBe('Bestätigt');
    });

    it('should return "Storniert" for null status', () => {
      expect(service.getStatusLabel(null)).toBe('Storniert');
    });
  });

  describe('onBookingRowClick', () => {
    it('should navigate to booking detail page', () => {
      service.onBookingRowClick(mockBooking);

      expect(router.navigate).toHaveBeenCalledWith(['/admin/bookings', mockBooking.id]);
    });
  });

  describe('refreshData', () => {
    it('should call loadAllBookings and loadOverdueBookings', () => {
      spyOn(service, 'loadAllBookings');
      spyOn(service, 'loadOverdueBookings');

      service.refreshData();

      expect(service.loadAllBookings).toHaveBeenCalled();
      expect(service.loadOverdueBookings).toHaveBeenCalled();
    });
  });
});

