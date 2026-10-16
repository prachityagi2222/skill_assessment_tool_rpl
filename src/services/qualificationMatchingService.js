// Source-Grounded Qualification Matching Service
// Performs transparent text & competency matching against extracted NQR and Curriculum catalogues.
// Strictly adheres to SIH PS 26242: No hallucinated codes, clear match scores, and human-review flags.

import { dataRepository } from './dataRepository.js';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'and', 'or',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
  'does', 'did', 'doing', 'work', 'working', 'job', 'task', 'tasks', 'skill', 'skills',
  'experience', 'years', 'using', 'used', 'make', 'perform', 'performing', 'etc'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-/]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

export class QualificationMatchingService {
  /**
   * Matches worker profile & experience against extracted qualification catalogue.
   * @param {Object} workerProfile - { trade, workActivities, declaredSkills: [], yearsExperience }
   * @returns {Promise<Object>} { suggestions: [], totalEvaluated: number, noMatchReason: string|null }
   */
  async matchQualifications(workerProfile) {
    await dataRepository.init();
    const allQualifications = dataRepository.getQualifications();
    const allCompetencies = dataRepository.getCompetencies();
    const allPerformanceCriteria = dataRepository.getPerformanceCriteria();

    if (!allQualifications || allQualifications.length === 0) {
      return {
        suggestions: [],
        totalEvaluated: 0,
        noMatchReason: 'Qualification catalogue is currently loading or unavailable.'
      };
    }

    // Combine worker declarations into searchable corpus
    const declaredTexts = [
      workerProfile.trade || '',
      workerProfile.workActivities || '',
      ...(workerProfile.declaredSkills || []).map(s => `${s.title} ${s.description} ${s.tools}`)
    ].join(' ');

    const workerTokens = tokenize(declaredTexts);
    const uniqueWorkerTokens = Array.from(new Set(workerTokens));

    if (uniqueWorkerTokens.length === 0) {
      return {
        suggestions: [],
        totalEvaluated: allQualifications.length,
        noMatchReason: 'No specific trade skills or task descriptions were provided to evaluate.'
      };
    }

    const scored = [];

    for (const qual of allQualifications) {
      let score = 0;
      const matchedTerms = new Set();
      const matchedCompetencies = [];

      const titleTokens = tokenize(qual.title || '');
      const sectorTokens = tokenize(qual.sector || '');
      const occTokens = tokenize(qual.proposed_occupation || '');
      const descTokens = tokenize(qual.description || '');

      // 1. Direct Title Match (High Weight: 40 pts)
      const titleMatches = uniqueWorkerTokens.filter(t => titleTokens.includes(t));
      if (titleMatches.length > 0) {
        score += Math.min(titleMatches.length * 20, 45);
        titleMatches.forEach(t => matchedTerms.add(t));
      }

      // Check for exact trade substring match
      if (workerProfile.trade && qual.title && qual.title.toLowerCase().includes(workerProfile.trade.toLowerCase())) {
        score += 25;
      }

      // 2. Occupation & Sector Match (Medium Weight: 20 pts)
      const occMatches = uniqueWorkerTokens.filter(t => occTokens.includes(t) || sectorTokens.includes(t));
      if (occMatches.length > 0) {
        score += Math.min(occMatches.length * 10, 20);
        occMatches.forEach(t => matchedTerms.add(t));
      }

      // 3. Description Match (15 pts)
      const descMatches = uniqueWorkerTokens.filter(t => descTokens.includes(t));
      if (descMatches.length > 0) {
        score += Math.min(descMatches.length * 4, 15);
        descMatches.slice(0, 3).forEach(t => matchedTerms.add(t));
      }

      // 4. Competency & Performance Criteria Match (Deep ground: 20 pts)
      // Check if qualification has associated performance criteria (e.g. Assessment Guide / MEPSC)
      if (qual.code) {
        const relatedPCs = allPerformanceCriteria.filter(pc => pc.qualification_code === qual.code);
        for (const pc of relatedPCs) {
          const pcTokens = tokenize(pc.description);
          const pcMatches = uniqueWorkerTokens.filter(t => pcTokens.includes(t));
          if (pcMatches.length >= 2) {
            score += 15;
            matchedCompetencies.push({
              code: pc.pc_code,
              description: (pc.description || '').slice(0, 100) + '...',
              matchedOn: pcMatches
            });
            break;
          }
        }
      }

      // Also check general Employability Skills competencies
      // NOTE: full-catalog scan + slice(0,50) is arbitrary (biased to import order).
      // TODO: proper ranking pass — pre-index/tokenize PCs once, paginate, require competency signal.
      for (const comp of allCompetencies.slice(0, 50)) {
        const compTokens = tokenize(comp.description);
        const compMatches = uniqueWorkerTokens.filter(t => compTokens.includes(t));
        if (compMatches.length >= 2) {
          matchedCompetencies.push({
            code: `[placeholder] Outcome #${comp.outcome_number}`,
            description: (comp.description || '').slice(0, 80) + '...',
            matchedOn: compMatches
          });
          score += 5;
          break;
        }
      }

      // Normalize score to max 100
      const finalScore = Math.min(Math.round(score), 98);

      // Only consider if score is at least 35%
      if (finalScore >= 35) {
        // Collect audit & review flags
        const reviewFlags = [...(qual.review_flags || [])];
        if (!qual.code) reviewFlags.push('Missing official Qualification Code in source document');
        if (!qual.valid_till) reviewFlags.push('Missing validity / expiry date in source catalogue');
        if (!qual.awarding_body) reviewFlags.push('Awarding body is not explicitly listed in source');

        scored.push({
          qualification: qual,
          matchScore: finalScore,
          matchedTerms: Array.from(matchedTerms),
          matchedCompetencies: matchedCompetencies.slice(0, 2),
          reviewFlags,
          matchingMethod: 'Transparent Token-Overlap & Competency Keyphrase Matching v1.0 (Local)',
          sourceTrace: {
            file: qual.source?.source_file || 'NQR_Qualifications_Summary.xlsx.xlsx',
            type: qual.source?.source_type || 'Catalogue Export',
            location: qual.source?.sheet_name ? `${qual.source.sheet_name}: Row ${qual.source.row_index}` : `Page ${qual.source?.page_count || 1}`
          }
        });
      }
    }

    // Sort by descending score
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Take top 3
    const topSuggestions = scored.slice(0, 3);

    if (topSuggestions.length === 0) {
      return {
        suggestions: [],
        totalEvaluated: allQualifications.length,
        noMatchReason: `No suitable qualification in the official source catalogue met the minimum relevance threshold (35%) for "${workerProfile.trade || 'the declared tasks'}". Try adding more detailed task steps or specific tools used.`
      };
    }

    return {
      suggestions: topSuggestions,
      totalEvaluated: allQualifications.length,
      noMatchReason: null
    };
  }
}

export const qualificationMatchingService = new QualificationMatchingService();
