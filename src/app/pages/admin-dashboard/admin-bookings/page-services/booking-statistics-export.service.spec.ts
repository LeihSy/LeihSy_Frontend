import { TestBed } from '@angular/core/testing';
import { BookingStatisticsExportService, StatisticsExportData } from './booking-statistics-export.service';
import jsPDF from 'jspdf';

describe('BookingStatisticsExportService', () => {
  let service: BookingStatisticsExportService;
  let mockData: StatisticsExportData;
  let mockMinimalData: StatisticsExportData;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingStatisticsExportService]
    });
    service = TestBed.inject(BookingStatisticsExportService);

    mockData = {
      totalBookings: 100,
      exportDate: new Date('2023-10-27T10:00:00'),
      dateRange: {
        start: new Date('2023-10-01T00:00:00'),
        end: new Date('2023-10-31T23:59:59')
      },
      statusStats: [
        { statusName: 'Abgeschlossen', count: 80, color: '#10b981' },
        { statusName: 'Storniert', count: 20, color: '#ef4444' }
      ],
      topProducts: [
        { productId: 1, productName: 'Beamer XL', count: 15 },
        { productId: 2, productName: 'Laptop ThinkPad', count: 12 },
        { productId: 3, productName: 'Tablet iPad', count: 10 }
      ]
    };

    mockMinimalData = {
      totalBookings: 0,
      exportDate: new Date('2023-10-27T10:00:00'),
      statusStats: [],
      topProducts: []
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportAsHtml', () => {
    let mockLink: jasmine.SpyObj<HTMLAnchorElement>;
    let appendChildSpy: jasmine.Spy;
    let removeChildSpy: jasmine.Spy;
    let createObjectURLSpy: jasmine.Spy;
    let revokeObjectURLSpy: jasmine.Spy;

    beforeEach(() => {
      mockLink = jasmine.createSpyObj('a', ['click']);
      spyOn(document, 'createElement').and.returnValue(mockLink as any);
      appendChildSpy = spyOn(document.body, 'appendChild');
      removeChildSpy = spyOn(document.body, 'removeChild');
      createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    });

    it('should create a download link and trigger click', () => {
      service.exportAsHtml(mockData);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });


    it('should create Blob with HTML content', () => {
      const blobSpy = spyOn(window as any, 'Blob').and.callThrough();

      service.exportAsHtml(mockData);

      expect(blobSpy).toHaveBeenCalled();
      const blobArgs = blobSpy.calls.mostRecent().args;
      expect(blobArgs[1]).toEqual({ type: 'text/html;charset=utf-8' });
    });

    it('should revoke object URL after download', () => {
      service.exportAsHtml(mockData);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Format Helper Methods', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-10-27T10:30:00');
      const result = (service as any).formatDate(date);

      expect(result).toBe('27.10.2023');
    });

    it('should format date with leading zeros', () => {
      const date = new Date('2023-01-05T10:30:00');
      const result = (service as any).formatDate(date);

      expect(result).toBe('05.01.2023');
    });

    it('should format datetime correctly', () => {
      const date = new Date('2023-10-27T10:30:00');
      const result = (service as any).formatDateTime(date);

      expect(result).toBe('27.10.2023 10:30');
    });

    it('should format datetime with leading zeros', () => {
      const date = new Date('2023-01-05T09:05:00');
      const result = (service as any).formatDateTime(date);

      expect(result).toBe('05.01.2023 09:05');
    });

    it('should format date for filename correctly', () => {
      const date = new Date('2023-10-27T14:30:00');
      const result = (service as any).formatDateForFilename(date);

      expect(result).toBe('2023-10-27_14-30');
    });

    it('should convert hex to RGB correctly', () => {
      const result = (service as any).hexToRgb('#10b981');

      expect(result).toEqual({ r: 16, g: 185, b: 129 });
    });

    it('should handle hex without # prefix', () => {
      const result = (service as any).hexToRgb('ef4444');

      expect(result).toEqual({ r: 239, g: 68, b: 68 });
    });

    it('should return black for invalid hex', () => {
      const result = (service as any).hexToRgb('invalid');

      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('HTML Generation Methods', () => {
    it('should generate status bars correctly', () => {
      const html = (service as any).generateStatusBars(mockData.statusStats, mockData.totalBookings);

      expect(html).toContain('Abgeschlossen');
      expect(html).toContain('Storniert');
      expect(html).toContain('80.0%');
      expect(html).toContain('20.0%');
    });

    it('should generate empty message for no status data', () => {
      const html = (service as any).generateStatusBars([], 0);

      expect(html).toContain('Keine Status-Daten vorhanden');
    });

    it('should generate status table rows', () => {
      const html = (service as any).generateStatusTableRows(mockData.statusStats, mockData.totalBookings);

      expect(html).toContain('<tr>');
      expect(html).toContain('Abgeschlossen');
      expect(html).toContain('80');
    });

    it('should generate product bars correctly', () => {
      const html = (service as any).generateProductBars(mockData.topProducts);

      expect(html).toContain('Beamer XL');
      expect(html).toContain('#1');
      expect(html).toContain('15');
    });

    it('should generate empty message for no product data', () => {
      const html = (service as any).generateProductBars([]);

      expect(html).toContain('Keine Produkt-Daten vorhanden');
    });

    it('should generate product table rows with rankings', () => {
      const html = (service as any).generateProductTableRows(mockData.topProducts);

      expect(html).toContain('rank-1');
      expect(html).toContain('rank-2');
      expect(html).toContain('rank-3');
    });

    it('should apply special styling to top 3 products', () => {
      const html = (service as any).generateProductTableRows(mockData.topProducts);

      expect(html).toContain('rank-badge rank-1');
      expect(html).toContain('rank-badge rank-2');
      expect(html).toContain('rank-badge rank-3');
    });

    it('should calculate bar widths based on max value', () => {
      const stats = [
        { statusName: 'Status 1', count: 100, color: '#000000' },
        { statusName: 'Status 2', count: 50, color: '#000000' }
      ];
      const html = (service as any).generateStatusBars(stats, 150);

      expect(html).toContain('width: 100%'); // max value gets 100%
      expect(html).toContain('width: 50%');  // half of max gets 50%
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero bookings', () => {
      const zeroData = { ...mockData, totalBookings: 0 };

      expect(() => service.exportAsHtml(zeroData)).not.toThrow();
      expect(() => service.exportAsPdf(zeroData)).not.toThrow();
    });

    it('should handle large numbers of products', () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        productId: i + 1,
        productName: `Product ${i + 1}`,
        count: 20 - i
      }));
      const largeData = { ...mockData, topProducts: manyProducts };

      expect(() => service.exportAsHtml(largeData)).not.toThrow();
      expect(() => service.exportAsPdf(largeData)).not.toThrow();
    });

    it('should handle large numbers of status types', () => {
      const manyStatuses = Array.from({ length: 10 }, (_, i) => ({
        statusName: `Status ${i + 1}`,
        count: 10 - i,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }));
      const largeData = { ...mockData, statusStats: manyStatuses };

      expect(() => service.exportAsHtml(largeData)).not.toThrow();
      expect(() => service.exportAsPdf(largeData)).not.toThrow();
    });

    it('should handle special characters in product names', () => {
      const specialCharsData = {
        ...mockData,
        topProducts: [
          { productId: 1, productName: 'Beamer "XL" & <Special>', count: 15 }
        ]
      };

      expect(() => service.exportAsHtml(specialCharsData)).not.toThrow();
      expect(() => service.exportAsPdf(specialCharsData)).not.toThrow();
    });

    it('should handle midnight time correctly', () => {
      const midnightDate = new Date('2023-10-27T00:00:00');
      const result = (service as any).formatDateTime(midnightDate);

      expect(result).toBe('27.10.2023 00:00');
    });
  });
});
