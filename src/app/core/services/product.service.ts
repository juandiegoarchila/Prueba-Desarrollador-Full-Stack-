import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('assets/data/products.json').pipe(
      tap(products => console.log('Productos cargados:', products)),
      catchError(err => {
        console.error('Error cargando products.json, usando backup:', err);
        // Fallback data en caso de error de carga
        return of([
          {
            "id": 1,
            "name": "Lavadora LG Asfecol 13Kg Carga Superior Gris",
            "price": 1499900,
            "previousPrice": 1994900,
            "rating": 4.6,
            "description": "Carga superior de 13 kg con diseño compacto y eficiente.",
            "imageUrl": "assets/img/products/lavadora-lg-13kg.png"
          },
          {
            "id": 2,
            "name": "Televisor Samsung 32\" T4300",
            "price": 760900,
            "previousPrice": 1011900,
            "rating": 4.4,
            "description": "Televisor HD de 32\" con colores vivos y gran nitidez.",
            "imageUrl": "assets/img/products/tv-samsung-32.png"
          },
          {
            "id": 3,
            "name": "Portátil Lenovo 14\" GL7 ICN4020/4Ram/128Gb/W11",
            "price": 879748,
            "previousPrice": 1169664,
            "rating": 4.5,
            "description": "Portátil de 14\" ideal para trabajo diario y estudio.",
            "imageUrl": "assets/img/products/portatil-lenovo-14.png"
          }
        ]);
      })
    );
  }
}
