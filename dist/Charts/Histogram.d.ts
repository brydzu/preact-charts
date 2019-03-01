import { Component } from 'preact';
import { DataArray, Margin } from '../types';
interface HistogramProps {
    name: string;
    height?: number;
    width?: number;
    margin?: Margin;
    x: string;
    data: DataArray;
    ticks?: number;
    barColour?: string;
    barOutline?: string;
}
interface HistogramDefaultProps {
    height: number;
    width: number;
    margin: Margin;
    ticks: number;
    barColour: string;
    barOutline: string;
}
interface HistogramState {
    width: number;
    innerWidth: number;
    height: number;
    innerHeight: number;
}
export declare class Histogram extends Component<HistogramProps, HistogramState> {
    static defaultProps: HistogramDefaultProps;
    private chartSVG;
    private resizeOb;
    constructor(props: HistogramProps);
    render({ name, margin, x, data, ticks, barColour, barOutline }: HistogramProps, { height, width, innerHeight, innerWidth }: HistogramState): JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private resizeChart;
}
export {};
