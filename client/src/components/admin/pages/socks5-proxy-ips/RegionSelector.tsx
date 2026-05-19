import { REGIONS } from './Data'

interface RegionProps {
    activeRegion: string;
    setActiveRegion: (region: string) => void;
}

function RegionSelector({ activeRegion, setActiveRegion }: RegionProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
                <button
                    key={r.id}
                    onClick={() => setActiveRegion(r.id)}
                    className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150 border ${activeRegion === r.id
                        ? "bg-c-emerald-600 text-white border-c-emerald-500 shadow-sm"
                        : "bg-c-slate-900/50 text-c-slate-400 border-c-slate-800 hover:bg-c-slate-800 hover:text-c-slate-200"
                        }`}
                >
                    {r.label} ({r.count.toLocaleString()})
                </button>
            ))}
        </div>
    )
}

export default RegionSelector