import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Servicio de almacenamiento persistente para la aplicación.
 * 
 * Encapsula @ionic/storage para proporcionar una API simple y consistente
 * de almacenamiento local. En dispositivos móviles usa SQLite, en web usa IndexedDB.
 * 
 * Características:
 * - Almacenamiento persistente (los datos sobreviven al cierre de la app)
 * - API asíncrona (no bloquea el hilo principal)
 * - Mayor capacidad que LocalStorage nativo (~50MB vs 5-10MB)
 * - Inicialización automática al arrancar el servicio
 * 
 * @example
 * constructor(private storage: StorageService) {}
 * 
 * // Guardar datos
 * await this.storage.set('usuario', { nombre: 'Juan', edad: 25 });
 * 
 * // Recuperar datos
 * const usuario = await this.storage.get('usuario');
 * 
 * // Eliminar datos
 * await this.storage.remove('usuario');
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /** Instancia del storage de Ionic (null hasta que se inicialice) */
  private _storage: Storage | null = null;
  
  /** Promesa que se resuelve cuando el storage está listo para usar */
  private _initPromise: Promise<void>;

  constructor(private storage: Storage) {
    // Inicializar el storage automáticamente al crear el servicio
    this._initPromise = this.init();
  }

  /**
   * Inicializa el storage de Ionic.
   * Se ejecuta automáticamente en el constructor.
   * 
   * @private
   */
  private async init(): Promise<void> {
    try {
      // Crear la instancia del storage (conecta a SQLite o IndexedDB)
      const storage = await this.storage.create();
      this._storage = storage;
    } catch (error) {
      console.error('Error al inicializar el storage:', error);
      // El storage quedará null, los métodos devolverán undefined
    }
  }

  /**
   * Guarda un valor en el storage.
   * 
   * @param key - Clave única para identificar el dato
   * @param value - Valor a guardar (puede ser objeto, array, string, number, etc.)
   * @returns Promesa que se resuelve con el valor guardado
   * 
   * @example
   * await this.storage.set('carrito', [{ producto: 'TV', cantidad: 1 }]);
   */
  public async set(key: string, value: unknown): Promise<unknown> {
    // Esperar a que el storage esté inicializado
    await this._initPromise;
    
    try {
      return await this._storage?.set(key, value);
    } catch (error) {
      console.error(`Error al guardar '${key}' en storage:`, error);
      throw error;
    }
  }

  /**
   * Recupera un valor del storage.
   * 
   * @param key - Clave del dato a recuperar
   * @returns Promesa que se resuelve con el valor guardado o null si no existe
   * 
   * @example
   * const carrito = await this.storage.get('carrito');
   * if (carrito) {
   *   console.log('Items en carrito:', carrito.length);
   * }
   */
  public async get<T = unknown>(key: string): Promise<T | null> {
    await this._initPromise;
    
    try {
      return await this._storage?.get(key) ?? null;
    } catch (error) {
      console.error(`Error al leer '${key}' del storage:`, error);
      return null;
    }
  }
  
  /**
   * Elimina un valor específico del storage.
   * 
   * @param key - Clave del dato a eliminar
   * @returns Promesa que se resuelve cuando se completa la eliminación
   * 
   * @example
   * await this.storage.remove('carrito');
   */
  public async remove(key: string): Promise<void> {
    await this._initPromise;
    
    try {
      await this._storage?.remove(key);
    } catch (error) {
      console.error(`Error al eliminar '${key}' del storage:`, error);
      throw error;
    }
  }

  /**
   * Limpia completamente el storage (elimina todos los datos).
   * ⚠️ PRECAUCIÓN: Esta operación es irreversible.
   * 
   * @returns Promesa que se resuelve cuando se completa la limpieza
   * 
   * @example
   * // Limpiar datos al cerrar sesión
   * await this.storage.clear();
   */
  public async clear(): Promise<void> {
    await this._initPromise;
    
    try {
      await this._storage?.clear();
    } catch (error) {
      console.error('Error al limpiar el storage:', error);
      throw error;
    }
  }
}
