import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioColabComponent } from './formulario-colab.component';

describe('FormularioColabComponent', () => {
  let component: FormularioColabComponent;
  let fixture: ComponentFixture<FormularioColabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioColabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioColabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
