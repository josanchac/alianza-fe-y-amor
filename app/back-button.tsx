import type {ButtonHTMLAttributes} from 'react';
import {ArrowLeft} from 'lucide-react';


type BackButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  label: string;
};

/** Navigation only: the caller owns destination, draft preservation and scroll restoration. */
export function BackButton({label,className='',type='button',...props}: BackButtonProps) {
  return <button {...props} type={type} className={`app-back-button ${className}`.trim()} aria-label={label}>
    <ArrowLeft size={21} aria-hidden="true"/>
  </button>;
}
