class InventoryService {
  private static instance: InventoryService;
  private token: string | null = null;
  private accessToken: string | null = null;
  private csrfToken: string | null = null;

  private constructor() {
    // Загружаем данные из localStorage при инициализации
    this.token = localStorage.getItem('token');
    this.accessToken = localStorage.getItem('access_token');
    this.csrfToken = localStorage.getItem('csrf_token');
    console.log('InventoryService initialized with tokens:', {
      token: !!this.token,
      accessToken: !!this.accessToken,
      csrfToken: !!this.csrfToken
    });
  }

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  /**
   * Базовый метод для выполнения API запросов с автоматическим обновлением токена
   */
  private async apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Не авторизован');
    }

    const headers = {
      'Authorization': 'Bearer ' + this.accessToken,
      'X-CSRF-Token': this.csrfToken || '',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });

    // Если получили 401, пробуем обновить токен
    if (response.status === 401) {
      await this.checkAuthNatural(); 
      
      // Обновляем заголовки с новым токеном
      headers['Authorization'] = 'Bearer ' + this.accessToken;
      headers['X-CSRF-Token'] = this.csrfToken || '';
      
      response = await fetch(url, { ...options, headers });
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Ошибка запроса: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Проверка и обновление токена
   */
  public async checkAuthNatural(): Promise<void> {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.csrfToken = data.csrf_token;

        // Обновляем в localStorage
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        if (data.csrf_token) {
          localStorage.setItem('csrf_token', data.csrf_token);
        }
      }
    } catch (error) {
      console.error("Ошибка фонового обновления токена:", error);
      throw new Error('Не удалось обновить токен авторизации');
    }
  }

  /**
   * Получение списка всех предметов инвентаря (items)
   * GET /api/objects/items
   */
  public async getItems(): Promise<InventoryItem[]> {
    try {
      return await this.apiRequest<InventoryItem[]>('/api/objects/items');
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Получение списка всех брендов/моделей
   * GET /api/objects/brands
   */
  public async getBrands(): Promise<Brand[]> {
    try {
      return await this.apiRequest<Brand[]>('/api/objects/brands');
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Получение инвентаря для конкретной квартиры
   * GET /api/objects/inventory/{apartment_id}
   */
  public async getApartmentInventory(apartmentId: number | string): Promise<ApartmentInventory[]> {
    try {
      return await this.apiRequest<ApartmentInventory[]>(`/api/objects/inventory/${apartmentId}`);
    } catch (error) {
      console.error(`Error fetching inventory for apartment ${apartmentId}:`, error);
      throw error;
    }
  }

  /**
   * Обновление инвентаря для конкретной квартиры
   * PATCH /api/objects/inventory/{apartment_id}
   */
  public async updateApartmentInventory(
    apartmentId: number | string, 
    inventory: ApartmentInventoryUpdate[]
  ): Promise<ApartmentInventory[]> {
    try {
      return await this.apiRequest<ApartmentInventory[]>(`/api/objects/inventory/${apartmentId}`, {
        method: 'PATCH',
        body: JSON.stringify(inventory),
      });
    } catch (error) {
      console.error(`Error updating inventory for apartment ${apartmentId}:`, error);
      throw error;
    }
  }

  /**
   * Получение всех объектов (квартир) для которых есть инвентарь
   * Этот метод нужно добавить, если есть соответствующий эндпоинт
   */
  public async getApartments(): Promise<Apartment[]> {
    try {
      return await this.apiRequest<Apartment[]>('/api/objects/apartments');
    } catch (error) {
      console.error('Error fetching apartments:', error);
      throw error;
    }
  }

  /**
   * Проверка авторизации
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Обновление токенов из localStorage (полезно после логина в другом месте)
   */
  public refreshTokensFromStorage(): void {
    this.token = localStorage.getItem('token');
    this.accessToken = localStorage.getItem('access_token');
    this.csrfToken = localStorage.getItem('csrf_token');
  }

  /**
   * Очистка токенов при выходе
   */
  public clearTokens(): void {
    this.token = null;
    this.accessToken = null;
    this.csrfToken = null;
  }
}

// Типы данных для инвентаря
interface InventoryItem {
  id: number;
  name: string;
  // добавьте другие поля согласно API
}

interface Brand {
  id: number;
  name: string;
  // добавьте другие поля согласно API
}

interface ApartmentInventory {
  id?: number;
  item_id: number;
  brand_id: number;
  quantity: number;
  price: number;
  // добавьте другие поля согласно API
  item_name?: string;
  brand_name?: string;
}

interface ApartmentInventoryUpdate {
  item_id: number;
  brand_id: number;
  quantity: number;
  price: number;
}

interface Apartment {
  id: number;
  name: string;
  address?: string;
  // добавьте другие поля согласно API
}

export default InventoryService.getInstance();