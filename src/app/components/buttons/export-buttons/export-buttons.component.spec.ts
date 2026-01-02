import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportButtonsComponent } from './export-buttons.component';

describe('ExportButtonsComponent', () => {
  let component: ExportButtonsComponent;
  let fixture: ComponentFixture<ExportButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportButtonsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit exportPdf event when PDF button is clicked', () => {
    spyOn(component.exportPdf, 'emit');
    component.onExportPdf();
    expect(component.exportPdf.emit).toHaveBeenCalled();
  });

  it('should emit exportHtml event when HTML button is clicked', () => {
    spyOn(component.exportHtml, 'emit');
    component.onExportHtml();
    expect(component.exportHtml.emit).toHaveBeenCalled();
  });

  it('should emit refresh event when refresh button is clicked', () => {
    spyOn(component.refresh, 'emit');
    component.onRefresh();
    expect(component.refresh.emit).toHaveBeenCalled();
  });

  it('should disable buttons when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });
});

