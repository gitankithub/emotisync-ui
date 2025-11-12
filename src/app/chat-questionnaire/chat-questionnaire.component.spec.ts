import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatQuestionnaireComponent } from './chat-questionnaire.component';

describe('ChatQuestionnaireComponent', () => {
  let component: ChatQuestionnaireComponent;
  let fixture: ComponentFixture<ChatQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatQuestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
