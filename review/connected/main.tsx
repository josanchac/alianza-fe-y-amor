// Separate entry; the production entry and configuration stay untouched.
const banner=document.createElement('aside');
banner.textContent='PRUEBA CONECTADA · Solo cuentas y datos ficticios';
banner.setAttribute('aria-label','Entorno de prueba');
banner.style.cssText='padding:10px 16px;background:#fff6df;color:#594519;text-align:center;font:600 14px/1.5 system-ui';
document.body.prepend(banner);
void import('../../github/main');
