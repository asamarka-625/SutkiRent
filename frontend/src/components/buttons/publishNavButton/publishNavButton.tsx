import { Button, Group } from "@mantine/core";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import  PlusSVG  from "../../../icons/plus_small.svg?react"
import styles from "./publishNavButton.module.css";
// export function logOut() {
//   const navigate = useNavigate();
//   navigate("/partners")
//   // window.location.href = "/auth";

// }


export function PublishNavButton() {
 const navigate = useNavigate()
    return (
        <Button className={styles[`tab`]} variant="outline" onClick={() => navigate('/404')}>
            <Group gap={"xs"}>
                <PlusSVG />
                Разместить объявление
            </Group>
        </Button>
    )

}