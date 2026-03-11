import { useState, useMemo } from 'react';
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  Clock, 
  Users, 
  Pin,
  AlertCircle
} from 'lucide-react';
import { useContentPlacements } from '../../../lib/cms/useContentPlacements';
import { useCmsPosts } from '../../../lib/cms';

const PLACEMENT_KEYS = [
  { id: 'intel_hub_editorial_rail', label: 'Intelligence Hub Editorial Rail' },
  { id: 'daily_brief_slot', label: 'Daily Brief Featured Position' },
  { id: 'home_featured', label: 'Home Page Featured' },
  { id: 'category_medspa_hero', label: 'Category: Medspa Hero' },
  { id: 'category_salon_hero', label: 'Category: Salon Hero' },
  { id: 'category_beauty_brand_hero', label: 'Category: Beauty Brand Hero' },
];

const SEGMENTS = [
  { id: 'medspa', label: 'Medspa' },
  { id: 'salon', label: 'Salon' },
  { id: 'beauty_brand', label: 'Beauty Brand' },
  { id: 'free', label: 'Free Tier' },
  { id: 'pro', label: 'Pro Tier' }
];

export default function MerchandisingConsole() {
  const { 
    placements, 
    isLoading, 
    createPlacement, 
    updatePlacement, 
    updateDisplayOrder,
    deletePlacement 
  } = useContentPlacements();

  const { posts } = useCmsPosts({ status: 'published' });

  const [activeTab, setActiveTab] = useState(PLACEMENT_KEYS[0].id);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  // For adding
  const [isAdding, setIsAdding] = useState(false);
  const [newPostId, setNewPostId] = useState('');

  const currentPlacements = useMemo(() => {
    return placements
      .filter(p => p.placement_key === activeTab)
      .sort((a, b) => a.display_order - b.display_order);
  }, [placements, activeTab]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const items = [...currentPlacements];
    const draggedIdx = items.findIndex(i => i.id === draggedId);
    const targetIdx = items.findIndex(i => i.id === targetId);

    // Reorder array
    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedItem);
    
    // Immediately calculate new display orders
    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index
    }));

    updateDisplayOrder.mutate(updates);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleAdd = () => {
    if (!newPostId) return;
    
    // Check if it already exists
    if (currentPlacements.some(p => p.cms_post_id === newPostId)) {
      alert("This post is already in this placement.");
      return;
    }

    createPlacement.mutate({
      placement_key: activeTab,
      cms_post_id: newPostId,
      display_order: currentPlacements.length,
      is_pinned: false,
      is_active: true,
      expires_at: null,
      segment: null,
      created_by: null
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setNewPostId('');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-graphite/60 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-graphite/20 border-t-graphite rounded-full animate-spin" />
          Loading console...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#141418]">Merchandising Console</h1>
        <p className="text-sm text-[#6E879B] mt-1">
          Manage featured content placements, pinning, and segmentation without code deploys.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Keys */}
        <div className="w-1/4 flex-shrink-0">
          <div className="bg-white rounded-lg border border-[#E8EDF1] overflow-hidden">
            {PLACEMENT_KEYS.map((key) => (
              <button
                key={key.id}
                onClick={() => {
                  setActiveTab(key.id);
                  setIsAdding(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  activeTab === key.id 
                    ? 'bg-[#E8EDF1]/50 font-medium text-[#141418] border-l-2 border-[#141418]' 
                    : 'text-[#6E879B] hover:bg-[#E8EDF1]/30 border-l-2 border-transparent'
                }`}
              >
                {key.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg border border-[#E8EDF1] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#141418]">
              {PLACEMENT_KEYS.find(k => k.id === activeTab)?.label}
            </h2>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-graphite rounded-md hover:bg-graphite/90"
            >
              <Plus className="w-4 h-4" /> Add Post
            </button>
          </div>

          {isAdding && (
            <div className="mb-6 p-4 bg-[#E8EDF1]/30 rounded-lg border border-[#E8EDF1] flex gap-3">
              <select
                className="flex-1 border-[#E8EDF1] rounded-md text-sm"
                value={newPostId}
                onChange={(e) => setNewPostId(e.target.value)}
              >
                <option value="">-- Select a published post --</option>
                {posts.map(post => (
                  <option key={post.id} value={post.id}>{post.title}</option>
                ))}
              </select>
              <button 
                onClick={handleAdd}
                disabled={!newPostId || createPlacement.isPending}
                className="px-4 py-2 bg-graphite text-white text-sm rounded-md disabled:opacity-50"
              >
                Add to Placement
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-transparent text-graphite/60 text-sm hover:bg-black/5 rounded-md"
              >
                Cancel
              </button>
            </div>
          )}

          {currentPlacements.length === 0 ? (
            <div className="text-center py-12 bg-[#F8FAFC] rounded-lg border border-dashed border-[#E8EDF1]">
              <AlertCircle className="w-8 h-8 text-[#6E879B]/50 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-[#141418]">No placements yet</h3>
              <p className="text-sm text-[#6E879B] mt-1">Add a post to feature it in this slot.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentPlacements.map((placement) => (
                <div 
                  key={placement.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, placement.id)}
                  onDragOver={(e) => handleDragOver(e, placement.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    draggedId === placement.id ? 'opacity-50 bg-[#F8FAFC]' : 'bg-white hover:border-[#6E879B]/50'
                  } border-[#E8EDF1] transition-all`}
                >
                  <button className="mt-1 cursor-grab active:cursor-grabbing text-[#6E879B]/50 hover:text-[#141418]">
                    <GripVertical className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[#141418] truncate">
                        {placement.post?.title || 'Unknown Post Segment'}
                      </span>
                      {!placement.is_active && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>
                    
                    {/* Controls row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      
                      {/* Pin Toggle */}
                      <button 
                        onClick={() => updatePlacement.mutate({ id: placement.id, is_pinned: !placement.is_pinned })}
                        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
                          placement.is_pinned ? 'bg-[#141418] text-white' : 'bg-[#E8EDF1]/50 text-[#6E879B] hover:bg-[#E8EDF1]'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        {placement.is_pinned ? 'Pinned' : 'Pin'}
                      </button>

                      <div className="w-px h-4 bg-[#E8EDF1]" />

                      {/* Expiration Date */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#6E879B]" />
                        <input 
                          type="datetime-local" 
                          className="text-xs border-0 bg-transparent text-[#141418] focus:ring-1 focus:ring-graphite/20 rounded p-0"
                          value={placement.expires_at ? new Date(placement.expires_at).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updatePlacement.mutate({ 
                            id: placement.id, 
                            expires_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                          })}
                        />
                      </div>

                      <div className="w-px h-4 bg-[#E8EDF1]" />

                      {/* Segmentation */}
                      <div className="flex items-center gap-2 group relative">
                        <Users className="w-3.5 h-3.5 text-[#6E879B]" />
                        <span className="text-xs text-[#6E879B]">
                          {placement.segment && placement.segment.length > 0
                            ? `${placement.segment.length} segments`
                            : 'All segments'}
                        </span>
                        
                        {/* Simple inline dropdown hover for segments */}
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#E8EDF1] shadow-sm rounded-md p-2 hidden group-hover:block z-10">
                          <label className="text-[10px] font-medium text-[#6E879B] uppercase tracking-wider mb-2 block">Available to:</label>
                          <div className="space-y-1.5">
                            {SEGMENTS.map(seg => {
                              const isSelected = placement.segment?.includes(seg.id);
                              return (
                                <label key={seg.id} className="flex items-center gap-2 text-xs text-[#141418] cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected || false}
                                    onChange={(e) => {
                                      let newSegments = placement.segment ? [...placement.segment] : [];
                                      if (e.target.checked) {
                                        newSegments.push(seg.id);
                                      } else {
                                        newSegments = newSegments.filter(s => s !== seg.id);
                                      }
                                      updatePlacement.mutate({
                                        id: placement.id,
                                        segment: newSegments.length > 0 ? newSegments : null
                                      });
                                    }}
                                    className="rounded border-[#E8EDF1] text-graphite focus:ring-graphite/20"
                                  />
                                  {seg.label}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                     <button
                        onClick={() => updatePlacement.mutate({ id: placement.id, is_active: !placement.is_active })}
                        className="text-xs font-medium px-2 py-1 border border-[#E8EDF1] rounded-md hover:bg-[#F8FAFC]"
                      >
                        {placement.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => deletePlacement.mutate(placement.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                        title="Remove from placement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                  
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
