import { useMessageStore } from "../../store/message.store";

const messageStyles = {
  success: "border-green-500/30 bg-green-500/15 text-green-200",
  error: "border-red-500/30 bg-red-500/15 text-red-200",
  warning: "border-yellow-500/30 bg-yellow-500/15 text-yellow-200",
  info: "border-blue-500 bg-white text-blue-700 shadow-blue-500/10",
};

export function GlobalMessage() {
  const message = useMessageStore((state) => state.message);
  const type = useMessageStore((state) => state.type);
  const isVisible = useMessageStore((state) => state.isVisible);

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-[slideDown_0.35s_ease-out]">
      <div
        className={`min-w-80 max-w-md rounded-2xl border px-6 py-4 text-sm shadow-2xl backdrop-blur-xl ${messageStyles[type]}`}
      >
        <p className="font-semibold">
          {type === "success" && "Sucesso"}
          {type === "error" && "Erro"}
          {type === "warning" && "Atenção"}
          {type === "info" && "Informação"}
        </p>

        <p className="mt-1 text-sm opacity-90">{message}</p>
      </div>
    </div>
  );
}