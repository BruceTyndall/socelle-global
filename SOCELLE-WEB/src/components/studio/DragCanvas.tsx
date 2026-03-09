/**
 * DragCanvas — STUDIO-UI-02
 * Interactive artboard: drag, resize, select, rotate, z-order.
 * No external canvas library — pure React + pointer events.
 *
 * Architecture:
 * - Blocks are absolutely positioned within a fixed-size artboard div
 * - Drag: pointerdown → pointermove → pointerup (pointer capture)
 * - Resize: 8-handle system (4 corners + 4 edges)
 * - Scale: parent controls canvas scale via CSS transform; we divide
 *   pointer deltas by scale to compute canvas-space distances
 */

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  CornerRightDown,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────── */

export interface CanvasBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  /** Z-order (lower = behind) */
  zIndex: number;
  x: number;       // px from canvas left
  y: number;       // px from canvas top
  w: number;       // px width
  h: number;       // px height
  rotation: number; // degrees
  locked: boolean;
  /** Optional background color */
  bg?: string;
  /** Text color */
  color?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

type ResizeHandle =
  | 'nw' | 'n' | 'ne'
  | 'w'  |       'e'
  | 'sw' | 's' | 'se';

interface DragCanvasProps {
  blocks: CanvasBlock[];
  selectedId: string | null;
  canvasScale: number;
  presetWidth: number;
  presetHeight: number;
  safeMargin: number;
  /** Background grid visible */
  showGrid?: boolean;
  onSelect: (id: string | null) => void;
  onBlockChange: (id: string, changes: Partial<CanvasBlock>) => void;
  onBlockDelete: (id: string) => void;
  onBlockReorder: (id: string, direction: 'up' | 'down') => void;
}

/* ── Mini block renderer ───────────────────────────────────────── */

function renderBlockContent(block: CanvasBlock): React.ReactNode {
  const { type, content, align = 'left', color = '#141418' } = block;
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  switch (type) {
    case 'heading': {
      const level = Number(content.level ?? 2);
      const text = String(content.text ?? 'Heading');
      const sizeClass = level === 1 ? 'text-4xl' : level === 2 ? 'text-2xl' : 'text-xl';
      return <p className={`font-semibold font-sans leading-tight ${sizeClass} ${alignClass} px-3 py-2 w-full h-full flex items-center`} style={{ color }}>{text || 'Heading'}</p>;
    }
    case 'text':
      return <p className={`text-sm leading-relaxed ${alignClass} px-3 py-2 w-full`} style={{ color, opacity: 0.75, whiteSpace: 'pre-wrap' }}>{String(content.body ?? content.text ?? 'Text block')}</p>;
    case 'kpi': {
      const dir = String(content.direction ?? 'neutral');
      const kpiColor = dir === 'up' ? '#5F8A72' : dir === 'down' ? '#8E6464' : '#A97A4C';
      return (
        <div className={`flex flex-col px-3 py-2 w-full h-full justify-center ${alignClass}`}>
          <span className="text-3xl font-bold font-sans" style={{ color: kpiColor }}>{String(content.value ?? '—')}</span>
          <span className="text-xs mt-1" style={{ color, opacity: 0.5 }}>{String(content.label ?? 'KPI')}</span>
          {content.change && <span className="text-xs mt-0.5" style={{ color: kpiColor }}>{String(content.change)}</span>}
        </div>
      );
    }
    case 'shape-rect':
      return (
        <div
          className="w-full h-full"
          style={{
            background: String(content.fill ?? '#6E879B'),
            borderRadius: `${Number(content.radius ?? 0)}px`,
            opacity: Number(content.opacity ?? 1),
          }}
        />
      );
    case 'shape-circle':
      return (
        <div
          className="w-full h-full"
          style={{
            background: String(content.fill ?? '#6E879B'),
            borderRadius: '50%',
            opacity: Number(content.opacity ?? 1),
          }}
        />
      );
    case 'shape-triangle': {
      const fill = String(content.fill ?? '#6E879B');
      return (
        <svg viewBox="0 0 100 87" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="50,5 95,82 5,82" fill={fill} />
        </svg>
      );
    }
    case 'shape-line': {
      const stroke = String(content.stroke ?? '#141418');
      const sw = Number(content.strokeWidth ?? 2);
      return (
        <svg className="w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    }
    case 'image': {
      const src = String(content.src ?? '');
      return src ? (
        <img src={src} alt={String(content.alt ?? '')} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#E8EDF1] text-[#141418]/30 text-xs">
          Image
        </div>
      );
    }
    case 'testimonial':
      return (
        <div className={`flex flex-col px-4 py-3 w-full h-full justify-center ${alignClass}`}>
          <p className="text-sm italic leading-relaxed" style={{ color, opacity: 0.75 }}>"{String(content.quote ?? 'Quote text')}"</p>
          <p className="text-xs font-medium mt-2" style={{ color }}>{String(content.author ?? 'Author')}</p>
        </div>
      );
    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[10px] tracking-widest uppercase text-[#141418]/25">{type}</span>
        </div>
      );
  }
}

/* ── Resize handle cursor map ──────────────────────────────────── */

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
  w: 'w-resize',                   e: 'e-resize',
  sw: 'sw-resize', s: 's-resize', se: 'se-resize',
};

const HANDLES: Array<{ id: ResizeHandle; style: React.CSSProperties }> = [
  { id: 'nw', style: { top: -5, left: -5 } },
  { id: 'n',  style: { top: -5, left: 'calc(50% - 5px)' } },
  { id: 'ne', style: { top: -5, right: -5 } },
  { id: 'w',  style: { top: 'calc(50% - 5px)', left: -5 } },
  { id: 'e',  style: { top: 'calc(50% - 5px)', right: -5 } },
  { id: 'sw', style: { bottom: -5, left: -5 } },
  { id: 's',  style: { bottom: -5, left: 'calc(50% - 5px)' } },
  { id: 'se', style: { bottom: -5, right: -5 } },
];

/* ── DragCanvas ────────────────────────────────────────────────── */

export default function DragCanvas({
  blocks,
  selectedId,
  canvasScale,
  presetWidth,
  presetHeight,
  safeMargin,
  showGrid = false,
  onSelect,
  onBlockChange,
  onBlockDelete,
  onBlockReorder,
}: DragCanvasProps) {
  // Interaction state
  const [dragging, setDragging] = useState<{
    blockId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const [resizing, setResizing] = useState<{
    blockId: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const MIN_SIZE = 20;

  // ── Pointer down on block (start drag) ────────────────────────
  const handleBlockPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, blockId: string) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block || block.locked) return;

      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      onSelect(blockId);

      setDragging({
        blockId,
        startX: e.clientX,
        startY: e.clientY,
        origX: block.x,
        origY: block.y,
      });
    },
    [blocks, onSelect],
  );

  // ── Pointer down on resize handle ─────────────────────────────
  const handleResizePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, blockId: string, handle: ResizeHandle) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);

      setResizing({
        blockId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origX: block.x,
        origY: block.y,
        origW: block.w,
        origH: block.h,
      });
    },
    [blocks],
  );

  // ── Pointer move (drag or resize) ──────────────────────────────
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (dragging) {
        const dx = (e.clientX - dragging.startX) / canvasScale;
        const dy = (e.clientY - dragging.startY) / canvasScale;
        const block = blocks.find((b) => b.id === dragging.blockId);
        if (!block) return;

        // Clamp within canvas bounds
        const newX = Math.max(0, Math.min(presetWidth - block.w, dragging.origX + dx));
        const newY = Math.max(0, Math.min(presetHeight - block.h, dragging.origY + dy));

        onBlockChange(dragging.blockId, { x: Math.round(newX), y: Math.round(newY) });
      }

      if (resizing) {
        const dx = (e.clientX - resizing.startX) / canvasScale;
        const dy = (e.clientY - resizing.startY) / canvasScale;
        const { handle, origX, origY, origW, origH } = resizing;

        let nx = origX, ny = origY, nw = origW, nh = origH;

        // Apply resize based on handle
        if (handle.includes('e')) { nw = Math.max(MIN_SIZE, origW + dx); }
        if (handle.includes('s')) { nh = Math.max(MIN_SIZE, origH + dy); }
        if (handle.includes('w')) {
          nw = Math.max(MIN_SIZE, origW - dx);
          nx = origX + origW - nw;
        }
        if (handle.includes('n')) {
          nh = Math.max(MIN_SIZE, origH - dy);
          ny = origY + origH - nh;
        }

        // Clamp within canvas
        nx = Math.max(0, nx);
        ny = Math.max(0, ny);
        nw = Math.min(presetWidth - nx, nw);
        nh = Math.min(presetHeight - ny, nh);

        onBlockChange(resizing.blockId, {
          x: Math.round(nx),
          y: Math.round(ny),
          w: Math.round(nw),
          h: Math.round(nh),
        });
      }
    },
    [dragging, resizing, blocks, canvasScale, presetWidth, presetHeight, onBlockChange],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // ── Click on canvas background deselects ──────────────────────
  const handleCanvasClick = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.target === canvasRef.current) onSelect(null);
    },
    [onSelect],
  );

  const selectedBlock = blocks.find((b) => b.id === selectedId);
  const sortedBlocks = [...blocks].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative w-full h-full select-none">
      {/* Canvas artboard */}
      <div
        ref={canvasRef}
        className="relative overflow-hidden"
        style={{
          width: presetWidth,
          height: presetHeight,
          background: '#FFFFFF',
          backgroundImage: showGrid
            ? 'linear-gradient(rgba(110,135,155,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(110,135,155,0.08) 1px, transparent 1px)'
            : undefined,
          backgroundSize: showGrid ? '40px 40px' : undefined,
          boxShadow: '0 2px 40px rgba(20,20,24,0.12)',
        }}
        onPointerDown={handleCanvasClick}
      >
        {/* Safe margin guide (only visible when selected block active) */}
        {selectedId && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              outline: `1px dashed rgba(110,135,155,0.25)`,
              outlineOffset: `-${safeMargin}px`,
            }}
          />
        )}

        {/* Blocks */}
        {sortedBlocks.map((block) => {
          const isSelected = block.id === selectedId;
          const isDraggingThis = dragging?.blockId === block.id;
          const isResizingThis = resizing?.blockId === block.id;

          return (
            <div
              key={block.id}
              className="absolute"
              style={{
                left: block.x,
                top: block.y,
                width: block.w,
                height: block.h,
                transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
                transformOrigin: 'center center',
                cursor: block.locked ? 'not-allowed' : isDraggingThis ? 'grabbing' : 'grab',
                background: block.bg ?? 'transparent',
                zIndex: block.zIndex,
                outline: isSelected ? '2px solid #6E879B' : 'none',
                outlineOffset: '1px',
                opacity: isDraggingThis || isResizingThis ? 0.85 : 1,
                boxShadow: isSelected ? '0 0 0 1px #6E879B' : undefined,
              }}
              onPointerDown={(e) => handleBlockPointerDown(e, block.id)}
            >
              {/* Block content */}
              <div className="w-full h-full overflow-hidden pointer-events-none">
                {renderBlockContent(block)}
              </div>

              {/* Selection overlay with resize handles */}
              {isSelected && !block.locked && (
                <>
                  {HANDLES.map(({ id, style }) => (
                    <div
                      key={id}
                      className="absolute w-[10px] h-[10px] bg-white border-2 border-[#6E879B] rounded-sm pointer-events-auto"
                      style={{
                        ...style,
                        cursor: HANDLE_CURSORS[id],
                        zIndex: 10,
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handleResizePointerDown(e, block.id, id);
                      }}
                    />
                  ))}
                </>
              )}

              {/* Lock indicator */}
              {block.locked && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-[#A97A4C]/15 rounded flex items-center justify-center">
                  <Lock className="w-3 h-3 text-[#A97A4C]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating block toolbar (only when selected) */}
      {selectedBlock && (
        <CanvasBlockToolbar
          block={selectedBlock}
          onBlockChange={onBlockChange}
          onBlockDelete={onBlockDelete}
          onBlockReorder={onBlockReorder}
        />
      )}
    </div>
  );
}

/* ── Block toolbar (floating above selected block) ─────────────── */

interface ToolbarProps {
  block: CanvasBlock;
  onBlockChange: (id: string, changes: Partial<CanvasBlock>) => void;
  onBlockDelete: (id: string) => void;
  onBlockReorder: (id: string, direction: 'up' | 'down') => void;
}

function CanvasBlockToolbar({ block, onBlockChange, onBlockDelete, onBlockReorder }: ToolbarProps) {
  const hasText = ['heading', 'text', 'kpi', 'testimonial'].includes(block.type);
  const isShape = block.type.startsWith('shape-');

  return (
    <div
      className="absolute flex items-center gap-1 bg-[#141418] rounded-lg px-2 py-1.5 shadow-xl z-50 pointer-events-auto"
      style={{ top: block.y * 1 - 44, left: block.x * 1 }}
    >
      {/* Text alignment */}
      {hasText && (
        <>
          <ToolBtn
            title="Align left"
            active={block.align === 'left' || !block.align}
            onClick={() => onBlockChange(block.id, { align: 'left' })}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Align center"
            active={block.align === 'center'}
            onClick={() => onBlockChange(block.id, { align: 'center' })}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Align right"
            active={block.align === 'right'}
            onClick={() => onBlockChange(block.id, { align: 'right' })}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </ToolBtn>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
        </>
      )}

      {/* Shape fill color */}
      {isShape && (
        <>
          <label className="flex items-center gap-1 cursor-pointer" title="Fill color">
            <div
              className="w-4 h-4 rounded border border-white/20"
              style={{ background: String(block.content.fill ?? '#6E879B') }}
            />
            <input
              type="color"
              className="w-0 h-0 opacity-0 absolute"
              value={String(block.content.fill ?? '#6E879B')}
              onChange={(e) => onBlockChange(block.id, { content: { ...block.content, fill: e.target.value } })}
            />
          </label>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
        </>
      )}

      {/* Z-order */}
      <ToolBtn title="Move up (layer)" onClick={() => onBlockReorder(block.id, 'up')}>
        <ChevronUp className="w-3.5 h-3.5" />
      </ToolBtn>
      <ToolBtn title="Move down (layer)" onClick={() => onBlockReorder(block.id, 'down')}>
        <ChevronDown className="w-3.5 h-3.5" />
      </ToolBtn>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Lock/unlock */}
      <ToolBtn
        title={block.locked ? 'Unlock' : 'Lock'}
        onClick={() => onBlockChange(block.id, { locked: !block.locked })}
      >
        {block.locked ? (
          <Unlock className="w-3.5 h-3.5" />
        ) : (
          <Lock className="w-3.5 h-3.5" />
        )}
      </ToolBtn>

      {/* Rotation */}
      <ToolBtn
        title="Rotate 15°"
        onClick={() => onBlockChange(block.id, { rotation: ((block.rotation ?? 0) + 15) % 360 })}
      >
        <CornerRightDown className="w-3.5 h-3.5" />
      </ToolBtn>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* Delete */}
      <ToolBtn
        title="Delete block"
        onClick={() => onBlockDelete(block.id)}
        danger
      >
        <Trash2 className="w-3.5 h-3.5" />
      </ToolBtn>
    </div>
  );
}

function ToolBtn({
  children,
  title,
  active,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
        danger
          ? 'text-[#8E6464] hover:bg-[#8E6464]/20'
          : active
          ? 'bg-white/20 text-white'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
