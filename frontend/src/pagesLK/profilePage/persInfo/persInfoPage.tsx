
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Group, Textarea, TextInput } from "@mantine/core";
import styles from "./persInfoPage.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { IMaskInput } from 'react-imask';
import { DateInput } from "@mantine/dates";
import authService, { UserProfile } from "../../../services/authService";



export function PersInfoPage() {

    const isMobile = useMediaQuery('(max-width: 48em)');
    const [isRedacted, setIsRedacted] = useState(false);
    const [lastName, setLastName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [middleName, setMiddleName] = useState<string>('');
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [about, setAbout] = useState<string>('');

    useEffect(() => {
        (async () => {
            const resp = await authService.getProfile();
            if (resp.success && resp.profile) {
                const p = resp.profile as UserProfile;
                // Загружаем данные, даже если они пустые (чтобы показать пустые поля)
                setLastName(p.last_name || '');
                setFirstName(p.first_name || '');
                setMiddleName(p.middle_name || '');
            }
        })();
    }, []);

    return (
        <div className="papercardLK">
            <div className="paperHeaderLK"
                style={{
                    // backgroundColor: "var(--mantine-color-grayColor-3)",
                    // color: "var(--mantine-color-grayColor-0)"
                }}
            >
                <h3 className="HeadingStyle3">Персональная информация</h3>
            </div>
            {/* <Divider></Divider> */}
            <div className="papercard">
                <div className={styles.pageLayout}>
                    <TextInput
                        variant={isRedacted ? "default" : "filled"}
                        disabled={!isRedacted}
                        label="Фамилия"
                        value={lastName}
                        onChange={(e) => setLastName(e.currentTarget.value)}
                    />
                    <TextInput
                        variant={isRedacted ? "default" : "filled"}
                        disabled={!isRedacted}
                        label="Имя"
                        value={firstName}
                        onChange={(e) => setFirstName(e.currentTarget.value)}
                    />
                    <TextInput
                        variant={isRedacted ? "default" : "filled"}
                        disabled={!isRedacted}
                        label="Отчество"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.currentTarget.value)}
                    />
                    <DateInput
                        locale="ru"
                        valueFormat="DD MMM, YYYY"
                        variant={isRedacted ? "default" : "filled"}
                        disabled={!isRedacted}
                        label={isMobile ? "Дата рож." : "Дата рождения"  }
                        value={birthDate}
                        onChange={setBirthDate}
                    />
                    <Textarea
                        className={styles.textArea}
                        autosize 
                        variant={isRedacted ? "default" : "filled"}
                        maxRows={50}
                        disabled={!isRedacted}
                        label="О себе:"
                        placeholder='Например: "Люблю котят, Санкт-Петербург и Sutki Rent"'
                        value={about}
                        onChange={(e) => setAbout(e.currentTarget.value)}
                    />
                    {/* НАМЕРЕННЫЕ ПРОБЕЛЫ */}

                    <Group className={styles.button} justify="flex-end">
                         { isRedacted ? 
                        <Button color="grayColor.7"
                            onClick={() => setIsRedacted(!isRedacted)}
                            // disabled={isRedacted}
                            variant={"outline"}
                        >
                            {"Отменить"}
                        </Button> : ''}
                        
                        <Button
                          color="sberGreenColor.9"
                          style={{ width: "150px" }}
                          variant={isRedacted ? "outline" : "filled"}
                          onClick={async () => {
                            if (!isRedacted) {
                              setIsRedacted(true);
                              return;
                            }

                            const payload: Partial<UserProfile> = {
                              first_name: firstName,
                              last_name: lastName,
                              middle_name: middleName,
                            };

                            const resp = await authService.updateProfile(payload);
                            if (resp.success) {
                              setIsRedacted(false);
                            }
                          }}
                        >
                            {isRedacted ? "Сохранить" : "Редактировать"}
                        </Button>

                    </Group>




                </div>

            </div>
        </div>
    )
}