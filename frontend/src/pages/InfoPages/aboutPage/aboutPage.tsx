
import LogoSVG from "../../../icons/logo.svg?react"
import styles from "./aboutPage.module.css";



export function AboutPage() {
    return (
        <div className="paperdiv">
           <div className="paperdiv" style={{display: "flex", justifyContent:"center"}}>
            <LogoSVG width="415" height="340"></LogoSVG>
            </div>
            <div className="paperdiv" style={{display: "flex", justifyContent:"center", textAlign:"center"}}>
            <h3 className="HeadingStyle3" style={{paddingTop: 0}}>Наши гости — наша главная ценность, и мы предлагаем Вам ощутить гостеприимство сети Sutki Rent в его лучшем проявлении. </h3>
            </div>
            <div className="papercard" style={{marginTop: "50px"}}>
               <p>
                    Мы — ваш надежный партнер в мире современной аренды. Для владельцев мы становимся профессиональной командой, которая круглосуточно заботится о вашей недвижимости, максимизируя ее доходность. Для гостей — мы те, кто создает уют во время ваших поездок. Доверяя нам, вы получаете комфорт и свободу от хлопот.
                    <br/>
                    <br/>✓ Более 100 объектов в управлении
                    <br/>✓ Более 15 лет на рынке посуточной аренды
                    <br/>✓ Свыше 100000 довольных клиентов
                    <br/>✓ 4 региона присутствия
                    <br/>✓ 50+ собственников, которые доверили нам свою недвижимость
                    <br/>
                    <br/>Комфортное жилье любого класса посуточно и на длительный срок от центра до окраин Санкт-Петербурга, а также в других регионах России.
                    <br/>
                    <br/>Стань частью истории Sutki Rent!
                </p>
            </div>
    
        </div>
    )
}