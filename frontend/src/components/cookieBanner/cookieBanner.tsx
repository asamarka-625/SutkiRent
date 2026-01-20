import styles from './cookieBanner.module.css';
import { Button, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { Cookies } from 'react-cookie-consent';
import { setConsent } from '../../services/cookiesServices';
import Cookie from '../../icons/cookie.svg?react'
import { globalRef } from '../../globalSettings';

export function CookieBanner() {
    const bannerRef = useRef<HTMLDivElement>(null);

    async function onClose(bool: boolean) {
        setConsent(bool);
        if (bannerRef.current) {
            bannerRef.current.style.display = 'none';
        }
    }
       const isMobile = useMediaQuery('(max-width: 48em)');

    useEffect(() => {
        globalRef.current = bannerRef.current;
        // Сразу скрываем баннер, если cookie уже установлен
        if (Cookies.get('cookie_consent') && bannerRef.current) {
            bannerRef.current.style.display = 'none';
        }
    }, []);

    // Если cookie уже есть, не рендерим баннер вообще
    if (Cookies.get('cookie_consent')) {
        return null;
    }

 
    return (
        <div className={styles.banner} ref={bannerRef} style={{
        }}>
            <Group gap={6}>
                <Cookie width={115} height={40} />
                <div className={styles.bannerContent}>
                    <h3 className={styles.bannerTitle}>Наш сайт использует cookies</h3>
                    <p>Мы используем cookie в соответсвии с нашей <a>Cookie политикой.</a></p>
                </div>
            </Group>

            <div>
                <Button color="var(--mantine-color-sberGreenColor-9)" size={isMobile ? 'sm' : 'md'} w="120" m={isMobile? 7 : 20} variant='outline' radius={20}
                    onClick={() => onClose(false)}>Отклонить</Button>
                <Button color="var(--mantine-color-sberGreenColor-9)" size={isMobile ? 'sm' : 'md'} w="120" m={isMobile? 7 : 20} ml={-7} radius={20}
                    onClick={() => onClose(true)}>Принять</Button>
            </div>
            {/* <img src='/womanBanner.png' alt="Изображение баннера" className="banner-image" /> */}
        </div>
    )


}