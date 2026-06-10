import React, { useState, useEffect, useRef } from "react";
import { Project, Page, CanvasElement, ElementType, ElementStyles } from "./types";
import Dashboard from "./components/Dashboard";
import PropertyEditor from "./components/PropertyEditor";
import WorkflowBuilder from "./components/WorkflowBuilder";
import PreviewMode from "./components/PreviewMode";
import CodeGenerator from "./components/CodeGenerator";
import { PRESET_TEMPLATES } from "./components/PresetTemplates";
import { 
  ArrowLeft, Upload, FileImage, Sparkles, Layout, Compass, 
  Trash2, Copy, Move, Maximize, ZoomIn, ZoomOut, Grid, AlignJustify, 
  Play, Code2, AlertTriangle, HelpCircle, Eye, EyeOff, Save, KeyRound, Check, X, Globe, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const STORAGE_KEY = "canvas2code-projects-local";

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Workspace resizer structures
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [propertyPaneWidth, setPropertyPaneWidth] = useState<number>(320);
  const [propertyPaneCollapsed, setPropertyPaneCollapsed] = useState<boolean>(false);

  const [workflowHeight, setWorkflowHeight] = useState<number>(260);
  const [workflowCollapsed, setWorkflowCollapsed] = useState<boolean>(false);

  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);
  const [isResizingPropertyPane, setIsResizingPropertyPane] = useState<boolean>(false);
  const [isResizingWorkflow, setIsResizingWorkflow] = useState<boolean>(false);

  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });
  const [webpageUrl, setWebpageUrl] = useState<string>("");
  const [isFetchingWebpage, setIsFetchingWebpage] = useState<boolean>(false);

  // Workspace utilities
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [explorerTab, setExplorerTab] = useState<"pages" | "elements">("pages");

  // Mobile layout state management
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"canvas" | "explorer" | "properties" | "workflow">("canvas");

  // Flow State triggers
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);

  // Dragging and Resizing Element internal states
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<{ width: number; height: number; x: number; y: number }>({ width: 0, height: 0, x: 0, y: 0 });
  const [resizeStartCursor, setResizeStartCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History for Undo/Redo operations
  const [undoHistory, setUndoHistory] = useState<Page[][]>([]);
  const [redoHistory, setRedoHistory] = useState<Page[][]>([]);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active loaded project model
  const activeProject = projects.find((p) => p.id === selectedProjectId);

  // Active page helpers
  const getActivePage = (): Page | undefined => {
    if (!activeProject) return undefined;
    return activeProject.pages.find((p) => p.id === activeProject.selectedPageId) || activeProject.pages[0];
  };

  // Push target snapshot to history for undo recovery
  const saveHistoryState = (pagesToSave: Page[]) => {
    setUndoHistory((prev) => [...prev, JSON.parse(JSON.stringify(pagesToSave))]);
    setRedoHistory([]); // Clear redo
  };

  // Auto save database state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Window drag listener controllers for resizable sections
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(180, Math.min(500, e.clientX));
        setSidebarWidth(newWidth);
      } else if (isResizingPropertyPane) {
        const newWidth = Math.max(180, Math.min(600, window.innerWidth - e.clientX));
        setPropertyPaneWidth(newWidth);
      } else if (isResizingWorkflow) {
        const newHeight = Math.max(120, Math.min(600, window.innerHeight - e.clientY));
        setWorkflowHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingPropertyPane(false);
      setIsResizingWorkflow(false);
    };

    if (isResizingSidebar || isResizingPropertyPane || isResizingWorkflow) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar, isResizingPropertyPane, isResizingWorkflow]);

  // Monitor screen width and flag mobile/compact layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // On compact/mobile screens, automatically focus properties tab when user selects an element
  useEffect(() => {
    if (isMobile && selectedElementId) {
      setMobileTab("properties");
    }
  }, [selectedElementId, isMobile]);

  // Sync natural background image dimensions or fallback to defaults
  useEffect(() => {
    const activePage = getActivePage();
    if (activePage && activePage.backgroundImage) {
      const img = new window.Image();
      img.onload = () => {
        setCanvasDimensions({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
      };
      img.src = activePage.backgroundImage;
    } else {
      setCanvasDimensions({ width: 1200, height: 800 });
    }
  }, [selectedProjectId, activeProject?.selectedPageId, getActivePage()?.backgroundImage]);

  // Project managers
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setSelectedElementId(null);
    setZoom(100);
  };

  const handleCreateProject = (name: string, desc: string, cloneFromTemplate?: Project) => {
    const id = `proj-${Date.now()}`;
    let initialPages: Page[] = [];

    if (cloneFromTemplate) {
      // Create fresh deep clone to prevent mutated references references
      initialPages = JSON.parse(JSON.stringify(cloneFromTemplate.pages));
    } else {
      initialPages = [
        {
          id: `page-${Date.now()}`,
          name: "Index Splash",
          backgroundImage: null,
          elements: [],
        },
      ];
    }

    const newProj: Project = {
      id,
      name,
      description: desc,
      pages: initialPages,
      selectedPageId: initialPages[0]?.id || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);
    setSelectedProjectId(id);
    setSelectedElementId(null);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to permanently discard this project canvas blueprint?")) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setSelectedElementId(null);
      }
    }
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setSelectedElementId(null);
  };

  const updateActivePageElements = (updater: (elements: CanvasElement[]) => CanvasElement[]) => {
    if (!activeProject) return;
    const activePage = getActivePage();
    if (!activePage) return;

    // Save history snapshot first!
    saveHistoryState(activeProject.pages);

    const nextPages = activeProject.pages.map((p) => {
      if (p.id === activePage.id) {
        return {
          ...p,
          elements: updater(p.elements),
        };
      }
      return p;
    });

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === activeProject.id) {
          return {
            ...proj,
            pages: nextPages,
            updatedAt: new Date().toISOString(),
          };
        }
        return proj;
      })
    );
  };

  // Elements operations
  const handleAddElement = (type: ElementType) => {
    const activePage = getActivePage();
    if (!activePage) return;

    const id = `${type.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36).substr(4, 4)}`;
    const newEl: CanvasElement = {
      id,
      type,
      label: type === "Button" ? "Submit Action" : type === "Label" ? "Display Label Text" : "",
      x: 35, // default centered positions
      y: 35,
      width: 25,
      height: 7,
      zIndex: 10,
      visible: true,
      locked: false,
      styles: {
        fontSize: "13px",
        borderRadius: "8px",
        color: "#1e293b",
        backgroundColor: type === "Button" ? "#2563eb" : "#ffffff",
      },
      clickSequences: [],
      conditions: [],
    };

    if (type === "Button") {
      newEl.styles.color = "#ffffff";
    }

    if (type === "Image") {
      newEl.label = "";
      newEl.imageUrl = "https://images.unsplash.com/photo-1541462608141-2f528131e501?w=400&auto=format&fit=crop&q=60";
      newEl.styles.transparent = true;
      newEl.styles.noBorder = true;
      newEl.width = 24;
      newEl.height = 16;
    }

    updateActivePageElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleUpdateElement = (updated: CanvasElement) => {
    updateActivePageElements((prev) =>
      prev.map((el) => (el.id === updated.id ? updated : el))
    );
  };

  const handleDeleteElement = (id: string) => {
    updateActivePageElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleDuplicateElement = (el: CanvasElement) => {
    const id = `${el.type.toLowerCase().replace(/[^a-z0-9]/g, "")}-dup-${Date.now().toString(36).substr(4, 4)}`;
    const dup: CanvasElement = {
      ...JSON.parse(JSON.stringify(el)),
      id,
      x: Math.min(el.x + 4, 80), // offset copy positions slightly
      y: Math.min(el.y + 4, 80),
    };
    updateActivePageElements((prev) => [...prev, dup]);
    setSelectedElementId(dup.id);
  };

  // Undo / Redo mechanics
  const handleUndo = () => {
    if (undoHistory.length === 0 || !activeProject) return;
    const previous = undoHistory[undoHistory.length - 1];
    const current = activeProject.pages;

    setRedoHistory((prev) => [...prev, JSON.parse(JSON.stringify(current))]);
    setUndoHistory((prev) => prev.slice(0, -1));

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            pages: previous,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const handleRedo = () => {
    if (redoHistory.length === 0 || !activeProject) return;
    const next = redoHistory[redoHistory.length - 1];
    const current = activeProject.pages;

    setUndoHistory((prev) => [...prev, JSON.parse(JSON.stringify(current))]);
    setRedoHistory((prev) => prev.slice(0, -1));

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            pages: next,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  // Pages Operations
  const handleAddPage = () => {
    if (!activeProject) return;
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: `Page Scaffold ${activeProject.pages.length + 1}`,
      backgroundImage: null,
      elements: [],
    };

    saveHistoryState(activeProject.pages);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            pages: [...p.pages, newPage],
            selectedPageId: newPage.id,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    setSelectedElementId(null);
  };

  const handleDuplicatePage = (page: Page) => {
    if (!activeProject) return;
    const newPage: Page = {
      ...JSON.parse(JSON.stringify(page)),
      id: `page-${Date.now()}`,
      name: `${page.name} (Copy)`,
    };

    saveHistoryState(activeProject.pages);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            pages: [...p.pages, newPage],
            selectedPageId: newPage.id,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    setSelectedElementId(null);
  };

  const handleDeletePage = (pageId: string) => {
    if (!activeProject) return;
    if (activeProject.pages.length <= 1) {
      alert("A visual blueprint requires keeping at least 1 active page view!");
      return;
    }

    saveHistoryState(activeProject.pages);

    const nextPages = activeProject.pages.filter((p) => p.id !== pageId);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            pages: nextPages,
            selectedPageId: nextPages[0].id,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
    setSelectedElementId(null);
  };

  const handleRenamePage = (pageId: string, name: string) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, name } : pg)),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const handleSelectPage = (pageId: string) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            selectedPageId: pageId,
          };
        }
        return p;
      })
    );
    setSelectedElementId(null);
  };

  // Image Upload helper binding
  const handleUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      if (!activeProject) return;

      const activePage = getActivePage();
      if (!activePage) return;

      saveHistoryState(activeProject.pages);

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === activeProject.id) {
            return {
              ...p,
              pages: p.pages.map((pg) => {
                if (pg.id === activePage.id) {
                  return { ...pg, backgroundImage: b64 };
                }
                return pg;
              }),
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFetchWebpageScreenshot = async () => {
    if (!webpageUrl.trim()) {
      alert("Please enter a webpage URL first.");
      return;
    }
    const activePage = getActivePage();
    if (!activePage || !activeProject) return;

    let targetUrl = webpageUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      setIsFetchingWebpage(true);
      const screenshotSrc = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&screenshot=true&embed=screenshot.url`;
      
      const response = await fetch(screenshotSrc);
      if (!response.ok) {
        throw new Error("Unable to fetch website mockup image. Please check the URL.");
      }
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        saveHistoryState(activeProject.pages);
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === activeProject.id) {
              return {
                ...p,
                pages: p.pages.map((pg) => {
                  if (pg.id === activePage.id) {
                    return { ...pg, backgroundImage: b64 };
                  }
                  return pg;
                }),
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          })
        );
        setIsFetchingWebpage(false);
        setWebpageUrl("");
      };
      reader.readAsDataURL(blob);
      
    } catch (error: any) {
      console.error(error);
      const fallbackUrl = `https://image.thum.io/get/width/1280/crop/800/${targetUrl}`;
      saveHistoryState(activeProject.pages);
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === activeProject.id) {
            return {
              ...p,
              pages: p.pages.map((pg) => {
                if (pg.id === activePage.id) {
                  return { ...pg, backgroundImage: fallbackUrl };
                }
                return pg;
              }),
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
      setIsFetchingWebpage(false);
      setWebpageUrl("");
    }
  };

  // Drag and Resize Canvas operations
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Clear selection if clicking the open canvas background
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "IMG") {
      setSelectedElementId(null);
    }
  };

  const handleElementDragStart = (e: React.MouseEvent, el: CanvasElement) => {
    if (el.locked) return;
    e.stopPropagation();
    setSelectedElementId(el.id);
    setDraggedElementId(el.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate relative percentage-based click offset
      const posX = ((e.clientX - rect.left) / rect.width) * 100;
      const posY = ((e.clientY - rect.top) / rect.height) * 100;
      setDragOffset({
        x: posX - el.x,
        y: posY - el.y,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, el: CanvasElement) => {
    if (el.locked) return;
    e.stopPropagation();
    setResizingElementId(el.id);
    setResizeStartSize({
      width: el.width,
      height: el.height,
      x: el.x,
      y: el.y,
    });
    setResizeStartCursor({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (draggedElementId) {
      const el = getActivePage()?.elements.find((item) => item.id === draggedElementId);
      if (!el || el.locked) return;

      // Mouse percent within responsive bounding box
      const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

      let targetX = mouseX - dragOffset.x;
      let targetY = mouseY - dragOffset.y;

      // Snap to Grid bounds
      if (snapToGrid) {
        targetX = Math.round(targetX * 2) / 2; // snap to 0.5% grid segments
        targetY = Math.round(targetY * 2) / 2;
      }

      // Bound safety constraints
      targetX = Math.max(0, Math.min(100 - el.width, targetX));
      targetY = Math.max(0, Math.min(100 - el.height, targetY));

      updateActivePageElements((prev) =>
        prev.map((item) => (item.id === draggedElementId ? { ...item, x: targetX, y: targetY } : item))
      );
    } else if (resizingElementId) {
      const el = getActivePage()?.elements.find((item) => item.id === resizingElementId);
      if (!el || el.locked) return;

      // Cursor movement delta translated to parent percentages
      const deltaX = ((e.clientX - resizeStartCursor.x) / rect.width) * 100;
      const deltaY = ((e.clientY - resizeStartCursor.y) / rect.height) * 100;

      let nextWidth = resizeStartSize.width + deltaX;
      let nextHeight = resizeStartSize.height + deltaY;

      if (snapToGrid) {
        nextWidth = Math.round(nextWidth * 2) / 2;
        nextHeight = Math.round(nextHeight * 2) / 2;
      }

      // Constrain sizing minimum elements
      nextWidth = Math.max(2, Math.min(100 - resizeStartSize.x, nextWidth));
      nextHeight = Math.max(1, Math.min(100 - resizeStartSize.y, nextHeight));

      updateActivePageElements((prev) =>
        prev.map((item) => (item.id === resizingElementId ? { ...item, width: nextWidth, height: nextHeight } : item))
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedElementId(null);
    setResizingElementId(null);
  };

  // Multimodal Gemini vision pipeline
  const handleAIScan = async () => {
    const activePage = getActivePage();
    if (!activePage || !activePage.backgroundImage) {
      alert("Please upload a UI screenshot background design before executing AI analysis!");
      return;
    }

    try {
      setIsScanning(true);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: activePage.backgroundImage,
          mimeType: "image/png",
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed server scan");
      }

      const results = await response.json();
      if (results.elements && Array.isArray(results.elements)) {
        // Build actual objects matching CanvasElement properties
        const generatedElements: CanvasElement[] = results.elements.map((el: any) => {
          const type = el.type as ElementType;
          return {
            id: el.id,
            type,
            label: el.label || "",
            x: Number(el.x),
            y: Number(el.y),
            width: Number(el.width),
            height: Number(el.height),
            zIndex: 10,
            visible: true,
            locked: false,
            styles: {
              fontSize: "13px",
              borderRadius: "8px",
              color: "#1e293b",
              backgroundColor: type === "Button" ? "#2563eb" : "#ffffff",
              borderWidth: "1px",
              borderColor: "#cbd5e1"
            },
            clickSequences: [],
            conditions: [],
          };
        });

        // Insert elements dynamically
        updateActivePageElements((prev) => [...prev, ...generatedElements]);
        alert(`Gemini AI vision analysis completed successfully! Identified ${generatedElements.length} interactive fields, components and buttons mapped directly onto your active design canvas.`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`AI Vision Scan Unsuccessful: ${err.message || "Ensure key config in Secrets panel."}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDownloadRulerGridMock = () => {
    // Easy default templates backdrops injector helper inside custom project
    if (!activeProject) return;
    const activePage = getActivePage();
    if (!activePage) return;

    saveHistoryState(activeProject.pages);

    // Load getAuthBackdrop SVG visual mockup inside empty canvas page
    const getAuthBackdrop = PRESET_TEMPLATES[0].pages[0].backgroundImage;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            pages: p.pages.map((pg) => {
              if (pg.id === activePage.id) {
                return { ...pg, backgroundImage: getAuthBackdrop };
              }
              return pg;
            }),
          };
        }
        return p;
      })
    );
  };

  // Return to Dashboard block if selectedProjectId is null
  if (!selectedProjectId || !activeProject) {
    return (
      <Dashboard
        projects={projects}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  const activePage = getActivePage() || activeProject.pages[0];
  const selectedElement = activePage?.elements.find((el) => el.id === selectedElementId);

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none" id="builder-editor-root">
      
      {/* Visual Builder Header bar */}
      <header className="bg-slate-900 border-b border-slate-950 px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between z-10 shadow-md text-white flex-shrink-0" id="builder-header">
        <div className="flex items-center space-x-2 md:space-x-4" id="header-branding">
          <button
            onClick={handleBackToDashboard}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-all"
            id="back-arrow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xs md:text-sm font-bold text-white tracking-tight truncate max-w-[120px] sm:max-w-none">{activeProject.name}</h2>
              <span className="text-[9px] md:text-[10px] bg-slate-800 text-slate-350 border border-slate-700 px-1.5 py-0.5 rounded-full font-mono hidden sm:inline-block">
                {activeProject.id}
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 truncate max-w-sm font-light hidden md:block">Canvas-to-Code visual workspace editor</p>
          </div>
        </div>

        {/* History tools (Undo/Redo) */}
        <div className="hidden md:flex items-center space-x-1.5" id="history-panel">
          <button
            onClick={handleUndo}
            disabled={undoHistory.length === 0}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition"
            title="Undo"
          >
            <span>↶</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={redoHistory.length === 0}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition"
            title="Redo"
          >
            <span>↷</span>
          </button>

          <span className="text-slate-800 h-5 w-[1px] bg-slate-800 inline-block"></span>

          {/* Guidelines toggles */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-2 rounded-lg transition ${snapToGrid ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            title="Toggle Grid Snapping"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`p-2 rounded-lg transition ${showRulers ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            title="Toggle Margin Rulers"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* Top Actions Buttons */}
        <div className="flex items-center space-x-2 md:space-x-3" id="top-ctrls">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 md:px-4 py-2 rounded-xl text-xs transition active:scale-95 shadow-md shadow-emerald-600/10"
            id="btn-play-preview"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Live Playback</span>
          </button>

          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 md:px-4 py-2 rounded-xl text-xs transition active:scale-95 shadow-md shadow-blue-600/10"
            id="btn-compiler-export"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Generate Code</span>
          </button>
        </div>
      </header>

      {/* Mobile-centric workspace navigation toolbar */}
      {isMobile && (
        <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex items-center justify-around text-slate-300 font-medium text-[11px] shadow-inner flex-shrink-0" id="mobile-tabs-bar">
          <button
            onClick={() => setMobileTab("canvas")}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              mobileTab === "canvas" ? "bg-blue-650/30 bg-blue-600/20 border border-blue-500 text-blue-400 font-bold" : "hover:text-white"
            }`}
          >
            <Layout className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => setMobileTab("explorer")}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              mobileTab === "explorer" ? "bg-blue-650/30 bg-blue-600/20 border border-blue-500 text-blue-400 font-bold" : "hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Widgets/Pages</span>
          </button>
          <button
            onClick={() => setMobileTab("properties")}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              mobileTab === "properties" ? "bg-blue-650/30 bg-blue-600/20 border border-blue-500 text-blue-400 font-bold" : "hover:text-white"
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Properties</span>
          </button>
          <button
            onClick={() => setMobileTab("workflow")}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
              mobileTab === "workflow" ? "bg-blue-650/30 bg-blue-600/20 border border-blue-500 text-blue-400 font-bold" : "hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
            <span>Workflow</span>
          </button>
        </div>
      )}

      {/* Main split work screen */}
      <div className="flex-1 flex overflow-hidden relative font-sans" id="workspace-layout">
        
        {/* Left exploration column (Pages list, Elements types drawer) */}
        {(!isMobile || mobileTab === "explorer") && (
          <div className={`${isMobile ? "w-full h-full flex flex-col" : "flex flex-shrink-0 select-none relative"}`} style={isMobile ? undefined : { width: sidebarCollapsed ? "40px" : `${sidebarWidth}px` }}>
            {sidebarCollapsed && !isMobile ? (
              <div className="w-[40px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 space-y-4 text-slate-400 h-full">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-white transition cursor-pointer"
                  title="Expand Explorer Panel"
                >
                  <Compass className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            ) : (
              <aside style={isMobile ? { width: "100%" } : { width: `${sidebarWidth}px` }} className="bg-white border-r border-slate-205 flex flex-col justify-between h-full relative" id="blueprint-explorer">
                {!isMobile && (
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition z-10 cursor-pointer"
                    title="Collapse Explorer Panel"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                  </button>
                )}

              <div className="p-4 space-y-4 flex-1 overflow-y-auto" id="explorer-core-box">
                {/* Explorer navigation tabs */}
                <div className="grid grid-cols-2 p-1 text-center border border-slate-200/80 bg-slate-50 text-[10px] font-bold pb-1 rounded-lg" id="explore-tabs">
                  <button
                    onClick={() => setExplorerTab("pages")}
                    className={`py-1.5 rounded transition cursor-pointer ${explorerTab === "pages" ? "bg-white text-blue-600 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-850"}`}
                    style={{ contentVisibility: "auto" }}
                  >
                    Pages ({activeProject.pages.length})
                  </button>
                  <button
                    onClick={() => setExplorerTab("elements")}
                    className={`py-1.5 rounded transition cursor-pointer ${explorerTab === "elements" ? "bg-white text-blue-600 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-855"}`}
                    style={{ contentVisibility: "auto" }}
                  >
                    Widgets
                  </button>
                </div>

                {explorerTab === "pages" && (
                  <div className="space-y-3" id="pages-list-sec">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
                      <span>SCREEN VIEWS STRUCTURE</span>
                      <button
                        onClick={handleAddPage}
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer"
                      >
                        + Add page
                      </button>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[350px] pr-1" id="pages-vertical-stack">
                      {activeProject.pages.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPage(p.id)}
                          className={`group p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                            p.id === activePage?.id
                              ? "bg-blue-650/10 bg-blue-50 text-blue-600 border-blue-500/30 font-semibold"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="text"
                            value={p.name}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleRenamePage(p.id, e.target.value)}
                            className="bg-transparent font-medium border-none outline-none focus:bg-white px-1 hover:underline truncate w-32 text-slate-800"
                          />
                          
                          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1.5 pl-1.5" id="page-actions-inline">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicatePage(p);
                              }}
                              className="text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                              title="Clone view"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(p.id);
                              }}
                              className="text-slate-505 hover:text-red-500 p-0.5 cursor-pointer"
                              title="Delete view"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {explorerTab === "elements" && (
                  <div className="space-y-3" id="elements-list-sec">
                    <span className="text-[11px] font-bold text-slate-500 tracking-wider">ADD INTERACTIVE ELEMENTS</span>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1" id="shapes-buttons-drawer">
                      {([
                        "Button", "Text Input", "Email Input", "Password Input", 
                        "Phone Input", "Number Input", "Dropdown", "Checkbox", 
                        "Radio Button", "Text Area", "Label", "Link", "Container",
                        "Image"
                      ] as ElementType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleAddElement(type)}
                          style={{ contentVisibility: "auto" }}
                          className="text-left bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 p-2.5 rounded-xl text-xs transition duration-150 flex flex-col justify-between h-16 relative cursor-pointer"
                        >
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-mono">
                            Create
                          </span>
                          <span className="font-semibold text-slate-800 block truncate w-24">
                            {type}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50" id="explorer-backdrop-controls">
                <span className="text-[11px] font-bold text-slate-500 tracking-wider block">PAGE SCREEN BACKDROP</span>
                
                {activePage?.backgroundImage ? (
                  <div className="space-y-2.5" id="backdrop-loaded">
                    <div className="flex items-center space-x-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100" id="bgr-notif">
                      <FileImage className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-[11px] text-emerald-805 truncate w-36 font-semibold">Image Uploaded</span>
                    </div>

                    <div className="flex space-x-2" id="back-btns">
                      <button
                        onClick={() => {
                          if (confirm("Reset current canvas visual mockup?")) {
                            saveHistoryState(activeProject.pages);
                            setProjects((prev) =>
                              prev.map((p) => {
                                if (p.id === activeProject.id) {
                                  return {
                                    ...p,
                                    pages: p.pages.map((pg) => {
                                      if (pg.id === activePage.id) {
                                        return { ...pg, backgroundImage: null, elements: [] };
                                      }
                                      return pg;
                                    }),
                                  };
                                }
                                return p;
                              })
                            );
                            setSelectedElementId(null);
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-red-500 hover:text-red-700 py-1.5 rounded-lg text-[10px] font-semibold transition shadow-xs cursor-pointer"
                      >
                        Clear Map
                      </button>
                      <button
                        onClick={handleAIScan}
                        disabled={isScanning}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                        id="btn-scan-ai"
                      >
                        <Sparkles className="w-3 h-3 animate-pulse text-white" />
                        <span>{isScanning ? "Scann..." : "AI segment"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2" id="backdrop-empty">
                    <p className="text-[10px] text-slate-500 leading-normal font-light">
                      Drop mockup screenshots, drawings or frames, then define active clickable bounding shapes.
                    </p>
                    
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleUploadBackground}
                      className="hidden"
                    />

                    <div className="space-y-1.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Screenshot</span>
                      </button>

                      <button
                        onClick={handleDownloadRulerGridMock}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-1.5 rounded-lg text-[10px] font-bold border border-indigo-100 transition-all text-center block cursor-pointer"
                      >
                        ⚡ Mount Prototype visual
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 border-t border-slate-200 pt-3 mt-1 select-none">
                  <span className="text-[10px] font-bold text-slate-600 flex items-center space-x-1 uppercase">
                    <Globe className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <span>Fetch Backdrop from URL</span>
                  </span>
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      placeholder="e.g. google.com"
                      value={webpageUrl}
                      onChange={(e) => setWebpageUrl(e.target.value)}
                      className="flex-1 bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      onClick={handleFetchWebpageScreenshot}
                      disabled={isFetchingWebpage}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-305 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      {isFetchingWebpage ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Fetch</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[8.5px] text-slate-500 font-light leading-normal">
                    Snap and load live webpage screenshot automatically as the background.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}

        {/* Vertical Split Resizer for Sidebar */}
        {!sidebarCollapsed && !isMobile && (
          <div
            onMouseDown={() => setIsResizingSidebar(true)}
            className="w-1 bg-slate-200 hover:bg-blue-500 hover:w-1.5 transition-all cursor-col-resize h-full z-20 flex-shrink-0"
            title="Drag to resize explorers list"
          />
        )}

        {/* Center Section: Drag Drop Workspace Canvas stage */}
        {(!isMobile || mobileTab === "canvas") && (
          <section className="flex-1 bg-slate-100 overflow-hidden flex flex-col h-full relative" id="stage-viewport">
          
          <div className="flex-1 overflow-hidden flex flex-col h-full relative">
            {/* Workspace zoom adjuster controls */}
            <div className="bg-white border-b border-slate-205 px-5 py-2.5 select-none text-xs text-slate-500 flex items-center justify-between shadow-xs flex-shrink-0" id="zoom-and-panning">
              <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
                Blueprints Active Frame viewport
              </span>

              <div className="flex items-center space-x-3.5" id="zoom-ctrls">
                <div className="flex items-center space-x-2 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-lg shadow-xs">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="text-slate-500 hover:text-slate-800 p-0.5 transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-605 font-mono w-10 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(150, zoom + 10))}
                    className="text-slate-500 hover:text-slate-800 p-0.5 transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Core Visual Stage scroll zone */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] bg-slate-100 min-h-0" id="stage-scroll">
              <div
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                style={{
                  width: `${canvasDimensions.width}px`,
                  height: `${canvasDimensions.height}px`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "center center",
                  contentVisibility: "auto",
                }}
                className="relative bg-white border border-slate-205 rounded-xl shadow-xl transition-all overflow-hidden flex-shrink-0"
                id="active-editor-canvas"
              >
                {activePage?.backgroundImage ? (
                  <img
                    src={activePage.backgroundImage}
                    alt={activePage.name}
                    className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                    id="img-canvas-backing"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center text-center p-6 space-y-4 shadow-inner" id="stage-empty-placeholder">
                    <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm" id="icon-inner">
                      <FileImage className="w-10 h-10 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-800 font-bold text-base">Your viewport background is blank</p>
                      <p className="text-xs text-slate-400 max-w-sm font-light">Upload a screenshot mockup layout, wire frame, or draft image on the left sidebar to start placing click nodes!</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Select Local Diagram
                    </button>
                  </div>
                )}

                {/* Placed click regions overlays */}
                {activePage?.elements.map((el) => {
                  const isSelected = el.id === selectedElementId;

                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleElementDragStart(e, el)}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.width}%`,
                        height: `${el.height}%`,
                        zIndex: el.zIndex || 10,
                        contentVisibility: "auto",
                      }}
                      className={`absolute rounded cursor-move transition-all flex items-center justify-between pointer-events-auto ${
                        isSelected
                          ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 bg-blue-500/15 border border-blue-400"
                          : el.styles.invisibleOnScreen
                          ? "border border-dashed border-amber-500/60 bg-amber-500/5 hover:bg-amber-500/10"
                          : el.styles.transparent
                          ? "border border-dashed border-purple-400/50 bg-purple-400/5 hover:bg-purple-400/10"
                          : "hover:bg-blue-550/10 hover:bg-slate-100/10 border border-dashed border-blue-500/40 bg-blue-500/5"
                      }`}
                      id={`canvas-el-wrapper-${el.id}`}
                    >
                      {/* Visual representative content */}
                      <div className={`absolute top-1 left-2 text-[8px] font-bold font-mono uppercase bg-white/95 border px-1.5 py-0.5 rounded pointer-events-none truncate max-w-[80%] ${
                        el.styles.invisibleOnScreen
                          ? "text-amber-600 border-amber-200"
                          : el.styles.transparent
                          ? "text-purple-600 border-purple-200"
                          : "text-blue-500 border-blue-200"
                      }`}>
                        {el.styles.invisibleOnScreen && "👻 "}
                        {el.id}
                      </div>

                      {el.type === "Image" ? (
                        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded">
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
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center p-1 text-[11px] font-mono text-center pointer-events-none font-bold truncate ${
                          el.styles.invisibleOnScreen
                            ? "text-amber-700/60"
                            : "text-slate-700"
                        }`}>
                          {el.label || el.type}
                          {el.styles.invisibleOnScreen && " (Invisible area)"}
                        </div>
                      )}

                      {/* Resizer anchor drag handle */}
                      {isSelected && !el.locked && (
                        <div
                          onMouseDown={(e) => handleResizeStart(e, el)}
                          className="absolute bottom-[-4px] right-[-4px] w-3 h-3 bg-blue-550 bg-blue-600 border border-white cursor-se-resize rounded-full z-20 hover:scale-125 transition-transform"
                          id="resizer-anchor"
                        />
                      )}

                      {/* Quick overlay indicators */}
                      {el.locked && (
                        <div className="absolute top-1 right-2" id="islocked-badge">
                          🔒
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Workflow Graph visualization bottom dock */}
          {activePage && !isMobile && (
            <div className="flex-shrink-0 flex flex-col relative w-full border-t border-slate-200" style={{ height: workflowCollapsed ? "40px" : `${workflowHeight}px` }}>
              {/* Horizontal Resizer block for Workflow */}
              {!workflowCollapsed && (
                <div
                  onMouseDown={() => setIsResizingWorkflow(true)}
                  className="h-1 bg-slate-300 hover:bg-blue-500 transition-all cursor-row-resize w-full z-20 flex-shrink-0"
                  title="Drag to resize workflow canvas panel"
                />
              )}

              <div className="flex-1 min-h-0 bg-slate-950 overflow-hidden relative">
                {workflowCollapsed ? (
                  <div className="h-[40px] px-6 bg-slate-50 flex items-center justify-between text-xs text-slate-500 h-full select-none">
                    <span className="font-bold flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-550 animate-pulse bg-blue-600 inline-block" />
                      <span>Visual Logic Flow Connection Map (Collapsed)</span>
                    </span>
                    <button
                      onClick={() => setWorkflowCollapsed(false)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md font-semibold text-[10px] cursor-pointer"
                    >
                      Maximize Map
                    </button>
                  </div>
                ) : (
                  <div className="h-full relative flex flex-col">
                    <button
                      onClick={() => setWorkflowCollapsed(true)}
                      className="absolute top-3 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition z-40 cursor-pointer"
                      title="Collapse Workflow Connection Map"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex-1 h-full min-h-0">
                      <WorkflowBuilder
                        page={activePage}
                        allElements={activePage.elements}
                        pages={activeProject.pages}
                        onSelectElement={(id) => setSelectedElementId(id)}
                        onUpdateElement={handleUpdateElement}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Full screen Workflow builder on mobile layout */}
      {isMobile && mobileTab === "workflow" && activePage && (
        <div className="flex-1 bg-slate-950 overflow-hidden relative h-full w-full flex flex-col">
          <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-semibold select-none flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />
              <span>Logic Flow connection map for: {activePage.name}</span>
            </span>
          </div>
          <div className="flex-1 h-full min-h-0">
            <WorkflowBuilder
              page={activePage}
              allElements={activePage.elements}
              pages={activeProject.pages}
              onSelectElement={(id) => {
                setSelectedElementId(id);
                setMobileTab("properties");
              }}
              onUpdateElement={handleUpdateElement}
            />
          </div>
        </div>
      )}

        {/* Right side properties adjustment board */}
        {(!isMobile || mobileTab === "properties") && (
          <div className={`${isMobile ? "w-full h-full flex flex-col" : "flex flex-shrink-0 select-none relative"}`} style={isMobile ? undefined : { width: propertyPaneCollapsed ? "40px" : `${propertyPaneWidth}px` }}>
            {/* Vertical resizer on the left of property pane */}
            {!propertyPaneCollapsed && !isMobile && (
              <div
                onMouseDown={() => setIsResizingPropertyPane(true)}
                className="w-1 bg-slate-205 bg-slate-200 hover:bg-blue-500 cursor-col-resize transition-all h-full z-20 flex-shrink-0"
                title="Drag to resize settings board"
              />
            )}

            {propertyPaneCollapsed && !isMobile ? (
              <div className="w-[40px] bg-slate-50 border-l border-slate-200 flex flex-col items-center py-4 space-y-4 text-slate-400 h-full">
                <button
                  onClick={() => setPropertyPaneCollapsed(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                  title="Expand Properties Board"
                >
                  <Layout className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="h-full relative flex-1 flex flex-col min-w-0 bg-white w-full">
                {!isMobile && (
                  <button
                    onClick={() => setPropertyPaneCollapsed(true)}
                    className="absolute top-2.5 right-3.5 p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition z-20 cursor-pointer"
                    title="Collapse Properties Board"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
                
                {selectedElement ? (
                  <PropertyEditor
                    element={selectedElement}
                    pages={activeProject.pages}
                    allElements={activePage.elements}
                    onUpdateElement={handleUpdateElement}
                  />
                ) : (
                  <div className="w-full bg-white border-l border-slate-200 p-6 flex flex-col justify-center items-center text-center text-slate-400 space-y-3 font-sans h-full shadow-xs" id="prop-editor-empty">
                    <Layout className="w-8 h-8 text-slate-300" />
                    <div className="space-y-1.5">
                      <p className="text-slate-800 font-bold text-sm">No Canvas Element Selected</p>
                      <p className="text-[11px] text-slate-400 leading-normal max-w-xs font-light">Click any placed region or add an interactive layout layer from the left drawer to calibrate details.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Preview Mode Fullscreen overlay */}
      {showPreview && (
        <PreviewMode
          project={activeProject}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Production Code Generator Fullscreen overlay */}
      {showGenerator && (
        <CodeGenerator
          project={activeProject}
          onClose={() => setShowGenerator(false)}
        />
      )}
    </div>
  );
}
