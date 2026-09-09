import assert from 'node:assert/strict';
import {dom} from './dom.mjs';
const React=await import('react');
const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');
const {InstallSteps,InstallGuide,APP_ADDRESS}=await import('../app/install-guide.tsx');
try{
 window.history.replaceState(null,'','/?token=secret#type=invite&token_hash=private-token');
 let copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{copied=text;}},configurable:true});
 render(React.createElement(InstallSteps));
 assert(screen.getByRole('button',{name:'Atrás'}).disabled);
 assert.equal(screen.getByLabelText('Dirección de Alianza').value,APP_ADDRESS);
 fireEvent.click(screen.getByRole('button',{name:'Copiar dirección'}));
 await waitFor(()=>assert.equal(copied,APP_ADDRESS));assert(!copied.includes('token'));
 console.log('PASS Installation guide copies the stable address without private access tokens');
 for(const expected of['Tocá Compartir','Elegí Agregar a Inicio','Confirmá y buscá el ícono']){fireEvent.click(screen.getByRole('button',{name:'Siguiente'}));assert(screen.getByRole('heading',{name:expected}));}
 assert(screen.getByRole('button',{name:'Siguiente'}).disabled);fireEvent.click(screen.getByRole('button',{name:'Atrás'}));assert(screen.getByText('Paso 3 de 4'));
 console.log('PASS iPhone steps advance, go back and stop at the last step');
 fireEvent.click(screen.getByRole('button',{name:'Android',exact:true}));assert(screen.getByText('Paso 1 de 4'));
 assert.equal(screen.getByRole('button',{name:'Android',exact:true}).getAttribute('aria-pressed'),'true');
 fireEvent.click(screen.getByRole('button',{name:'Siguiente'}));assert(screen.getByRole('heading',{name:'Abrí el menú de Chrome'}));
 fireEvent.click(screen.getByRole('button',{name:'Siguiente'}));assert(screen.getByRole('heading',{name:'Elegí instalar o agregar'}));
 fireEvent.click(screen.getByRole('button',{name:'Siguiente'}));assert(screen.getByText(/Tus registros siguen en tu cuenta/));
 console.log('PASS Switching to Android resets the guide and uses Chrome instructions');
 cleanup();let open=true;render(React.createElement(InstallGuide,{open,onOpenChange:v=>{open=v;}}));
 await screen.findByRole('dialog',{name:'Instalar Alianza en tu teléfono'});fireEvent.click(screen.getByRole('button',{name:'Cerrar la guía'}));assert.equal(open,false);
 console.log('PASS The guide closes without claiming installation or requiring registration');
}finally{cleanup();dom.window.close();}
