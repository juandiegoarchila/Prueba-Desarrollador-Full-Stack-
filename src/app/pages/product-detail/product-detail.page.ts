import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';
import { getStars } from '../../shared/utils/rating.util';
import { getDiscountPercent } from '../../shared/utils/price.util';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss']
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  isLoading = true;
  discountPercent: number | null = null;
  selectedImage: string | null = null;

  // Expose cart count for key in template
  cartItemCount$ = this.cartService.itemCount$;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notify: NotificationService,
    private nav: NavController
  ) {}

  getStars = getStars;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const productId = Number(params.get('id'));

      if (!productId) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;
      this.selectedImage = null;

      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          this.product = product;
          this.discountPercent = product
            ? getDiscountPercent(product.price, product.previousPrice)
            : null;
          
          // Initialize selected image
          if (this.product && this.product.images?.length) {
            this.selectedImage = this.product.images[0];
          } else if (this.product) {
            this.selectedImage = this.product.imageUrl;
          }

          this.isLoading = false;

          // Load related products
          if (this.product) {
            this.productService.getRelatedProducts(this.product.id).subscribe(related => {
              this.relatedProducts = related;
            });
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
    });
  }

  addToCart(product?: Product) {
    const targetProduct = product || this.product;
    if (!targetProduct) {
      return;
    }
    this.cartService.addToCart(targetProduct);
    this.notify.showSuccess(`Agregaste ${targetProduct.name} al carrito`);
    // No navegar al carrito automáticamente para permitir seguir comprando
  }

  goToCatalog() {
    this.nav.navigateBack('/catalog');
  }
}
