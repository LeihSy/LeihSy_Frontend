import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BookingDetailComponent } from './booking-detail.component';
import { BookingService } from '../../services/booking.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Booking } from '../../models/booking.model';

describe('BookingDetailComponent (User)', () => {
  let component: BookingDetailComponent;
  let fixture: ComponentFixture<BookingDetailComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockBooking: Booking = {
    id: 1,
    userId: 1,
    userName: 'Current User',
    lenderId: 2,
    lenderName: 'Lender Name',
    itemId: 1,
    itemInvNumber: 'INV001',
    productId: 1,
    productName: 'Laptop',
    proposalById: 1,
    proposalByName: 'Admin',
    message: 'Test message',
    status: 'CONFIRMED',
    startDate: '2024-01-01T10:00:00',
    endDate: '2024-01-10T10:00:00',
    proposedPickups: '2024-01-01T10:00:00',
    confirmedPickup: '2024-01-01T10:00:00',
    distributionDate: '',
    returnDate: '',
    createdAt: '2024-01-01T08:00:00',
    updatedAt: '2024-01-01T08:00:00'
  };

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'getBookingById',
      'cancelBooking'
    ]);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [BookingDetailComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    bookingService.getBookingById.and.returnValue(of(mockBooking));

    fixture = TestBed.createComponent(BookingDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load booking details on init', () => {
    fixture.detectChanges();
    expect(bookingService.getBookingById).toHaveBeenCalledWith(1);
    expect(component.booking()).toEqual(mockBooking);
    expect(component.isLoading()).toBe(false);
  });


  it('should navigate back when no ID provided', () => {
    activatedRoute.snapshot.paramMap.get.and.returnValue(null);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/user-dashboard/bookings']);
  });

  it('should have booking signal', () => {
    fixture.detectChanges();
    expect(component.booking).toBeDefined();
  });

  it('should have isLoading signal', () => {
    fixture.detectChanges();
    expect(component.isLoading).toBeDefined();
  });

  it('should call getBookingById with correct ID', () => {
    fixture.detectChanges();
    expect(bookingService.getBookingById).toHaveBeenCalledWith(1);
  });

  it('should set booking data', () => {
    fixture.detectChanges();
    expect(component.booking()).toEqual(mockBooking);
  });

  it('should set loading to false after data loads', () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });
});

