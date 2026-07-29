# Votex

**A Decentralized Voting & Governance Platform built on the Stellar Blockchain**

Votex enables secure, transparent, and verifiable voting for elections, surveys, referendums, policy decisions, and budget approvals. Powered by Stellar and Soroban Smart Contracts, every vote is recorded on-chain, ensuring trust, transparency, and tamper-proof governance.

![Landing Page](screenshots/front_page.png)

---

## 🚀 Live Demo

**Demo Link:** https://votex-ontc.vercel.app/

## 🎥 Demo Video

Watch the full demo on YouTube: [youtube](https://youtu.be/4sjdBQs5QQQ)

## 📝 Feedback

- **Feedback Form:** [google form](https://docs.google.com/forms/d/e/1FAIpQLSe-B4efWaPdAbGUGMjsC6efA-RElUZqU89ezGcNSnTR-1S58Q/viewform)
- **Feedback Sheet:** [google sheet](https://docs.google.com/spreadsheets/d/1krPuOkLOxf-UMphvMwni4La_BzpAXSM18M5N4_xdPrE/edit?usp=sharing)

---

## 📜 Contract Information

| Item | Value |
|------|-------|
| Network | Stellar Testnet |
| Contract ID | `CBMAFILZK4YTE2ZTDFOVLQZTFXG6SP23DXGGNZV6XV77JIG4UMNV4PUI` |
| TX Hash | [view on stellar lab](https://lab.stellar.org/transaction/dashboard?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;&txDashboard$transactionHash=cac334fdbcff7acd46738c5ce32d9bb5d667518dcfd1d67c65015f28012cb628;;) |
| Stellar Explorer | [View Contract](https://stellar.expert/explorer/testnet/contract/CBMAFILZK4YTE2ZTDFOVLQZTFXG6SP23DXGGNZV6XV77JIG4UMNV4PUI?filter=history) |

> ⚠️ **Redeploy required.** The storage-layout improvement in commit [`9e61666`](https://github.com/diya-byte-ai/vote-X/commit/9e6166691ea82aea14c985bcbf3e43e514782d7b) moves proposals and vote records from instance storage to persistent storage. The contract ID above refers to the pre-improvement deployment. Redeploy with the Stellar CLI and update this table with the new contract ID and explorer link.

---

## 🧾 Improvement Summary

After the judges' review, feedback was collected from onboarded users through the Google Form linked above. Every reported issue was reproduced in the code, fixed, and committed individually so that each improvement is traceable to a single commit.

**11 users onboarded · 10 issues reported · 10 issues fixed · 5/5 contract tests passing**

| # | Improvement | Layer | Commit |
|---|-------------|-------|--------|
| 1 | Minimum balance requirement was rendered in stroops but labelled XLM, showing a 5 XLM gate as "50000000 XLM". Added a shared stroops→XLM formatter. | Frontend | [`c3337c9`](https://github.com/diya-byte-ai/vote-X/commit/c3337c9d0583c81c0d10d2020daf9c3a13ebab83) |
| 2 | Voting history was rebuilt from `localStorage`, so it vanished on another browser or device. Now read from the contract via `get_voter_history`. | Frontend | [`6dd21cb`](https://github.com/diya-byte-ai/vote-X/commit/6dd21cb6792212b31bbe931cbba9e0c17286e9d3) |
| 3 | The Verify page only searched this browser's cache, so another user's transaction hash always returned "Record Not Found". Now resolved against the Soroban RPC and the contract. | Frontend | [`c5b04de`](https://github.com/diya-byte-ai/vote-X/commit/c5b04decb3c8b505120151767d2c0e685d716ccf) |
| 4 | Cast Vote stayed enabled after the deadline, so voters signed and paid for transactions that reverted. The voting window is now enforced in the UI and ticks live. | Frontend | [`49d5d70`](https://github.com/diya-byte-ai/vote-X/commit/49d5d705114019d47c0cf1b01c0505c0145139c9) |
| 5 | Every failure showed "Transaction failed or rejected". Contract error codes 1–11 plus wallet and network failures are now decoded into actionable messages. | Frontend | [`dfa6bca`](https://github.com/diya-byte-ai/vote-X/commit/dfa6bca24137820cecb87c0e55ba009a8168d468) |
| 6 | Confirmation polling looped forever on a stalled transaction. Now bounded at 60s with a message naming the hash to check before retrying. | Frontend | [`a539f5e`](https://github.com/diya-byte-ai/vote-X/commit/a539f5e52ac8591f30ca84df9ba5332c30808e5f) |
| 7 | The signing modal promised "~2,000 stroops" while receipts reported a hardcoded 10,000. Receipts now report the fee the network actually charged. | Frontend | [`23ecca7`](https://github.com/diya-byte-ai/vote-X/commit/23ecca79c418cb480a0ce11cb8ccc7fc64fe7c14) |
| 8 | Active Proposals had no way to find a specific proposal. Added search, category filter and sorting. | Frontend | [`b8cc4b1`](https://github.com/diya-byte-ai/vote-X/commit/b8cc4b1884666212fd34c7779fedf382e13117e2) |
| 9 | Tied results silently crowned the lowest-indexed option. `get_results` now returns `is_tie` and the UI reports a tie. | Contract + Frontend | [`00bf332`](https://github.com/diya-byte-ai/vote-X/commit/00bf332403ee1f91bed646dbecd5e838ab57971b) |
| 10 | Every proposal and vote shared one bounded instance-storage entry and one TTL. Each now has its own persistent entry with TTL renewal. | Contract | [`9e61666`](https://github.com/diya-byte-ai/vote-X/commit/9e6166691ea82aea14c985bcbf3e43e514782d7b) |

---

## 👥 Users Onboarded

> **Note:** replace the placeholder Name / Email / Wallet Address cells with the actual responses from the [feedback sheet](https://docs.google.com/spreadsheets/d/1krPuOkLOxf-UMphvMwni4La_BzpAXSM18M5N4_xdPrE/edit?usp=sharing). The Feedback Summary column reflects the issues that were reported and reproduced.

| User ID | Name | Email | Wallet Address | Feedback Summary |
|---------|------|-------|----------------|------------------|
| U01 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | A proposal showed "Minimum Balance Required: 50000000 XLM" when the admin had set 5 XLM. The unit is wrong and it discouraged voting. |
| U02 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Voted on phone, then opened My Voting History on a laptop with the same wallet and it said "You haven't voted yet". |
| U03 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Pasted a friend's transaction hash into Verify and got "Record Not Found". It only finds your own votes, so it isn't public verification. |
| U04 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | The countdown had ended but Cast Vote was still active. Signed in Freighter, paid the fee, and only then it failed. |
| U05 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Every failure shows "Transaction failed or rejected". Could not tell whether I had already voted, lacked XLM, or cancelled. |
| U06 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | The page got stuck on "Submitting to Chain…" forever and I had to reload, unsure whether my vote went through. |
| U07 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | The confirm popup said estimated fee ~2,000 stroops but the receipt said 10,000 stroops. |
| U08 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | No search or filter on Active Proposals. Had to scroll and read every card to find the election I wanted. |
| U09 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Two options had the same number of votes but one was still declared the Winner with a green bar. |
| U10 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | After many test proposals and votes the app started failing to load proposals, as if the contract keeps everything in one storage entry. |
| U11 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | No problems encountered. Connected Freighter, voted successfully and the transaction hash was verifiable on Stellar Expert. |

---

## 🛠️ Feedback Implementation

| User ID | Name | Email | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID |
|---------|------|-------|----------------|------------------|------------------|---------------|
| U01 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Minimum balance shown as "50000000 XLM" instead of 5 XLM | Added a shared stroops→XLM formatter and applied it to the eligibility badge | [`c3337c9`](https://github.com/diya-byte-ai/vote-X/commit/c3337c9d0583c81c0d10d2020daf9c3a13ebab83) |
| U02 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Voting history disappeared on a different device | History now read from the contract via a new `getVoterHistory()`; localStorage only enriches the tx hash and fee | [`6dd21cb`](https://github.com/diya-byte-ai/vote-X/commit/6dd21cb6792212b31bbe931cbba9e0c17286e9d3) |
| U03 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Could not verify another user's transaction hash | Verify now queries the Soroban RPC for a hash and `get_voter_history` for an address, with input validation | [`c5b04de`](https://github.com/diya-byte-ai/vote-X/commit/c5b04decb3c8b505120151767d2c0e685d716ccf) |
| U04 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Paid a fee voting on an already-expired proposal | Voting window derived from `start_time`, `deadline` and `is_closed`, ticking every second; options disabled and the state explained | [`49d5d70`](https://github.com/diya-byte-ai/vote-X/commit/49d5d705114019d47c0cf1b01c0505c0145139c9) |
| U05 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | One generic message for every kind of failure | Added `parseTxError()` decoding `Error(Contract, #N)` into the matching message, plus wallet/network cases | [`dfa6bca`](https://github.com/diya-byte-ai/vote-X/commit/dfa6bca24137820cecb87c0e55ba009a8168d468) |
| U06 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | UI hung indefinitely on "Submitting to Chain…" | Polling bounded to 60s, tolerating transient RPC failures, and reports the tx hash to check before retrying | [`a539f5e`](https://github.com/diya-byte-ai/vote-X/commit/a539f5e52ac8591f30ca84df9ba5332c30808e5f) |
| U07 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Fee estimate contradicted the fee on the receipt | `feeCharged` read off the transaction result for receipts; the modal quotes the single max-fee constant | [`23ecca7`](https://github.com/diya-byte-ai/vote-X/commit/23ecca79c418cb480a0ce11cb8ccc7fc64fe7c14) |
| U08 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | No way to find a proposal in a long list | Added search across title/description/options, a category filter built from on-chain data, and three sort orders | [`b8cc4b1`](https://github.com/diya-byte-ai/vote-X/commit/b8cc4b1884666212fd34c7779fedf382e13117e2) |
| U09 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | A tied result still declared a winner | `get_results` returns `is_tie`; tied options render in amber and the outcome reads "Tie: A / B". Two contract tests added | [`00bf332`](https://github.com/diya-byte-ai/vote-X/commit/00bf332403ee1f91bed646dbecd5e838ab57971b) |
| U10 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | Proposals stopped loading after heavy testing | Proposals and vote records moved to per-entry persistent storage with 90-day TTL renewal; instance storage keeps only admin, token and count | [`9e61666`](https://github.com/diya-byte-ai/vote-X/commit/9e6166691ea82aea14c985bcbf3e43e514782d7b) |
| U11 | *&lt;Name&gt;* | *&lt;email&gt;* | *&lt;G…&gt;* | No problems encountered | No change required. Positive path confirmed working; retained as a regression baseline | — |

---

## ✨ Features

### 🗳️ Decentralized Voting
Elections · Referendums · Surveys · Policy Votes · Budget Approvals

### 🔒 Blockchain Verification
- Every proposal recorded on Stellar
- Every vote stored on-chain
- Publicly verifiable transactions
- Immutable voting records

### 👨‍💼 Admin Panel
- Create governance proposals
- Define voting duration
- Add multiple voting options
- Set voter eligibility requirements
- Monitor voting participation and proposal history

### 👤 Voter Dashboard
- View active proposals with search, category filter and sorting
- Participate in governance decisions
- Track voting history, read directly from the contract
- Verify voting transactions
- View final election results

### 💳 Wallet Integration
Freighter Wallet · Albedo Wallet

### 📊 Transparent Results
- Automatic vote counting with explicit tie detection
- Winner determination and quorum reporting
- Percentage-based result display
- Total participation statistics

### 🔍 Vote Verification
- Verify any wallet address or transaction hash against the network
- Retrieve blockchain voting records for any voter
- Independent vote validation

### 📱 Responsive UI
Desktop friendly · Mobile responsive · Accessible controls

---

## 🛠️ Technology Stack

### 1. Smart Contract (Backend) — `/contract`

- **Language:** Rust 🦀
- **SDK:** Soroban SDK (v20.0.0)
- **Storage:** Persistent storage per proposal and per vote, with TTL renewal on write
- **Testing:** Unit test suite using `soroban_sdk::testutils` (5 tests)

### 2. Frontend Application — `/frontend`

- **Languages:** JavaScript (ES6+), HTML5, CSS3 (Vanilla + Tailwind CSS)
- **Framework:** React 19 powered by Vite (v8.0.4)
- **Styling:** Tailwind CSS (v4.2.2) with Framer Motion (v12.38.0) for glassmorphism UI & micro-animations
- **Integrations:**
  - `@stellar/stellar-sdk` (v15.0.1) — transaction building & Horizon/RPC interface
  - `@stellar/freighter-api` (v6.0.1) — Freighter Wallet integration
  - `@albedo-link/intent` (v0.13.0) — Albedo Wallet integration
  - `recharts` (v3.8.1) — voting data visualizations
  - `lucide-react` (v1.8.0) — outline icons

---

## 🚀 Local Run & Setup Guide

### Smart Contract

```bash
cd contract

# Run Rust unit tests
cargo test

# Build the release WASM
cargo build --target wasm32-unknown-unknown --release
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the local dev server
npm run dev
```

The frontend reads `VITE_CONTRACT_ID`, `VITE_ADMIN_ADDRESS`, `VITE_RPC_URL` and `VITE_NETWORK_PASSPHRASE` from a `.env` file in `/frontend`.

---

## ⚙️ CI/CD Pipeline

Votex uses **GitHub Actions** for Continuous Integration on every push and pull request to `main`. The pipeline runs two jobs in parallel:

| Job | Scope | Steps |
|-----|-------|-------|
| **Contract Tests** | `/contract` (Rust/Soroban) | Run unit tests (`cargo test --features testutils`) → build release WASM (`wasm32-unknown-unknown`) |
| **Frontend Lint & Build** | `/frontend` (React/Vite) | `npm ci` → ESLint → production build (`npm run build`) |

**Deployment (CD):**
- **Frontend** is built and verified through continuous integration on every push to `main`.
- **Smart contract** is deployed to **Stellar Testnet** manually using the Stellar CLI. On-chain contract deployment is kept manual by design, since re-deploying changes the contract ID and requires a secret signing key.

This gives full automated verification (CI) for both layers while keeping blockchain deployment safe and controlled.

---

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](screenshots/front_page.png)

### 👛 Wallet Selection
![Wallet Options](screenshots/wallet_option.png)

### 📝 Create Proposal
![Create Proposal](screenshots/working1.png)

### 📱 Mobile Responsive View
![Mobile View](screenshots/ph_view.png)

### 🗳️ Successful Vote Submission
![Successful Vote](screenshots/successfull_vote.png)

### 🔗 Transaction Hash Generated
![Transaction Hash](screenshots/tx_hash.png)

### 📊 Voting Results
![Voting Results](screenshots/vote_result.png)

---

## 🌍 Real-World Use Cases

| Sector | Applications |
|--------|--------------|
| 🎓 **Educational Institutions** | Student elections · Faculty voting · Committee selection |
| 🏢 **Organizations** | Governance decisions · Board voting · Internal surveys |
| 🌐 **Communities & DAOs** | Proposal approvals · Treasury decisions · Community referendums |
| 💼 **Businesses** | Policy approvals · Shareholder voting · Budget allocation |
