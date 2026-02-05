/**
 * ============================================
 * CONFIGURACIÓN DE ENTORNO - PRODUCCIÓN
 * ============================================
 * 
 * ⚠️ ARCHIVO PRIVADO - NO SUBIR A GIT
 * Este archivo está en .gitignore y contiene credenciales reales.
 * 
 * Este archivo se usa automáticamente cuando compilas con:
 * - npm run build --prod
 * - ionic cordova build android --prod
 * 
 * Angular reemplaza environment.ts con este archivo en builds de producción.
 * 
 * ============================================
 */

export const environment = {
  /**
   * PRODUCCIÓN: Siempre true.
   * Activa optimizaciones, oculta logs y errores detallados.
   */
  production: true,

  /**
   * PRODUCCIÓN: Debe ser true.
   * En producción SIEMPRE usar Firebase, no LocalStorage.
   */
  useFirebase: true,

  /**
   * Configuración de Firebase para PRODUCCIÓN.
   * 
   * ⚠️ IMPORTANTE: Estos son los mismos valores que desarrollo.
   * Si tienes un proyecto Firebase separado para producción, cámbialos aquí.
   * 
   * BUENAS PRÁCTICAS:
   * - Proyecto Firebase de desarrollo: grupo-merpes-dev
   * - Proyecto Firebase de producción: grupo-merpes-prod
   * 
   * Proyecto actual: grupo-merpes-3fa68
   */
  firebase: {
    /** Clave de API de Firebase (Producción) */
    apiKey: "AIzaSyDiw1nDaNAK0-PWWTi5TFLyqzCVKEDFBBQ",
    
    /** Dominio de autenticación */
    authDomain: "grupo-merpes-3fa68.firebaseapp.com",
    
    /** ID del proyecto */
    projectId: "grupo-merpes-3fa68",
    
    /** Bucket de almacenamiento */
    storageBucket: "grupo-merpes-3fa68.firebasestorage.app",
    
    /** ID del remitente de mensajería (FCM) */
    messagingSenderId: "1012902268947",
    
    /** ID de la aplicación Android */
    appId: "1:1012902268947:android:c8226a843c49a2f9cf6fe6"
  }
};

/**
 * ============================================
 * CHECKLIST PRE-DEPLOYMENT
 * ============================================
 * 
 * Antes de generar la APK de producción, verifica:
 * 
 * [x] production: true
 * [x] useFirebase: true
 * [x] Credenciales correctas (producción si aplica)
 * [x] Versión actualizada en config.xml
 * [x] Reglas de seguridad Firebase configuradas
 * [x] API Keys restringidas en Firebase Console
 * [x] App probada en dispositivos reales
 * [x] Certificado de firma (.keystore) guardado de forma segura
 * 
 * ============================================
 */
