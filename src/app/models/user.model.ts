/**
 * @interface User
 * @description
 * Modelo que representa un usuario autenticado en la aplicación.
 * Esta interfaz define la estructura de datos de un usuario, ya sea autenticado por Firebase Auth
 * o almacenado localmente usando el LocalAuthRepository.
 * 
 * **ORIGEN DE LOS DATOS:**
 * - Si useFirebase = true: Los datos provienen de Firebase Authentication (firebase.User)
 * - Si useFirebase = false: Los datos se almacenan localmente en Ionic Storage
 * 
 * **USO EN LA APLICACIÓN:**
 * - AuthService mantiene el usuario actual en currentUser$ (BehaviorSubject<User | null>)
 * - Los guards verifican la existencia de usuario mediante canActivate()
 * - Las páginas obtienen el usuario mediante auth.currentUser$ | async
 * 
 * @example
 * // Usuario autenticado con Firebase:
 * const user: User = {
 *   uid: 'firebase-generated-id-abc123',
 *   email: 'usuario@ejemplo.com',
 *   displayName: 'Juan Pérez'
 * };
 * 
 * @example
 * // Usuario local (sin Firebase):
 * const user: User = {
 *   uid: 'local-uuid-generated',
 *   email: 'test@test.com',
 *   displayName: 'Usuario de Prueba'
 * };
 * 
 * @author Grupo Merpes - Auditoría Senior Tech Lead
 * @date 2026-02-04
 */
export interface User {
    /**
     * @property uid
     * @description
     * Identificador único del usuario.
     * - Con Firebase: ID generado automáticamente por Firebase Auth
     * - Sin Firebase: UUID generado localmente al registrarse
     * 
     * **IMPORTANTE:** Este ID es inmutable y se usa como clave primaria para relacionar órdenes.
     * 
     * @type {string}
     * @required
     * @example 'firebase-abc123' | 'local-uuid-xyz789'
     */
    uid: string;

    /**
     * @property email
     * @description
     * Correo electrónico del usuario, usado para autenticación.
     * Debe ser único en el sistema (no pueden existir dos usuarios con el mismo email).
     * 
     * **VALIDACIÓN:**
     * Se valida con Validators.email en los formularios de login y registro.
     * 
     * @type {string}
     * @required
     * @example 'usuario@ejemplo.com'
     */
    email: string;

    /**
     * @property displayName
     * @description
     * Nombre visible del usuario, mostrado en la interfaz.
     * Se captura durante el registro y puede mostrarse en el header o perfil.
     * 
     * @type {string}
     * @required
     * @example 'Juan Pérez' | 'María González'
     */
    displayName: string;
}
