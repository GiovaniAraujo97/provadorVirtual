import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  items = this.cartService.items;
  itemCount = this.cartService.itemCount;
  totalPrice = this.cartService.totalPrice;

  updateQuantity(itemId: string, newQuantity: number, size?: string, color?: string): void {
    this.cartService.updateQuantity(itemId, newQuantity, size, color);
  }

  removeItem(itemId: string, size?: string, color?: string): void {
    this.cartService.removeFromCart(itemId, size, color);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  continueShopping(): void {
    this.router.navigate(['/catalog']);
  }

  proceedToCheckout(): void {
    if (this.itemCount() > 0) {
      this.sendToWhatsApp();
    }
  }

  sendToWhatsApp(): void {
    const phoneNumber = '5511986445725'; // Número do WhatsApp
    const items = this.items();
    
    // Construir mensagem
    let message = '🛍️ *Olá! Gostaria de finalizar minha compra:*\n\n';
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   📂 Categoria: ${item.category}\n`;
      message += `   💰 Preço: ${this.formatPrice(item.price)}\n`;
      message += `   🔢 Quantidade: ${item.quantity}\n`;
      message += `   💳 Subtotal: ${this.formatPrice(item.price * item.quantity)}\n\n`;
    });
    
    message += `🛒 *Total de itens:* ${this.itemCount()}\n`;
    message += `💰 *Valor total:* ${this.formatPrice(this.totalPrice())}\n\n`;
    message += `🚚 *Frete:* Grátis\n\n`;
    message += `Aguardo contato para finalizar a compra! 😊`;
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }
}