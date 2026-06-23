import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from './hooks/useWallet';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BackgroundVideo from './components/BackgroundVideo';

import Navbar from './components/Navbar';
import ConnectModal from './components/ConnectModal';
import AdminGuard from './components/AdminGuard';
import { Toaster } from 'react-hot-toast';

// User Pages
import Home from './pages/Home';
import Proposals from './pages/Proposals';
import ProposalDetail from './pages/ProposalDetail';
import MyVotes from './pages/MyVotes';
import Results from './pages/Results';
import Verify from './pages/Verify';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import CreateProposal from './pages/admin/CreateProposal';
import ManageProposals from './pages/admin/ManageProposals';
import AdminResults from './pages/admin/AdminResults';



const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const { isAdmin } = useWallet();

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
        <BackgroundVideo />
        <div 
          className="absolute inset-0 bg-slate-950/75 pointer-events-none" 
          style={{
            backgroundImage: 'radial-gradient(at 0% 0%, rgba(138, 43, 226, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0, 255, 255, 0.1) 0px, transparent 50%)'
          }}
        />
      </div>
      <Toaster position="top-center" />
      <div className="flex flex-col min-h-screen relative z-10">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/proposals" element={<PageWrapper><Proposals /></PageWrapper>} />
            <Route path="/proposals/:id" element={<PageWrapper><ProposalDetail /></PageWrapper>} />
            <Route path="/my-votes" element={<PageWrapper><MyVotes /></PageWrapper>} />
            <Route path="/results" element={<PageWrapper><Results /></PageWrapper>} />
            <Route path="/verify" element={<PageWrapper><Verify /></PageWrapper>} />
            
            <Route path="/admin" element={<AdminGuard><PageWrapper><AdminDashboard /></PageWrapper></AdminGuard>} />
            <Route path="/admin/create" element={<AdminGuard><PageWrapper><CreateProposal /></PageWrapper></AdminGuard>} />
            <Route path="/admin/manage" element={<AdminGuard><PageWrapper><ManageProposals /></PageWrapper></AdminGuard>} />
            <Route path="/admin/results" element={<AdminGuard><PageWrapper><AdminResults /></PageWrapper></AdminGuard>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <ConnectModal />
    </>
  );
}
