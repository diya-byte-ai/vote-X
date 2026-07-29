// Maps the contract's Error enum (contract/src/lib.rs) onto messages a voter
// can act on. The numbers must stay in step with that enum.
const CONTRACT_ERRORS = {
  1: 'This contract has already been initialized.',
  2: 'You have already voted on this proposal. Each wallet may vote once.',
  3: 'Your wallet does not hold the minimum XLM balance this proposal requires.',
  4: 'This action requires the admin wallet.',
  5: 'The admin wallet cannot vote on its own proposals.',
  6: 'Voting has not opened for this proposal yet.',
  7: 'Voting closed when the deadline passed.',
  8: 'This proposal has been closed by the admin.',
  9: 'A proposal cannot be closed before its deadline.',
  10: 'That voting option does not exist on this proposal.',
  11: 'That proposal could not be found on-chain.',
};

// Soroban surfaces contract failures as "Error(Contract, #N)" inside the
// message or the simulation payload.
const CONTRACT_CODE = /Error\(Contract,\s*#(\d+)\)/;

export const parseTxError = (err) => {
  // An error that already carries a message written for the user wins:
  // the confirmation timeout, for instance, includes the tx hash to check.
  if (err?.userMessage) return err.userMessage;

  const msg =
    typeof err === 'string'
      ? err
      : err?.message || (() => { try { return JSON.stringify(err); } catch { return String(err); } })();

  const contractMatch = msg.match(CONTRACT_CODE);
  if (contractMatch) {
    const code = Number(contractMatch[1]);
    if (CONTRACT_ERRORS[code]) return CONTRACT_ERRORS[code];
    return `The contract rejected this transaction (error #${code}).`;
  }

  // Wallet and network level failures never reach the contract at all.
  if (/user declined|user rejected|reject|denied|cancell?ed/i.test(msg)) {
    return 'You cancelled the request in your wallet. Nothing was submitted.';
  }
  if (/op_underfunded|tx_insufficient_balance|insufficient/i.test(msg)) {
    return 'Not enough XLM in your wallet to cover the network fee.';
  }
  if (/timed out|timeout|failed to fetch|network error|networkerror/i.test(msg)) {
    return 'Could not reach the Stellar network. Check your connection and try again.';
  }
  if (/account not found|op_no_destination|not found/i.test(msg)) {
    return 'This account does not exist on the Stellar testnet yet. Fund it first.';
  }
  if (/freighter|albedo/i.test(msg)) {
    return 'Your wallet extension did not return a signature. Unlock it and try again.';
  }

  return `Transaction failed: ${msg}`;
};

export default parseTxError;
