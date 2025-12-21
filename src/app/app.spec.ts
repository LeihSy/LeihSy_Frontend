import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import Keycloak from 'keycloak-js';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  let mockKeycloak: Partial<Keycloak>;

  beforeEach(async () => {
    mockKeycloak = {
      authenticated: false,
      login: jasmine.createSpy('login').and.returnValue(Promise.resolve()),
      logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
      init: jasmine.createSpy('init').and.returnValue(Promise.resolve(true)),
      token: 'mock-token',
      tokenParsed: {
        preferred_username: 'testuser',
        realm_access: { roles: [] },
        resource_access: {}
      },
      clientId: 'test-client'
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Keycloak, useValue: mockKeycloak },
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });
});
