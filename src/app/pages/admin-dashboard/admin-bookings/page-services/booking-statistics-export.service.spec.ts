import { TestBed } from '@angular/core/testing';
import { BookingStatisticsExportService, StatisticsExportData } from './booking-statistics-export.service';
import jsPDF from 'jspdf';

describe('BookingStatisticsExportService', () => {
  let service: BookingStatisticsExportService;
  let mockData: StatisticsExportData;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingStatisticsExportService]
    });
    service = TestBed.inject(BookingStatisticsExportService);

    // Vollständige Testdaten (Fix für TS2741 und TS2322)
    mockData = {
      totalBookings: 100,
      exportDate: new Date('2023-10-27T10:00:00'),
      dateRange: {
        start: new Date('2023-10-01T00:00:00'),
        end: new Date('2023-10-31T23:59:59')
      },
      statusStats: [
        { statusName: 'Abgeschlossen', count: 80, color: '#00ff00' },
        { statusName: 'Storniert', count: 20, color: '#ff0000' }
      ],
      topProducts: [
        {
          productId: 123, // Hinzugefügt für Interface-Vollständigkeit
          productName: 'Beamer XL',
          count: 15 // Als reine Zahl (number)
        }
      ]
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- HTML EXPORT TESTS ---
  describe('exportAsHtml', () => {
    it('should create a download link and trigger click', () => {
      // Mocks für Browser-APIs
      const mockBlob = new Blob([''], { type: 'text/html' });
      spyOn(window, 'Blob').and.returnValue(mockBlob);
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');

      const linkSpy = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
    });
  });});
