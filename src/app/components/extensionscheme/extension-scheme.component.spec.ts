import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionSchemeComponent } from './extension-scheme.component';

describe('ExtensionSchemeComponent', () => {
  let component: ExtensionSchemeComponent;
  let fixture: ComponentFixture<ExtensionSchemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtensionSchemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionSchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
