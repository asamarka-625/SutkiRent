import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Sutki Rent';
const SITE_URL = 'https://sutki.rent';
const DEFAULT_TITLE =
  'Sutki Rent — посуточная аренда квартир в Санкт-Петербурге и регионах РФ';
const DEFAULT_DESCRIPTION =
  'Посуточная и долгосрочная аренда комфортного жилья любого класса от центра до окраин. Более 100 объектов в управлении, 15 лет на рынке, 4 региона присутствия.';
// TODO: заменить на брендовое изображение 1200×630 (сейчас — временная заглушка).
const DEFAULT_IMAGE = '/background.jpg';

export interface SeoProps {
  /** Заголовок страницы. Будет показан как «<title> — Sutki Rent». */
  title?: string;
  description?: string;
  /** Путь или абсолютный URL изображения для превью ссылки. */
  image?: string;
  /** Запретить индексацию страницы (ЛК, служебные). */
  noindex?: boolean;
}

export function Seo({ title, description, image, noindex }: SeoProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const img = image ?? DEFAULT_IMAGE;
  const absoluteImg = img.startsWith('http') ? img : `${SITE_URL}${img}`;
  const url =
    typeof window !== 'undefined' ? window.location.href : SITE_URL;

  return (
    <Helmet>
      <html lang="ru" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={absoluteImg} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={absoluteImg} />
    </Helmet>
  );
}
