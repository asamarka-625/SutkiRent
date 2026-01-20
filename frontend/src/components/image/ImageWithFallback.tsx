import { useState, useEffect, useRef } from "react";

export const ImageWithFallback = ({ src, alt, fallbackSrc = "/404.jpg", maxRetries = 3, retryDelay = 1000, wrapperStyle = {}, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || "/404.jpg");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCount = useRef(0);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Сброс состояния при изменении src
    setImgSrc(src || "/404.jpg");
    setIsLoading(true);
    setHasError(false);
    retryCount.current = 0;
    
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [src]);

  const handleError = () => {
    if (retryCount.current < maxRetries) {
      // Пробуем загрузить снова через задержку
      retryCount.current += 1;
      setIsLoading(true);
      
      retryTimeout.current = setTimeout(() => {
        // Просто повторяем попытку загрузки того же URL без изменений
        // Форсируем перезагрузку через изменение состояния
        setImgSrc('');
        setTimeout(() => setImgSrc(src), 10);
      }, retryDelay * retryCount.current); // Увеличиваем задержку с каждой попыткой
    } else {
      // Все попытки исчерпаны - показываем fallback
      setIsLoading(false);
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
      ...wrapperStyle 
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(22, 163, 74, 0.1)',
            borderTop: '4px solid rgba(22, 163, 74, 1)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        style={{ 
          opacity: hasError ? 0.2 : (isLoading ? 0.5 : 1),
          transition: 'opacity 0.3s ease-in-out',
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'block',
          ...props.style 
        }}
        {...props}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};