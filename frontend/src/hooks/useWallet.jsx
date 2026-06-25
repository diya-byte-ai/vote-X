import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { requestAccess, setAllowed, isAllowed, getAddress } from '@stellar/freighter-api';
import albedo from '@albedo-link/intent';

const WalletContext = createContext(null);


export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [networkFee, setNetworkFee] = useState(100); // stroops, default low fee
  const [balance, setBalance] = useState(null);
  const [activeWallet, setActiveWallet] = useState(localStorage.getItem('activeWallet'));
  
  // The Admin wallet.
  const ADMIN_WALLET = import.meta.env.VITE_ADMIN_ADDRESS || "";

  const shortAddress = typeof address === 'string' && address.length > 8 
    ? `${address.slice(0, 4)}...${address.slice(-4)}` 
    : '';

  const fetchBalance = useCallback(async (pubKey) => {
    try {
      // Use Horizon API for standard XLM balances
      // eslint-disable-next-line no-undef
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${pubKey}`);
      if (!res.ok) {
        setBalance("0.00");
        return;
      }
      const data = await res.json();
      const native = data.balances.find(b => b.asset_type === 'native');
      if (native) {
        setBalance(parseFloat(native.balance).toFixed(2));
      } else {
        setBalance("0.00");
      }
    } catch (e) {
      console.error("Failed to fetch balance", e);
      setBalance("0.00");
    }
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const storedWallet = localStorage.getItem('activeWallet');
      if (storedWallet === 'Freighter') {
        const allowedRes = await isAllowed();
        if (allowedRes && allowedRes.isAllowed) {
          const addrRes = await getAddress();
          if (addrRes && addrRes.address) {
            setAddress(addrRes.address);
            setIsAdmin(addrRes.address === import.meta.env.VITE_ADMIN_ADDRESS);
            setActiveWallet('Freighter');
            fetchBalance(addrRes.address);
          }
        }
      } else if (storedWallet === 'Albedo') {
        const storedAddress = localStorage.getItem('albedoAddress');
          if (storedAddress) {
            setAddress(storedAddress);
            setIsAdmin(storedAddress === import.meta.env.VITE_ADMIN_ADDRESS);
            setActiveWallet('Albedo');
            fetchBalance(storedAddress);
          }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsWalletReady(true);
    }
  }, [fetchBalance]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = async (walletType = 'Freighter') => {
    setIsConnecting(true);
    try {
      if (walletType === 'Freighter') {
        await setAllowed();
        const info = await requestAccess();
        if (info && !info.error) {
          const pubKey = typeof info === 'string' ? info : (info.address || info.publicKey || "");
          if (!pubKey) throw new Error("No public key returned from wallet");
          setAddress(pubKey);
          setIsAdmin(pubKey === import.meta.env.VITE_ADMIN_ADDRESS);
          setActiveWallet('Freighter');
          localStorage.setItem('activeWallet', 'Freighter');
          fetchBalance(pubKey);
        } else {
          throw new Error(info.error || "Connection refused");
        }
      } else if (walletType === 'Albedo') {
        const token = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const res = await albedo.publicKey({
          token
        });
        if (res && res.pubkey) {
          setAddress(res.pubkey);
          setIsAdmin(res.pubkey === import.meta.env.VITE_ADMIN_ADDRESS);
          setActiveWallet('Albedo');
          localStorage.setItem('activeWallet', 'Albedo');
          localStorage.setItem('albedoAddress', res.pubkey);
          fetchBalance(res.pubkey);
        } else {
          throw new Error("Connection refused");
        }
      }
    } catch (e) {
      console.error("Connection failed", e);
      throw e;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsAdmin(false);
    setActiveWallet(null);
    setBalance(null);
    localStorage.removeItem('activeWallet');
    localStorage.removeItem('albedoAddress');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <WalletContext.Provider value={{
      address,
      isAdmin,
      isWalletReady,
      isConnecting,
      isModalOpen,
      shortAddress,
      networkFee,
      activeWallet,
      balance,
      ADMIN_WALLET,
      openModal,
      closeModal,
      connect, 
      disconnect,
      setNetworkFee
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
