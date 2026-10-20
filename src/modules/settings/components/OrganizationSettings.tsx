import { AddressFields } from "../../addresses/components/AddressFields";
import { addressDraft, addressPayload, type AddressInput } from "../../addresses/types/address.types";
import { useId, useRef, useState } from "react";
import { Building2, ImagePlus, Trash2 } from "lucide-react";
import {
    FormSection,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "../../../shared/components/form/FormSection";
import { Loading } from "../../../shared/components/loading";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { PhoneInput } from "../../../shared/components/inputs";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { useMessageStore } from "../../../shared/store/message.store";
import { useSettings } from "../hooks/settings-context";
import { useSettingsMutation } from "../hooks/useSettingsMutation";
import { SettingsService } from "../services/settings.service";
import type { Organization, OrganizationData } from "../types/settings.types";
import { SettingsField, SaveError } from "./SettingsField";

function readImage(file: File): Promise<string> {
    if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 2 * 1024 * 1024
    )
        return Promise.reject(
            new Error("Selecione uma imagem PNG, JPEG ou WebP de até 2 MB."),
        );
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            typeof reader.result === "string"
                ? resolve(reader.result)
                : reject(new Error("Não foi possível ler a imagem."));
        reader.onerror = () =>
            reject(new Error("Não foi possível ler a imagem."));
        reader.readAsDataURL(file);
    });
}
export function OrganizationSettings() {
    const { data, error, refresh } = useAsyncResource(
        "organization",
        SettingsService.organization,
    );
    if (error) return <RequestError message={error} onRetry={refresh} />;
    if (!data) return <Loading message="Carregando organização…" />;
    return (
        <OrganizationEditor
            key={`${data.id}-${data.updated_at}`}
            organization={data}
            onSaved={refresh}
        />
    );
}
function OrganizationEditor({
    organization,
    onSaved,
}: {
    organization: Organization;
    onSaved: () => void;
}) {
    const { isAdmin } = useSettings();
    const id = useId();
    const fileInput = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState<OrganizationData>(() => ({
        name: organization.name,
        trade_name: organization.trade_name,
        document: organization.document,
        phone: organization.phone,
        email: organization.email,
    }));
    const [address, setAddress] = useState(() => addressDraft(organization.address));
    const [addressChanged, setAddressChanged] = useState(false);
    const [addressBusy, setAddressBusy] = useState(false);
    const [logo, setLogo] = useState(organization.logo_url);
    const { busy, error, run } = useSettingsMutation();
    const showMessage = useMessageStore((state) => state.showMessage);
    const change = (key: keyof OrganizationData, value: string) =>
        setForm((current) => ({ ...current, [key]: value }));
    return (
        <form
            className="space-y-5"
            aria-busy={busy}
            onSubmit={(event) => {
                event.preventDefault();
                if (!isAdmin || addressBusy) return;
                let normalizedAddress: AddressInput | null | undefined;
                if (addressChanged) {
                    try { normalizedAddress = addressPayload(address); }
                    catch (error) { showMessage(error instanceof Error ? error.message : "Confira o endereço.", "error"); return; }
                }
                void run(
                    () =>
                        SettingsService.updateOrganization({
                            ...form,
                            name: form.name.trim(),
                            email: form.email?.trim() || null,
                            ...(addressChanged ? { address: normalizedAddress } : {}),
                        }),
                    () => {
                        showMessage(
                            "Dados da organização atualizados.",
                            "success",
                        );
                        onSaved();
                    },
                );
            }}
        >
            <div>
                <h2 className="text-xl font-semibold">Organização</h2>
                <p className="mt-2 text-sm leading-6 text-[#a7b4c8]">
                    Dados da empresa usados em seus atendimentos e documentos.
                </p>
            </div>
            {!isAdmin && (
                <p className="rounded-xl border border-blue-400/30 p-4 text-sm text-blue-200">
                    Você pode consultar estes dados. Somente administradores
                    podem alterá-los.
                </p>
            )}
            <fieldset disabled={busy || !isAdmin} className="min-w-0 space-y-5">
                <FormSection title="Identidade da empresa">
                    <div className="flex min-w-0 flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#16345c] bg-white/5">
                            {logo ? (
                                <img
                                    src={logo}
                                    alt="Logo da organização"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <Building2
                                    size={36}
                                    className="text-[#8290a8]"
                                />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="mb-3 text-sm text-[#a7b4c8]">
                                PNG, JPEG ou WebP, até 2 MB.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <input
                                    ref={fileInput}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    aria-label="Selecionar logo"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        event.target.value = "";
                                        if (!file) return;
                                        void run(
                                            async () =>
                                                SettingsService.uploadLogo(
                                                    await readImage(file),
                                                ),
                                            (updated) => {
                                                setLogo(updated.logo_url);
                                                showMessage(
                                                    "Logo atualizado.",
                                                    "success",
                                                );
                                            },
                                        );
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInput.current?.click()}
                                    className={secondaryButtonClass}
                                >
                                    <ImagePlus size={18} />
                                    {logo ? "Trocar logo" : "Enviar logo"}
                                </button>
                                {logo && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void run(
                                                SettingsService.removeLogo,
                                                (updated) => {
                                                    setLogo(updated.logo_url);
                                                    showMessage(
                                                        "Logo removido.",
                                                        "success",
                                                    );
                                                },
                                            )
                                        }
                                        className={secondaryButtonClass}
                                    >
                                        <Trash2 size={18} />
                                        Remover logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <SettingsField
                        label="Razão social / nome"
                        required
                        maxLength={255}
                        autoComplete="organization"
                        value={form.name}
                        onChange={(e) => change("name", e.target.value)}
                    />
                    <SettingsField
                        label="Nome fantasia"
                        maxLength={255}
                        value={form.trade_name ?? ""}
                        onChange={(e) => change("trade_name", e.target.value)}
                    />
                    <SettingsField
                        label="CPF / CNPJ"
                        maxLength={20}
                        value={form.document ?? ""}
                        onChange={(e) => change("document", e.target.value)}
                    />
                </FormSection>
                <FormSection title="Contatos">
                    <div>
                        <label
                            htmlFor={`${id}-phone`}
                            className="mb-2 block text-sm text-[#a7b4c8]"
                        >
                            Telefone
                        </label>
                        <PhoneInput
                            id={`${id}-phone`}
                            value={form.phone ?? ""}
                            onChange={(value) => change("phone", value)}
                            className={inputClass}
                        />
                    </div>
                    <SettingsField
                        label="E-mail da empresa"
                        type="email"
                        maxLength={255}
                        value={form.email ?? ""}
                        onChange={(e) => change("email", e.target.value)}
                    />
                </FormSection>
                {!organization.address && !!(organization.address_line || organization.city || organization.state || organization.zip_code) && <p className="rounded-xl border border-amber-400/25 p-4 text-sm leading-6 text-amber-100">
                    Endereço anterior preservado: {[organization.address_line, organization.city, organization.state, organization.zip_code].filter(Boolean).join(" · ")}. Para atualizá-lo, cadastre o endereço abaixo com a UF e a cidade do catálogo.
                </p>}
                <AddressFields value={address} onChange={next => { setAddress(next); setAddressChanged(true); }} disabled={busy || !isAdmin} onBusyChange={setAddressBusy} />
                <SaveError message={error} />
                {isAdmin && (
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={busy || addressBusy || !form.name.trim()}
                            className={primaryButtonClass}
                        >
                            {busy ? "Salvando…" : "Salvar organização"}
                        </button>
                    </div>
                )}
            </fieldset>
        </form>
    );
}
