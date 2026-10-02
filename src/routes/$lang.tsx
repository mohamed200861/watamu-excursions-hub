import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
export const Route=createFileRoute("/$lang")({beforeLoad:({params})=>{if(params.lang!=="it"&&params.lang!=="en")throw notFound()},component:()=> <Outlet/>});
