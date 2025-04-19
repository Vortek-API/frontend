import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalCadastroComponent } from './modal-cadastro.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ColaboradorService } from '../../../colaborador/colaborador.service';
import { EmpresaService } from '../../empresa.service';
import { of } from 'rxjs';

describe('ModalCadastroComponent', () => {
  let component: ModalCadastroComponent;
  let fixture: ComponentFixture<ModalCadastroComponent>;
  let colaboradorServiceMock: jasmine.SpyObj<ColaboradorService>;
  let empresaServiceMock: jasmine.SpyObj<EmpresaService>;

  beforeEach(async () => {
    // Mock dos serviços
    colaboradorServiceMock = jasmine.createSpyObj('ColaboradorService', ['add']);
    empresaServiceMock = jasmine.createSpyObj('EmpresaService', ['findAll', 'add']);

    // Mock de respostas dos métodos
    empresaServiceMock.findAll.and.returnValue(of([]));  // Retorna uma lista vazia de empresas

    await TestBed.configureTestingModule({
      declarations: [ModalCadastroComponent],
      imports: [],
      providers: [
        { provide: MatDialogRef, useValue: {} }, // Mock do MatDialogRef
        { provide: ColaboradorService, useValue: colaboradorServiceMock },
        { provide: EmpresaService, useValue: empresaServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load empresas on init', () => {
    component.ngOnInit();
    expect(empresaServiceMock.findAll).toHaveBeenCalled();
    expect(component.empresas).toEqual([]);  // A resposta mockada é uma lista vazia
  });

  it('should call save when the save button is clicked', () => {
    const empresa = { id: 1, nome: 'Empresa Teste', cnpj: '12345678000123' };
    component.empresa = empresa;
    component.save();
    expect(empresaServiceMock.add).toHaveBeenCalledWith({
      id: 1,
      nome: 'Empresa Teste',
      cnpj: '12345678000123'
    });
  });

  it('should close the modal when close is called', () => {
    const dialogRefSpy = spyOn(component.dialogRef, 'close');
    component.close();
    expect(dialogRefSpy).toHaveBeenCalled();
  });
});
