import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FormSection,
    primaryButtonClass,
} from "../../../shared/components/form/FormSection";
import { useAuthStore } from "../../../shared/store/auth.store";
import { useMessageStore } from "../../../shared/store/message.store";
import { useSettings } from "../hooks/settings-context";
import { useSettingsMutation } from "../hooks/useSettingsMutation";
import { SettingsService } from "../services/settings.service";
import { SettingsField, SaveError } from "./SettingsField";
import { SettingsImageUpload } from "./SettingsImageUpload";
import { roleLabels } from "../types/settings.types";

export function AccountSettings() {
    const { profile } = useSettings();
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Conta e segurança</h2>
                <p className="mt-2 text-sm text-[#a7b4c8]">
                    Seu acesso: {profile.is_superuser ? "Superadministrador da plataforma" : roleLabels[profile.role]}. Altere seus dados e
                    proteja sua conta.
                </p>
            </div>
            <ProfilePhoto key={`photo-${profile.id}`} />
            <ProfileForm key={`profile-${profile.id}`} />
            <PasswordForm />
        </div>
    );
}
function ProfilePhoto() {
    const { profile, refreshProfile } = useSettings();
    const [avatar, setAvatar] = useState(profile.avatar_url);
    return <FormSection title="Foto de perfil">
        <SettingsImageUpload kind="avatar" value={avatar}
            upload={async dataUrl => (await SettingsService.uploadAvatar(dataUrl)).avatar_url}
            remove={async () => (await SettingsService.removeAvatar()).avatar_url}
            onSaved={value => { setAvatar(value); refreshProfile(); }} />
    </FormSection>;
}
function ProfileForm() {
    const { profile, refreshProfile } = useSettings();
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const { busy, error, run } = useSettingsMutation();
    const showMessage = useMessageStore((state) => state.showMessage);
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                void run(
                    () =>
                        SettingsService.updateProfile({
                            name: name.trim(),
                            email: email.trim(),
                        }),
                    () => {
                        showMessage("Perfil atualizado.", "success");
                        refreshProfile();
                    },
                );
            }}
            aria-busy={busy}
        >
            <fieldset disabled={busy} className="min-w-0 space-y-4">
                <FormSection title="Meu perfil">
                    <SettingsField
                        label="Nome"
                        required
                        maxLength={255}
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <SettingsField
                        label="E-mail"
                        type="email"
                        required
                        maxLength={255}
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormSection>
                <SaveError message={error} />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={busy || !name.trim()}
                        className={primaryButtonClass}
                    >
                        {busy ? "Salvando…" : "Salvar perfil"}
                    </button>
                </div>
            </fieldset>
        </form>
    );
}
function PasswordForm() {
    const [current, setCurrent] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [validation, setValidation] = useState<string | null>(null);
    const { busy, error, run } = useSettingsMutation();
    const navigate = useNavigate();
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                if (password !== confirmation) {
                    setValidation(
                        "A confirmação não corresponde à nova senha.",
                    );
                    return;
                }
                if (new TextEncoder().encode(password).length > 72) {
                    setValidation(
                        "A senha excede o limite de 72 bytes. Use menos caracteres.",
                    );
                    return;
                }
                setValidation(null);
                void run(
                    () =>
                        SettingsService.changePassword({
                            current_password: current,
                            new_password: password,
                        }),
                    () => {
                        useAuthStore.getState().logout();
                        useMessageStore
                            .getState()
                            .showMessage(
                                "Senha alterada. Entre novamente com sua nova senha.",
                                "success",
                            );
                        void navigate("/login", { replace: true });
                    },
                );
            }}
            aria-busy={busy}
        >
            <fieldset disabled={busy} className="min-w-0 space-y-4">
                <FormSection
                    title="Alterar senha"
                    description="Use pelo menos 8 caracteres. Ao salvar, suas sessões serão encerradas em todos os dispositivos."
                >
                    <div className="sm:col-span-2">
                        <SettingsField
                            label="Senha atual"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={current}
                            onChange={(e) => setCurrent(e.target.value)}
                        />
                    </div>
                    <SettingsField
                        label="Nova senha"
                        type="password"
                        required
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <SettingsField
                        label="Confirmar nova senha"
                        type="password"
                        required
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
                        {busy ? "Alterando…" : "Alterar senha"}
                    </button>
                </div>
            </fieldset>
        </form>
    );
}
