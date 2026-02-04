/**
 * ============================================
 * PLANTILLA DE CONFIGURACIÓN DE PRODUCCIÓN
 * ============================================
 * 
 * Este archivo es una PLANTILLA para crear tu archivo environment.prod.ts local.
 * Es IDÉNTICO a environment.template.ts pero con production: true.
 * 
 * INSTRUCCIONES:
 * 
 * 1. COPIA este archivo:
 *    copy environment.prod.template.ts environment.prod.ts
 * 
 * 2. EDITA environment.prod.ts con tus credenciales REALES de Firebase
 * 
 * 3. ASEGÚRATE de que useFirebase esté en true para producción
 * 
 * 4. NUNCA subas environment.prod.ts a Git (ya está en .gitignore)
 * 
 * DIFERENCIAS CON ENVIRONMENT.TS (DESARROLLO):
 * - production: true → Optimizaciones, sin logs, errores genéricos
 * - useFirebase: true → Obligatorio en producción (no usar LocalStorage)
 * - Credenciales deben ser del proyecto de Firebase de PRODUCCIÓN
 * 
 * IMPORTANTE:
 * - Este archivo se usa al compilar con: npm run build --prod
 * - Angular reemplaza automáticamente environment.ts con environment.prod.ts
 * - Verifica que las credenciales sean las del proyecto de producción en Firebase
 * 
 * ============================================
 */

export const environment = {
  /**
   * PRODUCCIÓN: Siempre debe ser true.
   * Activa optimizaciones, oculta logs y usa código minificado.
   */
  production: true,

  /**
   * PRODUCCIÓN: Debe ser true.
   * No uses LocalStorage mock en producción, solo Firebase.
   */
  useFirebase: true,

  /**
   * Configuración de Firebase para PRODUCCIÓN.
   * 
   * ⚠️ IMPORTANTE:
   * - Usa credenciales del proyecto de PRODUCCIÓN, no de desarrollo
   * - Configura reglas de seguridad estrictas en Firebase Console
   * - Activa Firebase App Check para proteger contra abusos
   * - Limita las API Keys a tu dominio/bundle ID de producción
   * 
   * BUENAS PRÁCTICAS DE SEGURIDAD:
   * 1. Reglas de Firestore:
   *    - Requiere autenticación para leer/escribir
   *    - Valida tipos de datos en el backend
   *    - Limita tamaño de documentos
   * 
   * 2. Firebase Authentication:
   *    - Activa MFA (autenticación de dos factores)
   *    - Configura dominios autorizados
   *    - Limita intentos de inicio de sesión
   * 
   * 3. Firebase Hosting (si aplica):
   *    - Configura HTTPS obligatorio
   *    - Activa HSTS (HTTP Strict Transport Security)
   *    - Configura CORS apropiadamente
   */
  firebase: {
    apiKey: 'YOUR_PRODUCTION_API_KEY_HERE',
    authDomain: 'your-production-project.firebaseapp.com',
    projectId: 'your-production-project',
    storageBucket: 'your-production-project.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:android:abc123def456'
  }
};

/**
 * ============================================
 * CHECKLIST PRE-DEPLOYMENT A PRODUCCIÓN
 * ============================================
 * 
 * Antes de compilar la APK de producción, verifica:
 * 
 * [x] production: true
 * [x] useFirebase: true
 * [x] Credenciales son del proyecto de PRODUCCIÓN
 * [x] Reglas de seguridad configuradas en Firebase Console
 * [x] Firebase App Check activado
 * [x] Dominios autorizados configurados
 * [x] API Keys restringidas por bundle ID
 * [x] Versión de la app actualizada en config.xml
 * [x] Certificado de firma (.keystore) guardado de forma segura
 * [x] Tests E2E pasados exitosamente
 * [x] App probada en dispositivos reales (mínimo 3 diferentes)
 * 
 * COMANDO PARA COMPILAR APK DE PRODUCCIÓN:
 * ionic cordova build android --prod --release
 * 
 * ============================================
 */
