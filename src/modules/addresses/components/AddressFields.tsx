import { useCallback, useEffect, useId, useRef, useState } from "react";
import axios from "axios";
import { FormSection, inputClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { getSession, isCurrentSession } from "../../../shared/services/session";
import { AddressService } from "../services/address.service";
import { formatPostalCode, type AddressDraft, type City } from "../types/address.types";

export function AddressFields({ value, onChange, disabled = false, onBusyChange }: { value: AddressDraft; onChange: (value: AddressDraft) => void; disabled?: boolean; onBusyChange: (busy: boolean) => void }) {
    const id = useId();
    const [hadAddress] = useState(value.enabled);
    const valueRef = useRef(value);
    const changeRef = useRef(onChange);
    useEffect(() => { valueRef.current = value; changeRef.current = onChange; }, [value, onChange]);
    const { data: states, isLoading: statesLoading, error: statesError, refresh: refreshStates } = useAsyncResource("address-states", AddressService.states);
    const loadCities = useCallback((signal: AbortSignal) => value.state_id ? AddressService.cities(value.state_id, signal) : Promise.resolve([] as City[]), [value.state_id]);
    const { data: cities, isLoading: citiesLoading, error: citiesError, refresh: refreshCities } = useAsyncResource(`address-cities:${value.state_id}`, loadCities);
    const [attempt, setAttempt] = useState(0);
    const [lookup, setLookupState] = useState<{ busy: boolean; message: string; error: boolean }>({ busy: false, message: "", error: false });
    const busyRef = useRef(onBusyChange);
    useEffect(() => { busyRef.current = onBusyChange; }, [onBusyChange]);
    const setLookup = (next: { busy: boolean; message: string; error: boolean }) => { setLookupState(next); busyRef.current(next.busy); };
    const lastLookup = useRef(value.enabled && value.zip_code.length === 8 ? `${value.zip_code}:0` : "");
    const locationRevision = useRef(0);
    const requestRevision = useRef(0);

    const update = (next: AddressDraft, locationChanged = true) => {
        if (locationChanged) locationRevision.current++;
        valueRef.current = next;
        onChange(next);
    };
    useEffect(() => {
        const zip = value.zip_code;
        const key = `${zip}:${attempt}`;
        if (disabled || !value.enabled || !/^[0-9]{8}$/.test(zip) || lastLookup.current === key) return;
        const controller = new AbortController();
        const sessionId = getSession().id;
        const revision = ++requestRevision.current;
        const isCurrentRequest = () => requestRevision.current === revision;
        const locationAtStart = locationRevision.current;
        let settled = false;
        const timer = setTimeout(() => {
            lastLookup.current = key;
            setLookup({ busy: true, message: "Buscando endereço pelo CEP…", error: false });
            void AddressService.lookup(zip, controller.signal).then(result => {
                if (controller.signal.aborted || revision !== requestRevision.current || !isCurrentSession(sessionId) || valueRef.current.zip_code !== zip || !valueRef.current.enabled) return;
                settled = true;
                if (locationAtStart !== locationRevision.current) {
                    setLookup({ busy: false, message: "Você alterou o endereço durante a consulta. Seus dados foram mantidos; use Buscar CEP para consultar novamente.", error: false });
                    return;
                }
                const next = { ...valueRef.current, street: result.street, neighborhood: result.neighborhood, city: result.city, state_id: result.city.state.id };
                valueRef.current = next;
                changeRef.current(next);
                setLookup({ busy: false, message: "Endereço encontrado. Confira os dados e informe o número e o complemento.", error: false });
            }).catch((error: unknown) => {
                if (controller.signal.aborted || revision !== requestRevision.current || !isCurrentSession(sessionId) || axios.isCancel(error)) return;
                settled = true;
                setLookup({ busy: false, message: error instanceof Error ? error.message : "Não foi possível consultar o CEP. Preencha o endereço manualmente.", error: true });
            });
        }, 450);
        return () => {
            clearTimeout(timer);
            controller.abort();
            if (isCurrentRequest()) {
                if (!settled) lastLookup.current = "";
                busyRef.current(false);
                setLookupState(current => current.busy ? { ...current, busy: false } : current);
            }
        };
    }, [value.zip_code, value.enabled, disabled, attempt]);

    const cityOptions = cities && !citiesLoading ? cities : value.city && value.city.state.id === value.state_id ? [value.city] : [];
    return <FormSection title="Endereço" description="Opcional. Digite o CEP para buscar ou selecione a UF e a cidade e preencha manualmente.">
        <div className="sm:col-span-2">
            <label className="inline-flex min-h-11 items-center gap-3 text-sm text-[#a7b4c8]">
                <input type="checkbox" disabled={disabled} checked={value.enabled} onChange={event => { requestRevision.current++; lastLookup.current = ""; const willLookup = event.target.checked && value.zip_code.length === 8; setLookup({ busy: willLookup, message: willLookup ? "Buscando endereço pelo CEP…" : "", error: false }); update({ ...value, enabled: event.target.checked }); }} className="h-5 w-5 accent-blue-500" />
                Cadastrar endereço
            </label>
            {!value.enabled && <p className="mt-1 text-xs leading-5 text-[#8290a8]">{hadAddress ? "Ao salvar, o endereço anterior será removido." : "Você também pode cadastrar o endereço depois."}</p>}
        </div>
        {value.enabled && <>
            <div className="sm:col-span-2">
                <label htmlFor={`${id}-zip`} className="mb-2 block text-sm text-[#a7b4c8]">CEP</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input id={`${id}-zip`} disabled={disabled} className={`${inputClass} min-w-0 sm:flex-1`} value={formatPostalCode(value.zip_code)} inputMode="numeric" maxLength={9} pattern="[0-9]{5}-?[0-9]{3}" title="Informe os 8 dígitos do CEP ou deixe-o em branco." autoComplete="postal-code" placeholder="00000-000" onChange={event => { const zip = event.target.value.replace(/\D/g, "").slice(0, 8); if (zip === value.zip_code) return; requestRevision.current++; lastLookup.current = ""; setLookup({ busy: zip.length === 8, message: zip.length === 8 ? "Buscando endereço pelo CEP…" : "", error: false }); update({ ...value, zip_code: zip }); }} />
                    <button type="button" className={secondaryButtonClass} disabled={disabled || value.zip_code.length !== 8 || lookup.busy} onClick={() => { setLookup({ busy: true, message: "Buscando endereço pelo CEP…", error: false }); setAttempt(current => current + 1); }}>Buscar CEP</button>
                </div>
                {lookup.message && <p role={lookup.error ? "alert" : "status"} className={`mt-2 text-sm leading-6 ${lookup.error ? "text-amber-200" : "text-blue-200"}`}>{lookup.message}</p>}
            </div>
            {statesError && <div className="sm:col-span-2"><RequestError message={statesError} onRetry={refreshStates} /></div>}
            <div>
                <label htmlFor={`${id}-state`} className="mb-2 block text-sm text-[#a7b4c8]">UF *</label>
                <select id={`${id}-state`} required disabled={disabled || statesLoading} className={inputClass} value={value.state_id ?? ""} autoComplete="address-level1" onChange={event => update({ ...value, state_id: Number(event.target.value) || null, city: null })}>
                    <option value="">{statesLoading ? "Carregando UFs…" : "Selecione a UF"}</option>
                    {(states ?? (value.city ? [value.city.state] : [])).map(state => <option key={state.id} value={state.id}>{state.code} — {state.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor={`${id}-city`} className="mb-2 block text-sm text-[#a7b4c8]">Cidade *</label>
                <select id={`${id}-city`} required disabled={disabled || !value.state_id || citiesLoading} className={inputClass} value={value.city?.id ?? ""} autoComplete="address-level2" onChange={event => update({ ...value, city: cityOptions.find(city => city.id === Number(event.target.value)) ?? null })}>
                    <option value="">{citiesLoading ? "Carregando cidades…" : "Selecione a cidade"}</option>
                    {cityOptions.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
                {citiesError && <RequestError message={citiesError} onRetry={refreshCities} />}
            </div>
            <div className="sm:col-span-2"><label htmlFor={`${id}-street`} className="mb-2 block text-sm text-[#a7b4c8]">Logradouro *</label><input id={`${id}-street`} required disabled={disabled} maxLength={255} autoComplete="address-line1" className={inputClass} value={value.street} placeholder="Rua, avenida, estrada…" onChange={event => update({ ...value, street: event.target.value })} /></div>
            <div><label htmlFor={`${id}-number`} className="mb-2 block text-sm text-[#a7b4c8]">Número</label><input id={`${id}-number`} disabled={disabled} maxLength={30} className={inputClass} value={value.number} placeholder="Ex.: 120 ou S/N" onChange={event => update({ ...value, number: event.target.value }, false)} /></div>
            <div><label htmlFor={`${id}-district`} className="mb-2 block text-sm text-[#a7b4c8]">Bairro</label><input id={`${id}-district`} disabled={disabled} maxLength={100} className={inputClass} value={value.neighborhood} onChange={event => update({ ...value, neighborhood: event.target.value })} /></div>
            <div className="sm:col-span-2"><label htmlFor={`${id}-complement`} className="mb-2 block text-sm text-[#a7b4c8]">Complemento</label><input id={`${id}-complement`} disabled={disabled} maxLength={150} autoComplete="address-line2" className={inputClass} value={value.complement} placeholder="Apartamento, sala, bloco, referência…" onChange={event => update({ ...value, complement: event.target.value }, false)} /></div>
        </>}
    </FormSection>;
}
