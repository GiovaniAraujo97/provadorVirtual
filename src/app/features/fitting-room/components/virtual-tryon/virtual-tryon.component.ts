import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClothingListComponent } from '../../../catalog/components/clothing-list/clothing-list.component';
import { CartService } from '../../../../shared/services/cart.service';

interface ClothingItem {
  name: string;
  image: string;
  category: string;
  selected?: boolean;
  price: number;
  id: string;
}

interface ClothingStyle {
  transform: string;
  top: string;
  left: string;
  zIndex: number;
}

@Component({
  selector: 'app-virtual-tryon',
  imports: [CommonModule, RouterModule, ClothingListComponent],
  templateUrl: './virtual-tryon.component.html',
  styleUrl: './virtual-tryon.component.scss',
})
export class VirtualTryonComponent implements OnInit {
  private cartService = inject(CartService);
  
  userImage: string | null = null;
  selectedClothes: ClothingItem[] = [];
  isLoading = false;
  
  // Propriedades para controlar múltiplas roupas
  clothingStyles: Map<string, ClothingStyle> = new Map();
  
  // Variáveis para arrastar
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  currentDragItem: string | null = null;
  
  // Escala atual para o item sendo manipulado
  currentScale = 1;
  currentItem: string | null = null;
  
  // Controle de z-index para camadas
  private maxZIndex = 5;
  
  // Variáveis para eventos de toque
  isTouching = false;
  touchStartX = 0;
  touchStartY = 0;
  
  // Variáveis para gestos de pinça (zoom com dois dedos)
  isPinching = false;
  initialPinchDistance = 0;
  initialScale = 1;
  
  // Para prevenir scroll durante manipulação
  private isManipulating = false;

  ngOnInit(): void {
    this.userImage = sessionStorage.getItem('userImage');
    console.log('Imagem do usuário carregada:', this.userImage ? 'Sim' : 'Não');
    if (this.userImage) {
      console.log('Tamanho da imagem:', this.userImage.length, 'caracteres');
    }
  }

  onClothingSelected(clothes: ClothingItem[]): void {
    console.log('Roupas selecionadas:', clothes);
    this.isLoading = true;
    this.selectedClothes = clothes;
    
    // Remove roupas não selecionadas dos estilos
    const selectedImages = clothes.map(item => item.image);
    this.clothingStyles.forEach((style, image) => {
      if (!selectedImages.includes(image)) {
        this.clothingStyles.delete(image);
      }
    });
    
    // Adiciona novas roupas com posições padrão
    clothes.forEach((item, index) => {
      if (!this.clothingStyles.has(item.image)) {
        this.clothingStyles.set(item.image, {
          transform: `translate(${index * 30}px, ${index * 30}px) scale(1)`,
          top: '0px',
          left: '0px',
          zIndex: 5 + index
        });
      }
    });
    
    setTimeout(() => {
      this.isLoading = false;
      console.log('Loading finalizado. Roupas atuais:', this.selectedClothes.length);
    }, 1000);
  }

  removeAllClothing(): void {
    this.selectedClothes = [];
    this.clothingStyles.clear();
    this.currentItem = null;
  }

  removeClothing(clothingImage: string): void {
    this.selectedClothes = this.selectedClothes.filter(item => item.image !== clothingImage);
    this.clothingStyles.delete(clothingImage);
    if (this.currentItem === clothingImage) {
      this.currentItem = null;
    }
  }

  selectItem(clothingImage: string): void {
    this.currentItem = clothingImage;
    const style = this.clothingStyles.get(clothingImage);
    if (style) {
      // Extrair escala atual da transform
      const scaleMatch = style.transform.match(/scale\(([^)]+)\)/);
      this.currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    }
    
    // Incrementar o maxZIndex e aplicar ao item selecionado
    this.maxZIndex++;
    
    // Atualizar z-index para trazer o item selecionado para frente
    this.clothingStyles.forEach((style, image) => {
      if (image === clothingImage) {
        style.zIndex = this.maxZIndex; // Item selecionado sempre fica na frente
      }
      // Outros itens mantêm seus z-index atuais
    });
    
    console.log(`Item ${clothingImage} trazido para frente com z-index ${this.maxZIndex}`);
  }

  // Função específica para clique direto (sem arrastar)
  onClothingClick(event: MouseEvent, clothingImage: string): void {
    console.log('Clique direto na roupa:', clothingImage);
    event.stopPropagation(); // Evita que o clique na roupa acione o container
    this.selectItem(clothingImage);
  }

  // Função para clique no container (fora das roupas)
  onContainerClick(event: MouseEvent): void {
    // Verificar se o clique foi diretamente no container, não em uma roupa
    const target = event.target as HTMLElement;
    
    // Se clicou no container da imagem ou na imagem do usuário, desselecionar tudo
    if (target.classList.contains('image-container') || 
        target.classList.contains('user-image')) {
      console.log('Clique fora das roupas - desselecionando tudo');
      this.deselectAll();
    }
  }

  // Função para desselecionar todos os itens
  deselectAll(): void {
    this.currentItem = null;
    this.currentScale = 1;
    console.log('Todos os itens desselecionados');
  }

  // Funções para arrastar
  onMouseDown(event: MouseEvent, clothingImage: string): void {
    // Selecionar item e trazer para frente
    this.selectItem(clothingImage);
    
    this.isDragging = true;
    this.currentDragItem = clothingImage;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    event.preventDefault();
    event.stopPropagation(); // Evita que o mousedown na roupa acione o container
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.currentDragItem) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    
    const currentStyle = this.clothingStyles.get(this.currentDragItem);
    if (currentStyle) {
      // Extrair posição atual da transform
      const transformMatch = currentStyle.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      const currentX = transformMatch ? parseFloat(transformMatch[1]) : 0;
      const currentY = transformMatch ? parseFloat(transformMatch[2]) : 0;
      
      const newX = currentX + deltaX;
      const newY = currentY + deltaY;
      
      this.updateClothingTransform(this.currentDragItem, newX, newY, this.currentScale);
    }
    
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
  }

  onMouseUp(): void {
    // Se foi apenas um clique (sem arrastar muito)
    if (this.isDragging && this.currentDragItem) {
      // Verificar se foi um clique simples ou arraste
      const wasDragging = this.isDragging;
      setTimeout(() => {
        if (wasDragging && this.currentDragItem) {
          // Garantir que o item clicado venha para frente
          this.selectItem(this.currentDragItem);
        }
      }, 50);
    }
    
    this.isDragging = false;
    this.currentDragItem = null;
    this.isManipulating = false;
  }

  // Eventos de toque para dispositivos móveis
  onTouchStart(event: TouchEvent, clothingImage: string): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isManipulating = true;
    
    if (event.touches.length === 1) {
      // Um dedo - arrastar
      this.selectItem(clothingImage);
      this.isTouching = true;
      this.currentDragItem = clothingImage;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // Dois dedos - zoom com pinça
      this.isPinching = true;
      this.currentItem = clothingImage;
      this.selectItem(clothingImage);
      
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.initialPinchDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      this.initialScale = this.currentScale;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isManipulating) return;
    
    event.preventDefault();
    
    if (event.touches.length === 1 && this.isTouching && this.currentDragItem) {
      // Arrastar com um dedo
      const deltaX = event.touches[0].clientX - this.touchStartX;
      const deltaY = event.touches[0].clientY - this.touchStartY;
      
      const currentStyle = this.clothingStyles.get(this.currentDragItem);
      if (currentStyle) {
        const transformMatch = currentStyle.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        const currentX = transformMatch ? parseFloat(transformMatch[1]) : 0;
        const currentY = transformMatch ? parseFloat(transformMatch[2]) : 0;
        
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        
        this.updateClothingTransform(this.currentDragItem, newX, newY, this.currentScale);
      }
      
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    } else if (event.touches.length === 2 && this.isPinching && this.currentItem) {
      // Zoom com dois dedos
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (this.initialPinchDistance > 0) {
        const scaleChange = currentDistance / this.initialPinchDistance;
        this.currentScale = Math.max(0.1, Math.min(3, this.initialScale * scaleChange));
        this.updateCurrentItemTransform();
      }
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length === 0) {
      this.isTouching = false;
      this.isPinching = false;
      this.currentDragItem = null;
      this.isManipulating = false;
    } else if (event.touches.length === 1 && this.isPinching) {
      // Se estava fazendo pinça e sobrou um dedo, mudar para arrastar
      this.isPinching = false;
      this.isTouching = true;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onContainerTouchStart(event: TouchEvent): void {
    if (!this.isManipulating) {
      // Só desseleciona se não está manipulando uma roupa
      const target = event.target as HTMLElement;
      if (target.classList.contains('image-container') || 
          target.classList.contains('user-image')) {
        this.deselectAll();
      }
    }
  }

  // Funções para zoom
  zoomIn(): void {
    if (!this.currentItem) return;
    this.currentScale = Math.min(this.currentScale + 0.1, 3);
    this.updateCurrentItemTransform();
  }

  zoomOut(): void {
    if (!this.currentItem) return;
    this.currentScale = Math.max(this.currentScale - 0.1, 0.1);
    this.updateCurrentItemTransform();
  }

  resetZoom(): void {
    if (!this.currentItem) return;
    this.currentScale = 1;
    this.updateClothingTransform(this.currentItem, 0, 0, 1);
  }

  private updateCurrentItemTransform(): void {
    if (!this.currentItem) return;
    
    const currentStyle = this.clothingStyles.get(this.currentItem);
    if (currentStyle) {
      const transformMatch = currentStyle.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      const currentX = transformMatch ? parseFloat(transformMatch[1]) : 0;
      const currentY = transformMatch ? parseFloat(transformMatch[2]) : 0;
      
      this.updateClothingTransform(this.currentItem, currentX, currentY, this.currentScale);
    }
  }

  private updateClothingTransform(clothingImage: string, x: number, y: number, scale: number): void {
    const currentStyle = this.clothingStyles.get(clothingImage);
    if (currentStyle) {
      this.clothingStyles.set(clothingImage, {
        ...currentStyle,
        transform: `translate(${x}px, ${y}px) scale(${scale})`
      });
    }
  }

  getClothingStyle(clothingImage: string): ClothingStyle | undefined {
    return this.clothingStyles.get(clothingImage);
  }

  onImageError(clothingImage: string): void {
    console.error('Erro ao carregar imagem da roupa:', clothingImage);
  }

  saveOutfit(): void {
    if (this.userImage && this.selectedClothes.length > 0) {
      const outfit = {
        userImage: this.userImage,
        clothes: this.selectedClothes.map(item => ({
          ...item,
          style: this.clothingStyles.get(item.image)
        }))
      };
      
      localStorage.setItem('savedOutfit', JSON.stringify(outfit));
      console.log('Look salvo!', outfit);
    }
  }

  addToCart(item: ClothingItem): void {
    this.cartService.addToCart({
      id: item.id,
      name: item.name,
      image: item.image,
      category: item.category,
      price: item.price
    });
  }

  addCurrentItemToCart(): void {
    if (this.currentItem) {
      const currentClothing = this.selectedClothes.find(item => item.image === this.currentItem);
      if (currentClothing) {
        this.addToCart(currentClothing);
      }
    }
  }

  isInCart(item: ClothingItem): boolean {
    return this.cartService.isInCart(item.id);
  }

  isCurrentItemInCart(): boolean {
    if (this.currentItem) {
      const currentClothing = this.selectedClothes.find(item => item.image === this.currentItem);
      return currentClothing ? this.isInCart(currentClothing) : false;
    }
    return false;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  buyOnWhatsApp(): void {
    if (this.selectedClothes.length === 0) {
      alert('Adicione algumas roupas para comprar!');
      return;
    }

    const phoneNumber = '5511986445725'; // Número do WhatsApp
    
    // Construir mensagem
    let message = '👗 *Olá! Testei as roupas no provador virtual e gostaria de comprar:*\n\n';
    
    this.selectedClothes.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   📂 ${item.category}\n`;
      message += `   💰 ${this.formatPrice(item.price)}\n\n`;
    });
    
    const totalItems = this.selectedClothes.length;
    const totalPrice = this.selectedClothes.reduce((sum, item) => sum + item.price, 0);
    
    message += `🛒 *Total de itens:* ${totalItems}\n`;
    message += `💰 *Valor total:* ${this.formatPrice(totalPrice)}\n\n`;
    message += `🚚 *Frete:* Grátis\n\n`;
    message += `Testei tudo no provador virtual e ficou perfeito! 😍\n`;
    message += `Aguardo contato para finalizar a compra! 😊`;
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  }
}
