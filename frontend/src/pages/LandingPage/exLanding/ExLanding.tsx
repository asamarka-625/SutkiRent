import { Carousel } from '@mantine/carousel';
import { Card, Text } from '@mantine/core';
import classes from './ExLanding.module.css';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { getExcursions } from '../../../services/excursionsServices.ts';

interface CardProps {
  id?: number;
  image: string;
  title: string;
  description: string;
}

function CardComponent({ image, title, description }: CardProps) {
  return (
    <Card
      p="lg"
      shadow="lg"
      className={classes.card}
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className={classes.gradientOverlay} />
      <div className={classes.content}>
        {/* <Text className={classes.title}>{title}</Text> */}
        <Text className={classes.description}>{description}</Text>
      </div>
    </Card>
  );
}

type Excursion = {
  id: number;
  title: string;
  short_description: string;
  media: { file: string | null }[];
}
   
export function ExcursionLanding() {
   const isMobile = useMediaQuery('(max-width: 48em)');
  const [items, setItems] = useState<CardProps[]>([]);
  const navigateTo = (id?: number) => {
    if (id != null) {
      window.location.href = `/excursions/${id}`;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const resp = await getExcursions();
        if (!resp.ok) return;
        const responseData = await resp.json();
        const data: Excursion[] = Array.isArray(responseData) ? responseData : (responseData.results || []);
        const mapped: CardProps[] = data.map(a => ({
          id: a.id,
          image: a.media && a.media.length > 0 && a.media[0].file ? a.media[0].file : '',
          title: a.title,
          description: a.short_description || a.title,
        }));
        setItems(mapped);
      } catch {}
    })();
  }, []);
  return (
    <Carousel
      className={classes.carousel}
      slideSize="var(--slide-size, 25%)"
      slideGap="md"
      align="start"
      slidesToScroll={isMobile ? 1 : 4}
      withIndicators
      breakpoints={[
        { maxWidth: 'md', slideSize: 'var(--slide-size, 50%)' },
        { maxWidth: 'sm', slideSize: 'var(--slide-size, 100%)' },
      ]}

      styles={{
        // изменять расстояние между стрелками здесь
        controls: {
          ...(!isMobile && {
            display: 'none'
          })
        },
        control: {
          backgroundColor: 'rgba(255,255,255,0.8)',
          color: '#333',
          border: '1px solid #ddd',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.9)',
          },
          '&[data-inactive]': {
            opacity: 0,
            cursor: 'default',
          },
        },
        indicator: {
          bottom: '-30px',
        },
      }}
    >
      {(items.length > 0 ? items : []).map((item, index) => (
        <Carousel.Slide key={index} onClick={() => navigateTo(item.id)}>
          <CardComponent {...item} />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}