import React from 'react';
import {createRoot} from 'react-dom/client';
import {Frame,Gallery} from './prototype';
import '../../app/globals.css';
import './review.css';
const query=new URLSearchParams(location.search);
if(query.get('text')==='200')document.documentElement.classList.add('f4-large-text');
createRoot(document.getElementById('root')!).render(query.has('frame')?<Frame/>:<Gallery/>);
