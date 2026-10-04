import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
import React from 'react';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {MonthReview} from '../app/month-review.tsx';
import {readMonthlyReview,writeMonthlyReview} from '../lib/monthly-review.ts';

const row=(version,text='Propósito sintético',review='')=>({owner:'synthetic',kind:'purpose',key:'2026-09',version,data:{text,review}});
const props={month:'2026-09',today:'2026-10-04',onMonth(){},edit(){},explore(){}};
const answer=()=>screen.getByRole('textbox',{name:'¿Qué me ayudó?'});
try {
  let saved;
  const onSave=async(data,version)=>{saved={data,version};return true;};
  // Editing the purpose on this phone updates the same record, not the review.
  const view=render(React.createElement(MonthReview,{...props,own:[row(1)],onSave}));
  fireEvent.change(answer(),{target:{value:'Borrador sin perder'}});
  view.rerender(React.createElement(MonthReview,{...props,own:[row(2,'Propósito editado')],onSave}));
  assert.equal(answer().value,'Borrador sin perder');
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await waitFor(()=>assert(saved));
  assert.equal(saved.version,2,'Purpose-only update must not leave the review version stale');
  assert.equal(saved.data.text,'Propósito editado');
  assert.equal(readMonthlyReview(saved.data.review).answers[0],'Borrador sin perder');
  cleanup();

  // A pristine form follows a newly received review rather than overwriting it.
  const fresh=render(React.createElement(MonthReview,{...props,own:[row(1)],onSave}));
  fresh.rerender(React.createElement(MonthReview,{...props,own:[row(2,'Propósito',writeMonthlyReview(['Revisión recibida','','']))],onSave}));
  await waitFor(()=>assert.equal(answer().value,'Revisión recibida'));
  cleanup();

  // A genuinely competing review must retain both optimistic concurrency and draft.
  saved=undefined;
  const conflicting=render(React.createElement(MonthReview,{...props,own:[row(1)],onSave:async(data,version)=>{saved={data,version};return false;}}));
  fireEvent.change(answer(),{target:{value:'Mi borrador'}});
  conflicting.rerender(React.createElement(MonthReview,{...props,own:[row(2,'Propósito',writeMonthlyReview(['Cambio remoto','','']))],onSave:async(data,version)=>{saved={data,version};return false;}}));
  assert.equal(answer().value,'Mi borrador');
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await waitFor(()=>assert(saved));
  assert.equal(saved.version,1,'Do not rebase an independently modified review');
  assert.equal(answer().value,'Mi borrador');
  assert.equal(screen.queryByText('Revisión guardada'),null);
  cleanup();

  // Navigation restores the draft AND its original conflict version, by month.
  const drafts=new Map();
  const leaving=render(React.createElement(MonthReview,{...props,drafts,own:[row(1)],onSave}));
  fireEvent.change(answer(),{target:{value:'Borrador al navegar'}});
  leaving.unmount();
  const another=render(React.createElement(MonthReview,{...props,month:'2026-08',drafts,own:[],onSave}));
  assert.equal(answer().value,'','Months must not share draft text');
  another.unmount();
  saved=undefined;
  render(React.createElement(MonthReview,{...props,drafts,own:[row(2,'Propósito',writeMonthlyReview(['Cambio remoto','','']))],onSave:async(data,version)=>{saved={data,version};return false;}}));
  assert.equal(answer().value,'Borrador al navegar');
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await waitFor(()=>assert(saved));
  assert.equal(saved.version,1,'Remount must not silently adopt a conflicting version');
  assert.equal(drafts.size,1,'A rejected save retains the draft');
  cleanup();

  // A late success only clears the submitted text, not new typing during the request.
  const pendingDrafts=new Map();let finish;
  render(React.createElement(MonthReview,{...props,drafts:pendingDrafts,own:[row(1)],onSave:()=>new Promise(resolve=>{finish=resolve;})}));
  fireEvent.change(answer(),{target:{value:'Texto enviado'}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  fireEvent.change(answer(),{target:{value:'Texto más reciente'}});
  finish(true);
  await waitFor(()=>assert.equal(pendingDrafts.get(props.month)?.version,2));
  assert.equal(pendingDrafts.get(props.month).answers[0],'Texto más reciente');
  cleanup();
  render(React.createElement(MonthReview,{...props,drafts:pendingDrafts,own:[row(2,'Propósito',writeMonthlyReview(['Texto enviado','','']))],onSave}));
  assert.equal(answer().value,'Texto más reciente');
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await waitFor(()=>assert.equal(pendingDrafts.size,0,'Confirmed unchanged text clears the draft'));
  cleanup();

  // Leaving and returning while a save is pending must share its acknowledgement.
  const movingDrafts=new Map();let complete;
  const inFlight=render(React.createElement(MonthReview,{...props,drafts:movingDrafts,own:[row(1)],onSave:()=>new Promise(resolve=>{complete=resolve;})}));
  fireEvent.change(answer(),{target:{value:'Enviado antes de salir'}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  inFlight.unmount();
  saved=undefined;
  render(React.createElement(MonthReview,{...props,drafts:movingDrafts,own:[row(1)],onSave}));
  fireEvent.change(answer(),{target:{value:'Editado después de volver'}});
  complete(true);
  await waitFor(()=>assert.equal(movingDrafts.get(props.month)?.version,2));
  assert.equal(movingDrafts.get(props.month).answers[0],'Editado después de volver');
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await waitFor(()=>assert(saved));
  assert.equal(saved.version,2,'A late acknowledgement advances the returned form too');
  assert.equal(readMonthlyReview(saved.data.review).answers[0],'Editado después de volver');
  cleanup();

  // A record created while the review is open is safe only if its review is unchanged.
  saved=undefined;
  const empty=render(React.createElement(MonthReview,{...props,own:[],onSave}));
  fireEvent.change(answer(),{target:{value:'Primera reflexión'}});
  empty.rerender(React.createElement(MonthReview,{...props,own:[row(1)],onSave}));
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await waitFor(()=>assert(saved));assert.equal(saved.version,1);
  cleanup();

  // The parent can deliver the saved record before resolving its callback.
  // Empty/pristine saves must not advance the version twice in that ordering.
  const versions=[];
  let rejectSave=true;
  function Parent(){
    const [own,setOwn]=React.useState([row(1)]);
    return React.createElement(MonthReview,{...props,own,onSave:async(data,version)=>{
      versions.push(version);
      if(rejectSave)return false;
      setOwn([{...row(version+1),data}]);
      await new Promise(resolve=>setTimeout(resolve,10));
      return true;
    }});
  }
  render(React.createElement(Parent));
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await waitFor(()=>assert.equal(screen.getByRole('button',{name:'Guardar revisión'}).disabled,false));
  rejectSave=false;
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await screen.findByText('Revisión guardada');
  fireEvent.change(answer(),{target:{value:'Segundo guardado'}});
  fireEvent.click(screen.getByRole('button',{name:'Guardar revisión'}));
  await screen.findByText('Revisión guardada');
  assert.deepEqual(versions,[1,1,2]);
  assert.equal(answer().value,'Segundo guardado');
  console.log('PASS month review: same-phone purpose edit, pristine refresh, conflict/draft preservation, new purpose, failed retry and successive saves');
} finally {cleanup();dom.window.close();}
