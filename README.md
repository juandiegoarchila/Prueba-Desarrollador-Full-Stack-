# Prueba Desarrollador Full Stack — Ionic + Cordova (Angular)

Aplicación móvil híbrida tipo e-commerce básica desarrollada con Ionic + Angular + TypeScript. Incluye catálogo de productos, carrito de compras, registro e inicio de sesión y simulación de compra con confirmación. La solución prioriza arquitectura limpia, separación de responsabilidades y persistencia confiable para funcionamiento offline.

## Objetivo
Cumplir con la prueba técnica solicitada por Grupo Merpes, entregando una aplicación funcional que demuestre buenas prácticas, arquitectura escalable y manejo de tecnologías híbridas.

## Tecnologías
- **Frontend**: Ionic Framework, Angular, TypeScript.
- **Plataforma**: Cordova (Android).
- **Persistencia**: @ionic/storage-angular (Offline First).
- **Backend**: Firebase (Auth & Firestore) - Opcional/Híbrido.

## Instalación

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar en navegador:
   ```bash
   ionic serve
   ```
4. Generar APK (requiere entorno Android):
   ```bash
   ionic cordova build android
   ```

## Estructura
El proyecto sigue una arquitectura modular separando Core (Lógica de negocio singleton), Shared (Reutilizables) y Pages (Vistas).
