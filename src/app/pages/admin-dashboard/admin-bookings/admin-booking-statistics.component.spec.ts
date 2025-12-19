import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AdminBookingStatisticsComponent } from './admin-booking-statistics.component';
import { BookingService } from '../../services/booking.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Booking } from '../../models/booking.model';

describe('AdminBookingStatisticsComponent', () => {
  let component: AdminBookingStatisticsComponent;
  let fixture: ComponentFixture<AdminBookingStatisticsComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockBookings: Booking[] = [
    {
      id: 1,
      userId: 1,
      userName: 'User 1',
      lenderId: 1,
      lenderName: 'Lender 1',
      itemId: 1,
      itemInvNumber: 'INV001',
      productId: 1,
      productName: 'Laptop',
      proposalById: 1,
      proposalByName: 'Admin',
      message: '',
      status: 'PENDING',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      proposedPickups: '',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: '',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      userId: 2,
      userName: 'User 2',
      lenderId: 1,
      lenderName: 'Lender 1',
      itemId: 2,
      itemInvNumber: 'INV002',
      productId: 1,
      productName: 'Laptop',
      proposalById: 1,
      proposalByName: 'Admin',
      message: '',
      status: 'CONFIRMED',
      startDate: '2024-01-05',
      endDate: '2024-01-15',
      proposedPickups: '',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: '',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03'
    },
    {
      id: 3,
      userId: 1,
      userName: 'User 1',
      lenderId: 1,
      lenderName: 'Lender 1',
      itemId: 3,
      itemInvNumber: 'INV003',
      productId: 2,
      productName: 'Beamer',
      proposalById: 1,
      proposalByName: 'Admin',
      message: '',
      status: 'PICKED_UP',
      startDate: '2024-01-02',
      endDate: '2024-01-12',
      proposedPickups: '',
      confirmedPickup: '',
      distributionDate: '',
      returnDate: '',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    }
  ];

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getAllBookings']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AdminBookingStatisticsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    bookingService.getAllBookings.and.returnValue(of(mockBookings));

    fixture = TestBed.createComponent(AdminBookingStatisticsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load bookings on init', () => {
      fixture.detectChanges();
      expect(bookingService.getAllBookings).toHaveBeenCalled();
      expect(component.bookings().length).toBe(3);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Status Statistics', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should compute status stats correctly', () => {
      const stats = component.statusStats();
      expect(stats.length).toBeGreaterThan(0);

      const pendingStats = stats.find(s => s.statusName === 'Ausstehend');
      expect(pendingStats).toBeDefined();
      expect(pendingStats?.count).toBe(1);
    });

    it('should sort status stats by count descending', () => {
      const stats = component.statusStats();
      for (let i = 0; i < stats.length - 1; i++) {
        expect(stats[i].count).toBeGreaterThanOrEqual(stats[i + 1].count);
      }
    });

    it('should assign colors to status stats', () => {
      const stats = component.statusStats();
      stats.forEach(stat => {
        expect(stat.color).toBeDefined();
        expect(stat.color.length).toBeGreaterThan(0);
      });
    });

    it('should assign correct colors for known statuses', () => {
      const stats = component.statusStats();
      const pendingStats = stats.find(s => s.statusName === 'Ausstehend');
      expect(pendingStats?.color).toBe('#fbbf24');
    });

    it('should use default color for unknown statuses', () => {
      const bookingsWithUnknown = [
        ...mockBookings,
        { ...mockBookings[0], id: 99, status: 'UNKNOWN_STATUS' as any }
      ];
      bookingService.getAllBookings.and.returnValue(of(bookingsWithUnknown));
      component.ngOnInit();
      fixture.detectChanges();

      const stats = component.statusStats();
      expect(stats.some(s => s.color === '#000080')).toBe(true);
    });
  });

  describe('Top Products', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should compute top products correctly', () => {
      const topProducts = component.topProducts();
      expect(topProducts.length).toBe(2); // Laptop and Beamer

      const laptop = topProducts.find(p => p.productName === 'Laptop');
      expect(laptop).toBeDefined();
      expect(laptop?.count).toBe(2);
    });

    it('should limit to 10 products', () => {
      const topProducts = component.topProducts();
      expect(topProducts.length).toBeLessThanOrEqual(10);
    });

    it('should sort products by count descending', () => {
      const topProducts = component.topProducts();
      for (let i = 0; i < topProducts.length - 1; i++) {
        expect(topProducts[i].count).toBeGreaterThanOrEqual(topProducts[i + 1].count);
      }
    });
  });

  describe('Chart Data', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should generate status chart data', () => {
      const chartData = component.statusChartData();
      expect(chartData.labels).toBeDefined();
      expect(chartData.datasets).toBeDefined();
      expect(chartData.datasets.length).toBe(1);
      expect(chartData.datasets[0].data.length).toBe(chartData.labels.length);
    });

    it('should generate top products chart data', () => {
      const chartData = component.topProductsChartData();
      expect(chartData.labels).toBeDefined();
      expect(chartData.datasets).toBeDefined();
      expect(chartData.datasets.length).toBe(1);
      expect(chartData.datasets[0].backgroundColor).toBeDefined();
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should refresh data', () => {
      bookingService.getAllBookings.calls.reset();
      component.refreshData();
      expect(bookingService.getAllBookings).toHaveBeenCalled();
    });

    it('should handle null status label', () => {
      const label = component['getStatusLabel'](null);
      expect(label).toBe('Storniert');
    });

    it('should handle undefined status label', () => {
      const label = component['getStatusLabel'](undefined as any);
      expect(label).toBe('Storniert');
    });

    it('should return correct status labels for all states', () => {
      expect(component['getStatusLabel']('PENDING')).toBe('Ausstehend');
      expect(component['getStatusLabel']('CONFIRMED')).toBe('Bestätigt');
      expect(component['getStatusLabel']('PICKED_UP')).toBe('Ausgeliehen');
      expect(component['getStatusLabel']('RETURNED')).toBe('Zurückgegeben');
      expect(component['getStatusLabel']('REJECTED')).toBe('Abgelehnt');
      expect(component['getStatusLabel']('EXPIRED')).toBe('Abgelaufen');
      expect(component['getStatusLabel']('CANCELLED')).toBe('Storniert');
    });
  });

  describe('Initialization', () => {
    it('should initialize with loading state false after load', () => {
      fixture.detectChanges();
      expect(component.isLoading()).toBe(false);
    });

    it('should have empty bookings initially before detectChanges', () => {
      expect(component.bookings()).toBeDefined();
    });
  });

  describe('Chart Options', () => {
    it('should have responsive chart options', () => {
      expect(component.chartOptions.responsive).toBe(true);
      expect(component.chartOptions.maintainAspectRatio).toBe(false);
    });

    it('should have legend configuration', () => {
      expect(component.chartOptions.plugins.legend).toBeDefined();
      expect(component.chartOptions.plugins.legend.position).toBe('bottom');
    });
  });
});

