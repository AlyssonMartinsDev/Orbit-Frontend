import { useCallback, useId, useState } from "react";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { inputClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { requireResponseData } from "../../../shared/types/api.types";
import { ClientService } from "../services/client.service";

export function ClientSelect({ value, onChange }: { value: number; onChange: (id: number) => void }) {
    const id = useId();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const query = useDebouncedValue(search);
    const load = useCallback(async (signal: AbortSignal) => requireResponseData(await ClientService.list({ page, page_size: 20, search: query }, signal)), [page, query]);
    const { data, error, isLoading, refresh } = useAsyncResource(`clients:${page}:${query}`, load);
    const loadSelected = useCallback(async (signal: AbortSignal) => value ? requireResponseData(await ClientService.getById(value, signal)) : null, [value]);
    const selected = useAsyncResource(`client:${value}`, loadSelected);
    const currentPage = data?.page ?? page;
    const pages = data?.total_pages ?? 1;
    const options = data?.items ?? [];
    const outsidePage = value > 0 && !options.some(client => client.id === value);
    return <div className="min-w-0 space-y-3">
        <label htmlFor={`${id}-search`} className="block text-sm text-[#a7b4c8]">Buscar cliente cadastrado</label>
        <input id={`${id}-search`} type="search" maxLength={255} className={inputClass} value={search}
            placeholder="Nome, telefone, e-mail ou CPF/CNPJ" onChange={event => { setSearch(event.target.value); setPage(1); }} />
        {error && <RequestError message={error} onRetry={refresh} />}
        {selected.error && <RequestError message={selected.error} onRetry={selected.refresh} />}
        <label htmlFor={id} className="block text-sm text-[#a7b4c8]">Cliente *</label>
        <select id={id} required className={inputClass} value={value || ""} disabled={isLoading}
            onChange={event => onChange(Number(event.target.value))}>
            <option value="">{isLoading ? "Carregando clientes…" : "Selecione um cliente"}</option>
            {outsidePage && <option value={value}>{selected.data?.name ?? `Cliente #${value}`} (selecionado)</option>}
            {options.map(client => <option key={client.id} value={client.id}>{client.name} — {client.phone}</option>)}
        </select>
        {!isLoading && data?.total === 0 && <p role="status" className="text-sm text-[#a7b4c8]">Nenhum cliente encontrado. Ajuste a busca ou cadastre um novo cliente.</p>}
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#a7b4c8]">
            <span>{data?.total ?? 0} {data?.total === 1 ? "cliente" : "clientes"} · Página {currentPage} de {pages}</span>
            <button type="button" className={secondaryButtonClass} disabled={isLoading || currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Página anterior de clientes">Anterior</button>
            <button type="button" className={secondaryButtonClass} disabled={isLoading || currentPage >= pages} onClick={() => setPage(currentPage + 1)} aria-label="Próxima página de clientes">Próxima</button>
            <button type="button" className="min-h-11 px-2 text-blue-300 underline disabled:opacity-50" disabled={isLoading} onClick={() => { refresh(); selected.refresh(); }}>Atualizar clientes</button>
        </div>
    </div>;
}
