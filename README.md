# KaushalSetu RPL | AI-Assisted Skill Assessment Tool
> **Smart India Hackathon (SIH) 2026 • Problem Statement 26242**  
> **AI-Assisted Skill Assessment Tool for Recognition of Prior Learning (RPL)**  
> *Final Integration, Testing & Demonstration Guide*

---

## 🌟 1. Project Purpose & Problem Statement

In India's workforce, over 90% of workers in vocational trades—such as electricians, welders, plumbers, garment makers, solar PV installers, and healthcare assistants—acquire exceptional trade skills through informal apprenticeships (*Ustad-Shagird*), family traditions, or years of practical site experience. However, because they lack formal academic degrees or government-recognized qualification certificates, they face systemic barriers to wage progression, bank loans, overseas migration, and formal sector employment.

The Ministry of Skill Development and Entrepreneurship (MSDE) and National Council for Vocational Education and Training (NCVET) conduct **Recognition of Prior Learning (RPL)** under the **National Skills Qualifications Framework (NSQF)** to assess and certify these competencies. 

### Core SIH 2026 Challenge (PS 26242)
Conventional RPL faces severe bottlenecks:
1. **Intake Barrier**: Informal craftspeople struggle to articulate their experiential skills in formal technical English terminology on complex online forms.
2. **Matching Complexity**: Mapping free-form informal work narratives to over 2,800 official NQR qualifications and hundreds of National Occupational Standards (NOS) is tedious and error-prone.
3. **Assessment Integrity & Burden**: Certified assessors must review heterogeneous evidence (photos, voice notes, employer letters) against rigid performance criteria (PCs) without objective tooling.
4. **Connectivity Gap**: Field testing centers and construction sites frequently lack stable internet connectivity.

### 🛡️ Responsible Assessment Standard: Human-in-the-Loop
> **Mandatory Principle**: AI assists with multi-modal evidence indexing, token-overlap candidate qualification matching, and vernacular voice transcription. **The system never automatically certifies a worker, never invents pass thresholds or criteria, and never replaces certified human judgment.** Only certified human assessors evaluate observed demonstrations against official standards and submit recommendations for authorised review.

---

## 🚀 2. Implemented Features

### 👷 Worker Experience (Accessible & Multilingual)
- **Vernacular Intake (Hindi & English)**: Complete internationalization resource framework with instant switching.
- **Voice-Assisted Experience Declaration**: Hands-free voice dictation powered by browser-native Web Speech API (`SpeechRecognition`) with accessible TTS readback. Fully paired with manual keyboard typing fallback.
- **Structured Skill Adder**: Dynamic capture of work activities, tools operated, and task frequency.
- **Evidence Management**: Upload work photographs, audio notes, and employer references with an enforced **5 MB safety ceiling** to prevent browser storage exhaustion.
- **Transparent Summary & PII Protection**: Summary review masking sensitive identifiers (e.g., `XXXX-XXXX-4819`), duplicate-submission guard on buttons, and local persistence.

### 🎯 Source-Grounded Qualification Matching
- **2,815 Catalog Search Engine**: Fast token-overlap and keyphrase matcher evaluating all 2,814 NQR spreadsheet qualifications and official Assessment Guide packages.
- **Transparent Advisory Scoring**: Advisory match percentage (35% threshold) with explicit matched keywords and disclaimer: *“Advisory match only. Does not confer certification.”*
- **Audit Flagging**: Automatically flags qualifications missing official codes, validity dates, or awarding body metadata.
- **Non-Hallucinatory Provenance**: Every suggestion links directly to its source file, sheet name, and row index.

### 🧑‍🏫 Certified Assessor Workbench
- **Candidate Dossier Review**: Filter queue by trade, status, and assigned assessor.
- **Qualification Confirmation**: Assessor selects and confirms the target QP with mandatory justification rationale.
- **Source-Derived Criteria Engine**: Displays all **146 official Performance Criteria (PCs)** extracted from Pages 16–26 of `Assessment_Guide.pdf.pdf` with exact page citations (e.g., `[PC10] Page 16`).
- **Provisional Rubric Engine**: For unverified qualifications, enforces a 4-tier rubric (`Not Assessed`, `Not Demonstrated`, `Partially Demonstrated`, `Demonstrated`) with clear provisional badges.
- **Evidence Linking**: Directly links candidate evidence files to specific performance criteria.
- **Draft & Resume Capability**: In-progress assessments persist locally in IndexedDB, surviving disconnection and page refreshes.
- **Authorised Submission**: Compiles assessment summaries and submits recommendations to the Scheme Coordinator.

### 🏛️ Scheme Coordinator & Admin Center
- **Dynamic Summary Dashboard**: Real-time KPI counts calculated dynamically from stored records (Total Applications, Intake Queue, In-Evaluation, Awaiting Sign-Off, Certified, and Unverified Qualifications).
- **Cryptographic Audit Log**: Auditable governance ledger recording actor names, actions, timestamps, and SHA-256 provenance hashes.
- **Multi-Filter Application Query**: Instant searching by candidate name, application ID, trade, status, and assigned assessor.
- **Qualification Data Review**: Inspects all 2,815 qualifications across 4 distinct statuses (`Extracted`, `Reviewed`, `Verified`, `Requires Review`).
- **Curricula Isolation**: Strict separation of 30h, 60h, 90h, and 120h Employability Skills curricula. Criteria and hours are never merged.
- **Non-Destructive Correction**: Coordinators can flag issues and update qualification records while preserving raw extracted values in provenance history.
- **Privacy-Compliant CSV Export**: Exports sanitized data omitting sensitive Aadhaar, private phone numbers, or raw evidence binaries.

### 📶 Offline Field Resilience & Progressive Web App (PWA)
- **PWA App Shell**: Configured `manifest.json` (theme `#0d9488`, `standalone`) and `sw.js` precaching app assets for offline launch.
- **IndexedDB Storage**: Two-tier persistence utilizing Dexie.js for offline worker drafts, assessor dossiers, and evidence metadata.
- **Field Offline Simulator**: Manual offline toggle in the top bar to simulate low-connectivity testing center environments.
- **Idempotent Sync Engine**: Queues actions locally and synchronizes upon reconnection without creating duplicate records.

---

## 💻 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19.2 (ESM) | Modern component architecture, Hooks, Context API |
| **Build Tool & Bundler** | Vite 8.3 | Lightning-fast HMR, ESM bundling, static asset processing |
| **Styling & Design System** | Tailwind CSS v4 | Mobile-first utility design, responsive 360px–430px viewports |
| **Offline Storage** | Dexie.js v4 (IndexedDB) + LocalStorage | Durable offline drafts, audit trails, and instant hydration |
| **Service Worker & PWA** | Web App Manifest + Vanilla SW | Offline application shell caching and network fallback |
| **Accessibility & Voice** | Native Web Speech API | Vernacular speech-to-text and text-to-speech without external API keys |
| **Icons & UI Symbols** | Lucide React | High-contrast, semantic SVG iconography |
| **Linter & Code Quality** | Oxlint v1.81 | High-speed Rust-based JavaScript/React linting |
| **Data Extraction Pipeline**| Python 3 (openpyxl, pypdfium2) | Deterministic PDF/Excel extraction into verified JSON schemas |

---

## 📁 4. Project Folder Structure

```
rpl/
├── data/                                 # Official NCVET / MSDE Source Documents
│   ├── NQR_Qualifications_Summary.xlsx.xlsx # Master NQR qualifications catalog (2,814 rows)
│   ├── Employability_Skills_30_Hours.pdf.pdf # 30h ES Curriculum (L2, 10 modules, 50 marks)
│   ├── Employability_Skills_60_Hours.pdf.pdf # 60h ES Curriculum (L3-4, 11 modules, 50 marks)
│   ├── Employability_Skills_90_Hours.pdf.pdf # 90h ES Curriculum (L5, 11 modules, 50 marks)
│   ├── Employability_Skills_120_Hours.pdf.pdf# 120h ES Curriculum (L5+, 11 modules, 100% marks)
│   └── Assessment_Guide.pdf.pdf          # Assessment Guide (Pages 16-26 criteria, 40:60 rubric)
│
├── public/                               # Static Web Assets & Offline Shell
│   ├── data/                             # Extracted JSON Datasets loaded by App
│   │   ├── qualifications_index.json     # Lightweight catalog index (2,815 records)
│   │   ├── qualifications.json           # Full catalog metadata
│   │   ├── performance_criteria.json     # 146 criteria from Assessment Guide
│   │   ├── competencies.json             # 136 outcomes (all ES curricula: 24+35+39+38; 0 AG)
│   │   ├── curriculum_versions.json      # 4 distinct ES duration documents
│   │   ├── modules.json                  # Modules mapped to distinct curricula
│   │   ├── assessment_methods.json       # 3 assessment methods (Theory, Practical, Viva)
│   │   ├── assessment_rubrics.json       # 70% aggregate passing rubric
│   │   ├── evidence_requirements.json    # Portfolio evidence specifications
│   │   ├── extraction_review_issues.json # Catalog discrepancies flagged for audit
│   │   └── qualification_sources.json    # Source document manifest
│   ├── manifest.json                     # Progressive Web App manifest
│   ├── sw.js                             # Service worker for offline shell caching
│   └── icons/                            # PWA app icons (192px, 512px)
│
├── src/                                  # Source Code
│   ├── components/                       # UI Components by Domain
│   │   ├── assessor/                     # Assessor Workbench, Rubrics & Evidence Inspector
│   │   ├── common/                       # Buttons, Cards, Modals, Navbar, Sync Indicators
│   │   ├── coordinator/                  # Admin Dashboard, Candidate Table, Reports & Audit
│   │   ├── matching/                     # Advisory Matching Cards & Source Inspectors
│   │   └── worker/                       # Intake Steps 1-4, Voice Recorder, Certificate
│   ├── context/                          # State Management
│   │   ├── AppContext.jsx                # Active role, candidates, assessors, and audit logs
│   │   └── LanguageContext.jsx           # Multilingual translation provider
│   ├── data/                             # Initial fixtures, translations & schemas
│   │   ├── initialData.js                # Demo candidate personas & initial audit logs
│   │   └── translations.js               # En/Hi localization strings
│   ├── services/                         # Core Logic & Domain Services
│   │   ├── assessorAssessmentService.js  # Rubric scoring, criteria linking & sign-off
│   │   ├── dataRepository.js             # Query interface for 2,815 qualifications
│   │   ├── offlineDb.js                  # Dexie.js IndexedDB schema & 5MB file validator
│   │   ├── qualificationMatchingService.js# Token-overlap search engine
│   │   ├── speechRecognitionService.js   # Native Web Speech ASR wrapper
│   │   ├── syncService.js                # Idempotent offline queue & sync manager
│   │   └── textToSpeechService.js        # Accessible voice output wrapper
│   ├── utils/
│   │   └── storage.js                    # LocalStorage persistence manager
│   ├── App.jsx                           # Root application layout & role router
│   ├── index.css                         # Tailwind CSS styling tokens
│   └── main.jsx                          # React application entry point
│
├── scripts/                              # Automated Node.js Validation Suites
│   ├── test_master_e2e_suite.mjs         # Master 30-step end-to-end workflow verification
│   ├── test_validation_cases.mjs         # Qualification matching & source grounding tests
│   ├── test_assessor_workflow.mjs        # Assessor criteria scoring & resume tests
│   ├── test_coordinator_section.mjs      # Dashboard counts, filters, reports & CSV tests
│   ├── test_offline_sync.mjs             # PWA shell, IndexedDB & idempotent sync tests
│   └── test_voice_multilingual.mjs       # Translations & Web Speech fallback tests
│
├── extract_pipeline.py                   # Deterministic python source data extraction script
├── package.json                          # Dependencies & NPM test scripts
└── vite.config.js                        # Vite build configuration
```

---

## ⚙️ 5. Installation & Run Commands

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v24.2.0; Node 20/22 recommended — see `engines` in package.json)
- **npm**: v9.0.0 or later
- **Python** (Optional, only needed to re-extract raw source files): Python 3.9+ with `openpyxl` and `pypdfium2`

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` (or the URL displayed in your terminal).

### 3. Build Production Bundle
```bash
npm run build
npm run preview
```

### 4. Run Linter
```bash
npm run lint
```
*(Runs Oxlint over all 67 project files, verifying zero syntax or runtime errors).*

### 5. Run Automated Tests
```bash
# Run the Master 30-Step E2E Suite (Steps 1–30):
npm test

# Run All 6 Validation Suites in sequence:
npm run test:all
```

---

## 🔄 6. Source Data Extraction Pipeline

The application data is deterministically extracted from the official source files in `data/` using `extract_pipeline.py`. To re-extract or refresh data:

```bash
# Optional: install Python parsing libraries if not present
pip install openpyxl pypdfium2

# Execute extraction pipeline
python extract_pipeline.py
```

### Verified Extraction Statistics (Phase 3 Audit):
- **Source Files Discovered & Processed**: **6**
  1. `NQR_Qualifications_Summary.xlsx.xlsx` (Worksheet Rows 4–2817)
  2. `Employability_Skills_30_Hours.pdf.pdf`
  3. `Employability_Skills_60_Hours.pdf.pdf`
  4. `Employability_Skills_90_Hours.pdf.pdf`
  5. `Employability_Skills_120_Hours.pdf.pdf`
  6. `Assessment_Guide.pdf.pdf`
- **Qualifications Imported**: **2,815** (2,814 from NQR Spreadsheet + 1 official Qualification Pack from Assessment Guide: `2022/OAFM/MEPSC/06022`).
- **Curricula Duration Records Imported**: **4** (30h, 60h, 90h, 120h kept strictly partitioned).
- **Competencies Extracted**: **136** (all from Employability Skills curricula: 24×30H + 35×60H + 39×90H + 38×120H; 0 from Assessment Guide).
- **Performance Criteria Extracted**: **146** rows, **146** unique ids (Pages 16–26 of Assessment Guide, e.g., `PC10`; 4 duplicate ids de-duplicated with `-B` suffix).
- **Assessment Methods Extracted**: **3** (Written Theory 40%, Practical Demonstration 60%, Viva Voce).
- **Official Rubrics Extracted**: **1** (70% aggregate pass threshold, Pages 6 & 27).
- **Records Missing Crucial Metadata**: 0 missing codes, 0 missing NSQF levels, 0 missing awarding bodies.
- **Records Flagged for Manual Coordinator Review**: **3**
  - Duplicate code in Excel rows 538 & 546 (`QG-04-ES-00913-2023-V1-SCGJ`)
  - Omission discrepancy: `2022/OAFM/MEPSC/06022` present in Assessment Guide but absent in NQR Excel summary
  - Typographical artifact in Row 397

---

## 👥 7. Demo Role Instructions & Personas

The application includes an instant **Role Switcher** in the top navigation bar:

### Role 1: Informal Worker (`Worker` Demo Persona)
- **Persona**: *Suresh Patel* (Domestic Electrician, 7 years experience).
- **Action Flow**:
  1. Switch language between English and हिन्दी.
  2. Complete **Profile Details** (name, trade, experience).
  3. Declare skills using text or tap **Speak** for voice recording.
  4. Attach evidence photo (enforcing 5 MB limit).
  5. Review summary, verify masked Aadhaar (`XXXX-XXXX-4819`), and tap **Submit Application**.
  6. Review generated **Advisory Qualification Suggestions** matching the 2,815 catalog.

### Role 2: Certified Assessor (`Assessor` Demo Persona)
- **Persona**: *Er. Vikram Sharma* (NSDC-Certified Assessor, Badge `NSDC-ASSESS-8841`).
- **Action Flow**:
  1. Open candidate dossier (e.g., *Deepa Varma* `CAND-2026-005`).
  2. Confirm qualification with mandatory justification rationale.
  3. Inspect the **146 Performance Criteria** loaded from Assessment Guide Pages 16–26.
  4. Record criterion outcome (`DEMONSTRATED`) and enter observations.
  5. Link uploaded evidence (`ev-501`) to criterion `AG-PC-P16-PC10`.
  6. Save draft (survives refresh) and submit for Authorised Review.

### Role 3: Scheme Coordinator / Admin (`Coordinator` Demo Persona)
- **Persona**: *Dr. Priya Nair* (Scheme Coordinator, MSDE State Directorate).
- **Action Flow**:
  1. View dynamic KPI metrics calculated across all stored applications.
  2. Search and filter candidates by status, trade, or assessor.
  3. Inspect audit trail with cryptographic SHA-256 hashes.
  4. Inspect the **Qualification Data Review** tab (viewing 30h/60h/90h/120h isolated curricula and flagged records).
  5. Authorise pending assessments (*Pooja Sharma* `CAND-2026-006`).
  6. Export privacy-compliant CSV report.

---

## ⏱️ 8. Suggested 3–5 Minute SIH Demo Sequence

```
0:00 - 0:45 | THE INTAKE (Worker Persona)
• Open app at http://localhost:5173/
• Switch language to Hindi ("हिन्दी") -> Notice instant vernacular UI.
• Click "Worker" persona -> Toggle "Mobile Frame" (390px view).
• Tap "Start Application", enter trade "Domestic Electrician", 7 years experience.
• Tap "Speak" on skill description -> Demonstrate Web Speech API transcription.
• Tap "Upload Evidence" -> Select a sample image; show 5 MB limit enforcement.
• Submit application -> Notice duplicate submission protection and masked Aadhaar.

0:45 - 1:45 | SOURCE-GROUNDED QUALIFICATION MATCHING
• View Top Advisory Matches -> "Assistant Electrician (Domestic cum Industrial)".
• Show transparent token matching explanation and advisory score disclaimer.
• Open qualification details -> Point out source provenance (NQR Excel Row 4).
• Highlight: AI suggests, but NEVER automatically certifies.

1:45 - 3:00 | ASSESSOR EXAMINATION WORKBENCH (Assessor Persona)
• Switch to "Assessor" persona in top bar.
• Open candidate Deepa Varma (CAND-2026-005).
• Confirm qualification -> Show 146 Performance Criteria from Assessment Guide.
• Click PC10 (Page 16) -> Record outcome "Demonstrated" + Assessor observation.
• Link candidate evidence to criterion.
• Toggle "Simulate Offline" -> Save draft; refresh page; show draft completely restored.
• Toggle back to "Online" -> Submit assessment for Authorised Review.

3:00 - 4:00 | GOVERNANCE & COORDINATOR AUDIT (Coordinator Persona)
• Switch to "Coordinator" persona.
• Show dynamic summary KPI cards and SHA-256 audit ledger.
• Filter candidate queue by trade or assigned assessor.
• Authorise candidate Pooja Sharma (CAND-2026-006) -> View issued RPL Digital Certificate.
• Click "Qualification Review" -> Show strict isolation of 30h, 60h, 90h, and 120h PDFs.
• Click "Export Report" -> Demonstrate sanitized CSV with zero Aadhaar/PII leakage.
```

---

## 🔒 9. Security, Privacy & Responsible Assessment Disclosures

1. **Synthetic Demo Fixtures**: All candidates, phone numbers, and addresses in the demo are fictional. No real worker personal data or Aadhaar numbers exist in the codebase.
2. **PII Masking**: Contact numbers and Aadhaar values are permanently masked (`XXXX-XXXX-4819`) before display or export.
3. **Demo Persona Notice**: The top-bar role selector is designed specifically for Hackathon evaluation. It is explicitly labeled as a **Simulated Demo Persona Switcher** and is not represented as production OAuth 2.0 / RBAC.
4. **Offline Safety Limit**: File uploads are capped at 5 MB to prevent mobile IndexedDB quota degradation.
5. **No Hallucinated Pass Marks**: Unverified qualifications strictly display **"Source verification required"** and use a provisional 4-level rubric without fabricated pass marks.

---

## ⚠️ 10. Limitations & Production Requirements

| Feature | Current Prototype State | Production Requirement for Scale |
|---|---|---|
| **Authentication** | Client-side demo persona switcher | Integrate DigiLocker, MeriPehchan, or Aadhaar OTP auth |
| **Cloud Sync** | Local IndexedDB queue + simulated sync | Connect to secure HTTPS REST / GraphQL backend with Postgres |
| **Speech Recognition** | Browser-native Web Speech API (`webkitSpeechRecognition`) | Integrate Bhashini API / Kathbath models for low-resource dialects |
| **Evidence Storage** | Device IndexedDB (capped at 5 MB per file) | S3 / MinIO object storage with presigned URLs and virus scanning |
| **Audit Ledger** | SHA-256 client-side hash chain | Anchored to blockchain / immutable database (e.g., Hyperledger) |

---

## 🧪 11. Test Execution Verification Table

| Test Suite | File | Scenarios Tested | Actual Result |
|---|---|---|---|
| **Master 30-Step E2E Suite** | `scripts/test_master_e2e_suite.mjs` | Complete Worker, Assessor, Admin, Offline & Matching | **30 / 30 PASSED (100%)** |
| **Assessor Workflow Suite** | `scripts/test_assessor_workflow.mjs` | 146 PCs, Linking Evidence, Draft Resuming, Rubrics | **10 / 10 PASSED (100%)** |
| **Coordinator Section Suite** | `scripts/test_coordinator_section.mjs` | Dynamic KPIs, Audit Logs, Curricula Isolation, CSV Export | **12 / 12 PASSED (100%)** |
| **Offline Resilience Suite** | `scripts/test_offline_sync.mjs` | PWA Manifest, SW, IndexedDB Offline Drafts, Idempotency | **10 / 10 PASSED (100%)** |
| **Voice & Multilingual Suite**| `scripts/test_voice_multilingual.mjs` | En/Hi parity, ASR fallback, Accessible TTS, Disclaimers | **10 / 10 PASSED (100%)** |
| **Matching & Validation Suite**| `scripts/test_validation_cases.mjs` | Token Overlap, Disambiguation, Zero-match, Provenance | **10 / 10 PASSED (100%)** |
| **Production Build Check** | `npm run build` | Vite ESM production bundle generation | **0 Errors (Built in 1.17s)** |
| **Code Linter Check** | `npm run lint` | Oxlint verification across 67 files | **0 Errors** |

---

*KaushalSetu RPL • Built for Smart India Hackathon (SIH) 2026 • Verified Working State*
