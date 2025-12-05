import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDashboardComponent } from './user-dashboard.component';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dashboard title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Mein Dashboard');
  });

  it('should have link to bookings', () => {
    const compiled = fixture.nativeElement;
    const bookingsLink = compiled.querySelector('button[routerLink="/user-dashboard/bookings"]');
    expect(bookingsLink).toBeTruthy();
  });

  it('should display one card', () => {
    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('.dashboard-card');
    expect(cards.length).toBe(1);
  });
});

