import axios from "axios";
import { useRef, useState, type ReactNode, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OrbitLogo } from "../../../shared/components/OrbitLogo";
import { inputClass, primaryButtonClass } from "../../../shared/components/form/FormSection";
import { changeSession } from "../../../shared/services/session";
import { useMessageStore } from "../../../shared/store/message.store";
import { AuthService } from "../services/auth.service";

function RecoveryLayout({ title, children }: { title: string; children: ReactNode }) {
    return <main className="flex min-h-dvh items-center justify-center bg-[#010b1b] px-4 py-10 text-[#f8fafc]">
        <section className="w-full max-w-md rounded-2xl border border-[#16345c] bg-[#051020] p-5 sm:p-8">
            <OrbitLogo variant="brand" />
            <h1 className="mb-3 mt-8 text-2xl font-semibold">{title}</h1>
            {children}
            <Link className="mt-6 block py-2 text-center text-sm text-[#3692ff] hover:underline" to="/login">Voltar para o login</Link>
        </section>
    </main>;
}

function ErrorMessage({ message }: { message: string }) {
    return message ? <p role="alert" className="break-words rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">{message}</p> : null;
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    async function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending.current) return;
        pending.current = true;
        setBusy(true);
        setError("");
        try {
            const response = await AuthService.forgotPassword(email.trim());
            if (response.success) setMessage(response.message);
            else setError(response.message);
        } catch (error) {
            if (!axios.isCancel(error)) setError("Não foi possível enviar a solicitação. Verifique sua conexão e tente novamente.");
        } finally { pending.current = false; setBusy(false); }
    }
    return <RecoveryLayout title="Recuperar senha">
        <p className="mb-6 text-sm leading-6 text-[#a7b4c8]">Informe o e-mail da sua conta para receber um link de recuperação.</p>
        {message ? <div role="status" className="space-y-4 text-sm leading-6 text-[#a7b4c8]">
            <p>{message}</p>
            <p>Se precisar solicitar outro link, aguarde pelo menos um minuto. Somente o link mais recente será válido.</p>
            <button type="button" className="py-2 text-[#3692ff] hover:underline" onClick={() => setMessage("")}>Solicitar novamente</button>
        </div> : <form onSubmit={submit} className="space-y-5">
            <div><label className="mb-2 block text-sm text-[#a7b4c8]" htmlFor="recovery-email">E-mail</label>
                <input id="recovery-email" type="email" autoComplete="email" maxLength={255} required value={email} onChange={event => setEmail(event.target.value)} className={inputClass} /></div>
            <ErrorMessage message={error} />
            <button disabled={busy} className={primaryButtonClass} type="submit">{busy ? "Enviando…" : "Enviar link de recuperação"}</button>
        </form>}
    </RecoveryLayout>;
}

export function ResetPasswordPage() {
    const location = useLocation();
    const token = new URLSearchParams(location.hash.slice(1)).get("token") ?? "";
    const validToken = /^[A-Za-z0-9_-]{43}$/.test(token);
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    const navigate = useNavigate();
    async function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending.current) return;
        setError("");
        if (password !== confirmation) { setError("A confirmação não corresponde à nova senha."); return; }
        if (!password.trim() || password.length < 8 || new TextEncoder().encode(password).length > 72) {
            setError("A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes."); return;
        }
        pending.current = true;
        setBusy(true);
        try {
            const response = await AuthService.resetPassword(token, password);
            if (!response.success) { setError(response.message); return; }
            changeSession(null);
            useMessageStore.getState().showMessage(response.message, "success");
            navigate("/login", { replace: true });
        } catch (error) {
            if (!axios.isCancel(error)) setError("Não foi possível redefinir sua senha. Verifique sua conexão e tente novamente.");
        } finally { pending.current = false; setBusy(false); }
    }
    return <RecoveryLayout title="Redefinir senha">
        {!validToken ? <ErrorMessage message="Link inválido ou incompleto. Solicite uma nova recuperação de senha." /> : <>
            <p className="mb-6 text-sm leading-6 text-[#a7b4c8]">Escolha uma senha com pelo menos 8 caracteres. Após a alteração, será necessário entrar novamente em todos os dispositivos.</p>
            <form onSubmit={submit} className="space-y-5">
                <div><label className="mb-2 block text-sm text-[#a7b4c8]" htmlFor="new-password">Nova senha</label>
                    <input id="new-password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className={inputClass} /></div>
                <div><label className="mb-2 block text-sm text-[#a7b4c8]" htmlFor="confirm-password">Confirmar nova senha</label>
                    <input id="confirm-password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className={inputClass} /></div>
                <ErrorMessage message={error} />
                <button disabled={busy} type="submit" className={primaryButtonClass}>{busy ? "Salvando…" : "Salvar nova senha"}</button>
            </form>
        </>}
        <Link className="mt-5 inline-block py-2 text-sm text-[#3692ff] hover:underline" to="/forgot-password">Solicitar novo link</Link>
    </RecoveryLayout>;
}
