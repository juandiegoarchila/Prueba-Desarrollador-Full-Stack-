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

## Generación de APK (Android)

Para generar el archivo APK ejecutable:

1. Asegurar tener instalado JDK 11+, Android Studio y SDK Tools.
2. Agregar la plataforma Android (si no existe):
   ```bash
   ionic cordova platform add android
   ```
3. Construir el proyecto:
   ```bash
   ionic cordova build android --prod
   ```
4. El APK se generará en:
   `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

> Nota: Para firmar el APK para producción, usar el flag `--release` y firmar con `jarsigner`.
El proyecto sigue una arquitectura modular separando Core (Lógica de negocio singleton), Shared (Reutilizables) y Pages (Vistas).
