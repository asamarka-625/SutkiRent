import { useEffect } from "react";

export const YandexMap = ({ lat, lon, zoom = 15 }) => {

  
  return (
    <iframe
      src={`https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=${zoom}&l=map&pt=${lon}%2C${lat}%2Cpm2blm`}
      width="100%"
      height="400"
      frameBorder="0"
      allowFullScreen
      title="Yandex Map with Marker"
    ></iframe>
  );
};