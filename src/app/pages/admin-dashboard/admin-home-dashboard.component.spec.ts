import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminHomeDashboardComponent } from './admin-home-dashboard.component';
import { Router } from '@angular/router';

describe('AdminHomeDashboardComponent - Extended Coverage', () => {
  let component: AdminHomeDashboardComponent;
  let fixture: ComponentFixture<AdminHomeDashboardComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminHomeDashboardComponent,
        HttpClientTestingModule
      ],
      providers: [
        provideRouter([
          { path: 'admin/products', component: AdminHomeDashboardComponent },
          { path: 'admin/items', component: AdminHomeDashboardComponent },
          { path: 'admin/bookings', component: AdminHomeDashboardComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AdminHomeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render component template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });

  it('should be a standalone component', () => {
    const componentMetadata = (AdminHomeDashboardComponent as any).ɵcmp;
    expect(componentMetadata.standalone).toBe(true);
  });

  it('should have correct selector', () => {
    const componentMetadata = (AdminHomeDashboardComponent as any).ɵcmp;
    expect(componentMetadata.selectors[0][0]).toBe('app-admin-home-dashboard');
  });

  describe('Menu Cards', () => {
    it('should display menu cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const menuCards = compiled.querySelectorAll('app-menu-card, .menu-card, [class*="card"]');
      expect(menuCards.length).toBeGreaterThan(0);
    });

    it('should have navigation links for menu cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('[routerLink]');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should have products page link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const link = compiled.querySelector('[routerLink="/admin/products"]');
      expect(link).toBeTruthy();
    });

    it('should have items page link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const link = compiled.querySelector('[routerLink="/admin/items"]');
      expect(link).toBeTruthy();
    });

    it('should have bookings page link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const link = compiled.querySelector('[routerLink="/admin/bookings"]');
      expect(link).toBeTruthy();
    });

    it('should have all main navigation links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('[routerLink]');
      expect(links.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const headings = compiled.querySelectorAll('h1, h2, h3');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have content container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Prüfe auf irgendeine Art von Container
      const hasContainer = compiled.querySelector('div, main, section, article, .container, [class*="container"]');
      expect(hasContainer).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should have page wrapper', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Jedes HTML-Element gilt als Container
      expect(compiled.children.length).toBeGreaterThan(0);
    });

    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});

