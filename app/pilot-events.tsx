import {createContext,useContext} from 'react';
export type PilotEvent='view_day'|'view_week'|'view_month'|'view_review'|'view_history'|'view_prayer'|'view_groups'|'view_personal'|'view_couple';
export const PilotEvents=createContext<(event:PilotEvent)=>void>(()=>{});
export const usePilotEvent=()=>useContext(PilotEvents);
