import { ObjectsLandingPage } from "./objectsLanding/objectsLanding.tsx";
import { ArticlesLandingPage } from "./articlesLanding/articlesLanding.tsx";
import { BannerCertificateLanding } from "./banner1Landing/bannerLanding.tsx";
import { ExcursionLanding } from "./exLanding/ExLanding.tsx";
import { WhereGoLanding } from "./whereLanding/whereLanding.tsx";
import { BannerCityLanding } from "./bannerCity/bannerCityLanding.tsx";


export function LandingPage() {
    return (
        <div className="paperdiv">
            {/*  Баннер */}
            {/* Филльтры */}
            {/* Обьекты */}
            {/* <Paper>dd</Paper> */}
            {/* <BannerLanding></BannerLanding> */}
            {/* <ArticlesLandingPage/> */}
            <ObjectsLandingPage />
            {/* <DoubleDateRangePicker/> */}
            <h2 className="HeadingStyle2Main">Популярные экскурсии</h2>
            {/* <ExcursionLanding/> */}
            {/* <BannerCityLanding/> */}
            <h2 className="HeadingStyle2Main">Куда сходить в Санкт-Петербурге</h2>
            <WhereGoLanding></WhereGoLanding>
             <h2 className="HeadingStyle2Main">Полезные статьи</h2>
            {/* <ArticlesLandingPage/> */}
        </div>
    )
}
// <BannerCertificateLanding></BannerCertificateLanding>