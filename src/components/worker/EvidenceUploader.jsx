import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const EvidenceUploader = ({ isOpen, onClose }) => {
  const { activeCandidate, addEvidence } = useApp();
  const [title, setTitle] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('photo1');
  const [previewUrl, setPreviewUrl] = useState('./assets/placeholder-evidence.svg');
  const [isSimulatingAnalysis, setIsSimulatingAnalysis] = useState(false);

  const presets = [
    {
      id: 'photo1',
      name: 'Panel Board Wiring & Conduit',
      url: './assets/placeholder-evidence.svg',
      detected: ['Conduit saddle clips', 'Copper wire terminations', 'Distribution panel'],
      nos: 'ELE/N6002 (92% Alignment)'
    },
    {
      id: 'photo2',
      name: 'Earthing Electrode & Resistance Test',
      url: './assets/placeholder-evidence.svg',
      detected: ['Earth resistance tester', 'Electrode spikes', 'Insulated leads'],
      nos: 'ELE/N6003 (89% Alignment)'
    },
    {
      id: 'photo3',
      name: 'Rooftop Solar Rail Mount',
      url: './assets/placeholder-evidence.svg',
      detected: ['Aluminum rail clamp', 'Torque ratchet', 'Safety tether line'],
      nos: 'SGJ/N0102 (94% Alignment)'
    }
  ];

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    setPreviewUrl(p.url);
    if (!title) setTitle(p.name);
  };

  const handleSaveEvidence = () => {
    if (!title) return;
    setIsSimulatingAnalysis(true);

    const presetData = presets.find(p => p.id === selectedPreset) || presets[0];

    setTimeout(() => {
      const newEvidence = {
        id: `ev-photo-${(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now())}`,
        title: title || presetData.name,
        type: 'photo',
        date: new Date().toISOString().split('T')[0],
        url: previewUrl,
        aiAnalysis: {
          detectedTools: presetData.detected,
          confidence: 93,
          nosAlignment: presetData.nos,
          qualityAssessment: "High resolution artifact. Tool usage and safety posture validated by computer vision.",
          safetyWarning: null
        }
      };

      addEvidence(activeCandidate.id, newEvidence);
      setIsSimulatingAnalysis(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Work Evidence"
      subtitle="Submit photographic evidence of your finished jobs or tool handling"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Preset sample choices for convenient testing */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Choose Sample Work Evidence or Upload:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-1.5 rounded-xl border text-left transition-all ${
                  selectedPreset === p.id
                    ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-16 object-cover rounded-lg mb-1"
                />
                <p className="text-[10px] font-semibold text-slate-800 truncate leading-tight">
                  {p.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Work Evidence Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sub-distribution board wiring with 16A MCB"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Preview Container */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Evidence preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-xl text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-teal-400" />
              Simulated Field Artifact
            </span>
            <span className="text-teal-300 font-semibold">Ready for AI scan</span>
          </div>
        </div>

        {/* AI Pre-scan note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-600 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            AI will scan for detected tools, PPE gear, neatness of finish and map this against your Qualification Pack standards.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={!title || isSimulatingAnalysis}
            onClick={handleSaveEvidence}
            icon={isSimulatingAnalysis ? Sparkles : Check}
          >
            {isSimulatingAnalysis ? "Processing AI Scan..." : "Submit to Vault"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
