import { Button, Flex, Group } from "@mantine/core";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationSVG  from "../../../icons/location.svg?react";
import styles from "./locationNavButton.module.css";

// export function logOut() {
//   const navigate = useNavigate();
//   navigate("/partners")
//   // window.location.href = "/auth";

// }

type Location = {
  userCity: string
}

export function LocationNavButton(props: Location) {
  //  const [userCity, setUserCity] = useState("Caнкт-Петербург")

  return (
    <Button
    disabled
      className={styles[`tab`]}
      variant="outline">
      <Flex gap={"xs"} align={"center"}>
      <LocationSVG width="15" height="15" />
      <div style={{marginBottom: 1}}>{props.userCity}</div>
      </Flex>
    </Button>
  )

}