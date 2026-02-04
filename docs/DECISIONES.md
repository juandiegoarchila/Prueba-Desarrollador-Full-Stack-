# Registro de Decisiones de Arquitectura (ADR)

## 1. Uso de Persistencia Híbrida (Repository Pattern)
**Contexto**: Se requiere funcionamiento Offline y opcionalmente Backend (Firebase).
**Decisión**: Implementar el patrón **Repository**.
- Se definen interfaces abstractas (`AuthRepository`, `OrderRepository`).
- Se crean implementaciones concretas: `LocalAuthRepository` (Storage) y `FirebaseAuthRepository` (Firebase).
- Un `environment` flag determina qué implementación se inyecta.
**Consecuencias**: Permite cambiar entre modo "Demo/Local" y modo "Producción/Firebase" cambiando solo una configuración, sin tocar la UI.

## 2. Manejo de Estado
**Contexto**: Aplicación pequeña/mediana.
**Decisión**: Uso de **Services con RxJS BehaviorSubjects**.
**Justificación**: Redux/NgRx sería overkill para este alcance. Los servicios gestionan el estado del carrito y usuario en memoria y sincronizan con Storage.

## 4. Estrategia Offline-First para Pedidos
**Contexto**: Requerimiento de guardar pedido localmente y sincronizar.
**Decisión**: 
- `OrderService` guarda SIEMPRE en local (`LocalOrderRepository`) con estado `pending`.
- Si hay conexión y bandera `useFirebase` activa, intenta enviar a `FirebaseOrderRepository`.
- Si el envío es exitoso, actualiza el estado local a `synced`.
- Si falla, queda como `pending` y se preserva la data.
**Justificación**: Garantiza que el usuario nunca pierda un pedido por falta de internet y desacopla la UI de la latencia de red.

## 5. Detalle de Producto y utilidades compartidas
**Contexto**: Se requiere una vista de detalle que evite duplicación de lógica de descuentos y calificaciones.
**Decisión**:
- Se crea la ruta `product/:id` con pantalla dedicada al detalle del producto.
- Se centralizan los cálculos de descuento y estrellas en `shared/utils`.
- La tarjeta de producto muestra un CTA "Conoce más" que navega al detalle.
**Consecuencias**: Se reduce duplicación, se mejora la escalabilidad del catálogo y se mantiene la UI enfocada en cada página.
