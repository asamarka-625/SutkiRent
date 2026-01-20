import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { Button, Paper, Title, Text, Spoiler } from '@mantine/core';
import classes from './eventsPage.module.css';
import { useEffect, useState } from 'react';
import { errorHandler } from '../../../handlers/errorBasicHandler.ts';
import { showNotification } from '@mantine/notifications';
import { getArticlesData } from '../../../services/articlesServices.ts';
import { useNavigate } from 'react-router-dom';


interface CardProps {
    title: string,
    date: string,
    media: string
}



// const formattedDate = dateObject.toLocaleString("ru-RU", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit"
//   });

function Card({ media, title, date }: CardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const titleList = title;
    const truncatedText = titleList.split(' ').slice(0, 2).join(' ') + '...';
    const visibleTitleList = titleList?.slice(0, 60);
    const dateObject = new Date(date)
    const formattedDate = dateObject.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    const firstTwoWords = titleList.split(' ').slice(0, 2).join(' ');
    // alert("firstTwoWords" + firstTwoWords)
    const remainingText = titleList.split(' ').slice(2).join(' ');
    // alert("remainingText" + remainingText)

    const isMobile = useMediaQuery('(max-width: 30em)');
    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            // radius="20px"
            style={media.length > 0 ? { backgroundImage: `url(${media})` } : {}}
            className={classes.gridItem}
        >
            <div className={classes.customOverlay}></div>
            <div className={classes.textContainer}>
                <div className={classes.title}>{formattedDate}</div>
                <span className={classes[`sub-text`]}>
                    <span>{firstTwoWords}
                        {!isMobile ? <span style={{ transition: "all 0.2s ease-in-out", opacity: !isHovered ? "1" : "0", fontSize: !isHovered ? "initial" : "0" }}>...</span> : " "}
                    </span>
                    {isMobile ? <span>{remainingText}</span> :
                        <Spoiler
                            initialState={true}
                            maxHeight={0}
                            hideLabel={undefined}
                            showLabel={undefined}
                            expanded={isHovered}
                        >
                            {remainingText}
                        </Spoiler>
                    }

                </span>

                <Button className='mantine-hidden-from-xs' fullWidth variant="white" color="dark" mb={30} radius={12} bg={"rgba(255, 255, 255, 0.6)"}>
                    Подробнее...
                </Button>
                {/* <div className={classes[`sub-text`]} >
                    {isHovered ? titleList : truncatedText}
                </div> */}
            </div>


            {/* <div>
                <Text className={classes.category} size="xs">
                    {formattedDate}
                </Text>
                <Text className={classes.title}>
                    {visibleTitleList.length == titleList.length ? visibleTitleList : visibleTitleList + "..."}
                </Text>
                <Text className={classes.desc} visibleFrom='md'>
                    
                </Text>
            </div> */}



        </div>
    );
}

export function EventsPage() {

    const [objects, setObjects] = useState<CardProps[]>([
        {
            title: 'Балет «Лебединое озеро» в постановке театра балета «Сен-Мишель»',
            date: '2025-08-5',
            media: 'https://media.kudago.com/thumbs/xxl/images/event/6b/86/6b8673fcfc52425a228f3208db23c39a.jpeg'
        },
        {
            title: 'Спектакли иммерсивного театра «Морфеус»',
            date: '2025-08-16',
            media: 'https://media.kudago.com/thumbs/xxl/images/event/a2/c8/a2c8e90032aa03d68ab0e83ab62756ca.jpg'
        },
        {
            title: 'Арт-проект «Блошиный рынок Петербургъ»',
            date: '2025-08-17',
            media: 'https://media.kudago.com/thumbs/xxl/images/event/21/03/2103f3e434bb6a26e3b2a1b4abed3488.jpg'
        },
        {
            title: 'Индивидуальный мастер-класс по созданию персонального парфюма в лаборатории Гильдии парфюмеров',
            date: '2025-08-18',
            media: 'https://media.kudago.com/thumbs/xxl/images/event/8f/46/8f46b4713a895df288398df47ac3f00b.jpg'
        },
        {
            title: 'Спектакль «Антарктида» в Театре «На Литейном»',
            date: '2025-08-19',
            media: 'https://media.kudago.com/thumbs/xl/images/event/57/15/5715e61e81ce9671977f7742f44c1ba9.jpg'
        },
        {
            title: 'Викторина «Телеквиз: кино, мультфильмы, сериалы»',
            date: '2025-08-22',
            media: 'https://media.kudago.com/thumbs/xl/images/event/74/2b/742bee5d9f18294d04fe4626966c32e5.jpg'
        },
        {
            title: 'Бесплатные кинопоказы в «Кинотеатре у моря»',
            date: '2025-08-25',
            media: 'https://media.kudago.com/images/event/37/b0/37b0a8732622862958c3384e449e359e.webp'
        },
        {
            title: 'Спектакль «Карлссон, который живёт на крыше» в театре Karlsson Haus',
            date: '2025-09-02',
            media: 'https://media.kudago.com/thumbs/xl/images/event/1a/68/1a6812e2b0a0686b07d71891a612d379.jpg'
        },
    ])


    // async function getObjectsDataFunc() {
    //     const response = await getArticlesData()

    //     if (response.ok) {
    //         const data = await response.json();
    //         setObjects(data)
    //     }
    //     else {
    //         setObjects([])
    //         const error = await response.json();
    //         if (errorHandler(response.status) == 5) {
    //             showNotification({
    //                 title: "Ошибка сервера, обновите страницу",
    //                 message: error.statusText,
    //                 icon: <IconX />
    //             })
    //         }
    //     }

    // }

    useEffect(() => {
        // getObjectsDataFunc()
        // alert("            ИСПОЛЬЗОВАТЬ МАНТИНУ ")
    }, [])


    const mobile = useMediaQuery(`(max-width: 48em`);

    const slides = (Array.isArray(objects) ? (objects.length > 8 ? objects.slice(0, 8) : objects) : []).map((item) => (
        <Card {...item} />
    ));

    return (
        <Paper className='' style={{ backgroundColor: "transparent" }}>
            <h2 className={classes.headerGreen}>Куда сходить...</h2>
            <p className={classes.subheader}>...в Санкт-Петербурге?</p>
            <div className={classes.pageLayout}>
                {slides}
            </div>
        </Paper>
    );
}