import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCmsPageWithBlocks } from '../../../lib/cms';
import { blockRegistry } from '../../../lib/cms/blockRegistry';
import type { CmsBlockType, CmsPageBlock } from '../../../lib/cms/types';
import { Grid, Image, Layout, FileText, Type, ChevronLeft, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/Toast';

export default function PageLayoutBuilder() {
  const { id } = useParams<{ id: string }>();
  const { page, isLoading, error } = useCmsPageWithBlocks(id ?? '');
  const { addToast } = useToast();
  
  // Local state for the canvas blocks (we keep a drafted version)
  const [draftBlocks, setDraftBlocks] = useState<(CmsPageBlock & { block: { type: string, content: any } })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Initialize draft blocks from the server whenever page data loads
  useEffect(() => {
    if (page?.page_blocks) {
      setDraftBlocks(page.page_blocks);
    }
  }, [page]);

  if (isLoading) return <div className="p-8 text-[#141418]/60 animate-pulse">Loading layout...</div>;
  if (error || !page) return <div className="p-8 text-[#8E6464]">Error loading page layout</div>;

  const handleDragStart = (e: React.DragEvent, blockType: CmsBlockType) => {
    e.dataTransfer.setData('blockType', blockType);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as CmsBlockType;
    if (!blockType) return;

    const config = blockRegistry[blockType];
    if (!config) return;

    // We must create the generic block entity first so we have a block_id, 
    // then create the cms_page_block connection. Since this is an admin UI, 
    // we do an immediate lightweight insert so the UI has an ID.
    try {
      setIsSaving(true);
      const { data: newBlock, error: blockErr } = await supabase
        .from('cms_blocks')
        .insert({
          type: blockType,
          name: `Auto ${config.label}`,
          content: config.defaultContent,
          is_reusable: false,
        })
        .select()
        .single();

      if (blockErr) throw blockErr;

      const newPosition = draftBlocks.length;

      const { data: newPageBlock, error: pbErr } = await supabase
        .from('cms_page_blocks')
        .insert({
          page_id: page.id,
          block_id: newBlock.id,
          position: newPosition,
          overrides: {},
        })
        .select()
        .single();

      if (pbErr) throw pbErr;

      addToast('Block added', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to add block', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateOverrides = (pageBlockId: string, updates: Record<string, any>) => {
    setDraftBlocks(prev => prev.map(pb => {
      if (pb.id === pageBlockId) {
        return {
          ...pb,
          overrides: { ...(pb.overrides as Record<string, any>), ...updates }
        };
      }
      return pb;
    }));
  };

  const saveLayout = async () => {
    try {
      setIsSaving(true);
      // Update positions and overrides in bulk or map over them
      for (const pb of draftBlocks) {
        await supabase
          .from('cms_page_blocks')
          .update({
            position: pb.position,
            overrides: pb.overrides,
          })
          .eq('id', pb.id);
      }
      addToast('Layout saved', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save layout', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBlock = draftBlocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex h-screen bg-[#F6F3EF]">
      {/* LEFT: Palette */}
      <div className="w-64 bg-white border-r border-[#141418]/10 flex flex-col">
        <div className="p-4 border-b border-[#141418]/10 flex items-center gap-2">
          <Link to="/portal/admin/cms/pages" className="p-1 hover:bg-[#141418]/5 rounded">
            <ChevronLeft className="w-5 h-5 text-[#141418]/60" />
          </Link>
          <h2 className="font-sans font-semibold text-sm">Blocks</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.values(blockRegistry).map((config) => {
            const Icon = config.category === 'media' ? Image :
                         config.category === 'layout' ? Layout :
                         config.type === 'text' ? FileText : Type;
                         
            return (
              <div 
                key={config.type}
                draggable
                onDragStart={(e) => handleDragStart(e, config.type)}
                className="flex items-center gap-3 p-3 bg-[#F6F3EF] border border-[#141418]/10 rounded-lg cursor-grab hover:border-[#141418]/30 transition-colors"
                title={config.description}
              >
                <Icon className="w-4 h-4 text-[#141418]/40" />
                <span className="font-sans text-xs font-medium text-[#141418]/80">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER: Canvas */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={saveLayout}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#141418] text-white rounded-md text-xs font-medium hover:bg-[#141418]/80 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto p-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="max-w-4xl mx-auto min-h-[500px] border-2 border-dashed border-[#141418]/10 rounded-xl p-4 space-y-4">
            {draftBlocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#141418]/40 pt-32">
                <Grid className="w-8 h-8 mb-2" />
                <p className="font-sans text-sm">Drag blocks here to build the layout</p>
              </div>
            ) : (
              draftBlocks
                .sort((a, b) => a.position - b.position)
                .map((pb) => {
                  const isSelected = selectedBlockId === pb.id;
                  const config = blockRegistry[pb.block.type as CmsBlockType];
                  
                  return (
                    <div 
                      key={pb.id}
                      onClick={() => setSelectedBlockId(pb.id)}
                      className={`relative group p-4 bg-white border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' : 'border-[#141418]/10 hover:border-[#141418]/30'}`}
                    >
                      <div className="absolute -top-3 left-4 bg-[#141418] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {config?.label || 'Unknown Block'}
                      </div>
                      <div className="opacity-50 pointer-events-none">
                         {/* Render a placeholder to show order. Actual component rendering requires mapping props deeply */}
                         <h3 className="font-serif text-lg">{config?.label} Block Placehoder</h3>
                         <p className="font-sans text-xs text-[#141418]/60 mt-2">Props: {JSON.stringify(pb.overrides || pb.block.content)}</p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Inline Property Editor */}
      <div className="w-80 bg-white border-l border-[#141418]/10 flex flex-col">
        <div className="p-4 border-b border-[#141418]/10">
          <h2 className="font-sans font-semibold text-sm">Properties</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedBlock ? (
            <div className="text-center text-[#141418]/40 font-sans text-xs mt-10">
              Select a block on the canvas to edit its properties.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-mono text-[#141418]/60 mb-4 bg-[#F6F3EF] p-2 rounded">
                ID: {selectedBlock.id.slice(0, 8)}...
              </div>
              
              {/* Very naive dynamic prop editor based on the block's content keys */}
              {Object.keys(selectedBlock.block.content || {}).map(key => {
                const val = (selectedBlock.overrides as any)?.[key] !== undefined 
                           ? (selectedBlock.overrides as any)[key] 
                           : (selectedBlock.block.content as any)[key];
                
                return (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[#141418]/80 mb-1 capitalize">
                      {key.replace('_', ' ')}
                    </label>
                    {typeof val === 'string' ? (
                      val.includes('<p>') ? (
                        <textarea 
                          value={val}
                          onChange={(e) => updateOverrides(selectedBlock.id, { [key]: e.target.value })}
                          className="w-full text-sm font-sans p-2 border border-[#141418]/20 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                        />
                      ) : (
                        <input 
                          type="text"
                          value={val}
                          onChange={(e) => updateOverrides(selectedBlock.id, { [key]: e.target.value })}
                          className="w-full text-sm font-sans px-3 py-2 border border-[#141418]/20 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      )
                    ) : (
                      <span className="text-xs text-[#141418]/40">Complex object ({typeof val})</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
