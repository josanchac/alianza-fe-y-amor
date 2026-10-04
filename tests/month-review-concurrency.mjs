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
