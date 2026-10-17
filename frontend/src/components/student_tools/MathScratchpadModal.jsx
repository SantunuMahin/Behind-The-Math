import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  Eraser,
  Trash2,
  Download,
  Copy,
  Undo2,
  Redo2,
  Minus,
  Circle,
  Square,
  PenTool,
  Crosshair,
  Sparkles,
  Check,
  Maximize2,
  Minimize2,
  Highlighter,
  ArrowUpRight,
  TrendingUp,
  Type,
  Plus,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sliders,
  Triangle,
  Compass,
  FileText
} from 'lucide-react';
import katex from 'katex';
import { useStudent } from '../../context/StudentContext';
import { useTheme } from '../../context/ThemeContext';
import {
  compileMathExpression,
  generateFunctionPoints,
  MATH_FUNCTION_PRESETS,
  FORMULA_STAMP_TEMPLATES,
} from '../../utils/mathEvaluator';

// Color Palettes
const CHALKBOARD_PALETTE = [
  { hex: '#FFFFFF', name: 'Chalk White' },
  { hex: '#38BDF8', name: 'Sky Cyan' },
  { hex: '#F43F5E', name: 'Rose Pink' },
  { hex: '#34D399', name: 'Mint Green' },
  { hex: '#FBBF24', name: 'Amber Gold' },
  { hex: '#A78BFA', name: 'Soft Lavender' },
];

const WHITEBOARD_PALETTE = [
  { hex: '#09090B', name: 'Dark Ink' },
  { hex: '#0284C7', name: 'Cobalt Blue' },
  { hex: '#E11D48', name: 'Crimson Red' },
  { hex: '#059669', name: 'Forest Green' },
  { hex: '#D97706', name: 'Dark Amber' },
  { hex: '#7C3AED', name: 'Royal Violet' },
];

const BLUEPRINT_PALETTE = [
  { hex: '#FFFFFF', name: 'Draft White' },
  { hex: '#38BDF8', name: 'Cyan Glow' },
  { hex: '#FDE047', name: 'Solar Yellow' },
  { hex: '#6EE7B7', name: 'Aqua Mint' },
  { hex: '#F472B6', name: 'Neon Coral' },
  { hex: '#CBD5E1', name: 'Steel Gray' },
];

const MATH_SYMBOLS = [
  { symbol: '∑', label: 'Summation' },
  { symbol: '∫', label: 'Integral' },
  { symbol: '√', label: 'Square Root' },
  { symbol: 'π', label: 'Pi' },
  { symbol: 'θ', label: 'Theta' },
  { symbol: '±', label: 'Plus-Minus' },
  { symbol: '∞', label: 'Infinity' },
  { symbol: 'lim', label: 'Limit' },
  { symbol: 'dy/dx', label: 'Derivative' },
  { symbol: 'f(x)', label: 'Function' },
  { symbol: '≈', label: 'Approx' },
  { symbol: '≠', label: 'Not Equal' },
  { symbol: '≤', label: 'Less Equal' },
  { symbol: '≥', label: 'Greater Equal' },
  { symbol: 'α', label: 'Alpha' },
  { symbol: 'β', label: 'Beta' },
  { symbol: 'Δ', label: 'Delta' },
  { symbol: 'λ', label: 'Lambda' },
  { symbol: '∂', label: 'Partial' },
  { symbol: '∈', label: 'Element of' },
];

export default function MathScratchpadModal() {
  const { isScratchpadOpen, setIsScratchpadOpen } = useStudent();
  const { isDark } = useTheme();

  const canvasRef = useRef(null);
  const strokePointsRef = useRef([]);
  const [boardTheme, setBoardTheme] = useState('auto'); // 'auto' | 'blackboard' | 'whiteboard' | 'blueprint'
  const [paperGrid, setPaperGrid] = useState('graph'); // 'graph' | 'polar' | 'dot' | 'ruled' | 'blank'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Multi-Page Whiteboard Manager
  const [pages, setPages] = useState([
    { id: 'page-1', name: 'Page 1', dataUrl: null }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Drawers & Modals
  const [isGrapherOpen, setIsGrapherOpen] = useState(false);
  const [isFormulaStamperOpen, setIsFormulaStamperOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Math Script Grapher State
  const [graphFunctionStr, setGraphFunctionStr] = useState('sin(x)');
  const [graphColor, setGraphColor] = useState('#38BDF8');
  const [graphXMin, setGraphXMin] = useState(-6);
  const [graphXMax, setGraphXMax] = useState(6);
  const [graphError, setGraphError] = useState(null);

  // Formula Stamper State
  const [stampLatex, setStampLatex] = useState('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [stampFontSize, setStampFontSize] = useState(24);

  // Computed effective board theme
  const effectiveBoardTheme =
    boardTheme === 'auto' ? (isDark ? 'blackboard' : 'whiteboard') : boardTheme;
  const isEffectiveDark = effectiveBoardTheme === 'blackboard' || effectiveBoardTheme === 'blueprint';

  // Active palette based on board theme
  const activePalette =
    effectiveBoardTheme === 'whiteboard'
      ? WHITEBOARD_PALETTE
      : effectiveBoardTheme === 'blueprint'
      ? BLUEPRINT_PALETTE
      : CHALKBOARD_PALETTE;

  // Drawing tools & state
  const [activeTool, setActiveTool] = useState('pen'); // 'pen' | 'highlighter' | 'arrow' | 'line' | 'circle' | 'rect' | 'triangle' | 'eraser'
  const [color, setColor] = useState(() => activePalette[0].hex);
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [shapePreviewSnapshot, setShapePreviewSnapshot] = useState(null);

  // Undo / Redo history
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Sync color when board theme changes
  useEffect(() => {
    if (activeTool !== 'eraser') {
      const isCurrentColorInPalette = activePalette.some((p) => p.hex === color);
      if (!isCurrentColorInPalette) {
        setColor(activePalette[0].hex);
      }
    }
  }, [effectiveBoardTheme, activePalette, color, activeTool]);

  // Save canvas state to undo stack
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(imageData);
    if (newHistory.length > 30) newHistory.shift();

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Initialize canvas size and DPI scaling
  const initCanvas = useCallback((savedDataUrl = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (savedDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        historyRef.current = [];
        historyIndexRef.current = -1;
        saveState();
      };
      img.src = savedDataUrl;
    } else {
      historyRef.current = [];
      historyIndexRef.current = -1;
      saveState();
    }
  }, [saveState]);

  useEffect(() => {
    if (isScratchpadOpen) {
      const currentUrl = pages[currentPageIndex]?.dataUrl || null;
      const timer = setTimeout(() => initCanvas(currentUrl), 50);
      return () => clearTimeout(timer);
    }
  }, [isScratchpadOpen, isFullscreen, currentPageIndex, initCanvas]);

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  };

  // Multi-Page Handlers
  const saveCurrentPageSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setPages(prev => {
      const updated = [...prev];
      if (updated[currentPageIndex]) {
        updated[currentPageIndex].dataUrl = dataUrl;
      }
      return updated;
    });
  };

  const handleNextPage = () => {
    saveCurrentPageSnapshot();
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      // Create new page
      const newPageId = `page-${pages.length + 1}`;
      const newPageName = `Page ${pages.length + 1}`;
      setPages(prev => [...prev, { id: newPageId, name: newPageName, dataUrl: null }]);
      setCurrentPageIndex(pages.length);
      showToast(`✨ Created ${newPageName}`);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      saveCurrentPageSnapshot();
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      clearCanvas();
      showToast('Page cleared');
      return;
    }
    const filtered = pages.filter((_, idx) => idx !== currentPageIndex);
    setPages(filtered);
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    showToast('Page deleted');
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isScratchpadOpen) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        if (isGrapherOpen) setIsGrapherOpen(false);
        else if (isFormulaStamperOpen) setIsFormulaStamperOpen(false);
        else setIsScratchpadOpen(false);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'p') setActiveTool('pen');
        else if (key === 'h') setActiveTool('highlighter');
        else if (key === 'a') setActiveTool('arrow');
        else if (key === 'l') setActiveTool('line');
        else if (key === 'c') setActiveTool('circle');
        else if (key === 'r') setActiveTool('rect');
        else if (key === 't') setIsFormulaStamperOpen(prev => !prev);
        else if (key === 'g') setIsGrapherOpen(prev => !prev);
        else if (key === 'e') setActiveTool('eraser');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScratchpadOpen, isGrapherOpen, isFormulaStamperOpen]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    setIsDrawing(true);
    setStartPos({ x, y });
    strokePointsRef.current = [{ x, y }];

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = lineWidth * 4;
      ctx.beginPath();
      ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(16, lineWidth * 3.5);
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (activeTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shape tools: save snapshot for dragging preview
      setShapePreviewSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    const pts = strokePointsRef.current;
    pts.push({ x, y });

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      if (pts.length < 3) {
        const b = pts[0];
        ctx.beginPath();
        ctx.arc(b.x, b.y, (ctx.lineWidth || lineWidth) / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      // Smooth midpoint Bézier curve interpolation
      for (let i = 1; i < pts.length - 2; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }

      // Final curve segment
      ctx.quadraticCurveTo(
        pts[pts.length - 2].x,
        pts[pts.length - 2].y,
        pts[pts.length - 1].x,
        pts[pts.length - 1].y
      );
      ctx.stroke();

    } else if (['line', 'arrow', 'circle', 'rect', 'triangle'].includes(activeTool) && shapePreviewSnapshot) {
      ctx.putImageData(shapePreviewSnapshot, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      if (activeTool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        const angle = Math.atan2(y - startPos.y, x - startPos.x);
        const headLen = Math.max(14, lineWidth * 3.5);
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (activeTool === 'circle') {
        const radius = Math.hypot(x - startPos.x, y - startPos.y);
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === 'rect') {
        ctx.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        ctx.stroke();
      } else if (activeTool === 'triangle') {
        // Right-angled triangle
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, startPos.y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
        // Right angle indicator box
        const boxSize = Math.min(16, Math.abs(x - startPos.x) / 3, Math.abs(y - startPos.y) / 3);
        const dirX = startPos.x < x ? -1 : 1;
        const dirY = startPos.y < y ? 1 : -1;
        ctx.strokeRect(x, startPos.y, dirX * boxSize, dirY * boxSize);
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.globalAlpha = 1.0;
    }
    setIsDrawing(false);
    setShapePreviewSnapshot(null);
    strokePointsRef.current = [];
    saveState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    saveState();
  };

  // 1-Click Cartesian Coordinate Axis Stamp in Center
  const stampAxes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const midX = Math.round(rect.width / 2);
    const midY = Math.round(rect.height / 2);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    const axisColor = effectiveBoardTheme === 'whiteboard' ? '#334155' : '#94A3B8';
    ctx.strokeStyle = axisColor;
    ctx.fillStyle = axisColor;
    ctx.lineWidth = 1.5;

    // Draw X-axis
    ctx.beginPath();
    ctx.moveTo(30, midY);
    ctx.lineTo(rect.width - 30, midY);
    // Arrows
    ctx.lineTo(rect.width - 38, midY - 6);
    ctx.moveTo(rect.width - 30, midY);
    ctx.lineTo(rect.width - 38, midY + 6);
    ctx.moveTo(30, midY);
    ctx.lineTo(38, midY - 6);
    ctx.moveTo(30, midY);
    ctx.lineTo(38, midY + 6);

    // Draw Y-axis
    ctx.moveTo(midX, rect.height - 30);
    ctx.lineTo(midX, 30);
    ctx.lineTo(midX - 6, 38);
    ctx.moveTo(midX, 30);
    ctx.lineTo(midX + 6, 38);
    ctx.moveTo(midX, rect.height - 30);
    ctx.lineTo(midX - 6, rect.height - 38);
    ctx.moveTo(midX, rect.height - 30);
    ctx.lineTo(midX + 6, rect.height - 38);
    ctx.stroke();

    // Ticks & Labels
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const step = 40;
    let count = 1;
    ctx.beginPath();
    for (let x = midX + step; x < rect.width - 45; x += step) {
      ctx.moveTo(x, midY - 4);
      ctx.lineTo(x, midY + 4);
      if (count % 2 === 0) ctx.fillText(`${count}`, x, midY + 7);
      count++;
    }
    count = 1;
    for (let x = midX - step; x > 45; x -= step) {
      ctx.moveTo(x, midY - 4);
      ctx.lineTo(x, midY + 4);
      if (count % 2 === 0) ctx.fillText(`-${count}`, x, midY + 7);
      count++;
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    count = 1;
    for (let y = midY - step; y > 45; y -= step) {
      ctx.moveTo(midX - 4, y);
      ctx.lineTo(midX + 4, y);
      if (count % 2 === 0) ctx.fillText(`${count}`, midX - 7, y);
      count++;
    }
    count = 1;
    for (let y = midY + step; y < rect.height - 45; y += step) {
      ctx.moveTo(midX - 4, y);
      ctx.lineTo(midX + 4, y);
      if (count % 2 === 0) ctx.fillText(`-${count}`, midX - 7, y);
      count++;
    }
    ctx.stroke();

    // Axis Labels
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('x', rect.width - 24, midY - 12);
    ctx.fillText('y', midX + 10, 32);
    ctx.fillText('O', midX - 14, midY + 12);

    ctx.restore();
    saveState();
    showToast('📐 Stamped Cartesian Coordinate Axes');
  };

  // Mathematical Function Scripting Engine: Plots f(x) onto Whiteboard
  const handlePlotFunction = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const midX = Math.round(rect.width / 2);
    const midY = Math.round(rect.height / 2);
    const scale = 40; // 40 pixels = 1 math coordinate unit

    setGraphError(null);
    const { points, error } = generateFunctionPoints(graphFunctionStr, graphXMin, graphXMax, 400);

    if (error) {
      setGraphError(error);
      return;
    }

    // Check if axes stamped; stamp them if first time
    stampAxes();

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = graphColor;
    ctx.lineWidth = 2.5;

    let drawing = false;
    ctx.beginPath();

    for (const pt of points) {
      if (!pt.isValid) {
        drawing = false;
        continue;
      }

      const canvasX = midX + pt.x * scale;
      const canvasY = midY - pt.y * scale;

      // Discard points drastically out of canvas view
      if (canvasY < -200 || canvasY > rect.height + 200) {
        drawing = false;
        continue;
      }

      if (!drawing) {
        ctx.moveTo(canvasX, canvasY);
        drawing = true;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    // Add function formula label near the curve
    ctx.fillStyle = graphColor;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`y = ${graphFunctionStr}`, midX + 60, midY - 80);

    ctx.restore();
    saveState();
    setIsGrapherOpen(false);
    showToast(`📈 Plotted f(x) = ${graphFunctionStr} on Whiteboard!`);
  };

  // Stamp KaTeX Formula Note onto the canvas
  const handleStampFormula = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    try {
      // Render LaTeX to HTML string via KaTeX
      const html = katex.renderToString(stampLatex, {
        throwOnError: false,
        displayMode: true,
      });

      const formulaColor = color;
      const svgWidth = 460;
      const svgHeight = 110;

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color: ${formulaColor}; font-size: ${stampFontSize}px; display: flex; align-items: center; justify-content: center; height: 100%; font-family: KaTeX_Main, serif;">
              ${html}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, midX - svgWidth / 2, midY - svgHeight / 2);
        saveState();
        setIsFormulaStamperOpen(false);
        showToast('✨ Typeset Math Formula Stamped on Board!');
      };
      img.onerror = () => {
        // Fallback: draw text directly
        ctx.save();
        ctx.fillStyle = formulaColor;
        ctx.font = `bold ${stampFontSize}px "KaTeX_Main", serif`;
        ctx.textAlign = 'center';
        ctx.fillText(stampLatex, midX, midY);
        ctx.restore();
        saveState();
        setIsFormulaStamperOpen(false);
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

    } catch (e) {
      console.error('KaTeX Stamp Error:', e);
      showToast('Could not stamp formula');
    }
  };

  // Stamp a math symbol directly onto the center of the canvas
  const stampSymbolOnCanvas = (symbolStr) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = color;
    ctx.font = 'bold 38px "KaTeX_Main", "Cambria Math", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbolStr, midX, midY);
    ctx.restore();
    saveState();

    showToast(`Stamped "${symbolStr}" on board`);
  };

  const copySymbol = (sym) => {
    navigator.clipboard.writeText(sym.symbol);
    showToast(`Copied "${sym.symbol}" to clipboard!`);
  };

  // Build composite export canvas for download & copy
  const createCompositeExportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');

    const bgMap = {
      blackboard: '#090D16',
      whiteboard: '#FFFFFF',
      blueprint: '#0A1833',
    };
    const effectiveBg = bgMap[effectiveBoardTheme] || '#FFFFFF';

    ctx.fillStyle = effectiveBg;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw grid if active
    if (paperGrid !== 'blank') {
      ctx.strokeStyle = isEffectiveDark ? '#151F32' : '#E2E8F0';
      ctx.lineWidth = 1;
      const step = 48;

      if (paperGrid === 'graph') {
        for (let x = 0; x < exportCanvas.width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, exportCanvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < exportCanvas.height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(exportCanvas.width, y);
          ctx.stroke();
        }
      } else if (paperGrid === 'polar') {
        const midX = exportCanvas.width / 2;
        const midY = exportCanvas.height / 2;
        const maxR = Math.hypot(midX, midY);
        for (let r = step; r < maxR; r += step) {
          ctx.beginPath();
          ctx.arc(midX, midY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let deg = 0; deg < 360; deg += 30) {
          const rad = (deg * Math.PI) / 180;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + Math.cos(rad) * maxR, midY + Math.sin(rad) * maxR);
          ctx.stroke();
        }
      } else if (paperGrid === 'ruled') {
        for (let y = step; y < exportCanvas.height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(exportCanvas.width, y);
          ctx.stroke();
        }
      }
    }

    // Draw user drawings
    ctx.drawImage(canvas, 0, 0);

    // Attribution watermark
    ctx.fillStyle = isEffectiveDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`BehindTheMath · ${pages[currentPageIndex]?.name || 'Math Whiteboard'}`, 24, exportCanvas.height - 24);

    return exportCanvas;
  };

  const downloadCanvas = () => {
    const exportCanvas = createCompositeExportCanvas();
    if (!exportCanvas) return;

    const link = document.createElement('a');
    link.download = `BehindTheMath-${pages[currentPageIndex]?.name.replace(/\s+/g, '-') || 'Whiteboard'}-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('📸 Whiteboard PNG downloaded!');
  };

  const copyCanvasToClipboard = () => {
    const exportCanvas = createCompositeExportCanvas();
    if (!exportCanvas) return;

    exportCanvas.toBlob(async (blob) => {
      if (blob && navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('📋 Whiteboard image copied to clipboard!');
        } catch (e) {
          console.error(e);
          showToast('Could not copy image to clipboard');
        }
      } else {
        showToast('Clipboard image copying not supported on this browser');
      }
    }, 'image/png');
  };

  if (!isScratchpadOpen) return null;

  // Background styling based on paperGrid and effectiveBoardTheme
  const getCanvasBgClass = () => {
    let baseBg = 'bg-white';
    if (effectiveBoardTheme === 'blackboard') {
      baseBg = 'bg-[#090D16]';
    } else if (effectiveBoardTheme === 'blueprint') {
      baseBg = 'bg-[#0A1833]';
    } else {
      baseBg = 'bg-white';
    }

    if (paperGrid === 'blank') return baseBg;

    if (paperGrid === 'graph') {
      if (isEffectiveDark) {
        return `${baseBg} bg-[linear-gradient(to_right,#151f32_1px,transparent_1px),linear-gradient(to_bottom,#151f32_1px,transparent_1px)] bg-[size:24px_24px]`;
      }
      return `${baseBg} bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]`;
    }

    if (paperGrid === 'dot') {
      if (isEffectiveDark) {
        return `${baseBg} bg-[radial-gradient(#27354a_1.5px,transparent_1.5px)] bg-[size:24px_24px]`;
      }
      return `${baseBg} bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:24px_24px]`;
    }

    if (paperGrid === 'ruled') {
      if (isEffectiveDark) {
        return `${baseBg} bg-[linear-gradient(to_bottom,#151f32_1px,transparent_1px)] bg-[size:100%_28px]`;
      }
      return `${baseBg} bg-[linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:100%_28px]`;
    }

    if (paperGrid === 'polar') {
      return baseBg; // Polar circles are drawn via canvas overlay
    }

    return baseBg;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      }`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold border border-zinc-700 dark:border-zinc-300 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        className={`w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col shadow-2xl transition-all ${
          isFullscreen ? 'h-screen max-w-none rounded-none' : 'max-w-6xl h-[94vh] rounded-3xl'
        }`}
      >
        {/* =========================================================================
            TIER 1: HEADER & MULTI-PAGE MANAGER
            ========================================================================= */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              📐
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-white truncate leading-tight">
                  Math Scripted Whiteboard
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {effectiveBoardTheme === 'whiteboard' ? '☀️ Whiteboard' : effectiveBoardTheme === 'blueprint' ? '📐 Blueprint' : '🌙 Chalkboard'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden md:block truncate">
                Interactive math scripting, function graphing, and smooth derivation proofs
              </p>
            </div>
          </div>

          {/* Center: Multi-Page Whiteboard Manager */}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl shadow-xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-300 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold px-2 text-zinc-800 dark:text-zinc-200 font-mono">
              Page {currentPageIndex + 1} / {pages.length}
            </span>
            <button
              onClick={handleNextPage}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              title={currentPageIndex === pages.length - 1 ? "Add New Page (+)" : "Next Page"}
            >
              {currentPageIndex === pages.length - 1 ? <Plus className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDeletePage}
              className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer ml-1"
              title="Delete or clear this page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Actions (Undo, Redo, Copy, Fullscreen, Export, Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Undo / Redo */}
            <div className="flex items-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 px-2 text-zinc-600 dark:text-zinc-300 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 px-2 text-zinc-600 dark:text-zinc-300 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-800 cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy image to clipboard */}
            <button
              type="button"
              onClick={copyCanvasToClipboard}
              title="Copy Whiteboard Image to Clipboard"
              className="p-1.5 px-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
              className="p-1.5 px-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
            </button>

            {/* Download PNG Export */}
            <button
              type="button"
              onClick={downloadCanvas}
              title="Export Whiteboard as PNG"
              className="p-1.5 px-2.5 sm:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PNG</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsScratchpadOpen(false)}
              title="Close Scratchpad (Esc)"
              className="w-8 h-8 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            TIER 2: MATHEMATICS TOOLBELT (Drawing Tools, Math Scripting Triggers, Colors)
            ========================================================================= */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 gap-3 overflow-x-auto scrollbar-none shrink-0">
          
          {/* Left Station: Drawing & Shape Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Tool Selector Segment */}
            <div className="flex items-center p-0.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                title="Pen (P) - Smooth freehand ink"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'pen'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('highlighter')}
                title="Highlighter (H) - Translucent formula marker"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'highlighter'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('arrow')}
                title="Arrow (A) - Vector & implication arrow"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'arrow'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('line')}
                title="Straight Line / Ruler (L)"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'line'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Minus className="w-3.5 h-3.5 rotate-45" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('circle')}
                title="Circle (C) - Trigonometry & geometry circle"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'circle'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('triangle')}
                title="Right Triangle - Pythagorean geometry"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'triangle'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Triangle className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('rect')}
                title="Formula Box / Rectangle (R)"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'rect'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('eraser')}
                title="True Eraser (E)"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTool === 'eraser'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* MATHEMATICAL SCRIPTING ACTIONS */}
            <div className="flex items-center gap-1.5">
              {/* Function Plotter Trigger */}
              <button
                type="button"
                onClick={() => setIsGrapherOpen(prev => !prev)}
                className={`p-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isGrapherOpen
                    ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-zinc-800 dark:text-zinc-200'
                }`}
                title="Plot mathematical function f(x) onto coordinate grid (G)"
              >
                <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                <span>Script Graph</span>
              </button>

              {/* KaTeX Formula Note Stamper Trigger */}
              <button
                type="button"
                onClick={() => setIsFormulaStamperOpen(prev => !prev)}
                className={`p-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isFormulaStamperOpen
                    ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-zinc-800 dark:text-zinc-200'
                }`}
                title="Stamp typeset LaTeX math formula onto board (T)"
              >
                <Type className="w-3.5 h-3.5 text-purple-500" />
                <span>Formula Note</span>
              </button>

              {/* 1-Click Cartesian X-Y Axes Stamp */}
              <button
                type="button"
                onClick={stampAxes}
                title="Stamp Cartesian X-Y Coordinate Axes"
                className="p-1.5 px-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Axes</span>
              </button>
            </div>

            <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 shrink-0" />

            {/* Color Palette */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs shrink-0">
              {activePalette.map((p) => {
                const isSelected = color === p.hex && activeTool !== 'eraser';
                return (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => {
                      setColor(p.hex);
                      if (activeTool === 'eraser') setActiveTool('pen');
                    }}
                    style={{ backgroundColor: p.hex }}
                    title={p.name}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all border border-black/10 dark:border-white/20 cursor-pointer ${
                      isSelected
                        ? 'scale-125 ring-2 ring-zinc-800 dark:ring-white shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:scale-110'
                    }`}
                  />
                );
              })}
            </div>

            {/* Stroke Thickness Selector */}
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              aria-label="Stroke Thickness"
              className="text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none shadow-xs shrink-0 cursor-pointer"
            >
              <option value="2">Fine (2px)</option>
              <option value="4">Medium (4px)</option>
              <option value="8">Bold (8px)</option>
              <option value="14">Marker (14px)</option>
            </select>
          </div>

          {/* Right Station: Paper Grid & Board Theme */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Paper Grid Selector */}
            <select
              value={paperGrid}
              onChange={(e) => setPaperGrid(e.target.value)}
              aria-label="Paper Style"
              className="text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none shadow-xs shrink-0 cursor-pointer"
            >
              <option value="graph">📐 Graph Grid</option>
              <option value="polar">⭕ Polar Trig Grid</option>
              <option value="dot">⚬ Dot Grid</option>
              <option value="ruled">📝 Ruled Lines</option>
              <option value="blank">◻️ Blank Board</option>
            </select>

            {/* Canvas Theme Selector */}
            <select
              value={boardTheme}
              onChange={(e) => setBoardTheme(e.target.value)}
              aria-label="Board Theme"
              className="text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none shadow-xs shrink-0 cursor-pointer"
            >
              <option value="auto">🌓 Auto Theme</option>
              <option value="blackboard">🌙 Chalkboard</option>
              <option value="whiteboard">☀️ Whiteboard</option>
              <option value="blueprint">📐 Blueprint</option>
            </select>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              title="Keyboard shortcuts & guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            TIER 3A: MATHEMATICAL FUNCTION SCRIPTING DRAWER (Expands when open)
            ========================================================================= */}
        {isGrapherOpen && (
          <div className="p-3 sm:p-4 bg-sky-50 dark:bg-sky-950/40 border-b border-sky-200 dark:border-sky-900/60 space-y-2.5 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Script & Plot Mathematical Function Curve</span>
              </span>
              <button
                onClick={() => setIsGrapherOpen(false)}
                className="text-sky-600 hover:text-sky-900 dark:text-sky-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800">
                <span className="text-xs font-mono font-bold text-sky-600">f(x) =</span>
                <input
                  type="text"
                  value={graphFunctionStr}
                  onChange={(e) => {
                    setGraphFunctionStr(e.target.value);
                    setGraphError(null);
                  }}
                  placeholder="e.g. sin(x), x^2 - 4, exp(-x^2), 2*cos(x)"
                  className="w-full text-xs font-mono bg-transparent outline-none text-zinc-900 dark:text-white"
                />
              </div>

              {/* Domain Range controls */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
                <span>x ∈ [</span>
                <input
                  type="number"
                  value={graphXMin}
                  onChange={(e) => setGraphXMin(Number(e.target.value))}
                  className="w-10 text-center font-bold bg-transparent outline-none"
                />
                <span>,</span>
                <input
                  type="number"
                  value={graphXMax}
                  onChange={(e) => setGraphXMax(Number(e.target.value))}
                  className="w-10 text-center font-bold bg-transparent outline-none"
                />
                <span>]</span>
              </div>

              {/* Curve Color picker */}
              <input
                type="color"
                value={graphColor}
                onChange={(e) => setGraphColor(e.target.value)}
                title="Curve line color"
                className="w-8 h-8 rounded-xl border-none cursor-pointer bg-transparent"
              />

              {/* Plot Action Button */}
              <button
                onClick={handlePlotFunction}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Plot Curve on Board
              </button>
            </div>

            {graphError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                ⚠️ Syntax Error: {graphError}
              </p>
            )}

            {/* Quick Curve Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <span className="text-sky-800 dark:text-sky-300 font-bold shrink-0">Presets:</span>
              {MATH_FUNCTION_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setGraphFunctionStr(p.expr);
                    setGraphError(null);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 shrink-0 font-mono transition-colors cursor-pointer"
                >
                  {p.label} ({p.expr})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TIER 3B: KATEX FORMULA & NOTE STAMPER DRAWER (Expands when open)
            ========================================================================= */}
        {isFormulaStamperOpen && (
          <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-900/60 space-y-2.5 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-purple-600" />
                <span>Stamp Typeset LaTeX Formula / Note onto Whiteboard</span>
              </span>
              <button
                onClick={() => setIsFormulaStamperOpen(false)}
                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
                <span className="text-xs font-mono font-bold text-purple-600">LaTeX:</span>
                <input
                  type="text"
                  value={stampLatex}
                  onChange={(e) => setStampLatex(e.target.value)}
                  placeholder="e.g. \int_0^1 x^2 dx = \frac{1}{3}, E = mc^2"
                  className="w-full text-xs font-mono bg-transparent outline-none text-zinc-900 dark:text-white"
                />
              </div>

              <select
                value={stampFontSize}
                onChange={(e) => setStampFontSize(Number(e.target.value))}
                className="text-xs font-semibold border border-purple-200 dark:border-purple-800 rounded-xl px-2 py-1.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none cursor-pointer"
              >
                <option value="18">Small (18px)</option>
                <option value="24">Medium (24px)</option>
                <option value="32">Large (32px)</option>
                <option value="42">Display (42px)</option>
              </select>

              <button
                onClick={handleStampFormula}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Stamp Formula on Board
              </button>
            </div>

            {/* Formula Template Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <span className="text-purple-800 dark:text-purple-300 font-bold shrink-0">Templates:</span>
              {FORMULA_STAMP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  onClick={() => setStampLatex(tmpl.latex)}
                  className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 shrink-0 font-medium transition-colors cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TIER 3C: INTERACTIVE MATH SYMBOLS STRIP
            ========================================================================= */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-1.5 bg-zinc-100/90 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-xs shrink-0 overflow-x-auto scrollbar-none gap-2">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Symbols:
            </span>
            {MATH_SYMBOLS.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => copySymbol(item)}
                title={`${item.label} (Click to copy)`}
                className="px-2 py-0.5 rounded-lg font-mono text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>{item.symbol}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => stampSymbolOnCanvas('∫')}
              title="Stamp Integral symbol on board"
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              + Stamp ∫
            </button>
            <button
              type="button"
              onClick={() => stampSymbolOnCanvas('∑')}
              title="Stamp Sigma summation symbol on board"
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              + Stamp ∑
            </button>
            <button
              type="button"
              onClick={() => stampSymbolOnCanvas('√x')}
              title="Stamp Square root on board"
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              + Stamp √x
            </button>
          </div>
        </div>

        {/* =========================================================================
            TIER 4: MAIN CANVAS DRAWING VIEWPORT
            ========================================================================= */}
        <div className={`flex-1 relative cursor-crosshair overflow-hidden transition-colors ${getCanvasBgClass()}`}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full block touch-none"
          />
        </div>

        {/* =========================================================================
            TIER 5: STATUS & SHORTCUTS FOOTER
            ========================================================================= */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span>
              Tool: <strong className="capitalize text-zinc-800 dark:text-zinc-200">{activeTool}</strong>
            </span>
            <span>•</span>
            <span className="hidden sm:inline">
              Shortcuts: <strong>P</strong> (Pen) · <strong>H</strong> (Highlight) · <strong>A</strong> (Arrow) · <strong>G</strong> (Graph) · <strong>T</strong> (Formula) · <strong>Ctrl+Z</strong> (Undo)
            </span>
          </div>
          <div className="font-mono text-[10px] flex items-center gap-2">
            <span>{paperGrid.toUpperCase()} Grid</span>
            <span>•</span>
            <span className="capitalize">{effectiveBoardTheme}</span>
          </div>
        </div>

      </div>

      {/* Shortcuts & Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <span>Math Whiteboard Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between pt-1">
                <span>Freehand Pen / Highlighter</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono font-bold">P / H</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Script & Plot Function</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono font-bold">G</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Stamp LaTeX Formula</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono font-bold">T</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Arrow / Ruler / Circle / Box</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono font-bold">A / L / C / R</kbd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Undo / Redo</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono font-bold">Ctrl+Z / Ctrl+Y</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
