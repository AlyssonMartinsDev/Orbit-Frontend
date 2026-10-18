import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FormSection,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../shared/components/form/FormSection";
import { useSettings } from "../hooks/settings-context";
import { useSettingsMutation } from "../hooks/useSettingsMutation";
import { SettingsService } from "../services/settings.service";
import type { ProvisionedOrganization } from "../types/settings.types";
import { SaveError, SettingsField } from "./SettingsField";

export function PlatformSettings() {
  const { profile } = useSettings();
  // A direct URL must not render the form for ordinary organization admins.
  if (!profile.is_superuser) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Acesso restrito</h2>
        <p className="text-sm text-[#a7b4c8]">
          Este painel é exclusivo do superadministrador da plataforma.
        </p>
        <Link className={secondaryButtonClass} to="/settings/account">
          Voltar para minha conta
        </Link>
      </div>
    );
  }
  return <ProvisionForm />;
}

function ProvisionForm() {
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [maxUsers, setMaxUsers] = useState("5");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const [created, setCreated] = useState<ProvisionedOrganization | null>(null);
  const { busy, error, run } = useSettingsMutation();

  if (created) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="rounded-xl border border-green-400/30 bg-green-400/10 p-4"
        >
          <h2 className="text-xl font-semibold">
            Organização e administrador criados
          </h2>
          <p className="mt-2 break-words text-sm">
            {created.organization.name} · Organização #{created.organization.id}
          </p>
          <p className="mt-2 break-words text-sm">
            Administrador: {created.administrator.name} (
            {created.administrator.email})
          </p>
        </div>
        <p className="text-sm leading-6 text-[#a7b4c8]">
          O administrador já pode entrar com o e-mail e a senha inicial
          definidos. Ele terá acesso somente à nova organização e poderá alterar
          a senha em Conta e segurança.
        </p>
        <button
          type="button"
          className={primaryButtonClass}
          onClick={() => setCreated(null)}
        >
          Criar outra organização
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Administração da plataforma</h2>
        <p className="mt-2 text-sm leading-6 text-[#a7b4c8]">
          Cadastre uma organização e seu primeiro administrador. Os dois
          cadastros serão salvos juntos.
        </p>
      </header>
      <form
        aria-busy={busy}
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim() || !adminName.trim()) {
            setValidation("Informe o nome da organização e do administrador.");
            return;
          }
          if (password !== confirmation) {
            setValidation("A confirmação não corresponde à senha inicial.");
            return;
          }
          if (
            !password.trim() ||
            password.length < 8 ||
            new TextEncoder().encode(password).length > 72
          ) {
            setValidation(
              "A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes.",
            );
            return;
          }
          const limit = maxUsers.trim() === "" ? null : Number(maxUsers);
          if (
            limit !== null &&
            (!Number.isInteger(limit) || limit < 1 || limit > 2147483647)
          ) {
            setValidation(
              "Informe um limite de usuários inteiro maior que zero.",
            );
            return;
          }
          setValidation(null);
          void run(
            () =>
              SettingsService.provisionOrganization({
                organization: {
                  name: name.trim(),
                  trade_name: tradeName.trim() || null,
                  document: document.trim() || null,
                  email: email.trim() || null,
                  phone: phone.trim() || null,
                  max_users: limit,
                },
                administrator: {
                  name: adminName.trim(),
                  email: adminEmail.trim(),
                  password,
                },
              }),
            (result) => {
              setPassword("");
              setConfirmation("");
              setName("");
              setTradeName("");
              setDocument("");
              setEmail("");
              setPhone("");
              setMaxUsers("5");
              setAdminName("");
              setAdminEmail("");
              setCreated(result);
            },
          );
        }}
      >
        <fieldset disabled={busy} className="min-w-0 space-y-6">
          <FormSection
            title="Nova organização"
            description="O administrador poderá completar endereço e logo nas configurações da empresa."
          >
            <SettingsField
              label="Nome da organização"
              required
              maxLength={255}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <SettingsField
              label="Nome fantasia"
              maxLength={255}
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
            />
            <SettingsField
              label="CPF/CNPJ"
              maxLength={20}
              value={document}
              onChange={(e) => setDocument(e.target.value)}
            />
            <SettingsField
              label="E-mail da organização"
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <SettingsField
              label="Telefone da organização"
              type="tel"
              maxLength={30}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div>
              <SettingsField
                label="Limite de usuários ativos"
                type="number"
                min={1}
                max={2147483647}
                step={1}
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
              />
              <p className="mt-2 text-xs leading-5 text-[#8290a8]">
                Inclui o primeiro administrador. Deixe vazio para não definir um
                limite.
              </p>
            </div>
          </FormSection>
          <FormSection
            title="Primeiro administrador"
            description="Este usuário administra somente a nova organização e não recebe acesso à plataforma."
          >
            <SettingsField
              label="Nome do administrador"
              required
              maxLength={255}
              autoComplete="off"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
            <SettingsField
              label="E-mail do administrador"
              required
              type="email"
              maxLength={255}
              autoComplete="off"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <SettingsField
              label="Senha inicial"
              required
              type="password"
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <SettingsField
              label="Confirmar senha inicial"
              required
              type="password"
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </FormSection>
          <SaveError message={validation || error} />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className={primaryButtonClass}
            >
              {busy
                ? "Criando organização…"
                : "Criar organização e administrador"}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
