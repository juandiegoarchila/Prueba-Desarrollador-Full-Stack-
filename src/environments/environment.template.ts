/**
 * ============================================
 * PLANTILLA DE CONFIGURACIÓN DE ENTORNO
 * ============================================
 * 
 * Este archivo es una PLANTILLA para crear tu archivo environment.ts local.
 * NO contiene credenciales reales y SÍ debe subirse a Git.
 * 
 * INSTRUCCIONES PARA CONFIGURAR:
 * 
 * 1. COPIA este archivo:
 *    - Windows: copy environment.template.ts environment.ts
 *    - Linux/Mac: cp environment.template.ts environment.ts
 * 
 * 2. EDITA el nuevo archivo environment.ts y reemplaza los valores de ejemplo
 *    con tus credenciales reales de Firebase.
 * 
 * 3. NUNCA subas environment.ts a Git (ya está en .gitignore)
 * 
 * CÓMO OBTENER TUS CREDENCIALES DE FIREBASE:
 * 
 * 1. Ve a: https://console.firebase.google.com/
 * 2. Selecciona tu proyecto (o crea uno nuevo)
 * 3. Ve a "Configuración del proyecto" (ícono de engranaje)
 * 4. Desplázate hasta "Tus apps" → Selecciona la app web
 * 5. Copia los valores del objeto "firebaseConfig"
 * 6. Pega esos valores en tu archivo environment.ts local
 * 
 * IMPORTANTE:
 * - El archivo environment.ts es PERSONAL y LOCAL
 * - Cada desarrollador debe tener su propia copia
 * - NUNCA compartas credenciales por chat, email o repositorios públicos
 * 
 * ============================================
 */

export const environment = {
  /**
   * Indica si la aplicación está en modo producción.
   * - false: Muestra logs, errores detallados, sin optimizaciones
   * - true: Oculta logs, errores genéricos, código optimizado
   */
  production: false,

  /**
   * Flag para activar/desactivar Firebase.
   * 
   * - true: Usa Firebase Authentication y Firestore (requiere credenciales válidas)
   * - false: Usa autenticación local con LocalStorage (modo offline/demo)
   * 
   * RECOMENDACIÓN:
   * - Desarrollo local: false (no requiere internet ni configuración)
   * - Producción: true (autenticación real y persistencia en la nube)
   */
  useFirebase: false,

  /**
   * Configuración de Firebase.
   * 
   * Reemplaza TODOS los valores con los de tu proyecto en Firebase Console.
   * 
   * IMPORTANTE: Estos valores NO son secretos críticos (van en el bundle de la app),
   * pero es buena práctica no exponerlos en repositorios públicos.
   * 
   * Configura restricciones de API en Firebase Console:
   * - Limita las API Keys a tu dominio/bundle ID
   * - Habilita App Check para producción
   * - Configura reglas de seguridad en Firestore
   */
  firebase: {
    /**
     * Clave de API de Firebase.
     * La encuentras en: Firebase Console → Configuración → Tus apps → SDK de Firebase
     */
    apiKey: 'YOUR_API_KEY_HERE',

    /**
     * Dominio de autenticación.
     * Formato: tu-proyecto.firebaseapp.com
     */
    authDomain: 'your-project-id.firebaseapp.com',

    /**
     * ID del proyecto.
     * Nombre único de tu proyecto en Firebase.
     */
    projectId: 'your-project-id',

    /**
     * Bucket de almacenamiento.
     * Formato: tu-proyecto.appspot.com
     */
    storageBucket: 'your-project-id.appspot.com',

    /**
     * ID del remitente de mensajería (Firebase Cloud Messaging).
     * Número de 12 dígitos.
     */
    messagingSenderId: '123456789012',

    /**
     * ID de la aplicación.
     * Formato: 1:123456789012:web:abc123def456 (web)
     * Formato: 1:123456789012:android:abc123def456 (Android)
     */
    appId: '1:123456789012:web:abc123def456'
  }
};

/**
 * ============================================
 * EJEMPLO DE CONFIGURACIÓN PARA MODO LOCAL (SIN FIREBASE)
 * ============================================
 * 
 * Si quieres probar la app sin configurar Firebase:
 * 
 * export const environment = {
 *   production: false,
 *   useFirebase: false,  // ← Desactiva Firebase
 *   firebase: {
 *     // No es necesario llenar estos valores si useFirebase es false
 *     apiKey: '',
 *     authDomain: '',
 *     projectId: '',
 *     storageBucket: '',
 *     messagingSenderId: '',
 *     appId: ''
 *   }
 * };
 * 
 * Con esta configuración:
 * - La autenticación usa LocalStorage (mock)
 * - Los pedidos se guardan localmente
 * - No requiere internet
 * - Funciona offline 100%
 * 
 * ============================================
 */
