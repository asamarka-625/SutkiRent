import { useState, useEffect } from "react";
import { Button, Flex, Tooltip} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./logInButton.module.css";
import EnterSVG from "../../../icons/enter.svg?react";
import authService from "../../../services/authService";

export function LogInNavButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [user, setUser] = useState(authService.getUser());

    // Обновляем состояние при изменении маршрута или при монтировании
    useEffect(() => {
        const updateAuthState = () => {
            setIsAuthenticated(authService.isAuthenticated());
            setUser(authService.getUser());
        };

        updateAuthState();

        // Слушаем изменения localStorage
        window.addEventListener('storage', updateAuthState);

        return () => {
            window.removeEventListener('storage', updateAuthState);
        };
    }, [location]);

    const label = isAuthenticated
        ? (user?.first_name || user?.username || "Войти")
        : "Войти";
    // Если не авторизован — ведём на страницу входа, если авторизован — в личный кабинет
    const target = isAuthenticated ? "/lk" : "/login";

    return (
        <Tooltip label="Войти">
            <Button className={styles[`tab`]} variant="outline" size='xs' onClick={() => navigate(target)} color="grayColor.7">
                <Flex gap={"xs"} align={"center"}>
                    <div
                        className='mantine-visible-from-lg'>
                        <EnterSVG />
                    </div>
                    <div
                        className='mantine-hidden-from-lg'>
                        <EnterSVG width={17} height={17} />
                    </div>

                    <div
                        className='mantine-visible-from-lg'
                        style={{ marginBottom: 1 }}
                    >{label}
                    </div>
                </Flex>
            </Button >
        </Tooltip>
    )
}