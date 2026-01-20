import { Avatar, Flex } from "@mantine/core";
import styles from "./profileButton.module.css";

type Gender = "male" | "female" | "unknown";

type Props = {
  name: string;
  size?: string;
  color?: string;
  variant?: string;
  fontSize?: string;
  subname?: string;
  fontSizeSub?: string;
  direction_ava?: string;
  direction_text?: string;
  gap?: string;
  alignText?: string;
  gender?: Gender;          // пол пользователя: 'male', 'female', 'unknown'
};

export function ProfileButton(props: Props) {
  const name = props.name || "Пользователь";

  // Выбор аватара по полу, если пол не передан — используем un.png
  const gender: Gender = props.gender || "unknown";
  const src =
    gender === "male"
      ? "/men1.png"
      : gender === "female"
      ? "/girl1.png"
      : "/un.png"; // для unknown используем un.png

  return (
    <Flex
      direction={props.direction_ava || "row"}
      gap={props.gap || "10"}
      align={"center"}
    >
      <Avatar
        name={name}
        src={src}
        size={props.size || "md"}
        color={props.color || "sberGreenColor.9"}
        variant={props.variant || "outline"}
      />
      <Flex
        direction={props.direction_text || "row"}
        align={props.alignText || "center"}
      >
        <div
          className={styles.profileName}
          style={{ fontSize: props.fontSize || "inherit" }}
        >
          {props.name}
        </div>
        <div
          className={styles.profileSubName}
          style={{
            fontSize: props.fontSizeSub || "inherit",
            display: props.subname ? "inherit" : "none",
          }}
        >
          {props.subname}
        </div>
      </Flex>
    </Flex>
  );
}


