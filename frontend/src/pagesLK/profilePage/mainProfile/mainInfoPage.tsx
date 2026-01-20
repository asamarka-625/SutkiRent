
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Flex, TextInput } from "@mantine/core";
import styles from "./mainInfoPage.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { IMaskInput } from "react-imask";
import { useEffect, useState } from "react";
import { ProfileButton } from "../../../components/buttons/profileButton/profileButton";
import authService, { UserProfile } from "../../../services/authService";



export function MainInfoPage() {

    const isMobile = useMediaQuery("(max-width: 48em)");
    const [isRedacted, setIsRedacted] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');

    useEffect(() => {
        // Загружаем данные профиля с сервера
        (async () => {
            const profileResp = await authService.getProfile();
            if (profileResp.success && profileResp.profile) {
                const profile = profileResp.profile as UserProfile;
                // Загружаем данные, даже если они пустые
                setFirstName(profile.first_name || '');
                setLastName(profile.last_name || '');
                setUsername(profile.username || '');
                setEmail(profile.email || '');
                setPhone(profile.phone || '');
                setGender(profile.gender || 'unknown');
            } else {
                // fallback к localStorage, если профиль не загрузился
                try {
                    const stored = localStorage.getItem("user");
                    if (stored) {
                        const user = JSON.parse(stored) as { username?: string; email?: string; first_name?: string; last_name?: string };
                        setFirstName(user.first_name || '');
                        setLastName(user.last_name || '');
                        setUsername(user.username || user.first_name || '');
                        setEmail(user.email || '');
                    }
                } catch {
                    // ignore
                }
            }
        })();
    }, []);

    const displayName = (firstName || username || "").trim() || "Профиль";

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, "");
        if (!digits) return "";
        const normalized = digits.startsWith("7") ? digits : `7${digits}`;
        return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
    };

    return (
        <div className="papercardLK">
            <div className="paperHeaderLK"
                style={{
                    backgroundColor: "var(--mantine-color-sberGreenColor-9)",
                    color: "var(--mantine-color-grayColor-0)"
                }}
            >
                <h2 className={"HeadingTitle"} style={{ color: "var(--mantine-color-grayColor-0)"}}>Личные данные</h2>
            </div>
            <div className="papercard" style={{ gap: "20px" }}>
                <ProfileButton
                    name={displayName}
                    size="xl"
                    fontSize="24px"
                    fontSizeSub="16px"
                    direction_ava="column"
                    direction_text="column"
                    gender={gender}
                />
                {/* <Divider mt={10}></Divider> */}
                <div className="papercard">
                    <Flex justify={"space-between"} style={{ marginBottom: "20px" }}>
                        <div className="papercard" style={{ padding: "8px" }}>
                            {/* <div className={styles.headingInfo}>E-Mail</div> */}
                            <TextInput
                                variant={isRedacted ? "default" : "filled"}
                                disabled={!isRedacted}
                                placeholder="example@domain.com"
                                type="email"
                                label="E-Mail"
                                value={email}
                                onChange={(e) => setEmail(e.currentTarget.value)}
                            />
                        </div>
                        {/* <Divider></Divider> */}
                        <div className="papercard" style={{ padding: "8px" }}>
                            {/* <div className={styles.headingInfo}>Телефон</div> */}
                            <TextInput
                                variant={isRedacted ? "default" : "filled"}
                                disabled={!isRedacted}
                                placeholder="+7 (___) ___-__-__"
                                component={IMaskInput}
                                mask="+7 (000) 000-00-00"
                                label="Телефон"
                                value={formatPhone(phone)}
                                onChange={(e: any) => {
                                    const value = e.target.value || "";
                                    const digits = value.replace(/\D/g, "");
                                    const normalized = digits.startsWith("7") ? digits : digits ? `7${digits}` : "";
                                    setPhone(normalized);
                                }}
                            />
                        </div>
                    </Flex>
                    <Button
                      fullWidth
                      color="sberGreenColor.9"
                      variant={isRedacted ? "outline" : "filled"}
                      onClick={async () => {
                        if (!isRedacted) {
                          // Переход в режим редактирования
                          setIsRedacted(true);
                          return;
                        }

                        // Сохранение email и телефона
                        const resp = await authService.updateProfile({ 
                            email,
                            phone: phone || undefined
                        });
                        if (resp.success) {
                          setIsRedacted(false);
                        }
                      }}
                    >
                        {isRedacted ? "Сохранить" : "Редактировать"}
                    </Button>
                </div>

            </div>
        </div>
    )
}