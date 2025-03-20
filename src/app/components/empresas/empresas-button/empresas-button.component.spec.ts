import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresasButtonComponent } from './empresas-button.component';

describe('EmpresasButtonComponent', () => {
  let component: EmpresasButtonComponent;
  let fixture: ComponentFixture<EmpresasButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpresasButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresasButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
