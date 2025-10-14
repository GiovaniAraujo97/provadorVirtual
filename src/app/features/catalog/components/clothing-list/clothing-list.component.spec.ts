import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClothingListComponent } from './clothing-list.component';

describe('ClothingListComponent', () => {
  let component: ClothingListComponent;
  let fixture: ComponentFixture<ClothingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClothingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
