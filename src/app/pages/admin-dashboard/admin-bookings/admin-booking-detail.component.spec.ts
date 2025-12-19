import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminBookingDetailComponent } from './admin-booking-detail.component';
import { BookingService } from '../../services/booking.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AdminBookingDetailComponent', () => {
  let component: AdminBookingDetailComponent;
  let fixture: ComponentFixture<AdminBookingDetailComponent>;

  beforeEach(async () => {
    const activatedRoute = {
      snapshot: {
        paramMap: {
          get: () => '1'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AdminBookingDetailComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

