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
            "name": "Smartphone Grupo Merpes X1",
            "price": 1500000,
            "description": "El mejor rendimiento para tus ventas.",
            "imageUrl": "assets/img/dummy-phone.png"
          },
          {
            "id": 2,
            "name": "Tablet Pro 2025",
            "price": 2300000,
            "description": "Portabilidad y potencia en 10 pulgadas.",
            "imageUrl": "assets/img/dummy-tablet.png"
          },
          {
            "id": 3,
            "name": "Audífonos Noise Cancel",
            "price": 450000,
            "description": "Concéntrate en lo importante.",
            "imageUrl": "assets/img/dummy-headphones.png"
          }
        ]);
      })
    );
  }
}
