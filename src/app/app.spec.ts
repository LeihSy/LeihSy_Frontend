import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import Keycloak from 'keycloak-js';

describe('AppComponent', () => {
  let mockKeycloak: jasmine.SpyObj<Keycloak>;

  beforeEach(async () => {
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['login', 'logout'], {
      authenticated: false
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Keycloak, useValue: mockKeycloak }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have authService injected', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.authService).toBeDefined();
  });

  it('should initialize with cartCount of 0', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.cartCount).toBe(0);
  });
});
