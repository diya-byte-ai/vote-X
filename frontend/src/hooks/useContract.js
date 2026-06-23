import { useState, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import albedo from '@albedo-link/intent';
import { useWallet } from './useWallet';

const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = (import.meta.env.VITE_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET).replace(/['"]/g, "");
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';

export const useContract = () => {
  const { address, setNetworkFee, activeWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const getServer = useCallback(() => {
    return new StellarSdk.rpc.Server(RPC_URL);
  }, []);

  const simulateReadOnly = async (method, args = []) => {
    if (!CONTRACT_ID) return null;
    try {
      const server = getServer();
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      // Dummy source for simulation
      const source = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      let tx = new StellarSdk.TransactionBuilder(source, { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(contract.call(method, ...args))
        .setTimeout(30)
        .build();
      
      const simulation = await server.simulateTransaction(tx);
      if (StellarSdk.rpc.Api.isSimulationSuccess(simulation)) {
        return StellarSdk.scValToNative(simulation.result.retval);
      }
    } catch (e) {
      console.warn(`[Votex] Read-only call failed for ${method}:`, e);
    }
    return null;
  };

  const submitAndPoll = async (server, signedTx) => {
    const res = await server.sendTransaction(signedTx);
    if (res.status === "ERROR") {
      throw new Error("Transaction submission failed: " + JSON.stringify(res.errorResultXdr || res));
    }
    
    let status = res.status;
    let txResponse;
    
    // Poll until not pending
    while (status === "PENDING" || status === "NOT_FOUND") {
      await new Promise(r => setTimeout(r, 2000));
      txResponse = await server.getTransaction(res.hash);
      status = txResponse.status;
    }
    
    if (status !== "SUCCESS") {
      throw new Error(`Transaction failed on-chain with status: ${status}`);
    }
    return res;
  };

  const mapProposal = p => ({
    ...p,
    id: Number(p.id),
    start_time: Number(p.start_time),
    deadline: Number(p.deadline),
    total_votes: Number(p.total_votes),
    quorum: Number(p.quorum),
    vote_counts: Array.isArray(p.vote_counts) ? p.vote_counts.map(Number) : [],
    min_balance: p.min_balance ? Number(p.min_balance) : 0
  });

  const getActiveProposals = useCallback(async () => {
    // True Live Implementation
    setLoading(true);
    try {
      const res = await simulateReadOnly('get_active_proposals');
      if (Array.isArray(res)) {
        return res.map(mapProposal);
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getClosedProposals = useCallback(async () => {
    try {
      const res = await simulateReadOnly('get_closed_proposals');
      if (Array.isArray(res)) {
          return res.map(mapProposal);
      }
      return [];
    } catch (e) {
      return [];
    }
  }, []);

  const getProposal = useCallback(async (id) => {
    const res = await simulateReadOnly('get_proposal', [StellarSdk.nativeToScVal(id, { type: 'u64' })]);
    if (res) {
        return mapProposal(res);
    }
    return null;
  }, []);

  const hasVoted = useCallback(async (proposalId) => {
    if (!address) return null;
    
    // Layer 1: localStorage fast check
    const localKey = `voted_${address}_${proposalId}`;
    const localRecord = localStorage.getItem(localKey);
    if (localRecord) return JSON.parse(localRecord);

    // Layer 2: Contract query (live mode only)
    if (CONTRACT_ID) {
      try {
        const addrScVal = new StellarSdk.Address(address).toScVal();
        const propIdScVal = StellarSdk.nativeToScVal(proposalId, { type: 'u64' });
        
        const result = await simulateReadOnly('get_vote', [addrScVal, propIdScVal]);
        
        // get_vote returns Option<u32> (which translates to number or undefined/null)
        if (result !== null && result !== undefined) {
          return { choice: result, txHash: null, timestamp: null };
        }
      } catch (e) {
        console.warn("[Votex] hasVoted contract query failed:", e);
      }
    }
    return null;
  }, [address]);

  const createProposal = async (title, desc, startTime, deadline, options, quorum, category, minXlmStr) => {
    if (!CONTRACT_ID || !address) throw new Error("Missing contract or wallet");
    setLoading(true);
    try {
      const server = getServer();
      const accountInfo = await server.getAccount(address);
      const account = new StellarSdk.Account(address, accountInfo.sequenceNumber());
      const contract = new StellarSdk.Contract(CONTRACT_ID);

      const optionsScVal = StellarSdk.xdr.ScVal.scvVec(
        options.map(opt => StellarSdk.nativeToScVal(opt, { type: 'string' }))
      );
      
      const minXlm = minXlmStr ? BigInt(minXlmStr) : BigInt(0);

      let tx = new StellarSdk.TransactionBuilder(account, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(contract.call('create_proposal', 
          StellarSdk.nativeToScVal(title, { type: 'string' }),
          StellarSdk.nativeToScVal(desc, { type: 'string' }),
          StellarSdk.nativeToScVal(startTime, { type: 'u64' }),
          StellarSdk.nativeToScVal(deadline, { type: 'u64' }),
          optionsScVal,
          StellarSdk.nativeToScVal(quorum, { type: 'u64' }),
          StellarSdk.nativeToScVal(category, { type: 'string' }),
          StellarSdk.nativeToScVal(minXlm, { type: 'i128' })
        ))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      let signedTxXdr;

      if (activeWallet === 'Albedo') {
        const res = await albedo.tx({
          xdr: preparedTx.toXDR(),
          network: NETWORK_PASSPHRASE
        });
        signedTxXdr = res.signed_envelope_xdr;
      } else {
        signedTxXdr = await signTransaction(preparedTx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        if (typeof signedTxXdr !== 'string') {
          if (signedTxXdr && signedTxXdr.error) throw new Error(signedTxXdr.error);
          if (signedTxXdr && signedTxXdr.signedTxXdr) {
            signedTxXdr = signedTxXdr.signedTxXdr;
          } else {
            throw new Error("Freighter object: " + JSON.stringify(signedTxXdr));
          }
        }
      }

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
      
      const res = await submitAndPoll(server, signedTx);
      setNetworkFee?.(10000);
      return {
        txHash: res.hash,
        fee: 10000,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error("Create Proposal Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const vote = async (proposalId, optionIdx, optionText) => {
    if (!CONTRACT_ID || !address) throw new Error("Missing contract or wallet");
    setLoading(true);
    try {
      const server = getServer();
      const accountInfo = await server.getAccount(address);
      const account = new StellarSdk.Account(address, accountInfo.sequenceNumber());
      const contract = new StellarSdk.Contract(CONTRACT_ID);

      let baseTx = new StellarSdk.TransactionBuilder(account, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(contract.call('vote', 
          new StellarSdk.Address(address).toScVal(),
          StellarSdk.nativeToScVal(proposalId, { type: 'u64' }),
          StellarSdk.nativeToScVal(optionIdx, { type: 'u32' }),
          StellarSdk.nativeToScVal("", { type: 'string' }),
        ))
        .setTimeout(30)
        .build();

      const computedBaseHash = baseTx.hash().toString('hex');

      // Second pass: Inject the generated real tx hash of the underlying payload to fulfill the smart contract parameter
      // Re-initialize account because the first .build() incremented the sequence number internally!
      const account2 = new StellarSdk.Account(address, accountInfo.sequenceNumber());
      let tx = new StellarSdk.TransactionBuilder(account2, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(contract.call('vote', 
          new StellarSdk.Address(address).toScVal(),
          StellarSdk.nativeToScVal(proposalId, { type: 'u64' }),
          StellarSdk.nativeToScVal(optionIdx, { type: 'u32' }),
          StellarSdk.nativeToScVal(computedBaseHash, { type: 'string' }),
        ))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);

      let signedTxXdr;
      if (activeWallet === 'Albedo') {
        const res = await albedo.tx({
          xdr: preparedTx.toXDR(),
          network: NETWORK_PASSPHRASE
        });
        signedTxXdr = res.signed_envelope_xdr;
      } else {
        signedTxXdr = await signTransaction(preparedTx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        if (typeof signedTxXdr !== 'string') {
          if (signedTxXdr && signedTxXdr.error) throw new Error(signedTxXdr.error);
          if (signedTxXdr && signedTxXdr.signedTxXdr) {
            signedTxXdr = signedTxXdr.signedTxXdr;
          } else {
            throw new Error("Freighter object: " + JSON.stringify(signedTxXdr));
          }
        }
      }

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
      
      const res = await submitAndPoll(server, signedTx);
      setNetworkFee?.(10000);
      
      const receipt = {
        txHash: res.hash,
        fee: 10000,
        timestamp: Date.now(),
        choice: optionText || String(optionIdx)
      };

      // Set Layer 1 cache locally
      localStorage.setItem(`voted_${address}_${proposalId}`, JSON.stringify(receipt));

      return receipt;
    } catch (err) {
      console.error("Vote Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStats = useCallback(async () => {
    const res = await simulateReadOnly('get_stats');
    if (res && Array.isArray(res)) {
      return { proposals: Number(res[0]), totalVotes: Number(res[1]) };
    }
    return { proposals: 0, totalVotes: 0 };
  }, []);

  const closeProposal = async (proposalId) => {
    if (!CONTRACT_ID || !address) throw new Error("Missing contract or wallet");
    setLoading(true);
    try {
      const server = getServer();
      const accountInfo = await server.getAccount(address);
      const account = new StellarSdk.Account(address, accountInfo.sequenceNumber());
      const contract = new StellarSdk.Contract(CONTRACT_ID);

      let tx = new StellarSdk.TransactionBuilder(account, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(contract.call('close_proposal', 
          StellarSdk.nativeToScVal(proposalId, { type: 'u64' })
        ))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);

      let signedTxXdr;
      if (activeWallet === 'Albedo') {
        const res = await albedo.tx({
          xdr: preparedTx.toXDR(),
          network: NETWORK_PASSPHRASE
        });
        signedTxXdr = res.signed_envelope_xdr;
      } else {
        signedTxXdr = await signTransaction(preparedTx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        if (typeof signedTxXdr !== 'string') {
          if (signedTxXdr && signedTxXdr.error) throw new Error(signedTxXdr.error);
          if (signedTxXdr && signedTxXdr.signedTxXdr) {
            signedTxXdr = signedTxXdr.signedTxXdr;
          } else {
            throw new Error("Freighter object: " + JSON.stringify(signedTxXdr));
          }
        }
      }

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
      
      const res = await submitAndPoll(server, signedTx);
      setNetworkFee?.(10000);
      return {
        txHash: res.hash,
        fee: 10000,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error("Close Proposal Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const donateXLM = async (amountXLM, destinationAddress = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF") => {
    if (!address) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const server = getServer();
      const account = await server.getAccount(address);
      
      let tx = new StellarSdk.TransactionBuilder(account, { fee: '10000', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: StellarSdk.Asset.native(),
          amount: amountXLM.toString()
        }))
        .setTimeout(30)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      let signedTxXdr;
      if (activeWallet === 'Albedo') {
        const res = await albedo.tx({ xdr: preparedTx.toXDR(), network: NETWORK_PASSPHRASE });
        signedTxXdr = res.signed_envelope_xdr;
      } else {
        signedTxXdr = await signTransaction(preparedTx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
        if (typeof signedTxXdr !== 'string') {
          if (signedTxXdr && signedTxXdr.error) throw new Error(signedTxXdr.error);
          signedTxXdr = signedTxXdr.signedTxXdr || signedTxXdr;
        }
      }

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
      const res = await submitAndPoll(server, signedTx);
      
      return { txHash: res.hash };
    } catch (err) {
      console.error("Donate Error:", err);
      // Ensure specific errors bubble up for the UI to display, handling 3 distinct error types required by Level 2.
      const msg = err.message || JSON.stringify(err);
      if (msg.includes("User declined") || msg.includes("reject")) throw new Error("Error 1: User Rejected Transaction");
      if (msg.includes("Timeout") || msg.includes("Network error") || msg.includes("Failed to fetch")) throw new Error("Error 2: Wallet API / Network Unavailable");
      if (msg.includes("op_underfunded") || msg.includes("tx_insufficient_balance")) throw new Error("Error 3: Insufficient XLM Funds");
      if (msg.includes("not found") || msg.includes("op_no_destination")) throw new Error("Error 4: Destination Account Not Found on Ledger!");
      throw new Error(`Transaction Failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    getActiveProposals,
    getClosedProposals,
    getProposal,
    createProposal,
    closeProposal,
    hasVoted,
    vote,
    getStats,
    donateXLM,
    loading
  };
};
