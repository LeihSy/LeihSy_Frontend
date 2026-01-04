import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import Keycloak from 'keycloak-js';
import { ItemDetailComponent } from './item-detail.component';
import { ItemService } from '../../../services/item.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ItemDetailComponent (Lender)', () => {
  let component: ItemDetailComponent;
  let fixture: ComponentFixture<ItemDetailComponent>;
  let itemService: jasmine.SpyObj<ItemService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockItem: any = {
    id: 1,
    invNumber: 'INV001',
    productId: 1,
    productName: 'Laptop',
    status: 'AVAILABLE',
    condition: 'GOOD',
    notes: 'Test notes'
  };

  beforeEach(async () => {
    const itemServiceSpy = jasmine.createSpyObj('ItemService', [
      'getItemById',
      'updateItem'
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

    const keycloakMock = {
      init: jasmine.createSpy('init').and.returnValue(Promise.resolve(true)),
      login: jasmine.createSpy('login'),
      logout: jasmine.createSpy('logout'),
      isTokenExpired: jasmine.createSpy('isTokenExpired').and.returnValue(false),
      updateToken: jasmine.createSpy('updateToken').and.returnValue(Promise.resolve(true)),
      loadUserProfile: jasmine.createSpy('loadUserProfile').and.returnValue(Promise.resolve({})),
      authenticated: false,
      token: 'mock-token'
    };

    await TestBed.configureTestingModule({
      imports: [ItemDetailComponent, HttpClientTestingModule],
      providers: [
        { provide: ItemService, useValue: itemServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Keycloak, useValue: keycloakMock }
      ]
    }).compileComponents();

    itemService = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    itemService.getItemById.and.returnValue(of(mockItem));

    fixture = TestBed.createComponent(ItemDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  it('should navigate back when no ID provided', () => {
    activatedRoute.snapshot.paramMap.get.and.returnValue(null);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/lender/items']);
  });


  it('should call getItemById with correct ID', () => {
    itemService.getItemById.and.returnValue(of(mockItem));
    fixture.detectChanges();
    expect(itemService.getItemById).toHaveBeenCalledWith(1);
  });

});

