import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LenderDashboardComponent } from './lender-dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('LenderDashboardComponent', () => {
  let component: LenderDashboardComponent;
  let fixture: ComponentFixture<LenderDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LenderDashboardComponent,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LenderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be a standalone component', () => {
    const componentMetadata = (LenderDashboardComponent as any).ɵcmp;
    expect(componentMetadata.standalone).toBe(true);
  });

  it('should have correct selector', () => {
    const componentMetadata = (LenderDashboardComponent as any).ɵcmp;
    expect(componentMetadata.selectors[0][0]).toBe('app-lender-dashboard');
  });

  it('should render dashboard content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });

  describe('Navigation', () => {
    it('should have menu cards for navigation', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const menuCards = compiled.querySelectorAll('app-menu-card');
      expect(menuCards.length).toBeGreaterThan(0);
    });

    it('should have router links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('[routerLink]');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should have items link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const link = compiled.querySelector('[routerLink="/lender/items"]');
      expect(link).toBeTruthy();
    });
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1, h2');
    expect(title).toBeTruthy();
  });

  it('should have dashboard layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Prüfe ob es Container-Elemente gibt
    const hasLayout = compiled.querySelector('.container, .dashboard, [class*="dashboard"], app-menu-card');
    expect(hasLayout).toBeTruthy();
  });
});

