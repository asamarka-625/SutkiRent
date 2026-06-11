import { fetchAddress } from '../globalSettings.ts'
import AuthService from './authService' // импортируем ваш сервис

// Тип для нового формата запроса (все поля необязательные)
type ObjectsRequestParams = Partial<{
  page: number;
  page_size: number;
  adults: number;
  children: string; // JSON строка: [{"age": цифра}]
  region_id: number;
  start_date: string; // "год-месяц-день"
  end_date: string; // "год-месяц-день"
  price: {
    min: number;
    max: number;
  };
  sleep: {
    min: number;
    max: number;
  };
  floor: {
    min: number;
    max: number;
  };
  area: {
    min: number;
    max?: number;
  };
  room: {
    min: number;
    max: number;
  };
}>;

// Параллельная загрузка страниц
export async function getObjectsDataParallel(requestParams: ObjectsRequestParams = {}, maxPages: number = 10) {
  // Базовый запрос без page
  const baseParams = { ...requestParams };
  delete baseParams.page;
  
  // Гарантируем page_size = 10 и area.min = 50
  const baseBody = {
    page_size: 10,

    ...baseParams
  };
  
  console.log('🚀 Параллельная загрузка объектов...');
  
  // Создаем массив промисов для параллельной загрузки страниц
  const pagePromises = Array.from({ length: maxPages }, (_, i) => i + 1).map(async (pageNum) => {
    const requestBody = {
      ...baseBody,
      page: pageNum
    };
    
    try {
      const response = await fetch(`${fetchAddress}/objects/`, {
        method: 'POST', // или 'GET' в зависимости от вашего API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Страница ${pageNum}: ${response.status}`);
        return [];
      }
      
      const responseData = await response.json();
      const data = Array.isArray(responseData) ? responseData : (responseData.results || []);
      console.log(`✅ Страница ${pageNum}: ${data.length} объектов`);
      return data;
    } catch (error) {
      console.error(`❌ Ошибка загрузки страницы ${pageNum}:`, error);
      return [];
    }
  });

  // Ждем все промисы
  const results = await Promise.all(pagePromises);
  
  // Объединяем все результаты и фильтруем пустые
  const allObjects = results.flat().filter(obj => obj);
  
  console.log(`📦 Всего загружено: ${allObjects.length} объектов`);
  
  return allObjects;
}

// Обычная загрузка одной страницы
export async function getObjectsData(requestParams: ObjectsRequestParams = {}) {
  // Гарантируем page_size = 10 и area.min = 50
  const requestBody = {
    page_size: 10,
    ...requestParams
  };
  
  const response = await fetch(`${fetchAddress}/objects/`, {
    method: 'POST', 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody)
  });
  
  return response;
}

export async function getFeatObjectsData(requestParams: ObjectsRequestParams = {}) {
  // Гарантируем page_size = 10 и area.min = 50
  const requestBody = {
    page_size: 6,
    ...requestParams
  };
  
  const response = await fetch(`${fetchAddress}/objects/`, {
    method: 'POST', 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody)
  });
  
  return response;
}

export async function getObjectDataById(id: string) {
  const response = await fetch(
    fetchAddress +
    '/objects/' + id
    // 'http://localhost:8000/api/objects/?cost_min=&cost_max=&type=&amount_rooms=&floor=&category=&region=&city=&space_min=&space_max='
    , {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
        //   'X-CSRFToken': 'csrftoken',
        //   'Authorization': ` Bearer ${localStorage.getItem("token")}`,
      }
    })
  return response
}

function getAggregatedInventoryForObject(data: DataItem[], objectId: number): { inventory: InventoryItem, totalAmount: number }[] {
  const inventoryMap = new Map<number, { inventory: InventoryItem, totalAmount: number }>();

  data.forEach(item => {
    if (item.object === objectId) {
      const existing = inventoryMap.get(item.inventory.id);
      if (existing) {
        existing.totalAmount += item.amount;
      } else {
        inventoryMap.set(item.inventory.id, {
          inventory: { ...item.inventory },
          totalAmount: item.amount
        });
      }
    }
  });

  return Array.from(inventoryMap.values());
}


// POST https://realtycalendar.ru/v2/widget/AAAwUw/price
//   body: 
// {"begin_date":"2025-08-01","end_date":"2025-08-16",
//   "guests":{"adults":1,"children":[]},
//   "apartment_id":47105,
//   "arrival_time":null,
//   "departure_time":null}

export async function getObjectCostByDate(id: string, dateB: string, dateE: string, guests: number, promo?: string) {

  const response = await fetch(fetchAddress + '/booking/price', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      begin_date: dateB,
      end_date: dateE,
      guests: { "adults": guests || 1, "children": [] },
      apartment_id: id,
      arrival_time: null,
      departure_time: null,
      ...(promo && { promo_code: promo }),
    }),
  })

  return response
}

export async function getObjectCalendar(id: string, dateB: string, dateE: string) {

  const response = await fetch(fetchAddress + '/booking/calendar', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apartment_id: id,
      begin_date: dateB,
      end_date: dateE,
      guests: { "adults": 1, "children": [] },

    }),
  })

  return response
}


export async function getPromo(id: string, dateB: string, dateE: string, guests: number, promo: string) {

  const response = await fetch('https://realtycalendar.ru/v2/widget/AAAwUw/check_promo_code', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      begin_date: dateB,
      end_date: dateE,
      guests: { "adults": guests || 1, "children": [] },
      apartment_id: id,
      arrival_time: null,
      departure_time: null,
      promo_code: promo
    }),
  })

  return response
}


export async function setBron(
  id: string,
  guest: number,
  dateB: string,
  dateE: string,
  first_name: string, // имя
  last_name: string, // фамилия
  phone: string, // телефон
  additional_phone: string, // доп телефон
  email: string, // почта
  promo?: string

) {
  
  // Добавляем информацию о бонусах в поле пожеланий, если они используются
  
  // Отправляем бронирование в RealtyCalendar
  const response = await AuthService.apiRequestPartial(fetchAddress + '/booking/create', {
    method: 'POST',
    body: JSON.stringify({
      apartment_id: id,
      begin_date: dateB,
      end_date: dateE,
      guests: { "adults": guest, "children": [] },
      arrival_time: null,
      departure_time: null,
      redirect_url: "https://homereserve.ru/AAAwUw/status",
       ...(promo && { promo_code: promo }),
      first_name: first_name,
      last_name: last_name,
      phone: phone,
      additional_phone: additional_phone,
      email: email,
      widget_type: "widget_page"
    }),
  })

  return response
}



export async function getFavoriteObjects(id: number[]) {

  const response = await fetch(fetchAddress +
    '/objects/list/by/ids' , {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids: id,
    }),
  })

  return response
}

// export const useNavigationHistory = () => {
//   const router = useNavigate();

//   const saveCurrentUrl = () => {
//     if (typeof window !== 'undefined') {
//       // Сохраняем полный URL с параметрами
//       const fullUrl = window.location.href;
//       sessionStorage.setItem('previousPageUrl', fullUrl);
//     }
//   };

//   const navigateToSavedUrl = () => {
//     if (typeof window !== 'undefined') {
//       const savedUrl = sessionStorage.getItem('previousPageUrl');
//       if (savedUrl) {
//         // Извлекаем pathname и query из сохраненного URL
//         const url = new URL(savedUrl);
//         router(url)
//       } else {
//         router('/') // На главную если нет сохраненного URL
//       }
//     }
//   };

//   return { saveCurrentUrl, navigateToSavedUrl };
// };




// POST https://realtycalendar.ru/v2/widget/AAAwUw/calendar
// body:
// {
//   apartment_id "47128"
//   begin_date "2025-04-01"
//   end_date "2025-05-31"
//   guests {
//         adults 1
//         children []
//     }
// }


// export async function getObjectInventoryData(id: string) {
//   const response = await fetch(
//     fetchAddress +
//     '/objects/object-inventory/'
//     , {
//       method: 'GET',
//       headers: {
//         "Content-Type": "application/json",
//         //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
//         //   'X-CSRFToken': 'csrftoken',
//         //   'Authorization': ` Bearer ${localStorage.getItem("token")}`,
//       }
//     })

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//   }
//       const data = await response.json();
//       const aggregatedInventory = getAggregatedInventoryForObject(data, Number(id));
//       console.log(aggregatedInventory);
//       return aggregatedInventory;

// }















//     я обращась к апи с фронта функцией

// const response = await fetch(
//             'http://localhost:8000/api/objects/?cost_min=&cost_max=&type=&amount_rooms=&floor=&category=&region=&city=&space_min=&space_max='
//             , {
//               method: 'GET',
//               headers: {
//                   "Content-Type": "application/json",
//                 //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
//                 //   'X-CSRFToken': 'csrftoken',
//               }
//           })
//           return response
//     }

// но получаю CORS ошибку совместного использхвоания ресурсов 
//       const aggregatedInventory = getAggregatedInventoryForObject(data, Number(id));
//       console.log(aggregatedInventory);
//       return aggregatedInventory;

// }















//     я обращась к апи с фронта функцией

// const response = await fetch(
//             'http://localhost:8000/api/objects/?cost_min=&cost_max=&type=&amount_rooms=&floor=&category=&region=&city=&space_min=&space_max='
//             , {
//               method: 'GET',
//               headers: {
//                   "Content-Type": "application/json",
//                 //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
//                 //   'X-CSRFToken': 'csrftoken',
//               }
//           })
//           return response
//     }

// но получаю CORS ошибку совместного использхвоания ресурсов 