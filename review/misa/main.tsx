import React from 'react';
import {createRoot} from 'react-dom/client';
import {Mass} from '../../app/mass';
import '../../app/mass.css';
import './review.css';
createRoot(document.getElementById('root')!).render(<main><p className="review-banner">Alianza · Misa · Entorno de revisión sin cuentas ni datos personales</p><Mass/></main>);
