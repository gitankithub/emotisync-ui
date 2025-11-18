import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDialogAdminComponent } from './chat-dialog-admin.component';

describe('ChatDialogComponent', () => {
  let component: ChatDialogAdminComponent;
  let fixture: ComponentFixture<ChatDialogAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDialogAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDialogAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
