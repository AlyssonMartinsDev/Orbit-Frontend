import { useEffect, useRef, useState } from "react";
import { Building2, ImagePlus, Trash2, UserRound } from "lucide-react";
import { CanceledError } from "axios";
import { secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { getSession, isCurrentSession } from "../../../shared/services/session";
import { useSettingsMutation } from "../hooks/useSettingsMutation";
import { prepareSettingsImage } from "../services/image-upload";
import { SaveError } from "./SettingsField";

type Props = {
  kind: "logo" | "avatar";
  value: string | null;
  disabled?: boolean;
  upload: (dataUrl: string) => Promise<string | null>;
  remove: () => Promise<string | null>;
  onSaved: (value: string | null) => void;
};

export function SettingsImageUpload({ kind, value, disabled, upload, remove, onSaved }: Props) {
  const { busy, error, run } = useSettingsMutation();
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const [sessionId] = useState(() => getSession().id);
  const [status, setStatus] = useState<string | null>(null);
  const [broken, setBroken] = useState<string | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const logo = kind === "logo";
  const label = logo ? "logo" : "foto de perfil";
  const saved = (image: string | null) => {
    if (!mounted.current) return;
    onSaved(image); setBroken(null);
    setStatus(image ? (logo ? "Logo salva. Ela será incluída nas próximas exportações de PDF." : "Foto de perfil salva.") : (logo ? "Logo removida." : "Foto de perfil removida."));
  };
  const Fallback = logo ? Building2 : UserRound;
  return <div className="min-w-0 space-y-3 sm:col-span-2" aria-busy={busy}>
    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
      <div className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-[#24436b] bg-[#12243b] ${logo ? "rounded-xl" : "rounded-full"}`}>
        {value && broken !== value ? <img src={value} onError={() => setBroken(value)} alt={logo ? "Logo da organização" : "Foto de perfil"} className={`h-full w-full ${logo ? "object-contain p-2" : "object-cover"}`} /> : <Fallback size={36} className="text-slate-400" />}
      </div>
      <div className="min-w-0 space-y-3">
        <p className="text-sm leading-6 text-slate-400">PNG, JPEG ou WebP, até 10 MB. A imagem é reduzida e salva automaticamente ao selecionar.</p>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" aria-label={`Selecionar ${label}`} className="hidden" disabled={disabled || busy} onChange={event => {
          const file = event.target.files?.[0]; event.target.value = "";
          if (!file) return;
          setStatus(null);
          void run(async () => {
            const dataUrl = await prepareSettingsImage(file);
            if (!mounted.current || !isCurrentSession(sessionId)) throw new CanceledError();
            return upload(dataUrl);
          }, saved);
        }} />
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={disabled || busy} className={secondaryButtonClass} onClick={() => input.current?.click()}><ImagePlus size={18} />{busy ? "Salvando imagem…" : `${value ? "Trocar" : "Enviar"} ${label}`}</button>
          {value && <button type="button" disabled={disabled || busy} className={secondaryButtonClass} onClick={() => { setStatus(null); void run(remove, saved); }}><Trash2 size={18} />Remover {label}</button>}
        </div>
      </div>
    </div>
    {broken === value && value && <p role="alert" className="text-sm text-amber-200">Não foi possível exibir a imagem salva. Envie o arquivo novamente.</p>}
    <SaveError message={error} />
    {status && <p role="status" className="text-sm text-emerald-300">{status}</p>}
  </div>;
}
