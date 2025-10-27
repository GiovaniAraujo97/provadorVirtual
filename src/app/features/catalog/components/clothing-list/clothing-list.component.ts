import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../shared/services/cart.service';

interface ClothingItem {
  name: string;
  image: string;
  category: string;
  selected?: boolean;
  price: number;
  id: string;
}

@Component({
  selector: 'app-clothing-list',
  imports: [CommonModule],
  templateUrl: './clothing-list.component.html',
  styleUrl: './clothing-list.component.scss',
})
export class ClothingListComponent {
  @Output() clothingSelected = new EventEmitter<ClothingItem[]>();
  
  private cartService = inject(CartService);

  clothes: ClothingItem[] = [
    { id: 'camiseta-azul', name: 'Camiseta Azul', image: 'images/clothing/camiseta-azul.png', category: 'camisetas', selected: false, price: 49.90 },
    { id: 'calca-jeans', name: 'Calça Jeans', image: 'images/clothing/calca-jeans-masculina.png', category: 'calças', selected: false, price: 129.90 },
    { id: 'vestido-vermelho', name: 'Vestido Vermelho', image: 'images/clothing/vestido.png', category: 'vestidos', selected: false, price: 189.90 },
    { id: 'saia-elegante', name: 'Saia Elegante', image: 'images/clothing/saia.png', category: 'saias', selected: false, price: 79.90 },
    { id: 'chapeu-unissex', name: 'Chapéu Unissex', image: 'images/clothing/chapeu.png', category: 'acessórios', selected: false, price: 39.90 },
    { id: 'shorts-feminino', name: 'Shorts Feminino', image: 'images/clothing/shorts-feminina.png', category: 'shorts', selected: false, price: 59.90 },
    { id: 'camiseta-feminina', name: 'Camiseta Feminina', image: 'images/clothing/camiseta-feminina.png', category: 'camisetas', selected: false, price: 54.90 }
  ];

  selectedClothes: ClothingItem[] = [];

  onClothingClick(item: ClothingItem): void {
    console.log('Clique na roupa:', item.name);
    
    // Toggle seleção
    item.selected = !item.selected;
    
    // Atualiza lista de roupas selecionadas
    this.selectedClothes = this.clothes.filter(cloth => cloth.selected);
    
    console.log('Roupas selecionadas:', this.selectedClothes);
    this.clothingSelected.emit(this.selectedClothes);
  }

  clearSelections(): void {
    this.clothes.forEach(item => item.selected = false);
    this.selectedClothes = [];
    this.clothingSelected.emit(this.selectedClothes);
  }

  getSelectedCount(): number {
    return this.selectedClothes.length;
  }

  addToCart(item: ClothingItem, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Evita que o clique do botão acione a seleção
    }
    
    this.cartService.addToCart({
      id: item.id,
      name: item.name,
      image: item.image,
      category: item.category,
      price: item.price
    });
  }

  isInCart(item: ClothingItem): boolean {
    return this.cartService.isInCart(item.id);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  buyItemOnWhatsApp(item: ClothingItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const phoneNumber = '5511986445725'; // Número do WhatsApp
    
    // Construir mensagem
    let message = `🛍️ *Olá! Gostaria de comprar este item:*\n\n`;
    message += `👗 *${item.name}*\n`;
    message += `📂 Categoria: ${item.category}\n`;
    message += `💰 Preço: ${this.formatPrice(item.price)}\n\n`;
    message += `🚚 *Frete:* Grátis\n\n`;
    message += `Aguardo contato para finalizar a compra! 😊`;
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  }
}
