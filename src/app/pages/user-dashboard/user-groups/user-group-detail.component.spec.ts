import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserGroupDetailComponent } from './user-group-detail.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('UserGroupDetailComponent', () => {
  let component: UserGroupDetailComponent;
  let fixture: ComponentFixture<UserGroupDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGroupDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserGroupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

