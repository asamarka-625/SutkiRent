import { Modal } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import styles from './objectPageCard.module.css'
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { ImageWithFallback } from '../../../components/image/ImageWithFallback';


interface InventoryItem {
    id: number;
    name: string;
}

interface Inventory {
    inventory: InventoryItem;
    totalAmount: number;
}

interface NearMetro {
    name: string;
}

interface MediaItem {
    source_type: string;
    url: string;
}

interface Property {
    pk: number;
    short_name: string;
    cost: number;
    type: number;
    amount_rooms: number;
    floor: number;
    sleeps: string;
    capacity: number;
    region: null | string;
    city: string;
    banner: null | string;
    space: number;
    address: string;
    description: string;
    conditions_accommodation: string;
    contacts: string;
    finding_description: string;
    helpful_info: string;
    parking_info: string;
    object_inventories: any[]; // Replace 'any' with more specific type if possible
    services: any[]; // Replace 'any' with more specific type if possible
    near_metro: NearMetro[];
    all_media: MediaItem[];
    latitude: number;
    longitude: number;
}

export function ImageGallery(props: Property) {
    const [activeSlide, setActiveSlide] = useState(0);

    const navigate = useNavigate()
    const isMobile = useMediaQuery('(max-width: 48em)');


    const [opened, { open, close }] = useDisclosure(false);
    const [selectedImage, setSelectedImage] = React.useState('');

    const [shouldScroll, setShouldScroll] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(0);


    const handleImageClick = (url) => {
        setSelectedImage(url.url);
        open();
    };

    useEffect(() => {
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMainSlideChange = (index) => {
        setActiveSlide(index);
    };

    const handleThumbnailClick = (index) => {
        // Рассчитываем примерное количество видимых слайдов
        const slidesPerView = Math.floor(viewportWidth / (isMobile ? 300 : 600));
        const isSlideVisible =
            index >= activeSlide &&
            index < activeSlide + slidesPerView;

        // Прокручиваем только если слайд не виден
        setShouldScroll(!isSlideVisible);
        setActiveSlide(index);
    };



    const slides = (Array.isArray(props.all_media) ? props.all_media : []).map((url, index) => (
        <Carousel.Slide
            key={url.url}
            onClick={() => handleImageClick(url)}
            style={{ cursor: 'pointer' }}
        >
            <img
                src={url.url}
                className={styles.carouselImages}
                alt={`Изображение ${index + 1}`}
            />
        </Carousel.Slide>
    ));

    const thumbnails = (Array.isArray(props.all_media) ? props.all_media : []).map((url, index) => (
        <Carousel.Slide
            key={`thumb-${url.url}`}
            onClick={() => handleThumbnailClick(index)}
            style={{
                height: isMobile ? "60px" : "80px",
                cursor: 'pointer',
                padding: '2px',
                border: activeSlide === index ? '2px solid var(--mantine-color-sberGreenColor-9)' : '2px solid transparent',
                borderRadius: '4px',
                transition: 'border-color 0.2s ease',
            }}
        >
            <ImageWithFallback
                src={url.url}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '2px',
                }}
                alt={`Миниатюра ${index + 1}`}
            />
        </Carousel.Slide>
    ));

    return (
        <div className="papercard">
            <div style={{ width: '600px', margin: '0 auto', maxWidth: '100%' }}>
                {/* Основная карусель */}
                <Carousel
                    height={!isMobile ? 400 : 300}
                    slideSize={!isMobile ? "600px" : "300px"}
                    slideGap={0}
                    align="start"
                    withControls
                    withIndicators={false}
                    onSlideChange={handleMainSlideChange}

                    initialSlide={activeSlide}
                    styles={{
                        root: {
                            maxWidth: '600px',
                            marginBottom: '10px',
                        },
                        viewport: {
                            maxWidth: '600px',
                        },
                        controls: {
                            ...(!isMobile && {
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 'calc(100% + 100px)',
                                left: '-50px',
                                right: '-34px',
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
                    }}
                >
                    {slides}
                </Carousel>

                {/* Карусель миниатюр */}
                <Carousel
                    // loop
                    slideSize={isMobile ? "80px": "100px"}
                    slideGap="xs"
                    align="start"
                    withControls={false}
                    // slidesToScroll={1}
                    dragFree
                    initialSlide={isMobile? activeSlide-2 : activeSlide-3}
                    styles={{
                        root: {
                            // maxWidth: '600px',
                            // padding: '0 10px',
                        },
                        viewport: {
                            overflow: 'hidden',
                        },
                        container: {
                            gap: '4px',
                        },
                    }}
                >
                    {thumbnails}
                </Carousel>

                {/* Модальное окно для просмотра изображения */}
                <Modal
                    opened={opened}
                    onClose={close}
                    size="auto"
                    centered
                    withCloseButton={false}
                    overlayProps={{
                        color: '#000',
                        opacity: 0.8,
                        blur: 2,
                    }}
                    styles={{
                        body: {
                            padding: 0,
                        },
                        content: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        },
                    }}
                >
                    <div className={styles.closeButton} onClick={close}>
                        &times;
                    </div>
                    <img
                        src={selectedImage}
                        style={{
                            maxWidth: '80vw',
                            maxHeight: '80vh',
                            display: 'block',
                            objectFit: "contain"
                        }}
                        alt="Увеличенное изображение"
                    />
                </Modal>
            </div>
        </div>
    );
}