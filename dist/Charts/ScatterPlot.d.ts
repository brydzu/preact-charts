import { Component } from 'preact';
import { Margin, DataArray } from '../types';
interface ScatterPlotProps {
    name: string;
    x: string;
    y: string;
    data: DataArray;
    height?: number;
    width?: number;
    margin?: Margin;
    radius?: number;
    labels?: boolean;
    dotFill?: string;
    dotBorder?: string;
}
interface ScatterPlotDefaultProps {
    height: number;
    width: number;
    margin: Margin;
    radius: number;
    labels: boolean;
    dotFill: string;
    dotBorder: string;
}
interface ScatterPlotState {
    width: number;
    innerWidth: number;
    height: number;
    innerHeight: number;
    xDomain: [number, number];
    yDomain: [number, number];
}
export declare class ScatterPlot extends Component<ScatterPlotProps, ScatterPlotState> {
    static defaultProps: ScatterPlotDefaultProps;
    private chartSVG;
    private resizeOb;
    private brush;
    private brushSetup;
    private xScale;
    private yScale;
    constructor(props: ScatterPlotProps);
    render(props: ScatterPlotProps, { height, width, innerHeight, innerWidth, xDomain, yDomain }: ScatterPlotState): JSX.Element;
    componentDidMount(): void;
    componentWillReceiveProps(newProps: ScatterPlotProps, newState: ScatterPlotState): void;
    componentWillUnmount(): void;
    private resizeChart;
}
export {};
