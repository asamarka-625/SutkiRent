import { Paper, Text, Group, Loader } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
// import memoize from "lodash.memoize";

import '@mantine/dates/styles.css';
import { getArticlesData } from "../../../services/articlesServices.ts";
import { useNavigate } from "react-router-dom";
import { errorHandler } from "../../../handlers/errorBasicHandler.ts";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { ArticlePageCard } from "./articlesPageCard/articlesPageCard.tsx";


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

interface CardPropsCashe {
   CardProps: CardProps[], 
   timestamp: number
}


const CACHE_DURATION = 5 * 60 * 1000;
const ARTICLES_CACHE_KEY = "articles_cache";


export function ArticlesPage() {


    const [IsLoading, setIsLoading] = useState(false);
    const hasCashe = useRef<boolean>(false);

    const navigate = useNavigate();

    const [objects, setObjects] = useState<CardProps[]>([

    ])
    
const getObjectsDataFunc = async () => {
        setIsLoading(true)
        const response = await getArticlesData()

        if (response.ok) {
            const data = await response.json();
            setObjects(data)
            // const dataWithTimestamp = {
            //     data: data.map(item => ({ ...item, timestamp: Date.now() })),
            //     timestamp: Date.now()
            // };
            // sessionStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(dataWithTimestamp));
            // hasCashe.current = true
        }
        else {
            // if (hasCashe.current) {
            //     const hash: CardPropsCashe = sessionStorage.getItem(ARTICLES_CACHE_KEY);
            //     setObjects(hash)
            // }
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
        setIsLoading(false)
    }


    const handleCheck = () => {
        if (sessionStorage.getItem(ARTICLES_CACHE_KEY)) { 
             const hash = sessionStorage.getItem(ARTICLES_CACHE_KEY);
             
             
        }
        // navigate(`/articles/${id}`);
    };


    const handleNavigateToObject = (id: string) => {
        navigate(`/articles/${id}`);
    };


    //При загрузке страницы
    useEffect(() => {
        getObjectsDataFunc()
    }, []);

    const renderSkeletons = () => {
        return Array.from({ length: 3 }).map((_, index) => (
            <ArticlePageCard key={`skeleton-${index}`} skeleton={true} />
        ));
    };

    // ДЛЯ РАЗДЕЛЕНИЯ ЗАПЯТЫМИ
    // const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    //     const {
    //       target: { value },
    //     } = event;
    //     objectFilterForm.setFieldValue('city'
    //       // On autofill we get a stringified value.
    //       typeof value === 'string' ? value.split(',') : value,
    //     );
    //   };

    return (
        <div className="paperdiv">
            <Paper shadow="sm" p={"md"} mt={"sm"} radius={20}>
                <h2 className="HeadingStyle2">Наши новости</h2>

                <Group justify="center">
                    <div className="papergrid">
                        {/* <div>d</div>
    <div>r</div>
    <div>dftgh</div>
    <div>dfss</div> */}
                        {IsLoading ? renderSkeletons() : (Array.isArray(objects) ? objects : []).length == 0 ? <Text className="HeadingStyle3">Новостей нет</Text> :
                            (Array.isArray(objects) ? objects : []).map((objects) => <ArticlePageCard
                                refreshList={() => handleNavigateToObject(objects.id)}
                                {...objects} />

                            )}
                    </div>


                </Group>



                {/* <Button mt={10} onClick={() => navigate("/object/create")}>Создать объект недвижимости</Button> */}
            </Paper></div>
    )


}