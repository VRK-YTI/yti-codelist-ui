import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeRegistriesComponent } from './coderegistries.component';

describe('CodeRegistriesComponent', () => {
  let component: CodeRegistriesComponent;
  let fixture: ComponentFixture<CodeRegistriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeRegistriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeRegistriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
