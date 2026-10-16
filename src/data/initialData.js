// Pre-populated realistic demo dataset for RPL assessment tool
export const INITIAL_ASSESSORS = [
  {
    id: "ASSESSOR-101",
    name: "Er. Vikram Sharma",
    qualificationSector: "Electronics & Electrical",
    badgeNumber: "NSDC-ASSESS-8841",
    centerName: "Government ITI Alambagh, Lucknow",
    experienceYears: 14,
    assessmentsCompleted: 142,
    avatar: "./assets/placeholder-evidence.svg",
    phone: "+91 94150 11223",
    email: "vikram.sharma@example.com"
  },
  {
    id: "ASSESSOR-102",
    name: "Dr. Ananya Bannerjee",
    qualificationSector: "Healthcare",
    badgeNumber: "NSDC-ASSESS-6129",
    centerName: "Apex Skill Development Center, Kolkata",
    experienceYears: 11,
    assessmentsCompleted: 98,
    avatar: "./assets/placeholder-evidence.svg",
    phone: "+91 98300 44556",
    email: "ananya.b@example.com"
  },
  {
    id: "ASSESSOR-103",
    name: "Gurpreet Singh Gill",
    qualificationSector: "Automotive & Manufacturing",
    badgeNumber: "NSDC-ASSESS-7215",
    centerName: "Regional Skill Center, Ludhiana",
    experienceYears: 18,
    assessmentsCompleted: 215,
    avatar: "./assets/placeholder-evidence.svg",
    phone: "+91 98140 77889",
    email: "gurpreet.singh@example.com"
  }
];

export const INITIAL_CANDIDATES = [
  {
    id: "CAND-2026-001",
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    location: "Lucknow, Uttar Pradesh",
    language: "hi",
    yearsExperience: 6,
    qualificationId: "QP-ELE-6001",
    currentRoleName: "Domestic Electrician",
    nsqfLevel: 4,
    aadhaarMasked: "XXXX-XXXX-4819",
    status: "COMPETENT", // Marked certified competent by Assessor
    submittedAt: "2026-10-02T10:00:00Z",
    evidenceReviewStatus: "Assessor Verified",
    targetCenter: "Government ITI Alambagh, Lucknow",
    isDemoRecord: true,
    evidenceList: [
      {
        id: "ev-1",
        title: "Three-Phase Distribution Board & RCCB Wiring",
        type: "photo",
        date: "2026-10-02",
        url: "./assets/placeholder-evidence.svg",
        aiAnalysis: {
          detectedTools: ["RCCB 40A / 30mA", "MCB 16A Type-C", "PVC Trunking", "Ferruling sleeves"],
          confidence: 94,
          nosAlignment: "ELE/N6002 (94% Alignment)",
          qualityAssessment: "Uniform bends, correct phase wire gauges (4 sq mm), neatly secured comb busbar.",
          safetyWarning: null
        }
      },
      {
        id: "ev-2",
        title: "Multimeter Voltage & Continuity Inspection",
        type: "photo",
        date: "2026-10-04",
        url: "./assets/placeholder-evidence.svg",
        aiAnalysis: {
          detectedTools: ["Digital Multimeter DT-830D", "Insulated Probe Leads", "Wire Stripper 6\""],
          confidence: 91,
          nosAlignment: "ELE/N6003 (91% Alignment)",
          qualityAssessment: "Correct CAT III probe placement. AC Voltage 230V range selected on rotary dial.",
          safetyWarning: "Ensure rubber gloves are worn during energized live probe tests."
        }
      },
      {
        id: "ev-3",
        title: "Voice Work Log - Daily Task Narrative",
        type: "audio",
        date: "2026-10-05",
        audioDuration: "1m 45s",
        transcript: "Namaste, mera naam Ramesh Kumar hai. Main pichhle 6 saal se Lucknow me residential wiring, switchboard fitting, aur motor starter repair ka kaam kar raha hoon. Main hamesha main switch band karke tester se line check karta hoon. Earthing pit me salt aur charcoal dal ke 2.8 ohm resistance maintain kiya tha.",
        translatedTranscript: "Hello, my name is Ramesh Kumar. For the past 6 years, I have been doing residential wiring, switchboard fitting, and motor starter repair in Lucknow. I always isolate the main switch and verify line with a neon tester before touching. In earthing pit, I used salt and charcoal to maintain 2.8 ohm resistance.",
        aiAnalysis: {
          confidence: 89,
          extractedKeywords: ["Main switch isolation", "Neon tester de-energization", "Earthing pit 2.8 ohm", "Motor starter repair", "Single/Three phase"],
          nosAlignment: "ELE/N6001 (92%), ELE/N6004 (86%)"
        }
      }
    ],
    aiSummary: {
      readinessScore: 89,
      predictedNsqfLevel: 4,
      qualificationMatch: "Domestic Electrician (ELE/Q6001)",
      nosReadiness: [
        { nosCode: "ELE/N6001", nosTitle: "Safety & PPE", readiness: 92, status: "Ready" },
        { nosCode: "ELE/N6002", nosTitle: "Installation & Wiring", readiness: 94, status: "Ready" },
        { nosCode: "ELE/N6003", nosTitle: "Circuit Testing", readiness: 86, status: "Ready" },
        { nosCode: "ELE/N6004", nosTitle: "Fault Diagnostics", readiness: 78, status: "Needs Viva Focus" }
      ],
      humanAssessorRecommendation: "Strong candidate for Level 4 certification. Recommend assessor to test practical insulation resistance (Megger test) and verify three-phase phase-sequence logic during viva."
    },
    assignedAssessorId: "ASSESSOR-101",
    assessmentRecord: {
      evaluatedAt: "2026-10-10T14:30:00Z",
      assessorId: "ASSESSOR-101",
      assessorName: "Er. Vikram Sharma",
      checklistResults: {
        c1: true,
        c2: true,
        c3: true,
        c4: true,
        c5: true
      },
      rubricScores: {
        "rubric-safety": 3,
        "rubric-tech": 4,
        "rubric-knowledge": 3,
        "rubric-viva": 3
      },
      finalWeightedScore: 85,
      verdict: "COMPETENT",
      assessorRemarks: "Demonstrated excellent practical dexterity with MCB board wire dressing and correct phase isolation. Safely tested loop impedance. Recommended for Level 4 RPL Certificate.",
      digitalSignature: "VIKRAM_SHARMA_NSDC_HASH_20261010_VERIFIED",
      certificateId: "RPL-2026-ELE-09428",
      certificateIssueDate: "10 Oct 2026"
    }
  },
  {
    id: "CAND-2026-002",
    name: "Sunita Devi",
    phone: "+91 94321 87654",
    location: "Kolkata, West Bengal",
    language: "bn",
    yearsExperience: 4,
    qualificationId: "QP-HSS-5101",
    currentRoleName: "General Duty Assistant (Healthcare)",
    nsqfLevel: 4,
    aadhaarMasked: "XXXX-XXXX-7102",
    status: "IN_REVIEW", // Ready for Assessor practical examination
    submittedAt: "2026-10-07T14:30:00Z",
    evidenceReviewStatus: "AI Pre-screened",
    targetCenter: "Apex Skill Development Center, Kolkata",
    isDemoRecord: true,
    evidenceList: [
      {
        id: "ev-201",
        title: "Sterile Glove Donning & Patient Transfer Setup",
        type: "photo",
        date: "2026-10-08",
        url: "./assets/placeholder-evidence.svg",
        aiAnalysis: {
          detectedTools: ["Sterile Surgical Gloves", "Wheelchair Brake Locks", "Patient Transfer Belt"],
          confidence: 92,
          nosAlignment: "HSS/N5101 (95% Alignment)",
          qualityAssessment: "Correct no-touch inner glove cuff handling. Wheelchair footrests retracted before patient seating.",
          safetyWarning: null
        }
      },
      {
        id: "ev-202",
        title: "Voice Work Log - Caregiving Routines",
        type: "audio",
        date: "2026-10-09",
        audioDuration: "1m 15s",
        transcript: "Ami 4 bochhor dhore nursing home e patient der care dichhi. Blood pressure digital machine e measure kori, red bin e contaminated cotton pheli, ar bed sore theke banchate 2 ghonta por por patient turn kori.",
        translatedTranscript: "I have been caring for patients in a nursing home for 4 years. I measure blood pressure with a digital machine, dispose contaminated cotton in the red biomedical bin, and turn patients every 2 hours to prevent pressure sores.",
        aiAnalysis: {
          confidence: 90,
          extractedKeywords: ["Blood pressure measurement", "Red biomedical waste bin", "2-hour patient turning", "Bed sore prevention"],
          nosAlignment: "HSS/N5102 (90%), HSS/N5103 (93%)"
        }
      }
    ],
    aiSummary: {
      readinessScore: 84,
      predictedNsqfLevel: 4,
      qualificationMatch: "General Duty Assistant (HSS/Q5101)",
      nosReadiness: [
        { nosCode: "HSS/N5101", nosTitle: "Infection Control & BMW", readiness: 95, status: "Ready" },
        { nosCode: "HSS/N5102", nosTitle: "Vital Signs Monitoring", readiness: 82, status: "Ready" },
        { nosCode: "HSS/N5103", nosTitle: "Patient Mobility & Bed Care", readiness: 91, status: "Ready" },
        { nosCode: "HSS/N5104", nosTitle: "First Aid & CPR Basics", readiness: 68, status: "Needs Viva Focus" }
      ],
      humanAssessorRecommendation: "Candidate shows solid infection control practices. The assessor should specifically test CPR resuscitation steps and vital sign error troubleshooting during oral viva."
    },
    assignedAssessorId: "ASSESSOR-102",
    assessmentRecord: null,
    isDemoRecord: true
  },
  {
    id: "CAND-2026-003",
    name: "Mohd. Arshad",
    phone: "+91 97112 33445",
    location: "Ludhiana, Punjab",
    language: "hi",
    yearsExperience: 5,
    qualificationId: "QP-WEL-3102",
    currentRoleName: "Automotive MIG / TIG Welder",
    nsqfLevel: 3,
    aadhaarMasked: "XXXX-XXXX-9934",
    status: "BRIDGE_REQUIRED", // Assessor recommended 12-hour gap training on root shielding
    submittedAt: "2026-09-25T11:00:00Z",
    evidenceReviewStatus: "Assessor Verified",
    targetCenter: "Regional Skill Center, Ludhiana",
    isDemoRecord: true,
    evidenceList: [
      {
        id: "ev-301",
        title: "Exhaust Manifold Flange TIG Joint",
        type: "photo",
        date: "2026-09-28",
        url: "./assets/placeholder-evidence.svg",
        aiAnalysis: {
          detectedTools: ["TIG Torch WP-17", "Argon Flowmeter", "Stainless Steel 304 filler wire"],
          confidence: 88,
          nosAlignment: "ASC/N3103 (85% Alignment)",
          qualityAssessment: "Good visual bead aesthetics, but slight discoloration indicates insufficient argon post-flow shielding.",
          safetyWarning: "Check for gas hose crimp integrity near cylinder regulator."
        }
      }
    ],
    aiSummary: {
      readinessScore: 72,
      predictedNsqfLevel: 3,
      qualificationMatch: "Automotive MIG / TIG Welder (ASC/Q3102)",
      nosReadiness: [
        { nosCode: "ASC/N3101", nosTitle: "HSE & Fire Safety", readiness: 85, status: "Ready" },
        { nosCode: "ASC/N3102", nosTitle: "Joint & Gas Prep", readiness: 65, status: "Bridge Recommended" },
        { nosCode: "ASC/N3103", nosTitle: "Fillet & Groove Welding", readiness: 75, status: "Ready" },
        { nosCode: "ASC/N3104", nosTitle: "Defect Rework & Testing", readiness: 62, status: "Bridge Recommended" }
      ],
      humanAssessorRecommendation: "Candidate possesses strong hand dexterity, but needs structured refresher on shielding gas flow calculation and non-destructive dye-penetrant testing."
    },
    assignedAssessorId: "ASSESSOR-103",
    assessmentRecord: {
      evaluatedAt: "2026-10-06T11:15:00Z",
      assessorId: "ASSESSOR-103",
      assessorName: "Gurpreet Singh Gill",
      checklistResults: {
        w1: true,
        w2: true,
        w3: true,
        w4: false // Cylinder regulator safety check was incomplete
      },
      rubricScores: {
        "rubric-safety": 2,
        "rubric-tech": 3,
        "rubric-knowledge": 2,
        "rubric-viva": 2
      },
      finalWeightedScore: 64,
      verdict: "BRIDGE_REQUIRED",
      assessorRemarks: "Good manual welding skills. Candidate struggled with gas flow meter calibration and gas back-purging for stainless steel. Recommended for 16-hour targeted bridge training module prior to RPL re-assessment.",
      digitalSignature: "GURPREET_GILL_NSDC_HASH_20261006_VERIFIED",
      certificateId: null,
      certificateIssueDate: null
    }
  },
  {
    id: "CAND-2026-004",
    name: "Rajesh Soni",
    phone: "+91 99280 66554",
    location: "Jaipur, Rajasthan",
    language: "hi",
    yearsExperience: 3,
    qualificationId: "QP-SOL-0101",
    currentRoleName: "Solar PV Installer (Suryamitra)",
    nsqfLevel: 4,
    aadhaarMasked: "XXXX-XXXX-3341",
    status: "SUBMITTED", // AI Pre-screened, waiting for Assessor allocation
    submittedAt: "2026-10-11T16:20:00Z",
    evidenceReviewStatus: "Pending AI Review",
    targetCenter: "National Skill Training Institute (NSTI), Jaipur",
    evidenceList: [
      {
        id: "ev-401",
        title: "Rooftop PV Rail Clamping & Angle Alignment",
        type: "photo",
        date: "2026-10-11",
        url: "./assets/placeholder-evidence.svg",
        aiAnalysis: {
          detectedTools: ["Aluminum Mid-Clamp", "Torque Wrench", "Magnetic Inclinometer"],
          confidence: 93,
          nosAlignment: "SGJ/N0102 (94% Alignment)",
          qualityAssessment: "Tilt angle calibrated to 26 degrees South. Mid-clamps fastened with spring washers.",
          safetyWarning: "Verify static lifeline tie-off when working within 2 meters of roof perimeter."
        }
      }
    ],
    aiSummary: {
      readinessScore: 86,
      predictedNsqfLevel: 4,
      qualificationMatch: "Solar PV Installer (SGJ/Q0101)",
      nosReadiness: [
        { nosCode: "SGJ/N0101", nosTitle: "Height & DC Safety", readiness: 88, status: "Ready" },
        { nosCode: "SGJ/N0102", nosTitle: "Module Mounting", readiness: 94, status: "Ready" },
        { nosCode: "SGJ/N0103", nosTitle: "Inverter & DC Wiring", readiness: 82, status: "Ready" },
        { nosCode: "SGJ/N0104", nosTitle: "Plant Commissioning", readiness: 79, status: "Ready" }
      ],
      humanAssessorRecommendation: "Excellent mechanical and alignment skills. Allocating certified solar assessor to evaluate DC Voc string isolation and separate earthing grid test."
    },
    assignedAssessorId: null,
    assessmentRecord: null,
    isDemoRecord: true
  },
  {
    id: "CAND-2026-005",
    name: "Deepa Varma",
    phone: "+91 98201 55443",
    location: "New Delhi, Delhi",
    language: "en",
    yearsExperience: 7,
    qualificationId: "NQR-2022/OAFM/MEPSC/06022",
    targetQualificationCode: "2022/OAFM/MEPSC/06022",
    currentRoleName: "Designer- Assessment Methods (VET and Skills)",
    nsqfLevel: 6,
    aadhaarMasked: "XXXX-XXXX-6612",
    status: "IN_REVIEW",
    targetCenter: "MEPSC Assessment Center, Okhla, New Delhi",
    evidenceList: [
      {
        id: "ev-501",
        title: "Assessment Plan & MCQ Blueprint Document",
        type: "document",
        date: "2026-10-11",
        url: "./assets/placeholder-evidence.svg",
        description: "Comprehensive blueprint aligning 146 performance criteria to 40% summative theory and 60% practical demonstration.",
        aiAnalysis: {
          detectedTools: ["Assessment Blueprint Table", "NOS Mapping Matrix", "MCQ Item Specifications"],
          confidence: 95,
          nosAlignment: "MEP/N2906 (96%), MEP/N2907 (94%)",
          qualityAssessment: "Complies with Assessment Guide Annexure rules.",
          safetyWarning: null
        }
      },
      {
        id: "ev-502",
        title: "Practical Observation Checklist & Viva Rubric",
        type: "photo",
        date: "2026-10-12",
        url: "./assets/placeholder-evidence.svg",
        description: "Hands-on assessment tool with situational oral viva prompts and safety rubric.",
        aiAnalysis: {
          detectedTools: ["Rubric Matrix", "Viva Question Guide"],
          confidence: 91,
          nosAlignment: "MEP/N2907 (92%)",
          qualityAssessment: "Well-structured rubric separating theory, practical, and viva.",
          safetyWarning: null
        }
      }
    ],
    aiSummary: {
      readinessScore: 88,
      predictedNsqfLevel: 6,
      qualificationMatch: "Designer- Assessment Methods (VET and Skills) (2022/OAFM/MEPSC/06022)",
      nosReadiness: [
        { nosCode: "MEP/N2906", nosTitle: "Design Competency Assessment", readiness: 92, status: "Ready" },
        { nosCode: "MEP/N2907", nosTitle: "Develop Assessment Tools", readiness: 90, status: "Ready" },
        { nosCode: "MEP/N2909", nosTitle: "IPR & Ethics Compliance", readiness: 85, status: "Ready" },
        { nosCode: "MEP/N2703", nosTitle: "Evaluate On-field Assessment", readiness: 84, status: "Ready" }
      ],
      humanAssessorRecommendation: "Candidate has submitted extensive assessment blueprints. Recommend physical viva on IPR compliance and practical demonstration of tool validation."
    },
    assignedAssessorId: "ASSESSOR-101",
    assessmentRecord: null,
    submittedAt: "2026-10-11T10:15:00Z",
    evidenceReviewStatus: "AI Pre-screened",
    isDemoRecord: true
  },
  {
    id: "CAND-2026-006",
    name: "Pooja Sharma",
    phone: "+91 97654 32109",
    location: "Varanasi, Uttar Pradesh",
    language: "hi",
    yearsExperience: 5,
    qualificationId: "QP-AMH-2201",
    targetQualificationCode: "AMH/Q1947",
    currentRoleName: "Garment Construction & Tailoring Specialist",
    nsqfLevel: 4,
    aadhaarMasked: "XXXX-XXXX-8245",
    status: "AWAITING_AUTHORISED_REVIEW",
    submittedAt: "2026-10-08T08:30:00Z",
    targetCenter: "Government ITI Chowkaghat, Varanasi",
    evidenceReviewStatus: "Assessor Evaluation Completed",
    evidenceList: [
      {
        id: "ev-601",
        title: "Industrial Single Needle Lockstitch Seaming & Tensioning",
        type: "photo",
        date: "2026-10-09",
        url: "./assets/placeholder-evidence.svg",
        aiAnalysis: {
          detectedTools: ["Industrial Lockstitch Machine DDL-8700", "Thread Snips", "Measuring Tape 60\""],
          confidence: 93,
          nosAlignment: "AMH/N1947 (95% Alignment)",
          qualityAssessment: "Stitch density measured 10-12 SPI. Balanced top and bobbin tension without puckering.",
          safetyWarning: "Ensure needle guard shield is engaged when operating at high SPM."
        }
      },
      {
        id: "ev-602",
        title: "Collar Attachment & Sleeve Placket Finishing",
        type: "photo",
        date: "2026-10-10",
        url: "./assets/placeholder-evidence.svg",
        aiAnalysis: {
          detectedTools: ["Steam Iron Box", "Tailor's Chalk", "Fabric Shears 10\""],
          confidence: 91,
          nosAlignment: "AMH/N1948 (92% Alignment)",
          qualityAssessment: "Symmetrical collar points within +/- 1mm tolerance. Topstitching aligned 1/16\" from edge.",
          safetyWarning: null
        }
      }
    ],
    aiSummary: {
      readinessScore: 87,
      predictedNsqfLevel: 4,
      qualificationMatch: "Self Employed Tailor / Garment Construction (AMH/Q1947)",
      nosReadiness: [
        { nosCode: "AMH/N1947", nosTitle: "Sewing Machine Operation", readiness: 95, status: "Ready" },
        { nosCode: "AMH/N1948", nosTitle: "Garment Assembly & Fitting", readiness: 88, status: "Ready" },
        { nosCode: "AMH/N1949", nosTitle: "Quality Inspection & Pressing", readiness: 84, status: "Ready" },
        { nosCode: "AMH/N0103", nosTitle: "Workplace Health & Safety", readiness: 82, status: "Ready" }
      ],
      humanAssessorRecommendation: "Candidate exhibits mastery in lockstitch and collar assembly. Recommended for practical examination."
    },
    assignedAssessorId: "ASSESSOR-102",
    assessmentRecord: {
      evaluatedAt: "2026-10-12T16:45:00Z",
      assessorId: "ASSESSOR-102",
      assessorName: "Dr. Ananya Bannerjee",
      checklistResults: {
        t1: true,
        t2: true,
        t3: true,
        t4: true
      },
      rubricScores: {
        "rubric-safety": 4,
        "rubric-tech": 3,
        "rubric-knowledge": 4,
        "rubric-viva": 3
      },
      finalWeightedScore: 82,
      verdict: "COMPETENT",
      status: "AWAITING_AUTHORISATION",
      assessorRemarks: "Candidate demonstrated accurate lockstitch tensioning, collar attachment, and seam puckering inspection. Meets NSQF Level 4 RPL criteria. Submitting to Coordinator for authorized sign-off.",
      digitalSignature: "ANANYA_BANNERJEE_NSDC_SIG_20261012_AWAITING_AUTH",
      certificateId: null,
      certificateIssueDate: null
    },
    isDemoRecord: true
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: "AUDIT-905",
    timestamp: "2026-10-12T16:50:00Z",
    action: "ASSESSMENT_SUBMITTED_FOR_AUTHORISATION",
    actor: "Dr. Ananya Bannerjee (Assessor ID: ASSESSOR-102)",
    candidateId: "CAND-2026-006",
    candidateName: "Pooja Sharma",
    details: "Assessor completed practical evaluation with 82% score (Verdict: COMPETENT). Evaluation submitted to Scheme Coordinator for authoritative review and certificate authorization.",
    aiInvolvement: "Assessor conducted hands-on observation of garment stitching and dimensional tolerances.",
    hash: "0x5e8c1b2f...sha256"
  },
  {
    id: "AUDIT-906",
    timestamp: "2026-10-11T16:25:00Z",
    action: "APPLICATION_REGISTERED",
    actor: "Rajesh Soni (Candidate)",
    candidateId: "CAND-2026-004",
    candidateName: "Rajesh Soni",
    details: "Candidate submitted RPL application for Solar PV Installer (SGJ/Q0101) with 1 work evidence file. Awaiting initial review & assessor allocation.",
    aiInvolvement: "AI extracted solar mid-clamp and torque wrench features (93% confidence).",
    hash: "0x89d23e5a...sha256"
  },
  {
    id: "AUDIT-901",
    timestamp: "2026-10-10T14:35:12Z",
    action: "ASSESSMENT_DECISION_SUBMITTED",
    actor: "Er. Vikram Sharma (Assessor ID: ASSESSOR-101)",
    candidateId: "CAND-2026-001",
    candidateName: "Ramesh Kumar",
    details: "Assessor certified candidate as COMPETENT for ELE/Q6001 (NSQF Level 4). Score: 85/100. Certificate issued: RPL-2026-ELE-09428.",
    aiInvolvement: "AI suggested 89% readiness; Assessor independently performed physical testing of MCB dressing and loop impedance.",
    hash: "0x7f4e8a9c...sha256"
  },
  {
    id: "AUDIT-902",
    timestamp: "2026-10-09T16:20:05Z",
    action: "EVIDENCE_AI_PRESCREENED",
    actor: "AI Recognition Engine v2.4 (Automated)",
    candidateId: "CAND-2026-002",
    candidateName: "Sunita Devi",
    details: "Evidence pre-screened. 2 items analyzed (1 photo, 1 audio). Matched against HSS/Q5101 with 84% readiness score.",
    aiInvolvement: "AI extracted WHO handwashing and BMW keywords; flagged CPR practical for human assessor viva.",
    hash: "0x3a1b9d4e...sha256"
  },
  {
    id: "AUDIT-903",
    timestamp: "2026-10-06T11:22:45Z",
    action: "BRIDGE_TRAINING_MANDATED",
    actor: "Gurpreet Singh Gill (Assessor ID: ASSESSOR-103)",
    candidateId: "CAND-2026-003",
    candidateName: "Mohd. Arshad",
    details: "Assessor mandated 16-hour bridge training on Gas Shielding Calibration before RPL re-assessment. Candidate scored 64/100.",
    aiInvolvement: "AI flagged discoloration in weld joint photo; Assessor verified deficiency in person during practical welding test.",
    hash: "0x9c4d2e1a...sha256"
  },
  {
    id: "AUDIT-904",
    timestamp: "2026-10-04T09:15:30Z",
    action: "ASSESSOR_ALLOCATED",
    actor: "Dr. Priya Nair (Scheme Coordinator)",
    candidateId: "CAND-2026-001",
    candidateName: "Ramesh Kumar",
    details: "Assessor Er. Vikram Sharma assigned to candidate for Domestic Electrician evaluation at ITI Alambagh.",
    aiInvolvement: "None. Manual administrative allocation based on geographical proximity.",
    hash: "0x12b5c7d8...sha256"
  }
];
