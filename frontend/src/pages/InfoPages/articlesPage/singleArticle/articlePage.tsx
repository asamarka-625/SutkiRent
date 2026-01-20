
import styles from "./articlePage.module.css";
import { Carousel } from "@mantine/carousel";
import { getArticleById } from "../../../../services/articlesServices.ts";
import { errorHandler } from "../../../../handlers/errorBasicHandler.ts";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Divider, Group, Loader } from "@mantine/core";
import DOMPurify from 'dompurify';
import type { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "../../../../components/caurousel/caorusel.tsx";


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


export function ArticlePage() {
    const { id } = useParams();
    const [objects, setObjects] = useState<CardProps[]>([
    ])
    const [backImage, setImage] = useState('')
    const [IsDopMedia, setIsDopMedia] = useState(false)
    const isMobile = useMediaQuery('(max-width: 48em)');
    const isLoading = useRef<boolean>(false);
    const OPTIONS: EmblaOptionsType = {}
    const slides = (Array.isArray(objects.media) ? objects.media : []).map((url) => (
        <Carousel.Slide key={url.file}>
            <img src={url.file} className={styles["carouselImages"]} />
        </Carousel.Slide>
    ));


    const urls = (Array.isArray(objects.media) ? objects.media : []).map((media) => media.file);
    const SLIDES = urls?.slice(1);

    {/* <Loader type="dots" ml="30" size="xs" /> */ }
    async function getObjectsDataFunc() {
        isLoading.current = true;
        const response = await getArticleById(id || '')

        if (response.ok) {
            const data = await response.json();
            data.publication_date = new Date(data.publication_date).toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });;

            setObjects(data)
            setImage(data.media[0].file)
            if (data.media && data.media.length > 1) {
            setIsDopMedia(true)
        }
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

        isLoading.current = false;

    }

    useEffect(() => {
        // alert(id)      
        // console.log(objects?.media)
        window.scrollTo(0, 0);
        getObjectsDataFunc()
    }, [])



    return (
        <div className="paperdiv">
            <div className="paperdiv" style={{}}>
                <div className={styles.bannerImage} style={{
                    backgroundImage: `url(${backImage})`,
                }}>

                    <div className={styles.customOverlay}></div>
                    <h2 className={styles.textHigh}>{objects.title}</h2>
                    <div className={styles.bannerBorder}></div>
                </div>
                <div className={styles.banner}>

                    <h2 className="HeadingStyle2">{objects.title}</h2>
                    <div className={styles["papercardItem"]}>
                        <div>{isLoading.current ? <Loader type="dots" ml="30" size="xs" /> :
                            objects.content ? <div
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(objects.content) + "<p></p>"
                                }}></div> : "Статья пока пустая. Возвращайтесь позже."}</div>
                        {/* {objects.content} */}
                    </div>
                   { IsDopMedia ? <div style={{  width: '900px', margin: '0 auto', maxWidth: '100%', paddingTop: "20px" }}>
                        <EmblaCarousel slides={SLIDES} options={OPTIONS} /> 
                    </div>: ''}
                </div>
            </div>
        </div>
    )
}