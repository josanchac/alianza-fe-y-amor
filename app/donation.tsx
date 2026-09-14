import { useState } from "react";
import { Heart, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export function Donation() {
  const [open, setOpen] = useState(false),
    [copied, setCopied] = useState("");
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied("Copiado");
    } catch {
      setCopied("Seleccioná el número para copiarlo.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><button className="donate-button" onClick={() => setOpen(true)}>
        <Heart size={18} />
        Donar
      </button></DialogTrigger>
        <DialogContent className="editor-dialog donation-dialog">
          <img className="dialog-emblem" src="./emblem.svg" alt="Alianza" />
          <DialogTitle>Un aporte libre para el Movimiento</DialogTitle>
          <DialogDescription>
            Alianza es gratuita. Tu donación es voluntaria y no habilita
            funciones adicionales.
          </DialogDescription>
          <p>
            Fundación Familia en Alianza de Costa Rica
            <br />
            Cédula jurídica: 3-006-372299
          </p>
          {[
            ["SINPE Móvil", "8400-0692"],
            ["IBAN · colones", "CR79010200009330790716"],
            ["IBAN · dólares", "CR47010200009330790225"],
          ].map(([label, value]) => (
            <div className="donation-account" key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
              <button
                className="soft-button"
                onClick={() => copy(value)}
                aria-label={"Copiar " + label}
              >
                <Copy size={16} />
                Copiar
              </button>
            </div>
          ))}
          <p role="status">{copied}</p>
          <ol>
            <li>Copiá el número o IBAN.</li>
            <li>
              Abrí tu aplicación bancaria y elegí SINPE Móvil o transferencia.
            </li>
            <li>
              Confirmá que el destinatario corresponde a la Fundación y revisá
              el monto antes de enviar.
            </li>
          </ol>
          <p className="form-hint">
            Datos publicados en el{" "}
            <a
              href="https://schoenstattcostarica.org/"
              target="_blank"
              rel="noreferrer"
            >
              sitio de Schoenstatt Costa Rica
            </a>
            , consultados en septiembre de 2026. La app no procesa ni confirma
            transferencias.
          </p>
        </DialogContent>
    </Dialog>
  );
}
