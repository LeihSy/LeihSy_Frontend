import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { AdminItemDetailService } from './admin-item-detail.service';
import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { LocationService } from '../../../../services/location.service';
import { UserService } from '../../../../services/user.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { User } from '../../../../models/user.model';
import { Category } from '../../../../models/category.model';
import { Location } from '../../../../models/location.model';

describe('AdminItemDetailService', () => {
  let service: AdminItemDetailService;
  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockLocationService: jasmine.SpyObj<LocationService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockCategory: Category = {
    id: 1,
    name: 'Electronics',
    deleted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockLocation: Location = {
    id: 1,
    roomNr: 'A101',
    deleted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockUser: User = {
    id: 5,
    uniqueId: 'test-lender-uuid',
    name: 'Test Lender',
    budget: 500
  };

  const mockItem: Item = {
    id: 1,
    invNumber: 'INV001',
    owner: 'School',
    productId: 10,
    lenderId: 5,
    isAvailable: true,
    deleted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockProduct: Product = {
    id: 10,
    name: 'Laptop',
    description: 'Test Laptop',
    price: 10,
    categoryId: 1,
    locationId: 1,
    imageUrl: 'https://example.com/laptop.jpg',
    expiryDate: 365,
    accessories: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockBookings = [
    {
      id: 1,
      userName: 'John Doe',
      startDate: '2024-01-10',
      endDate: '2024-01-15',
      status: 'CONFIRMED'
    },
    {
      id: 2,
      user: { name: 'Jane Smith' },
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      status: 'RETURNED'
    }
  ];

  beforeEach(() => {
    mockItemService = jasmine.createSpyObj('ItemService', ['getItemById', 'getItemBookings']);
    mockProductService = jasmine.createSpyObj('ProductService', ['getProductById']);
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getCategoryById']);
    mockLocationService = jasmine.createSpyObj('LocationService', ['getLocationById']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserById']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminItemDetailService,
        { provide: ItemService, useValue: mockItemService },
        { provide: ProductService, useValue: mockProductService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: LocationService, useValue: mockLocationService },
        { provide: UserService, useValue: mockUserService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AdminItemDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadItemDetails', () => {
    it('should load item details successfully', (done) => {
      mockItemService.getItemById.and.returnValue(of(mockItem));
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockUserService.getUserById.and.returnValue(of(mockUser));
      mockItemService.getItemBookings.and.returnValue(of(mockBookings));

      service.loadItemDetails(1);

      setTimeout(() => {
        expect(service.item()).toEqual(mockItem);
        expect(service.isLoading()).toBe(false);
        expect(mockItemService.getItemById).toHaveBeenCalledWith(1);
        expect(mockProductService.getProductById).toHaveBeenCalledWith(10);
        expect(mockUserService.getUserById).toHaveBeenCalledWith(5);
        expect(mockItemService.getItemBookings).toHaveBeenCalledWith(1);
        done();
      }, 100);
    });

    it('should handle error when loading item', (done) => {
      const error = new Error('Failed to load item');
      mockItemService.getItemById.and.returnValue(throwError(() => error));

      service.loadItemDetails(1);

      setTimeout(() => {
        expect(service.isLoading()).toBe(false);
        expect(mockMessageService.add).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Item konnte nicht geladen werden.'
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/all-items']);
        done();
      }, 100);
    });

    it('should load product with category and location', (done) => {
      mockItemService.getItemById.and.returnValue(of(mockItem));
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockUserService.getUserById.and.returnValue(of(mockUser));
      mockItemService.getItemBookings.and.returnValue(of([]));

      service.loadItemDetails(1);

      setTimeout(() => {
        const product = service.product();
        expect(product).toBeTruthy();
        expect(product?.category).toEqual(mockCategory);
        expect(product?.location).toEqual(mockLocation);
        done();
      }, 150);
    });

    it('should handle missing lenderId gracefully', (done) => {
      const itemWithoutLender = { ...mockItem, lenderId: undefined };
      mockItemService.getItemById.and.returnValue(of(itemWithoutLender));
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockItemService.getItemBookings.and.returnValue(of([]));

      service.loadItemDetails(1);

      setTimeout(() => {
        expect(service.item()).toEqual(itemWithoutLender);
        expect(mockUserService.getUserById).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('loadItemBookings', () => {
    it('should transform bookings correctly', (done) => {
      mockItemService.getItemById.and.returnValue(of(mockItem));
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockUserService.getUserById.and.returnValue(of(mockUser));
      mockItemService.getItemBookings.and.returnValue(of(mockBookings));

      service.loadItemDetails(1);

      setTimeout(() => {
        const history = service.loanHistory();
        expect(history.length).toBe(2);
        expect(history[0].borrower).toBe('John Doe');
        expect(history[0].status).toBe('Bestätigt');
        expect(history[0].statusSeverity).toBe('info');
        expect(history[1].borrower).toBe('Jane Smith');
        expect(history[1].status).toBe('Zurückgegeben');
        expect(history[1].statusSeverity).toBe('success');
        done();
      }, 100);
    });

    it('should handle booking errors gracefully', (done) => {
      mockItemService.getItemById.and.returnValue(of(mockItem));
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockUserService.getUserById.and.returnValue(of(mockUser));
      mockItemService.getItemBookings.and.returnValue(throwError(() => new Error('Booking error')));

      service.loadItemDetails(1);

      setTimeout(() => {
        expect(service.loanHistory()).toEqual([]);
        done();
      }, 100);
    });
  });

  describe('itemInfoItems computed', () => {
    it('should return empty array when item is null', () => {
      expect(service.itemInfoItems()).toEqual([]);
    });

    it('should return correct info items when item is loaded', (done) => {
      mockItemService.getItemById.and.returnValue(of(mockItem));
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockUserService.getUserById.and.returnValue(of(mockUser));
      mockItemService.getItemBookings.and.returnValue(of([]));

      service.loadItemDetails(1);

      setTimeout(() => {
        const infoItems = service.itemInfoItems();
        expect(infoItems.length).toBe(4);
        expect(infoItems[0].label).toBe('Inventarnummer');
        expect(infoItems[0].value).toBe('INV001');
        expect(infoItems[1].label).toBe('Besitzer');
        expect(infoItems[1].value).toBe('School');
        expect(infoItems[2].label).toBe('Verleiher');
        expect(infoItems[2].value).toBe('Test Lender');
        expect(infoItems[3].label).toBe('Status');
        expect(infoItems[3].value).toBe('Verfügbar');
        done();
      }, 150);
    });
  });

  describe('productInfoItems computed', () => {
    it('should return empty array when product is null', () => {
      expect(service.productInfoItems()).toEqual([]);
    });

    it('should return correct product info items', (done) => {
      mockItemService.getItemById.and.returnValue(of(mockItem));
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockUserService.getUserById.and.returnValue(of(mockUser));
      mockItemService.getItemBookings.and.returnValue(of([]));

      service.loadItemDetails(1);

      setTimeout(() => {
        const infoItems = service.productInfoItems();
        expect(infoItems.length).toBe(5); // 4 basic + image
        expect(infoItems[0].label).toBe('Produktname');
        expect(infoItems[0].value).toBe('Laptop');
        expect(infoItems[1].label).toBe('Kategorie');
        expect(infoItems[1].value).toBe('Electronics');
        expect(infoItems[2].label).toBe('Standort');
        expect(infoItems[2].value).toBe('A101');
        expect(infoItems[3].label).toBe('Preis pro Tag');
        expect(infoItems[3].value).toBe(10);
        expect(infoItems[4].label).toBe('Bild');
        expect(infoItems[4].type).toBe('image');
        done();
      }, 150);
    });

    it('should not include image when imageUrl is null', (done) => {
      const productWithoutImage = { ...mockProduct, imageUrl: null };
      mockItemService.getItemById.and.returnValue(of(mockItem));
      mockProductService.getProductById.and.returnValue(of(productWithoutImage));
      mockCategoryService.getCategoryById.and.returnValue(of(mockCategory));
      mockLocationService.getLocationById.and.returnValue(of(mockLocation));
      mockUserService.getUserById.and.returnValue(of(mockUser));
      mockItemService.getItemBookings.and.returnValue(of([]));

      service.loadItemDetails(1);

      setTimeout(() => {
        const infoItems = service.productInfoItems();
        expect(infoItems.length).toBe(4); // No image
        expect(infoItems.find(i => i.label === 'Bild')).toBeUndefined();
        done();
      }, 150);
    });
  });

  describe('getBookingStatusLabel', () => {
    it('should return correct German labels for booking statuses', () => {
      expect(service.getBookingStatusLabel('PENDING')).toBe('Ausstehend');
      expect(service.getBookingStatusLabel('CONFIRMED')).toBe('Bestätigt');
      expect(service.getBookingStatusLabel('REJECTED')).toBe('Abgelehnt');
      expect(service.getBookingStatusLabel('PICKED_UP')).toBe('Ausgegeben');
      expect(service.getBookingStatusLabel('RETURNED')).toBe('Zurückgegeben');
      expect(service.getBookingStatusLabel('CANCELLED')).toBe('Storniert');
    });

    it('should return original status for unknown status', () => {
      expect(service.getBookingStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getBookingStatusSeverity', () => {
    it('should return correct severity for booking statuses', () => {
      expect(service.getBookingStatusSeverity('PENDING')).toBe('warning');
      expect(service.getBookingStatusSeverity('CONFIRMED')).toBe('info');
      expect(service.getBookingStatusSeverity('REJECTED')).toBe('danger');
      expect(service.getBookingStatusSeverity('PICKED_UP')).toBe('info');
      expect(service.getBookingStatusSeverity('RETURNED')).toBe('success');
      expect(service.getBookingStatusSeverity('CANCELLED')).toBe('danger');
    });

    it('should return info for unknown status', () => {
      expect(service.getBookingStatusSeverity('UNKNOWN')).toBe('info');
    });
  });

  describe('getStatusSeverity', () => {
    it('should return success for available items', () => {
      expect(service.getStatusSeverity(true)).toBe('success');
    });

    it('should return danger for unavailable items', () => {
      expect(service.getStatusSeverity(false)).toBe('danger');
    });
  });

  describe('navigation methods', () => {
    it('should navigate to edit item', () => {
      service.editItem(123);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/items', 123, 'edit']);
    });

    it('should navigate back to all items', () => {
      service.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/all-items']);
    });
  });
});

