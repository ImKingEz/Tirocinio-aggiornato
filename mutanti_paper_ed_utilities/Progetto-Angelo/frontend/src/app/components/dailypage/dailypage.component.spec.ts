import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailypageComponent } from './dailypage.component';

describe('DailypageComponent', () => {
  let component: DailypageComponent;
  let fixture: ComponentFixture<DailypageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailypageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailypageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
