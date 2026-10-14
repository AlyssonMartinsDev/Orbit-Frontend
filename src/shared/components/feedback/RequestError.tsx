import { AlertCircle, RotateCcw } from "lucide-react";

export function RequestError({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div
            role="alert"
            className="my-4 flex flex-col items-start gap-3 rounded-xl border border-red-400/25 bg-red-950/20 p-4 text-sm text-red-200 sm:flex-row sm:items-center"
        >
            <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1 break-words">{message}</p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-red-300/25 px-3 hover:bg-red-400/10"
                >
                    <RotateCcw size={16} />
                    Tentar novamente
                </button>
            )}
        </div>
    );
}
