import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AdminBookingDetailPageService } from './admin-booking-detail-page.service';
import { BookingService } from '../../../../services/booking.service';
import { Booking, BookingStatus } from '../../../../models/booking.model';

describe('AdminBookingDetailPageService', () => {
  let service: AdminBookingDetailPageService;
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
    status: 'CONFIRMED' as BookingStatus,
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    createdAt: '2024-01-10T10:00:00',
    updatedAt: '2024-01-11T14:30:00',
    confirmedPickup: '2024-01-15T09:00:00',
    distributionDate: '2024-01-15T09:30:00',
    returnDate: '',
    message: 'Test message',
    proposalById: 1,
    proposalByName: 'Test User',
    proposedPickups: ''
  };

  beforeEach(() => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getBookingById']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminBookingDetailPageService,
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AdminBookingDetailPageService);
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadBookingDetails', () => {
    it('should load booking details successfully', () => {
      bookingService.getBookingById.and.returnValue(of(mockBooking));

      service.loadBookingDetails(1);

      expect(service.isLoading()).toBe(false);
      expect(service.booking()).toEqual(mockBooking);
      expect(service.timelineEvents().length).toBeGreaterThan(0);
      expect(bookingService.getBookingById).toHaveBeenCalledWith(1);
    });

    it('should handle error when loading booking fails', () => {
      const error = new Error('Failed to load');
      bookingService.getBookingById.and.returnValue(throwError(() => error));
      spyOn(service, 'goBack');

      service.loadBookingDetails(1);

      expect(service.isLoading()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Buchung konnte nicht geladen werden.'
      });
      expect(service.goBack).toHaveBeenCalled();
    });
  });

  describe('generateTimeline', () => {
    it('should generate timeline for CONFIRMED booking', () => {
      service.generateTimeline(mockBooking);

      const events = service.timelineEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].status).toBe('Buchung erstellt');
      expect(events.some(e => e.status === 'Bestätigt')).toBe(true);
    });

    it('should generate timeline for PICKED_UP booking', () => {
      const pickedUpBooking = { ...mockBooking, status: 'PICKED_UP' as BookingStatus };
      service.generateTimeline(pickedUpBooking);

      const events = service.timelineEvents();
      expect(events.some(e => e.status === 'Ausgegeben')).toBe(true);
    });

    it('should generate timeline for RETURNED booking', () => {
      const returnedBooking = {
        ...mockBooking,
        status: 'RETURNED' as BookingStatus,
        returnDate: '2024-01-20T10:00:00'
      };
      service.generateTimeline(returnedBooking);

      const events = service.timelineEvents();
      expect(events.some(e => e.status === 'Zurückgegeben')).toBe(true);
    });

    it('should generate timeline for REJECTED booking', () => {
      const rejectedBooking = { ...mockBooking, status: 'REJECTED' as BookingStatus };
      service.generateTimeline(rejectedBooking);

      const events = service.timelineEvents();
      expect(events.some(e => e.status === 'Storniert')).toBe(true);
    });

    it('should generate timeline for CANCELLED booking', () => {
      const cancelledBooking = { ...mockBooking, status: 'CANCELLED' as BookingStatus };
      service.generateTimeline(cancelledBooking);

      const events = service.timelineEvents();
      expect(events.some(e => e.status === 'Abgelehnt')).toBe(true);
    });
  });

  describe('getStatusSeverity', () => {
    it('should return correct severity for CONFIRMED', () => {
      expect(service.getStatusSeverity('CONFIRMED')).toBe('success');
    });

    it('should return correct severity for PICKED_UP', () => {
      expect(service.getStatusSeverity('PICKED_UP')).toBe('info');
    });

    it('should return correct severity for RETURNED', () => {
      expect(service.getStatusSeverity('RETURNED')).toBe('success');
    });

    it('should return correct severity for PENDING', () => {
      expect(service.getStatusSeverity('PENDING')).toBe('warn');
    });

    it('should return correct severity for REJECTED', () => {
      expect(service.getStatusSeverity('REJECTED')).toBe('danger');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for PENDING', () => {
      expect(service.getStatusLabel('PENDING')).toBe('Ausstehend');
    });

    it('should return correct label for CONFIRMED', () => {
      expect(service.getStatusLabel('CONFIRMED')).toBe('Bestätigt');
    });

    it('should return correct label for PICKED_UP', () => {
      expect(service.getStatusLabel('PICKED_UP')).toBe('Ausgeliehen');
    });

    it('should return correct label for RETURNED', () => {
      expect(service.getStatusLabel('RETURNED')).toBe('Zurückgegeben');
    });
  });

  describe('formatDateTime', () => {
    it('should format date string correctly', () => {
      const result = service.formatDateTime('2024-01-15T10:30:00');
      expect(result).toContain('15');
      expect(result).toContain('01');
      expect(result).toContain('2024');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = service.formatDateTime(date);
      expect(result).toContain('15');
      expect(result).toContain('01');
      expect(result).toContain('2024');
    });

    it('should return "-" for null date', () => {
      expect(service.formatDateTime(null)).toBe('-');
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = service.formatDate('2024-01-15');
      expect(result).toContain('15');
      expect(result).toContain('01');
      expect(result).toContain('2024');
    });

    it('should return "-" for empty string', () => {
      expect(service.formatDate('')).toBe('-');
    });
  });

  describe('getCardData', () => {
    it('should return card data when booking is loaded', () => {
      service.booking.set(mockBooking);

      const cardData = service.getCardData();

      expect(cardData.length).toBe(4);
      expect(cardData[0].h).toBe('Benutzer');
      expect(cardData[1].h).toBe('Ausleihzeitraum');
      expect(cardData[2].h).toBe('Verleiher');
      expect(cardData[3].h).toBe('Gegenstand');
    });

    it('should return empty arrays when no booking is loaded', () => {
      service.booking.set(null);

      const cardData = service.getCardData();

      expect(cardData.length).toBe(4);
      expect(cardData[0].items.length).toBe(0);
    });
  });

  describe('goBack', () => {
    it('should navigate back to bookings list', () => {
      service.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/admin/bookings']);
    });
  });
});

