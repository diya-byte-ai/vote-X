import { ShieldCheck, BarChart3, Users, PlayCircle, Wallet } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

function AnimatedCounter({ from, to, duration }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration: duration, ease: "easeOut" });
    return controls.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
}

export default function Home() {
  const { getStats } = useContract();
  const { address, openModal } = useWallet();
  const [stats, setStats] = useState({ proposals: 0, totalVotes: 0 });

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, [getStats]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <AnimatePresence>
        {!address && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
            className="w-full"
          >
            <div className="glass-panel py-3 px-6 rounded-xl border border-purple-500/30 flex items-center justify-between shadow-lg mb-4 bg-slate-900/80">
              <span className="text-slate-300 font-medium">Connect your Stellar wallet to participate in governance.</span>
              <button 
                onClick={openModal}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 font-bold transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Connect Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="text-center py-20 px-4 relative overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white neon-text drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
            On-Chain Democracy
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            Participate in verifiable, immutable, and transparent governance powered by the Stellar Blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/proposals" className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:shadow-[0_0_25px_rgba(138,43,226,0.6)] transition-all flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" />
              View Active Proposals
            </Link>
            <Link to="/results" className="px-8 py-4 rounded-xl bg-slate-800 border border-slate-600 text-white font-bold text-lg hover:border-cyan-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Past Results
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 text-center transition-all hover:shadow-[0_0_20px_rgba(138,43,226,0.15)] hover:-translate-y-1">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-purple-500/30 mb-4 shadow-[0_0_15px_rgba(138,43,226,0.2)]">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            <AnimatedCounter from={0} to={stats.proposals} duration={1.2} />
          </h3>
          <p className="text-slate-400">Proposals Created</p>
        </div>
        <div className="glass-card p-8 text-center transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:-translate-y-1">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-cyan-500/30 mb-4 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <Users className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            <AnimatedCounter from={0} to={stats.totalVotes} duration={1.2} />
          </h3>
          <p className="text-slate-400">Total Votes Cast</p>
        </div>
        <div className="glass-card p-8 text-center transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-1">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 mt-1 tracking-wide">Immutable</h3>
          <p className="text-slate-400">Soroban Smart Contracts</p>
        </div>
      </section>

      <section className="glass-panel p-8 rounded-3xl mt-12 bg-slate-900/60 border border-purple-500/20 text-left relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-3xl font-bold text-white mb-6 text-center neon-text">About Votex Governance</h2>
        <p className="text-center mb-10 max-w-2xl mx-auto leading-relaxed text-slate-300">
          Votex is a modern governance framework engineered for decentralized organizations (DAOs). Built on the high-performance Stellar Soroban smart contract platform, it ensures every voice is counted transparently, securely, and immutably.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="flex gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Decentralized Trust</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Votes are cast directly on the Stellar ledger. Once submitted, records cannot be altered, deleted, or censored by any central authority.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Wallet Support</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect seamlessly with standard Stellar ecosystem wallets like Freighter and Albedo. Real-time balance checks ensure voters meet necessary participation thresholds.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track voting statistics, proposal status, and aggregate metrics in real-time. Transparent results are computed directly from contract storage.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-pink-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-pink-950/50 border border-pink-500/30 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Sybil Resistance</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Proposals can define custom requirements, such as a minimum XLM balance, ensuring that participants have a genuine stake in the organization's decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
