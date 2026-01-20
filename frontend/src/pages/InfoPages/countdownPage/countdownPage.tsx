import styles from './countdownPage.module.css'
import { useEffect, useMemo, useState } from 'react'

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

function calculateTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now())
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((diff % (60 * 1000)) / 1000)
  return { days, hours, minutes, seconds }
}

export function CountdownPage() {
  // Цель фиксирована: отсчёт привязан к дате 07.11 + 32 дня.
  // Временная зона: МСК (+03:00), чтобы избежать дрейфа при локальном времени пользователя.
  const target = useMemo(() => {
    const startMs = Date.parse('2025-11-07T00:00:00+03:00');
    const endMs = startMs + 32 * 24 * 60 * 60 * 1000;
    return endMs;
  }, [])
  const [left, setLeft] = useState<TimeLeft>(() => calculateTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setLeft(calculateTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return (
    <div className="paperdiv">
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Страница в разработке.</h1>
        <div className={styles.timer}>
          <div className={styles.block}><span className={styles.num}>{left.days}</span><span className={styles.label}>дней</span></div>
          <div className={styles.sep}>:</div>
          <div className={styles.block}><span className={styles.num}>{left.hours.toString().padStart(2,'0')}</span><span className={styles.label}>часов</span></div>
          <div className={styles.sep}>:</div>
          <div className={styles.block}><span className={styles.num}>{left.minutes.toString().padStart(2,'0')}</span><span className={styles.label}>минут</span></div>
          <div className={styles.sep}>:</div>
          <div className={styles.block}><span className={styles.num}>{left.seconds.toString().padStart(2,'0')}</span><span className={styles.label}>секунд</span></div>
        </div>
        <p className={styles.note}>Дата окончания: {new Date(target).toLocaleString('ru-RU')}</p>
      </div>
    </div>
  )
}


