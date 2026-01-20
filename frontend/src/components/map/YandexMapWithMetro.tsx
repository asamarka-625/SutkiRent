import { useEffect, useRef, useState } from "react";
import { apiKey } from "../../globalSettings";
import WalkSVG from "../../icons/Walk.svg?react"

declare global {
  interface Window {
    ymaps: any;
    ymapsLoaded?: boolean;
    ymapsLoading?: boolean;
  }
}

export const YandexMap = ({ lat, lon, zoom = 15 }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [metroInfo, setMetroInfo] = useState("");
  const [mapStatus, setMapStatus] = useState({ loaded: false, error: null });

  useEffect(() => {
    // Очищаем предыдущую карту при размонтировании или изменении параметров
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [lat, lon, zoom]);

  useEffect(() => {
    if (!lat || !lon) return;

    // Если карта уже создана, просто обновляем центр
    if (mapInstance.current) {
      mapInstance.current.setCenter([lat, lon]);
      findNearestMetro(lat, lon);
      return;
    }

    if (window.ymapsLoaded) {
      initMap();
      return;
    }

    if (window.ymapsLoading) {
      // Ждем загрузки API и затем инициализируем карту
      const checkApiLoaded = () => {
        if (window.ymapsLoaded) {
          initMap();
        } else {
          setTimeout(checkApiLoaded, 100);
        }
      };
      checkApiLoaded();
      return;
    }

    window.ymapsLoading = true;
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;

    script.onload = () => {
      window.ymaps.ready(() => {
        window.ymapsLoaded = true;
        window.ymapsLoading = false;
        setMapStatus({ loaded: true, error: null });
        initMap();
      });
    };

    script.onerror = () => {
      window.ymapsLoading = false;
      setMapStatus({ loaded: false, error: "Ошибка загрузки Яндекс Карт" });
    };

    document.head.appendChild(script);
  }, [lat, lon, zoom]);

  const initMap = () => {
    try {
      // Убедимся, что карта еще не создана
      if (mapInstance.current) return;

      const map = new window.ymaps.Map(mapRef.current, {
        center: [lat, lon],
        zoom: zoom,
        controls: ['zoomControl']
      });

      const placemark = new window.ymaps.Placemark([lat, lon], {}, {
        preset: 'islands#blueDotIcon'
      });

      map.geoObjects.add(placemark);
      mapInstance.current = map;

      findNearestMetro(lat, lon);

    } catch (error) {
      setMapStatus({ loaded: false, error: error.message });
    }
  };

  const findNearestMetro = (latitude, longitude) => {
    window.ymaps.geocode([latitude, longitude], {
      kind: 'metro',
      results: 1
    }).then((res) => {
      const metro = res.geoObjects.get(0);
      if (metro) {
        const metroCoords = metro.geometry.getCoordinates();
        const metroName = metro.properties.get('name');
        const distance = calculateDistance([latitude, longitude], metroCoords);
        const walkingTime = Math.round(distance / 80);
        setMetroInfo(`До ${metroName}: ~${walkingTime} мин пешком`);
      } else {
        setMetroInfo("Ближайшее метро не найдено");
      }
    }).catch(() => {
      setMetroInfo("Не удалось найти метро");
    });
  };

  const calculateDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />

      {metroInfo && (
        <div style={{ padding: "15px", 
        // backgroundColor: "#f5f5f5",
         width: "100%", alignItems: "center" }}>
          <div style={{ display: "flex", marginLeft: "5px" }}>
            <WalkSVG width="22" height="22"></WalkSVG>
            <div style={{ marginLeft: "15px", fontWeight: "500", color: "var(--mantine-color-grayColor-7)" }}>{metroInfo}</div>
          </div>
        </div>
      )}

      {mapStatus.error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          {mapStatus.error}
        </div>
      )}
    </div>
  );
};