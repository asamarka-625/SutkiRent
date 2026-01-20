import { useNavigate } from 'react-router-dom';
import { fetchAddress } from '../globalSettings.ts'
// 1. Тип для параметров (все поля необязательные)
type ObjectsDataParams = Partial<{
  cost_min: string;
  cost_max: string;
  type: string;
  amount_rooms_min: string;
  amount_rooms_max: string;
  floor_min: string;
  floor_max: string;
  region: string;
  city: string;
  space_min: string;
  space_max: string;
  booking_date_after: string;
  booking_date_before: string;
  amount_sleeps_min: string;
  amount_sleeps_max: string;
  view: string,
  toilet: string,
  near_metros: string;
  inRoom: string;
  availability: string;
  dopService: string;
  page: number;
}>;

// 2. Объект с дефолтными значениями (все поля = '')
const defaultParams = {
  cost_min: '',
  cost_max: '',
  type: '',
  amount_rooms_min: '',
  amount_rooms_max: '',
  floor_min: '',
  floor_max: '',
  region: '',
  city: '',
  space_min: '',
  space_max: '',
  booking_date_after: '',
  booking_date_before: '',
  amount_sleeps_min: '',
  amount_sleeps_max: '',
  near_metros: '',
  view: '',
  toilet: '',
} satisfies ObjectsDataParams; // (проверка, что defaultParams соответствует типу)


interface InventoryItem {
  id: number;
  name: string;
}

interface DataItem {
  id: number;
  inventory: InventoryItem;
  amount: number;
  object: number;
}

function buildQueryString(params: Record<string, any>): string {
  const queryParts: string[] = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    // Обработка специальных полей (списки через запятую)
    // if (['near_metro', 'type', 'view_from_window', 'bathroom'].includes(key)) {
    //   // Преобразуем "item1,item2" в "item1+item2"
    //   const formattedValue = String(value).split(',').join('+');
    //   queryParts.push(`${key}=${encodeURIComponent(formattedValue)}`);
    // }
    // Обработка числовых списков (inventories, services, accessibility)
    else if (['inventories', 'services', 'accessibility', 'inRoom', 'dopService', 
      'near_metro', 'type', 'view_from_window', 'bathroom'].includes(key)) {
      // Преобразуем "1,2" в "key=1&key=2"
      const items = String(value).split(',');
      items.forEach(item => {
        queryParts.push(`${key}=${encodeURIComponent(item.trim())}`);
      });
    }
    // Остальные параметры
    else {
      queryParts.push(`${key}=${encodeURIComponent(value)}`);
    }
  }

  return queryParts.join('&');
}

// Параллельная загрузка страниц RealtyCalendar
export async function getObjectsDataParallel(newParams: ObjectsDataParams = {}, maxPages: number = 10) {
  const finalParams = { ...defaultParams, ...newParams };
  
  // Формируем базовую строку запроса без rc_page
  const baseQueryString = buildQueryString({
    cost_min: finalParams.cost_min,
    cost_max: finalParams.cost_max,
    amount_rooms_min: finalParams.amount_rooms_min,
    amount_rooms_max: finalParams.amount_rooms_max,
    floor_min: finalParams.floor_min,
    floor_max: finalParams.floor_max,
    region: finalParams.region,
    city: finalParams.city,
    space_min: finalParams.space_min,
    space_max: finalParams.space_max,
    booking_date_after: finalParams.booking_date_after,
    booking_date_before: finalParams.booking_date_before,
    amount_sleeps_min: finalParams.amount_sleeps_min,
    amount_sleeps_max: finalParams.amount_sleeps_max,
    view_from_window: finalParams.view,
    bathroom: finalParams.toilet,
    type: finalParams.type,
    near_metro: finalParams.near_metros,
    inventories: finalParams.inRoom,
    services: finalParams.dopService,
    accessibility: finalParams.availability,
  });

  console.log('🚀 Параллельная загрузка страниц RealtyCalendar...');
  
  // Создаем массив промисов для параллельной загрузки страниц
  const pagePromises = Array.from({ length: maxPages }, (_, i) => i + 1).map(async (pageNum) => {
    const url = `${fetchAddress}/objects/?${baseQueryString}&rc_page=${pageNum}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        console.warn(`⚠️  Страница ${pageNum}: ${response.status}`);
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
  
  // Объединяем все результаты и фильтруем пустые страницы
  const allObjects = results.flat().filter(obj => obj);
  
  console.log(`📦 Всего загружено: ${allObjects.length} объектов`);
  
  return allObjects;
}

export async function getObjectsData(newParams: ObjectsDataParams = {}) {
  const finalParams = { ...defaultParams, ...newParams };

  const queryString = buildQueryString({
    cost_min: finalParams.cost_min,
    cost_max: finalParams.cost_max,
    amount_rooms_min: finalParams.amount_rooms_min,
    amount_rooms_max: finalParams.amount_rooms_max,
    floor_min: finalParams.floor_min,
    floor_max: finalParams.floor_max,
    region: finalParams.region,
    city: finalParams.city,
    space_min: finalParams.space_min,
    space_max: finalParams.space_max,
    booking_date_after: finalParams.booking_date_after,
    booking_date_before: finalParams.booking_date_before,
    amount_sleeps_min: finalParams.amount_sleeps_min,
    amount_sleeps_max: finalParams.amount_sleeps_max,
    view_from_window: finalParams.view,
    bathroom: finalParams.toilet,
    type: finalParams.type,
    near_metro: finalParams.near_metros,
    inventories: finalParams.inRoom,
    services: finalParams.dopService,
    accessibility: finalParams.availability,
    page: finalParams.page
  });

  const url = fetchAddress + '/objects/?' + queryString;
  

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      //   'X-Requested-With': 'XMLHttpRequest', //Necessary to work with request.is_ajax()
      //   'X-CSRFToken': 'csrftoken',
      //   'Authorization': ` Bearer ${localStorage.getItem("token")}`,
    }
  })
  return response
}



export async function getObjectDataById(id: string) {
  const response = await fetch(
    fetchAddress +
    '/objects/' + id + '/'
    // 'http://localhost:8000/api/objects/?cost_min=&cost_max=&type=&amount_rooms=&floor=&category=&region=&city=&space_min=&space_max='
    , {
      method: 'GET',
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

export async function getObjectCostByDate(id: string, dateB: string, dateE: string) {

  const response = await fetch('https://realtycalendar.ru/v2/widget/AAAwUw/price', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      begin_date: dateB,
      end_date: dateE,
      guests: { "adults": 1, "children": [] },
      apartment_id: id,
      arrival_time: null,
      departure_time: null,
    }),
  })

  return response
}

export async function getObjectCalendar(id: string, dateB: string, dateE: string) {

  const response = await fetch('https://realtycalendar.ru/v2/widget/AAAwUw/calendar', {
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


export async function setBron(
  id: string,
  guest: number,
  dateB: string,
  dateE: string,
  wish: string,
  first_name: string, // имя
  last_name: string, // фамилия
  phone: string, // телефон
  additional_phone: string, // доп телефон
  email: string, // почта
  bonuses_used: number = 0, // использовано бонусов
) {
  
  // Добавляем информацию о бонусах в поле пожеланий, если они используются
  let finalWish = wish || '';
  if (bonuses_used > 0) {
    finalWish = (finalWish ? finalWish + '\n\n' : '') + `Применены бонусы: списано ${bonuses_used} бонусов (1 бонус = 1 рубль).`;
  }
  
  // Отправляем бронирование в RealtyCalendar
  const response = await fetch('https://realtycalendar.ru/v2/widget/AAAwUw/confirm', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apartment_id: id,
      begin_date: dateB,
      end_date: dateE,
      guests: { "adults": guest, "children": [] },
      arrival_time: null,
      departure_time: null,
      redirect_url: "https://homereserve.ru/AAAwUw/status",
      wish: finalWish, // Используем finalWish с информацией о бонусах
      first_name: first_name,
      last_name: last_name,
      phone: phone,
      additional_phone: additional_phone,
      email: email,
      widget_type: "widget_page"
    }),
  })

  // Если бронирование в RealtyCalendar успешно, сохраняем в нашу БД
  if (response.ok) {
    try {
      const rcData = await response.json();
      const token = localStorage.getItem('token');
      
      if (token) {
        // Сохраняем бронирование в нашу БД
        await fetch('/api/bookings/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify({
            object_id: id,
            begin_date: dateB,
            end_date: dateE,
            guests: guest,
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            email: email,
            bonuses_used: bonuses_used,
            additional_phone: additional_phone,
            wish: finalWish, // Используем finalWish с информацией о бонусах
            external_id: rcData.reservation_id || '',
            status: 'pending'
          }),
        });
      }
    } catch (error) {
      console.error('Error saving booking to DB:', error);
    }
  }

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