import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoPontosComponent } from './historico-ponto.component';

describe('HistoricoPontoComponent', () => {
  let component: HistoricoPontosComponent;
  let fixture: ComponentFixture<HistoricoPontosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoPontosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoPontosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
