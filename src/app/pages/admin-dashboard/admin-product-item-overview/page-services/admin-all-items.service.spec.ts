import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AdminAllItemsService } from './admin-all-items.service';
import { ItemService } from '../../../../services/item.service';
import { ProductService } from '../../../../services/product.service';
import { AuthService } from '../../../../services/auth.service';
import { Item } from '../../../../models/item.model';
import { Product } from '../../../../models/product.model';
import { User } from '../../../../models/user.model';

describe('AdminAllItemsService', () => {
  let service: AdminAllItemsService;
  let mockItemService: jasmine.SpyObj<ItemService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAuthService: any;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    uniqueId: 'test-admin-uuid',
    name: 'Test Admin',
    budget: 1000
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
      location: { id: 1, roomNr: 'A101', deleted: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
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
      location: { id: 1, roomNr: 'A101', deleted: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
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
      lenderId: 1,
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
      lenderId: 1,
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
      lenderId: 2,
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
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminAllItemsService,
        { provide: ItemService, useValue: mockItemService },
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AdminAllItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should load products and items', () => {
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));
      mockItemService.getAllItems.and.returnValue(of(mockItems));

      service.initialize();

      expect(mockProductService.getProductsWithItems).toHaveBeenCalled();
      expect(mockItemService.getAllItems).toHaveBeenCalled();
    });
  });

  describe('loadProducts', () => {
    it('should set isLoading to true initially and false after success', (done) => {
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));

      expect(service.isLoading()).toBe(true);

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
        expect(service.isLoading()).toBe(false);
        expect(service.products()).toEqual([]);
        done();
      });
    });
  });

  describe('loadAllItems', () => {
    it('should load all items successfully', (done) => {
      mockItemService.getAllItems.and.returnValue(of(mockItems));

      service.loadAllItems();

      setTimeout(() => {
        expect(service.items()).toEqual(mockItems);
        done();
      });
    });

    it('should handle errors when loading items', (done) => {
      const error = new Error('Failed to load items');
      mockItemService.getAllItems.and.returnValue(throwError(() => error));

      service.loadAllItems();

      setTimeout(() => {
        expect(service.items()).toEqual([]);
        done();
      });
    });
  });

  describe('productsWithItems computed', () => {
    beforeEach(() => {
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));
      mockItemService.getAllItems.and.returnValue(of(mockItems));
      service.initialize();
    });

    it('should group items by product', (done) => {
      setTimeout(() => {
        const productsWithItems = service.productsWithItems();

        expect(productsWithItems.length).toBe(2);
        expect(productsWithItems[0].product.id).toBe(1);
        expect(productsWithItems[0].items.length).toBe(2);
        expect(productsWithItems[1].product.id).toBe(2);
        expect(productsWithItems[1].items.length).toBe(1);
        done();
      }, 100);
    });

    it('should calculate available and total counts correctly', (done) => {
      setTimeout(() => {
        const productsWithItems = service.productsWithItems();

        expect(productsWithItems[0].availableCount).toBe(1);
        expect(productsWithItems[0].totalCount).toBe(2);
        expect(productsWithItems[1].availableCount).toBe(1);
        expect(productsWithItems[1].totalCount).toBe(1);
        done();
      }, 100);
    });

    it('should filter by search query', (done) => {
      setTimeout(() => {
        service.updateSearchQuery('laptop');

        setTimeout(() => {
          const productsWithItems = service.productsWithItems();
          expect(productsWithItems.length).toBe(1);
          expect(productsWithItems[0].product.name).toBe('Laptop');
          done();
        }, 10);
      }, 100);
    });

    it('should filter by inventory number', (done) => {
      setTimeout(() => {
        service.updateSearchQuery('INV003');

        setTimeout(() => {
          const productsWithItems = service.productsWithItems();
          expect(productsWithItems.length).toBe(1);
          expect(productsWithItems[0].product.id).toBe(2);
          done();
        }, 10);
      }, 100);
    });
  });

  describe('computed stats', () => {
    beforeEach(() => {
      mockProductService.getProductsWithItems.and.returnValue(of(mockProducts));
      mockItemService.getAllItems.and.returnValue(of(mockItems));
      service.initialize();
    });

    it('should calculate total items correctly', (done) => {
      setTimeout(() => {
        expect(service.totalItems()).toBe(3);
        done();
      }, 100);
    });

    it('should calculate total available correctly', (done) => {
      setTimeout(() => {
        expect(service.totalAvailable()).toBe(2);
        done();
      }, 100);
    });

    it('should calculate total borrowed correctly', (done) => {
      setTimeout(() => {
        expect(service.totalBorrowed()).toBe(1);
        done();
      }, 100);
    });

    it('should calculate total products correctly', (done) => {
      setTimeout(() => {
        expect(service.totalProducts()).toBe(2);
        done();
      }, 100);
    });
  });

  describe('navigation methods', () => {
    it('should navigate to item detail', () => {
      service.navigateToItemDetail(123);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/items/detail', 123]);
    });

    it('should navigate to edit item', () => {
      service.navigateToEditItem(456);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/items', 456, 'edit']);
    });

    it('should navigate to product detail', () => {
      service.navigateToProductDetail(789);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products', 789, 'edit']);
    });

    it('should navigate to create item with product id', () => {
      service.navigateToCreateItem(101);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/items/new'], {
        queryParams: { productId: 101 }
      });
    });
  });

  describe('updateSearchQuery', () => {
    it('should update search query signal', () => {
      expect(service.searchQuery()).toBe('');

      service.updateSearchQuery('test query');

      expect(service.searchQuery()).toBe('test query');
    });
  });
});

