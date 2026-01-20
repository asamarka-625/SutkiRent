import React, { useEffect, useRef, useState } from 'react';
import { ObjectLandingCard } from '../../pages/LandingPage/objectsLanding/objectLandingCard/objectLandingCard.tsx';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Flex, MantineProvider } from '@mantine/core';
import { DetailsButton } from '../buttons/detailsButton.tsx';
import { saveCurrentUrl } from '../../handlers/urlSaveHandler.ts';


interface Banner {
    id: string;
    name: string;
}

interface Point {
    id: number;
    coordinates: [number, number];
    // cost: string;
    media: {
        source_type: string; // или union тип, если возможны другие варианты
        url: string;
    };
    space: number;
    amount_rooms: number;
    address: string;
    floor: number;
    short_name: string;
    cost: number;
    type: string | null;
    sleeps: string;
    capacity: number;
    region: string | null;
    city: string;
    banner: Banner | null;
    near_metro: []; // или MetroStation[], если есть тип для станций метро
}

interface YMapProps {
    points: Point[];
    // center?: [number, number];
    zoom?: number;
    apiKey?: string;
    width?: string;
    height?: string;
    refreshList: (id: number) => void; // Добавили параметр id
    highlightedObjectId: number | null;
    visibleObj: (obj: Point[]) => void;
    sethighlightedObjectId: (id: number | null) => void
}


const YMap: React.FC<YMapProps> = ({
    points = [],
    // center = [55.751574, 37.573856],
    zoom = 10,
    apiKey = '',
    width = '100%',
    height = '100%',
    refreshList,
    visibleObj,
    highlightedObjectId,
    sethighlightedObjectId
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [ymapsLoaded, setYmapsLoaded] = useState(false);
    const mapInstance = useRef<ymaps.Map | null>(null);
    const objectManager = useRef<ymaps.ObjectManager | null>(null);


    useEffect(() => {
        (window as any).yourComponentRef = {
            handleDetailsClick: (id: number) => {
                saveCurrentUrl()
                //('Clicked on details for:', id);
                refreshList(id); // ваша существующая функция
                // Можно добавить дополнительную логику
            }
        };

        return () => {
            delete (window as any).yourComponentRef;
        };
    }, [refreshList]);

    // Загрузка API Яндекс.Карт
    useEffect(() => {
        const loadYmaps = async () => {
            try {
                if (window.ymaps) {
                    setYmapsLoaded(true);
                    return;
                }

                const script = document.createElement('script');
                script.src = `https://api-maps.yandex.ru/2.1/?${apiKey ? `apikey=${apiKey}&` : ''}lang=ru_RU`;
                script.async = true;

                script.onload = () => {
                    try {
                        window.ymaps.ready(() => {
                            setYmapsLoaded(true);
                        });
                    } catch (error) {
                        console.error('Error in ymaps.ready callback:', error);
                        // Можно добавить дополнительную обработку ошибок
                    }
                };

                script.onerror = () => {
                    console.error('Failed to load Yandex Maps API');
                    // Можно добавить состояние ошибки в стейт
                };

                document.head.appendChild(script);

                return () => {
                    document.head.removeChild(script);
                };
            } catch (error) {
                console.error('Error in Yandex Maps loading process:', error);
                // Можно добавить обработку глобальных ошибок
            }
        };

        loadYmaps();
    }, [apiKey]);

    // Инициализация карты
    useEffect(() => {
        if (!ymapsLoaded || !mapRef.current) return;
        try {
            // Инициализируем карту с временным центром
            mapInstance.current = new window.ymaps.Map(mapRef.current, {
                center: [59.938800, 30.314354], // Временный центр
                zoom: zoom,
                controls: ['zoomControl']
            });

            const injectBalloonStyles = () => {
                const mapFrame = document.querySelector('.ymaps-2-1-79-iframe');
                if (!mapFrame) return;

                const frameDoc = mapFrame.contentDocument || mapFrame.contentWindow.document;

                const style = frameDoc.createElement('style');
                style.textContent = `
      /* Основные стили для прозрачности */
      .ymaps-2-1-79-balloon,
      .ymaps-2-1-79-balloon__layout,
      .ymaps-2-1-79-balloon__content {
        background: transparent !important;
        box-shadow: none !important;
        overflow: hidden !important;
        padding: 0 !important;
      }
      
      /* Убираем хвостик */
      .ymaps-2-1-79-balloon__tail {
        display: none !important;
      }
      
      /* Убираем скроллбары */
      .ymaps-2-1-79-balloon__content {
        overflow: hidden !important;
        margin-right: 0 !important;
      }
      
      /* Ваши кастомные стили */
      .address {
        font-size: 14px;
        color: #666;
      }
    `;

                frameDoc.head.appendChild(style);
            };

            mapInstance.current.events.add('load', injectBalloonStyles);
            const styleInterval = setInterval(injectBalloonStyles, 1000);

            var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
                // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
                '<div class="cluster-item">' +
                '{{ properties.balloonContentBody | raw }}' +
                '</div>'
            );

            objectManager.current = new window.ymaps.ObjectManager({
                clusterize: true,
                gridSize: 32,
                clusterDisableClickZoom: true,
                //ЗДЕСЬ прописать внутренности кластера

                clusterBalloonContentLayout: 'cluster#balloonCarousel',
                clusterBalloonItemContentLayout: customItemContentLayout,

                // Настройки для элементов карусели
                //     clusterBalloonItemContentLayout: ymaps.templateLayoutFactory.createClass(
                //     '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
                //     '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
                //     '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
                // ),

                // Опции иконок кластеров
                clusterIconLayout: 'default#pieChart',
                clusterIconPieChartRadius: 24,
                clusterIconPieChartCoreRadius: 18,
                clusterIconPieChartStrokeWidth: 0,
                // clusterBalloonContentLayoutWidth: 350,
                clusterBalloonContentLayoutHeight: 400,
            });




            objectManager.current.clusters.options.set({
                clusterBalloonContentLayoutWidth: 350,
                clusterBalloonContentLayoutHeight: 250,
                clusterBalloonItemContentLayoutHeight: 180,
                clusterBalloonPagerVisible: true,
                // preset: 'islands#invertedGreenClusterIcons', // стиль иконки
                // clusterIconHeight: 40,                       // высота иконки кластера
                // clusterIconWidth: 40,                        // ширина иконки кластера
                //   clusterNumbers: [10, 30, 100],               // уровни кластеризации (при каком количестве объединять)
                // clusterDisableClickZoom: true,               // отключить зум при клике
                // clusterHideIconOnBalloonOpen: false,         // скрывать ли иконку при открытии балуна
                clusterBalloonContentLayout: 'cluster#balloonCarousel' // шаблон балуна
            });

            // objectManager.current.objects.options.set('preset', 'islands#blueDotIcon');

            mapInstance.current.geoObjects.add(objectManager.current);

            // Обработчик клика
            objectManager.current.objects.events.add('click', (e: any) => {
                const objectId = e.get('objectId');
                const object = objectManager.current?.objects.getById(objectId);
                if (object) {
                    //('Clicked object:', object);
                    // refreshList()
                }
            });

            // const updateVisibleObjects = () => {
            //     // console.log('update da obj')
            //     if (!mapInstance.current) return;

            //     const bounds = mapInstance.current.getBounds();
            //     const filtered = points.filter(obj => {
            //         return bounds.contains([obj.coordinates[0], obj.coordinates[1]]);
            //     });
            //     if (filtered.length != 0) visibleObj(filtered);
            // };

            // objectManager.current.objects.events.add('boundschange', alert('boundschange'));



            objectManager.current.events.add('mouseenter', (e: any) => {
                console.group('mouseenter')
                console.log(e.get('objectId') + e.get('target') + typeof e.get('target').getGeoObjects)
                console.groupEnd();
                var objectState = objectManager?.current?.getObjectState(e.get('target'));
                // sethighlightedObjectId(e.get('objectId'))
                if (!objectState?.isClustered) {
                    console.log('sethighlightedObjectId')
                    sethighlightedObjectId(e.get('objectId'))
                }

                objectManager?.current?.objects.setObjectOptions(e.get('objectId'),
                    { preset: 'islands#orangeStretchyIcon' });

                // objectManager?.current?.clusters.setClusterOptions(e.get('objectId'),
                //     { preset: 'islands#invertedOrangeClusterIcons' });

            });

            objectManager.current.events.add('mouseleave', (e: any) => {
                // sethighlightedObjectId(null)
                objectManager?.current?.objects.setObjectOptions(e.get('objectId'),
                    { preset: 'islands#darkGreenStretchyIcon' });


                // objectManager?.current?.clusters.getObject(e.get('objectId'))?.options.unset('preset');
                // objectManager?.current?.clusters.setClusterOptions(e.get('objectId'),
                //     { preset: 'islands#BlackClusterIcons' });
                var objectState = objectManager?.current?.getObjectState(e.get('target'));
                if (!objectState?.isClustered) {
                    console.log('sethighlightedObjectId')
                    sethighlightedObjectId(null)
                }
            });

            return () => {
                if (mapInstance.current) {
                    mapInstance.current.destroy();
                    mapInstance.current = null;
                }
            };
        } catch (error) {
            console.error('Error in Yandex Maps loading process:', error);
            // Можно добавить обработку глобальных ошибок
        }
    }, [ymapsLoaded]);

    const balloonContainer = document.createElement("div");


    // Рендерим React-компонент в этот контейнер

    // Обновление точек
    useEffect(() => {
        if (!ymapsLoaded || !objectManager.current) return;
        try {
            const updatePoints = () => {
                const objectsData = {
                    // IconShape: {
                    //     type: 'Rectangle',
                    //      coordinates: [
                    //     [-25, -25], [25, 25]
                    // ]
                    // },
                    type: 'FeatureCollection',
                    features: (Array.isArray(points) ? points : []).map(point => ({
                        type: 'Feature',
                        id: point.id,
                        geometry: {
                            type: 'Point',
                            coordinates: point.coordinates
                        },
                        properties: {
                            // balloonContentHeader: `${point.short_name}`,
                            balloonContentBody: renderComponentToHtml(point),
                            //                         balloonContentFooter: `
                            //                         <div style="
                            //       cursor: pointer;
                            //       color: #0095b6;
                            //       text-decoration: underline;
                            //       margin-top: 10px;
                            //     " onclick="window.yourComponentRef.handleDetailsClick(${point.id})">
                            //       Кликните для подробностей
                            //     </div>
                            //   `,
                            hintContent: point.cost.toString(),
                            cost: point.cost.toString(),
                            // Добавляем текст для метки
                            iconContent: point.cost.toString()
                        },
                        options: {
                            preset: 'islands#darkGreenStretchyIcon',
                            // или другой пресет
                            // iconLayout: 'default#textOnly',       // ТОЛЬКО текст
                            iconContent: point.cost.toString(),  // текст метки
                            // iconColor: '#0095b6'  ,                 // цвет текста
                            // iconFontSize: 18,                     // размер шрифта
                            // iconOffset: [0, -10]                  // смещение текста
                        }
                    }))
                };

                objectManager.current?.removeAll();
                objectManager.current?.add(objectsData);

                if (points.length > 0) {
                    try {
                        // Получаем коллекцию всех объектов
                        const allObjects = objectManager?.current?.objects.getAll();
                        // const coordinates = allObjects.map(obj => obj.geometry.coordinates);

                        const coordinates = (Array.isArray(allObjects) ? allObjects : [])
                            .map(obj => obj.geometry?.coordinates)

                        if (coordinates.length === 0) return null;

                        const bounds = ymaps.util.bounds.fromPoints(coordinates);
                        // alert (bounds)
                        // // // Устанавливаем границы
                        mapInstance.current?.setBounds(bounds, {
                            checkZoomRange: true,
                            // zoomMargin: 50 // Отступы в пикселях
                        });
                    } catch (e) {
                        alert('Error setting map bounds:' + e);
                    }
                }
            };

            updatePoints();
        }
        catch (error) {
            console.error('Error updating points:', error);
        }
    }, [ymapsLoaded, points]);

    // Обновление центра и зума
    // useEffect(() => {
    //     if (!ymapsLoaded || !mapInstance.current) return;
    //     mapInstance.current.setCenter(center);
    // }, [ymapsLoaded, center]);

    // useEffect(() => {
    //     if (!ymapsLoaded || !mapInstance.current) return;
    //     mapInstance.current.setZoom(zoom);
    // }, [ymapsLoaded, zoom]);

    useEffect(() => {
        try {
            if (!ymapsLoaded || !mapInstance.current || !highlightedObjectId) return;
            // alert(highlightedObjectId)
            // const allObjects = objectManager?.current?.objects.getAll();

            // const targetObject = allObjects.find(obj => obj.id === highlightedObjectId);

            // objectManager?.current?.objects.options.set('preset', 'islands#darkGreenStretchyIcon');

            objectManager.current?.objects.each(obj => {
                objectManager.current?.objects.setObjectOptions(obj.id, {
                    preset: 'islands#darkGreenStretchyIcon'
                });
            });

            objectManager.current?.clusters.each(obj => {
                objectManager?.current?.clusters.setClusterOptions(obj.id,
                    { preset: 'islands#BlackClusterIcons' });
            });

            objectManager?.current?.objects.setObjectOptions(highlightedObjectId.toString(),
                { preset: 'islands#orangeStretchyIcon' });

            //для кластера
            var objectState = objectManager?.current?.getObjectState(highlightedObjectId.toString());

            if (objectState?.isClustered) {
                const clusterId = objectState?.cluster?.id;
                objectManager?.current?.clusters.setClusterOptions(clusterId || '',
                    { preset: 'islands#invertedOrangeClusterIcons' });
            }

        }
        catch (e) {
            alert(e)
        }

    }, [ymapsLoaded, highlightedObjectId]);


    const updateVisibleObjects = () => {
        // console.log('update da obj')
        if (!mapInstance.current) return;

        const bounds = mapInstance.current.getBounds();

        const rectangle = new ymaps.Polygon([
            [bounds[0][0], bounds[0][1]], // юго-запад
            [bounds[0][0], bounds[1][1]], // северо-запад
            [bounds[1][0], bounds[1][1]], // северо-восток
            [bounds[1][0], bounds[0][1]]  // юго-восток
        ]);

        try {
            const [[swLat, swLon], [neLat, neLon]] = bounds;

            if (points.length != 0) {
                const filtered = points.filter(obj => {
                    const [lat, lon] = [obj.coordinates[0], obj.coordinates[1]];
                    return (
                        lat >= swLat &&
                        lat <= neLat &&
                        lon >= swLon &&
                        lon <= neLon
                    );
                });
                // alert(filtered)
                if (filtered.length != 0) { visibleObj(filtered); };
            }

        }
        catch (error) {
            alert(error)
        }

        // const filtered = points.filter(obj => {
        //     return bounds.contains([obj.coordinates[0], obj.coordinates[1]]);
        // });
    };

    useEffect(() => {
        console.group('useEffect triggered');
        console.log('Current dependencies:', {
            ymapsLoaded,
            zoom,
            points: points.length
        });

        if (!ymapsLoaded || !mapInstance.current) {
            console.log('Effect skipped - ymaps not loaded or map not initialized');
            console.groupEnd();
            return;
        }

        // Сохраняем предыдущие значения для сравнения
        const prevValues = {
            ymapsLoaded,
            zoom,
            pointsCount: points.length
        };

        const boundsChangeHandler = function (e: any) {
            const newZoom = e.get('newZoom');
            const oldZoom = e.get('oldZoom');

            if (newZoom !== oldZoom) {
                console.log('Zoom changed:', { oldZoom, newZoom });
                updateVisibleObjects();
                console.log('updateVisibleObjects called from boundschange event');
            }
        };

        mapInstance.current.events.add('boundschange', boundsChangeHandler);

        // Логируем причину срабатывания эффекта
        console.log('Effect setup complete. Possible triggers:');

        if (prevValues.ymapsLoaded !== ymapsLoaded) {
            console.log('- ymapsLoaded changed:', prevValues.ymapsLoaded, '→', ymapsLoaded);
        }

        if (prevValues.zoom !== zoom) {
            console.log('- zoom changed:', prevValues.zoom, '→', zoom);
        }

        if (prevValues.pointsCount !== points.length) {
            console.log('- points count changed:', prevValues.pointsCount, '→', points.length);
        }

        console.groupEnd();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.events.remove('boundschange', boundsChangeHandler);
                console.log('Cleanup - boundschange handler removed');
            }
        };
    }, [ymapsLoaded, zoom, points]);


    return <div ref={mapRef} style={{ width, height }} />;
};

export default YMap;

const renderComponentToHtml = (point: Point) => `
  <style>
  .ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager-item{
  color:  var(--mantine-color-grayColor-8)
  }
.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager{
height: 40px;
border-radius: 20px;
}
  .ymaps-2-1-79-b-cluster-carousel__pager{
background-color: var(--mantine-color-grayColor-0)
  }
  .ymaps-2-1-79-balloon__close {
  background-color: var(--mantine-color-grayColor-0);
  border-radius: 40px; 
  border: solid 1px;
  border-color: var(--mantine-color-grayColor-3)
  }
.ymaps-2-1-79-b-cluster-carousel ymaps-2-1-79-b-cluster-carousel_pager_numeric ymaps-2-1-79-b-cluster-content {
    height:290px;

    }
  .ymaps-2-1-79-b-cluster-carousel__content {
 height: 400px;
    }
  
  .ymaps-2-1-79-balloon__layout .ymaps-2-1-79-carousel__item {
    margin-bottom: 10px;
  }
  
  /* Стили для пагинации карусели */
  .ymaps-2-1-79-carousel__pager {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

.ymaps-2-1-79-balloon {
box-shadow: none;
 overflow: hidden !important;
}

 .ymaps-2-1-79-balloon__layout{
 background: transparent !important;
 border: none !important;
 box-shadow: none !important;
  overflow: hidden !important;
  padding: 10px;
 }
    .ymaps-2-1-79-balloon__content {
        background: transparent !important;
        overflow: hidden !important;
        padding: 10px;
      }

.address { 
    font-size: var(--mantine-font-size-sm);
    color: var(--mantine-color-grayColor-8);
    /* background-color: brown;
    color: blue; */
}


.shortName { 
  font-weight: 600;
   color: var(--mantine-color-grayColor-8);
}
.characteristics { 
    font-size: var(--mantine-font-size-sm);
     color: var(--mantine-color-grayColor-8);
  }

.metro { 
    font-size: var(--mantine-font-size-sm);
     color: var(--mantine-color-grayColor-8);
  }
.ymaps-2-1-79-map ymaps, .ymaps-2-1-79-map ymaps:after, .ymaps-2-1-79-map ymaps:before {
margin-bottom: -5px;
}

.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager>ymaps {
padding-right: 10px; 
}
  
.customOverlay {
  position: absolute; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(

    rgba(0, 0, 0, 0) 0%,   
    rgba(51, 51, 51, 0.45) 100% 
  );
  opacity: 0.85;
  pointer-events: none;
}

  </style>
  ${ReactDOMServer.renderToString(<MantineProvider>
    <Flex justify={"center"} direction={"column"} mb={0}>
        <ObjectLandingCard {...point} media={point.media} cost={point.cost.toString()} />
        <span style={{
            position: "absolute",
            bottom: "6px", width: "100%"
        }} dangerouslySetInnerHTML={{
            __html: `<button
  type="button"
  class="mantine-Button-root mantine-10aflv4"
  style="
  width: 90%;
  padding: 10px;
    margin: 10px;
    background-color: var(--mantine-color-sberGreenColor-9);
    border: 0px;
    border-radius: var(--mantine-radius-default);
    font-weight: 600;
    color: var(--mantine-color-white);
    cursor: pointer;

    height: var(--button-height);
    padding-left: var(--mantine-spacing-md);
    padding-right: var(--mantine-spacing-md);
    font-size: var(--button-font-size);
    font-family: var(--mantine-font-family);
    transition: all 100ms ease;
    position: relative;
    line-height: 1;
    user-select: none;
     " onclick="window.yourComponentRef.handleDetailsClick(${point.id})">
  <span class="mantine-Button-label">Просмотреть</span>
</button>`}}>
        </span>
    </Flex>
</MantineProvider>)}
`;

