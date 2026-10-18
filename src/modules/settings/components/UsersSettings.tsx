import { useCallback, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Users } from "lucide-react";
import {
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "../../../shared/components/form/FormSection";
import { Modal } from "../../../shared/components/modal";
import { Loading } from "../../../shared/components/loading";
import { RequestError } from "../../../shared/components/feedback/RequestError";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { useMessageStore } from "../../../shared/store/message.store";
import { useSettings } from "../hooks/settings-context";
import { useSettingsMutation } from "../hooks/useSettingsMutation";
import { SettingsService } from "../services/settings.service";
import { roleLabels } from "../types/settings.types";
import type { AccountUser, UserRole } from "../types/settings.types";
import { SettingsField, SaveError } from "./SettingsField";

export function UsersSettings() {
    const { canReadTeam } = useSettings();
    if (!canReadTeam)
        return (
            <p
                role="status"
                className="rounded-xl border border-[#16345c] p-5 text-sm text-[#a7b4c8]"
            >
                A gestão da equipe está disponível para administradores e
                gestores. Você pode editar seu perfil em{" "}
                <Link
                    to="/settings/account"
                    className="text-blue-300 underline"
                >
                    Conta e segurança
                </Link>
                .
            </p>
        );
    return <Team />;
}
function Team() {
    const { profile, isAdmin } = useSettings();
    const load = useCallback(async (signal: AbortSignal) => {
        const [users, organization] = await Promise.all([
            SettingsService.users(signal),
            SettingsService.organization(signal),
        ]);
        return { users, organization };
    }, []);
    const { data, error, refresh } = useAsyncResource("team", load);
    const [selection, setSelection] = useState<AccountUser | "new" | null>(
        null,
    );
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const visible = useMemo(
        () =>
            data?.users.filter(
                (user) =>
                    `${user.name} ${user.email}`
                        .toLocaleLowerCase("pt-BR")
                        .includes(search.trim().toLocaleLowerCase("pt-BR")) &&
                    (filter === "all" ||
                        (filter === "active"
                            ? user.is_active
                            : !user.is_active)),
            ) ?? [],
        [data, search, filter],
    );
    if (error) return <RequestError message={error} onRetry={refresh} />;
    if (!data) return <Loading message="Carregando equipe…" />;
    const active = data.users.filter((user) => user.is_active).length;
    const limitReached =
        data.organization.max_users !== null &&
        active >= data.organization.max_users;
    return (
        <section className="min-w-0 space-y-5">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Users size={22} />
                        Usuários
                    </h2>
                    <p className="mt-2 text-sm text-[#a7b4c8]">
                        {active} ativos
                        {data.organization.max_users !== null
                            ? ` de ${data.organization.max_users} disponíveis`
                            : " • sem limite configurado"}
                        .
                    </p>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        disabled={limitReached}
                        onClick={() => setSelection("new")}
                        className={primaryButtonClass}
                    >
                        <Plus size={18} />
                        Novo usuário
                    </button>
                )}
            </header>
            {limitReached && isAdmin && (
                <p role="status" className="text-sm text-amber-200">
                    Limite de usuários ativos atingido. Desative um usuário para
                    liberar uma vaga.
                </p>
            )}
            {!isAdmin && (
                <p className="text-sm text-blue-200">
                    Você pode consultar a equipe. Somente administradores podem
                    gerenciar os acessos.
                </p>
            )}
            <details className="rounded-xl border border-[#16345c] p-4 text-sm text-[#a7b4c8]">
                <summary className="cursor-pointer py-1 font-medium text-white">
                    O que cada perfil permite
                </summary>
                <ul className="mt-3 space-y-2">
                    <li>
                        <strong>Administrador:</strong> gerencia a organização,
                        os usuários e a operação.
                    </li>
                    <li>
                        <strong>Gestor:</strong> gerencia a operação e consulta
                        a equipe, sem alterar acessos ou dados da empresa.
                    </li>
                    <li>
                        <strong>Operacional:</strong> realiza atendimentos
                        conforme as permissões dos módulos, sem gerenciar a
                        equipe ou a organização.
                    </li>
                </ul>
            </details>
            <div className="grid gap-4 sm:grid-cols-2">
                <SettingsField
                    label="Buscar usuários"
                    type="search"
                    placeholder="Nome ou e-mail"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <label className="text-sm text-[#a7b4c8]">
                    Situação
                    <select
                        className={`${inputClass} mt-2`}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </label>
            </div>
            <ul className="space-y-3">
                {visible.map((user) => (
                    <li
                        key={user.id}
                        className="flex min-w-0 flex-col gap-4 rounded-xl border border-[#16345c] bg-[#051020] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="min-w-0">
                            <p className="break-words font-semibold">
                                {user.name}
                                {user.id === profile.id && (
                                    <span className="ml-2 text-xs text-blue-300">
                                        Você
                                    </span>
                                )}
                            </p>
                            <p className="mt-1 break-all text-sm text-[#a7b4c8]">
                                {user.email}
                            </p>
                            <p className="mt-2 text-sm text-[#a7b4c8]">
                                {roleLabels[user.role]} ·{" "}
                                <span
                                    className={
                                        user.is_active
                                            ? "text-green-300"
                                            : "text-[#a7b4c8]"
                                    }
                                >
                                    {user.is_active ? "Ativo" : "Inativo"}
                                </span>
                            </p>
                        </div>
                        {user.id === profile.id ? (
                            <Link
                                to="/settings/account"
                                className={secondaryButtonClass}
                            >
                                Minha conta
                            </Link>
                        ) : (
                            isAdmin &&
                            !user.is_superuser && (
                                <button
                                    type="button"
                                    aria-label={`Editar ${user.name}`}
                                    onClick={() => setSelection(user)}
                                    className={secondaryButtonClass}
                                >
                                    <Pencil size={17} />
                                    Editar
                                </button>
                            )
                        )}
                    </li>
                ))}
            </ul>
            {visible.length === 0 && (
                <p role="status" className="py-6 text-sm text-[#a7b4c8]">
                    Nenhum usuário encontrado.
                </p>
            )}
            {selection !== null && (
                <UserEditor
                    key={selection === "new" ? "new" : selection.id}
                    user={selection === "new" ? undefined : selection}
                    onClose={() => setSelection(null)}
                    onSaved={() => {
                        setSelection(null);
                        refresh();
                    }}
                />
            )}
        </section>
    );
}
function UserEditor({
    user,
    onClose,
    onSaved,
}: {
    user?: AccountUser;
    onClose: () => void;
    onSaved: () => void;
}) {
    const id = useId();
    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [role, setRole] = useState<UserRole>(
        user?.role === "admin" || user?.role === "manager" ? user.role : "user",
    );
    const [active, setActive] = useState(user?.is_active ?? true);
    const [password, setPassword] = useState("");
    const [confirming, setConfirming] = useState(false);
    const { busy, error, run, isPending } = useSettingsMutation();
    const showMessage = useMessageStore((state) => state.showMessage);
    const save = () =>
        void run(
            () =>
                user
                    ? SettingsService.updateUser(user.id, {
                          name: name.trim(),
                          email: email.trim(),
                          role,
                          is_active: active,
                          ...(password ? { password } : {}),
                      })
                    : SettingsService.createUser({
                          name: name.trim(),
                          email: email.trim(),
                          role,
                          password,
                      }),
            () => {
                showMessage(
                    user
                        ? "Usuário atualizado."
                        : "Usuário criado. Compartilhe a senha inicial por um canal seguro.",
                    "success",
                );
                onSaved();
            },
        );
    return (
        <Modal
            open
            title={user ? "Editar usuário" : "Novo usuário"}
            subtitle={user?.name}
            onClose={() => {
                if (!isPending()) onClose();
            }}
        >
            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (
                        user &&
                        (role !== user.role ||
                            active !== user.is_active ||
                            !!password) &&
                        !confirming
                    ) {
                        setConfirming(true);
                        return;
                    }
                    save();
                }}
                aria-busy={busy}
            >
                <fieldset disabled={busy} className="min-w-0 space-y-4">
                    {confirming ? (
                        <div className="rounded-xl border border-amber-400/40 p-4 text-sm leading-6 text-amber-100">
                            <p>
                                Confirmar a alteração de acesso de {user?.name}?
                                As sessões deste usuário serão encerradas.
                                {!active &&
                                    " Ele não poderá entrar enquanto estiver inativo."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <SettingsField
                                label="Nome"
                                required
                                maxLength={255}
                                autoComplete="off"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <SettingsField
                                label="E-mail"
                                required
                                type="email"
                                maxLength={255}
                                autoComplete="off"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div>
                                <label
                                    htmlFor={`${id}-role`}
                                    className="mb-2 block text-sm text-[#a7b4c8]"
                                >
                                    Perfil de acesso
                                </label>
                                <select
                                    id={`${id}-role`}
                                    value={role}
                                    onChange={(e) => {
                                        if (
                                            [
                                                "admin",
                                                "manager",
                                                "user",
                                            ].includes(e.target.value)
                                        )
                                            setRole(e.target.value as UserRole);
                                    }}
                                    className={inputClass}
                                >
                                    <option value="user">Operacional</option>
                                    <option value="manager">Gestor</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <SettingsField
                                label={
                                    user ? "Redefinir senha" : "Senha inicial"
                                }
                                type="password"
                                required={!user}
                                minLength={8}
                                maxLength={72}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-xs leading-5 text-[#a7b4c8]">
                                {user
                                    ? "Deixe a senha em branco para mantê-la. "
                                    : "Compartilhe a senha inicial com o usuário. "}
                                Use pelo menos 8 caracteres.
                            </p>
                            {user && (
                                <label className="flex min-h-11 items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={active}
                                        onChange={(e) =>
                                            setActive(e.target.checked)
                                        }
                                        className="h-5 w-5 accent-blue-500"
                                    />
                                    Usuário ativo
                                </label>
                            )}
                        </>
                    )}
                    <SaveError message={error} />
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() =>
                                confirming ? setConfirming(false) : onClose()
                            }
                            className={secondaryButtonClass}
                        >
                            {confirming ? "Voltar" : "Cancelar"}
                        </button>
                        <button
                            type="submit"
                            disabled={busy || !name.trim()}
                            className={primaryButtonClass}
                        >
                            {busy
                                ? "Salvando…"
                                : confirming
                                  ? "Confirmar alteração"
                                  : user
                                    ? "Salvar usuário"
                                    : "Criar usuário"}
                        </button>
                    </div>
                </fieldset>
            </form>
        </Modal>
    );
}
