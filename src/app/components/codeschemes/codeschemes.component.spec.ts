import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSchemesComponent } from './codeschemes.component';

describe('CodeSchemesComponent', () => {
  let component: CodeSchemesComponent;
  let fixture: ComponentFixture<CodeSchemesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeSchemesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSchemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
