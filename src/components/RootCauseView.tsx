/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Terminal,
  FileCode,
  GitCommit,
  Activity,
  BookOpen,
  Info,
  Database,
  ExternalLink,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Incident } from '../types';
import { RootCauseAnalysisResult } from '../ai/evidence_chain';
import { api } from '../api';

interface RootCauseViewProps {
  incidents: Incident[];
  selectedIncidentId: number;
  onSelectIncident: (id: number) => void;
  onNavigate: (tab: any) => void;
  isLoading: boolean;
}

export const RootCauseView: React.FC<RootCauseViewProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onNavigate,
  isLoading: isGlobalLoading
}) => {
  const [data, setData] = useState<RootCauseAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRawEvidence, setSelectedRawEvidence] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  useEffect(() => {
    if (currentIncident?.id) {
      loadRootCause(currentIncident.id);
    }
  }, [currentIncident?.id]);

  const loadRootCause = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.getRootCauseAnalysis(id);
      setData(res);
    } catch (err) {
      console.error('Failed to load root cause analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Target Incident Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0c1220] border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Root-Cause Hypothesis Evaluation & Dynamic Derivation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Derived directly from persisted simulated database telemetry, deployments, and runbooks (Principal Demo: DB_POOL_SIZE 50 &rarr; 10).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">Incident:</label>
          <select
            value={currentIncident?.id}
            onChange={(e) => onSelectIncident(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                INC-{inc.id} ({inc.severity}) [{inc.status}] - {inc.service_name || `Service ${inc.service_id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading || isGlobalLoading ? (
        <div className="p-16 text-center text-xs font-mono text-slate-400">
          Deriving root-cause hypotheses from stored database records...
        </div>
      ) : !data ? (
        <div className="p-16 text-center rounded-lg bg-[#0c1220] border border-slate-800 text-xs text-slate-400">
          No root cause evaluation found for selected incident.
        </div>
      ) : (
        <>
          {/* Executive Investigation Summary Card */}
          <div className="p-5 rounded-lg bg-gradient-to-r from-[#0c1626] to-[#0c1220] border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.06)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-semibold">
                    Investigation Summary
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Scenario: {data.investigation_summary.principal_demo_scenario}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 mt-1">
                  Empirically Derived Root-Cause Conclusion
                </h3>
              </div>

              <button
                onClick={() => onNavigate('evidence')}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-medium transition flex items-center gap-1.5 shrink-0"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View Full Evidence Chain ({data.evidence_chain_count} items)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950/70 p-3.5 rounded border border-slate-800">
              {data.investigation_summary.executive_conclusion}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-950/60 border border-slate-900 space-y-1.5">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Why Primary Hypothesis is Supported
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {data.investigation_summary.why_primary_is_supported}
                </p>
              </div>

              <div className="p-3 rounded bg-slate-950/60 border border-slate-900 space-y-1.5">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Missing Evidence Requiring Follow-up
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                  {data.investigation_summary.evidence_missing.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Heuristic Score vs. Statistically Calibrated Probability Educational Callout */}
          <div className="p-5 rounded-lg bg-[#0c1220] border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider font-mono">
                Methodology Distinction: Heuristic Score vs. Statistically Calibrated Probability
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="font-semibold text-cyan-300 text-xs">
                  1. {data.scoring_methodology.heuristic_vs_calibrated_distinction.heuristic_evidence_coverage_title}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {data.scoring_methodology.heuristic_vs_calibrated_distinction.heuristic_evidence_coverage_explanation}
                </p>
              </div>

              <div className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="font-semibold text-purple-300 text-xs">
                  2. {data.scoring_methodology.heuristic_vs_calibrated_distinction.calibrated_probability_title}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {data.scoring_methodology.heuristic_vs_calibrated_distinction.calibrated_probability_explanation}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-200/90 font-mono">
              <span className="font-bold text-indigo-300">Operational Principle: </span>
              {data.scoring_methodology.heuristic_vs_calibrated_distinction.operational_takeaway}
            </div>
          </div>

          {/* Testable Hypotheses Cards (Primary & Rivals) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Evaluated Root-Cause Hypotheses ({data.hypotheses.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Formula: {data.scoring_methodology.formula}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.hypotheses.map((hypo) => {
                const isPrimary = hypo.is_primary;
                return (
                  <div
                    key={hypo.id}
                    className={`p-5 rounded-lg border transition space-y-4 ${
                      isPrimary
                        ? 'bg-gradient-to-br from-[#0c1626] to-[#0c1220] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
                        : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            isPrimary ? 'bg-cyan-600 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {hypo.id} {isPrimary ? '· Primary Cause' : '· Rival Hypothesis'}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                            hypo.likelihood === 'VERY_HIGH'
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                              : hypo.likelihood === 'LOW'
                              ? 'text-amber-400 bg-amber-950/60 border border-amber-800/60'
                              : 'text-slate-400 bg-slate-900 border border-slate-800'
                          }`}>
                            {hypo.likelihood}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100">
                          {hypo.title}
                        </h4>
                      </div>

                      {/* Calibrated Confidence Badge */}
                      <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-lg text-right shrink-0">
                        <div className="text-[10px] font-mono text-slate-500 uppercase">Heuristic Evidence Score</div>
                        <div className={`text-xl font-mono font-bold ${isPrimary ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {(hypo.confidence_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">
                          Deploy 30% · Log 25% · Metric 25% · Know 20%
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {hypo.summary}
                    </p>

                    {/* Failure Mechanism & Prediction */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 rounded bg-slate-950/70 border border-slate-900 space-y-1">
                        <span className="text-[10px] text-cyan-400 font-semibold uppercase">Failure Mechanism:</span>
                        <p className="text-[11px] text-slate-300">{hypo.failure_mechanism}</p>
                      </div>
                      <div className="p-3 rounded bg-slate-950/70 border border-slate-900 space-y-1">
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase">Testable Prediction:</span>
                        <p className="text-[11px] text-slate-300">{hypo.testable_prediction}</p>
                      </div>
                    </div>

                    {/* Supporting and Contradicting Evidence Links */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-400">Supporting Evidence:</span>
                        {hypo.supporting_evidence_ids.length === 0 ? (
                          <span className="text-slate-500 text-[11px]">None</span>
                        ) : (
                          hypo.supporting_evidence_ids.map((id) => (
                            <button
                              key={id}
                              onClick={() => onNavigate('evidence')}
                              className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60 transition"
                            >
                              {id} ↗
                            </button>
                          ))
                        )}
                      </div>

                      {hypo.contradicting_evidence_ids.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-rose-400">Contradicting Evidence:</span>
                          {hypo.contradicting_evidence_ids.map((id) => (
                            <button
                              key={id}
                              onClick={() => onNavigate('evidence')}
                              className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-950/40 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 transition"
                            >
                              {id} (Refuting) ↗
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Why supported / Why refuted explanation */}
                    <div className="p-3 rounded bg-slate-950/50 border border-slate-800/70 space-y-1 text-xs">
                      <div className="font-semibold text-slate-300 text-[11px]">Evidence Synthesis:</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {hypo.why_supported} {hypo.why_refuted_or_less_supported ? ` — ${hypo.why_refuted_or_less_supported}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Database Non-Fabrication Audit Verification Bar */}
          <div className="p-4 rounded-lg bg-[#0c1220] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Non-Fabrication Guarantee:</strong> All cited logs, metric measurements, diffs, and citations verified against {data.audit_verification.records_checked.deployments + data.audit_verification.records_checked.logs + data.audit_verification.records_checked.metrics} database records.
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50 shrink-0">
              Audit Verified
            </span>
          </div>
        </>
      )}
    </div>
  );
};
