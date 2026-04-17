/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { TaxonomyNode } from './components/TaxonomyNode';
import { DetailsPanel } from './components/DetailsPanel';
import { Discipline, getSubDisciplines } from './services/gemini';
import { Layers } from 'lucide-react';

export default function App() {
  const [rootNodes, setRootNodes] = useState<Discipline[]>([]);
  const [isLoadingRoots, setIsLoadingRoots] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Discipline | null>(null);

  // Sync state from URL on initial load
  useEffect(() => {
    async function loadInitialState() {
      setIsLoadingRoots(true);
      try {
        const result = await getSubDisciplines('ROOT');
        setRootNodes(result);

        // Check for bookmarked discipline in URL
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('id');
        const urlTitle = params.get('title');
        const urlDesc = params.get('desc');

        if (urlId && urlTitle) {
          setSelectedNode({
            id: urlId,
            title: urlTitle,
            description: urlDesc || '',
            hasChildren: true // Assume it has children if it's a domain
          });
        }
      } catch (err) {
        console.error("Failed to load initial state:", err);
      } finally {
        setIsLoadingRoots(false);
      }
    }
    loadInitialState();
  }, []);

  // Sync state to URL when selection changes
  const handleSelect = (node: Discipline) => {
    setSelectedNode(node);
    const params = new URLSearchParams();
    params.set('id', node.id);
    params.set('title', node.title);
    params.set('desc', node.description);
    
    // Replace state to avoid clogging history if they are just exploring
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-t-bg text-t-main overflow-hidden font-sans">
      {/* Header */}
      <header className="h-20 border-b border-t-border flex items-center justify-between px-10 shrink-0">
        <div className="font-serif text-2xl tracking-[2px] uppercase text-t-accent">Axiom</div>
        <div className="bg-t-surface border border-t-border px-5 py-2.5 w-[400px] text-t-dim text-[14px] rounded text-left">
          Search universal taxonomy...
        </div>
        <div className="text-[12px] opacity-80 text-t-dim">Library Index v4.2</div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar / Taxonomy Tree */}
        <aside className="w-72 lg:w-[320px] shrink-0 border-r border-t-border px-8 py-8 overflow-y-auto hide-scrollbar z-10">
          <span className="text-[11px] uppercase tracking-[2px] text-t-accent mb-5 block">Knowledge Domains</span>
          
          {isLoadingRoots ? (
            <div className="flex flex-col items-center justify-center p-8 text-t-dim">
              <div className="w-5 h-5 border-2 border-t-border border-t-t-accent rounded-full animate-spin mb-3"></div>
              <p className="text-[13px]">Initiating sequence...</p>
            </div>
          ) : rootNodes.length === 0 ? (
            <div className="text-center p-8 text-red-500 text-[13px]">
              Failed to load. Reload to try again.
            </div>
          ) : (
            <div className="flex flex-col pb-8">
              {rootNodes.map(node => (
                <TaxonomyNode 
                  key={node.id} 
                  node={node} 
                  level={0} 
                  onSelect={handleSelect}
                  selectedId={selectedNode?.id || null}
                />
              ))}
            </div>
          )}
        </aside>

        {/* Content Area (Details + Bibliography) */}
        <DetailsPanel selectedNode={selectedNode} />
      </main>

      {/* Status Bar */}
      <footer className="h-10 bg-t-surface border-t border-t-border flex items-center justify-between px-10 text-[11px] text-t-dim shrink-0">
        <div>Nodes Mapped: 1,240,892</div>
        <div>Dynamic Synthesis Active</div>
        <div className="text-t-accent">Last Updated: 12.04.2024</div>
      </footer>
    </div>
  );
}
