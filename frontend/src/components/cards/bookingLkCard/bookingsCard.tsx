import { Button, Flex, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import styles from "./bookingsCard.module.css";
import { useRef, useState } from "react";
import LocationSVG from "../../../icons/location.svg?react";
import { useMediaQuery } from "@mantine/hooks";
import { declineRoomWord, declineGuestWord } from "../../../handlers/pravopisanieHandler";
import { ImageWithFallback } from "../../image/ImageWithFallback";

interface MetroStation {
  name: string;
}

interface Banner {
  id: string;
  name: string;
}

type ObjectProps = {
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
  refreshList: () => void;
  IsDatesSet: boolean;
  highlightedId: number | null;
};

export function BookingCard(props: ObjectProps) {
  const navigate = useNavigate();
  const [typeName] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 48em)");

  const getMetroString = (metros: MetroStation[]): string => {
    if (metros.length !== 0) {
      return metros.map((metro) => metro.name).join(", ");
    }
    return "Нет";
  };

  const isHighlighted = props.id === props.highlightedId;

  return (
    <div className={`papercardObjectHorizontalLK ${isHighlighted ? "hover" : ""}`}>
      <div className={styles.pageLayout}>
        <div className="blockHozLK">
          <ImageWithFallback
            style={{
              ...(isMobile && { gridRow: 1 }),
              padding: "10px",
              borderRadius: "20px",
              maxHeight: "100%",
              maxWidth: "100%",
              display: "block",
            }}
            wrapperStyle={{
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            fallbackSrc="/blur_404.jpg"
            src={props.media?.url}
            alt={"Photo"}
          />
        </div>
        <div
          className={styles.carddiv}
          style={{
            ...(isMobile && { gridRow: 2 }),
          }}
        >
          <Flex className={styles.cardDescription} direction={"column"}>
            <div>Sutki Rent {typeName}</div>
            <div
              className="HeadingStyle3"
              ref={contentRef}
              style={{ fontSize: "16px", maxHeight: "75px", overflow: "hidden", paddingTop: "5px" }}
            >
              {props.short_name}
            </div>
            <Group className={styles.characteristics} gap={3}>
              <div>
                {props.amount_rooms} {declineRoomWord(props.amount_rooms)} •{" "}
              </div>
              <div>{props.space} м² • </div>
              <div>{props.floor} этаж • </div>
              <div>{props.capacity} {declineGuestWord(props.capacity)}</div>
            </Group>
            <div className={styles.location}>
              <div>
                <Flex gap={"xs"} align={"center"}>
                  <LocationSVG width="15" height="15" />
                  <div style={{ marginBottom: 1 }}>{props.address}</div>
                </Flex>
              </div>
            </div>
          </Flex>
        </div>

        <div
          className={styles.costLayout}
          style={{
            ...(isMobile && {
              gridRow: 3,
              width: "100%",
            }),
          }}
        >
          <Flex justify={"flex-end"} align="center">
            {props.banner ? (
              <div className={styles["topBanner" + props.banner.id]}>{props.banner?.name}</div>
            ) : (
              ""
            )}
          </Flex>

          <Flex className="HeadingStyleCostSmall" gap={5} align="center" justify={"flex-end"}>
            <h3>{props.cost.toLocaleString("ru-RU")} ₽</h3>
          </Flex>
        </div>

        <div className={styles.buttonRow}>
          <Button 
            className={styles.more} 
            size="compact-md" 
            variant="white" 
            color="sberGreenColor.9"
            onClick={() => navigate(`/object/${props.id}`)}
          >
            Подробнее
          </Button>
          <Button className={styles.more} size="compact-md" variant="white" color="grayColor.6">
            Связаться с поддержкой
          </Button>
        </div>
      </div>
    </div>
  );
}


