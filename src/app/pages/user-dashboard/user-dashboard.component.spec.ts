import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserDashboardComponent } from './user-dashboard.component';

describe('UserDashboardComponent - Extended Coverage', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserDashboardComponent,
        HttpClientTestingModule
      ],
      providers: [
        provideRouter([
          { path: 'user-dashboard/bookings', component: UserDashboardComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1, h2, .title');
    expect(title).toBeTruthy();
  });

  it('should have link to bookings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const bookingsLink = compiled.querySelector('[routerLink="/user-dashboard/bookings"]');
    expect(bookingsLink).toBeTruthy();
  });

  it('should display cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-menu-card, p-card, .card');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('should render menu cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const menuCards = compiled.querySelectorAll('app-menu-card');
    expect(menuCards.length).toBeGreaterThan(0);
  });

  it('should have dashboard layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Prüfe auf irgendeine Art von Layout-Element
    const layout = compiled.querySelector('div, section, article, main, [class*="container"], [class*="dashboard"]');
    expect(layout).toBeTruthy();
  });

  it('should be standalone component', () => {
    const metadata = (UserDashboardComponent as any).ɵcmp;
    expect(metadata.standalone).toBe(true);
  });

  it('should have correct selector', () => {
    const metadata = (UserDashboardComponent as any).ɵcmp;
    expect(metadata.selectors[0][0]).toBe('app-user-dashboard');
  });

  it('should render without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should have navigation elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navElements = compiled.querySelectorAll('[routerLink], a, button');
    expect(navElements.length).toBeGreaterThan(0);
  });
});

