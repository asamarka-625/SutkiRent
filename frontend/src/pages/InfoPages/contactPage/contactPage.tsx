import { useState } from "react";
import styles from "./contactPage.module.css";
import Copy from "../../../icons/Copy.svg?react"
import TickCircle from "../../../icons/Tick_Circle.svg?react"
import { Divider } from "@mantine/core";

const CopyBlock = ({ label, type, value }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
    };

    return (
        <div className={styles.copyBlock}>
            <div className={styles.label}>{label}</div>
            <div className={styles.valueRow}>
                <a className={styles.value} href={type + value}>{value}</a>
                {/* {copied ? <TickCircle width="25" height="25"></TickCircle> : <Copy onClick={copyToClipboard}></Copy>} */}
                {/* <button
                    onClick={copyToClipboard}
                    className={styles.copyButton}
                    aria-label={`Скопировать ${label}`}
                >
                    {copied ? '✓ Скопировано' : 'Копировать'}
                </button> */}
            </div>
        </div>
    );
};


export function ContactPage() {
    return (
        <div className="paperdiv">
            <h2 className="HeadingStyle2" style={{ marginBottom: "2px" }}>Контакты для связи</h2>
            <div className="paperdiv">
                <div className={styles.paper}>
                    <div className="papercard">
                        <CopyBlock
                            label="Номер телефона:"
                            type='tel:'
                            value="+79955775368"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="Электронная почта:"
                            type='mailto:'
                            value="Elkined@yandex.ru"
                        />
                    </div>

                </div>

            </div>
        </div>
    )
}