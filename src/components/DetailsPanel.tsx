import { useEffect, useState } from 'react';
import { Discipline, BibliographyItem, getBibliography, EducationalContent, getEducationalContent } from '../services/gemini';
import { BookOpen, User, Calendar, Tag, GraduationCap, Lightbulb, Zap } from 'lucide-react';

interface DetailsPanelProps {
  selectedNode: Discipline | null;
}

export function DetailsPanel({ selectedNode }: DetailsPanelProps) {
  const [items, setItems] = useState<BibliographyItem[]>([]);
  const [eduContent, setEduContent] = useState<EducationalContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEduLoading, setIsEduLoading] = useState(false);

  useEffect(() => {
    if (!selectedNode) {
      setItems([]);
      setEduContent(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsEduLoading(true);
    setItems([]); 
    setEduContent(null);

    getSubItems();
    getEducation();

    async function getSubItems() {
      try {
        const result = await getBibliography(selectedNode!.title);
        if (isMounted) setItems(result);
      } catch (err) {
        console.error("Failed to load bibliography:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    async function getEducation() {
      try {
        const result = await getEducationalContent(selectedNode!.title);
        if (isMounted) setEduContent(result);
      } catch (err) {
        console.error("Failed to load education:", err);
      } finally {
        if (isMounted) setIsEduLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-t-bg text-t-dim p-8 text-center" style={{ background: 'radial-gradient(circle at top right, #1a1a1c 0%, transparent 70%)' }}>
        <BookOpen size={48} className="mb-4 opacity-50" strokeWidth={1} />
        <h2 className="text-xl font-serif text-t-main mb-2">No Discipline Selected</h2>
        <p className="max-w-md">Select a branch in the taxonomy on the left to dynamically generate a bibliography of core texts and foundational papers.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full grid grid-cols-1 xl:grid-cols-[1fr_320px] overflow-hidden">
      {/* Taxonomy View */}
      <div className="p-10 flex flex-col h-full overflow-y-auto hide-scrollbar" style={{ background: 'radial-gradient(circle at top right, #1a1a1c 0%, transparent 70%)' }}>
        <div className="font-serif italic text-t-dim mb-3">
          Knowledge Domain &nbsp; / &nbsp; {selectedNode.title}
        </div>
        <h1 className="font-serif text-[48px] mb-8 leading-none text-t-main">
          {selectedNode.title}
        </h1>

        <div className="mt-[40px] text-t-dim text-[14px] max-w-[600px] leading-[1.6] border-l border-t-accent pl-5 bg-white/5 py-3 rounded-r-md">
          {selectedNode.description}
        </div>

        {/* School Level Education Page Section */}
        <div className="mt-12 max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
             <GraduationCap className="text-t-accent" size={24} />
             <h2 className="font-serif text-2xl text-t-main uppercase tracking-wider">Educational Guide</h2>
             {isEduLoading && (
                <div className="ml-4 w-4 h-4 border-2 border-t-border border-t-t-accent rounded-full animate-spin" />
             )}
          </div>

          {!isEduLoading && eduContent && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
              {/* Introduction */}
              <section>
                <p className="text-t-main text-lg leading-relaxed font-serif opacity-90">
                  {eduContent.introduction}
                </p>
              </section>

              {/* Pillars */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eduContent.keyPillars.map((pillar, idx) => (
                  <div key={idx} className="bg-t-surface p-6 border border-t-border rounded-lg hover:border-t-accent/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3 text-t-accent">
                      <Zap size={16} />
                      <h3 className="font-bold uppercase text-[12px] tracking-widest">{pillar.title}</h3>
                    </div>
                    <p className="text-t-dim text-[14px] leading-relaxed">
                      {pillar.explanation}
                    </p>
                  </div>
                ))}
              </section>

              {/* Real World Impact */}
              <section className="bg-t-accent/5 p-8 rounded-xl border border-t-accent/20">
                <div className="flex items-center gap-3 mb-4 text-t-accent">
                   <Lightbulb size={24} />
                   <h3 className="font-bold text-lg">Real-World Impact</h3>
                </div>
                <p className="text-t-main leading-relaxed italic opacity-85">
                  {eduContent.realWorldImpact}
                </p>
              </section>

              {/* Fun Fact */}
              <div className="pt-6 border-t border-t-border">
                <div className="text-[11px] uppercase tracking-widest text-t-dim mb-2 opacity-50">Did you know?</div>
                <p className="text-t-dim text-[13px] leading-relaxed">
                  {eduContent.funFact}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bibliography Sidebar */}
      <div className="bg-t-surface p-8 border-l border-t-border overflow-y-auto hide-scrollbar flex flex-col">
        <span className="text-[11px] uppercase tracking-[2px] text-t-accent mb-6 block shrink-0 flex items-center justify-between">
            <span>Bibliography</span>
            {isLoading && (
               <div className="w-3 h-3 border-2 border-t-border border-t-t-accent rounded-full animate-spin" />
            )}
        </span>

        {!isLoading && items.length === 0 && (
          <div className="text-t-dim italic py-4 text-sm mt-4">
            No bibliography data found for this discipline. 
          </div>
        )}

        <div className="flex flex-col">
          {items.map((item, i) => (
            <div 
              key={item.id || i}
              className="mb-[25px] border-b border-t-border pb-[15px]"
            >
              <div className="font-serif text-[16px] text-t-main mb-[6px] leading-[1.4]">
                {item.title}
              </div>
              <div className="text-[12px] text-t-dim leading-[1.6]">
                {item.author} ({item.year || 'Unknown'})
              </div>
              <div className="text-[12px] text-t-dim leading-[1.6] mt-1">
                <span className="text-[10px] text-t-accent mr-1 tracking-wider uppercase font-bold">
                  {item.type}
                </span>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
