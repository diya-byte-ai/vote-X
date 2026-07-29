import { useEffect, useMemo, useState } from 'react';
import { useContract } from '../hooks/useContract';
import ProposalCard from '../components/ProposalCard';
import { Loader2, Search, X } from 'lucide-react';

const SORTS = {
  ending_soon: { label: 'Ending soonest', compare: (a, b) => a.deadline - b.deadline },
  newest: { label: 'Newest first', compare: (a, b) => b.id - a.id },
  most_votes: { label: 'Most votes', compare: (a, b) => b.total_votes - a.total_votes },
};

export default function Proposals() {
  const { getActiveProposals, loading } = useContract();
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState(false);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('ending_soon');

  useEffect(() => {
    getActiveProposals()
      .then(setProposals)
      .catch(() => setError(true));
  }, [getActiveProposals]);

  // Categories come from what is actually on-chain rather than a fixed list,
  // so a new category added by the admin shows up here automatically.
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(proposals.map(p => p.category).filter(Boolean))).sort()],
    [proposals]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return proposals
      .filter(p => category === 'All' || p.category === category)
      .filter(p =>
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.options?.some(o => o.toLowerCase().includes(q))
      )
      .sort(SORTS[sort].compare);
  }, [proposals, query, category, sort]);

  const filtersActive = query.trim() !== '' || category !== 'All';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white neon-text mb-2">Active Proposals</h2>
          <p className="text-slate-400">Cast your vote on open government proposals.</p>
        </div>
        {!loading && proposals.length > 0 && (
          <span className="text-sm text-slate-400 font-mono">
            {visible.length} of {proposals.length} shown
          </span>
        )}
      </div>

      {!loading && proposals.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, description or option..."
              aria-label="Search proposals"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            aria-label="Sort proposals"
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        </div>
      ) : error || proposals.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-dashed border-slate-700">
          <h3 className="text-2xl text-slate-300 font-bold mb-2">No active proposals found</h3>
          <p className="text-slate-500">Either the contract is not deployed or there are currently no open voting proposals on-chain.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-dashed border-slate-700">
          <h3 className="text-2xl text-slate-300 font-bold mb-2">No proposals match your filters</h3>
          <p className="text-slate-500 mb-6">Try a different search term or category.</p>
          {filtersActive && (
            <button
              onClick={() => { setQuery(''); setCategory('All'); }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 border border-cyan-500/50 text-cyan-400 font-bold hover:bg-slate-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {visible.map(p => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
