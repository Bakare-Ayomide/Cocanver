import React, { useState } from "react";
import { Project } from "../types";
import { PRESET_TEMPLATES } from "./PresetTemplates";
import { motion } from "motion/react";
import { Plus, Folder, Trash2, Copy, FileCode2, Zap, ArrowRight, Play, Compass, HardDrive } from "lucide-react";

interface DashboardProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, description: string, cloneFromTemplate?: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function Dashboard({
  projects,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}: DashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject(name, description);
    setName("");
    setDescription("");
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="dashboard-root">
      {/* Top navigation header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs" id="dashboard-header">
        <div className="flex items-center space-x-3" id="branding">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/25" id="brand-logo">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Canvas2Code
            </h1>
            <p className="text-xs text-slate-500 font-medium">Transform layout wireframes & designs into functional pages</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-95"
          id="btn-create-project"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-12" id="dashboard-content">
        {/* Intro Hero Section */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 text-white p-8 md:p-12 shadow-sm" id="dashboard-hero">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="relative max-w-2xl space-y-4" id="hero-texts">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              ⚡ Sandbox AI Active
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Design from Mockups.<br />
              Generated into Production Code.
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base font-light">
              Upload drawings, digital wireframes, or mockup screenshots. Canvas2Code uses Gemini Vision models to segment active layout regions instantly, letting you map custom events/triggers, state checks, page links, and download custom visual assets or React templates.
            </p>
          </div>
        </div>

        {/* Existing Projects section */}
        <div className="space-y-6" id="your-projects-sec">
          <div className="flex items-center space-x-2 text-slate-700 border-b border-slate-200 pb-3" id="projects-header">
            <Folder className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold tracking-tight text-slate-800">Your Workspace Blueprints</h3>
            <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold ml-2">
              {projects.length} saved
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-500 space-y-4 text-center px-4 shadow-xs" id="empty-projects-state">
              <div className="bg-slate-50 p-4 rounded-full border border-slate-100">
                <HardDrive className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 font-semibold text-base">Your blueprint workshop is empty</p>
                <p className="text-sm max-w-sm text-slate-400">Create a pristine project from scratch or clone any of our production-ready visual code templates below to test behaviors immediately!</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl text-sm border border-slate-205 transition-all"
                id="btn-create-empty"
              >
                Assemble Empty Canvas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="projects-grid">
              {projects.map((proj) => (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg transition-all p-5 flex flex-col justify-between shadow-xs"
                  id={`project-card-${proj.id}`}
                >
                  <div className="space-y-3" id="card-desc">
                    <div className="flex items-start justify-between" id="card-top-header">
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100" id="file-icon">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Blueprint"
                        id={`btn-del-${proj.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div id="card-texts">
                      <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 pb-1">
                        {proj.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                        {proj.description || "Interactive canvas workspace with custom click sequences and AI image support."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-400" id="card-footer">
                    <span className="font-medium text-slate-500">Pages: {proj.pages?.length || 0}</span>
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold group/btn"
                      id={`btn-open-${proj.id}`}
                    >
                      <span>Configure Canvas</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Preset Templates Showcase */}
        <div className="space-y-6" id="templates-sec">
          <div className="flex items-center space-x-2 text-slate-700 border-b border-slate-200 pb-3" id="templates-header">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold tracking-tight text-slate-800">Interactive Blueprint Prototypes</h3>
            <span className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-0.5 rounded-full font-semibold ml-2">
              Presets Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="templates-grid">
            {PRESET_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="group relative rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs"
                id={`template-card-${tmpl.id}`}
              >
                <div className="space-y-3" id="tmpl-meta">
                  <div className="flex items-center justify-between" id="tmpl-head">
                    <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-20 py-1.5 px-2.5 rounded">
                      Sandbox Cloner
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">Pages: {tmpl.pages.length}</span>
                  </div>

                  <div id="tmpl-desc">
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {tmpl.name}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto" id="tmpl-badges">
                    {tmpl.pages[0]?.elements.map((el) => (
                      <span key={el.id} className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium tracking-tight font-mono">
                        {el.type}
                      </span>
                    ))}
                    {(tmpl.pages[0]?.elements.length ?? 0) === 0 && <span className="text-[10px] text-slate-500 font-mono">Empty workspace backdrops</span>}
                  </div>
                </div>

                <button
                  onClick={() => onCreateProject(tmpl.name, `Preset configuration: ${tmpl.description}`, tmpl)}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 hover:border-transparent py-2.5 rounded-xl transition-all font-semibold text-xs active:scale-95"
                  id={`btn-load-${tmpl.id}`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Mount Live Sandbox</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal for creating custom projects */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-slate-900/60 backdrop-blur-xs px-4" id="modal-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 text-slate-800"
            id="create-modal-content"
          >
            <div id="modal-head">
              <h3 className="text-lg font-bold text-slate-950 tracking-tight">Formulate Digital Canvas</h3>
              <p className="text-xs text-slate-500">Deploy a blueprint wrapper, setup sizes, and upload views.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" id="modal-form">
              <div className="space-y-1.5" id="name-field">
                <label className="text-xs font-semibold text-slate-700">Workspace Blueprint Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Signup Gate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm outline-none border border-slate-200 focus:border-blue-500 text-slate-800 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5" id="desc-field">
                <label className="text-xs font-semibold text-slate-700">Target Segment Description</label>
                <textarea
                  placeholder="Specify targeted flows, login criteria, or form sequences..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm outline-none border border-slate-200 focus:border-blue-500 text-slate-800 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2" id="modal-btns">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  id="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-600/10"
                  id="btn-submit-form"
                >
                  Generate Blueprint
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
