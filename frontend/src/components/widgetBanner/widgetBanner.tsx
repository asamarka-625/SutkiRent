import { useRef, useEffect } from 'react';
import styles from './widgetBanner.module.css';

export function WidgetBanner() {
    // const applyTheme = () => {
    //     console.log('зеленеем')
    //     const style = document.createElement('style');
    //     style.innerHTML = `
    //   /* Основные элементы виджета */
    //   .b24-widget-button-wrapper {
    //     --b24-primary-color: #22c55e !important;
    //     --b24-primary-hover-color: #22c55e !important;
    //   }
      
    //   .b24-widget-button-inner-block,
    //   .b24-widget-button-social-item,
    //   .b24-widget-button-popup {
    //     background-color: #22c55e !important;
    //     border-color: #22c55e !important;
    //   }
      
    //   .b24-widget-button-social-item:hover {
    //     background-color: #16a34a !important;
    //     border-color: #16a34a !important;
    //   }
      
    //   .b24-widget-button-popup-triangle {
    //     border-color: #22c55e !important;
    //   }
      
    //   /* Текст и иконки */
    //   .b24-widget-button-popup-name,
    //   .b24-widget-button-popup-description {
    //     color: #22c55e !important;
    //   }
      
    //   /* Анимация пульсации */
    //   .b24-widget-button-pulse {
    //     border-color: #22c55e !important;
    //   }
    // `;

    //     document.head.appendChild(style);
    // };
    // return (
    //     <div style={{
    //     }}>
    //         ыыга бугааа
    //     </div>
    // )
    const isScriptAdded = useRef(false);

    useEffect(() => {
        // Проверяем, не добавлен ли уже скрипт
        if (isScriptAdded.current) return;

        // Проверяем, не добавлен ли скрипт уже вручную в DOM
        const existingScript = document.querySelector('script[src*="bitrix24.ru"]');
        if (existingScript) {
            isScriptAdded.current = true;
            // console.log('sScriptAdded.current = true;')
            // applyTheme();
            return;
        }

        // Создаем и добавляем скрипт
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://cdn-ru.bitrix24.ru/b22515974/crm/site_button/loader_2_s8bel5.js?' + (Date.now() / 60000 | 0);

        // script.onload = () => {
        //     // Ждем немного для инициализации виджета, затем применяем стили
        //     setTimeout(applyTheme, 1000);
        // };
        document.head.appendChild(script);

        isScriptAdded.current = true;

        // Функция очистки при размонтировании компонента
        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);



    return (
        <div id="bx24_form_container" style={{ display: 'none' }}>
            {/* Виджет появится здесь после загрузки скрипта */}
        </div>
    );

}