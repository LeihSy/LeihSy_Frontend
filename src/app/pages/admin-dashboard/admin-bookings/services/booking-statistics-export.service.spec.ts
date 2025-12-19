import { TestBed } from '@angular/core/testing';
import { BookingStatisticsExportService, StatisticsExportData } from './booking-statistics-export.service';

describe('BookingStatisticsExportService', () => {
  let service: BookingStatisticsExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingStatisticsExportService]
    });
    service = TestBed.inject(BookingStatisticsExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTML Export', () => {
    it('should export HTML file with correct data', () => {
      const mockData: StatisticsExportData = {
        totalBookings: 100,
        statusStats: [
          { statusName: 'Bestätigt', count: 50, color: '#10b981' },
          { statusName: 'Ausstehend', count: 30, color: '#fbbf24' },
          { statusName: 'Abgelehnt', count: 20, color: '#ef4444' }
        ],
        topProducts: [
          { productId: 1, productName: 'Laptop', count: 25 },
          { productId: 2, productName: 'Monitor', count: 20 },
          { productId: 3, productName: 'Maus', count: 15 }
        ],
        exportDate: new Date('2024-01-15T10:30:00')
      };

      const createElementSpy = spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      } as any);
      const appendChildSpy = spyOn(document.body, 'appendChild');
      const removeChildSpy = spyOn(document.body, 'removeChild');
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');
      spyOn(URL, 'revokeObjectURL');

      service.exportAsHtml(mockData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should include date range in HTML export when provided', () => {
      const mockData: StatisticsExportData = {
        totalBookings: 50,
        statusStats: [],
        topProducts: [],
        exportDate: new Date('2024-01-15T10:30:00'),
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        }
      };

      spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      } as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');
      spyOn(URL, 'revokeObjectURL');

      expect(() => service.exportAsHtml(mockData)).not.toThrow();
    });
  });

  describe('PDF Export', () => {
    it('should export PDF file with correct data', () => {
      const mockData: StatisticsExportData = {
        totalBookings: 100,
        statusStats: [
          { statusName: 'Bestätigt', count: 50, color: '#10b981' }
        ],
        topProducts: [
          { productId: 1, productName: 'Laptop', count: 25 }
        ],
        exportDate: new Date('2024-01-15T10:30:00')
      };

      expect(() => service.exportAsPdf(mockData)).not.toThrow();
    });

    it('should include date range in PDF export when provided', () => {
      const mockData: StatisticsExportData = {
        totalBookings: 50,
        statusStats: [
          { statusName: 'Bestätigt', count: 50, color: '#10b981' }
        ],
        topProducts: [
          { productId: 1, productName: 'Laptop', count: 25 }
        ],
        exportDate: new Date('2024-01-15T10:30:00'),
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        }
      };

      expect(() => service.exportAsPdf(mockData)).not.toThrow();
    });
  });

  it('should handle empty data gracefully', () => {
    const emptyData: StatisticsExportData = {
      totalBookings: 0,
      statusStats: [],
      topProducts: [],
      exportDate: new Date()
    };

    spyOn(document, 'createElement').and.returnValue({
      href: '',
      download: '',
      click: jasmine.createSpy('click')
    } as any);
    spyOn(document.body, 'appendChild');
    spyOn(document.body, 'removeChild');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');
    spyOn(URL, 'revokeObjectURL');

    expect(() => service.exportAsHtml(emptyData)).not.toThrow();
    expect(() => service.exportAsPdf(emptyData)).not.toThrow();
  });
});

