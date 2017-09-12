import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeRegistryComponent } from './coderegistry.component';

describe('CodeRegistryComponent', () => {
  let component: CodeRegistryComponent;
  let fixture: ComponentFixture<CodeRegistryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeRegistryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
