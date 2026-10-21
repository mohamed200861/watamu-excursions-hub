import { headFor } from "@/lib/seo";
import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route=createFileRoute("/")({head:()=>headFor("it","Safari in Kenya ed escursioni a Watamu | Eco Tours","Safari nei parchi del Kenya ed escursioni a Watamu e Malindi con guida locale. Scrivi ad Africano su WhatsApp.","/it"),beforeLoad:()=>{throw redirect({to:"/$lang",params:{lang:"it"},statusCode:302})}});
