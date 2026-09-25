import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartPageComponent } from './cart-page.component';
import { provideMockStore } from '@ngrx/store/testing';
import { initialCartState } from '../store/cart.state';

describe('CartPageComponent', () => {
  let component: CartPageComponent;
  let fixture: ComponentFixture<CartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        provideMockStore({
          initialState: { cart: initialCartState },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have store injected', () => {
    expect(component['store']).toBeTruthy();
  });

  it('should have router injected', () => {
    expect(component['router']).toBeTruthy();
  });

  it('should have observable properties', () => {
    expect(component.items$).toBeTruthy();
    expect(component.total$).toBeTruthy();
    expect(component.isEmpty$).toBeTruthy();
  });
});

