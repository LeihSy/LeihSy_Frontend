import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { LenderItemsService } from './admin-product-item-overview.service';
import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { User } from '../../../../models/user.model';

describe('LenderItemsService (admin-product-item-overview)', () => {
  let service: LenderItemsService;
  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAuthService: any;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 5,
    uniqueId: 'test-lender-uuid',
    name: 'Test Lender',
    budget: 500
  };

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Laptop',
      description: 'Test Laptop',
      price: 10,
      categoryId: 1,
      locationId: 1,
      imageUrl: '',
      expiryDate: 365,
      accessories: null,
      category: { id: 1, name: 'Electronics', deleted: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Monitor',
      description: 'Test Monitor',
      price: 5,
      categoryId: 2,
      locationId: 1,
      imageUrl: '',
      expiryDate: 365,
      accessories: null,
      category: { id: 2, name: 'Displays', deleted: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockItems: Item[] = [
    {
      id: 1,
      invNumber: 'INV001',
      owner: 'School',
      productId: 1,
      lenderId: 5,
      isAvailable: true,
      deleted: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      invNumber: 'INV002',
      owner: 'School',
      productId: 1,
      lenderId: 5,
      isAvailable: false,
      deleted: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      invNumber: 'INV003',
      owner: 'School',
      productId: 2,
      lenderId: 3, // Different lender
      isAvailable: true,
      deleted: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    mockItemService = jasmine.createSpyObj('ItemService', ['getAllItems']);
    mockProductService = jasmine.createSpyObj('ProductService', ['getProductsWithItems']);
    mockAuthService = {
      currentUser: signal(mockUser)
    };
    mockUserService = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        LenderItemsService,
        { provide: ItemService, useValue: mockItemService },
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(LenderItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should load current user, products, and items', () => {
      mockUserService.getCurrentUser.and.returnValue(of(mockUser));
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));
      mockItemService.getAllItems.and.returnValue(of(mockItems));

      service.initialize();

      expect(mockUserService.getCurrentUser).toHaveBeenCalled();
      expect(mockProductService.getProductsWithItems).toHaveBeenCalled();
      expect(mockItemService.getAllItems).toHaveBeenCalled();
    });
  });

  describe('loadCurrentUser', () => {
    it('should load current user and show success message', (done) => {
      mockUserService.getCurrentUser.and.returnValue(of(mockUser));

      service.loadCurrentUser();

      setTimeout(() => {
        expect(service.currentUser()).toEqual(mockUser);
        expect(mockMessageService.add).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Angemeldet',
          detail: `Angemeldet als ${mockUser.name} (Verleiher) (ID: ${mockUser.id})`,
          life: 3000
        });
        done();
      });
    });

    it('should handle error when loading current user', (done) => {
      const error = new Error('Failed to load user');
      mockUserService.getCurrentUser.and.returnValue(throwError(() => error));

      service.loadCurrentUser();

      setTimeout(() => {
        expect(mockMessageService.add).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Benutzer konnte nicht geladen werden.'
        });
        done();
      });
    });
  });

  describe('loadProducts', () => {
    it('should load products successfully', (done) => {
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));

      expect(service.isLoading()).toBe(false);

      service.loadProducts();

      setTimeout(() => {
        expect(service.products()).toEqual(mockProducts);
        expect(service.isLoading()).toBe(false);
        done();
      });
    });

    it('should handle errors when loading products', (done) => {
      const error = new Error('Failed to load products');
      mockProductService.getProductsWithItems.and.returnValue(throwError(() => error));

      service.loadProducts();

      setTimeout(() => {
        expect(mockMessageService.add).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Produkte konnten nicht geladen werden.'
        });
        expect(service.isLoading()).toBe(false);
        done();
      });
    });
  });

  describe('loadItems', () => {
    it('should load items successfully', (done) => {
      mockItemService.getAllItems.and.returnValue(of(mockItems));

      service.loadItems();

      setTimeout(() => {
        expect(service.items()).toEqual(mockItems);
        expect(service.isLoading()).toBe(false);
        done();
      });
    });

    it('should handle errors when loading items', (done) => {
      const error = new Error('Failed to load items');
      mockItemService.getAllItems.and.returnValue(throwError(() => error));

      service.loadItems();

      setTimeout(() => {
        expect(mockMessageService.add).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Gegenstände konnten nicht geladen werden.'
        });
        expect(service.isLoading()).toBe(false);
        done();
      });
    });
  });

  describe('productsWithItems computed', () => {
    beforeEach(() => {
      mockUserService.getCurrentUser.and.returnValue(of(mockUser));
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));
      mockItemService.getAllItems.and.returnValue(of(mockItems));
      service.initialize();
    });

    it('should filter items by current lender', (done) => {
      setTimeout(() => {
        const productsWithItems = service.productsWithItems();

        // Only items with lenderId === 5 should be included
        expect(productsWithItems.length).toBe(1);
        expect(productsWithItems[0].product.id).toBe(1);
        expect(productsWithItems[0].items.length).toBe(2);
        done();
      }, 150);
    });

    it('should add availableLabel to items', (done) => {
      setTimeout(() => {
        const productsWithItems = service.productsWithItems();
        const firstProduct = productsWithItems[0];

        expect(firstProduct.items[0].availableLabel).toBe('Verfügbar');
        expect(firstProduct.items[1].availableLabel).toBe('Ausgeliehen');
        done();
      }, 150);
    });

    it('should calculate available and total counts correctly', (done) => {
      setTimeout(() => {
        const productsWithItems = service.productsWithItems();
        const firstProduct = productsWithItems[0];

        expect(firstProduct.availableCount).toBe(1);
        expect(firstProduct.totalCount).toBe(2);
        done();
      }, 150);
    });

    it('should filter by search query on product name', (done) => {
      setTimeout(() => {
        service.updateSearchQuery('laptop');

        setTimeout(() => {
          const productsWithItems = service.productsWithItems();
          expect(productsWithItems.length).toBe(1);
          expect(productsWithItems[0].product.name).toBe('Laptop');
          done();
        }, 10);
      }, 150);
    });

    it('should filter by search query on category name', (done) => {
      setTimeout(() => {
        service.updateSearchQuery('electronics');

        setTimeout(() => {
          const productsWithItems = service.productsWithItems();
          expect(productsWithItems.length).toBe(1);
          expect(productsWithItems[0].product.category?.name).toBe('Electronics');
          done();
        }, 10);
      }, 150);
    });

    it('should filter by search query on inventory number', (done) => {
      setTimeout(() => {
        service.updateSearchQuery('INV001');

        setTimeout(() => {
          const productsWithItems = service.productsWithItems();
          expect(productsWithItems.length).toBe(1);
          expect(productsWithItems[0].items.some(i => i.invNumber === 'INV001')).toBe(true);
          done();
        }, 10);
      }, 150);
    });
  });

  describe('computed stats', () => {
    beforeEach(() => {
      mockUserService.getCurrentUser.and.returnValue(of(mockUser));
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));
      mockItemService.getAllItems.and.returnValue(of(mockItems));
      service.initialize();
    });

    it('should calculate total items for current lender', (done) => {
      setTimeout(() => {
        expect(service.totalItems()).toBe(2); // Only items with lenderId === 5
        done();
      }, 150);
    });

    it('should calculate total available correctly', (done) => {
      setTimeout(() => {
        expect(service.totalAvailable()).toBe(1);
        done();
      }, 150);
    });

    it('should calculate total borrowed correctly', (done) => {
      setTimeout(() => {
        expect(service.totalBorrowed()).toBe(1);
        done();
      }, 150);
    });
  });

  describe('updateSearchQuery', () => {
    it('should update search query signal', () => {
      expect(service.searchQuery()).toBe('');

      service.updateSearchQuery('test query');

      expect(service.searchQuery()).toBe('test query');
    });
  });

  describe('navigateToItemDetail', () => {
    it('should navigate to item detail page', () => {
      service.navigateToItemDetail(123);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/items/detail', 123]);
    });
  });
});

