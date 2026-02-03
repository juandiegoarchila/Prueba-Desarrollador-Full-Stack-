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

## 3. Ionic Storage
**Contexto**: Necesidad de guardar datos persistentes en móvil.
**Decisión**: Usar `@ionic/storage-angular`.
**Justificación**: Abstrae la complejidad de SQLite (en dispositivo) e IndexedDB (en web), ideal para apps híbridas.
