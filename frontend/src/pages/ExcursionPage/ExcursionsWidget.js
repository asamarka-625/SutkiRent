// import { useEffect } from 'react';

// const ExcursionsWidget = () => {
//   useEffect(() => {
//     // Динамически создаём конфиг
//     const configScript = document.createElement('script');
//     configScript.id = 'ap-showcase-config';
//     configScript.type = 'application/json';
//     configScript.textContent = JSON.stringify({
//       partner: 61,
//       excursions: [2,3,4,12,14,35,36,42,45,48,49,58,61,64,65,94,127,201,202,203,204,205,206,207,230,241,243,274,283,296,352]
//     });

//     // Загружаем основной скрипт
//     const mainScript = document.createElement('script');
//     mainScript.src = 'https://lk.excurr.ru/js/showcase3.js';
//     mainScript.async = true;

//     // Вставляем в DOM
//     document.body.appendChild(configScript);
//     document.body.appendChild(mainScript);

//     // Очистка при unmount
//     return () => {
//       document.body.removeChild(configScript);
//       document.body.removeChild(mainScript);
//       // Удаление виджета, если нужно
//       const widgetContainer = document.getElementById('ap-showcase3');
//       if(widgetContainer) widgetContainer.innerHTML = '';
//     };
//   }, []);

//   return <div id="ap-showcase3"/>
// };

// export default ExcursionsWidget;