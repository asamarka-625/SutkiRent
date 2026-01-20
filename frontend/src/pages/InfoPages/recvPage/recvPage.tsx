import { useState } from "react";
import styles from "./recvPage.module.css";
import  Copy  from "../../../icons/Copy.svg?react"
import  TickCircle from "../../../icons/Tick_Circle.svg?react"
import { Divider } from "@mantine/core";

const CopyBlock = ({ label, value }) => {
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
                <span className={styles.value}>{value}</span>
                {copied ? <TickCircle width="25" height="25"></TickCircle> : <Copy onClick={copyToClipboard}></Copy>}
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


export function RecvPage() {
    return (
        <div className="paperdiv">
            <h2 className="HeadingStyle2" style={{ marginBottom: "2px" }}>Реквизиты</h2>
            <div className="paperdiv">
                <div className={styles.paper}>
                    <div className="papercard">
                        <CopyBlock
                            label="Наименование:"
                            value="ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ:  ТУРКИН ДМИТРИЙ АЛЕКСЕЕВИЧ"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="Юридический адрес:"
                            value="188662, РОССИЯ, ЛЕНИНГРАДСКАЯ ОБЛ, ВСЕВОЛОЖСКИЙ Р-Н, Г. МУРИНО, УЛ. ОБОРОННАЯ, Д. 2, КОРП 2, КВ. 15, КПП: 0."
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="ИНН:"
                            value="511601629349"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="Расчетный счет:"
                            value="40802810020000836179"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="ОГРН:"
                            value="323470400062583"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="Банк:"
                            value="ООО «Банк Точка»"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="БИК банка:"
                            value="044525104"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="Корреспондентский счет банка:"
                            value="30101810745374525104"
                        />
                    </div>
                    <Divider size={"2px"}></Divider>
                    <div className="papercard">
                        <CopyBlock
                            label="Юридический адрес банка:"
                            value="109044, Российская Федерация, г. Москва, вн.тер.г. муниципальный округ Южнопортовый, пер. 3-й Крутицкий, д.11, помещ. 7Н"
                        />
                    </div>


                </div>


            </div>




        </div>
    )
}