import { Flex, Skeleton } from "@mantine/core";
import styles from './articlesPageCard.module.css'
import { useState } from "react";
import { ImageWithFallback } from "../../../../components/image/ImageWithFallback";

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
    refreshList: () => void,
    skeleton?: boolean
}

export function ArticlePageCard({ media, title, publication_date, short_description, refreshList, skeleton = false }: CardProps) {
    const [showAll, setShowAll] = useState(false);
    const additionsList = short_description;
    const visibleAdditionsList = additionsList?.slice(0, 60);
    const dateObject = new Date(publication_date)
    const formattedDate = dateObject.toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const additionsTitleList = title || '';
    const visibleAdditionsTitleList = additionsTitleList?.slice(0, 60) || '';
    if (skeleton) {
        return (
            <div className="papercardObjectVertical" onClick={() => refreshList()
            } style={{ cursor: "pointer" }}>
                <Skeleton radius={20} animate width={"100%"} height={"100%"}></Skeleton>
            </div>
        );
    }
    return (
        <div className="papercardObjectVertical" onClick={() => refreshList()
        } style={{ cursor: "pointer" }}>
            <div className="block" style={{ height: "60%" }}>
                <div className={styles["customOverlay"]}></div>
                <ImageWithFallback
                    // fallbackSrc="/blur_404.jpg"
                    src={media ? media[0]?.file : undefined}
                    alt={"Photo"}
                ></ImageWithFallback>
                {/* <img
                    src={media[0]?.file || "/404.jpg"}
                ></img> */}

                {/* <Flex className="HeadingStyleCost" gap={5} align="flex-end">
                    <h1>{title}</h1>
                </Flex> */}

            </div>
            <Flex
                className="cardDescription"
                direction={"column"}>
                <h3 className={styles[`shortName`]}>{visibleAdditionsTitleList.length == additionsTitleList.length
                    ? visibleAdditionsTitleList : visibleAdditionsTitleList + "..."}</h3>
                <div className={styles[`characteristics`]}>{visibleAdditionsList}...</div>
                <div className={styles[`address`]}> {formattedDate}</div>

            </Flex>


            {/* <div style={{position: "absolute", left: "1px"}}>i am gay</div> */}


            {/* <Group justify="flex-start" mt="xs" mb="xs" ml="md" >
                <Text fw="lg" fz="lg" c={'grayColor.5'}>Кадастровый номер</Text>
                <Text fw="700" fz="lg">{props.short_name}</Text>
            </Group>

            <Divider my="md" />

            <Group justify="flex-start" mt="xs" mb="xs" ml="md" >
                <Text fw="md" fz="md" c={'grayColor.5'}>Адрес</Text>
                <Text fw="md" fz="md">{props.address}</Text>
            </Group>

            <Divider my="md" /> */}

            {/* <Group
                onClick={() => navigate("/object/" + props.id)}
                justify="space-between"
                mt="xs"
                style={{ cursor: "pointer" }}>

                <Text fw="md" fz="md">Просмотреть подробности</Text>
                <FaArrowRight size="1.5em" />

            </Group> */}

        </div >
    );
}
