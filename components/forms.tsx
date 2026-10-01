"use client";

import { useState } from "react";
import { chipClass, inputClass, primaryButton } from "./ui";

/**
 * Formularios de captación. Aún no hay backend: validan en el navegador y
 * muestran la confirmación inline. El punto de integración es `onSubmit`.
 */
function useSubmitted() {
  const [done, setDone] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };
  return { done, onSubmit };
}

function Confirmation({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p role="status" className={`text-sm leading-[1.4] font-medium ${className}`}>
      {children}
    </p>
  );
}

const CITIES = ["Barcelona", "Málaga", "Valencia", "Sevilla", "Las Palmas", "Alicante"];

export function CitiesForm() {
  const { done, onSubmit } = useSubmitted();
  if (done) return <Confirmation>Anotado. Te escribiremos cuando empecemos a observar tu ciudad.</Confirmation>;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 md:max-w-md">
      <label className="sr-only" htmlFor="ciudad">
        Ciudad
      </label>
      <select id="ciudad" name="ciudad" className={inputClass}>
        {CITIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <label className="sr-only" htmlFor="ciudad-email">
        Email
      </label>
      <input id="ciudad-email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" className={inputClass} />
      <button type="submit" className={`${primaryButton} h-12`}>
        Avísame cuando llegue a mi ciudad
      </button>
    </form>
  );
}

const INTENTS = ["Sí", "No", "Estoy valorándolo"];

export function OwnerReportForm({ district }: { district: string }) {
  const { done, onSubmit } = useSubmitted();
  const [intent, setIntent] = useState("");
  if (done) return <Confirmation>Listo. El informe de {district} llegará a tu email.</Confirmation>;
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2.5 md:max-w-md">
      <label className="sr-only" htmlFor="owner-email">
        Email
      </label>
      <input id="owner-email" name="email" type="email" required autoComplete="email" placeholder="Email" className={`${inputClass} bg-bg`} />
      <fieldset>
        <legend className="mb-2.5 text-[13px]">¿Piensas vender en los próximos 12 meses?</legend>
        <div className="flex flex-wrap gap-1.5">
          {INTENTS.map((o) => (
            <button key={o} type="button" aria-pressed={intent === o} onClick={() => setIntent(o)} className={`${chipClass(intent === o)} h-10 px-3.5`}>
              {o}
            </button>
          ))}
        </div>
      </fieldset>
      <input type="hidden" name="intencion" value={intent} />
      <button type="submit" className={primaryButton}>
        Recibir informe
      </button>
    </form>
  );
}

const panelInput = "h-[46px] w-full border border-[rgba(246,246,245,.3)] bg-transparent px-3 text-[15px] text-panel-ink placeholder:text-panel-mut";

export function PilotForm() {
  const { done, onSubmit } = useSubmitted();
  if (done) return <Confirmation className="font-normal">Solicitud recibida. Te contactaremos para activar el piloto.</Confirmation>;
  const fields = [
    { name: "nombre", label: "Nombre", type: "text", autoComplete: "name" },
    { name: "empresa", label: "Empresa", type: "text", autoComplete: "organization" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "distritos", label: "Distritos de interés", type: "text", autoComplete: "off" },
  ];
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 md:max-w-md">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="sr-only" htmlFor={`piloto-${f.name}`}>
            {f.label}
          </label>
          <input id={`piloto-${f.name}`} name={f.name} type={f.type} required autoComplete={f.autoComplete} placeholder={f.label} className={panelInput} />
        </div>
      ))}
      <button type="submit" className="h-[50px] bg-panel-ink text-[15px] font-medium text-[#0c0c0d]">
        Solicitar piloto
      </button>
    </form>
  );
}
