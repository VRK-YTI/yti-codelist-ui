import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSchemeComponent } from './code-scheme.component';

describe('CodeSchemeComponent', () => {
  let component: CodeSchemeComponent;
  let fixture: ComponentFixture<CodeSchemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeSchemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
