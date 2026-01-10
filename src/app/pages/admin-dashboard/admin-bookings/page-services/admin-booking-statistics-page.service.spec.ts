import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AdminBookingStatisticsPageService } from './admin-booking-statistics-page.service';
import { BookingService } from '../../../../services/booking.service';
import { BookingStatisticsExportService } from './booking-statistics-export.service';
import { Booking, BookingStatus } from '../../../../models/booking.model';

describe('AdminBookingStatisticsPageService', () => {
  let service: AdminBookingStatisticsPageService;
  let bookingService: jasmine.SpyObj<BookingService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let exportService: jasmine.SpyObj<BookingStatisticsExportService>;

  const mockBookings: Booking[] = [
    {
      id: 1,
      userId: 1,
      userName: 'Test User 1',
      productId: 1,
      productName: 'Laptop',
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
      proposalByName: 'Test User 1',
      message: '',
      proposedPickups: '',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: ''
    },
    {
      id: 2,
      userId: 2,
      userName: 'Test User 2',
      productId: 2,
      productName: 'Tablet',
      itemId: 2,
      itemInvNumber: 'INV002',
      lenderId: 1,
      lenderName: 'Test Lender',
      status: 'CONFIRMED' as BookingStatus,
      startDate: '2024-01-16',
      endDate: '2024-01-21',
      createdAt: '2024-01-11T10:00:00',
      updatedAt: '2024-01-11T10:00:00',
      proposalById: 2,
      proposalByName: 'Test User 2',
      message: '',
      proposedPickups: '',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: ''
    },
    {
      id: 3,
      userId: 1,
      userName: 'Test User 1',
      productId: 1,
      productName: 'Laptop',
      itemId: 3,
      itemInvNumber: 'INV003',
      lenderId: 1,
      lenderName: 'Test Lender',
      status: 'PICKED_UP' as BookingStatus,
      startDate: '2024-01-17',
      endDate: '2024-01-22',
      createdAt: '2024-01-12T10:00:00',
      updatedAt: '2024-01-12T10:00:00',
      proposalById: 1,
      proposalByName: 'Test User 1',
      message: '',
      proposedPickups: '',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: ''
    }
  ];

  beforeEach(() => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getAllBookings']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const exportServiceSpy = jasmine.createSpyObj('BookingStatisticsExportService', ['exportAsHtml', 'exportAsPdf']);

    TestBed.configureTestingModule({
      providers: [
        AdminBookingStatisticsPageService,
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: BookingStatisticsExportService, useValue: exportServiceSpy }
      ]
    });

    service = TestBed.inject(AdminBookingStatisticsPageService);
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    exportService = TestBed.inject(BookingStatisticsExportService) as jasmine.SpyObj<BookingStatisticsExportService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadData', () => {
    it('should load bookings successfully', () => {
      bookingService.getAllBookings.and.returnValue(of(mockBookings));

      service.loadData();

      expect(service.isLoading()).toBe(false);
      expect(service.bookings()).toEqual(mockBookings);
      expect(bookingService.getAllBookings).toHaveBeenCalled();
    });

    it('should handle error when loading bookings fails', () => {
      const error = new Error('Failed to load');
      bookingService.getAllBookings.and.returnValue(throwError(() => error));

      service.loadData();

      expect(service.isLoading()).toBe(false);
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        summary: 'Fehler'
      }));
    });
  });

  describe('filteredBookings', () => {
    beforeEach(() => {
      service.bookings.set(mockBookings);
    });

    it('should return all bookings when no date filter is set', () => {
      service.dateRangeStart.set(null);
      service.dateRangeEnd.set(null);

      expect(service.filteredBookings().length).toBe(3);
    });

    it('should filter bookings by start date', () => {
      service.dateRangeStart.set(new Date('2024-01-11T00:00:00'));
      service.dateRangeEnd.set(null);

      const filtered = service.filteredBookings();
      expect(filtered.length).toBe(2);
    });

    it('should filter bookings by end date', () => {
      service.dateRangeStart.set(null);
      service.dateRangeEnd.set(new Date('2024-01-11T00:00:00'));

      const filtered = service.filteredBookings();
      expect(filtered.length).toBe(2);
    });

    it('should filter bookings by date range', () => {
      service.dateRangeStart.set(new Date('2024-01-11T00:00:00'));
      service.dateRangeEnd.set(new Date('2024-01-12T00:00:00'));

      const filtered = service.filteredBookings();
      expect(filtered.length).toBe(2);
    });
  });

  describe('statusStats', () => {
    it('should compute status statistics correctly', () => {
      service.bookings.set(mockBookings);

      const stats = service.statusStats();

      expect(stats.length).toBe(3);
      expect(stats.find(s => s.statusName === 'Ausstehend')?.count).toBe(1);
      expect(stats.find(s => s.statusName === 'Bestätigt')?.count).toBe(1);
      expect(stats.find(s => s.statusName === 'Ausgeliehen')?.count).toBe(1);
    });

    it('should sort stats by count descending', () => {
      service.bookings.set(mockBookings);

      const stats = service.statusStats();

      for (let i = 0; i < stats.length - 1; i++) {
        expect(stats[i].count).toBeGreaterThanOrEqual(stats[i + 1].count);
      }
    });
  });

  describe('topProducts', () => {
    it('should compute top products correctly', () => {
      service.bookings.set(mockBookings);

      const products = service.topProducts();

      expect(products.length).toBe(2);
      expect(products[0].productName).toBe('Laptop');
      expect(products[0].count).toBe(2);
    });

    it('should limit to top 10 products', () => {
      const manyBookings: Booking[] = [];
      for (let i = 1; i <= 15; i++) {
        manyBookings.push({
          ...mockBookings[0],
          id: i,
          productId: i,
          productName: `Product ${i}`
        });
      }
      service.bookings.set(manyBookings);

      const products = service.topProducts();

      expect(products.length).toBe(10);
    });
  });

  describe('chart data', () => {
    beforeEach(() => {
      service.bookings.set(mockBookings);
    });

    it('should generate status chart data', () => {
      const chartData = service.statusChartData();

      expect(chartData.labels.length).toBe(3);
      expect(chartData.datasets[0].data.length).toBe(3);
      expect(chartData.datasets[0].label).toBe('Anzahl Buchungen');
    });

    it('should generate top products chart data', () => {
      const chartData = service.topProductsChartData();

      expect(chartData.labels.length).toBe(2);
      expect(chartData.datasets[0].data.length).toBe(2);
      expect(chartData.datasets[0].label).toBe('Anzahl Ausleihen');
    });
  });

  describe('date filter presets', () => {
    it('should set date range for "last7days"', () => {
      service.dateFilterPreset.set('last7days');
      service.onDateFilterPresetChange();

      expect(service.dateRangeStart()).not.toBeNull();
      expect(service.dateRangeEnd()).not.toBeNull();
    });

    it('should set date range for "last30days"', () => {
      service.dateFilterPreset.set('last30days');
      service.onDateFilterPresetChange();

      expect(service.dateRangeStart()).not.toBeNull();
      expect(service.dateRangeEnd()).not.toBeNull();
    });

    it('should set date range for "thisMonth"', () => {
      service.dateFilterPreset.set('thisMonth');
      service.onDateFilterPresetChange();

      const start = service.dateRangeStart();
      expect(start?.getDate()).toBe(1);
    });

    it('should set date range for "lastMonth"', () => {
      service.dateFilterPreset.set('lastMonth');
      service.onDateFilterPresetChange();

      expect(service.dateRangeStart()).not.toBeNull();
      expect(service.dateRangeEnd()).not.toBeNull();
    });

    it('should set date range for "thisYear"', () => {
      service.dateFilterPreset.set('thisYear');
      service.onDateFilterPresetChange();

      const start = service.dateRangeStart();
      expect(start?.getMonth()).toBe(0);
      expect(start?.getDate()).toBe(1);
    });

    it('should clear date range for "all"', () => {
      service.dateFilterPreset.set('all');
      service.onDateFilterPresetChange();

      expect(service.dateRangeStart()).toBeNull();
      expect(service.dateRangeEnd()).toBeNull();
    });
  });

  describe('clearDateFilter', () => {
    it('should clear all date filters', () => {
      service.dateRangeStart.set(new Date());
      service.dateRangeEnd.set(new Date());
      service.dateFilterPreset.set('last7days');

      service.clearDateFilter();

      expect(service.dateRangeStart()).toBeNull();
      expect(service.dateRangeEnd()).toBeNull();
      expect(service.dateFilterPreset()).toBe('all');
    });
  });

  describe('export functions', () => {
    beforeEach(() => {
      service.bookings.set(mockBookings);
    });

    it('should export statistics as HTML', () => {
      service.exportStatistics();

      expect(exportService.exportAsHtml).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Export erfolgreich',
        detail: 'Die Statistiken wurden als HTML-Datei exportiert.'
      });
    });

    it('should export statistics as PDF', () => {
      service.exportStatisticsAsPdf();

      expect(exportService.exportAsPdf).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Export erfolgreich',
        detail: 'Die Statistiken wurden als PDF-Datei exportiert.'
      });
    });
  });

  describe('refreshData', () => {
    it('should call loadData', () => {
      spyOn(service, 'loadData');

      service.refreshData();

      expect(service.loadData).toHaveBeenCalled();
    });
  });
});

