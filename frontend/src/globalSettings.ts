
// Используем переменную окружения или дефолтный URL
export const fetchAddress = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:8000/api"

// Для production: https://sutki.rent/api
// Для development: http://localhost:8000/api

export const apiKey ="ddc28dec-68fa-4d60-a753-319a276620c5"

export const globalRef = {
  current: null as HTMLElement | null,
};
