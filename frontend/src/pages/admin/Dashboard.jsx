import { useEffect, useState } from 'react';
import { useContract } from '../../hooks/useContract';
import { ShieldCheck, Plus, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { getStats, getActiveProposals, getClosedProposals } = useContract();
  const [stats, setStats] = useState({ proposals: 0, totalVotes: 0 });
  const [allProposals, setAllProposals] = useState([]);

  useEffect(() => {
    getStats().then(setStats);
    Promise.all([getActiveProposals(), getClosedProposals()]).then(([active, closed]) => {
      setAllProposals([...active, ...closed].sort((a, b) => b.start_time - a.start_time));
    });
  }, [getStats, getActiveProposals, getClosedProposals]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white neon-text mb-2">Government Dashboard</h2>
          <p className="text-slate-400">Total overview of the Votex ecosystem.</p>
        </div>
        <Link 
          to="/admin/create"
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(138,43,226,0.5)]"
        >
          <Plus className="w-5 h-5" />
          Create Proposal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 border-t-2 border-t-cyan-500">
          <div className="flex items-center gap-4 text-slate-300 mb-4">
            <FileText className="w-8 h-8 text-cyan-400" />
            <span className="text-lg font-medium text-white">Total Proposals</span>
          </div>
          <div className="text-4xl font-bold text-cyan-200">{stats.proposals}</div>
        </div>
        <div className="glass-card p-6 border-t-2 border-t-purple-500">
          <div className="flex items-center gap-4 text-slate-300 mb-4">
            <CheckCircle className="w-8 h-8 text-purple-400" />
            <span className="text-lg font-medium text-white">Total Votes Cast</span>
          </div>
          <div className="text-4xl font-bold text-purple-200">{stats.totalVotes}</div>
        </div>
        <div className="glass-card p-6 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-4 text-slate-300 mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <span className="text-lg font-medium text-white">Network Status</span>
          </div>
          <div className="text-2xl font-bold text-emerald-300">Testnet Linked</div>
        </div>
      </div>
      
      <div className="glass-panel p-8 rounded-2xl border border-slate-700/50 mt-12 mb-8">
        <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          Platform Users Breakdown
        </h3>
        <p className="text-slate-400 mb-6">Overview of user participation across all active and legacy voting events.</p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 px-4">
            <span>Proposal</span>
            <span>Completed Votes (Users)</span>
          </div>
          {allProposals.length === 0 ? (
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center px-6">
              <span className="text-slate-500 font-medium font-mono text-sm">No proposals have been launched yet.</span>
            </div>
          ) : (
            allProposals.map(p => (
              <div key={p.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-colors flex justify-between items-center px-6">
                <span className="text-slate-300 font-medium text-lg">{p.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold text-xl">{p.total_votes}</span>
                  <span className="text-slate-500 text-sm">users</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
