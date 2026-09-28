import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  FileText, 
  CheckSquare, 
  Calendar, 
  ArrowRight,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { ProjectItem } from './types';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      name: 'Political Science Semester 1',
      description: 'Constitutional law analysis, state theory, comparative governance research.',
      category: 'Academics',
      createdAt: '2026-06-01',
      notesCount: 8,
      filesCount: 4,
      tasksCount: 6,
      tasks: [
        { id: 't1', title: 'Submit AI Constitutional Governance assignment', status: 'completed' },
        { id: 't2', title: 'Review Chapter 4 on Federalism doctrines', status: 'in-progress' },
        { id: 't3', title: 'Compile APA references for judicial precedent', status: 'todo' }
      ],
      notes: [
        'Focus on Article 14 equal protection standards.',
        'Contrast judicial review in Indian vs US constitutional systems.'
      ]
    },
    {
      id: 'proj-2',
      name: 'Autonomous Robotics Agent Core',
      description: 'Distributed vector routing, sensor-fusion neural algorithms, sub-second latency.',
      category: 'AI Research',
      createdAt: '2026-06-05',
      notesCount: 14,
      filesCount: 12,
      tasksCount: 9,
      tasks: [
        { id: 't4', title: 'Benchmark Gemini 2.5 Flash token throughput', status: 'completed' },
        { id: 't5', title: 'Deploy Web Speech bidirectional channel', status: 'in-progress' }
      ],
      notes: [
        'Enforce server-side key wrapping.',
        'Maintain zero UI blocking during background ingestion.'
      ]
    }
  ]);

  const [newProjectName, setNewProjectName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      description: 'Custom research and project workspace.',
      category: 'General',
      createdAt: new Date().toISOString().slice(0, 10),
      notesCount: 0,
      filesCount: 0,
      tasksCount: 0,
      tasks: [],
      notes: []
    };
    setProjects([...projects, newProj]);
    setNewProjectName('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-white shadow-xs">
            <FolderKanban size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Project Workspaces</h1>
            <p className="text-xs text-slate-600">
              Isolated context environments with custom memory, files, tasks & dedicated AI reasoning
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs p-6 space-y-4 backdrop-blur-md hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                  {proj.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{proj.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pink-100 text-center">
              <div className="p-2 rounded-xl bg-pink-50/50">
                <span className="block text-sm font-bold text-slate-900">{proj.filesCount}</span>
                <span className="text-[10px] text-slate-500">Files</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/50">
                <span className="block text-sm font-bold text-purple-900">{proj.tasksCount}</span>
                <span className="text-[10px] text-slate-500">Tasks</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50/50">
                <span className="block text-sm font-bold text-rose-900">{proj.notesCount}</span>
                <span className="text-[10px] text-slate-500">Notes</span>
              </div>
            </div>

            {/* Task list preview */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckSquare size={13} className="text-pink-600" />
                <span>Priority Tasks</span>
              </h4>
              {proj.tasks.slice(0, 2).map((t) => (
                <div key={t.id} className="text-xs text-slate-600 flex items-center justify-between p-2 rounded-xl bg-pink-50/30">
                  <span className="truncate">{t.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-pink-200 space-y-4 animate-scaleUp">
            <h3 className="text-base font-bold text-slate-900">Create New Project</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Constitutional Law Research"
              className="w-full rounded-2xl bg-pink-50/40 border border-pink-200 p-3 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-pink-50 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
