import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
globalThis.FormData=dom.window.FormData;
const React=await import('react');
const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');
const {CreateRosary}=await import('../app/community.tsx');
const {mysteriesFor,MYSTERIES}=await import('../lib/community.ts');
const {localDate}=await import('../lib/domain.ts');
for(const [date,expected] of [['2026-09-13','glorious'],['2026-09-14','joyful'],['2026-09-15','sorrowful'],['2026-09-16','glorious'],['2026-09-17','luminous'],['2026-09-18','sorrowful'],['2026-09-19','joyful']])assert.equal(mysteriesFor(date),expected);
for(const mode of ['personal','couple','group']){
 const calls=[];const act=async p=>{calls.push(p);return {groups:[],rosaries:[]};};
 render(React.createElement(CreateRosary,{act,busy:false,coupleId:mode==='couple'?'pair':undefined,groupId:mode==='group'?'group':undefined}));
 const chosen=screen.getByRole('combobox',{name:'Misterios'});const suggested=mysteriesFor(localDate());assert.equal(chosen.value,suggested);assert(screen.getByText(/Sugeridos para hoy/));assert.equal(calls.length,0);
 if(mode==='couple')fireEvent.change(screen.getByRole('combobox',{name:'¿Con quién?'}),{target:{value:'couple'}});
 const alternate=Object.keys(MYSTERIES).find(k=>k!==suggested);fireEvent.change(chosen,{target:{value:alternate}});
 fireEvent.click(screen.getByRole('button',{name:'Comenzar el rosario'}));await waitFor(()=>assert.equal(calls.length,1));assert.equal(calls[0].mystery,alternate);assert.equal(calls[0].scope,mode);cleanup();
}
console.log('PASS day suggestions: all seven days, no automatic writes, manual choice respected for personal, couple and group prayer');
dom.window.close();
