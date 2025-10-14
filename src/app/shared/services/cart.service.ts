import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  // Computed signals para reatividade
  items = computed(() => this.cartItems());
  itemCount = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0));

  constructor() {
    // Carregar carrinho do localStorage
    const savedCart = localStorage.getItem('styleVisionCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        this.cartItems.set(parsedCart);
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      }
    }
  }

  addToCart(item: Omit<CartItem, 'quantity'>): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.size === item.size && cartItem.color === item.color
    );

    if (existingItemIndex >= 0) {
      // Item já existe, aumentar quantidade
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += 1;
      this.cartItems.set(updatedItems);
    } else {
      // Novo item
      const newItem: CartItem = { ...item, quantity: 1 };
      this.cartItems.set([...currentItems, newItem]);
    }

    this.saveToLocalStorage();
    console.log('Item adicionado ao carrinho:', item.name);
  }

  removeFromCart(itemId: string, size?: string, color?: string): void {
    const currentItems = this.cartItems();
    const updatedItems = currentItems.filter(item => 
      !(item.id === itemId && item.size === size && item.color === color)
    );
    this.cartItems.set(updatedItems);
    this.saveToLocalStorage();
  }

  updateQuantity(itemId: string, newQuantity: number, size?: string, color?: string): void {
    if (newQuantity <= 0) {
      this.removeFromCart(itemId, size, color);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId && item.size === size && item.color === color) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    this.cartItems.set(updatedItems);
    this.saveToLocalStorage();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveToLocalStorage();
  }

  isInCart(itemId: string, size?: string, color?: string): boolean {
    return this.cartItems().some(item => 
      item.id === itemId && item.size === size && item.color === color
    );
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('styleVisionCart', JSON.stringify(this.cartItems()));
  }
}