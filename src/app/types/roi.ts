export interface Point {
  x: number;
  y: number;
}

export type DrawingTool = 'rectangle' | 'polygon' | 'freehand';

export interface ROIShape {
  id:string
  type: DrawingTool;
  labels: string[];             // 👈 UI uses name
  mode: 'include' | 'exclude';
  points: Point[];
  completed: boolean;
  color: string;
}
