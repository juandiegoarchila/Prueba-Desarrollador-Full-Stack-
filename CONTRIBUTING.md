# 🤝 Guía de Contribución

Gracias por tu interés en contribuir al proyecto **E-Commerce Ionic**. Este documento establece las guías y estándares que deben seguir todos los desarrolladores que trabajen en este proyecto.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [Configuración del Entorno](#️-configuración-del-entorno)
- [Estándares de Código](#-estándares-de-código)
- [Convenciones de Nombres](#-convenciones-de-nombres)
- [Documentación JSDoc](#-documentación-jsdoc)
- [Gestión de Estado](#-gestión-de-estado)
- [Prevención de Memory Leaks](#-prevención-de-memory-leaks)
- [Testing](#-testing)
- [Proceso de Pull Request](#-proceso-de-pull-request)
- [Mensajes de Commit](#-mensajes-de-commit)
- [Code Review](#-code-review)
- [Seguridad](#-seguridad)

---

## 📜 Código de Conducta

Este proyecto se rige por un código de conducta profesional:

- ✅ Respetar las opiniones y experiencias de otros desarrolladores
- ✅ Aceptar críticas constructivas de manera profesional
- ✅ Enfocarse en lo mejor para el proyecto y el equipo
- ✅ Mostrar empatía hacia otros miembros del equipo
- ❌ No usar lenguaje ofensivo o inapropiado
- ❌ No realizar ataques personales o comentarios despectivos

---

## ⚙️ Configuración del Entorno

### Requisitos Previos

Antes de comenzar a desarrollar, asegúrate de tener instalado:

1. **Node.js 18+** y **npm 9+**
2. **Ionic CLI**: `npm install -g @ionic/cli`
3. **Cordova CLI**: `npm install -g cordova`
4. **Android Studio** (para desarrollo APK)
5. **Git** configurado con tu nombre y email

### Pasos de Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/prueba-fullstack-ionic.git
cd prueba-fullstack-ionic

# 2. Crear una rama para tu feature
git checkout -b feature/nombre-de-tu-feature

# 3. Instalar dependencias
npm install

# 4. Copiar templates de configuración
cp src/environments/environment.template.ts src/environments/environment.ts
cp src/environments/environment.prod.template.ts src/environments/environment.prod.ts

# 5. Configurar Firebase (opcional)
# Editar src/environments/environment.ts con tus credenciales

# 6. Ejecutar en desarrollo
ionic serve
```

### Variables de Entorno

Nunca subas archivos con credenciales reales. Usa los templates:
- ✅ `environment.template.ts` - Plantilla pública
- ❌ `environment.ts` - Ignorado por Git, contiene credenciales reales

---

## 📝 Estándares de Código

### TypeScript

#### 1. Strict Mode Activado
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### 2. Tipos Explícitos
```typescript
// ❌ Evitar
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Correcto
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 3. Interfaces sobre Types (cuando sea posible)
```typescript
// ✅ Preferir
export interface User {
  uid: string;
  email: string;
  displayName: string;
}

// ⚠️ Usar solo para tipos complejos
export type OrderStatus = 'pending' | 'synced' | 'completed';
```

### Angular

#### 1. OnPush Strategy en Componentes Reutilizables
```typescript
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ProductCardComponent {
  @Input() product!: Product;
}
```

#### 2. Servicios Singleton en Core
```typescript
// Proveer servicios en root (singleton)
@Injectable({
  providedIn: 'root'
})
export class AuthService { }
```

#### 3. Lazy Loading de Módulos
```typescript
// app-routing.module.ts
{
  path: 'catalog',
  loadChildren: () => import('./pages/catalog/catalog.module').then(m => m.CatalogPageModule)
}
```

---

## 🔤 Convenciones de Nombres

### Archivos

- **Servicios**: `nombre.service.ts` (ej: `auth.service.ts`)
- **Componentes**: `nombre.component.ts` (ej: `product-card.component.ts`)
- **Páginas**: `nombre.page.ts` (ej: `login.page.ts`)
- **Modelos**: `nombre.model.ts` (ej: `user.model.ts`)
- **Guards**: `nombre.guard.ts` (ej: `auth.guard.ts`)
- **Utils**: `nombre.util.ts` (ej: `validators.util.ts`)
- **Repositorios**: `nombre.repository.ts` (ej: `local-auth.repository.ts`)

### Clases y Interfaces

```typescript
// PascalCase para clases e interfaces
export class AuthService { }
export interface Product { }

// camelCase para variables y métodos
const currentUser = this.auth.getCurrentUser();

// UPPER_SNAKE_CASE para constantes
const MAX_RETRY_ATTEMPTS = 3;
```

### Observables

```typescript
// Sufijo $ para Observables
currentUser$: Observable<User | null>;
items$: BehaviorSubject<CartItem[]>;

// Sin sufijo para propiedades normales
currentUser: User | null;
items: CartItem[];
```

---

## 📚 Documentación JSDoc

**OBLIGATORIO:** Todo el código debe estar documentado en **español** con JSDoc.

### Servicios

```typescript
/**
 * @service AuthService
 * @description
 * Servicio singleton que gestiona la autenticación de usuarios.
 * Soporta autenticación local (Ionic Storage) y Firebase opcional.
 * 
 * @example
 * constructor(private auth: AuthService) {}
 * 
 * this.auth.login(email, password).subscribe(
 *   user => console.log('Autenticado:', user),
 *   error => console.error('Error:', error)
 * );
 * 
 * @author Equipo de Desarrollo
 * @date 2026-02-04
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  
  /**
   * @method login
   * @description
   * Autentica un usuario con email y contraseña.
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Observable<User>} Observable que emite el usuario autenticado
   * @throws {Error} Si las credenciales son inválidas
   */
  login(email: string, password: string): Observable<User> {
    // ...
  }
}
```

### Componentes

```typescript
/**
 * @component ProductCardComponent
 * @description
 * Tarjeta reutilizable que muestra información de un producto.
 * Utiliza ChangeDetectionStrategy.OnPush para optimizar rendimiento.
 * 
 * @example
 * <app-product-card
 *   [product]="product"
 *   (add)="onAddToCart($event)">
 * </app-product-card>
 */
@Component({ /* ... */ })
export class ProductCardComponent {
  /**
   * @property product
   * @description Objeto Product a renderizar
   * @required
   */
  @Input() product!: Product;
  
  /**
   * @event add
   * @description Emite cuando el usuario agrega el producto al carrito
   * @emits {Product} Producto agregado
   */
  @Output() add = new EventEmitter<Product>();
}
```

### Funciones Utilitarias

```typescript
/**
 * @function getDiscountPercent
 * @description
 * Calcula el porcentaje de descuento entre precio anterior y actual.
 * 
 * @param {number} price - Precio actual
 * @param {number} [previousPrice] - Precio anterior (opcional)
 * @returns {number | null} Porcentaje de descuento o null si no hay descuento
 * 
 * @example
 * getDiscountPercent(2500000, 3000000) // 17
 * getDiscountPercent(1000000, undefined) // null
 */
export const getDiscountPercent = (price: number, previousPrice?: number): number | null => {
  // ...
}
```

---

## 🔄 Gestión de Estado

### BehaviorSubject para Estado Compartido

```typescript
export class CartService {
  // Estado privado
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  
  // Observable público (read-only)
  public items$ = this.itemsSubject.asObservable();
  
  // Observables derivados
  public total$ = this.items$.pipe(
    map(items => items.reduce((sum, item) => sum + item.total, 0))
  );
  
  // Métodos para actualizar estado
  addItem(product: Product): void {
    const currentItems = this.itemsSubject.value;
    this.itemsSubject.next([...currentItems, newItem]);
  }
}
```

### Patrón Offline-First

```typescript
/**
 * FLUJO OFFLINE-FIRST:
 * 1. Guardar PRIMERO en Storage local (rápido, sin red)
 * 2. Actualizar BehaviorSubject (UI se actualiza instantáneamente)
 * 3. Si useFirebase=true, sincronizar en background
 */
async createOrder(order: Order): Promise<void> {
  // 1. Guardar localmente
  await this.localRepo.saveOrder(order);
  
  // 2. Actualizar estado
  this.ordersSubject.next([...currentOrders, order]);
  
  // 3. Sincronizar (no bloquea UI)
  if (this.useFirebase) {
    this.syncToFirebase(order).catch(err => {
      console.error('Sync failed, will retry later', err);
    });
  }
}
```

---

## 🧹 Prevención de Memory Leaks

**OBLIGATORIO:** Todas las páginas/componentes con subscriptions deben implementar `OnDestroy + takeUntil`.

### Patrón Estándar

```typescript
import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class MyPage implements OnDestroy {
  // Subject destructor
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    // Todas las subscriptions deben usar takeUntil
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // ...
      });
      
    this.anotherService.something$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        // ...
      });
  }
  
  ngOnDestroy() {
    // Completar todas las subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### ❌ Evitar

```typescript
// MAL: Subscribe sin unsubscribe
ngOnInit() {
  this.service.data$.subscribe(data => {
    // Memory leak si el componente se destruye
  });
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
describe('CartService', () => {
  let service: CartService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });
  
  it('should add item to cart', (done) => {
    const product: Product = { /* ... */ };
    
    service.addToCart(product);
    
    service.items$.subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].product).toEqual(product);
      done();
    });
  });
});
```

### E2E Tests (Futuro)

```typescript
// e2e/login.e2e-spec.ts
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[name="email"]').type('test@test.com');
    cy.get('[name="password"]').type('123456');
    cy.get('ion-button[type="submit"]').click();
    cy.url().should('include', '/catalog');
  });
});
```

---

## 🔀 Proceso de Pull Request

### 1. Crear Feature Branch

```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
```

### 2. Hacer Commits Atómicos

```bash
git add src/app/services/new-service.ts
git commit -m "feat(services): agregar NewService con JSDoc"
```

### 3. Actualizar desde Main

```bash
git fetch origin
git rebase origin/main
```

### 4. Push y Crear PR

```bash
git push origin feature/nueva-funcionalidad
```

### 5. Checklist del PR

**Antes de crear el PR, verifica:**

- [ ] ✅ Código compila sin errores (`npm run build`)
- [ ] ✅ Linting pasa (`npm run lint`)
- [ ] ✅ JSDoc completo en español
- [ ] ✅ OnDestroy + takeUntil implementado (si aplica)
- [ ] ✅ Type safety (sin `any` sin justificación)
- [ ] ✅ Tests añadidos/actualizados (si aplica)
- [ ] ✅ README actualizado (si aplica)
- [ ] ✅ Sin credenciales expuestas
- [ ] ✅ Sin console.log en producción (usar environment.production)

---

## 💬 Mensajes de Commit

Seguimos **Conventional Commits** con prefijos en español:

### Formato

```
<tipo>(<scope>): <descripción corta>

[Cuerpo opcional con más detalles]

[Footer opcional con breaking changes o issues]
```

### Tipos Permitidos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Solo cambios en documentación
- **style**: Formateo, comas, etc (sin cambio de lógica)
- **refactor**: Refactorización sin cambio de funcionalidad
- **perf**: Mejoras de rendimiento
- **test**: Añadir o corregir tests
- **chore**: Cambios en build, configuración, etc
- **security**: Correcciones de seguridad

### Ejemplos

```bash
feat(auth): agregar recuperación de contraseña

Implementa funcionalidad de "Olvidé mi contraseña" con:
- Formulario en forgot-password.page.ts
- Integración con AuthService.resetPassword()
- Validación de email con Validators.email
- Navegación automática a login después de éxito

Closes #123
```

```bash
fix(cart): corregir cálculo de IVA en checkout

El IVA se calculaba incorrectamente como 21% en lugar de 19%.
Fórmula corregida: total / 1.19 para obtener base imponible.

Fixes #456
```

```bash
docs(services): agregar JSDoc en español a ProductService

- Documentados todos los métodos públicos
- Añadidos ejemplos de uso
- Explicado patrón de fallback a assets/data/products.json
```

---

## 🔍 Code Review

### Responsabilidades del Revisor

1. **Verificar JSDoc en español**
   - Todos los métodos públicos deben estar documentados
   - Ejemplos de uso deben ser claros

2. **Verificar Memory Leaks**
   - OnDestroy + takeUntil en componentes con subscriptions
   - No quedan subscriptions huérfanas

3. **Verificar Type Safety**
   - No usar `any` sin justificación
   - Interfaces y tipos bien definidos

4. **Verificar Seguridad**
   - No hay credenciales hardcodeadas
   - Archivos sensibles en .gitignore

5. **Verificar Arquitectura**
   - Servicios en `core/` son singleton
   - Componentes reutilizables en `shared/`
   - Lógica de negocio en servicios (no en componentes)

### Feedback Constructivo

**✅ Bueno:**
> "Buen trabajo con el JSDoc. Sugiero añadir un ejemplo de uso con error handling en el método login()."

**❌ Evitar:**
> "Esto está mal, reescríbelo todo."

---

## 🔒 Seguridad

### Variables de Entorno

```typescript
// ❌ NUNCA hacer esto
const API_KEY = 'mi-api-key-secreta-123';

// ✅ Correcto
import { environment } from 'src/environments/environment';
const API_KEY = environment.firebaseConfig.apiKey;
```

### Logging en Producción

```typescript
// ❌ Console.log directo
console.log('Debug info:', sensitiveData);

// ✅ Condicional con environment
if (!environment.production) {
  console.log('Debug info:', sensitiveData);
}
```

### Validación de Inputs

```typescript
// ✅ Siempre validar inputs del usuario
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});
```

### Contraseñas

⚠️ **IMPORTANTE:** Este proyecto usa contraseñas en texto plano en modo local SOLO para demostración.

**Para producción:**
- Implementar hashing con bcrypt o similar
- Usar Firebase Auth (que ya hashea contraseñas)
- Nunca almacenar contraseñas en texto plano

---

## 📞 Contacto

Si tienes dudas sobre estas guías:

- 📧 Email: tech-lead@grupomerpes.com
- 💬 Slack: #desarrollo-ionic
- 📝 Wiki: [Confluence - Guías de Desarrollo](https://wiki.grupomerpes.com)

---

## 📄 Licencia

Este proyecto es privado y propiedad de **Grupo Merpes**.

Todos los contribuidores deben respetar la confidencialidad del código y no compartirlo fuera de la organización.

---

**¡Gracias por contribuir! 🎉**

Tu esfuerzo ayuda a mantener este proyecto con los más altos estándares de calidad.
