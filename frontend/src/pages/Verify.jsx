import { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, Copy, ExternalLink, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useContract } from '../hooks/useContract';
import { formatXLM } from '../utils/format';

const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;
const TX_HASH = /^[0-9a-fA-F]{64}$/;

export default function Verify() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, not_found, invalid
  const [receipt, setReceipt] = useState(null);
  const [voterResult, setVoterResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const { getProposal, getVoterHistory, getTransactionDetails } = useContract();

  const readLocalReceipt = (txHash) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('voted_')) continue;
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data?.txHash === txHash) {
          return { ...data, proposalId: Number(key.split('_').pop()) };
        }
      } catch {
        // ignore malformed cache entries
      }
    }
    return null;
  };

  // Verification now hits the network, not this browser's cache, so any
  // wallet address or transaction hash can be checked by anyone.
  const handleSearch = async (e) => {
    e.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery) return;

    setReceipt(null);
    setVoterResult(null);

    if (!STELLAR_ADDRESS.test(searchQuery) && !TX_HASH.test(searchQuery)) {
      setStatus('invalid');
      return;
    }

    setStatus('loading');

    if (STELLAR_ADDRESS.test(searchQuery)) {
      const votes = await getVoterHistory(searchQuery);
      if (!votes.length) {
        setStatus('not_found');
        return;
      }
      const detailed = await Promise.all(
        votes.map(async (v) => {
          const p = await getProposal(v.proposalId).catch(() => null);
          return {
            proposalId: v.proposalId,
            proposalTitle: p ? p.title : `Proposal #${v.proposalId}`,
            optionText: p?.options?.[v.optionIdx] ?? `Option ${v.optionIdx}`,
            votedAt: v.votedAt,
          };
        })
      );
      detailed.sort((a, b) => (b.votedAt || 0) - (a.votedAt || 0));
      setVoterResult({ address: searchQuery, votes: detailed });
      setStatus('success');
      return;
    }

    const tx = await getTransactionDetails(searchQuery);
    if (!tx) {
      setStatus('not_found');
      return;
    }

    // The ledger proves the transaction; a local receipt, when this browser
    // happens to have one, adds the human-readable choice on top.
    const local = readLocalReceipt(searchQuery);
    let proposalTitle = null;
    if (local?.proposalId !== undefined && !Number.isNaN(local.proposalId)) {
      const p = await getProposal(local.proposalId).catch(() => null);
      proposalTitle = p ? p.title : `Proposal #${local.proposalId}`;
    }

    setReceipt({
      txHash: tx.hash,
      status: tx.status,
      ledger: tx.ledger,
      fee: tx.feeCharged ?? local?.fee ?? null,
      timestamp: tx.createdAt || local?.timestamp || null,
      optionText: local?.choice || null,
      proposalTitle,
    });
    setStatus('success');
  };

  const handleCopy = () => {
    if (receipt?.txHash) {
      navigator.clipboard.writeText(receipt.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold text-white neon-text mb-2 text-center">Verify Public Ledger</h2>
      <p className="text-slate-400 mb-10 text-center">Enter a Stellar wallet address or Tx Hash to verify on-chain records.</p>

      <form onSubmit={handleSearch} className="mb-12 relative group max-w-xl mx-auto">
        <div className={`absolute inset-0 rounded-full transition-all duration-500 blur-lg ${isFocused ? 'bg-gradient-to-r from-cyan-500 to-purple-500 opacity-50' : 'bg-slate-700 opacity-20'}`} />
        <div className={`relative flex items-center bg-slate-900 border transition-colors duration-300 rounded-full p-2 ${isFocused ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]' : 'border-slate-700'}`}>
          <Search className={`w-6 h-6 ml-4 transition-colors ${isFocused ? 'text-cyan-400' : 'text-slate-400'}`} />
          <input
            type="text"
            className="flex-grow bg-transparent border-none text-white px-4 py-2 focus:outline-none placeholder-slate-500 font-mono text-sm tracking-wide"
            placeholder="G... wallet address or 64-character tx hash"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold px-6 py-2 rounded-full hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === 'loading' ? <Hexagon className="w-4 h-4 animate-[spin_2s_linear_infinite]" /> : 'Verify'}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-12 text-center rounded-3xl border border-dashed border-slate-700"
          >
            <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl text-slate-400 font-medium tracking-wide">Awaiting Query</h3>
            <p className="text-sm text-slate-500 mt-2">Any wallet address or transaction hash can be checked here, not just your own.</p>
          </motion.div>
        )}

        {status === 'invalid' && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-12 text-center rounded-3xl border border-dashed border-amber-500/30"
          >
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-70" />
            <h3 className="text-xl text-amber-400 font-medium">Unrecognised Format</h3>
            <p className="text-sm text-slate-500 mt-2">
              Enter a Stellar public key (56 characters, starting with G) or a transaction hash (64 hex characters).
            </p>
          </motion.div>
        )}

        {status === 'not_found' && (
          <motion.div 
            key="not_found"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-12 text-center rounded-3xl border border-dashed border-red-500/30"
          >
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl text-red-400 font-medium">Record Not Found</h3>
            <p className="text-sm text-slate-500 mt-2">
              The network has no record of this transaction, or this wallet has not cast any vote on this contract.
            </p>
          </motion.div>
        )}

        {status === 'success' && voterResult && (
          <motion.div
            key="voter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel rounded-2xl p-8 border border-emerald-500/30"
          >
            <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold text-lg border-b border-emerald-500/20 pb-4">
              <CheckCircle2 className="w-6 h-6" />
              {voterResult.votes.length} vote{voterResult.votes.length === 1 ? '' : 's'} found on-chain
            </div>

            <div className="mb-6">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Wallet Address</div>
              <div className="font-mono text-sm text-cyan-400 bg-slate-950 border border-slate-800 p-2.5 rounded break-all">
                {voterResult.address}
              </div>
            </div>

            <div className="space-y-3">
              {voterResult.votes.map((v) => (
                <div key={v.proposalId} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <span className="text-white font-bold">{v.proposalTitle}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {v.votedAt ? new Date(v.votedAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded text-sm">
                    Voted: {v.optionText}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {status === 'success' && receipt && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-[1px] rounded-xl bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 relative overflow-hidden"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20 pointer-events-none"
            />
            
            <div className="bg-slate-900 rounded-xl p-8 relative z-10 backdrop-blur-3xl shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold text-lg border-b border-emerald-500/20 pb-4">
                <CheckCircle2 className="w-6 h-6" />
                Verified Immutable Match
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Ledger Status</div>
                  <div className="text-emerald-300 font-medium bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                    {receipt.status}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Ledger</div>
                  <div className="text-slate-200 font-mono bg-slate-800/50 p-2 rounded border border-slate-700/50">
                    {receipt.ledger ?? 'Unknown'}
                  </div>
                </div>

                {receipt.proposalTitle && (
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Proposal Verified</div>
                    <div className="text-white text-xl font-bold bg-slate-800/50 p-3 rounded border border-slate-700/50">
                      {receipt.proposalTitle}
                    </div>
                  </div>
                )}

                {receipt.optionText && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Recorded Choice</div>
                    <div className="text-emerald-300 font-medium bg-emerald-950/30 p-2 rounded truncate border border-emerald-500/30">
                      {receipt.optionText}
                    </div>
                  </div>
                )}

                {receipt.fee !== null && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Network Fee Charged</div>
                    <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center gap-2">
                      {receipt.fee} stroops
                      <span className="text-slate-500 text-sm">({formatXLM(receipt.fee)} XLM)</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Blockchain Transaction Hash</div>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded hover:border-slate-700 transition-colors group">
                    <span className="text-cyan-400 font-mono text-sm truncate flex-1">
                      {receipt.txHash}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        title="View on Explorer"
                        className="p-1.5 hover:bg-slate-800 rounded text-cyan-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-800/50">
                  <div className="text-xs text-slate-500 font-mono">
                    Ledger Timestamp: {receipt.timestamp ? new Date(receipt.timestamp).toLocaleString() : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
