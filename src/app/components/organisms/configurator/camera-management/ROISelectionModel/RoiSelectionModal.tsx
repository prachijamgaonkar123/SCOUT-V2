'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  Checkbox,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Paper,
  Menu,
  MenuItem,
  Drawer,
  useTheme,
  useMediaQuery,
  CircularProgress,
  InputBase,
} from '@mui/material';

import {
  CropSquare as RectangleIcon,
  Pentagon as PolygonIcon,
  Gesture as FreehandIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Palette as PaletteIcon,
  Edit as EditIcon,
  SwapHoriz as ToggleIcon,
  Check as IncludeIcon,
  Block as ExcludeIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Menu as MenuIcon,
  CropFree as FullFrameIcon,
} from '@mui/icons-material';
import { ROIShape } from '@/app/types/roi';
import { showToast } from '@/app/store/slices/toasterSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useDispatch } from 'react-redux';

type DrawingTool = 'rectangle' | 'polygon' | 'freehand';

interface Point {
  x: number;
  y: number;
}

interface RoiSelectionModalProps {
  open: boolean;
  onClose: () => void;
  cameraFeedUrl: string;
  useCaseName: string;
  existingROI?: ROIShape[];
  onSave: (roiShapes: ROIShape[]) => void;
  labels: string[];
  enableThreshold?: boolean;
  thresholdValue?: number | null;
  onThresholdChange?: (value: number | null) => void;
}

const ROI_COLORS = [
  '#00ff00',
  '#ff0000',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ff8800',
  '#8800ff',
  '#00ff88',
  '#ff1493',
];

const RoiSelectionModal: React.FC<RoiSelectionModalProps> = ({
  open,
  onClose,
  cameraFeedUrl,
  useCaseName,
  existingROI,
  onSave,
  labels,
  enableThreshold,
  thresholdValue,
  onThresholdChange,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const prevUseCaseRef = useRef<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);

  const [drawingTool, setDrawingTool] = useState<DrawingTool>('rectangle');
  const [roiMode, setRoiMode] = useState<'include' | 'exclude'>('include');
  const [roiShapes, setRoiShapes] = useState<ROIShape[]>([]);
  const [currentShape, setCurrentShape] = useState<ROIShape | null>(null);
  const currentShapeRef = useRef<ROIShape | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string>(ROI_COLORS[0]);
  const nextColorRef = useRef(0);
  const getNextColor = useCallback(() => {
    const idx = nextColorRef.current % ROI_COLORS.length;
    nextColorRef.current = (nextColorRef.current + 1) % ROI_COLORS.length;
    return ROI_COLORS[idx];
  }, []);

  const normalizeROI = (shapes: ROIShape[], canvas: HTMLCanvasElement) => {
    return shapes.map(shape => ({
      ...shape,
      points: shape.points.map(p => ({
        x: +(p.x / canvas.width).toFixed(6),
        y: +(p.y / canvas.height).toFixed(6),
      })),
    }));
  };

  const [selectedROIIndex, setSelectedROIIndex] = useState<number | null>(null);
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; roiIndex: number } | null>(null);
  const [labelMenu, setLabelMenu] = useState<{ x: number; y: number; roiIndex: number } | null>(null);
  const [modeMenuAnchor, setModeMenuAnchor] = useState<null | HTMLElement>(null);
  const [labelsMenuAnchor, setLabelsMenuAnchor] = useState<null | HTMLElement>(null);

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const [history, setHistory] = useState<ROIShape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const denormalizeROI = (shapes: ROIShape[], canvas: HTMLCanvasElement): ROIShape[] => {
    return shapes.map((shape, index) => ({
      ...shape,
      id: shape.id ?? crypto.randomUUID(),
      color: shape.color ?? ROI_COLORS[index % ROI_COLORS.length],
      points: shape.points.map(p => ({
        x: +(p.x * canvas.width).toFixed(2),
        y: +(p.y * canvas.height).toFixed(2),
      })),
      completed: true,
    }));
  };

  useEffect(() => {
    if (!open) return;

    if (labels.length > 0) {
      setSelectedLabels([labels[0]]);
    } else {
      setSelectedLabels(["ROI"]);
    }
  }, [labels, open]);

  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawBaseShape = (
    ctx: CanvasRenderingContext2D,
    shape: ROIShape,
    color: string,
    isSelected: boolean
  ) => {
    const points = shape.points;
    const isExclude = shape.mode === 'exclude';

    ctx.strokeStyle = isSelected ? '#0066ff' : color;
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.setLineDash(isExclude ? [8, 4] : []);

    if (shape.type === 'rectangle' && points.length === 2) {
      const width = points[1].x - points[0].x;
      const height = points[1].y - points[0].y;
      ctx.strokeRect(points[0].x, points[0].y, width, height);
      ctx.fillRect(points[0].x, points[0].y, width, height);
      return;
    }

    if ((shape.type === 'polygon' || shape.type === 'freehand') && points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      if (shape.completed) ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawPolygonHandles = (ctx: CanvasRenderingContext2D, shape: ROIShape, color: string) => {
    if (shape.type !== 'polygon' || shape.completed) return;
    shape.points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = index === 0 ? '#ffffff' : color;
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const drawShapeLabel = (ctx: CanvasRenderingContext2D, shape: ROIShape, label: number | null) => {
    if (shape.points.length === 0) return;
    const centerX = shape.points.reduce((s, p) => s + p.x, 0) / shape.points.length;
    const centerY = shape.points.reduce((s, p) => s + p.y, 0) / shape.points.length;
    const fallbackLabel = `ROI ${label ?? ''}`;
    // const text = `${shape.mode === 'exclude' ? '❌' : '✓'} ${shape.name || fallbackLabel}`;
    const text =
      `${shape.mode === 'exclude' ? '❌' : '✓'} ${shape.labels.join(", ")
      }`;
    ctx.setLineDash([]);
    ctx.font = 'bold 12px Arial';
    const padding = 8;
    const width = ctx.measureText(text).width + padding;
    ctx.fillStyle = shape.mode === 'exclude' ? 'rgba(255,0,0,0.9)' : 'rgba(0,0,0,0.7)';
    ctx.fillRect(centerX - width / 2, centerY - 12, width, 24);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY);
  };

  const drawShape = useCallback((
    ctx: CanvasRenderingContext2D,
    shape: ROIShape,
    color: string,
    label: number | null,
    _isActive: boolean,
    isSelected: boolean
  ) => {
    if (shape.points.length === 0) return;
    ctx.save();
    ctx.fillStyle = (() => {
      const r = Number.parseInt(color.slice(1, 3), 16);
      const g = Number.parseInt(color.slice(3, 5), 16);
      const b = Number.parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${shape.mode === 'exclude' ? 0.18 : 0.25})`;
    })();
    drawBaseShape(ctx, shape, color, isSelected);
    drawPolygonHandles(ctx, shape, color);
    drawShapeLabel(ctx, shape, label);
    ctx.restore();
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imageLoaded && imageRef.current) {
      try {
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.error('Error drawing image:', error);
      }
    }
    roiShapes.forEach((shape, index) => {
      const isSelected = index === selectedROIIndex;
      drawShape(ctx, shape, shape.color, index + 1, false, isSelected);
    });
    if (currentShape && currentShape.points.length > 0) {
      drawShape(ctx, currentShape, selectedColor, null, true, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLoaded, roiShapes, selectedROIIndex, selectedColor, currentShape]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    if (existingROI && existingROI.length > 0) {
      const denormalized = denormalizeROI(existingROI, canvas);
      setRoiShapes(denormalized);
      setHistory([denormalized]);
    } else {
      setRoiShapes([]);
      setHistory([[]]);
    }
    setHistoryIndex(0);
    setCurrentShape(null);
    currentShapeRef.current = null;
    setIsDrawing(false);
    setSelectedROIIndex(null);
    setEditingNameIndex(null);
    requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (imageRef.current) {
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      }
    });
  }, [open, existingROI, imageLoaded]);

  // const recalcCanvasSize = useCallback(() => {
  //   const canvas = canvasRef.current;
  //   const container = containerRef.current;
  //   if (!canvas || !container) return;
  //   const containerRect = container.getBoundingClientRect();
  //   const containerWidth = containerRect.width;
  //   const containerHeight = containerRect.height;
  //   if (containerHeight < 50) return;
  //   // const targetAspectRatio = 16 / 9;
  //   const targetAspectRatio = imageRef.current
  // ? imageRef.current.width / imageRef.current.height
  // : 16 / 9;
  //   const containerAspectRatio = containerWidth / containerHeight;
  //   let newCanvasWidth, newCanvasHeight;
  //   if (containerAspectRatio > targetAspectRatio) {
  //     newCanvasHeight = containerHeight;
  //     newCanvasWidth = containerHeight * targetAspectRatio;
  //   } else {
  //     newCanvasWidth = containerWidth;
  //     newCanvasHeight = containerWidth / targetAspectRatio;
  //   }
  //   newCanvasWidth = Math.min(newCanvasWidth, containerWidth);
  //   newCanvasHeight = Math.min(newCanvasHeight, containerHeight);
  //   canvas.width = newCanvasWidth;
  //   canvas.height = newCanvasHeight;
  //   setCanvasWidth(newCanvasWidth);
  //   setCanvasHeight(newCanvasHeight);
  // }, []);

  // const recalcCanvasSize = useCallback(() => {
  //   const canvas = canvasRef.current;
  //   const container = containerRef.current;

  //   if (!canvas || !container) return;

  //   const containerRect = container.getBoundingClientRect();

  //   const containerWidth = containerRect.width;
  //   const containerHeight = containerRect.height;

  //   if (containerHeight < 50) return;

  //   // const targetAspectRatio = imageRef.current
  //   //   ? imageRef.current.width / imageRef.current.height
  //   //   : 16 / 9;

  //   const targetAspectRatio =
  //     imageRef.current &&
  //       imageRef.current.width > 0 &&
  //       imageRef.current.height > 0
  //       ? imageRef.current.width / imageRef.current.height
  //       : 16 / 9;

  //   let newCanvasWidth = containerWidth;

  //   let newCanvasHeight = containerWidth / targetAspectRatio;

  //   // Prevent overflow vertically
  //   if (newCanvasHeight > containerHeight) {
  //     newCanvasHeight = containerHeight;
  //     newCanvasWidth = containerHeight * targetAspectRatio;
  //   }

  //   if (
  //     !Number.isFinite(newCanvasWidth) ||
  //     !Number.isFinite(newCanvasHeight)
  //   ) {
  //     return;
  //   }
  //   canvas.width = newCanvasWidth;
  //   canvas.height = newCanvasHeight;

  //   setCanvasWidth(newCanvasWidth);
  //   setCanvasHeight(newCanvasHeight);
  // }, []);


  const recalcCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const containerRect = container.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    if (containerHeight < 50) return;

    const imageAspectRatio =
      imageRef.current &&
        imageRef.current.width > 0 &&
        imageRef.current.height > 0
        ? imageRef.current.width / imageRef.current.height
        : 16 / 9;

    let newCanvasWidth = containerWidth;
    let newCanvasHeight = containerWidth / imageAspectRatio;

    // If height exceeds available area
    if (newCanvasHeight > containerHeight) {
      newCanvasHeight = containerHeight;
      newCanvasWidth = containerHeight * imageAspectRatio;
    }

    canvas.width = Math.floor(newCanvasWidth);
    canvas.height = Math.floor(newCanvasHeight);

    setCanvasWidth(Math.floor(newCanvasWidth));
    setCanvasHeight(Math.floor(newCanvasHeight));
  }, []);



  useEffect(() => {
    if (open === false) return;
    const delayedCanvasResize = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(recalcCanvasSize);
      });
    };
    const timeoutId = setTimeout(delayedCanvasResize, 150);
    return () => clearTimeout(timeoutId);
  }, [open, recalcCanvasSize]);

  useEffect(() => {
    if (!open || !imageLoaded) return;
    if (isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }
    roiShapes.forEach((shape, index) => {
      const isSelected = index === selectedROIIndex;
      drawShape(ctx, shape, shape.color, index + 1, false, isSelected);
    });
    if (currentShape && currentShape.points.length > 0) {
      drawShape(ctx, currentShape, selectedColor, null, true, false);
    }
  }, [roiShapes, selectedROIIndex, selectedColor, imageLoaded, open, currentShape, drawShape]);

  useEffect(() => {
    if (open) {
      const useCaseChanged = prevUseCaseRef.current !== useCaseName;
      prevUseCaseRef.current = useCaseName;
      if (useCaseChanged) {
        setTimeout(() => {
          recalcCanvasSize();
          if (imageLoaded && imageRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
            }
          }
        }, 50);
      }
    }
  }, [open, useCaseName, recalcCanvasSize, imageLoaded]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvasWidth < 100 || canvasHeight < 100) return;
    const img = new Image();
    imageRef.current = img;
    img.onload = () => {
      setImageLoaded(true);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = () => {
      setTimeout(() => {
        img.src = `${cameraFeedUrl}?retry=${Date.now()}`;
      }, 500);
    };
    img.src = `${cameraFeedUrl}?t=${Date.now()}`;
  }, [open, cameraFeedUrl, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (open && imageLoaded) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !imageRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      roiShapes.forEach((shape, index) => {
        const isSelected = index === selectedROIIndex;
        drawShape(ctx, shape, shape.color, index + 1, false, isSelected);
      });
    }
  }, [open, imageLoaded, roiShapes, selectedROIIndex, selectedColor, drawShape]);

  useEffect(() => {
    if (!open) return;
    const handleResize = () => {
      if (isDrawingRef.current) return;
      recalcCanvasSize();
      setTimeout(drawCanvas, 50);
    };
    window.addEventListener('resize', handleResize);
    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(handleResize);
    if (container) resizeObserver.observe(container);
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [open, recalcCanvasSize, drawCanvas]);

  const addToHistory = useCallback((newShapes: ROIShape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleSelectEntireFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newShape: ROIShape = {
      id: crypto.randomUUID(),
      type: 'rectangle',
      points: [
        { x: 0, y: 0 },
        { x: canvas.width, y: canvas.height },
      ],
      completed: true,
      color: getNextColor(),
      labels: selectedLabels,
      mode: roiMode,
    };
    const newShapes = [...roiShapes, newShape];
    setRoiShapes(newShapes);
    addToHistory(newShapes);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const isPointInShape = (point: Point, shape: ROIShape): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    if (shape.type === 'rectangle' && shape.points.length === 2) {
      const [p1, p2] = shape.points;
      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);
      const minY = Math.min(p1.y, p2.y);
      const maxY = Math.max(p1.y, p2.y);
      return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
    } else if ((shape.type === 'polygon' || shape.type === 'freehand') && shape.completed) {
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      shape.points.forEach((p, index) => {
        if (index > 0) ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      return ctx.isPointInPath(point.x, point.y);
    }
    return false;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    isDrawingRef.current = true;
    const point = getCanvasCoordinates(e);
    if (drawingTool === 'rectangle') {
      const newShape = {
        id: crypto.randomUUID(),
        type: 'rectangle' as DrawingTool,
        points: [point],
        completed: false,
        color: getNextColor(),
        // name: selectedLabel,
        labels: selectedLabels,
        mode: roiMode,
      };
      currentShapeRef.current = newShape;
      setCurrentShape(newShape);
      setIsDrawing(true);
    } else if (drawingTool === 'freehand') {
      const newShape = {
        id: crypto.randomUUID(),
        type: 'freehand' as DrawingTool,
        points: [point],
        completed: false,
        color: getNextColor(),
        // name: selectedLabel,
        labels: selectedLabels,
        mode: roiMode,
      };
      currentShapeRef.current = newShape;
      setCurrentShape(newShape);
      setIsDrawing(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShapeRef.current) return;
    const point = getCanvasCoordinates(e);
    if (drawingTool === 'rectangle') {
      const updatedShape = {
        ...currentShapeRef.current,
        points: [currentShapeRef.current.points[0], point],
      };
      currentShapeRef.current = updatedShape;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && imageRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
        roiShapes.forEach((shape, index) => {
          drawShape(ctx, shape, shape.color, index + 1, false, index === selectedROIIndex);
        });
        drawShape(ctx, updatedShape, selectedColor, null, true, false);
      }
    } else if (drawingTool === 'freehand') {
      const lastPoint = currentShapeRef.current.points.at(-1);
      if (!lastPoint) return;
      const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
      if (distance >= 3) {
        const updatedShape = {
          ...currentShapeRef.current,
          points: [...currentShapeRef.current.points, point],
        };
        currentShapeRef.current = updatedShape;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx && imageRef.current) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
          roiShapes.forEach((shape, index) => {
            drawShape(ctx, shape, shape.color, index + 1, false, index === selectedROIIndex);
          });
          drawShape(ctx, updatedShape, selectedColor, null, true, false);
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    isDrawingRef.current = false;
    if (!currentShapeRef.current) return;
    if (drawingTool === 'rectangle' || drawingTool === 'freehand') {
      if (currentShapeRef.current.points.length >= 2) {
        const completedShape = { ...currentShapeRef.current, completed: true };
        const newShapes: ROIShape[] = [...roiShapes, completedShape];
        setRoiShapes(newShapes);
        addToHistory(newShapes);
      }
      currentShapeRef.current = null;
      setCurrentShape(null);
      setIsDrawing(false);
    }
  };

  const selectROIAtPoint = (point: Point) => {
    for (let i = roiShapes.length - 1; i >= 0; i--) {
      if (isPointInShape(point, roiShapes[i])) {
        setSelectedROIIndex(i);
        return true;
      }
    }
    return false;
  };

  const startPolygon = (point: Point) => {
    const newShape = {
      id: crypto.randomUUID(),
      type: 'polygon' as DrawingTool,
      points: [point],
      completed: false,
      color: getNextColor(),
      // name: selectedLabel,
      labels: selectedLabels,
      mode: roiMode,
    };
    currentShapeRef.current = newShape;
    setCurrentShape(newShape);
  };

  const handlePolygonProgress = (point: Point) => {
    if (!currentShapeRef.current) return;
    const firstPoint = currentShapeRef.current.points[0];
    const distance = Math.hypot(point.x - firstPoint.x, point.y - firstPoint.y);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width ?? 1);
    const closeThreshold = 15 * scaleX;
    if (distance < closeThreshold && currentShapeRef.current.points.length >= 3) {
      const completedShape: ROIShape = { ...currentShapeRef.current, completed: true };
      const newShapes = [...roiShapes, completedShape];
      setRoiShapes(newShapes);
      addToHistory(newShapes);
      currentShapeRef.current = null;
      setCurrentShape(null);
      return;
    }
    const updatedShape: ROIShape = {
      ...currentShapeRef.current,
      points: [...currentShapeRef.current.points, point],
    };
    currentShapeRef.current = updatedShape;
    setCurrentShape(updatedShape);
    const ctx = canvas.getContext('2d');
    if (!ctx || !imageRef.current) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    roiShapes.forEach((shape, index) => {
      drawShape(ctx, shape, shape.color, index + 1, false, index === selectedROIIndex);
    });
    drawShape(ctx, updatedShape, selectedColor, null, true, false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) return;
    const point = getCanvasCoordinates(e);
    if (drawingTool !== 'polygon' && !currentShapeRef.current) {
      if (!selectROIAtPoint(point)) setSelectedROIIndex(null);
      return;
    }
    if (drawingTool !== 'polygon') return;
    if (!currentShapeRef.current) {
      startPolygon(point);
      return;
    }
    handlePolygonProgress(point);
  };

  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = false;
    currentShapeRef.current = null;
    setCurrentShape(null);
    setIsDrawing(false);
    const point = getCanvasCoordinates(e);
    for (let i = roiShapes.length - 1; i >= 0; i--) {
      if (isPointInShape(point, roiShapes[i])) {
        setContextMenu({ x: e.clientX, y: e.clientY, roiIndex: i });
        setSelectedROIIndex(i);
        return;
      }
    }
  };

  const handleDeleteROI = (index: number) => {
    const newShapes: ROIShape[] = roiShapes.filter((_, i) => i !== index);
    setRoiShapes(newShapes);
    addToHistory(newShapes);
    if (selectedROIIndex === index) setSelectedROIIndex(null);
  };

  const handleROILabelChange = (
    index: number,
    newLabels: string[]
  ) => {
    const newShapes = roiShapes.map((shape, i) =>
      i === index
        ? {
          ...shape,
          labels: newLabels,
        }
        : shape
    );

    setRoiShapes(newShapes);
    addToHistory(newShapes);
  };

  const handleROIColorChange = (index: number, newColor: string) => {
    const newShapes: ROIShape[] = roiShapes.map((shape, i) =>
      i === index ? { ...shape, color: newColor } : shape
    );
    setRoiShapes(newShapes);
    addToHistory(newShapes);
  };

  const handleROIModeToggle = (index: number) => {
    const newShapes: ROIShape[] = roiShapes.map((shape, i) =>
      i === index ? { ...shape, mode: shape.mode === 'include' ? 'exclude' : 'include' } : shape
    );
    setRoiShapes(newShapes);
    addToHistory(newShapes);
  };

  const editFieldRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (editingNameIndex !== null && editFieldRef.current) {
      editFieldRef.current.focus();
      editFieldRef.current.select();
    }
  }, [editingNameIndex]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: '95%', md: '95%', lg: '90%', xl: '1200px' },
            maxWidth: '1300px',
            // The canvas container top-aligns and shrink-wraps to the fitted
            // image size, so a shorter dialog keeps the leftover space (below
            // the frame) from showing as a large blank gap.
            height: { xs: '100vh', sm: '78vh', md: '74vh' },
            m: { xs: 0, sm: 1, md: 2 },
            bgcolor: 'white',
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          gap: 0,
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'hidden',
        }}
      >
        {/* ── Left: toolbar + canvas + hint ── */}
        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            minHeight: 0,
            p: { xs: 1, sm: 2 },
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 1, sm: 2 } }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              color="black"
              sx={{ fontSize: { xs: '0.95rem', sm: '1rem', md: '1.125rem' } }}
            >
              Configure ROI - {useCaseName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={`${roiShapes.length} ROI(s)`}
                color={roiShapes.length > 0 ? 'success' : 'default'}
                size="small"
              />
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 0.5, sm: 1, md: 2 },
              mb: { xs: 1, sm: 2 },
              alignItems: 'center',
            }}
          >
            <ToggleButtonGroup
              value={drawingTool}
              exclusive
              onChange={(_, newTool) => {
                if (newTool) {
                  setDrawingTool(newTool);
                  setCurrentShape(null);
                  setIsDrawing(false);
                }
              }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                  px: { xs: 0.5, sm: 1 },
                },
              }}
            >
              <ToggleButton value="rectangle">
                <RectangleIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: { xs: 16, sm: 18 } }} />
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Rectangle
                </Typography>
              </ToggleButton>
              <ToggleButton value="polygon">
                <PolygonIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: { xs: 16, sm: 18 } }} />
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Polygon
                </Typography>
              </ToggleButton>
              <ToggleButton value="freehand">
                <FreehandIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: { xs: 16, sm: 18 } }} />
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Freehand
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title="Add the entire frame as a single ROI">
              <Button
                size="small"
                variant="outlined"
                onClick={handleSelectEntireFrame}
                startIcon={<FullFrameIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                Full Frame
              </Button>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ bgcolor: 'grey.300', display: { xs: 'none', sm: 'block' } }}
            />

            <Button
              size="small"
              variant="outlined"
              onClick={(e) => setModeMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                textTransform: 'none',
                minWidth: 100,
                borderColor: roiMode === 'include' ? 'success.main' : 'error.main',
                color: roiMode === 'include' ? 'success.main' : 'error.main',
                '&:hover': {
                  borderColor: roiMode === 'include' ? 'success.dark' : 'error.dark',
                  bgcolor: roiMode === 'include' ? 'success.light' : 'error.light',
                },
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
              }}
            >
              {roiMode === 'include' ? (
                <><IncludeIcon sx={{ mr: 0.5, fontSize: 16 }} /> Include</>
              ) : (
                <><ExcludeIcon sx={{ mr: 0.5, fontSize: 16 }} /> Exclude</>
              )}
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={(e) => setLabelsMenuAnchor(e.currentTarget)}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                textTransform: 'none',
                minWidth: 100,
                maxWidth: 220,
                justifyContent: 'space-between',
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
              }}
            >
              <Typography
                component="span"
                noWrap
                sx={{ fontSize: 'inherit', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {selectedLabels.length ? selectedLabels.join(', ') : 'Labels'}
              </Typography>
            </Button>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ bgcolor: 'grey.300', display: { xs: 'none', sm: 'block' } }}
            />

            <Tooltip title="Undo">
              <span>
                <IconButton
                  onClick={() => {
                    if (historyIndex > 0) {
                      setHistoryIndex(historyIndex - 1);
                      setRoiShapes(history[historyIndex - 1]);
                      setCurrentShape(null);
                    }
                  }}
                  disabled={historyIndex === 0}
                  size="small"
                >
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo">
              <span>
                <IconButton
                  onClick={() => {
                    if (historyIndex < history.length - 1) {
                      setHistoryIndex(historyIndex + 1);
                      setRoiShapes(history[historyIndex + 1]);
                    }
                  }}
                  disabled={historyIndex === history.length - 1}
                  size="small"
                >
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Clear All">
              <IconButton
                onClick={() => {
                  setRoiShapes([]);
                  setCurrentShape(null);
                  setHistory([[]]);
                  setHistoryIndex(0);
                }}
                size="small"
                color="error"
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* ── Canvas container — flex:1/minHeight:0 defines the available
               space for measurement only; the visible bordered box below
               hugs the canvas's actual fitted size so no blank gray padding
               shows above/below the image ── */}
          <Box
            ref={containerRef}
            sx={{
              flex: '1 1 0',
              minHeight: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: canvasWidth || '100%',
                height: canvasHeight || '100%',
                display: 'flex',
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                border: '2px solid #e0e0e0',
                overflow: 'hidden',
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                style={{
                  cursor: 'crosshair',
                  display: 'block',
                  width: '100%',
                  height: '100%',
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onClick={handleCanvasClick}
                onContextMenu={handleCanvasContextMenu}
              />
              {!imageLoaded && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'grey.500',
                  }}
                >
                  <CircularProgress size={24} sx={{ mb: 1 }} />
                  <Typography variant="body2">Loading camera feed...</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Hint text */}
          <Box
            sx={{
              // mt: { xs: 0.5, sm: 1 },
              mt: 0.5,
              py: 0,
              color: 'grey.700',
              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
            }}
          >
            <Typography variant="caption">
              <strong>Rectangle:</strong> Click &amp; drag |{' '}
              <strong>Polygon:</strong> Click points, click near start to close |{' '}
              <strong>Freehand:</strong> Click &amp; drag |{' '}
              <strong>Right-click ROI:</strong> Edit menu
            </Typography>
          </Box>
        </Box>

        {/* ── Right sidebar (desktop) ── */}
        {isMdUp && (
          <Box
            sx={{
              width: '220px',
              flex: '0 0 220px',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: 'white',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="caption"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: '0.78rem' }}
              >
                <PaletteIcon fontSize="small" />
                Color
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 0.25,
                  mt: 0.5,
                  columnGap: '4px',
                  rowGap: '8px',
                }}
              >
                {ROI_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      width: 18,
                      height: 18,
                      bgcolor: color,
                      border: selectedColor === color ? '2px solid #0066ff' : '1px solid grey',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.08)' },
                      transition: 'transform 0.12s',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {enableThreshold && (
              <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem', mb: 0.5 }}>
                  Set Threshold
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'grey.400',
                    borderRadius: 1,
                    height: 32,
                    px: 1,
                    width: '100%',
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ p: 0.25 }}
                    onClick={() => onThresholdChange?.(Math.max(0, (thresholdValue ?? 0) - 1))}
                  >
                    –
                  </IconButton>
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <InputBase
                      value={thresholdValue ?? 0}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        onThresholdChange?.(isNaN(v) ? 0 : v);
                      }}
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        style: { textAlign: 'center', fontSize: '0.85rem', width: 40 },
                      }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    sx={{ p: 0.25 }}
                    onClick={() => onThresholdChange?.((thresholdValue ?? 0) + 1)}
                  >
                    +
                  </IconButton>
                </Box>
              </Box>
            )}

            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                ROIs ({roiShapes.length})
              </Typography>
              <List dense sx={{ p: 0 }}>
                {roiShapes.map((shape, index) => (
                  <Paper
                    key={shape.id}
                    elevation={selectedROIIndex === index ? 2 : 0}
                    sx={{
                      mb: 0.5,
                      p: 0.5,
                      border: '1px solid',
                      borderColor: selectedROIIndex === index ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => setSelectedROIIndex(index === selectedROIIndex ? null : index)}
                  >
                    <ListItem disablePadding sx={{ gap: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', width: '100%' }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            bgcolor: shape.color,
                            borderRadius: '3px',
                            border: '1px solid grey',
                            flexShrink: 0,
                          }}
                        />
                        {editingNameIndex === index ? (
                          <TextField
                            select
                            inputRef={index === editingNameIndex ? editFieldRef : null}
                            value={shape.labels}
                            onChange={(e) => {
                              handleROILabelChange(
                                index,
                                typeof e.target.value === "string"
                                  ? e.target.value.split(",")
                                  : e.target.value
                              )
                              setEditingNameIndex(null);
                            }}
                            onBlur={() => setEditingNameIndex(null)}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected) =>
                                (selected as string[]).join(", "),
                            }}
                            size="small"
                            fullWidth
                            variant="standard"
                            sx={{
                              fontSize: '0.75rem',
                              '& select': { fontSize: '0.75rem', padding: '4px 4px' },
                            }}
                          >
                            {(labels.length > 0 ? labels : ['ROI']).map((labelOption) => (
                              <option key={labelOption} value={labelOption}>
                                {labelOption}
                              </option>
                            ))}
                          </TextField>
                        ) : (
                          <ListItemText
                            primary={
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <span>{shape.labels.join(", ")}</span>
                                <span style={{ opacity: 0.5 }}>•</span>
                                <span
                                  style={{
                                    color:
                                      shape.mode === 'include'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                    fontWeight: 600,
                                  }}
                                >
                                  {shape.mode === 'include' ? 'Include' : 'Exclude'}
                                </span>
                              </Typography>
                            }
                            sx={{ m: 0 }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteROI(index);
                          }}
                          sx={{ p: 0.25 }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </ListItem>
                  </Paper>
                ))}
              </List>
              {roiShapes.length === 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ display: 'block', mt: 2, fontSize: '0.75rem' }}
                >
                  No ROIs yet
                </Typography>
              )}
            </Box>

            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => {
                  if (roiShapes.length === 0) {
                    dispatch(
                      showToast({
                        id: crypto.randomUUID(),
                        message: getErrorMessage('Please draw at least one ROI region before saving.'),
                        severity: 'error',
                      })
                    );
                    return;
                  }
                  const canvas = canvasRef.current!;
                  const normalizedShapes = normalizeROI(roiShapes, canvas);
                  onSave(normalizedShapes);
                  onClose();
                }}
                disabled={roiShapes.length === 0}
                sx={{ mb: 0.5, fontSize: '0.85rem', py: 0.5 }}
                size="small"
              >
                Save ({roiShapes.length})
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={onClose}
                sx={{ fontSize: '0.85rem', py: 0.5 }}
                size="small"
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {/* ── Mobile drawer ── */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          slotProps={{
            paper: {
              sx: {
                width: { xs: '45vw', sm: '200px' },
                maxWidth: '200px',
                height: '100vh',
                top: 0,
                margin: 0,
                borderRadius: { xs: 0, sm: '0 8px 8px 0' },
                boxShadow: 6,
              },
            },
          }}
          sx={{ zIndex: 1300 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white', p: 0.5 }}>
            <Box
              sx={{
                p: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                ROI List
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ p: 0.25 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ p: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                variant="caption"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
              >
                <PaletteIcon fontSize="small" />
                Color
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 20px)',
                  columnGap: '4px',
                  rowGap: '8px',
                  mt: 0.75,
                  justifyContent: 'center',
                }}
              >
                {ROI_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: color,
                      border: selectedColor === color ? '2px solid #0066ff' : '1px solid grey',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.05)' },
                      transition: 'transform 0.12s',
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 0.75 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 0.75 }}
              >
                ROIs ({roiShapes.length})
              </Typography>
              <List dense sx={{ p: 0 }}>
                {roiShapes.map((shape, index) => (
                  <Paper
                    key={shape.id}
                    elevation={selectedROIIndex === index ? 2 : 0}
                    sx={{
                      mb: 0.25,
                      p: 0.25,
                      border: '1px solid',
                      borderColor: selectedROIIndex === index ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => setSelectedROIIndex(index === selectedROIIndex ? null : index)}
                  >
                    <ListItem disablePadding sx={{ gap: 0.25 }}>
                      <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center', width: '100%' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: shape.color,
                            borderRadius: '1px',
                            border: '1px solid grey',
                            flexShrink: 0,
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.65rem' }}>
                              {shape.labels.join(", ")}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.55rem',
                                color: shape.mode === 'include' ? 'success.main' : 'error.main',
                                fontWeight: 500,
                              }}
                            >
                              {shape.mode === 'include' ? 'Include' : 'Exclude'}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteROI(index);
                          }}
                          sx={{ p: 0.125, minWidth: 'auto' }}
                        >
                          <DeleteIcon sx={{ fontSize: 10 }} />
                        </IconButton>
                      </Box>
                    </ListItem>
                  </Paper>
                ))}
              </List>
              {roiShapes.length === 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ display: 'block', mt: 1.5, fontSize: '0.65rem' }}
                >
                  No ROIs yet
                </Typography>
              )}
            </Box>

            <Box sx={{ p: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => {
                  if (roiShapes.length === 0) {
                    dispatch(
                      showToast({
                        id: crypto.randomUUID(),
                        message: getErrorMessage('Please draw at least one ROI region before saving.'),
                        severity: 'error',
                      })
                    );
                    return;
                  }
                  const canvas = canvasRef.current!;
                  const normalizedShapes = normalizeROI(roiShapes, canvas);
                  onSave(normalizedShapes);
                  onClose();
                }}
                disabled={roiShapes.length === 0}
                sx={{ mb: 0.5, fontSize: '0.7rem', py: 0.375, minHeight: '32px' }}
                size="small"
              >
                Save ({roiShapes.length})
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDrawerOpen(false)}
                sx={{ fontSize: '0.7rem', py: 0.375, minHeight: '32px' }}
                size="small"
              >
                Close
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Mode menu */}
        <Menu
          anchorEl={modeMenuAnchor}
          open={Boolean(modeMenuAnchor)}
          onClose={() => setModeMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => { setRoiMode('include'); setModeMenuAnchor(null); }}
            selected={roiMode === 'include'}
          >
            <IncludeIcon fontSize="small" style={{ marginRight: 4 }} />
            <Typography variant="body2">Include (Detect Zone)</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => { setRoiMode('exclude'); setModeMenuAnchor(null); }}
            selected={roiMode === 'exclude'}
          >
            <ExcludeIcon fontSize="small" style={{ marginRight: 4 }} />
            <Typography variant="body2">Exclude (Ignore Zone)</Typography>
          </MenuItem>
        </Menu>

        {/* Labels menu — drawing labels (multi-select) */}
        <Menu
          anchorEl={labelsMenuAnchor}
          open={Boolean(labelsMenuAnchor)}
          onClose={() => setLabelsMenuAnchor(null)}
        >
          {(labels.length ? labels : ['ROI']).map(label => {
            const isChecked = selectedLabels.includes(label);
            return (
              <MenuItem
                key={label}
                onClick={() => {
                  setSelectedLabels(isChecked
                    ? selectedLabels.filter(l => l !== label)
                    : [...selectedLabels, label]);
                }}
              >
                <Checkbox checked={isChecked} size="small" sx={{ p: 0, mr: 1 }} />
                {label}
              </MenuItem>
            );
          })}
        </Menu>

        {/* ROI context menu */}
        <Menu
          open={contextMenu !== null}
          onClose={() => setContextMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
        >
          <MenuItem
            onClick={() => {
              if (contextMenu) {
                setLabelMenu({ x: contextMenu.x, y: contextMenu.y, roiIndex: contextMenu.roiIndex });
                setContextMenu(null);
              }
            }}
          >
            <EditIcon fontSize="small" style={{ marginRight: 4 }} /> Edit Label
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (contextMenu !== null) { handleROIModeToggle(contextMenu.roiIndex); setContextMenu(null); }
            }}
          >
            <ToggleIcon fontSize="small" style={{ marginRight: 4 }} /> Toggle Include/Exclude
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (contextMenu !== null) {
                const currentIndex = ROI_COLORS.indexOf(roiShapes[contextMenu.roiIndex].color);
                handleROIColorChange(contextMenu.roiIndex, ROI_COLORS[(currentIndex + 1) % ROI_COLORS.length]);
              }
              setContextMenu(null);
            }}
          >
            <PaletteIcon fontSize="small" style={{ marginRight: 4 }} /> Change Color
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (contextMenu !== null) handleDeleteROI(contextMenu.roiIndex);
              setContextMenu(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" style={{ marginRight: 4 }} /> Delete ROI
          </MenuItem>
        </Menu>

        {/* Label picker */}
        <Menu
          open={labelMenu !== null}
          onClose={() => setLabelMenu(null)}
          anchorReference="anchorPosition"
          anchorPosition={labelMenu ? { top: labelMenu.y, left: labelMenu.x } : undefined}
        >
          {(labels.length > 0 ? labels : ['ROI']).map((opt) => {
            const currentLabels = labelMenu !== null ? (roiShapes[labelMenu.roiIndex]?.labels ?? []) : [];
            const isChecked = currentLabels.includes(opt);
            return (
              <MenuItem
                key={opt}
                onClick={() => {
                  if (labelMenu === null) return;
                  const existing = roiShapes[labelMenu.roiIndex]?.labels ?? [];
                  const newLabels = isChecked
                    ? existing.filter((l) => l !== opt)
                    : [...existing, opt];
                  handleROILabelChange(labelMenu.roiIndex, newLabels);
                }}
              >
                <Checkbox checked={isChecked} size="small" sx={{ p: 0, mr: 1 }} />
                {opt}
              </MenuItem>
            );
          })}
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

export default RoiSelectionModal;
