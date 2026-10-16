import React, { useState } from 'react';
import { ClipboardCheck, SquareCheck, ShieldCheck, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { QUALIFICATIONS } from '../../data/qualifications';
import { calculateRubricScore } from '../../utils/helpers';
import { ProgressBar } from '../common/ProgressBar';

export const StructuredRubric = ({
  candidate,
  rubricScores,
  checklistResults,
  onUpdateRubric,
  onUpdateChecklist
}) => {
  const qual = QUALIFICATIONS.find(q => q.id === candidate?.qualificationId) || QUALIFICATIONS[0];
  const rubricDims = qual.rubricDimensions;
  const checklist = qual.mandatoryChecklist;

  const currentWeightedScore = calculateRubricScore(rubricDims, rubricScores);

  const handleScoreChange = (dimId, score) => {
    onUpdateRubric({
      ...rubricScores,
      [dimId]: score
    });
  };

  const handleChecklistToggle = (itemId) => {
    onUpdateChecklist({
      ...checklistResults,
      [itemId]: !checklistResults[itemId]
    });
  };

  return (
    <div className="space-y-4">
      {/* Realtime Weighted Score Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-0.5">
            Practical Assessment Matrix ({qual.code})
          </span>
          <h3 className="font-extrabold text-white text-base sm:text-lg">
            Calculated Practical Score: {currentWeightedScore}%
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Passing benchmark for NSQF Level {qual.nsqfLevel}: <strong>70% minimum</strong>
          </p>
        </div>

        <div className="w-full sm:w-48">
          <ProgressBar
            value={currentWeightedScore}
            max={100}
            color={currentWeightedScore >= 70 ? "emerald" : "amber"}
            size="md"
          />
          <div className="text-right text-[11px] font-bold mt-1 text-slate-300">
            {currentWeightedScore >= 70 ? "✓ Passing Threshold Met" : "Below Passing Level"}
          </div>
        </div>
      </div>

      {/* Mandatory Safety & Standard Procedure Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
            <SquareCheck className="w-4 h-4 text-sky-600" />
            Mandatory Practical Safety & Standard Checklist
          </h4>
          <span className="text-[11px] text-slate-400 font-semibold">
            {Object.values(checklistResults).filter(Boolean).length} / {checklist.length} Passed
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Check off required hands-on procedures observed directly during the test:
        </p>

        <div className="space-y-2">
          {checklist.map((item) => {
            const isChecked = Boolean(checklistResults[item.id]);
            return (
              <label
                key={item.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-sky-50/60 border-sky-300 text-sky-950 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleChecklistToggle(item.id)}
                  className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500 border-slate-300 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="leading-snug block">{item.label}</span>
                  {item.mandatory && (
                    <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                      * Non-negotiable safety criteria
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* NOS-Aligned 4-Level Rubrics */}
      <div className="space-y-3.5">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 px-1">
          <ClipboardCheck className="w-4 h-4 text-sky-600" />
          NOS Evaluation Dimensions (4-Level Structured Rubric)
        </h4>

        {rubricDims.map((dim) => {
          const selectedScore = rubricScores[dim.id] || 3;
          return (
            <div key={dim.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{dim.name}</h5>
                  <span className="text-[11px] text-slate-500 font-medium">Weightage: {dim.weight}%</span>
                </div>
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-full">
                  Level {selectedScore} / 4
                </span>
              </div>

              {/* 4 Rubric Levels Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dim.levels.map((lvl) => {
                  const isSelected = selectedScore === lvl.score;
                  return (
                    <button
                      key={lvl.score}
                      type="button"
                      onClick={() => handleScoreChange(dim.id, lvl.score)}
                      className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-500/20 font-medium'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                            {lvl.label}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-sky-200 text-sky-900' : 'bg-slate-100 text-slate-600'}`}>
                            {lvl.score} pts
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-3">
                          {lvl.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] text-sky-700 font-bold mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
