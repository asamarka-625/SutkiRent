import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { Button, Paper, Title, Text } from '@mantine/core';
import classes from './articlesLanding.module.css';
import { useEffect, useState } from 'react';
import { errorHandler } from '../../../handlers/errorBasicHandler.ts';
import { showNotification } from '@mantine/notifications';
import { getArticlesData } from '../../../services/articlesServices.ts';
import { useNavigate } from 'react-router-dom';


interface CardProps {
    id: string,
    title: string,
    content: string,
    publication_date: string,
    short_description: string,
    media: [
        {
            id: string,
            file: string,
            article: string
        }
    ]
}

// const formattedDate = dateObject.toLocaleString("ru-RU", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit"
//   });

function Card({ media, title, publication_date, short_description, id }: CardProps) {
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();
    const titleList = title;
    const visibleTitleList = titleList?.slice(0, 50);
    const additionsList = short_description;
    const visibleAdditionsList = additionsList?.slice(0, 100);
    const dateObject = new Date(publication_date)
    const formattedDate = dateObject.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    return (
        <Paper
            shadow="md"
            p="xl"
            // radius="20px"
            // style={media.length > 0 ? { backgroundImage: `url(${media[0].file})` } : {}}
            className={classes.card}
        >
            {media.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 20,
                    bottom: 0,
                    backgroundImage: `url(${media[0].file})`,
                    backgroundSize: 'cover',
                    filter: 'brightness(50%)',
                    backgroundPosition: "center",
                    zIndex: 0
                }} />
            )}
            {/* <div className={classes.customOverlay}></div> */}
            <div>
                <Text className={classes.category} size="xs">
                    {formattedDate}
                </Text>
                <Text className={classes.title}>
                    {visibleTitleList.length == titleList.length ? visibleTitleList : visibleTitleList + "..."}
                </Text>
                <Text className={classes.desc} visibleFrom='md'>
                    {/* 160 */}
                    <div>{visibleAdditionsList}...</div>
                </Text>
            </div>

            <Button variant="white" bg={"rgba(255, 255, 255, 0.6)"} color="dark" fullWidth onClick={() => {navigate("/articles/" + id); window.scrollTo(0, 0)}}>
                Читать
            </Button>

        </Paper>
    );
}

export function ArticlesLandingPage() {

    const [objects, setObjects] = useState<CardProps[]>([

    ])


    async function getObjectsDataFunc() {
        const response = await getArticlesData()

        if (response.ok) {
            const data = await response.json();
            setObjects(data)
        }
        else {
            setObjects([])
            const error = await response.json();
            if (errorHandler(response.status) == 5) {
                showNotification({
                    title: "Ошибка сервера, обновите страницу",
                    message: error.statusText,
                    icon: <IconX />
                })
            }
        }

    }

    useEffect(() => {
        getObjectsDataFunc()
    }, [])


    const mobile = useMediaQuery(`(max-width: 48em`);
    const slides = (Array.isArray(objects) ? (objects.length > 6 ? objects.slice(0, 6) : objects) : []).map((item) => ( 
        <Carousel.Slide key={item.title}>
            <Card {...item} />
        </Carousel.Slide>
    ));

    return (
        <Paper className='' style={{ backgroundColor: "transparent" }}>
            <Carousel
                styles={{
                    control: {
                        display: objects.length <= 2 ? "none" : "inherit",
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
                    viewport: {
                        borderRadius: "20px"
                    },
                    container: {
                        borderRadius: "20px",
                        // overflow: "hidden",  
                    }
                }}
                mt={"md"}
                mb={"md"}
                slideSize={{ base: '100%', sm: '50%' }}
                slideGap="lg"
                align="start"
                slidesToScroll={mobile ? 1 : 2}
            >
                {slides}
            </Carousel>
        </Paper>
    );
}