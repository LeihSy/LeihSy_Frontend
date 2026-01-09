import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LenderDashboardComponent } from './lender-dashboard.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { reflectComponentType } from '@angular/core'; // WICHTIG: Für sauberen Metadaten-Zugriff

describe('LenderDashboardComponent', () => {
  let component: LenderDashboardComponent;
  let fixture: ComponentFixture<LenderDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LenderDashboardComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        MessageService
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
    // FIX: Nutze die offizielle API statt der internen ɵcmp Eigenschaft
    const mirror = reflectComponentType(LenderDashboardComponent);
    expect(mirror?.isStandalone).toBe(true);
  });

  it('should have correct selector', () => {
    // FIX: Auch hier die offizielle Mirror-API nutzen
    const mirror = reflectComponentType(LenderDashboardComponent);
    expect(mirror?.selector).toBe('app-lender-dashboard');
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
      const links = compiled.querySelectorAll('[routerLink], app-menu-card[routerLink]');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should have items link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const link = compiled.querySelector('[routerLink="/lender/items"], [ng-reflect-router-link="/lender/items"]');
      expect(link).toBeTruthy();
    });
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1, h2, app-page-header');
    expect(title).toBeTruthy();
  });

  it('should have dashboard layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const hasLayout = compiled.querySelector('.container, .dashboard, [class*="grid"], app-menu-card');
    expect(hasLayout).toBeTruthy();
  });
});
