import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColaboradorComponent } from './colaborador.component';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ColaboradorService, Colaborador } from './colaborador.service';
import { EmpresaService, Empresa } from '../empresa/empresa.service';

// Mocks simulando retorno de API
const mockColaboradorService = {
  findAll: jasmine.createSpy('findAll').and.returnValue(Promise.resolve([])),
  setData: jasmine.createSpy('setData'),
};

const mockEmpresaService = {
  findAll: jasmine.createSpy('findAll').and.returnValue(Promise.resolve([])),
};

const mockMatDialog = {
  open: jasmine.createSpy('open'),
  afterAllClosed: of(null),
};

describe('ColaboradorComponent', () => {
  let component: ColaboradorComponent;
  let fixture: ComponentFixture<ColaboradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColaboradorComponent],
      providers: [
        { provide: ColaboradorService, useValue: mockColaboradorService },
        { provide: EmpresaService, useValue: mockEmpresaService },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColaboradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar colaboradores ao inicializar', async () => {
    await component.ngOnInit();
    expect(mockColaboradorService.findAll).toHaveBeenCalled();
  });

  it('deve carregar empresas ao inicializar', async () => {
    await component.ngOnInit();
    expect(mockEmpresaService.findAll).toHaveBeenCalled();
  });
});
