import {dom} from './dom.mjs';
import React from 'react';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import assert from 'node:assert/strict';
import {AppUpdateNotice,updateAddress} from '../github/app-update.tsx';
const old='a'.repeat(32),latest='b'.repeat(32);let remote=old,fail=false;const navigations=[],requests=[];
globalThis.fetch=async(url,options)=>{requests.push({url,options});if(fail)throw Error('offline');return Response.json({buildId:remote});};
try{
 render(React.createElement(React.Fragment,null,React.createElement(AppUpdateNotice,{currentBuild:old,navigate:url=>navigations.push(url)}),React.createElement('textarea',{'aria-label':'Borrador',defaultValue:'Conservar'})));
 await waitFor(()=>assert.equal(requests.length,1));assert.equal(screen.queryByRole('status'),null);
 remote=latest;fireEvent(document,new Event('visibilitychange'));await screen.findByText('Hay una actualización de Alianza');
 assert.equal(navigations.length,0);assert.equal(screen.getByRole('textbox').value,'Conservar');
 assert(requests.every(r=>r.options.cache==='no-store'&&new URL(r.url).searchParams.has('check')));
 fail=true;fireEvent(window,new Event('pageshow'));assert.equal(screen.getByRole('textbox').value,'Conservar');
 fireEvent.click(screen.getByRole('button',{name:'Actualizar Alianza'}));assert.equal(new URL(navigations[0]).searchParams.get('actualizar'),latest);
 const address=new URL(updateAddress('https://example.test/app/?guia=instalar#grupo=code',latest));
 assert.equal(address.pathname,'/app/');assert.equal(address.searchParams.get('guia'),'instalar');assert.equal(address.hash,'#grupo=code');
 console.log('PASS deployment identity: same-version updates detected on resume, cache-busting reload only on user action, drafts and URL preserved');
}finally{cleanup();dom.window.close();}
