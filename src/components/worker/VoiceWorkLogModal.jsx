import React, { useState, useEffect } from 'react';
import { Mic, Square, Sparkles, Check, Volume2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const VoiceWorkLogModal = ({ isOpen, onClose }) => {
  const { activeCandidate, addEvidence } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sampleOption, setSampleOption] = useState('electrical');

  const sampleTranscripts = {
    electrical: {
      native: "नमस्ते। मैं पिछले 6 वर्षों से लखनऊ और कानपुर में घरेलू वायरिंग का काम कर रहा हूँ। मैं थ्री-फेज़ एमसीबी बोर्ड, आरसीसीबी 30mA ट्रिपिंग और अर्थिंग गड्ढे का 2.8 ओम प्रतिरोध बनाए रखने का काम जानता हूँ। काम शुरू करने से पहले हमेशा मेन स्विच आइसोलेट करके टेस्टर से चेक करता हूँ।",
      english: "Hello. I have been doing domestic wiring in Lucknow and Kanpur for 6 years. I know 3-phase MCB board, RCCB 30mA tripping, and maintaining 2.8 ohm earthing resistance. Before starting work, I always isolate the main switch and verify line de-energization using a neon tester.",
      keywords: ["Three-phase MCB Board", "RCCB 30mA", "Earthing 2.8 Ohm", "Main Switch Isolation", "Neon Tester"],
      nos: "ELE/N6001 (Safety) & ELE/N6002 (Installation)"
    },
    welding: {
      native: "मैंने 5 साल तक वर्कशॉप में ऑटोमोटिव एग्जॉस्ट और चेसिस टीआईजी और मिग वेल्डिंग की है। 100% आर्गन गैस शील्डिंग, 12 लीटर प्रति मिनट फ्लो, और डाई पेनेट्रेंट टेस्ट से क्रैक चेक करना आता है। हमेशा लेदर ग्लव्स और ऑटो-डार्किंग हेलमेट पहनता हूँ।",
      english: "I have 5 years of experience in automotive exhaust and chassis TIG & MIG welding. I manage 100% argon shielding, 12 L/min flow rate, and dye penetrant testing for surface cracks. I always wear leather safety gloves and auto-darkening DIN helmet.",
      keywords: ["TIG & MIG Welding", "Argon Flow 12 L/min", "Dye Penetrant Crack Check", "Auto-darkening Helmet"],
      nos: "ASC/N3101 (Safety) & ASC/N3103 (Groove Welding)"
    },
    healthcare: {
      native: "আমি গত ৪ বছর ধরে নার্সিং হোমে জেনারেল ডিউটি অ্যাসিস্ট্যান্ট হিসেবে কাজ করছি। ডিজিটাল মেশিনে ব্লাড প্রেশার মাপা, বায়োমেডিক্যাল ওয়েস্ট আলাদা রঙের বিনে ফেলা এবং প্রতি ২ ঘণ্টায় রোগীকে পাশ ফেরানো জানি।",
      english: "I have worked as a General Duty Assistant in nursing homes for 4 years. I know digital blood pressure monitoring, segregation of biomedical waste into color-coded bins, and repositioning patients every 2 hours to avoid bed sores.",
      keywords: ["Vital Signs / BP", "Biomedical Waste Segregation", "Bed Sore Prevention", "Patient Transfer"],
      nos: "HSS/N5101 (Infection Control) & HSS/N5102 (Vital Signs)"
    }
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setTranslatedTranscript('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);

    // Demo only — not real transcription. Sample injection is DEV-gated so production
    // never fabricates a transcript. Wire speechRecognitionService.js for real mic/ASR.
    if ((import.meta?.env?.DEV ?? true)) {
      // Simulate speech-to-text and AI extraction
      setTimeout(() => {
        const selected = sampleTranscripts[sampleOption] || sampleTranscripts.electrical;
        setTranscript(selected.native);
        setTranslatedTranscript(selected.english);
        setIsProcessing(false);
      }, 1200);
    } else {
      setTranscript('');
      setTranslatedTranscript('');
      setIsProcessing(false);
    }
  };

  const handleSaveVoiceEvidence = () => {
    if (!transcript) return;
    const selected = sampleTranscripts[sampleOption] || sampleTranscripts.electrical;

    const newEvidence = {
      id: `ev-voice-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now())}`,
      title: `Voice Work Log (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`,
      type: 'audio',
      date: new Date().toISOString().split('T')[0],
      audioDuration: '1m 20s',
      transcript: transcript,
      translatedTranscript: translatedTranscript,
      aiAnalysis: {
        confidence: 91,
        extractedKeywords: selected.keywords,
        nosAlignment: selected.nos
      }
    };

    addEvidence(activeCandidate.id, newEvidence);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voice Work Log"
      subtitle="Speak in your mother tongue to log your daily work, tools, and experience"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-[11px] text-amber-900 font-semibold">
          Demo only — not real transcription. Samples are injected locally; no microphone audio is recorded.
        </div>
        
        {/* Language & Trade Selection preset */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Select Trade Voice Scenario:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSampleOption('electrical')}
              className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                sampleOption === 'electrical'
                  ? 'bg-teal-600 text-white border-teal-600 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Electrician (Hindi)
            </button>
            <button
              onClick={() => setSampleOption('welding')}
              className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                sampleOption === 'welding'
                  ? 'bg-teal-600 text-white border-teal-600 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Welder (Hindi)
            </button>
            <button
              onClick={() => setSampleOption('healthcare')}
              className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                sampleOption === 'healthcare'
                  ? 'bg-teal-600 text-white border-teal-600 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Healthcare (Bengali)
            </button>
          </div>
        </div>

        {/* Audio Recording Controller */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-6 text-center border border-slate-800">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center relative">
            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
            )}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center z-10 transition-transform active:scale-95 ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                  : 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-lg shadow-teal-500/30'
              }`}
              aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
            >
              {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-7 h-7" />}
            </button>
          </div>

          <div className="text-sm font-bold">
            {isRecording ? (
              <span className="text-rose-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Recording in progress: {recordSeconds}s
              </span>
            ) : isProcessing ? (
              <span className="text-amber-400 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Transcribing & translating speech...
              </span>
            ) : (
              <span className="text-slate-300">Tap microphone to describe your work</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audio is analyzed for technical terminology, safety practices & NOS matching
          </p>
        </div>

        {/* Generated Transcript & Analysis */}
        {transcript && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Original Vernacular Speech:
              </span>
              <p className="text-xs text-slate-800 leading-relaxed italic">
                "{transcript}"
              </p>
            </div>

            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                  AI Translation & Technical Keyphrase Extraction:
                </span>
              </div>
              <p className="text-xs text-teal-950 leading-relaxed mb-2">
                "{translatedTranscript}"
              </p>
              
              <div className="pt-2 border-t border-teal-200/80">
                <span className="text-[11px] font-semibold text-teal-800 block mb-1">
                  Identified Competency Signals:
                </span>
                <div className="flex flex-wrap gap-1">
                  {sampleTranscripts[sampleOption]?.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-teal-200 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!transcript}
            onClick={handleSaveVoiceEvidence}
            icon={Check}
          >
            Save to Evidence Vault
          </Button>
        </div>

      </div>
    </Modal>
  );
};
