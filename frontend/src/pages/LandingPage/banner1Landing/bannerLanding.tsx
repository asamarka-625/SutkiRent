import styles from './bannerLanding.module.css';
import { Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
export function BannerCertificateLanding() {
   const isMobile = useMediaQuery('(max-width: 48em)');
  const navigate = useNavigate();
  return (
    <div className={styles.banner} style={{
      backgroundImage: isMobile ? 'none' : `url(/womanBanner.png)`,
       backgroundPosition: "right", // или "right top" для точного позиционирования
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain" // или "auto" если нужно оригинальный размер
    }}>
      <div className={styles.bannerContent}>
        <h1 className={styles.bannerTitle}>Подарочный сертификат<br /> на путешевствие</h1>
        <p className={styles.bannerText}>Сделайте близким или деловым партнёрам запоминающийся
          <br />подарок — сертификат на путешествие, которое останется в
          <br />сердце навсегда!</p>
        <Button color="var(--mantine-color-sberGreenColor-9)" size={isMobile? 'md' : 'lg'} maw="220" radius={10} onClick={() => navigate('/countdown')}>Подарить сертификат</Button>
      </div>
      {/* <img src='/womanBanner.png' alt="Изображение баннера" className="banner-image" /> */}
    </div>
  )


}