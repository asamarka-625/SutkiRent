import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Соответствие путей и заголовков страниц ЛК
const PAGE_TITLES: Record<string, string> = {
  '/lk': 'Профиль',
  '/lk/bookings': 'Мои бронирования',
  '/lk/favorites': 'Избранное',
  '/lk/bonus': 'Бонусный счет',
  '/lk/notifications': 'Уведомления',
  '/lk/settings': 'Настройки',
};

const DEFAULT_TITLE = 'Профиль';

export function usePageName() {
  const location = useLocation();
  const [pageName, setPageName] = useState(DEFAULT_TITLE);

  const displayPageName = useCallback(() => {
    const newPageName = PAGE_TITLES[location.pathname] || DEFAULT_TITLE;
    setPageName(newPageName);
  }, [location.pathname]);

  useEffect(() => {
    displayPageName();
  }, [displayPageName]);

  return pageName;
}


