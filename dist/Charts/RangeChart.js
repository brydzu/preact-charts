import { h, Component } from 'preact';
import { scaleLinear, scaleTime } from 'd3-scale';
import { Axis } from '../Axis';
import { area } from 'd3-shape';
import { min, max } from 'd3-array';
import { select, event } from 'd3-selection';
import { brushX } from 'd3-brush';
import { style } from 'typestyle';
export class RangeChart extends Component {
    constructor(props) {
        super(props);
        this.componentDidMount = () => {
            this.resizeChart();
            this.resizeOb = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const cr = entry.contentRect;
                    const width = cr.width;
                    const height = cr.height;
                    if (width !== this.state.width || height !== this.state.height) {
                        this.resizeChart();
                    }
                }
            });
            this.resizeOb.observe(this.chartSVG.parentElement);
        };
        this.brushClass = style({
            $nest: {
                '&>rect.handle': {
                    fill: props.brushColour,
                },
            },
        });
        const innerWidth = props.width - props.margin.left - props.margin.right;
        const innerHeight = props.height - props.margin.top - props.margin.bottom;
        this.state = {
            width: props.width,
            height: props.height,
            innerWidth,
            innerHeight,
        };
    }
    render(props, { width, height, innerWidth, innerHeight }) {
        this.xScale = scaleTime()
            .range([0, innerWidth])
            .domain([min(props.data, (d) => d.timestamp), max(props.data, (d) => d.timestamp)]);
        const yScale = scaleLinear()
            .range([innerHeight, 0])
            .domain([min(props.data, (d) => +d[props.y]), max(props.data, (d) => +d[props.y])]);
        const areaFunc = area()
            .x((d) => this.xScale(d.timestamp))
            .y0(innerHeight)
            .y1((d) => yScale(+d[props.y]));
        return (h("svg", { ref: (svg) => this.chartSVG = svg, class: props.name, height: height, width: width },
            h("g", { transform: `translate(${props.margin.left}, ${props.margin.top})` },
                h(Axis, { height: innerHeight, axisType: 'x', scale: this.xScale }),
                h(Axis, { width: innerWidth, axisType: 'y', scale: yScale, grid: true, ticks: 0 }),
                h("path", { d: areaFunc(props.data), "stroke-linecap": 'round', stroke: props.lineColour, fill: props.fillColour, "stroke-width": '1px' }),
                h("g", { ref: (brush) => this.brush = brush, class: this.brushClass }))));
    }
    componentWillUnmount() {
        this.resizeOb.disconnect();
        select(this.brush).call(this.brushSetup.move, null);
    }
    resizeChart() {
        const parent = this.chartSVG.parentElement;
        const cr = parent.getBoundingClientRect();
        const width = cr.width;
        const height = cr.height;
        const innerWidth = width - this.props.margin.left - this.props.margin.right;
        const innerHeight = height - this.props.margin.top - this.props.margin.bottom;
        this.xScale.range([0, innerWidth]);
        this.brushSetup = brushX()
            .extent([
            [0, 0],
            [innerWidth, innerHeight],
        ])
            .handleSize(10)
            .on('end', () => {
            const selection = (event.selection || [0, innerWidth]);
            const inverted = [this.xScale.invert(selection[0]), this.xScale.invert(selection[1])];
            this.setState({ extent: event.selection ? inverted : null });
            this.props.onBrush(inverted);
        });
        const brushSelection = select(this.brush);
        brushSelection.call(this.brushSetup);
        const brushMove = (this.state.extent === null || this.state.extent === undefined) ?
            null :
            [this.xScale(this.state.extent[0]), this.xScale(this.state.extent[1])];
        brushSelection.call(this.brushSetup.move, brushMove);
        this.setState({ innerWidth, innerHeight, height, width });
    }
}
RangeChart.defaultProps = {
    height: 200,
    width: 1000,
    margin: {
        top: 25,
        right: 25,
        bottom: 75,
        left: 75,
    },
    lineColour: 'steelblue',
    fillColour: 'steelblue',
    onBrush: () => { },
    brushColour: 'darkgoldenrod',
};
//# sourceMappingURL=RangeChart.js.map