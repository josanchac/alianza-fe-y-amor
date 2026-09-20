import React from 'react';
import {createRoot} from 'react-dom/client';
import {ReviewGallery} from './gallery';
import '../../app/mass.css';
import './review.css';
createRoot(document.getElementById('integral-review-mount')!).render(<ReviewGallery/>);
