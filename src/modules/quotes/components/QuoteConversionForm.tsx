import { useId, useState } from "react";
import { CustomFieldInput } from "../../custom-fields/components/CustomFieldInput";
import { useDocumentFields } from "../../custom-fields/hooks/useDocumentFields";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { primaryButtonClass, secondaryButtonClass } from "../../../shared/components/form/FormSection";
import { SaveError } from "../../settings/components/SettingsField";
import { useSettingsMutation } from "../../settings/hooks/useSettingsMutation";
import { QuoteService, type Quote } from "../services/quote.service";

export function QuoteConversionForm({ quote, onSaved, onCancel }: { quote: Quote; onSaved: (quote: Quote) => void; onCancel: () => void }) {
    const id = useId();
    const { data: fields, isLoading, error: fieldsError, refresh } = useDocumentFields("WORK_ORDER");
    const [values, setValues] = useState<Record<number, string>>(() => Object.fromEntries(
        quote.custom_values.map(item => [item.field_definition_id, item.value ?? ""]),
    ));
    const { busy, error, run } = useSettingsMutation();
    return <form aria-label="Gerar ordem de serviço do orçamento" className="space-y-4 rounded-xl border border-blue-400/30 p-4" onSubmit={event => {
        event.preventDefault();
        if (!fields || isLoading || fieldsError) return;
        const customValues = fields.map(field => ({ field_definition_id: field.id, value: values[field.id]?.trim() || null }));
        void run(() => QuoteService.convert(quote.id, quote.version, customValues), onSaved);
    }}>
        <p className="text-sm leading-6 text-[#a7b4c8]">A OS receberá o cliente, o serviço, o valor e os campos compartilhados. Confira os dados e preencha os campos obrigatórios da OS. O orçamento original será preservado.</p>
        {fieldsError && <RequestError message={fieldsError} onRetry={refresh} />}
        {isLoading && <p role="status" className="text-sm">Carregando campos da ordem de serviço…</p>}
        <SaveError message={error} />
        <fieldset disabled={busy || isLoading} className="min-w-0 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">{fields?.map(field => <CustomFieldInput key={field.id} field={field} id={`${id}-${field.id}`} value={values[field.id] ?? ""} onChange={value => setValues(current => ({ ...current, [field.id]: value }))} />)}</div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <button disabled={!fields || !!fieldsError} type="submit" className={primaryButtonClass}>{busy ? "Gerando OS…" : "Confirmar e gerar OS"}</button>
                <button type="button" className={secondaryButtonClass} onClick={onCancel}>Voltar</button>
            </div>
        </fieldset>
    </form>;
}
