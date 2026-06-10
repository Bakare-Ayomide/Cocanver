import React, { useState, useEffect, useRef } from "react";
import { CanvasElement, Page, Action, ActionType, ConditionRule } from "../types";
import { 
  Workflow, Play, HelpCircle, ChevronRight, AlertCircle, Trash2, 
  Sparkles, Layers, Zap, GitBranch, Settings, Plus, X, MousePointer,
  FileText, Activity
} from "lucide-react";

interface WorkflowBuilderProps {
  page: Page;
  allElements: CanvasElement[];
  pages: Page[];
  onSelectElement: (elId: string) => void;
  onUpdateElement: (updated: CanvasElement) => void;
}

export default function WorkflowBuilder({
  page,
  allElements,
  pages,
  onSelectElement,
  onUpdateElement,
}: WorkflowBuilderProps) {
  // Extract all elements with triggers, sequences or conditions
  const activeElements = allElements.filter(
    (el) => el.clickSequences && (el.clickSequences.length > 0 || el.conditions.length > 0)
  );

  // SVG link lines coordinate system state
  const [connections, setConnections] = useState<Array<{ 
    from: { x: number; y: number }; 
    to: { x: number; y: number }; 
    color: string; 
    style?: "solid" | "dashed";
  }>>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Connection mapping math calculation
  const updateConnectionLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    const nextConnections: typeof connections = [];

    activeElements.forEach((el) => {
      // 1. Sequences links
      el.clickSequences.forEach((seq) => {
        const fromEl = document.getElementById(`port-trigger-${el.id}-seq-${seq.clickIndex}`);
        const middleEl = document.getElementById(`port-middle-${el.id}-seq-${seq.clickIndex}`);
        
        let midX = 0, midY = 0;
        
        if (fromEl && middleEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const fromX = fromRect.left + fromRect.width / 2 - containerRect.left + scrollLeft;
          const fromY = fromRect.top + fromRect.height / 2 - containerRect.top + scrollTop;

          const middleRect = middleEl.getBoundingClientRect();
          midX = middleRect.left + middleRect.width / 2 - containerRect.left + scrollLeft;
          midY = middleRect.top + middleRect.height / 2 - containerRect.top + scrollTop;

          // Push Trigger -> Sequence Block line
          nextConnections.push({
            from: { x: fromX, y: fromY },
            to: { x: midX, y: midY },
            color: "#3b82f6", // Blue
          });

          // Connect Sequence block to each individual actions mapped to it
          seq.actions.forEach((act) => {
            const outPin = document.getElementById(`port-middle-out-${el.id}-seq-${seq.clickIndex}`);
            const toEl = document.getElementById(`port-action-${act.id}`);
            if (outPin && toEl) {
              const outRect = outPin.getBoundingClientRect();
              const outX = outRect.left + outRect.width / 2 - containerRect.left + scrollLeft;
              const outY = outRect.top + outRect.height / 2 - containerRect.top + scrollTop;

              const toRect = toEl.getBoundingClientRect();
              const toX = toRect.left + toRect.width / 2 - containerRect.left + scrollLeft;
              const toY = toRect.top + toRect.height / 2 - containerRect.top + scrollTop;

              nextConnections.push({
                from: { x: outX, y: outY },
                to: { x: toX, y: toY },
                color: "#10b981", // Emerald outcome
              });
            }
          });
        }
      });

      // 2. Conditions lines
      el.conditions.forEach((cond) => {
        const fromEl = document.getElementById(`port-trigger-${el.id}-cond-${cond.id}`);
        const condEl = document.getElementById(`port-cond-${cond.id}`);
        
        let condX = 0, condY = 0;
        if (fromEl && condEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const fromX = fromRect.left + fromRect.width / 2 - containerRect.left + scrollLeft;
          const fromY = fromRect.top + fromRect.height / 2 - containerRect.top + scrollTop;

          const condRect = condEl.getBoundingClientRect();
          condX = condRect.left + condRect.width / 2 - containerRect.left + scrollLeft;
          condY = condRect.top + condRect.height / 2 - containerRect.top + scrollTop;

          // Push Trigger -> Condition checker block line
          nextConnections.push({
            from: { x: fromX, y: fromY },
            to: { x: condX, y: condY },
            color: "#818cf8", // Indigo check
          });

          // Connect truth result (Then)
          cond.successActions.forEach((act) => {
            const successEl = document.getElementById(`port-cond-then-${cond.id}`);
            const toEl = document.getElementById(`port-action-${act.id}`);
            if (successEl && toEl) {
              const sucRect = successEl.getBoundingClientRect();
              const sucX = sucRect.left + sucRect.width / 2 - containerRect.left + scrollLeft;
              const sucY = sucRect.top + sucRect.height / 2 - containerRect.top + scrollTop;

              const toRect = toEl.getBoundingClientRect();
              const toX = toRect.left + toRect.width / 2 - containerRect.left + scrollLeft;
              const toY = toRect.top + toRect.height / 2 - containerRect.top + scrollTop;

              nextConnections.push({
                from: { x: sucX, y: sucY },
                to: { x: toX, y: toY },
                color: "#14b8a6", // Teal truth
              });
            }
          });

          // Connect fail result (Else)
          cond.failActions.forEach((act) => {
            const failEl = document.getElementById(`port-cond-else-${cond.id}`);
            const toEl = document.getElementById(`port-action-${act.id}`);
            if (failEl && toEl) {
              const failRect = failEl.getBoundingClientRect();
              const failX = failRect.left + failRect.width / 2 - containerRect.left + scrollLeft;
              const failY = failRect.top + failRect.height / 2 - containerRect.top + scrollTop;

              const toRect = toEl.getBoundingClientRect();
              const toX = toRect.left + toRect.width / 2 - containerRect.left + scrollLeft;
              const toY = toRect.top + toRect.height / 2 - containerRect.top + scrollTop;

              nextConnections.push({
                from: { x: failX, y: failY },
                to: { x: toX, y: toY },
                color: "#ef4444", // Crimson otherwise
                style: "dashed"
              });
            }
          });
        }
      });
    });

    setConnections(nextConnections);
  };

  useEffect(() => {
    updateConnectionLines();
    window.addEventListener("resize", updateConnectionLines);
    
    // Periodically update to sync dynamic DOM switches
    const timer = setTimeout(updateConnectionLines, 100);
    return () => {
      window.removeEventListener("resize", updateConnectionLines);
      clearTimeout(timer);
    };
  }, [page, allElements, activeElements]);

  // Cubic Bezier spline equation
  const getBezierCurve = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.45;
    const cx1 = x1 + dx;
    const cy1 = y1;
    const cx2 = x2 - dx;
    const cy2 = y2;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  // Logic Interaction Wizard Setup
  const [showWizard, setShowWizard] = useState(false);
  const [sourceElId, setSourceElId] = useState("");
  const [logicMode, setLogicMode] = useState<"click" | "cond">("click");
  
  // Direct Click Modes
  const [clickIndex, setClickIndex] = useState(0);
  const [actionType, setActionType] = useState<ActionType>("DisplayNotification");
  const [actionParams, setActionParams] = useState<Record<string, any>>({
    notificationMessage: "Success action trigger!",
    notificationType: "success"
  });

  // Conditions parameters
  const [condName, setCondName] = useState("");
  const [condType, setCondType] = useState<"Empty" | "NotEmpty" | "Equals" | "Checked" | "Unchecked">("Empty");
  const [condTargetValueField, setCondTargetValueField] = useState("");
  const [condThreshold, setCondThreshold] = useState("");
  
  const [successActionType, setSuccessActionType] = useState<ActionType>("DisplayNotification");
  const [successParams, setSuccessParams] = useState<Record<string, any>>({
    notificationMessage: "Condition verified successfully!",
    notificationType: "success"
  });
  
  const [failActionType, setFailActionType] = useState<ActionType>("DisplayNotification");
  const [failParams, setFailParams] = useState<Record<string, any>>({
    notificationMessage: "Condition check did not match.",
    notificationType: "error"
  });

  const handleSaveConnection = () => {
    const triggerEl = allElements.find((e) => e.id === sourceElId);
    if (!triggerEl) return;

    if (logicMode === "click") {
      const newAction: Action = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: actionType,
        params: { ...actionParams },
      };

      const finalSequences = [...(triggerEl.clickSequences || [])];
      const seqIdx = finalSequences.findIndex((s) => s.clickIndex === clickIndex);

      if (seqIdx >= 0) {
        finalSequences[seqIdx] = {
          ...finalSequences[seqIdx],
          actions: [...finalSequences[seqIdx].actions, newAction],
        };
      } else {
        finalSequences.push({
          clickIndex: clickIndex,
          actions: [newAction],
        });
      }

      onUpdateElement({
        ...triggerEl,
        clickSequences: finalSequences,
      });

    } else {
      const parsedCondName = condName.trim() || `If ${condTargetValueField || "Input"} is ${condType}`;
      
      const newSuccessAction: Action = {
        id: `act-${Date.now()}-ok-${Math.random().toString(36).substr(2, 4)}`,
        type: successActionType,
        params: { ...successParams },
      };

      const newFailAction: Action = {
        id: `act-${Date.now()}-fail-${Math.random().toString(36).substr(2, 4)}`,
        type: failActionType,
        params: { ...failParams },
      };

      const newCondition: ConditionRule = {
        id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: parsedCondName,
        sourceElementId: condTargetValueField || allElements[0]?.id || "",
        conditionType: condType as any,
        valueThreshold: condThreshold,
        successActions: [newSuccessAction],
        failActions: [newFailAction],
      };

      onUpdateElement({
        ...triggerEl,
        conditions: [...(triggerEl.conditions || []), newCondition],
      });
    }

    // Dismiss Form states
    setShowWizard(false);
    setSourceElId("");
    setActionParams({
      notificationMessage: "Success action trigger!",
      notificationType: "success"
    });
    setSuccessParams({
      notificationMessage: "Condition verified successfully!",
      notificationType: "success"
    });
    setFailParams({
      notificationMessage: "Condition check did not match.",
      notificationType: "error"
    });
    
    // trigger state alignment
    setTimeout(updateConnectionLines, 100);
  };

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-4 font-sans select-none overflow-hidden h-full flex flex-col relative" id="workflow-builder-panel">
      
      {/* Header Panel metadata */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-shrink-0" id="builder-meta">
        <div className="flex items-center space-x-2.5" id="builder-meta-indicator">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shadow-xs">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span>Logical Visual Topology Builder</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 font-extrabold uppercase font-mono">
                Interactive State Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-light">Design multi-click sequences and advanced logic checker pipelines below.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3" id="meta-actions">
          <div className="hidden lg:flex items-center space-x-2.5 text-[10px] text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-blue-500"></span>
              <span>Triggers</span>
            </span>
            <span className="w-1 h-3 bg-slate-250"></span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-indigo-400"></span>
              <span>Gateways</span>
            </span>
            <span className="w-1 h-3 bg-slate-250"></span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded bg-emerald-500"></span>
              <span>Outcomes</span>
            </span>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs transition active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Blueprint Logic</span>
          </button>
        </div>
      </div>

      {activeElements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white p-8 space-y-3.5 text-center" id="empty-workspace-pathways">
          <div className="bg-slate-50 p-4 rounded-full border border-slate-100 shadow-xs">
            <Activity className="w-6 h-6 text-slate-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-700 font-bold text-xs font-sans">No physical logical links deployed yet</p>
            <p className="text-[10px] text-slate-400 max-w-sm font-light">Establish a pipeline using the "+ Add Blueprint Logic" wizard or selection of buttons on the canvas to configure multi-click outcomes.</p>
          </div>
        </div>
      ) : (
        /* Visual Graph Workstage */
        <div 
          ref={containerRef} 
          onScroll={updateConnectionLines}
          className="flex-1 overflow-auto min-h-0 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px] border border-slate-150 bg-slate-50 rounded-2xl p-4 shadow-inner"
          id="flow-topography-canvas"
        >
          {/* Animated Curved Spline overlay layer */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
            {connections.map((conn, idx) => (
              <g key={idx}>
                <path
                  d={getBezierCurve(conn.from.x, conn.from.y, conn.to.x, conn.to.y)}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth="3.5"
                  strokeOpacity="0.1"
                />
                <path
                  d={getBezierCurve(conn.from.x, conn.from.y, conn.to.x, conn.to.y)}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray={conn.style === "dashed" ? "4,4" : undefined}
                />
              </g>
            ))}
          </svg>

          {/* Three-Column Topological Grid */}
          <div className="relative z-10 grid grid-cols-3 gap-12 p-1 min-w-[900px] select-none h-full overflow-y-auto">
            
            {/* COLUMN 1: Elements Events (Triggers) */}
            <div className="space-y-3 flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">1. Active Source Nodes</span>
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {activeElements.map((el) => (
                  <div 
                    key={el.id} 
                    className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5 hover:border-blue-500/40 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 flex-wrap gap-1">
                      <span className="text-[8px] bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded font-mono border border-blue-100">
                        {el.type}
                      </span>
                      <button 
                        onClick={() => onSelectElement(el.id)}
                        className="text-[9px] text-slate-400 hover:text-blue-600 font-bold transition"
                      >
                        EDIT ELEMENT
                      </button>
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-slate-800 font-mono">{el.id}</div>
                      {el.label && <div className="text-[10px] text-slate-450 italic truncate">"{el.label}"</div>}
                    </div>

                    {/* Output Pins */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {el.clickSequences.map((seq, seqIdx) => (
                        <div 
                          key={seqIdx}
                          id={`port-trigger-${el.id}-seq-${seq.clickIndex}`}
                          className="flex items-center justify-between bg-slate-50 border border-slate-150 px-2 py-1 rounded text-[10px] font-mono font-semibold text-slate-500 h-6"
                        >
                          <span className="flex items-center space-x-1">
                            <MousePointer className="w-3 h-3 text-blue-500" />
                            <span>Click {seq.clickIndex + 1} Pin</span>
                          </span>
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-xs"></span>
                        </div>
                      ))}

                      {el.conditions.map((cond, condIdx) => (
                        <div 
                          key={condIdx}
                          id={`port-trigger-${el.id}-cond-${cond.id}`}
                          className="flex items-center justify-between bg-slate-50 border border-slate-150 px-2 py-1 rounded text-[10px] font-mono font-semibold text-slate-500 h-6"
                        >
                          <span className="flex items-center space-x-1">
                            <GitBranch className="w-3 h-3 text-indigo-500" />
                            <span>Condition Pin</span>
                          </span>
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 border border-white shadow-xs"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: Intermediary Logic Checker Gates */}
            <div className="space-y-3 flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">2. Conditions / Sequences</span>
              <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                
                {/* 1. Condition checker modules */}
                {activeElements.flatMap(el => el.conditions).map((cond) => {
                  const parentEl = activeElements.find(e => e.conditions.some(c => c.id === cond.id));
                  return (
                    <div 
                      key={cond.id} 
                      className="bg-white border border-slate-205 shadow-xs rounded-xl p-3.5 space-y-3 relative hover:border-indigo-500/45 hover:shadow-sm transition"
                    >
                      {/* Left Input Port center */}
                      <div id={`port-cond-${cond.id}`} className="absolute left-[-5px] top-[40%] w-2.5 h-2.5 rounded-full bg-indigo-404 bg-indigo-500 border-2 border-white shadow-xs" />

                      <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                        <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 border border-indigo-100 font-extrabold rounded uppercase font-mono">
                          IF Gate
                        </span>
                        <button 
                          onClick={() => {
                            if (parentEl) {
                              onUpdateElement({
                                ...parentEl,
                                conditions: parentEl.conditions.filter((c) => c.id !== cond.id)
                              });
                            }
                          }}
                          className="text-[9px] text-red-500 hover:text-red-700 font-bold transition"
                        >
                          REMOVE
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800">{cond.name}</div>
                        <p className="text-[10px] text-slate-450 leading-normal">
                          Read <span className="font-mono text-blue-600 font-bold bg-slate-50 px-1 py-0.5 rounded border border-slate-100">{cond.sourceElementId}</span>, check if <span className="font-bold text-slate-700">{cond.conditionType}</span>
                          {cond.valueThreshold && <span> matches value <span className="font-mono text-indigo-600 font-bold bg-slate-50 px-1 rounded">"{cond.valueThreshold}"</span></span>}.
                        </p>
                      </div>

                      {/* Direction pin outcomes */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[10px] font-mono">
                        <div 
                          id={`port-cond-then-${cond.id}`}
                          className="flex items-center justify-between bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded"
                        >
                          <span>✔ THEN True Output</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div 
                          id={`port-cond-else-${cond.id}`}
                          className="flex items-center justify-between bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded"
                        >
                          <span>✘ ELSE False Output</span>
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Sequences steps modules */}
                {activeElements.flatMap(el => el.clickSequences).map((seq, seqIdx) => {
                  const parentEl = activeElements.find(e => e.clickSequences.some(s => s.clickIndex === seq.clickIndex));
                  if (!parentEl) return null;
                  
                  return (
                    <div 
                      key={`${parentEl.id}-seq-${seq.clickIndex}`}
                      className="bg-white border border-slate-200 shadow-xs rounded-xl p-3.5 space-y-3 relative hover:border-blue-500/40 hover:shadow-sm transition"
                    >
                      {/* Left input Pin */}
                      <div id={`port-middle-${parentEl.id}-seq-${seq.clickIndex}`} className="absolute left-[-5px] top-[40%] w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-xs" />

                      <div className="flex items-center justify-between border-b border-blue-50 pb-2">
                        <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 border border-blue-100 font-bold rounded font-mono">
                          STEP CLICK {seq.clickIndex + 1}
                        </span>
                        <button 
                          onClick={() => {
                            onUpdateElement({
                              ...parentEl,
                              clickSequences: parentEl.clickSequences.filter((s) => s.clickIndex !== seq.clickIndex)
                            });
                          }}
                          className="text-[9px] text-red-500 hover:text-red-700 font-bold transition"
                        >
                          DISCARD
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800">Sequential click mapping</div>
                        <p className="text-[10px] text-slate-450 leading-light font-light">Dispatches associated outcomes strictly on click ordinal #{seq.clickIndex + 1}.</p>
                      </div>

                      {/* Right output Pin */}
                      <div 
                        id={`port-middle-out-${parentEl.id}-seq-${seq.clickIndex}`}
                        className="flex items-center justify-between bg-slate-50 border border-slate-150 px-2.5 py-1 rounded text-[10px] font-semibold text-slate-500 font-mono h-6.5"
                      >
                        <span className="flex items-center space-x-1.5">
                          <Play className="w-3 h-3 text-emerald-500" />
                          <span>Dispatch Pin</span>
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 3: Outcome Actions */}
            <div className="space-y-3 flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">3. Action Outcome Cards</span>
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {activeElements.flatMap(el => {
                  const list: Array<{ 
                    action: Action; 
                    parentEl: CanvasElement; 
                    isCond: boolean; 
                    parentRuleId?: string; 
                    isSuccess?: boolean; 
                    seqIndex?: number;
                  }> = [];
                  el.clickSequences.forEach(seq => {
                    seq.actions.forEach(act => list.push({ action: act, parentEl: el, isCond: false, seqIndex: seq.clickIndex }));
                  });
                  el.conditions.forEach(cond => {
                    cond.successActions.forEach(act => list.push({ action: act, parentEl: el, isCond: true, parentRuleId: cond.id, isSuccess: true }));
                    cond.failActions.forEach(act => list.push({ action: act, parentEl: el, isCond: true, parentRuleId: cond.id, isSuccess: false }));
                  });
                  return list;
                }).map(({ action, parentEl, isCond, parentRuleId, isSuccess, seqIndex }) => (
                  <div 
                    key={action.id} 
                    id={`port-action-${action.id}`}
                    className="bg-white border border-slate-200 shadow-xs rounded-xl p-3.5 space-y-2.5 relative hover:border-emerald-505 hover:border-emerald-500/40 hover:shadow-sm transition"
                  >
                    {/* Left input port connector */}
                    <div className="absolute left-[-5px] top-[40%] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-md z-10" />

                    <div className="flex items-center justify-between border-b border-emerald-50 pb-1.5">
                      <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 border border-emerald-100 font-extrabold rounded uppercase font-mono">
                        {action.type.replace("Display", "")}
                      </span>
                      <button 
                        onClick={() => {
                          if (isCond) {
                            onUpdateElement({
                              ...parentEl,
                              conditions: parentEl.conditions.map(c => {
                                if (c.id === parentRuleId) {
                                  return {
                                    ...c,
                                    successActions: isSuccess ? c.successActions.filter(a => a.id !== action.id) : c.successActions,
                                    failActions: !isSuccess ? c.failActions.filter(a => a.id !== action.id) : c.failActions
                                  };
                                }
                                return c;
                              })
                            });
                          } else {
                            onUpdateElement({
                              ...parentEl,
                              clickSequences: parentEl.clickSequences.map(s => {
                                if (s.clickIndex === seqIndex) {
                                  return { ...s, actions: s.actions.filter(a => a.id !== action.id) };
                                }
                                return s;
                              })
                            });
                          }
                        }}
                        className="text-[9px] text-red-500 hover:text-red-700 font-bold transition"
                      >
                        REMOVE
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[10px] leading-relaxed">
                      {action.type === "Navigate" && (
                        <div>
                          <span className="text-slate-400">Routes viewport: </span>
                          <span className="font-bold text-slate-700 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                            {pages.find(p => p.id === action.params.targetPageId)?.name || action.params.targetPageId || "Selected view"}
                          </span>
                        </div>
                      )}
                      
                      {action.type === "DisplayNotification" && (
                        <div>
                          <p className="text-slate-400">Notification body: </p>
                          <p className="font-semibold text-slate-600 font-mono bg-slate-50 p-1.5 border border-slate-150 rounded leading-tight w-full whitespace-pre-wrap break-all">
                            "{action.params.notificationMessage}"
                          </p>
                        </div>
                      )}

                      {action.type === "DisplayPopup" && (
                        <div className="space-y-1 bg-slate-50 p-1.5 rounded border border-slate-150">
                          <p className="text-slate-500">Popup heading: <span className="font-extrabold text-slate-700">"{action.params.popupTitle}"</span></p>
                          <p className="text-[9px] text-slate-400 font-light truncate">"{action.params.popupMessage}"</p>
                        </div>
                      )}

                      {["ShowElement", "HideElement", "ToggleElement", "ChangeText", "TriggerAnimation"].includes(action.type) && (
                        <div className="space-y-1">
                          <p className="text-slate-400">Target Selector ID: <span className="font-mono text-blue-600 font-bold">{action.params.targetElementId || "None"}</span></p>
                          {action.params.textValue && <p className="text-slate-400">Setter Value: <span className="font-bold text-slate-700">"{action.params.textValue}"</span></p>}
                          {action.params.animationName && <p className="text-slate-400">Selected Animation: <span className="font-bold text-indigo-600">{action.params.animationName}</span></p>}
                        </div>
                      )}

                      {action.type === "OpenUrl" && (
                        <div>
                          <span className="text-slate-400">Redirect Web URL: </span>
                          <span className="font-mono text-blue-500 underline truncate block max-w-full">{action.params.url}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Logic connection Wizard overlay popup modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto select-none">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative space-y-4 animate-zoom" id="logic-wizard-modal">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="wizard-header">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-extrabold text-slate-900">Custom Interaction Logic Wizard</h3>
              </div>
              <button 
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Select Interactive element trigger source */}
            <div className="space-y-1.5" id="wizard-step-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Select Trigger UI Widget Source</label>
              <select
                value={sourceElId}
                onChange={(e) => setSourceElId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono focus:bg-white transition"
              >
                <option value="">Select an element...</option>
                {allElements.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.id} ({el.type}) - "{el.label || 'No label'}"
                  </option>
                ))}
              </select>
            </div>

            {sourceElId && (
              <>
                {/* Step 2: Select Logic Mode */}
                <div className="space-y-1.5" id="wizard-step-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Choose logic pipeline layout</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLogicMode("click")}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col space-y-1 cursor-pointer ${logicMode === "click" ? "border-blue-600 bg-blue-50/20 text-blue-600" : "border-slate-200 hover:border-slate-350 text-slate-650 hover:bg-slate-50"}`}
                    >
                      <span className="font-bold text-xs flex items-center space-x-1">
                        <MousePointer className="w-3.5 h-3.5" />
                        <span>Direct Click Sequence</span>
                      </span>
                      <span className="text-[10px] text-slate-400 leading-normal">Trigger actions on click event sequences (Click 1, Click 2, Click 3 etc.)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogicMode("cond")}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col space-y-1 cursor-pointer ${logicMode === "cond" ? "border-indigo-600 bg-indigo-50/20 text-indigo-600" : "border-slate-200 hover:border-slate-350 text-slate-650 hover:bg-slate-50"}`}
                    >
                      <span className="font-bold text-xs flex items-center space-x-1">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>If-Then-Else Checker</span>
                      </span>
                      <span className="text-[10px] text-slate-400 leading-normal">Evaluate conditions first before determining outcomes</span>
                    </button>
                  </div>
                </div>

                {/* Mode A: Click details */}
                {logicMode === "click" && (
                  <div className="space-y-3.5 pt-2 border-t border-slate-100" id="wizard-step-3-click">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordinal Click Index</label>
                      <select
                        value={clickIndex}
                        onChange={(e) => setClickIndex(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      >
                        <option value={0}>Click 1 Outcomes</option>
                        <option value={1}>Click 2 Outcomes</option>
                        <option value={2}>Click 3 Outcomes</option>
                        <option value={3}>Click 4 Outcomes</option>
                      </select>
                      <p className="text-[9px] text-slate-400 leading-normal font-light">Sets up multi-click progressive behavior (e.g., click 1, click 2, click 3 details with different outcomes).</p>
                    </div>

                    <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outcome Action Type</label>
                      <select
                        value={actionType}
                        onChange={(e) => {
                          setActionType(e.target.value as ActionType);
                          setActionParams({
                            notificationMessage: "Success action trigger!",
                            notificationType: "success"
                          });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                      >
                        <option value="DisplayNotification">Display Toast Notification</option>
                        <option value="DisplayPopup">Show Popup Alert Dialog</option>
                        <option value="Navigate">Navigate to Viewport Page</option>
                        <option value="ShowElement">Show Element (Visible)</option>
                        <option value="HideElement">Hide Element (Invisible)</option>
                        <option value="ToggleElement">Toggle Element Visibility</option>
                        <option value="ChangeText">Set Input value/label text</option>
                        <option value="TriggerAnimation">Trigger micro-animation bounce</option>
                        <option value="OpenUrl">Open custom web URL redirection</option>
                        <option value="ResetForm">Reset forms state value</option>
                      </select>
                    </div>

                    {/* Param loaders */}
                    {actionType === "DisplayNotification" && (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Notification content</span>
                          <input
                            type="text"
                            placeholder="e.g. Settings loaded successfully!"
                            value={actionParams.notificationMessage || ""}
                            onChange={(e) => setActionParams(prev => ({ ...prev, notificationMessage: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {actionType === "DisplayPopup" && (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Popup Title</span>
                          <input
                            type="text"
                            placeholder="e.g. Warning: Invalid Session"
                            value={actionParams.popupTitle || ""}
                            onChange={(e) => setActionParams(prev => ({ ...prev, popupTitle: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Detailed Body description</span>
                          <textarea
                            placeholder="Describe action requirement..."
                            rows={2}
                            value={actionParams.popupMessage || ""}
                            onChange={(e) => setActionParams(prev => ({ ...prev, popupMessage: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none resize-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {actionType === "Navigate" && (
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Select target page</span>
                        <select
                          value={actionParams.targetPageId || ""}
                          onChange={(e) => setActionParams(prev => ({ ...prev, targetPageId: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                        >
                          <option value="">Choose view...</option>
                          {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    )}

                    {["ShowElement", "HideElement", "ToggleElement", "ChangeText", "TriggerAnimation"].includes(actionType) && (
                      <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Target Canvas element ID pointer</span>
                          <select
                            value={actionParams.targetElementId || ""}
                            onChange={(e) => setActionParams(prev => ({ ...prev, targetElementId: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono"
                          >
                            <option value="">Select ID...</option>
                            {allElements.map(el => <option key={el.id} value={el.id}>{el.id} ({el.type})</option>)}
                          </select>
                        </div>
                        {actionType === "ChangeText" && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">New custom labels message</span>
                            <input
                              type="text"
                              value={actionParams.textValue || ""}
                              onChange={(e) => setActionParams(prev => ({ ...prev, textValue: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 outline-none"
                            />
                          </div>
                        )}
                        {actionType === "TriggerAnimation" && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Select micro animation</span>
                            <select
                              value={actionParams.animationName || "bounce"}
                              onChange={(e) => setActionParams(prev => ({ ...prev, animationName: e.target.value }))}
                              className="w-full bg-white border border-slate-150 rounded-lg px-2 py-1 text-xs text-slate-800"
                            >
                              <option value="bounce">Bounce micro-physics</option>
                              <option value="shake">Shake alarm physics</option>
                              <option value="zoom">Zoom target pop</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {actionType === "OpenUrl" && (
                      <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Custom web redirect URL</span>
                        <input
                          type="text"
                          placeholder="https://google.com"
                          value={actionParams.url || ""}
                          onChange={(e) => setActionParams(prev => ({ ...prev, url: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Mode B: Conditional rules */}
                {logicMode === "cond" && (
                  <div className="space-y-4 pt-2 border-t border-slate-100" id="wizard-step-3-cond">
                    <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Workflow rule label name</span>
                        <input
                          type="text"
                          placeholder="e.g. check username compliance"
                          value={condName}
                          onChange={(e) => setCondName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white border focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Read Element value</span>
                          <select
                            value={condTargetValueField}
                            onChange={(e) => setCondTargetValueField(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono"
                          >
                            <option value="">Select element ID...</option>
                            {allElements.map(el => (
                              <option key={el.id} value={el.id}>{el.id} ({el.type})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Comparative Gate type</span>
                          <select
                            value={condType}
                            onChange={(e) => setCondType(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
                          >
                            <option value="Empty">Is Empty (Unfilled)</option>
                            <option value="NotEmpty">Is Not Empty (Has Entry)</option>
                            <option value="Equals">Value Equals...</option>
                            <option value="Checked">Is Checked (True)</option>
                            <option value="Unchecked">Is Unchecked (False)</option>
                          </select>
                        </div>
                      </div>

                      {condType === "Equals" && (
                        <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Threshold comparison text</span>
                          <input
                            type="text"
                            placeholder="Insert secret match here..."
                            value={condThreshold}
                            onChange={(e) => setCondThreshold(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* THEN clause outcome */}
                    <div className="space-y-2.5 bg-teal-50/30 p-3.5 rounded-2xl border border-teal-100">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block font-mono">✔ THEN OUTCOME (If match condition holds)</span>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-slate-400 font-mono block">True Outcome Action</span>
                        <select
                          value={successActionType}
                          onChange={(e) => {
                            setSuccessActionType(e.target.value as ActionType);
                            setSuccessParams({
                              notificationMessage: "Condition verified successfully!",
                              notificationType: "success"
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                        >
                          <option value="DisplayNotification">Show success Toast Notification</option>
                          <option value="Navigate">Route viewport page destination</option>
                          <option value="ShowElement">Show Target element selector</option>
                          <option value="HideElement">Hide Target element selector</option>
                        </select>
                      </div>

                      {successActionType === "DisplayNotification" && (
                        <input
                          type="text"
                          placeholder="Truth toast prompt..."
                          value={successParams.notificationMessage || ""}
                          onChange={(e) => setSuccessParams({ ...successParams, notificationMessage: e.target.value, notificationType: "success" })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      )}
                      {successActionType === "Navigate" && (
                        <select
                          value={successParams.targetPageId || ""}
                          onChange={(e) => setSuccessParams({ ...successParams, targetPageId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                        >
                          <option value="">Select view...</option>
                          {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                      {["ShowElement", "HideElement"].includes(successActionType) && (
                        <select
                          value={successParams.targetElementId || ""}
                          onChange={(e) => setSuccessParams({ ...successParams, targetElementId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-805 font-mono"
                        >
                          <option value="">Select Canvas target ID...</option>
                          {allElements.map(el => <option key={el.id} value={el.id}>{el.id}</option>)}
                        </select>
                      )}
                    </div>

                    {/* ELSE clause outcome */}
                    <div className="space-y-2.5 bg-red-50/25 p-3.5 rounded-2xl border border-red-100">
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block font-mono">✘ ELSE OUTCOME (Otherwise)</span>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-slate-400 font-mono block font-mono">Otherwise Outcome Action</span>
                        <select
                          value={failActionType}
                          onChange={(e) => {
                            setFailActionType(e.target.value as ActionType);
                            setFailParams({
                              notificationMessage: "Condition check did not match.",
                              notificationType: "error"
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                        >
                          <option value="DisplayNotification">Show error Toast Notification</option>
                          <option value="Navigate font-bold">Route viewport page destination</option>
                          <option value="ShowElement">Show Target element selector</option>
                          <option value="HideElement">Hide Target element selector</option>
                        </select>
                      </div>

                      {failActionType === "DisplayNotification" && (
                        <input
                          type="text"
                          placeholder="Otherwise prompt text..."
                          value={failParams.notificationMessage || ""}
                          onChange={(e) => setFailParams({ ...failParams, notificationMessage: e.target.value, notificationType: "error" })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-805 outline-none focus:ring-1 focus:ring-red-500"
                        />
                      )}
                      {failActionType === "Navigate" && (
                        <select
                          value={failParams.targetPageId || ""}
                          onChange={(e) => setFailParams({ ...failParams, targetPageId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                        >
                          <option value="">Select view...</option>
                          {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                      {["ShowElement", "HideElement"].includes(failActionType) && (
                        <select
                          value={failParams.targetElementId || ""}
                          onChange={(e) => setFailParams({ ...failParams, targetElementId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono"
                        >
                          <option value="">Select Canvas target ID...</option>
                          {allElements.map(el => <option key={el.id} value={el.id}>{el.id}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit layout outcomes */}
                <div className="flex justify-end items-center space-x-2.5 pt-3 border-t border-slate-100" id="wizard-footer">
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-205 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConnection}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/15 cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span>Establish Logic Path</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
