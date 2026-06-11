import React, { useState } from "react";
import { Project } from "../types";
import { Copy, Check, Download, FileCode, SquareCode, Terminal, Info, RefreshCw } from "lucide-react";
import JSZip from "jszip";

interface CodeGeneratorProps {
  project: Project;
  onClose: () => void;
}

export default function CodeGenerator({ project, onClose }: CodeGeneratorProps) {
  const [activeFile, setActiveFile] = useState<string>("index.html");
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  // 1. Generate standalone pure index.html
  const getHtmlCode = (): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name || "Web Canvas Mockup"}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Subtle floating reset control -->
  <button id="btn-reset" class="btn-floating-reset" title="Reset Session State">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
  </button>

  <!-- Primary canvas mockup presentation container -->
  <div class="viewport">
    <div class="iframe-mockup">
      <!-- Background Canvas drawing the screenshot graphic -->
      <canvas id="screenshot-canvas"></canvas>
      
      <!-- Position-anchored dynamic text fields, buttons, checkboxes, text-areas -->
      <div id="elements-overlay"></div>
    </div>
  </div>

  <!-- Real-time toast notifications hub -->
  <div id="toast-dock" class="toast-dock"></div>

  <!-- Accessible Dialog / Toast Details Modals backup panel -->
  <div id="dialog-modal" class="modal-backdrop hidden">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-title">Interactive Notice</h3>
        <button id="modal-close-x" class="modal-close">&times;</button>
      </div>
      <p id="modal-message">Notification details body overlay placeholder.</p>
      <div class="modal-footer" id="modal-footer">
        <button id="modal-ok-btn" class="btn-primary">Acknowledge</button>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
`;
  };

  // 2. Generate optimized styles style.css
  const getCssCode = (): string => {
    return `:root {
  --primary: #2563eb;
  --secondary: #1e293b;
  --bg-dark: #020617;
  --canvas-bg: #0b0f19;
  --border: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.viewport {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.iframe-mockup {
  position: relative;
  width: 100%;
  background-color: transparent;
  border-radius: 0;
  border: none;
  box-shadow: none;
  overflow: hidden;
}

#screenshot-canvas {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
}

#elements-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.btn-floating-reset {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f1f5f9;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
}
.btn-floating-reset:hover {
  background-color: rgba(15, 23, 42, 0.95);
  border-color: rgba(255, 255, 255, 0.35);
  transform: scale(1.08);
}

.canvas-element-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas-element-image img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
}

/* User Interactive Canvas Elements classes */
.canvas-element {
  position: absolute;
  pointer-events: auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.canvas-element button {
  width: 100%;
  height: 100%;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: none;
  font-family: inherit;
}
.canvas-element button:hover {
  filter: brightness(1.1);
}
.canvas-element button:active {
  transform: scale(0.97);
}

.canvas-element input {
  width: 100%;
  height: 100%;
  padding: 0 12px;
  outline: none;
  font-weight: 500;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.canvas-element input:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2.5px rgba(37, 99, 235, 0.25);
}

.canvas-element textarea {
  width: 100%;
  height: 100%;
  padding: 8px 12px;
  outline: none;
  font-weight: 500;
  font-family: inherit;
  resize: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.canvas-element textarea:focus {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2.5px rgba(37, 99, 235, 0.25);
}

.canvas-element-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  width: 100%;
  height: 100%;
}
.canvas-element-checkbox input {
  width: 15px;
  height: 15px;
  cursor: pointer;
}
.canvas-element-checkbox span {
  font-size: 12px;
  font-weight: 600;
}

.canvas-element-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  border: none;
  background: transparent;
}
.canvas-element-link:hover {
  opacity: 0.8;
}

.canvas-element-label {
  width: 100%;
  text-align: center;
  font-weight: 700;
}

.canvas-element-custom {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 11px;
}

/* Modal action buttons */
.btn-primary {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.55rem 1.1rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.btn-primary:hover { background-color: #1d4ed8; }

.btn-secondary {
  background-color: var(--secondary);
  color: #cbd5e1;
  border: 1px solid #334155;
  padding: 0.55rem 1.1rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-secondary:hover {
  background-color: #334155;
  color: #ffffff;
}

/* Micro interaction CSS Animations */
@keyframes shake {
  0%, 100% { transform: scale(1) translateX(0); }
  20%, 60% { transform: scale(1) translateX(-5px); }
  40%, 80% { transform: scale(1) translateX(5px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1) translateY(-8px); }
}
.animate-bounce {
  animation: bounce 0.35s ease-in-out;
}

/* Toast Container Viewport Alignments */
.toast-dock {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 330px;
}
.toast-dock.bottom-right { bottom: 1.5rem; right: 1.5rem; }
.toast-dock.bottom-left { bottom: 1.5rem; left: 1.5rem; }
.toast-dock.top-right { top: 1.5rem; right: 1.5rem; }
.toast-dock.top-left { top: 1.5rem; left: 1.5rem; }
.toast-dock.bottom-center { bottom: 1.5rem; left: 50%; transform: translateX(-50%); }
.toast-dock.top-center { top: 1.5rem; left: 50%; transform: translateX(-50%); }

.toast-message {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
  animation: slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.toast-message.success { background-color: #10b981; color: white; border: 1px solid #059669; }
.toast-message.error { background-color: #ef4444; color: white; border: 1px solid #dc2626; }
.toast-message.warning { background-color: #f59e0b; color: white; border: 1px solid #d97706; }
.toast-message.info { background-color: #3b82f6; color: white; border: 1px solid #2563eb; }

/* Custom Modal Popups backdrop and themes */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(4px);
  transition: opacity 0.2s ease;
}
.modal-backdrop.hidden {
  display: none !important;
}

.modal-content {
  background-color: #1e293b;
  border: 1px solid #334155;
  color: #f8fafc;
  width: 100%;
  max-width: 440px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.modal-header h3 {
  font-size: 16px;
  font-weight: 700;
}
.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}
.modal-close:hover { color: white; }

#modal-message {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
  margin-bottom: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Target modal themes classes */
.modal-backdrop.classic-dark .modal-content { background-color: #0f172a; border-color: #1e293b; }
.modal-backdrop.neon-glow .modal-content { background-color: #020617; border-color: #3b82f6; color: #60a5fa; font-family: monospace; }
.modal-backdrop.danger-red .modal-content { background-color: #450a0a; border-color: #991b1b; color: #ffd1d1; }
`;
  };

  // 3. Generate high-fidelity standalone app.js using double/single quotes instead of nested backticks
  const getJsCode = (): string => {
    return `// Deserialized Project configuration generated by Canvas2Code Builder
const DESIGN_BLUEPRINT = {
  id: "${project.id}",
  name: "${project.name || "Web Canvas Mockup"}",
  description: "${project.description || ""}",
  selectedPageId: "${project.selectedPageId || project.pages[0]?.id || ""}",
  pages: ${JSON.stringify(project.pages, null, 2)}
};

let currentPageId = DESIGN_BLUEPRINT.selectedPageId || DESIGN_BLUEPRINT.pages[0]?.id || "";
let inputStates = {};
let clickCounts = {};
let visibilityOverrides = {};

const toastDock = document.getElementById("toast-dock");
const dialogModal = document.getElementById("dialog-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalFooter = document.getElementById("modal-footer");
const modalCloseX = document.getElementById("modal-close-x");

const canvas = document.getElementById("screenshot-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const overlay = document.getElementById("elements-overlay");
const btnReset = document.getElementById("btn-reset");

// Setup event listeners
if (btnReset) {
  btnReset.addEventListener("click", () => {
    inputStates = {};
    clickCounts = {};
    visibilityOverrides = {};
    currentPageId = DESIGN_BLUEPRINT.selectedPageId || DESIGN_BLUEPRINT.pages[0]?.id || "";
    showToast("Session restored to initial layout state", "info");
    renderPage();
  });
}

function showToast(message, type = "info") {
  if (!toastDock) return;
  
  // Clean default position class and force standard alignments
  toastDock.className = "toast-dock bottom-right";
  
  const toast = document.createElement("div");
  toast.className = "toast-message " + type;
  
  // Icon emoji representation
  let icon = "🔔";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";
  
  toast.innerHTML = "<span>" + icon + "</span><span style='line-height: 1.4;'>" + message + "</span>";
  toastDock.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px) scale(0.95)";
    setTimeout(() => {
      toast.remove();
    }, 200);
  }, 4000);
}

function showPopup(title, message, backdropStyle, placement, theme, animation, customAction) {
  if (!dialogModal) return;
  
  // Apply backdrop theme configurations
  dialogModal.className = "modal-backdrop shadow-2xl";
  if (backdropStyle === "blur") dialogModal.style.backdropFilter = "blur(4px)";
  else if (backdropStyle === "transparent") {
    dialogModal.style.backgroundColor = "transparent";
    dialogModal.style.backdropFilter = "none";
  }
  
  // Placement alignments
  if (placement === "top") dialogModal.style.alignItems = "flex-start";
  else if (placement === "bottom") dialogModal.style.alignItems = "flex-end";
  
  // Theme custom setups
  if (theme) dialogModal.classList.add(theme);
  
  modalTitle.textContent = title || "Notification Notice";
  modalMessage.textContent = message || "";
  
  // Render buttons
  modalFooter.innerHTML = "";
  if (customAction && customAction.label) {
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-secondary";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => dialogModal.classList.add("hidden"));
    
    const actionBtn = document.createElement("button");
    actionBtn.className = "btn-primary";
    actionBtn.textContent = customAction.label;
    actionBtn.addEventListener("click", () => {
      dialogModal.classList.add("hidden");
      showToast("Proceeding customized workflow", "info");
    });
    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(actionBtn);
  } else {
    const okBtn = document.createElement("button");
    okBtn.className = "btn-primary";
    okBtn.textContent = "Acknowledge";
    okBtn.addEventListener("click", () => dialogModal.classList.add("hidden"));
    modalFooter.appendChild(okBtn);
  }
  
  dialogModal.classList.remove("hidden");
}

if (modalCloseX) {
  modalCloseX.addEventListener("click", () => {
    dialogModal.classList.add("hidden");
  });
}

function executeAction(act) {
  const { type, params } = act;
  if (!type) return;
  
  switch (type) {
    case 'Navigate':
      if (params.targetPageId) {
        showToast("Routing screen view...", "info");
        currentPageId = params.targetPageId;
        renderPage();
      }
      break;
    case 'DisplayNotification':
      if (params.notificationMessage) {
        showToast(params.notificationMessage, params.notificationType || 'success');
      }
      break;
    case 'DisplayPopup':
      if (params.popupMessage) {
        showPopup(
          params.popupTitle || "Popup Dialogue", 
          params.popupMessage, 
          params.backdropStyle, 
          params.placement, 
          params.theme, 
          params.animation, 
          params.customAction
        );
      }
      break;
    case 'ShowElement':
      if (params.targetElementId) {
        visibilityOverrides[params.targetElementId] = true;
        renderPage();
      }
      break;
    case 'HideElement':
      if (params.targetElementId) {
        visibilityOverrides[params.targetElementId] = false;
        renderPage();
      }
      break;
    case 'ToggleElement':
      if (params.targetElementId) {
        const page = DESIGN_BLUEPRINT.pages.find(p => p.id === currentPageId);
        const el = page?.elements.find(e => e.id === params.targetElementId);
        const defaultVis = el ? el.visible : true;
        const currentVis = visibilityOverrides[params.targetElementId] !== undefined ? visibilityOverrides[params.targetElementId] : defaultVis;
        visibilityOverrides[params.targetElementId] = !currentVis;
        renderPage();
      }
      break;
    case 'ChangeText':
      if (params.targetElementId) {
        inputStates[params.targetElementId] = params.textValue || "";
        renderPage();
      }
      break;
    case 'TriggerAnimation':
      if (params.targetElementId) {
        const anim = params.animationName || 'bounce';
        const targetDom = document.getElementById("el-" + params.targetElementId);
        if (targetDom) {
          const cls = anim === "shake" ? "animate-shake" : "animate-bounce";
          targetDom.classList.add(cls);
          setTimeout(() => targetDom.classList.remove(cls), 1000);
        }
      }
      break;
    case 'OpenUrl':
      if (params.url) {
        window.open(params.url, '_blank');
      }
      break;
    case 'DownloadFile':
      showToast("Triggering file download: " + (params.fileName || 'bundle.zip'), "success");
      break;
    case 'SubmitForm':
      showToast("Form submission captured!", "success");
      break;
    case 'ResetForm':
      inputStates = {};
      showToast("Form values swept clean", "info");
      renderPage();
      break;
    default:
      console.log("No implementation fallback found for action type: " + type);
  }
}

function checkRuleCriteria(rule) {
  const rawVal = inputStates[rule.sourceElementId];
  const isChecked = typeof rawVal === 'boolean' ? rawVal : false;
  const strVal = String(rawVal === undefined || rawVal === null ? "" : rawVal);

  switch (rule.conditionType) {
    case 'Empty':
      return strVal.trim() === "";
    case 'NotEmpty':
      return strVal.trim() !== "";
    case 'Equals':
      return strVal.toLowerCase() === (rule.valueThreshold || "").toLowerCase();
    case 'NotEquals':
      return strVal.toLowerCase() !== (rule.valueThreshold || "").toLowerCase();
    case 'Checked':
      return isChecked === true;
    case 'Unchecked':
      return isChecked === false;
    case 'LessThan':
      return strVal.length < Number(rule.valueThreshold || 0);
    case 'GreaterThan':
      return strVal.length > Number(rule.valueThreshold || 0);
    default:
      return false;
  }
}

function handleElementClick(el) {
  let preventNormalClick = false;

  // Conditions Evaluation
  if (el.conditions && el.conditions.length > 0) {
    let condFiredCount = 0;
    el.conditions.forEach(cond => {
      const isMatched = checkRuleCriteria(cond);
      if (isMatched) {
        condFiredCount++;
        cond.successActions.forEach((act) => executeAction(act));
        preventNormalClick = true;
      } else {
        cond.failActions.forEach((act) => executeAction(act));
      }
    });
    if (condFiredCount > 0) return;
  }

  if (preventNormalClick) return;

  // Click Sequence
  if (el.clickSequences && el.clickSequences.length > 0) {
    const currentIdx = clickCounts[el.id] || 0;
    const sequence = el.clickSequences.find(s => s.clickIndex === currentIdx) || el.clickSequences[0];

    if (sequence) {
      sequence.actions.forEach((act) => executeAction(act));
      const nextIdx = (currentIdx + 1) % el.clickSequences.length;
      clickCounts[el.id] = nextIdx;
    }
  } else if (el.type === "Checkbox") {
    inputStates[el.id] = !inputStates[el.id];
    renderPage();
  }
}

function getRgbaColor(hex, opacity = 1) {
  if (!hex) return "transparent";
  if (hex === "transparent") return "transparent";
  if (hex.startsWith("rgb")) return hex;
  const cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
  }
  return hex;
}

function renderPage() {
  const page = DESIGN_BLUEPRINT.pages.find(p => p.id === currentPageId) || DESIGN_BLUEPRINT.pages[0];
  if (!page) return;

  // Clear overlays
  overlay.innerHTML = "";

  // Render Background Canvas Screenshot
  if (canvas && ctx) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = page.backgroundImage || "";
    img.onload = () => {
      const w = img.naturalWidth || 1200;
      const h = img.naturalHeight || 800;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      
      const wrapper = document.querySelector(".iframe-mockup");
      if (wrapper) {
        wrapper.style.aspectRatio = w + " / " + h;
        wrapper.style.maxWidth = w + "px";
      }
    };
    img.onerror = () => {
      // Elegant clear mockup
      canvas.width = 1200;
      canvas.height = 800;
      ctx.fillStyle = "#0c111d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Page Mockup Background Workspace", 600, 380);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("Drawing page layout map for page: " + page.name, 600, 420);
      
      const wrapper = document.querySelector(".iframe-mockup");
      if (wrapper) {
        wrapper.style.aspectRatio = "1200 / 800";
        wrapper.style.maxWidth = "1200px";
      }
    };
  }

  // Draw overlay interactive elements
  page.elements.forEach(el => {
    const isForcedHidden = visibilityOverrides[el.id] === false;
    const isForcedVisible = visibilityOverrides[el.id] === true;
    const activeVisibility = isForcedHidden ? false : isForcedVisible ? true : el.visible;

    if (!activeVisibility) return;

    // Create absolute element wrappers
    const elDiv = document.createElement("div");
    elDiv.id = "el-" + el.id;
    elDiv.className = "canvas-element";
    
    // Percentages mapping directly to responsive layouts
    elDiv.style.left = el.x + "%";
    elDiv.style.top = el.y + "%";
    elDiv.style.width = el.width + "%";
    elDiv.style.height = el.height + "%";
    elDiv.style.zIndex = el.zIndex || 10;

    const isInvisible = !!el.styles.invisibleOnScreen;
    const isTransparent = !!el.styles.transparent || isInvisible;
    const isNoBorder = !!el.styles.noBorder || isInvisible;

    const backdropOpacity = el.styles.opacity !== undefined ? el.styles.opacity : 1;
    const finalBgColor = isTransparent 
      ? "transparent" 
      : getRgbaColor(el.styles.backgroundColor || (el.type === "Button" ? "#2563eb" : "#ffffff"), backdropOpacity);
    const finalBorderColor = isNoBorder
      ? "none"
      : el.styles.borderColor
      ? "1.5px solid " + getRgbaColor(el.styles.borderColor, backdropOpacity)
      : el.type === "Button"
      ? "none"
      : "1.5px solid " + getRgbaColor("#cbd5e1", backdropOpacity);
    const elementFontFamily = el.styles.fontFamily 
      ? el.styles.fontFamily + ", ui-sans-serif, system-ui, sans-serif"
      : "inherit";
    const elementFontSize = el.styles.fontSize || "inherit";

    if (el.type === "Button") {
      const btn = document.createElement("button");
      btn.textContent = isInvisible ? "" : (el.label || "Action");
      btn.style.backgroundColor = finalBgColor;
      btn.style.color = isInvisible ? "transparent" : (el.styles.color || "#ffffff");
      btn.style.borderRadius = el.styles.borderRadius || "8px";
      btn.style.border = finalBorderColor;
      btn.style.fontFamily = elementFontFamily;
      btn.style.fontSize = elementFontSize !== "inherit" ? elementFontSize : "13px";
      btn.style.opacity = isInvisible ? "0" : "1";
      elDiv.appendChild(btn);
    } 
    else if (el.type === "Image") {
      const imgContainer = document.createElement("div");
      imgContainer.className = "canvas-element-image";
      imgContainer.style.opacity = backdropOpacity;
      imgContainer.style.borderRadius = el.styles.borderRadius || "8px";
      imgContainer.style.border = isNoBorder ? "none" : (el.styles.borderColor ? "1.5px solid " + el.styles.borderColor : "none");

      if (el.imageUrl) {
        const img = document.createElement("img");
        img.src = el.imageUrl;
        img.alt = el.label || el.id;
        img.style.objectFit = "fill";
        imgContainer.appendChild(img);
      } else {
        const placeholder = document.createElement("span");
        placeholder.style.color = "#94a3b8";
        placeholder.style.fontSize = "10px";
        placeholder.style.fontFamily = "monospace";
        placeholder.style.fontStyle = "italic";
        placeholder.textContent = "No Image URL";
        imgContainer.appendChild(placeholder);
      }
      elDiv.appendChild(imgContainer);
    }
    else if (["Text Input", "Email Input", "Password Input", "Phone Input", "Number Input"].includes(el.type)) {
      const input = document.createElement("input");
      if (el.type === "Password Input") input.type = "password";
      else if (el.type === "Number Input") input.type = "number";
      else if (el.type === "Email Input") input.type = "email";
      else if (el.type === "Phone Input") input.type = "tel";
      else input.type = "text";

      input.placeholder = isInvisible ? "" : (el.placeholder || "Enter details...");
      input.value = inputStates[el.id] || "";
      input.style.color = el.styles.color || "#1e293b";
      input.style.fontSize = elementFontSize !== "inherit" ? elementFontSize : "13px";
      input.style.fontFamily = elementFontFamily;
      input.style.backgroundColor = finalBgColor;
      input.style.borderRadius = el.styles.borderRadius || "6px";
      input.style.border = finalBorderColor;
      input.style.opacity = isInvisible ? "0" : "1";

      input.addEventListener("input", (e) => {
        inputStates[el.id] = e.target.value;
      });
      input.addEventListener("click", (e) => e.stopPropagation());
      elDiv.appendChild(input);
    }
    else if (el.type === "Checkbox") {
      const container = document.createElement("div");
      container.className = "canvas-element-checkbox";
      container.style.opacity = isInvisible ? (inputStates[el.id] ? 1 : 0) : 1;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!inputStates[el.id];
      checkbox.style.accentColor = "#2563eb";
      
      const label = document.createElement("span");
      label.textContent = isInvisible ? "" : (el.label || "");
      label.style.color = el.styles.color || "#1e293b";
      label.style.fontFamily = elementFontFamily;
      label.style.fontSize = elementFontSize !== "inherit" ? elementFontSize : "12px";

      checkbox.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        inputStates[el.id] = isChecked;
        
        const targetId = el.togglePasswordTargetId ? el.togglePasswordTargetId : null;
        if (targetId) {
          const passDom = document.querySelector("#el-" + targetId + " input");
          if (passDom) {
            passDom.type = isChecked ? "text" : "password";
          }
        } else if (el.label && el.label.toLowerCase().includes("show password")) {
          const firstPassInput = page.elements.find(x => x.type === "Password Input");
          if (firstPassInput) {
            const passDom = document.querySelector("#el-" + firstPassInput.id + " input");
            if (passDom) {
              passDom.type = isChecked ? "text" : "password";
            }
          }
        }
        renderPage();
      });

      container.appendChild(checkbox);
      container.appendChild(label);
      container.addEventListener("click", (e) => e.stopPropagation());
      elDiv.appendChild(container);
    }
    else if (el.type === "Text Area") {
      const textarea = document.createElement("textarea");
      textarea.placeholder = isInvisible ? "" : (el.placeholder || "Enter description...");
      textarea.value = inputStates[el.id] || "";
      textarea.style.color = el.styles.color || "#1e293b";
      textarea.style.fontSize = elementFontSize !== "inherit" ? elementFontSize : "12px";
      textarea.style.fontFamily = elementFontFamily;
      textarea.style.backgroundColor = finalBgColor;
      textarea.style.borderRadius = el.styles.borderRadius || "6px";
      textarea.style.border = finalBorderColor;
      textarea.style.opacity = isInvisible ? "0" : "1";

      textarea.addEventListener("input", (e) => {
        inputStates[el.id] = e.target.value;
      });
      textarea.addEventListener("click", (e) => e.stopPropagation());
      elDiv.appendChild(textarea);
    }
    else if (el.type === "Link") {
      const link = document.createElement("button");
      link.className = "canvas-element-link";
      link.textContent = isInvisible ? "" : (el.label || "Click Link");
      link.style.color = isInvisible ? "transparent" : (el.styles.color || "#3b82f6");
      link.style.fontSize = elementFontSize !== "inherit" ? elementFontSize : "12px";
      link.style.fontFamily = elementFontFamily;
      link.style.opacity = isInvisible ? "0" : "1";
      
      link.addEventListener("click", (e) => {
        e.preventDefault();
      });
      elDiv.appendChild(link);
    }
    else if (el.type === "Label") {
      const label = document.createElement("div");
      label.className = "canvas-element-label";
      label.textContent = isInvisible ? "" : (el.label || "");
      label.style.color = isInvisible ? "transparent" : (el.styles.color || "#1e293b");
      label.style.fontSize = elementFontSize !== "inherit" ? elementFontSize : "13px";
      label.style.fontFamily = elementFontFamily;
      label.style.opacity = isInvisible ? "0" : "1";
      elDiv.appendChild(label);
    }
    else {
      const custom = document.createElement("div");
      custom.className = "canvas-element-custom";
      custom.textContent = isInvisible ? "" : (el.label || el.type);
      custom.style.backgroundColor = finalBgColor;
      custom.style.color = isInvisible ? "transparent" : (el.styles.color || "#ffffff");
      custom.style.borderRadius = el.styles.borderRadius || "4px";
      custom.style.border = finalBorderColor;
      custom.style.fontFamily = elementFontFamily;
      custom.style.fontSize = elementFontSize !== "inherit" ? elementFontSize : "11px";
      custom.style.opacity = isInvisible ? "0" : "1";
      elDiv.appendChild(custom);
    }

    // Attach click triggers
    elDiv.addEventListener("click", () => {
      handleElementClick(el);
    });

    overlay.appendChild(elDiv);
  });
}

// Initial draw sequence setup
window.addEventListener("DOMContentLoaded", () => {
  renderPage();
});
renderPage();
`;
  };

  // 4. Generate README.md
  const getReadmeCode = (): string => {
    return `# Standalone HTML / CSS / JS Canvas Layout Export

A beautiful, lightweight prototype containing a digital representation of your mockup dashboard, matching coordinates dynamically.

## Contents of Export

- **\`index.html\`**: Viewport markup containing a <canvas> node displaying screen mockups.
- **\`style.css\`**: Responsive pixel-percentage mapping, glass banners, modals, and transition animations.
- **\`app.js\`**: Stateful behavior handles button click sequences, conditional rules, modal dialogue notices, and forms.

## Quick Launch Options

1. Simply double-click **\`index.html\`** inside your browser.
2. For optimal image and viewport rendering without any CORS blocks, start a simple helper web server:
   - python (v3): \`python -m http.server\`
   - node.js: \`npx serve .\`
`;
  };

  // Select target code to show in pre viewport based on selected file name
  const getFileContent = (): string => {
    switch (activeFile) {
      case "index.html":
        return getHtmlCode();
      case "style.css":
        return getCssCode();
      case "app.js":
        return getJsCode();
      case "README.md":
        return getReadmeCode();
      default:
        return "";
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generates clean zero-dependency HTML/CSS/JS export archive package
  const handleDownloadZip = async () => {
    try {
      setGenerating(true);
      const zip = new JSZip();

      // Bundle files directly
      zip.file("index.html", getHtmlCode());
      zip.file("style.css", getCssCode());
      zip.file("app.js", getJsCode());
      zip.file("README.md", getReadmeCode());

      const blob = await zip.generateAsync({ type: "blob" });

      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-canvas-mockup.zip`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const codeFiles = ["index.html", "style.css", "app.js", "README.md"];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-850 flex flex-col font-sans" id="code-generator-viewport">
      
      {/* Top Controller Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between" id="code-generator-nav">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-105 shadow-xs">
            <SquareCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>Pure HTML/CSS/JS Output Assembly</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                No TS Frameworks
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-light">Transform visual mockups into fully functional canvas-overlaid HTML/CSS/JS files</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadZip}
            disabled={generating}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-semibold px-4.5 py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            id="btn-trigger-zip-download"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{generating ? "Zipping Assets..." : "Export Complete .ZIP Package"}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
            id="btn-close-compiler"
          >
            Back to Canvas
          </button>
        </div>
      </nav>

      {/* Workspace Split pane */}
      <div className="flex-1 flex overflow-hidden" id="workspace-ide">
        
        {/* Left pane: Explorer Directory structure */}
        <aside className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-4" id="ide-explorer">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              PROJECT WORKSPACE
            </span>
            <p className="text-xs text-slate-705 font-bold truncate max-w-[200px]">{project.name}</p>
          </div>

          <div className="space-y-1" id="file-nodes-list">
            <span className="text-[9px] font-bold text-slate-400 block pb-1">📂 root/</span>
            {codeFiles.map((file) => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-left font-mono transition-all cursor-pointer ${
                  activeFile === file
                    ? "bg-blue-50 text-blue-600 border border-blue-105 font-semibold"
                    : "text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent"
                }`}
                id={`file-tab-${file}`}
              >
                <FileCode className={`w-3.5 h-3.5 ${activeFile === file ? "text-blue-500" : "text-slate-400"}`} />
                <span>{file}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-relaxed space-y-1.5" id="ide-quickinfo">
            <div className="flex items-center space-x-1 font-bold text-slate-700">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>Canvas-Overlaid Export</span>
            </div>
            <p>
              Renders coordinates dynamically using canvas relative scale percentages. Bundled with conditions, clicks, modal notices, form fields, and slide animation transitions in plain static scripts.
            </p>
          </div>
        </aside>

        {/* Right pane: Interactive Live Code Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white" id="ide-editor-stage">
          
          {/* Editor sub bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between" id="editor-subbar">
            <span className="text-xs font-mono text-slate-500 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>Viewing: /{activeFile}</span>
            </span>

            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-xs cursor-pointer"
              id="btn-copy-clip"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          {/* Interactive Code Pre box */}
          <div className="flex-1 overflow-auto p-6 font-mono text-xs text-slate-650 leading-relaxed select-text bg-white" id="editor-viewport">
            <pre className="whitespace-pre overflow-x-auto"><code id="raw-code-box">{getFileContent()}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}
