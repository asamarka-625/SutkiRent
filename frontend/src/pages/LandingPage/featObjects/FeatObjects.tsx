import { Carousel } from '@mantine/carousel';
import { Button, Text, Group, Select, Divider, NumberInput, SimpleGrid, Modal, Skeleton, Loader, CloseButton } from "@mantine/core";
import styles from './FeatObjects.module.css';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState, useRef } from 'react';
import { getExcursions } from '../../../services/excursionsServices.ts';
import { SearchPageCard } from '../../SearchPage/searchPageCard/searchPageCard.tsx';
import { getFeatObjectsData, getObjectsData } from '../../../services/objectsServices.ts';
import { errorHandler } from '../../../handlers/errorBasicHandler.ts';
import { saveCurrentUrl } from '../../../handlers/urlSaveHandler.ts';

interface CardProps {
  id?: number;
  image: string;
  title: string;
  description: string;
}

interface Point {
  id: number;
  // coordinates: [number, number];
  // cost: string;
  media: [];
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
  near_metro: [];
}

function transformObjectsToPoints(originalArray: any[]): any[] {
  if (!Array.isArray(originalArray)) return [];
  return originalArray.map(obj => ({
    id: obj.id,
    coordinates: [obj.latitude, obj.longitude],
    cost: obj.cost ? `${obj.cost.toLocaleString('ru-RU')}` : '',
    media: { source_type: '', url: obj?.media[0] },
    space: obj.space || null,
    amount_rooms: obj.rooms || null,
    address: obj.address || null,
    floor: obj.floor || null,
    short_name: obj.title || null,
    near_metro: obj.metro || null,
    capacity: obj.capacity || null,
    sleeps: obj.sleeps || null
  }));
}

function CardComponent(props: Point) {
  return (
    <SearchPageCard {...props}></SearchPageCard>
  );
}


export function FeatObjects() {
  const isSM = useMediaQuery('(min-width: 30em) and (max-width: 48em)');
  const isXS = useMediaQuery('(max-width: 30em)');
  const isLoading = useRef<boolean>(false);

  const [items, setItems] = useState<Point[]>([]);


  const navigateTo = (id?: number) => {
    if (id != null) {
      window.location.href = `/excursions/${id}`;
    }
  }

  async function getObjectsDataFunc() {

    isLoading.current = true
    console.log('🚀 идет запуск запроса (backend делает параллельную загрузку)...')

    const response = await getFeatObjectsData()

    if (response.ok) {
      const responseData = await response.json();
      const data = responseData.apartments || [];
      const transformedData = transformObjectsToPoints(data);
      setItems(transformedData);
      isLoading.current = false
    }
    else {
      setItems([])
      const error = await response.json();
      if (errorHandler(response.status) == 5) {
        showNotification({
          title: "Ошибка сервера, обновите страницу",
          message: error.statusText,
          // icon: <IconX />
        })
      }
    }
  }

  const handleNavigateToObject = (id: number) => {
    saveCurrentUrl()
    window.location.href = `/object/${id}`;
  };

  useEffect(() => {
    getObjectsDataFunc()
  }, []);

  return (
    <div className="papercard" style={{
      justifyItems: "center",
      display: 'grid',
      gridTemplateColumns: isXS ? "1fr" : isSM ? "1fr 1fr" : "1fr 1fr 1fr",
      minHeight: isSM ? '100vh' : '',
      gap: '20px',
      marginTop: "20px"
    }}>

      {/* Центральный индикатор загрузки (мобильная версия) */}
      {isLoading.current && items.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '20px',
          gridColumn: '1 / -1'
        }}>
          <div className={styles.customLoader}></div>
          <Text size="md" c="dimmed" style={{ fontSize: '16px' }}>
            Ищем доступные предложения...
          </Text>
        </div>
      ) : items.length == 0 && !isLoading.current ? (
        <Text style={{ gridColumn: '1 / -1' }}>На выбранные даты не нашлось больше свободных вариантов</Text>
      ) : (
        <>
          {(Array.isArray(items) ? items : []).map(items => <SearchPageCard
            {...items}
            landing={true} 
            refreshList={() => handleNavigateToObject(items.id)}/>
          )}
          {isLoading.current && <div style={{ width: "100%", gridColumn: '1 / -1' }}>
            <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
            <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
            <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
          </div>}
        </>
      )}

    </div>
    // <Carousel
    //   className={classes.carousel}
    //   // slideSize="var(--slide-size, 25%)"
    //   slideGap="md"
    //   align="start"
    //   slidesToScroll={isMobile ? 1 : 4}
    //   withIndicators
    //   breakpoints={[
    //     { maxWidth: 'md', slideSize: 'var(--slide-size, 50%)' },
    //     { maxWidth: 'sm', slideSize: 'var(--slide-size, 100%)' },
    //   ]}

    //   styles={{
    //     // изменять расстояние между стрелками здесь
    //     controls: {
    //       ...(!isMobile && {
    //         display: 'none'
    //       })
    //     },
    //     control: {
    //       backgroundColor: 'rgba(255,255,255,0.8)',
    //       color: '#333',
    //       border: '1px solid #ddd',
    //       '&:hover': {
    //         backgroundColor: 'rgba(255,255,255,0.9)',
    //       },
    //       '&[data-inactive]': {
    //         opacity: 0,
    //         cursor: 'default',
    //       },
    //     },
    //     indicator: {
    //       bottom: '-30px',
    //     },
    //   }}
    // >
    //   {(items.length > 0 ? items : []).map((item, index) => (
    //     <Carousel.Slide key={index} onClick={() => navigateTo(item.id)}>
    //       <CardComponent {...item} />
    //     </Carousel.Slide>
    //   ))}
    // </Carousel>
  );
}