import React, { useState } from "react";
import { CanvasElement, Page, Action, ActionType, ConditionRule } from "../types";
import { Settings, MousePointerClick, ShieldAlert, Plus, Trash2, ArrowRight, ArrowUp, ArrowDown, ArrowLeft, Eye, ShieldCheck, Layers, EyeOff, Lock, Unlock } from "lucide-react";

interface PropertyEditorProps {
  element: CanvasElement;
  pages: Page[];
  allElements: CanvasElement[];
  onUpdateElement: (updated: CanvasElement) => void;
}

export default function PropertyEditor({
  element,
  pages,
  onUpdateElement,
  allElements,
}: PropertyEditorProps) {
  const [activeTab, setActiveTab] = useState<"general" | "click" | "conditions">("general");

  const elementTypesWithPlaceholder = [
    "Text Input",
    "Email Input",
    "Password Input",
    "Phone Input",
    "Number Input",
    "Text Area",
  ];
  const elementTypesWithOptions = ["Dropdown", "Radio Button"];

  // Update styles helper
  const handleStyleChange = (key: string, value: any) => {
    onUpdateElement({
      ...element,
      styles: {
        ...element.styles,
        [key]: value,
      },
    });
  };

  // Click handler helpers
  const handleAddClickSequence = () => {
    const nextIndex = element.clickSequences.length;
    onUpdateElement({
      ...element,
      clickSequences: [
        ...element.clickSequences,
        { clickIndex: nextIndex, actions: [] },
      ],
    });
  };

  const handleRemoveClickSequence = (idx: number) => {
    const nextSequences = element.clickSequences
      .filter((s) => s.clickIndex !== idx)
      .map((s, index) => ({ ...s, clickIndex: index })); // re-index

    onUpdateElement({
      ...element,
      clickSequences: nextSequences,
    });
  };

  const handleAddAction = (clickIdx: number) => {
    const newAction: Action = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: "DisplayNotification",
      params: {
        notificationMessage: "Action triggered!",
        notificationType: "success",
      },
    };

    const nextSequences = element.clickSequences.map((seq) => {
      if (seq.clickIndex === clickIdx) {
        return {
          ...seq,
          actions: [...seq.actions, newAction],
        };
      }
      return seq;
    });

    onUpdateElement({
      ...element,
      clickSequences: nextSequences,
    });
  };

  const handleRemoveAction = (clickIdx: number, actionId: string) => {
    const nextSequences = element.clickSequences.map((seq) => {
      if (seq.clickIndex === clickIdx) {
        return {
          ...seq,
          actions: seq.actions.filter((a) => a.id !== actionId),
        };
      }
      return seq;
    });

    onUpdateElement({
      ...element,
      clickSequences: nextSequences,
    });
  };

  const handleUpdateAction = (clickIdx: number, actionId: string, updatedFields: Partial<Action>) => {
    const nextSequences = element.clickSequences.map((seq) => {
      if (seq.clickIndex === clickIdx) {
        return {
          ...seq,
          actions: seq.actions.map((act) => {
            if (act.id === actionId) {
              return {
                ...act,
                ...updatedFields,
                params: { ...act.params, ...(updatedFields.params || {}) },
              };
            }
            return act;
          }),
        };
      }
      return seq;
    });

    onUpdateElement({
      ...element,
      clickSequences: nextSequences,
    });
  };

  // Conditions helpers
  const handleAddCondition = () => {
    const newCond: ConditionRule = {
      id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `Condition ${element.conditions.length + 1}`,
      sourceElementId: allElements[0]?.id || "",
      conditionType: "Empty",
      successActions: [],
      failActions: [],
    };

    onUpdateElement({
      ...element,
      conditions: [...element.conditions, newCond],
    });
  };

  const handleRemoveCondition = (condId: string) => {
    onUpdateElement({
      ...element,
      conditions: element.conditions.filter((c) => c.id !== condId),
    });
  };

  const handleUpdateCondition = (condId: string, fields: Partial<ConditionRule>) => {
    onUpdateElement({
      ...element,
      conditions: element.conditions.map((c) => {
        if (c.id === condId) {
          return { ...c, ...fields };
        }
        return c;
      }),
    });
  };

  const handleAddConditionAction = (condId: string, isSuccess: boolean) => {
    const newAct: Action = {
      id: `act-${Date.now()}`,
      type: "DisplayNotification",
      params: {
        notificationMessage: "Condition action run!",
        notificationType: "warning",
      },
    };

    onUpdateElement({
      ...element,
      conditions: element.conditions.map((c) => {
        if (c.id === condId) {
          return {
            ...c,
            successActions: isSuccess ? [...c.successActions, newAct] : c.successActions,
            failActions: !isSuccess ? [...c.failActions, newAct] : c.failActions,
          };
        }
        return c;
      }),
    });
  };

  const handleRemoveConditionAction = (condId: string, isSuccess: boolean, actId: string) => {
    onUpdateElement({
      ...element,
      conditions: element.conditions.map((c) => {
        if (c.id === condId) {
          return {
            ...c,
            successActions: isSuccess ? c.successActions.filter((a) => a.id !== actId) : c.successActions,
            failActions: !isSuccess ? c.failActions.filter((a) => a.id !== actId) : c.failActions,
          };
        }
        return c;
      }),
    });
  };

  const handleUpdateConditionAction = (condId: string, isSuccess: boolean, actId: string, fields: Partial<Action>) => {
    onUpdateElement({
      ...element,
      conditions: element.conditions.map((c) => {
        if (c.id === condId) {
          const mapper = (act: Action) => {
            if (act.id === actId) {
              return {
                ...act,
                ...fields,
                params: { ...act.params, ...(fields.params || {}) },
              };
            }
            return act;
          };
          return {
            ...c,
            successActions: isSuccess ? c.successActions.map(mapper) : c.successActions,
            failActions: !isSuccess ? c.failActions.map(mapper) : c.failActions,
          };
        }
        return c;
      }),
    });
  };

  const ACTION_TYPES: { value: ActionType; label: string }[] = [
    { value: "DisplayNotification", label: "Display Notification" },
    { value: "DisplayPopup", label: "Show Modal Popup" },
    { value: "Navigate", label: "Navigate to Page" },
    { value: "ShowElement", label: "Show Element" },
    { value: "HideElement", label: "Hide Element" },
    { value: "ToggleElement", label: "Toggle Visibility" },
    { value: "ChangeText", label: "Set Element Value" },
    { value: "ChangeStyle", label: "Mutate Styles" },
    { value: "OpenUrl", label: "Redirect web URL" },
    { value: "DownloadFile", label: "Download Asset File" },
    { value: "TriggerAnimation", label: "Perform animation wave" },
    { value: "SubmitForm", label: "Submit Form" },
    { value: "ResetForm", label: "Clear Form Inputs" },
    { value: "TogglePasswordMasking", label: "Toggle Password Vis (Mask/Unmask)" },
    { value: "ToggleCheckbox", label: "Toggle Checkbox Checkmark" },
  ];

  const STYLE_COLORS = [
    { name: "Default (Indigo)", bg: "#2563eb", text: "#ffffff", border: "#1e3a8a" },
    { name: "Emerald Success", bg: "#10b981", text: "#ffffff", border: "#064e3b" },
    { name: "Crimson Stop", bg: "#ef4444", text: "#ffffff", border: "#7f1d1d" },
    { name: "Deep Amber", bg: "#f59e0b", text: "#0f172a", border: "#78350f" },
    { name: "Elegant Charcoal", bg: "#1e293b", text: "#f8fafc", border: "#334155" },
    { name: "Paper Clean", bg: "#f8fafc", text: "#0f172a", border: "#cbd5e1" },
    { name: "Minimal Outlined", bg: "transparent", text: "#2563eb", border: "#2563eb" },
  ];

  return (
    <div className="bg-white border-l border-slate-200 w-80 h-full flex flex-col font-sans text-slate-800 shadow-sm" id="prop-editor-pane">
      {/* Editor Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between" id="editor-header">
        <div>
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
            {element.type}
          </span>
          <h4 className="font-bold text-sm text-slate-800 truncate w-40">{element.id}</h4>
        </div>
        <div className="flex items-center space-x-2" id="header-helpers">
          <button
            onClick={() => onUpdateElement({ ...element, locked: !element.locked })}
            className={`p-1.5 rounded-lg transition-all ${element.locked ? "bg-amber-100 text-amber-700 border border-amber-200" : "text-slate-400 hover:bg-slate-100"}`}
            title={element.locked ? "Unlock element positions" : "Lock coordinates in place"}
          >
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onUpdateElement({ ...element, visible: !element.visible })}
            className={`p-1.5 rounded-lg transition-all ${!element.visible ? "bg-red-100 text-red-650 border border-red-200" : "text-slate-400 hover:bg-slate-100"}`}
            title="Toggle start visibility"
          >
            {element.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 text-center border-b border-slate-200 bg-slate-50 text-[11px] font-semibold" id="editor-tabs">
        <button
          onClick={() => setActiveTab("general")}
          className={`py-2.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${activeTab === "general" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"}`}
        >
          <Settings className="w-3 h-3" />
          <span>Config</span>
        </button>
        <button
          onClick={() => setActiveTab("click")}
          className={`py-2.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${activeTab === "click" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"}`}
        >
          <MousePointerClick className="w-3 h-3" />
          <span>Clicks ({element.clickSequences.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("conditions")}
          className={`py-2.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${activeTab === "conditions" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"}`}
        >
          <ShieldAlert className="w-3 h-3" />
          <span>Rules ({element.conditions.length})</span>
        </button>
      </div>

      {/* Editor scrollable list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5" id="tab-viewport">
        {activeTab === "general" && (
          <div className="space-y-4" id="pane-general">
            {/* Widget Identity */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider">ELEMENT SELECTOR (ID)</label>
              <input
                type="text"
                value={element.id}
                onChange={(e) => onUpdateElement({ ...element, id: e.target.value.replace(/[^a-zA-Z0-9]/g, "") })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Label and Content fields */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider">LABEL / IN-TEXT VALUE</label>
              <input
                type="text"
                value={element.label}
                onChange={(e) => onUpdateElement({ ...element, label: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500"
                placeholder="e.g. Save Changes"
              />
            </div>

            {/* If element is Image, configure source url & upload option */}
            {element.type === "Image" && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-orange-400 tracking-wider flex items-center space-x-1">
                    <span>IMAGE SOURCE URL</span>
                  </label>
                  <input
                    type="text"
                    value={element.imageUrl || ""}
                    onChange={(e) => onUpdateElement({ ...element, imageUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500 font-mono"
                    placeholder="https://example.com/image.png"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-orange-400 tracking-wider block">OR UPLOAD LOCAL IMAGE</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          onUpdateElement({ ...element, imageUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-500">
                    This automatically parses local pictures into a secure base64 string.
                  </p>
                </div>
              </div>
            )}

            {/* If placeholders are applicable */}
            {elementTypesWithPlaceholder.includes(element.type) && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider">INPUT PLACEHOLDER</label>
                <input
                  type="text"
                  value={element.placeholder || ""}
                  onChange={(e) => onUpdateElement({ ...element, placeholder: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500"
                  placeholder="Insert field ghost text..."
                />
              </div>
            )}

            {/* If options exist */}
            {elementTypesWithOptions.includes(element.type) && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider">OPTIONS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={element.options || ""}
                  onChange={(e) => onUpdateElement({ ...element, options: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500"
                  placeholder="e.g. Basic, Standard, Premium"
                />
                <p className="text-[9px] text-slate-500">Provide comma-separated drop items.</p>
              </div>
            )}

            {/* If Checkbox link exists */}
            {element.type === "Checkbox" && (
              <div className="space-y-1.5 border-t border-slate-800/60 pt-3">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Show Password Functional Link</label>
                <select
                  value={element.togglePasswordTargetId || ""}
                  onChange={(e) => onUpdateElement({ ...element, togglePasswordTargetId: e.target.value || undefined })}
                  className="w-full bg-slate-950 text-xs border border-slate-800 rounded-lg h-8 px-2 text-slate-200 outline-none focus:border-blue-500 font-mono"
                >
                  <option value="">-- Standard Checkbox --</option>
                  {allElements
                    .filter((el) => ["Password Input", "Text Input", "Email Input"].includes(el.type))
                    .map((el) => (
                      <option key={el.id} value={el.id}>
                        Toggle visibility of ID: {el.id} ({el.type})
                      </option>
                    ))}
                </select>
                <p className="text-[9px] text-slate-500">
                  Choose a password input selector. Checking this checkbox will automatically unmask/reveal password contents on that target field.
                </p>
              </div>
            )}

            {/* Layer Level */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider flex items-center justify-between">
                <span>Z-INDEX DECK LEVEL</span>
                <span className="font-mono text-blue-400 text-[10px]">z-{element.zIndex || 10}</span>
              </label>
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={element.zIndex || 10}
                  onChange={(e) => onUpdateElement({ ...element, zIndex: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* Design preset palette */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider">QUICK STYLING PRESET</label>
              <div className="grid grid-cols-4 gap-1.5">
                {STYLE_COLORS.map((style, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onUpdateElement({
                        ...element,
                        styles: {
                          ...element.styles,
                          backgroundColor: style.bg,
                          color: style.text,
                          borderColor: style.border,
                          borderWidth: style.bg === "transparent" ? "2px" : "1px",
                          borderRadius: "8px",
                        },
                      });
                    }}
                    style={{ backgroundColor: style.bg === "transparent" ? "#0f172a" : style.bg, border: `1px solid ${style.border === "transparent" ? "#475569" : style.border}` }}
                    className="h-8 rounded-lg relative cursor-pointer group"
                    title={style.name}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/70 rounded-lg text-[8px] text-white">
                      Fit
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Styles tweak */}
            <div className="space-y-3.5 border-t border-slate-800/80 pt-3" id="style-fine-tuners">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Fine-Tuning Styles</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Background Color</span>
                  <input
                    type="color"
                    value={element.styles.backgroundColor && element.styles.backgroundColor !== "transparent" ? element.styles.backgroundColor : "#3b82f6"}
                    onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded h-7 p-0 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Text Accent Color</span>
                  <input
                    type="color"
                    value={element.styles.color || "#ffffff"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded h-7 p-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Border Radius (px)</span>
                  <select
                    value={element.styles.borderRadius || "8px"}
                    onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                    className="w-full bg-slate-950 text-xs border border-slate-800 rounded h-7 px-1 text-slate-200 outline-none"
                  >
                    <option value="0px">None (Square)</option>
                    <option value="4px">4px (Subtle)</option>
                    <option value="8px">8px (Standard)</option>
                    <option value="12px">12px (Smooth)</option>
                    <option value="16px">16px (Card)</option>
                    <option value="999px">999px (Pill)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Opacity (%)</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(element.styles.opacity ?? 1) * 100}
                    onChange={(e) => handleStyleChange("opacity", Number(e.target.value) / 100)}
                    className="w-full h-7 accent-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-800/40 pt-2.5">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Font Size (Sizing)</span>
                  <select
                    value={element.styles.fontSize || "13px"}
                    onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                    className="w-full bg-slate-950 text-xs border border-slate-800 rounded h-7 px-1 text-slate-200 outline-none"
                  >
                    <option value="9px">9px (Micro)</option>
                    <option value="10px">10px (Very Small)</option>
                    <option value="11px">11px (Compact)</option>
                    <option value="12px">12px (Small)</option>
                    <option value="13px">13px (Regular)</option>
                    <option value="14px">14px (Normal)</option>
                    <option value="15px">15px (Medium)</option>
                    <option value="16px">16px (Lead)</option>
                    <option value="18px">18px (Pre-Title)</option>
                    <option value="20px">20px (Title SM)</option>
                    <option value="24px">24px (Title MD)</option>
                    <option value="28px">28px (Title LG)</option>
                    <option value="32px">32px (Header SM)</option>
                    <option value="36px">36px (Header LG)</option>
                    <option value="42px">42px (Display)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">Font Face (Family)</span>
                  <select
                    value={element.styles.fontFamily || "Inter"}
                    onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
                    className="w-full bg-slate-950 text-xs border border-slate-800 rounded h-7 px-1 text-slate-200 outline-none"
                  >
                    <option value="Inter">Inter (Clean Sans)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech)</option>
                    <option value="Playfair Display">Playfair (Serif)</option>
                    <option value="JetBrains Mono">JetBrains (Mono)</option>
                    <option value="system-ui">System Default</option>
                  </select>
                </div>
              </div>

              {/* Exact Geometry Adjuster */}
              <div className="space-y-2 border-t border-slate-800/85 pt-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Precision Geometry</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400">Width (%)</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={Math.round(element.width)}
                      onChange={(e) => onUpdateElement({ ...element, width: Math.max(1, Math.min(100, Number(e.target.value))) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded h-7 px-1.5 text-xs text-slate-100 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400">Height (%)</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={Math.round(element.height)}
                      onChange={(e) => onUpdateElement({ ...element, height: Math.max(1, Math.min(100, Number(e.target.value))) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded h-7 px-1.5 text-xs text-slate-100 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400">Position X (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(element.x)}
                      onChange={(e) => onUpdateElement({ ...element, x: Math.max(0, Math.min(100, Number(e.target.value))) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded h-7 px-1.5 text-xs text-slate-100 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400">Position Y (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(element.y)}
                      onChange={(e) => onUpdateElement({ ...element, y: Math.max(0, Math.min(100, Number(e.target.value))) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded h-7 px-1.5 text-xs text-slate-100 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Tactile nudging arrow buttons */}
                <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">Move Element Nudger</span>
                    <span className="text-[8px] text-slate-500 font-mono">Steps of 1%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    {/* Up */}
                    <button
                      type="button"
                      onClick={() => onUpdateElement({ ...element, y: Math.max(0, element.y - 1) })}
                      className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 active:bg-blue-600 hover:scale-105 active:scale-95 text-slate-300 transition-all cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    {/* Left & Right */}
                    <div className="flex items-center space-x-6 my-1">
                      <button
                        type="button"
                        onClick={() => onUpdateElement({ ...element, x: Math.max(0, element.x - 1) })}
                        className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 active:bg-blue-600 hover:scale-105 active:scale-95 text-slate-300 transition-all cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700/65" />

                      <button
                        type="button"
                        onClick={() => onUpdateElement({ ...element, x: Math.min(100 - element.width, element.x + 1) })}
                        className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 active:bg-blue-600 hover:scale-105 active:scale-95 text-slate-300 transition-all cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Down */}
                    <button
                      type="button"
                      onClick={() => onUpdateElement({ ...element, y: Math.min(100 - element.height, element.y + 1) })}
                      className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 active:bg-blue-600 hover:scale-105 active:scale-95 text-slate-300 transition-all cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Element Overrides */}
              <div className="space-y-2 border-t border-slate-800/85 pt-3">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Interactive Overrides</span>
                <div className="space-y-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/70">
                  <label className="flex items-center space-x-2 text-[10px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!element.styles.transparent}
                      onChange={(e) => handleStyleChange("transparent", e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Transparent background</span>
                  </label>
                  <label className="flex items-center space-x-2 text-[10px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!element.styles.noBorder}
                      onChange={(e) => handleStyleChange("noBorder", e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <span>No outer outline/border</span>
                  </label>
                  <label className="flex items-center space-x-2 text-[10px] text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!element.styles.invisibleOnScreen}
                      onChange={(e) => handleStyleChange("invisibleOnScreen", e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold text-amber-400">Invisible-on-screen hit area</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLICK ACTION tab (Sequences of multi clicks) */}
        {activeTab === "click" && (
          <div className="space-y-4" id="pane-click-seq">
            <div className="flex items-center justify-between" id="click-section-top">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">MULTI-CLICK EVENT PIPELINE</span>
              <button
                onClick={handleAddClickSequence}
                className="flex items-center space-x-1 text-blue-400 bg-blue-500/10 hover:bg-blue-600 hover:text-white px-2 py-1 rounded text-[10px] font-semibold border border-blue-500/20 active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>Add click node</span>
              </button>
            </div>

            {element.clickSequences.length === 0 ? (
              <div className="text-center py-6 text-slate-500 border border-slate-800 border-dashed rounded-lg bg-slate-950/20 text-xs px-4" id="empty-clicks-warn">
                No active actions. Click the button above to declare what happens when a user clicks this component.
              </div>
            ) : (
              <div className="space-y-4" id="click-sequences-list">
                {element.clickSequences.map((seq, sIdx) => (
                  <div key={seq.clickIndex} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5" id={`seq-${seq.clickIndex}`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5" id="seq-header">
                      <span className="text-xs font-bold text-blue-400 font-mono flex items-center space-x-1">
                        <span>● Click {seq.clickIndex + 1}</span>
                      </span>
                      <button
                        onClick={() => handleRemoveClickSequence(seq.clickIndex)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 hover:bg-slate-800 rounded"
                        title="Delete this click node"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Actions Inside Click */}
                    {seq.actions.length === 0 ? (
                      <div className="text-[10px] text-slate-500 font-medium py-1">No action dispatch rules.</div>
                    ) : (
                      <div className="space-y-2" id="click-actions-list">
                        {seq.actions.map((act) => (
                          <div key={act.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-2 relative" id={`act-row-${act.id}`}>
                            <div className="flex items-center justify-between" id="act-row-header">
                              <select
                                value={act.type}
                                onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { type: e.target.value as ActionType })}
                                className="bg-slate-950 text-[10px] font-bold text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 outline-none focus:border-blue-500"
                              >
                                {ACTION_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRemoveAction(seq.clickIndex, act.id)}
                                className="text-slate-500 hover:text-red-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Dynamically render properties based on ActionType */}
                            <div className="space-y-1.5 text-[10px]" id="act-configs">
                              {act.type === "Navigate" && (
                                <div className="space-y-0.5">
                                  <span className="text-slate-400">Target Page</span>
                                  <select
                                    value={act.params.targetPageId || ""}
                                    onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { targetPageId: e.target.value } })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-300 outline-none"
                                  >
                                    <option value="">-- Choose destination --</option>
                                    {pages.map((p) => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {["ShowElement", "HideElement", "ToggleElement", "TriggerElement"].includes(act.type) && (
                                <div className="space-y-0.5">
                                  <span className="text-slate-400">Target Element</span>
                                  <select
                                    value={act.params.targetElementId || ""}
                                    onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { targetElementId: e.target.value } })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-300 outline-none"
                                  >
                                    <option value="">-- Select widget on canv --</option>
                                    {allElements.map((el) => (
                                      <option key={el.id} value={el.id}>{el.id} ({el.type})</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {act.type === "ChangeText" && (
                                <div className="space-y-1.5">
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Target Element</span>
                                    <select
                                      value={act.params.targetElementId || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { targetElementId: e.target.value } })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-slate-300 outline-none"
                                    >
                                      <option value="">-- Select widget --</option>
                                      {allElements.map((el) => (
                                        <option key={el.id} value={el.id}>{el.id} ({el.type})</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Set To Value / Text</span>
                                    <input
                                      type="text"
                                      value={act.params.textValue || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { textValue: e.target.value } })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-100"
                                      placeholder="Value of element..."
                                    />
                                  </div>
                                </div>
                              )}

                              {act.type === "DisplayNotification" && (
                                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Alert Message</span>
                                    <input
                                      type="text"
                                      value={act.params.notificationMessage || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { notificationMessage: e.target.value } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-100"
                                      placeholder="Message content..."
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Alert Tone Style</span>
                                    <select
                                      value={act.params.notificationType || "info"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { notificationType: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="success">🟢 Success Toast</option>
                                      <option value="info">🔵 Information Toast</option>
                                      <option value="warning">🟡 Caution Warning</option>
                                      <option value="error">🔴 Error Stop</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Screen Position</span>
                                    <select
                                      value={act.params.toastPosition || "bottom-right"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { toastPosition: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="top-right">Top-Right Corner</option>
                                      <option value="top-left">Top-Left Corner</option>
                                      <option value="bottom-right">Bottom-Right Corner</option>
                                      <option value="bottom-left">Bottom-Left Corner</option>
                                      <option value="top-center">Top-Center</option>
                                      <option value="bottom-center">Bottom-Center</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Visual Theme skin</span>
                                    <select
                                      value={act.params.toastTheme || "colored"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { toastTheme: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="colored">Solid Colored Banner</option>
                                      <option value="dark">Charcoal Slate Dark</option>
                                      <option value="light">Flat High Light Mode</option>
                                      <option value="glass">Chic Frosted Glass Blur</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Duration (Seconds)</span>
                                    <input
                                      type="number"
                                      min="1"
                                      max="15"
                                      value={((act.params.toastDuration || 4000) / 1000)}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { toastDuration: Number(e.target.value) * 1000 } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-100 font-mono"
                                      placeholder="4"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-slate-400 pt-1">
                                    <span>Show Status Icon</span>
                                    <input
                                      type="checkbox"
                                      checked={act.params.toastShowIcon !== false}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { toastShowIcon: e.target.checked } })}
                                      className="rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                              )}

                              {act.type === "DisplayPopup" && (
                                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Popup Title</span>
                                    <input
                                      type="text"
                                      value={act.params.popupTitle || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupTitle: e.target.value } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-100"
                                      placeholder="Title header..."
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Popup Message Description</span>
                                    <textarea
                                      value={act.params.popupMessage || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupMessage: e.target.value } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-100"
                                      placeholder="Explanation message detail..."
                                      rows={2}
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Alignment Placement</span>
                                    <select
                                      value={act.params.popupPlacement || "center"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupPlacement: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="center">Middle Center Dialog</option>
                                      <option value="top">Top Header Dialog</option>
                                      <option value="bottom">Bottom Drawer Dialog</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Model Theme Skin</span>
                                    <select
                                      value={act.params.popupTheme || "fancy-light"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupTheme: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="fancy-light">Elegance Pure Light</option>
                                      <option value="classic-dark">Dark Charcoal Minimal</option>
                                      <option value="neon-glow">Glowing Space Cyber</option>
                                      <option value="danger-red">Security Warning Crimson</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Entrance Animation</span>
                                    <select
                                      value={act.params.popupAnimation || "zoom"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupAnimation: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="zoom">Scaling Pop-In (Zoom)</option>
                                      <option value="slideUp">Slide from Bottom</option>
                                      <option value="bounce">Subtle Bounce</option>
                                      <option value="fade">Gentle Fade</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Width Aspect Scale</span>
                                    <select
                                      value={act.params.popupWidth || "max-w-md"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupWidth: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="max-w-xs">Compact card (xs)</option>
                                      <option value="max-w-sm">Narrow panel (sm)</option>
                                      <option value="max-w-md">Med proportion (md)</option>
                                      <option value="max-w-lg">Stare table (lg)</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Backdrop treatment style</span>
                                    <select
                                      value={act.params.popupBackdropStyle || "dim"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupBackdropStyle: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="dim">Slightly Darkened overlay</option>
                                      <option value="blur">Deep Frosted Glass Blur</option>
                                      <option value="transparent">Transparent overlay</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-400 pt-1">
                                    <span>Show Close 'X' Button</span>
                                    <input
                                      type="checkbox"
                                      checked={act.params.popupShowCloseButton !== false}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { popupShowCloseButton: e.target.checked } })}
                                      className="rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                              )}

                              {act.type === "OpenUrl" && (
                                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">URL link (HTTP/S)</span>
                                    <input
                                      type="text"
                                      value={act.params.url || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { url: e.target.value } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-100"
                                      placeholder="https://google.com"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Open Destination</span>
                                    <select
                                      value={act.params.urlTarget || "_blank"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { urlTarget: e.target.value as any } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="_blank">New Browser Tab (_blank)</option>
                                      <option value="_self">Current Frame Tab (_self)</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-400 pt-1">
                                    <span>Warn Before Redirection</span>
                                    <input
                                      type="checkbox"
                                      checked={!!act.params.urlWarn}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { urlWarn: e.target.checked } })}
                                      className="rounded cursor-pointer"
                                    />
                                  </div>
                                  {act.params.urlWarn && (
                                    <div className="space-y-0.5">
                                      <span className="text-slate-400">Warner Message description</span>
                                      <input
                                        type="text"
                                        value={act.params.urlWarnMessage || ""}
                                        onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { urlWarnMessage: e.target.value } })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-100 text-[10px]"
                                        placeholder="Are you sure you want to proceed?"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {act.type === "TogglePasswordMasking" && (
                                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                  <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold font-mono">Masking Action settings</span>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Target password input</span>
                                    <select
                                      value={act.params.targetElementId || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { targetElementId: e.target.value } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="">-- Choose input field --</option>
                                      {allElements.filter(e => e.type === "Password Input" || e.type === "Text Input").map((el) => (
                                        <option key={el.id} value={el.id}>{el.id} ({el.type})</option>
                                      ))}
                                    </select>
                                  </div>
                                  <p className="text-[9px] text-slate-550 italic text-slate-500">
                                    Clicking this element will show or mask values typing into the password input frame dynamically!
                                  </p>
                                </div>
                              )}

                              {act.type === "ToggleCheckbox" && (
                                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                  <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold font-mono">Toggle checkmark settings</span>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Target checkbox</span>
                                    <select
                                      value={act.params.targetElementId || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { targetElementId: e.target.value } })}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300"
                                    >
                                      <option value="">-- Choose checkbox field --</option>
                                      {allElements.filter(e => e.type === "Checkbox").map((el) => (
                                        <option key={el.id} value={el.id}>{el.id}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <p className="text-[9px] text-slate-550 italic text-slate-500">
                                    Clicking this element will switch the target checkbox between checked and unchecked modes smoothly!
                                  </p>
                                </div>
                              )}

                              {act.type === "TriggerAnimation" && (
                                <div className="space-y-1.5">
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Select Widget To Animation</span>
                                    <select
                                      value={act.params.targetElementId || ""}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { targetElementId: e.target.value } })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1"
                                    >
                                      <option value="">-- Choose target --</option>
                                      {allElements.map((el) => (
                                        <option key={el.id} value={el.id}>{el.id}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400">Preset Motion Waves</span>
                                    <select
                                      value={act.params.animationName || "bounce"}
                                      onChange={(e) => handleUpdateAction(seq.clickIndex, act.id, { params: { animationName: e.target.value as any } })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-300"
                                    >
                                      <option value="fade">Instant Pulse Fade</option>
                                      <option value="bounce">Bounce Ripple</option>
                                      <option value="shake">Caution Shake</option>
                                      <option value="zoom">Pop Zoom</option>
                                      <option value="slideUp">Slide Reveal</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleAddAction(seq.clickIndex)}
                      className="w-full border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-900 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 font-semibold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Append trigger action</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONDITIONS (Validation Rules & Guards) */}
        {activeTab === "conditions" && (
          <div className="space-y-4 font-sans" id="pane-conditions">
            <div className="flex items-center justify-between font-sans" id="cond-section-top">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">CONDITIONAL GATEWAYS</span>
              <button
                onClick={handleAddCondition}
                className="flex items-center space-x-1 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded text-[10px] font-semibold border border-indigo-500/20 active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>New Gate</span>
              </button>
            </div>

            {element.conditions.length === 0 ? (
              <div className="text-center py-6 text-slate-500 border border-slate-800 border-dashed rounded-lg bg-slate-950/20 text-xs px-4" id="empty-conds-warn">
                No active conditional gateways. You can block button clicks unless validation checks are resolved first.
              </div>
            ) : (
              <div className="space-y-4" id="conditions-list">
                {element.conditions.map((cond) => {
                  const monitoredElement = allElements.find((el) => el.id === cond.sourceElementId);
                  const isCheckable = monitoredElement?.type === "Checkbox" || monitoredElement?.type === "Radio Button";

                  return (
                    <div key={cond.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-3" id={`cond-card-${cond.id}`}>
                      <div className="flex items-start justify-between border-b border-slate-800 pb-1.5" id="cond-meta-header">
                        <input
                          type="text"
                          value={cond.name}
                          onChange={(e) => handleUpdateCondition(cond.id, { name: e.target.value })}
                          className="bg-transparent text-xs font-bold text-indigo-400 outline-none focus:underline w-40"
                        />
                        <button
                          onClick={() => handleRemoveCondition(cond.id)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Rule criteria configuration */}
                      <div className="space-y-2 text-[10px]" id="rule-criteria-form">
                        <div className="space-y-0.5">
                          <span className="text-slate-500">Listen to UI Component:</span>
                          <select
                            value={cond.sourceElementId}
                            onChange={(e) => handleUpdateCondition(cond.id, { sourceElementId: e.target.value })}
                            className="w-full bg-slate-905 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-200"
                          >
                            <option value="">-- Choose input field --</option>
                            {allElements
                              .filter((e) => e.id !== element.id) // Can't depend on itself easily
                              .map((e) => (
                                <option key={e.id} value={e.id}>{e.id} ({e.type})</option>
                              ))}
                          </select>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-slate-500">Checking Rule Criteria:</span>
                          <select
                            value={cond.conditionType}
                            onChange={(e) => handleUpdateCondition(cond.id, { conditionType: e.target.value as any })}
                            className="w-full bg-slate-905 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-200"
                          >
                            <option value="Empty">Is Blank/Empty</option>
                            <option value="NotEmpty">Is filled with text</option>
                            <option value="Equals">Value is EXACTLY equal to</option>
                            <option value="NotEquals">Value does not equal</option>
                            <option value="Checked">Is Checkbox checked</option>
                            <option value="Unchecked">Is Checkbox unchecked</option>
                            <option value="LessThan">Length is LESS than (chars)</option>
                            <option value="GreaterThan">Length is MORE than (chars)</option>
                          </select>
                        </div>

                        {["Equals", "NotEquals", "LessThan", "GreaterThan"].includes(cond.conditionType) && (
                          <div className="space-y-0.5">
                            <span className="text-slate-500">Threshold Reference Value:</span>
                            <input
                              type="text"
                              value={cond.valueThreshold || ""}
                              onChange={(e) => handleUpdateCondition(cond.id, { valueThreshold: e.target.value })}
                              className="w-full bg-slate-905 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-100"
                              placeholder="e.g. 5 or admin"
                            />
                          </div>
                        )}
                      </div>

                      {/* Success / Failure actions pipeline */}
                      <div className="p-2 bg-indigo-900/10 border border-indigo-900/30 rounded-lg space-y-2" id="success-pipeline font-sans">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>If criteria matches (TRUE):</span>
                        </span>

                        <div className="space-y-1.5" id="succ-actions">
                          {cond.successActions.map((act) => (
                            <div key={act.id} className="bg-slate-950 p-1.5 rounded border border-slate-850 border-slate-800 flex items-center justify-between" id={`act-succ-${act.id}`}>
                              <span className="text-[9px] text-slate-300 font-mono truncate w-40">
                                {act.type === "DisplayNotification" ? "Toast Alert" : act.type}
                              </span>
                              <button
                                onClick={() => handleRemoveConditionAction(cond.id, true, act.id)}
                                className="text-slate-500 hover:text-red-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleAddConditionAction(cond.id, true)}
                          className="w-full text-center py-1 text-[9px] text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-850 rounded"
                        >
                          + Append positive response
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
