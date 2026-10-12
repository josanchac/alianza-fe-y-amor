import type {ButtonHTMLAttributes} from 'react';
import {ChevronLeft} from 'lucide-react';
import type {Ref} from 'react';


type BackButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  label: string;
  ref?: Ref<HTMLButtonElement>;
};

/** Navigation only: the caller owns destination, draft preservation and scroll restoration. */
export function BackButton({label,className='',type='button',...props}: BackButtonProps) {
  return <button {...props} type={type} className={`app-back-button ${className}`.trim()} aria-label={label}>
    <ChevronLeft size={21} aria-hidden="true"/><span>Volver</span>
  </button>;
}
