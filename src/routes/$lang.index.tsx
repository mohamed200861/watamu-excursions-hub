import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/Site";
import { agencySchema, getLocale, headFor } from "@/lib/seo";
export const Route=createFileRoute("/$lang/")({head:({params})=>{const l=getLocale(params.lang);return headFor(l,l==="it"?"Safari ed escursioni in Kenya":"Safaris and excursions in Kenya",l==="it"?"Safari ed escursioni autentiche in Kenya con guida locale in italiano, da Watamu e Malindi.":"Authentic Kenya safaris and excursions with a local Italian-speaking guide, from Watamu and Malindi.",`/${l}`,agencySchema)},component:Page});
function Page(){const {lang}=Route.useParams();return <Home lang={getLocale(lang)}/>}
