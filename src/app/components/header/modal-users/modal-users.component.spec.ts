import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUsersComponent } from './modal-users.component';

describe('ModalUsersComponent', () => {
  let component: ModalUsersComponent;
  let fixture: ComponentFixture<ModalUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
