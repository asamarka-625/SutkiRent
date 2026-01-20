import { Divider, Flex, Group } from "@mantine/core";
import styles from './objectLandingCard.module.css'

interface MetroStation {
    name: string;
  }

  interface Banner {
    id: string;
    name: string;
  }


type Object = {
    pk: number;
    short_name: string;
    cost: string;
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
    near_metro: []; // или MetroStation[], если есть тип для станций метро
    media: {
      source_type: string; // или union тип, если возможны другие варианты
      url: string;
    };
    refreshList: () => void;
    IsDatesSet: boolean
  };
  
export function ObjectLandingCard(props: Object) {

    // const navigate = useNavigate()
    const getMetroString = (metros: MetroStation[]): string => {
        if (Array.isArray(metros) && metros.length != 0) {
            return metros.map(metro => metro.name).join(', ');
        }
        else {
            return "Нет";
        }
    };
    return (
        <div className="papercardObjectVertical" onClick={() => props.refreshList()}>
            <div className="block">
                <div className="customOverlay"></div>
                {props.banner ? <div className={styles.topBanner}>{props.banner?.name}</div> : ""}
                <img
                    src={props.media?.url || "/404.jpg"}
                ></img>
                <Flex className="HeadingStyleCost" gap={5} align="flex-end">
                    {props.IsDatesSet ? "" : <span>от</span>}
                    <h1 >{props.cost} ₽</h1>
                </Flex>

            </div>
            <Flex
                className="cardDescription"
                direction={"column"}>
              
                <div className={`shortName`}>{props.short_name}</div>
                <Group className={ `characteristics`}>
                    <div>{props.amount_rooms} комнат</div>
                    <Divider orientation="vertical" />
                    <div>{props.floor} этаж</div>
                    <Divider orientation="vertical" />
                    <div>{props.space} м²</div>
                    <Divider orientation="vertical" />
                </Group>
                <div className={ `metro`}>Метро: {getMetroString(props.near_metro)} </div>
                {/* Тут будет типо иконка + название метра */}
                <div className={ `address`}>{props.address}</div>

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

        </div>
    );
}
