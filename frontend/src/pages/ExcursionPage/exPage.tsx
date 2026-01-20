
// import styles from './articlesPage.module.css';
import docUrl from '../../assets/exDoc.html?url'; // Получить URL файла
import { Paper } from "@mantine/core";

export function ExPage() {

//     const html = `
//   <!DOCTYPE html>
//   <html>
//       <body>
//     <div id="ap-showcase3"></div>

//     <script src="https://lk.excurr.ru/js/showcase3.js"></script>

//     <script id="ap-showcase-config" type="application/json">
//         {
//             "partner": 61,
//             "excursions": [2,3,4,5,12,14,32,33,34,42,45,48,49,58,61,64,65,74,94,126,127,139,140,141,145,147,148,149,157,159,165,166,191,201,202,203,204,205,206,207,230,240,241,242,244,274,283,296,368,384,385,403,404,405,406,407,418,419,420,421,422,423,425,426]
//         }
//     </script>
// </body>
//   </html>
// `;

//     const blob = new Blob([html], { type: 'text/html' });
//     const iframeUrl = URL.createObjectURL(blob);


    // const blob = new Blob([html], { type: 'text/html' });
    // const url = URL.createObjectURL(blob);


    return (
        <div className="paperdiv">

            <Paper shadow="sm" p={"md"} mt={"sm"} radius={20}>
                <h2 className="HeadingStyle2">Экскурсии</h2>

                <iframe
                    // height={"1000"}
                    src={docUrl}
                    sandbox="allow-scripts allow-same-origin"
                    // title="Embedded HTML"
                    style={{ width: '100%', height: '100vh', border: 'none' }}
                />


            </Paper>
        </div>
    )


}
