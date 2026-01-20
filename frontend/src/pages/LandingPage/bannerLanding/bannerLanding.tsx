import styles from './bannerLanding.module.css';
export function BannerLanding() {
  const squareData = [
    { number: "100+", text: "объектов в управлении" },
    { number: "18 лет", text: "на рынке аренды" },
    { number: "100 000+", text: "довольных клиентов" }
  ];
  return (
    <div className={styles.container}>
      <div className={styles.mainCard}>
        <h1 className={styles.title}>Посуточная аренда квартир</h1>
        <div className={styles.bottomSection}>
          <div className={styles.greenBar}>
            <h2 className={styles.subtitle}>В Санкт-Петербурге и других регионах РФ</h2>
          </div>
          <div className={styles.list}>
            <div>100+ объектов в управлении</div>
            <div>18 лет на рынке аренды</div>
            <div>100 000+ довольных клиентов</div>
          </div>
        </div>
      </div>
      <div className={styles.squaresWrapper}>
        {squareData.map((item, index) => (
          <div key={index} className={styles.square}>
            <div className={styles.squareContent}>
              <span className={styles.squareNumber}>{item.number}</span>
              <span className={styles.squareText}>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )


}