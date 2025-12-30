// Archivo de tipos para Recharts para resolver problemas de TypeScript
declare module 'recharts' {
  import { ComponentType } from 'react';
  
  export interface ChartProps {
    width?: number;
    height?: number;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: React.ReactNode;
    layout?: 'horizontal' | 'vertical';
    syncId?: string;
    compact?: boolean;
  }
  
  export interface AxisProps {
    dataKey?: string;
    axisLine?: boolean;
    tickLine?: boolean;
    tick?: boolean | ComponentType<any> | React.CSSProperties;
    tickFormatter?: (value: any) => string;
    tickMargin?: number;
    tickCount?: number;
    domain?: [number, number] | ((dataMin: number, dataMax: number) => [number, number]);
    type?: 'number' | 'category';
    allowDataOverflow?: boolean;
    allowDecimals?: boolean;
    allowDuplicatedCategory?: boolean;
    tickFontSize?: number;
    fontSize?: number;
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    angle?: number;
    textAnchor?: string;
    height?: number;
    stroke?: string;
    width?: number;
    tickLine?: boolean;
  }
  
  export interface TooltipProps {
    active?: boolean;
    coordinate?: { x: number; y: number };
    cursor?: boolean | ComponentType<any> | {
      stroke?: string;
      strokeDasharray?: string;
    };
    label?: any;
    labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
    labelStyle?: React.CSSProperties;
    itemStyle?: React.CSSProperties;
    content?: ComponentType<any>;
    itemSorter?: (item: any) => number;
    position?: { x: number; y: number };
    separator?: string;
    sort?: boolean;
    viewBox?: { x: number; y: number; width: number; height: number };
    filterNull?: boolean;
    formatter?: (value: any, name: any, props: any) => [React.ReactNode, string];
    payload?: any[];
    labelClassName?: string;
    wrapperClassName?: string;
    contentStyle?: React.CSSProperties;
    viewBoxStyle?: React.CSSProperties;
    cursorStyle?: React.CSSProperties;
  }
  
  export interface ResponsiveContainerProps {
    aspect?: number;
    width?: string | number;
    height?: string | number;
    minHeight?: number;
    minWidth?: number;
    maxHeight?: number;
    debounce?: number;
    children?: React.ReactNode;
  }
  
  export interface LineProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey?: string | number;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
    strokeDasharray?: string;
    strokeOpacity?: number;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'round' | 'miter' | 'bevel';
    dot?: boolean | ComponentType<any> | React.ReactNode | {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      r?: number;
    };
    activeDot?: boolean | ComponentType<any> | React.ReactNode | {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      r?: number;
    };
    legendType?: 'line' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
    hide?: boolean;
    connectNulls?: boolean;
    curve?: ComponentType<any>;
    points?: Array<{ x: number; y: number; value: any }>;
    layout?: 'horizontal' | 'vertical';
    label?: any;
    name?: string | number;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    animationBegin?: number;
    id?: string;
    className?: string;
  }
  
  export interface BarProps {
    layout?: 'horizontal' | 'vertical';
    dataKey?: string | number;
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
    strokeWidth?: number;
    strokeDasharray?: string;
    stackId?: string;
    maxBarSize?: number;
    cornerRadius?: number | [number, number, number, number];
    radius?: number | [number, number, number, number];
    minPointSize?: number;
    hide?: boolean;
    legendType?: 'line' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
    tooltip?: boolean;
    name?: string | number;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    animationBegin?: number;
    id?: string;
    className?: string;
  }
  
  export interface AreaProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey?: string | number;
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
    strokeWidth?: number;
    strokeDasharray?: string;
    stackId?: string;
    connectNulls?: boolean;
    curve?: ComponentType<any>;
    label?: any;
    name?: string | number;
    hide?: boolean;
    legendType?: 'line' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    animationBegin?: number;
    id?: string;
    className?: string;
    dot?: boolean | ComponentType<any> | React.ReactNode;
    activeDot?: boolean | ComponentType<any> | React.ReactNode;
  }
  
  export interface PieProps {
    data?: any[];
    dataKey?: string | number;
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    fill?: string;
    startAngle?: number;
    endAngle?: number;
    paddingAngle?: number;
    nameKey?: string | number;
    valueKey?: string | number;
    cornerRadius?: number | string;
    activeIndex?: number | number[];
    activeShape?: ComponentType<any> | React.ReactNode;
    inactiveShape?: ComponentType<any> | React.ReactNode;
    stroke?: string;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    animationBegin?: number;
    label?: boolean | ComponentType<any> | ((entry: any, index: number) => React.ReactNode);
    labelLine?: boolean | ComponentType<any> | {
      stroke?: string;
      strokeWidth?: number;
      lineCap?: 'butt' | 'round' | 'square';
    };
    legendType?: 'line' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
    tooltip?: boolean;
    minAngle?: number;
    blendStroke?: boolean;
    onClick?: (event: any, data: any) => void;
    onMouseEnter?: (event: any, data: any) => void;
    onMouseLeave?: (event: any, data: any) => void;
    id?: string;
    className?: string;
    children?: React.ReactNode;
  }
  
  export interface CellProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onClick?: (event: any, data: any) => void;
    onMouseEnter?: (event: any, data: any) => void;
    onMouseLeave?: (event: any, data: any) => void;
  }
  
  export interface ScatterProps {
    data?: any[];
    dataKey?: string | number;
    xAxisId?: number | string;
    yAxisId?: number | string;
    line?: boolean | ComponentType<any>;
    shape?: ComponentType<any> | React.ReactNode | 'circle' | 'rect' | 'roundRect' | 'diamond' | 'triangle' | 'cross' | 'star' | 'wye';
    legendType?: 'line' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
    tooltip?: boolean;
    hide?: boolean;
    id?: string;
    className?: string;
  }
  
  export interface RadarProps {
    data?: any[];
    dataKey?: string | number;
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
    strokeWidth?: number;
    dot?: boolean | ComponentType<any>;
    activeDot?: boolean | ComponentType<any>;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    animationBegin?: number;
    nameKey?: string | number;
    id?: string;
    className?: string;
  }
  
  export interface PolarGridProps {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    polarAngles?: number[];
    polarRadius?: number[];
    radialLines?: boolean;
    gridType?: 'polygon' | 'circle';
    radialLinesConfig?: {
      stroke?: string;
      strokeWidth?: number;
      strokeOpacity?: number;
    };
  }
  
  export interface PolarAngleAxisProps {
    cx?: number;
    cy?: number;
    radius?: number;
    axisLineType?: 'polygon' | 'circle';
    dataKey?: string | number;
    tick?: boolean | ComponentType<any>;
    tickFormatter?: (value: any) => string;
    tickMargin?: number;
    className?: string;
  }
  
  export interface PolarRadiusAxisProps {
    cx?: number;
    cy?: number;
    radius?: number;
    axisLineType?: 'polygon' | 'circle';
    orientation?: 'left' | 'right' | 'middle';
    tick?: boolean | ComponentType<any>;
    tickFormatter?: (value: any) => string;
    tickCount?: number;
    domain?: [number, number] | ((dataMin: number, dataMax: number) => [number, number]);
    allowDataOverflow?: boolean;
    allowDecimals?: boolean;
    allowDuplicatedCategory?: boolean;
    tickMargin?: number;
    className?: string;
  }
  
  export interface LegendProps {
    content?: ComponentType<any>;
    wrapperStyle?: React.CSSProperties;
    chartWidth?: number;
    chartHeight?: number;
    iconSize?: number;
    iconType?: 'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    payload?: Array<{
      type?: 'line' | 'plainline' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
      id?: string;
      value?: string;
      color?: string;
      className?: string;
    }>;
    formatter?: (value: any, entry: any, index: number) => React.ReactNode;
    formatterValue?: (value: any) => React.ReactNode;
    formatterName?: (name: any) => React.ReactNode;
    filterNull?: boolean;
    gutter?: number;
    itemStyle?: React.CSSProperties;
    selected?: boolean;
  }
  
  export const LineChart: ComponentType<ChartProps>;
  export const BarChart: ComponentType<ChartProps>;
  export const AreaChart: ComponentType<ChartProps>;
  export const PieChart: ComponentType<ChartProps>;
  export const ScatterChart: ComponentType<ChartProps>;
  export const RadarChart: ComponentType<ChartProps>;
  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const XAxis: ComponentType<AxisProps>;
  export const YAxis: ComponentType<AxisProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const Legend: ComponentType<LegendProps>;
  export const CartesianGrid: ComponentType<{
    stroke?: string;
    strokeDasharray?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    fill?: string;
    fillOpacity?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    horizontal?: boolean;
    vertical?: boolean;
    horizontalPoints?: number[];
    verticalPoints?: number[];
  }>;
  export const Line: ComponentType<LineProps>;
  export const Bar: ComponentType<BarProps>;
  export const Area: ComponentType<AreaProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
  export const Scatter: ComponentType<ScatterProps>;
  export const Radar: ComponentType<RadarProps>;
  export const PolarGrid: ComponentType<PolarGridProps>;
  export const PolarAngleAxis: ComponentType<PolarAngleAxisProps>;
  export const PolarRadiusAxis: ComponentType<PolarRadiusAxisProps>;
  export const Brush: ComponentType<{
    data?: any[];
    height?: number;
    width?: number;
    x?: number;
    y?: number;
    travellerWidth?: number;
    gap?: number;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    fillOpacity?: number;
    startIndex?: number;
    endIndex?: number;
    Traveller?: ComponentType<any>;
    Text?: ComponentType<any>;
  }>;
}