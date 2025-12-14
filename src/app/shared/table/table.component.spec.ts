import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event when onEdit is called', () => {
    const testData = { id: 1, name: 'Test' };
    spyOn(component.edit, 'emit');

    component.onEdit(testData);

    expect(component.edit.emit).toHaveBeenCalledWith(testData);
  });

  it('should emit remove event when onRemove is called', () => {
    const testData = { id: 1, name: 'Test' };
    spyOn(component.remove, 'emit');

    component.onRemove(testData);

    expect(component.remove.emit).toHaveBeenCalledWith(testData);
  });

  it('should format date correctly', () => {
    const date = '2024-12-09T10:30:00';
    const formatted = component.formatValue(date, 'datetime');

    expect(formatted).toMatch(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}/);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('deleted')).toBe('status-deleted');
    expect(component.getStatusClass('active')).toBe('status-active');
    expect(component.getStatusClass('pending')).toBe('status-pending');
  });
});

