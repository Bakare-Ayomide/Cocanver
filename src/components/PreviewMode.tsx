import React, { useState, useEffect } from "react";
import { Project, Page, CanvasElement, Action, ConditionRule } from "../types";
import { X, ArrowLeft, Play, RefreshCw, Send, AlertCircle, FileSpreadsheet, CheckCircle, Bell, ExternalLink, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const getRgbaColor = (hex: string | undefined, opacity: number = 1): string => {
  if (!hex) return "transparent";
  if (hex === "transparent") return "transparent";
  if (hex.startsWith("rgb")) return hex;
  const cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return hex;
};

interface PreviewModeProps {
  project: Project;
  onClose: () => void;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  theme?: 'dark' | 'light' | 'colored' | 'glass';
  showIcon?: boolean;
  duration?: number;
}

interface ModalPopupState {
  title: string;
  message: string;
  placement?: 'center' | 'top' | 'bottom';
  theme?: 'classic-dark' | 'fancy-light' | 'neon-glow' | 'danger-red';
  animation?: 'bounce' | 'slideUp' | 'fade' | 'zoom';
  width?: string;
  showCloseButton?: boolean;
  backdropStyle?: 'dim' | 'blur' | 'transparent';
  customAction?: {
    label: string;
    onProceed: () => void;
  };
}

export default function PreviewMode({ project, onClose }: PreviewModeProps) {
  const [currentPageId, setCurrentPageId] = useState<string>(project.selectedPageId || project.pages[0]?.id || "");
  
  // Simulated form value states for preview inputs
  const [inputStates, setInputStates] = useState<Record<string, string | boolean>>({});
  
  // Track current click sequence index for each interactive element ID
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  
  // Force visibility overrides (Show / Hide element actions)
  const [visibilityOverrides, setVisibilityOverrides] = useState<Record<string, boolean>>({});

  // Dynamic animation alerts (Shake, Bounce)
  const [animationEffects, setAnimationEffects] = useState<Record<string, "shake" | "bounce" | "zoom" | "none">>({});

  // Preview Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Preview Modal
  const [modal, setModal] = useState<ModalPopupState | null>(null);

  // Password visibility states (masked vs raw)
  const [unmaskedInputs, setUnmaskedInputs] = useState<Record<string, boolean>>({});

  // Get current Page details
  const currentPage = project.pages.find((p) => p.id === currentPageId) || project.pages[0];

  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });

  useEffect(() => {
    if (currentPage && currentPage.backgroundImage) {
      const img = new window.Image();
      img.onload = () => {
        setCanvasDimensions({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
      };
      img.src = currentPage.backgroundImage;
    } else {
      setCanvasDimensions({ width: 1200, height: 800 });
    }
  }, [currentPage?.id, currentPage?.backgroundImage]);

  // Auto-initialize form default values
  useEffect(() => {
    if (!currentPage) return;
    const initialValues: Record<string, string | boolean> = { ...inputStates };
    currentPage.elements.forEach((el) => {
      // populate defaults if never specified
      if (initialValues[el.id] === undefined) {
        if (el.type === "Checkbox") {
          initialValues[el.id] = el.defaultValue === "true";
        } else if (el.type === "Radio Button") {
          initialValues[el.id] = false;
        } else {
          initialValues[el.id] = el.defaultValue || "";
        }
      }
    });
    setInputStates(initialValues);
  }, [currentPageId]);

  // Toast Helpers
  const addToast = (
    message: string,
    type: ToastMessage["type"] = "info",
    overrides?: Partial<ToastMessage>
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const duration = overrides?.duration ?? 4000;
    setToasts((prev) => [...prev, { id, message, type, ...overrides }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  // Run a single Action inside the preview
  const executeAction = (act: Action) => {
    const { type, params } = act;

    switch (type) {
      case "Navigate":
        if (params.targetPageId) {
          addToast(`Routing to page: ${project.pages.find((p) => p.id === params.targetPageId)?.name || params.targetPageId}`, "info");
          setCurrentPageId(params.targetPageId);
        }
        break;

      case "DisplayNotification":
        if (params.notificationMessage) {
          addToast(params.notificationMessage, params.notificationType || "success", {
            position: params.toastPosition,
            theme: params.toastTheme,
            showIcon: params.toastShowIcon !== false,
            duration: params.toastDuration || 4000,
          });
        }
        break;

      case "DisplayPopup":
        if (params.popupMessage) {
          setModal({
            title: params.popupTitle || "Sandbox Dialogue",
            message: params.popupMessage,
            placement: params.popupPlacement || "center",
            theme: params.popupTheme || "fancy-light",
            animation: params.popupAnimation || "zoom",
            width: params.popupWidth || "max-w-md",
            showCloseButton: params.popupShowCloseButton !== false,
            backdropStyle: params.popupBackdropStyle || "dim",
          });
        }
        break;

      case "ShowElement":
        if (params.targetElementId) {
          setVisibilityOverrides((prev) => ({ ...prev, [params.targetElementId!]: true }));
          addToast(`Element '${params.targetElementId}' set to Visible`, "info");
        }
        break;

      case "HideElement":
        if (params.targetElementId) {
          setVisibilityOverrides((prev) => ({ ...prev, [params.targetElementId!]: false }));
          addToast(`Element '${params.targetElementId}' has been hidden`, "info");
        }
        break;

      case "ToggleElement":
        if (params.targetElementId) {
          setVisibilityOverrides((prev) => {
            const currentVis = prev[params.targetElementId!] !== undefined 
              ? prev[params.targetElementId!] 
              : (currentPage?.elements.find((e) => e.id === params.targetElementId)?.visible ?? true);
            return { ...prev, [params.targetElementId!]: !currentVis };
          });
        }
        break;

      case "ChangeText":
        if (params.targetElementId) {
          setInputStates((prev) => ({ ...prev, [params.targetElementId!]: params.textValue || "" }));
          addToast(`Updated ${params.targetElementId} value`, "info");
        }
        break;

      case "TriggerAnimation":
        if (params.targetElementId) {
          const anim = params.animationName || "bounce";
          setAnimationEffects((prev) => ({ ...prev, [params.targetElementId!]: anim }));
          setTimeout(() => {
            setAnimationEffects((prev) => ({ ...prev, [params.targetElementId!]: "none" }));
          }, 1000);
        }
        break;

      case "OpenUrl":
        if (params.url) {
          const target = params.urlTarget || "_blank";
          if (params.urlWarn) {
            setModal({
              title: "Security Redirection Notice",
              message: params.urlWarnMessage || `You are navigating away to external web anchor: ${params.url}. Are you sure you want to proceed?`,
              theme: "danger-red",
              placement: "center",
              animation: "bounce",
              width: "max-w-md",
              showCloseButton: true,
              backdropStyle: "blur",
              customAction: {
                label: "Proceed with Redirect",
                onProceed: () => {
                  addToast(`Opening: ${params.url} in ${target}`, "success");
                  try {
                    window.open(params.url, target);
                  } catch (err) {
                    console.error("Redirection iframe blocked:", err);
                  }
                  setModal(null);
                }
              }
            });
          } else {
            addToast(`Simulated browser opening link: ${params.url} (${target})`, "success");
            try {
              window.open(params.url, target);
            } catch (err) {
              console.error("Window open block:", err);
            }
          }
        }
        break;

      case "DownloadFile":
        addToast(`Simulated download of: ${params.fileName || "interactive-export-bundle.zip"}`, "success");
        break;

      case "SubmitForm":
        addToast("🚀 Form Submitted successfully! Verification values saved to state logs.", "success");
        break;

      case "ResetForm":
        setInputStates({});
        addToast("🧹 Workspace forms states completely cleared.", "info");
        break;

      case "TogglePasswordMasking":
        if (params.targetElementId) {
          setUnmaskedInputs((prev) => ({
            ...prev,
            [params.targetElementId!]: !prev[params.targetElementId!]
          }));
          addToast(`Toggled password masking visibility of '${params.targetElementId}'`, "info");
        }
        break;

      case "ToggleCheckbox":
        if (params.targetElementId) {
          setInputStates((prev) => {
            const currentVal = !!prev[params.targetElementId!];
            return { ...prev, [params.targetElementId!]: !currentVal };
          });
          addToast(`Toggled checkmark selection of '${params.targetElementId}'`, "info");
        }
        break;

      default:
        addToast(`Executed action: ${type}`, "info");
    }
  };

  // Evaluate a Condition Check
  const checkRuleCriteria = (rule: ConditionRule): boolean => {
    const rawVal = inputStates[rule.sourceElementId];
    const isChecked = typeof rawVal === "boolean" ? rawVal : false;
    const strVal = String(rawVal === undefined || rawVal === null ? "" : rawVal);

    switch (rule.conditionType) {
      case "Empty":
        return strVal.trim() === "";
      case "NotEmpty":
        return strVal.trim() !== "";
      case "Equals":
        return strVal.toLowerCase() === (rule.valueThreshold || "").toLowerCase();
      case "NotEquals":
        return strVal.toLowerCase() !== (rule.valueThreshold || "").toLowerCase();
      case "Checked":
        return isChecked === true;
      case "Unchecked":
        return isChecked === false;
      case "LessThan":
        return strVal.length < Number(rule.valueThreshold || 0);
      case "GreaterThan":
        return strVal.length > Number(rule.valueThreshold || 0);
      default:
        return false;
    }
  };

  // Primary interactive Click Handler in preview
  const handleElementClick = (el: CanvasElement) => {
    let preventNormalClick = false;

    // 1. Process and evaluate conditional gateways first!
    if (el.conditions && el.conditions.length > 0) {
      let condFiredCount = 0;
      el.conditions.forEach((cond) => {
        const isMatched = checkRuleCriteria(cond);
        if (isMatched) {
          condFiredCount++;
          // Trigger positive success actions
          cond.successActions.forEach((act) => executeAction(act));
          // If any validation target failed, flag it to suppress subsequent actions
          preventNormalClick = true;
        } else {
          // Trigger negative fail action (else clause)
          cond.failActions.forEach((act) => executeAction(act));
        }
      });
      if (condFiredCount > 0) {
        // Halt click progression to prevent buggy states
        return;
      }
    }

    if (preventNormalClick) return;

    // 2. Process click sequences (Click 1, 2, 3...)
    if (el.clickSequences && el.clickSequences.length > 0) {
      const currentIdx = clickCounts[el.id] || 0;
      const sequence = el.clickSequences.find((s) => s.clickIndex === currentIdx) || el.clickSequences[0];

      if (sequence) {
        addToast(`Click ${currentIdx + 1} of sequence triggered!`, "info");
        sequence.actions.forEach((act) => executeAction(act));

        // Advance to next index loop
        const nextIdx = (currentIdx + 1) % el.clickSequences.length;
        setClickCounts((prev) => ({ ...prev, [el.id]: nextIdx }));
      }
    } else if (el.type === "Checkbox") {
      setInputStates((prev) => ({ ...prev, [el.id]: !prev[el.id] }));
    }
  };

  // Form value change binding
  const handleFormValueChange = (elementId: string, val: any) => {
    setInputStates((prev) => ({ ...prev, [elementId]: val }));
  };

  const handleRestartSession = () => {
    setInputStates({});
    setClickCounts({});
    setVisibilityOverrides({});
    setAnimationEffects({});
    setModal(null);
    setCurrentPageId(project.selectedPageId || project.pages[0]?.id || "");
    addToast("Sandbox simulation session reset. Inputs re-initialized.", "info");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-800 flex flex-col font-sans" id="preview-viewport-modal">
      
      {/* Top Banner Control bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between" id="preview-navbar">
        <div className="flex items-center space-x-3" id="preview-branding">
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100 shadow-xs" id="preview-badge">
            <Play className="w-5 h-5 fill-emerald-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>Canvas2Code Player Mode</span>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider font-mono">
                Live Simulation
              </span>
            </h1>
            <p className="text-xs text-slate-550 text-slate-500">Project: {project.name} • Active view: {currentPage?.name || "None"}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3" id="preview-nav-actions">
          <button
            onClick={handleRestartSession}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition"
            id="btn-app-reset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
          
          <button
            onClick={onClose}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-red-500/15 transition"
            id="btn-close-sandbox"
          >
            <X className="w-4 h-4" />
            <span>Exit Player</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace Frame container */}
      <div className="flex-1 overflow-auto flex" id="main-preview-area">
        
        {/* Left segment: Interactive Screen Stage */}
        <div className="flex-1 bg-slate-150 bg-slate-100 relative flex items-center justify-center p-6" id="preview-active-stage">
          {currentPage ? (
            <div className="relative rounded-2xl shadow-xl overflow-hidden border border-slate-200 bg-white overflow-y-auto" style={{ width: "100%", maxWidth: `${canvasDimensions.width}px`, aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}` }} id="preview-canvas-frame">
              {currentPage.backgroundImage ? (
                <img
                  src={currentPage.backgroundImage}
                  alt={currentPage.name}
                  className="w-full h-full object-fill select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-400 italic text-sm font-light">
                  Blank viewport canvas background
                </div>
              )}

              {/* Elements rendering overlay */}
              {currentPage.elements.map((el) => {
                const isForcedHidden = visibilityOverrides[el.id] === false;
                const isForcedVisible = visibilityOverrides[el.id] === true;
                const activeVisibility = isForcedHidden ? false : isForcedVisible ? true : el.visible;

                if (!activeVisibility) return null;

                const animEffect = animationEffects[el.id] || "none";
                const isShaking = animEffect === "shake";
                const isBouncing = animEffect === "bounce";

                const isInvisible = !!el.styles.invisibleOnScreen;
                const isTransparent = !!el.styles.transparent || isInvisible;
                const hasNoBorder = !!el.styles.noBorder || isInvisible;

                return (
                  <div
                    key={el.id}
                    onClick={() => handleElementClick(el)}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                      height: `${el.height}%`,
                      zIndex: el.zIndex || 10,
                      cursor: "pointer",
                    }}
                    className={`absolute flex items-center rounded select-text group/item ${isShaking ? "animate-shake" : ""} ${isBouncing ? "animate-bounce" : ""}`}
                    id={`preview-el-${el.id}`}
                  >
                    {/* Render visual content depending on element.type */}
                    {(() => {
                      const backdropOpacity = el.styles.opacity !== undefined ? el.styles.opacity : 1;
                      const finalBgColor = isTransparent 
                        ? "transparent" 
                        : getRgbaColor(el.styles.backgroundColor || (el.type === "Button" ? "#2563eb" : "#ffffff"), backdropOpacity);
                      const finalBorderColor = hasNoBorder
                        ? "none"
                        : el.styles.borderColor
                        ? `1.5px solid ${getRgbaColor(el.styles.borderColor, backdropOpacity)}`
                        : el.type === "Button"
                        ? "none"
                        : `1.5px solid ${getRgbaColor("#cbd5e1", backdropOpacity)}`;
                      const elementFontFamily = el.styles.fontFamily 
                        ? `${el.styles.fontFamily}, ui-sans-serif, system-ui, sans-serif`
                        : "inherit";
                      const elementFontSize = el.styles.fontSize || "inherit";

                      if (el.type === "Image") {
                        return (
                          <div className="w-full h-full relative overflow-hidden flex items-center justify-center rounded" style={{
                            opacity: backdropOpacity,
                            borderRadius: el.styles.borderRadius || "8px",
                            border: hasNoBorder ? "none" : el.styles.borderColor ? `1.5px solid ${el.styles.borderColor}` : "none",
                          }}>
                            {el.imageUrl ? (
                              <img
                                src={el.imageUrl}
                                alt={el.label || el.id}
                                className="w-full h-full object-fill select-none pointer-events-none"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono italic">No Image URL</span>
                            )}
                          </div>
                        );
                      }

                      if (el.type === "Button") {
                        return (
                          <button
                            style={{
                              backgroundColor: finalBgColor,
                              color: isInvisible ? "transparent" : el.styles.color || "#ffffff",
                              borderRadius: el.styles.borderRadius || "8px",
                              width: "100%",
                              height: "100%",
                              fontSize: elementFontSize !== "inherit" ? elementFontSize : "13px",
                              fontFamily: elementFontFamily,
                              border: finalBorderColor,
                              opacity: isInvisible ? 0 : 1,
                            }}
                            className="font-semibold text-center cursor-pointer hover:brightness-110 active:scale-95 transition"
                          >
                            {isInvisible ? "" : el.label || "Click Button"}
                          </button>
                        );
                      }

                      if (["Text Input", "Email Input", "Password Input", "Phone Input", "Number Input"].includes(el.type)) {
                        return (
                          <input
                            type={
                              el.type === "Password Input"
                                ? (unmaskedInputs[el.id] ? "text" : "password")
                                : el.type === "Number Input"
                                ? "number"
                                : "text"
                            }
                            placeholder={isInvisible ? "" : el.placeholder || "Insert values..."}
                            value={(inputStates[el.id] as string) || ""}
                            onChange={(e) => handleFormValueChange(el.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Stop bubbling
                            style={{
                              color: el.styles.color || "#1e293b",
                              fontSize: elementFontSize !== "inherit" ? elementFontSize : "13px",
                              fontFamily: elementFontFamily,
                              backgroundColor: finalBgColor,
                              borderRadius: el.styles.borderRadius || "6px",
                              border: finalBorderColor,
                              width: "100%",
                              height: "100%",
                              opacity: isInvisible ? 0 : 1,
                            }}
                            className="px-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        );
                      }

                      if (el.type === "Checkbox") {
                        return (
                          <div 
                            className="flex items-center space-x-2 w-full h-full px-2"
                            style={{ opacity: isInvisible ? (inputStates[el.id] ? 1 : 0) : 1 }}
                          >
                            <input
                              type="checkbox"
                              checked={!!inputStates[el.id]}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                handleFormValueChange(el.id, isChecked);
                                if (el.togglePasswordTargetId) {
                                  setUnmaskedInputs(prev => ({
                                    ...prev,
                                    [el.togglePasswordTargetId!]: isChecked
                                  }));
                                } else if (el.label && el.label.toLowerCase().includes("show password")) {
                                  const firstPassInput = currentPage?.elements.find(x => x.type === "Password Input");
                                  if (firstPassInput) {
                                    setUnmaskedInputs(prev => ({
                                      ...prev,
                                      [firstPassInput.id]: isChecked
                                    }));
                                  }
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                            />
                            <span 
                              className="text-xs font-semibold text-slate-850" 
                              style={{ 
                                color: isInvisible ? "transparent" : el.styles.color || "#1e293b",
                                fontFamily: elementFontFamily,
                                fontSize: elementFontSize !== "inherit" ? elementFontSize : "12px",
                              }}
                            >
                              {isInvisible ? "" : el.label}
                            </span>
                          </div>
                        );
                      }

                      if (el.type === "Text Area") {
                        return (
                          <textarea
                            placeholder={isInvisible ? "" : el.placeholder || "Enter details..."}
                            value={(inputStates[el.id] as string) || ""}
                            onChange={(e) => handleFormValueChange(el.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              color: el.styles.color || "#1e293b",
                              fontSize: elementFontSize !== "inherit" ? elementFontSize : "12px",
                              fontFamily: elementFontFamily,
                              backgroundColor: finalBgColor,
                              borderRadius: el.styles.borderRadius || "6px",
                              border: finalBorderColor,
                              width: "100%",
                              height: "100%",
                              opacity: isInvisible ? 0 : 1,
                            }}
                            className="p-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
                          />
                        );
                      }

                      if (el.type === "Link") {
                        return (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                            style={{ 
                              color: isInvisible ? "transparent" : el.styles.color || "#3b82f6",
                              opacity: isInvisible ? 0 : 1,
                              fontFamily: elementFontFamily,
                              fontSize: elementFontSize !== "inherit" ? elementFontSize : "12px",
                            }}
                            className="text-xs font-semibold underline decoration-2 hover:opacity-80 flex items-center justify-center w-full text-center"
                          >
                            {isInvisible ? "" : el.label || "Click Link"}
                          </a>
                        );
                      }

                      if (el.type === "Label") {
                        return (
                          <div
                            style={{ 
                              color: isInvisible ? "transparent" : el.styles.color || "#1e293b", 
                              fontSize: elementFontSize !== "inherit" ? elementFontSize : "13px",
                              fontFamily: elementFontFamily,
                              opacity: isInvisible ? 0 : 1, 
                            }}
                            className="font-bold w-full text-center truncate"
                          >
                            {isInvisible ? "" : el.label}
                          </div>
                        );
                      }

                      // Default catch-all
                      return (
                        <div
                          style={{
                            backgroundColor: finalBgColor,
                            color: isInvisible ? "transparent" : el.styles.color || "#ffffff",
                            borderRadius: el.styles.borderRadius || "4px",
                            fontSize: elementFontSize !== "inherit" ? elementFontSize : "11px",
                            fontFamily: elementFontFamily,
                            border: finalBorderColor,
                            opacity: isInvisible ? 0 : 1,
                          }}
                          className="w-full h-full flex items-center justify-center font-medium font-mono text-center tracking-tight opacity-90 truncate p-1"
                        >
                          {isInvisible ? "" : el.label || el.type}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 font-mono text-sm">No page selected in preview session.</div>
          )}
        </div>

        {/* Right segment: Simulation variables & states console */}
        <div className="w-80 bg-white border-l border-slate-205 p-5 flex flex-col justify-between shadow-xs" id="state-console">
          <div className="space-y-5" id="console-blocks">
            <div id="console-head">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Mock Variable Console
              </span>
              <h3 className="text-xs text-slate-500 leading-normal font-light">Interact with inputs on the canvas left side to visualize live values in real-time.</h3>
            </div>

            {/* Variable display table */}
            <div className="space-y-3" id="vars-list-sec">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-1.5">
                <span>UI FIELD VARIABLE</span>
                <span>VALUE RECORDED</span>
              </div>

              {Object.keys(inputStates).length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-[11px] font-light">
                  No active values captured yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-auto pr-1" id="scrolling-vars">
                  {Object.entries(inputStates).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-mono" id={`console-var-val-${key}`}>
                      <span className="text-blue-600 font-semibold truncate w-32">{key}</span>
                      <span className="text-slate-650 text-slate-600 bg-white px-1.5 py-0.5 border border-slate-150 rounded text-[10px] truncate max-w-[120px]">
                        {typeof val === "boolean" ? (val ? "true" : "false") : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Multi-Clicks panel */}
            <div className="space-y-2 pt-2 border-t border-slate-100" id="multiclick-state-sec">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Sequence Registers
              </div>
              {Object.keys(clickCounts).length === 0 ? (
                <p className="text-[10px] text-slate-400 italic font-light">No click registers incremented yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-[150px] overflow-auto" id="clickcounts-list">
                  {Object.entries(clickCounts).map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 px-2 py-1.5 rounded border border-slate-150" id={`count-row-${key}`}>
                      <span className="font-mono text-indigo-600">{key}</span>
                      <span className="font-semibold text-slate-700">Index target: Click {Number(count) + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-[9px] text-slate-400 leading-tight border-t border-slate-100 pt-3">
            Canvas2Code Sandbox is sandbox insulated. Live database entries or network shifts do not execute.
          </p>
        </div>
      </div>

      {/* Floating active toasts list grouped by position */}
      {(() => {
        const positions = [
          { key: "top-right", classes: "top-6 right-6 flex-col-reverse" },
          { key: "top-left", classes: "top-6 left-6 flex-col-reverse" },
          { key: "top-center", classes: "top-6 left-1/2 -translate-x-1/2 flex-col-reverse items-center" },
          { key: "bottom-left", classes: "bottom-6 left-6 flex-col" },
          { key: "bottom-right", classes: "bottom-6 right-6 flex-col" },
          { key: "bottom-center", classes: "bottom-6 left-1/2 -translate-x-1/2 flex-col items-center" },
        ];

        return positions.map((pos) => {
          const matchingToasts = toasts.filter((t) => (t.position || "bottom-right") === pos.key);
          if (matchingToasts.length === 0) return null;

          return (
            <div
              key={pos.key}
              className={`fixed z-50 pointer-events-none flex space-y-2 max-w-sm ${pos.classes}`}
              id={`toasts-dock-${pos.key}`}
            >
              <AnimatePresence>
                {matchingToasts.map((t) => {
                  const theme = t.theme || "colored";
                  let bgClasses = "";

                  if (theme === "dark") {
                    bgClasses = "bg-slate-905 bg-slate-900 border border-slate-800 text-slate-100 shadow-xl shadow-slate-950/30";
                  } else if (theme === "light") {
                    bgClasses = "bg-white border border-slate-200 text-slate-900 shadow-xl shadow-slate-300/20";
                  } else if (theme === "glass") {
                    bgClasses = "backdrop-blur-md bg-white/30 border border-white/40 text-slate-900 shadow-lg shadow-black/5";
                  } else {
                    // default colored
                    bgClasses = t.type === "success"
                      ? "bg-emerald-600 border border-emerald-500 text-white shadow-emerald-600/10 shadow-lg"
                      : t.type === "error"
                      ? "bg-red-600 border border-red-500 text-white shadow-red-600/10 shadow-lg"
                      : t.type === "warning"
                      ? "bg-amber-600 border border-amber-500 text-white shadow-amber-500/10 shadow-lg"
                      : "bg-blue-600 border border-blue-500 text-white shadow-blue-600/10 shadow-lg";
                  }

                  const iconColor = (theme === "colored") ? "text-white" : (
                    t.type === "success" ? "text-emerald-500" :
                    t.type === "error" ? "text-red-500" :
                    t.type === "warning" ? "text-amber-500" : "text-blue-500"
                  );

                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: pos.key.startsWith("top") ? -15 : 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className={`pointer-events-auto p-4 rounded-2xl flex items-center space-x-3 text-sm ${bgClasses}`}
                    >
                      {t.showIcon !== false && (
                        <div className="flex-shrink-0">
                          {t.type === "success" && <CheckCircle className={`w-5 h-5 ${iconColor}`} />}
                          {t.type === "error" && <AlertCircle className={`w-5 h-5 ${iconColor}`} />}
                          {t.type === "warning" && <AlertCircle className={`w-5 h-5 ${iconColor}`} />}
                          {t.type === "info" && <Bell className={`w-5 h-5 ${iconColor}`} />}
                        </div>
                      )}
                      
                      <span className="font-semibold leading-snug tracking-tight">{t.message}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          );
        });
      })()}

      {/* Advanced Customizable Dialog Popup Modal */}
      {modal && (
        <div
          className={`fixed inset-0 z-50 flex ${
            modal.backdropStyle === "blur"
              ? "bg-slate-950/45 backdrop-blur-sm"
              : modal.backdropStyle === "transparent"
              ? "bg-transparent"
              : "bg-slate-950/75"
          } ${
            modal.placement === "top"
              ? "items-start justify-center pt-16"
              : modal.placement === "bottom"
              ? "items-end justify-center pb-16"
              : "items-center justify-center"
          } px-4 transition-all`}
          id="prev-dialog"
          onClick={() => {
            if (modal.showCloseButton !== false) setModal(null);
          }}
        >
          {(() => {
            let containerTheme = "bg-white border border-slate-200 text-slate-955 shadow-2xl shadow-slate-950/25";
            let actionBtnClass = "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10";
            let outlineBtnClass = "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200";

            if (modal.theme === "classic-dark") {
              containerTheme = "bg-slate-905 bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl shadow-black/80";
              actionBtnClass = "bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold";
              outlineBtnClass = "bg-slate-800 hover:bg-slate-755 text-slate-200 border-slate-705 border-slate-700";
            } else if (modal.theme === "neon-glow") {
              containerTheme = "bg-slate-955 bg-slate-950/95 border border-blue-500/60 text-blue-100 shadow-2xl shadow-blue-500/10 backdrop-blur-xl font-mono";
              actionBtnClass = "bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold uppercase tracking-wider";
              outlineBtnClass = "bg-slate-900 hover:bg-slate-850 text-blue-300 border-blue-900";
            } else if (modal.theme === "danger-red") {
              containerTheme = "bg-red-955 bg-red-950 border-2 border-red-800 text-red-10 shadow-2xl shadow-red-950/50";
              actionBtnClass = "bg-red-600 hover:bg-red-500 text-white font-bold tracking-tight";
              outlineBtnClass = "bg-red-900/40 hover:bg-red-900/60 text-red-200 border-red-900";
            }

            // Animate properties
            const animateVariants = {
              zoom: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
              slideUp: { initial: { y: 60, opacity: 0 }, animate: { y: 0, opacity: 1 } },
              bounce: { initial: { scale: 0.85, opacity: 0 }, animate: { scale: [1.05, 0.97, 1], opacity: 1 } },
              fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
            };

            const animProps = animateVariants[modal.animation || "zoom"];

            return (
              <motion.div
                initial={animProps.initial}
                animate={animProps.animate}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`w-full ${modal.width || "max-w-md"} rounded-3xl p-6 space-y-4 ${containerTheme}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold tracking-tight flex items-center space-x-2">
                      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                        modal.theme === "danger-red" ? "text-red-400" : "text-blue-500"
                      }`} />
                      <span className="leading-tight">{modal.title}</span>
                    </h3>
                    <p className="text-xs leading-relaxed opacity-85 mt-2" id="dial-msg-body">{modal.message}</p>
                  </div>

                  {modal.showCloseButton !== false && (
                    <button
                      onClick={() => setModal(null)}
                      className="p-1.5 rounded-full hover:bg-slate-500/10 cursor-pointer"
                    >
                      <X className="w-4 h-4 opacity-70" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                  {modal.customAction ? (
                    <>
                      <button
                        onClick={() => setModal(null)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${outlineBtnClass} cursor-pointer`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={modal.customAction.onProceed}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer ${actionBtnClass}`}
                      >
                        {modal.customAction.label}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setModal(null)}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${actionBtnClass}`}
                      id="confirm-close-inner-dialog"
                    >
                      Acknowledge & Close
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
