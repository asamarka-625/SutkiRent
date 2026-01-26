import { showNotification } from "@mantine/notifications";
import { Cookies } from "react-cookie-consent";
import { globalRef } from "../globalSettings";
// import { LikeSVG } from '../icons/like.svg?react'; // Импортируем ваш SVG

type FavoriteItem = {
    id: number;
    dateIn?: string | undefined; 
    dateOut?: string | undefined;
}

const COOKIE_OPTIONS = {
    expires: 30,
};
let consent = Cookies.get('cookie_consent');
const getFavorites = (): FavoriteItem[] => {
    const favorites = Cookies.get('favorites');
    return favorites ? JSON.parse(favorites) : [];
};


export async function showFavorites(): Promise<FavoriteItem[]> {
    const token = localStorage.getItem('token');
    
    // Если пользователь авторизован, используем API
    if (token) {
        try {
            const response = await fetch('/api/favorites/my/', {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.favorites) {
                    // Преобразуем данные API в формат FavoriteItem
                    return data.favorites.map((fav: any) => ({
                        id: fav.object_id,
                        dateIn: fav.date_in || undefined,
                        dateOut: fav.date_out || undefined,
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading favorites from API:', error);
        }
    }
    
    // Fallback на cookies для неавторизованных пользователей
    let consent = Cookies.get('cookie_consent');
    if (consent === 'true') {
        try {
            return getFavorites()
        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
            Cookies.remove('favorites');
        }
    }
    
    return [];
};

export const updateFavorites = async (id: number | string, dateIn: string | undefined, dateOut: string | undefined) => {
    const token = localStorage.getItem('token');
    
    // Если пользователь не авторизован, используем cookies как fallback
    if (!token) {
        let consent = Cookies.get('cookie_consent');
        if (consent != 'true') {
            showNotification({
                title: "Чтобы добавить объект в избранное войдите или подключите cookie",
                message: undefined,
                color: 'green',
            })
            if (globalRef.current) {
                globalRef.current.style.display = '';
                globalRef.current.style.animation = 'fadeIn 0.5s forwards';
            }
            return 0;
        }
        // Fallback на cookies для неавторизованных пользователей
        const currentFavorites = getFavorites();
        const existingIndex = currentFavorites.findIndex(fav => fav.id === id);
        let newFavorites: FavoriteItem[];

        if (existingIndex >= 0) {
            newFavorites = currentFavorites.filter(fav => fav.id !== id);
            showNotification({
                title: "Удалено из избранного",
                message: undefined,
                color: 'green',
            })
        } else {
            newFavorites = [...currentFavorites, { id: id, dateIn: dateIn, dateOut: dateOut }];
            showNotification({
                title: "Добавлено в избранное",
                message: undefined,
                color: 'green',
            })
        }
        Cookies.set('favorites', JSON.stringify(newFavorites), COOKIE_OPTIONS);
        // Триггерим событие для обновления страницы избранного
        window.dispatchEvent(new Event('favoritesUpdated'));
        return 1;
    }
    
    // Используем API для авторизованных пользователей
    try {
        const response = await fetch('/api/favorites/toggle/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({
                object_id: id,
                date_in: dateIn,
                date_out: dateOut,
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification({
                title: data.message || (data.action === 'added' ? 'Добавлено в избранное' : 'Удалено из избранного'),
                message: undefined,
                color: 'green',
            });
            // Триггерим событие для обновления страницы избранного
            window.dispatchEvent(new Event('favoritesUpdated'));
            return 1;
        } else {
            const errorData = await response.json();
            showNotification({
                title: errorData.error || 'Ошибка при обновлении избранного',
                message: undefined,
                color: 'red',
            });
            return 0;
        }
    } catch (error) {
        console.error('Error updating favorites:', error);
        showNotification({
            title: 'Ошибка соединения с сервером',
            message: undefined,
            color: 'red',
        });
        return 0;
    }
};




// export const casheNews = (objects) => {
//     let consent = Cookies.get('cookie_consent');
//     if (consent != 'true') {
//         showNotification({
//             title: "Долгая загрузка? Разрешите",
//             message: undefined,
//             // icon: LikeSVG,
//             color: 'green',
//         })
//         if (globalRef.current) {
//             globalRef.current.style.display = '';
//             globalRef.current.style.animation = 'fadeIn 0.5s forwards';
//         }
//         return 0;
//         // Cookies.remove('cookie_consent');
//     }
//     const currentFavorites = getFavorites();

//     const existingIndex = currentFavorites.findIndex(fav => fav.id === id);
//     let newFavorites: FavoriteItem[];

//     if (existingIndex >= 0) {
//         // Удаляем объект, если он уже есть в избранном
//         newFavorites = currentFavorites.filter(fav => fav.id !== id);
//         // alert('Удалено из избранного');

//         showNotification({
//             title: "Удалено из избранного",
//             message: undefined,
//             // icon: LikeSVG,
//             color: 'green',
//         })

//     } else {
//         // Добавляем объект, если его нет в избранном
//         newFavorites = [...currentFavorites, { id: id, dateIn: dateIn, dateOut: dateOut }];
//         showNotification({
//             title: "Добавлено в избранное",
//             message: undefined,
//             // icon: LikeSVG,
//             color: 'green',
//         })
//     }

//     // const newFavorites = currentFavorites.includes(id)
//     //     ? currentFavorites.filter(item => item !== id)
//     //     : [...currentFavorites, { id: id }];

//     Cookies.set('favorites', JSON.stringify(newFavorites), COOKIE_OPTIONS);

//     return 1;
// };

// const toggleFavorite = (id) => {
//     setFavorites(prev => {
//         if (prev.includes(id)) {
//             return prev.filter(item => item !== id);
//         } else {
//             return [...prev, id];
//         }
//     });
// };

// Cookies.set('favorites', JSON.stringify(favorites), { expires: 30 });

// return response
// }

export async function setConsent(init: boolean) {
    if (init) {
        Cookies.set('cookie_consent', 'true', { expires: 365 });
    }
    else {
        Cookies.set('cookie_consent', 'false', { expires: 365 });
        // Удаляем все необязательные куки
        Cookies.remove('favorites');
    }
}