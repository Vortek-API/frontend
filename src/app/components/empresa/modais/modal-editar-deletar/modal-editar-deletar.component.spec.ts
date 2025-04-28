import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarDeletarComponent } from './modal-editar-deletar.component';

describe('ModalEditarDeletarComponent', () => {
  let component: ModalEditarDeletarComponent;
  let fixture: ComponentFixture<ModalEditarDeletarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarDeletarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarDeletarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
