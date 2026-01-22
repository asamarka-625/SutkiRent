import { Button, Flex, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
// import { fetchAddress } from "../../../../globalSettings";
// import { errorHandler } from "../../../../handlers/errorBasicHandler";
import styles from './searchPageCard.module.css'
import { useRef, useState } from "react";
import LocationSVG from "../../../icons/location.svg?react";
import { useMediaQuery } from "@mantine/hooks";
import { LikeButton } from "../../../components/buttons/likeButton/likeButton.tsx";
import { declineGuestWord, declineRoomWord } from "../../../handlers/pravopisanieHandler.ts";
import { ImageWithFallback } from "../../../components/image/ImageWithFallback.tsx";

interface MetroStation {
    name: string;
}
interface Banner {
    id: string;
    name: string;
}

type Object = {
    id: number;
    short_name: string;
    cost: number;
    type: string | null;
    amount_rooms: number;
    sleeps: string;
    floor: number;
    capacity: number;
    region: string | null;
    city: string;
    banner: Banner | null;
    space: number;
    address: string;
    near_metro: [];
    media: {
        source_type: string;
        url: string;
    };
    refreshList: () => void
    IsDatesSet: boolean
    highlightedId: number | null
};


export function SearchPageCard(props: Object) {

    const navigate = useNavigate()
    const [typeName, setTypeName] = useState('')
    const contentRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 48em)');
    const getMetroString = (metros: MetroStation[]): string => {
        if (Array.isArray(metros) && metros.length != 0) {
            return metros.map(metro => metro.name).join(', ');
        }
        else {
            return "Нет";
        }
    };

    const isHighlighted = props.id === props.highlightedId;
    // async function displayType() {
    //     const regionId = props.type;
    //     let regionName: string = await getTypeNameById(regionId?.toString() || "");
    //     setTypeName(regionName)
    // }

    //    useEffect(() => {
    //         displayType()
    //    }, []);

    return (
        <div className={`papercardObjectHorizontal ${isHighlighted ? 'hover' : ''}`}>
            <div className={styles[`pageLayout`]} >
                <div className="blockHoz">
                    <LikeButton id={props.id}></LikeButton>
                    {props.banner ?
                        <div className={styles.topBanner}>{props.banner?.name}</div> : ""}
                    <ImageWithFallback
                        style={{
                            ...(isMobile && { gridRow: 1 }),
                        }}
                        fallbackSrc="/blur_404.jpg"
                        src={props.media.url}
                        alt={"Photo"}
                    ></ImageWithFallback>
                </div>
                <div className={styles[`carddiv`]} style={{
                    ...(isMobile && { gridRow: 2 })
                }}>
                    <Flex
                        className={styles[`cardDescription`]}
                        direction={"column"}>

                        <div className={styles[``]}>Sutki Rent {typeName}</div>
                        <div className="HeadingStyle3" ref={contentRef} style={{ fontSize: "17px", maxHeight: '75px', overflow: "hidden" }}>{props.short_name}</div>
                        <Group className={styles[`characteristics`]} gap={3}>
                            <div>{props.amount_rooms} {declineRoomWord(props.amount_rooms)} • </div>
                            {/* <div>{props.space} м² • </div> */}
                            {/* <Divider orientation="vertical" /> */}
                            <div>{props.floor} этаж • </div>
                            {/* <Divider orientation="vertical" /> */}
                            <div>{props.capacity} {declineGuestWord(props.capacity)}</div>
                            {/* <Divider orientation="vertical" /> */}
                        </Group>
                        <div className={styles[`location`]}>
                            {props.near_metro.length === 0? <div className={styles[``]}>Близко к метро: {getMetroString(props.near_metro)}</div> : ''}
                            <div className={styles[``]}>
                                <Flex gap={"xs"} align={"center"}>
                                    <LocationSVG width="15" height="15" />
                                    <div style={{ marginBottom: 1 }}>{props.address}</div>
                                </Flex>
                            </div>
                        </div>
                        {/* <Badge color="sutkiGreenColor.4" mt={10}>9.0</Badge> */}
                        {/* <Button mt={10}
                                    visibleFrom="xl" 
                                    className="searchButton"
                                    color="var(--mantine-color-sberGreenColor-9)"
                                    onClick={() => navigate("/object/" + props.id)}
                                >
                                    Забронировать
                                </Button> */}
                    </Flex>
                </div>



                <div className={styles[`costLayout`]} style={{
                    ...(isMobile && {
                        gridRow: 3,
                        width: '100%',
                        // paddingTop: 'var(--mantine-spacing-sm)',
                    }),
                }}>
                    {/* {props.banner ?
                        <div className={styles.sideBanner}>{props.banner?.name}</div> : ""} */}


                    <Flex className="HeadingStyleCostSmall" gap={5} align="center" justify={"center"} direction={props.IsDatesSet && !isMobile ? 'column' : ''}>
                        {props.IsDatesSet ? "" : <span>от</span>}
                        <h3>{props.cost} ₽</h3>
                        {props.IsDatesSet ? <span>за этот период</span> : <span>сутки</span>}
                    </Flex>
                    <Button
                        // onTouchStart={(e) => e.preventDefault()}  //че то там для ios и отключения прокрутки
                        m={10}
                        color="var(--mantine-color-sberGreenColor-9)"
                        onClick={() => props.refreshList()}
                    >
                        Просмотреть
                    </Button>
                </div>


            </div>




        </div>

    );
}
