
export function saveCurrentUrl() {
  if (typeof window === 'undefined') return;
  
  const fullUrl = window.location.href;
  sessionStorage.setItem('previousPageUrl', fullUrl);
}

/**
 * Переходит на сохраненный URL или на главную страницу
 * Принимает navigate функцию из useNavigate() для SPA-навигации без перезагрузки
 */
export function navigateBack(navigate?: (path: string) => void) {
  if (typeof window === 'undefined') return;

  const savedUrl = sessionStorage.getItem('previousPageUrl');
  if (savedUrl) {
    const url = new URL(savedUrl);
    const path = url.pathname + url.search + url.hash;
    sessionStorage.removeItem('previousPageUrl');
    
    if (navigate) {
      // SPA-навигация без перезагрузки (состояние восстановится из sessionStorage)
      navigate(path);
    } else {
      // Fallback на полную перезагрузку, если navigate не передан
      window.location.href = path;
    }
  } else {
    if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  }
}
