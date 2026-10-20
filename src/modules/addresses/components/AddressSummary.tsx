import { addressLines, type Address } from "../types/address.types";

export function AddressSummary({ address }: { address?: Address | null }) {
    return <section aria-label="Endereço cadastrado" className="min-w-0 rounded-xl border border-[#16345c] bg-[#07182d]/50 p-4">
        <h2 className="font-semibold text-[#f8fafc]">Endereço</h2>
        {address ? <address className="mt-2 space-y-1 break-words text-sm not-italic leading-6 text-[#a7b4c8]">{addressLines(address).map((line, index) => <p key={index}>{line}</p>)}</address> : <p className="mt-2 text-sm text-[#8290a8]">Não informado.</p>}
    </section>;
}
