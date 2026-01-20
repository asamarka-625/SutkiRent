import styles from "./excursionPage.module.css";
import { Carousel } from "@mantine/carousel";
import { getExcursionById } from "../../../../services/excursionsServices.ts";
import { errorHandler } from "../../../../handlers/errorBasicHandler.ts";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@mantine/core";
import DOMPurify from 'dompurify';
import type { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "../../../../components/caurousel/caorusel.tsx";

interface ExcursionDto {
  id: string,
  title: string,
  content: string,
  publication_date: string,
  short_description: string,
  media: { id: string, file: string, excursion: string }[]
}

export function ExcursionPage() {
  const { id } = useParams();
  const [item, setItem] = useState<ExcursionDto | null>(null);
  const [backImage, setBackImage] = useState('')
  const [hasMoreMedia, setHasMoreMedia] = useState(false)
  const isMobile = useMediaQuery('(max-width: 48em)');
  const isLoading = useRef<boolean>(false);
  const OPTIONS: EmblaOptionsType = {}

  const slides = (item?.media || []).map((m) => (
    <Carousel.Slide key={m.file}>
      <img src={m.file} className={styles["carouselImages"]} />
    </Carousel.Slide>
  ));
  const urls = (item?.media || []).map((m) => m.file);
  const SLIDES = urls.slice(1);

  async function load() {
    isLoading.current = true;
    const response = await getExcursionById(id || '')
    if (response.ok) {
      const data: ExcursionDto = await response.json();
      setItem(data)
      if (data.media && data.media.length > 0) {
        setBackImage(data.media[0].file)
        setHasMoreMedia(data.media.length > 1)
      }
    }
    else {
      setItem(null)
      const error = await response.json().catch(() => ({}));
      if (errorHandler(response.status) == 5) {
        showNotification({ title: "Ошибка сервера, обновите страницу", message: error.statusText, icon: <IconX /> })
      }
    }
    isLoading.current = false;
  }

  useEffect(() => { window.scrollTo(0, 0); load(); }, [])

  return (
    <div className="paperdiv">
      <div className="paperdiv">
        <div className={styles.bannerImage} style={{ backgroundImage: `url(${backImage})` }}>
          <div className={styles.customOverlay}></div>
          <h2 className={styles.textHigh}>{item?.title}</h2>
          <div className={styles.bannerBorder}></div>
        </div>
        <div className={styles.banner}>
          <h2 className="HeadingStyle2">{item?.title}</h2>
          <div className={styles["papercardItem"]}>
            <div>{isLoading.current ? <Loader type="dots" ml="30" size="xs" /> : (
              item?.content ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) + "<p></p>" }}></div> : "Страница пока пустая."
            )}</div>
          </div>
          {hasMoreMedia ? (
            <div style={{ width: '900px', margin: '0 auto', maxWidth: '100%', paddingTop: "20px" }}>
              <EmblaCarousel slides={SLIDES} options={OPTIONS} />
            </div>
          ) : ''}
        </div>
      </div>
    </div>
  )
}


