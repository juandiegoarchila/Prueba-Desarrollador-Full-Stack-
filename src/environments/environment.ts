/**
 * ============================================
 * CONFIGURACIÓN DE ENTORNO - DESARROLLO
 * ============================================
 * 
 * ⚠️ ARCHIVO PRIVADO - NO SUBIR A GIT
 * Este archivo está en .gitignore y contiene credenciales reales.
 * 
 * Para cambiar entre modo Local y Firebase, modifica el flag useFirebase:
 * - true: Usa Firebase Authentication y Firestore (requiere internet)
 * - false: Usa autenticación local con LocalStorage (modo offline)
 * 
 * ============================================
 */

export const environment = {
  /**
   * Indica si la aplicación está en modo producción.
   * En desarrollo debe ser false para ver logs y errores detallados.
   */
  production: false,

  /**
   * Flag para activar/desactivar Firebase.
   * 
   * true: Autenticación real con Firebase (requiere credenciales válidas)
   * false: Autenticación mock con LocalStorage (sin internet)
   */
  useFirebase: true,

  /**
   * Configuración de Firebase para este proyecto.
   * Credenciales obtenidas de Firebase Console.
   * 
   * Proyecto: grupo-merpes-3fa68
   * Tipo: Android App
   */
  firebase: {
    /** Clave de API de Firebase */
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
