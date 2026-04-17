import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Book, FolderOpen, Folder } from 'lucide-react';
import { Discipline, getSubDisciplines } from '../services/gemini';
import { cn } from '../lib/utils';

interface TaxonomyNodeProps {
  key?: React.Key;
  node: Discipline;
  level: number;
  onSelect: (node: Discipline) => void;
  selectedId: string | null;
}

export function TaxonomyNode({ node, level, onSelect, selectedId }: TaxonomyNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Discipline[] | null>(null);

  const toggleOpen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    
    if (node.hasChildren && !children && !isLoading) {
      setIsLoading(true);
      try {
        const result = await getSubDisciplines(node.title);
        setChildren(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isSelected = selectedId === node.id;

  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex items-center group py-[8px] pr-3 cursor-pointer select-none transition-colors mb-[2px] text-[15px] list-none",
          isSelected ? "text-t-main font-semibold border-l-2 border-l-t-accent ml-[-2px]" : "text-t-dim border-l-2 border-l-transparent hover:text-t-main ml-[-2px]",
        )}
        style={{ paddingLeft: `${level * 16 + 10}px` }}
        onClick={() => onSelect(node)}
      >
        <button 
          onClick={toggleOpen}
          className="w-5 h-5 flex items-center justify-center mr-2 text-t-dim hover:text-t-main flex-shrink-0"
          disabled={!node.hasChildren && !isLoading}
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-t-border border-t-t-accent rounded-full animate-spin" />
          ) : node.hasChildren ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <span className="w-1 h-1 bg-t-border rounded-full" />
          )}
        </button>
        
        <span className="mr-2 text-t-dim flex-shrink-0">
          {isOpen ? <FolderOpen size={16} strokeWidth={1.5} /> : node.hasChildren ? <Folder size={16} strokeWidth={1.5} /> : <Book size={16} strokeWidth={1.5} />}
        </span>

        <span className="leading-none truncate" title={node.title}>
          {node.title}
        </span>
      </div>

      {isOpen && (
        <div className="flex flex-col">
          {children?.map(child => (
            <TaxonomyNode 
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
          {children && children.length === 0 && (
            <div 
              className="text-[12px] text-t-dim italic py-2"
              style={{ paddingLeft: `${(level + 1) * 16 + 32}px` }}
            >
              No further sub-disciplines found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
