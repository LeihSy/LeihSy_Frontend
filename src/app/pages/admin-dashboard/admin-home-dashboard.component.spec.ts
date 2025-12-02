import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminHomeDashboardComponent } from './admin-home-dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AdminHomeDashboardComponent', () => {
  let component: AdminHomeDashboardComponent;
  let fixture: ComponentFixture<AdminHomeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminHomeDashboardComponent,
        RouterTestingModule
      ]
    }).compileComponents();

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
});

