import { headFor } from "@/lib/seo";
import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route=createFileRoute("/")({head:()=>headFor("it","Safari ed escursioni in Kenya","ECO TOURS AND SAFARI'S: safari ed escursioni da Watamu e Malindi.","/"),beforeLoad:()=>{throw redirect({to:"/$lang",params:{lang:"it"},statusCode:302})}});
