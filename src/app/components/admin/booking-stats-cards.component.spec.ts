import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingStatsCardsComponent } from './booking-stats-cards.component';
import {By} from '@angular/platform-browser';

describe('BookingStatsCardsComponent', () => {
  let component: BookingStatsCardsComponent;
  let fixture: ComponentFixture<BookingStatsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingStatsCardsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingStatsCardsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should accept currentLoansCount', () => {
      component.currentLoansCount = 5;
      fixture.detectChanges();
      expect(component.currentLoansCount).toBe(5);
    });

    it('should accept overdueCount', () => {
      component.overdueCount = 2;
      fixture.detectChanges();
      expect(component.overdueCount).toBe(2);
    });

    it('should accept openRequestsCount', () => {
      component.openRequestsCount = 8;
      fixture.detectChanges();
      expect(component.openRequestsCount).toBe(8);
    });

    it('should accept confirmedNotPickedUpCount', () => {
      component.confirmedNotPickedUpCount = 3;
      fixture.detectChanges();
      expect(component.confirmedNotPickedUpCount).toBe(3);
    });

    it('should accept futureBookingsCount', () => {
      component.futureBookingsCount = 12;
      fixture.detectChanges();
      expect(component.futureBookingsCount).toBe(12);
    });

    it('should accept totalCount', () => {
      component.totalCount = 30;
      fixture.detectChanges();
      expect(component.totalCount).toBe(30);
    });

    it('should accept selectedView', () => {
      component.selectedView = 'current';
      fixture.detectChanges();
      expect(component.selectedView).toBe('current');
    });
  });

  describe('Output Events', () => {
    it('should emit viewChange on card click', (done) => {
      component.viewChange.subscribe((view) => {
        expect(view).toBe('current');
        done();
      });

      component.onViewClick('current');
    });

    it('should emit correct view type', (done) => {
      component.viewChange.subscribe((view) => {
        expect(view).toBe('overdue');
        done();
      });

      component.onViewClick('overdue');
    });
  });

  describe('Default Values', () => {
    it('should have default count of 0', () => {
      expect(component.currentLoansCount).toBe(0);
      expect(component.overdueCount).toBe(0);
      expect(component.openRequestsCount).toBe(0);
    });

    it('should have default view of "all"', () => {
      expect(component.selectedView).toBe('all');
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      component.currentLoansCount = 5;
      component.overdueCount = 2;
      component.openRequestsCount = 8;
      component.confirmedNotPickedUpCount = 3;
      component.futureBookingsCount = 12;
      component.totalCount = 30;
      fixture.detectChanges();
    });

    describe('Card Clicks', () => {
      it('should emit view change when current card clicked', () => {
        spyOn(component.viewChange, 'emit');
        component.onViewClick('current');
        expect(component.viewChange.emit).toHaveBeenCalledWith('current');
      });

      it('should emit view change when overdue card clicked', () => {
        spyOn(component.viewChange, 'emit');
        component.onViewClick('overdue');
        expect(component.viewChange.emit).toHaveBeenCalledWith('overdue');
      });

      it('should emit view change for all view types', () => {
        const viewTypes: Array<'all' | 'current' | 'overdue' | 'pending' | 'confirmed' | 'future'> = [
          'all', 'current', 'overdue', 'pending', 'confirmed', 'future'
        ];

        spyOn(component.viewChange, 'emit');

        viewTypes.forEach(view => {
          component.onViewClick(view);
          expect(component.viewChange.emit).toHaveBeenCalledWith(view);
        });

        expect(component.viewChange.emit).toHaveBeenCalledTimes(6);
      });

      it('should handle zero counts', () => {
        component.currentLoansCount = 0;
        component.overdueCount = 0;
        component.openRequestsCount = 0;
        fixture.detectChanges();

        expect(component.currentLoansCount).toBe(0);
        expect(component.overdueCount).toBe(0);
        expect(component.openRequestsCount).toBe(0);
      });

      it('should handle large counts', () => {
        component.currentLoansCount = 999;
        component.totalCount = 9999;
        fixture.detectChanges();

        expect(component.currentLoansCount).toBe(999);
        expect(component.totalCount).toBe(9999);
      });
    });
  });
});

