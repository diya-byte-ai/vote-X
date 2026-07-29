// Stellar amounts are stored on-chain in stroops (1 XLM = 10,000,000 stroops).
// Anything shown to a voter must be converted before it gets an "XLM" label.
export const STROOPS_PER_XLM = 10000000;

export const stroopsToXLM = (stroops) => Number(stroops || 0) / STROOPS_PER_XLM;

// Formats a stroop amount as a human XLM string, trimming trailing zeros
// so a 5 XLM requirement reads "5" and not "5.0000000".
export const formatXLM = (stroops, digits = 7) => {
  const xlm = stroopsToXLM(stroops);
  if (!Number.isFinite(xlm)) return '0';
  return xlm.toFixed(digits).replace(/\.?0+$/, '') || '0';
};
