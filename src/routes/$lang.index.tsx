import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/Site";
import { agencySchema, getLocale, headFor } from "@/lib/seo";
import { common } from "@/lib/site-data";
export const Route=createFileRoute("/$lang/")({head:({params})=>{const l=getLocale(params.lang);const faq=l==="it"?[["A che ora partono i safari?","Le partenze indicate sono alle 6:00."],["Cosa comprende il safari?",common.it.included.join(", ")]]:[["What time do safaris depart?","Listed departures are at 6:00."],["What does the safari include?",common.en.included.join(", ")]];return headFor(l,l==="it"?"Safari ed escursioni in Kenya":"Safaris and excursions in Kenya",l==="it"?"Safari ed escursioni autentiche in Kenya con guida locale in italiano, da Watamu e Malindi.":"Authentic Kenya safaris and excursions with a local Italian-speaking guide, from Watamu and Malindi.",`/${l}`,{"@context":"https://schema.org","@graph":[agencySchema,{"@type":"FAQPage",mainEntity:faq.map(([name,text])=>({"@type":"Question",name,acceptedAnswer:{"@type":"Answer",text}}))}]})},component:Page});
function Page(){const {lang}=Route.useParams();return <Home lang={getLocale(lang)}/>}
