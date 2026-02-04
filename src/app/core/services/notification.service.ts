import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

/**
 * Servicio centralizado para mostrar notificaciones al usuario.
 * 
 * Proporciona métodos para mostrar toasts (notificaciones emergentes)
 * con diferentes niveles de severidad: éxito, error, información y advertencia.
 * 
 * Características:
 * - Toasts con iconos contextuales según el tipo de mensaje
 * - Colores semánticos (verde=éxito, rojo=error, azul=info, amarillo=warning)
 * - Auto-cierre después de 3 segundos
 * - Posición consistente en la parte inferior de la pantalla
 * - Botón de cierre manual
 * 
 * @example
 * constructor(private notify: NotificationService) {}
 * 
 * // Notificar éxito
 * this.notify.showSuccess('Producto agregado al carrito');
 * 
 * // Notificar error
 * this.notify.showError('Error al procesar el pago');
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastController: ToastController) { }

  /**
   * Muestra una notificación de éxito (verde con check).
   * Útil para confirmar operaciones completadas correctamente.
   * 
   * @param message - Mensaje a mostrar al usuario
   * 
   * @example
   * await this.notify.showSuccess('Pedido realizado con éxito');
   */
  public async showSuccess(message: string): Promise<void> {
    await this.presentToast(message, 'success', 'checkmark-circle-outline');
  }

  /**
   * Muestra una notificación de error (rojo con alerta).
   * Útil para informar sobre problemas o fallos en operaciones.
   * 
   * @param message - Mensaje de error a mostrar
   * 
   * @example
   * await this.notify.showError('No se pudo conectar al servidor');
   */
  public async showError(message: string): Promise<void> {
    await this.presentToast(message, 'danger', 'alert-circle-outline');
  }

  /**
   * Muestra una notificación informativa (azul con icono info).
   * Útil para mensajes neutrales que no requieren acción.
   * 
   * @param message - Mensaje informativo a mostrar
   * 
   * @example
   * await this.notify.showInfo('Sesión cerrada correctamente');
   */
  public async showInfo(message: string): Promise<void> {
    await this.presentToast(message, 'primary', 'information-circle-outline');
  }

  /**
   * Muestra una notificación de advertencia (amarillo con icono warning).
   * Útil para alertar al usuario sobre situaciones que requieren atención.
   * 
   * @param message - Mensaje de advertencia a mostrar
   * 
   * @example
   * await this.notify.showWarning('El producto está agotado');
   */
  public async showWarning(message: string): Promise<void> {
    await this.presentToast(message, 'warning', 'warning-outline');
  }

  /**
   * Crea y presenta un toast con configuración personalizada.
   * 
   * @private
   * @param message - Texto del mensaje
   * @param color - Color del toast ('success' | 'danger' | 'primary' | 'warning')
   * @param icon - Nombre del icono de Ionicons
   */
  private async presentToast(
    message: string, 
    color: string, 
    icon: string
  ): Promise<void> {
    try {
      // Crear el toast con la configuración especificada
      const toast = await this.toastController.create({
        message,
        icon,
        duration: 3000, // Auto-cierre en 3 segundos
        color,
        position: 'bottom', // Posición fija en la parte inferior
        buttons: [
          { 
            icon: 'close', 
            role: 'cancel', 
            handler: () => { /* Cerrar toast manualmente */ } 
          }
        ],
        cssClass: 'custom-toast' // Clase CSS para estilos personalizados
      });
      
      // Mostrar el toast en pantalla
      await toast.present();
    } catch (error) {
      // Si falla la creación del toast, logear el error
      // No lanzamos el error para evitar romper el flujo de la app
      console.error('Error al mostrar notificación:', error);
    }
  }
}
