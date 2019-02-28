import { h, Component } from 'preact';
import { Axis } from '../../Axis';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { select, event } from 'd3-selection';
import { brush } from 'd3-brush';
import { line, curveNatural } from 'd3-shape';
import { colourArray } from '../../colors';
export class LineScatter extends Component {
    constructor(props) {
        super(props);
        const innerWidth = props.width - props.margin.left - props.margin.right;
        const innerHeight = props.height - props.margin.top - props.margin.bottom;
        const flatData = props.data.flat();
        const xDomain = extent(flatData, (d) => d[props.x]);
        const xDomainPadded = [xDomain[0] * 0.95, xDomain[1] * 1.05];
        const yDomain = extent(flatData, (d) => d[props.y]);
        const yDomainPadded = [yDomain[0] * 0.95, yDomain[1] * 1.05];
        this.state = {
            width: props.width,
            height: props.height,
            innerWidth,
            innerHeight,
            xDomain: xDomainPadded,
            yDomain: yDomainPadded,
        };
    }
    render(props, { height, width, innerHeight, innerWidth, xDomain, yDomain }) {
        this.xScale = scaleLinear()
            .range([0, innerWidth])
            .domain(xDomain);
        this.yScale = scaleLinear()
            .range([innerHeight, 0])
            .domain(yDomain);
        const lineFunc = line()
            .x((d) => this.xScale(d[props.x]))
            .y((d) => this.yScale(d[props.y]))
            .curve(curveNatural);
        return (h("svg", { ref: (svg) => this.chartSVG = svg, class: props.name, height: height, width: width },
            h("g", { transform: `translate(${props.margin.left}, ${props.margin.top})` },
                h("clipPath", { id: `${props.name}_cp` },
                    h("rect", { width: innerWidth, height: innerHeight })),
                h(Axis, { height: innerHeight, axisType: 'x', scale: this.xScale, grid: true }),
                h(Axis, { width: innerWidth, axisType: 'y', scale: this.yScale, grid: true }),
                props.data.map((dArray, groupIdx) => (h("g", null,
                    h("path", { class: 'line', d: lineFunc(dArray), "clip-path": `url(#${props.name}_cp)`, "stroke-linecap": 'round', stroke: colourArray[groupIdx], fill: 'none', "stroke-width": '2px' }),
                    dArray.map((point, index) => h("circle", { class: 'dot', r: props.radius, cx: this.xScale(point[props.x]), cy: this.yScale(point[props.y]), key: index, fill: colourArray[groupIdx], "clip-path": `url(#${props.name}_cp)` }))))),
                props.labels &&
                    h("text", { class: 'label', x: innerWidth / 2, y: innerHeight + props.margin.bottom - 15 }, props.x.replace(/_/g, ' ')),
                props.labels &&
                    h("text", { class: 'label', x: -innerHeight / 2, y: -props.margin.left + 15, transform: 'rotate(-90)' }, props.y.replace(/_/g, ' ')),
                props.legendReference &&
                    props.legendReference.map((title, idx) => h("g", { transform: `translate(0, ${idx * 20})` },
                        h("rect", { x: innerWidth + props.margin.right - 18, width: 18, height: 15, stroke: 'black', strokeWidth: '1px', fill: colourArray[idx] }),
                        h("text", { class: 'label', x: innerWidth + props.margin.right - 24, y: 9, dy: '0.35em', "text-anchor": 'end' }, title.replace(/_/g, ' ')))),
                h("g", { ref: (brushRef) => this.brush = brushRef, key: 1 }))));
    }
    componentDidMount() {
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
    }
    componentWillReceiveProps(newProps, newState) {
        const flatData = newProps.data.flat();
        const xDomain = extent(flatData, (d) => d[newProps.x]);
        const xDomainPadded = [xDomain[0] * 0.95, xDomain[1] * 1.05];
        const yDomain = extent(flatData, (d) => d[newProps.y]);
        const yDomainPadded = [yDomain[0] * 0.95, yDomain[1] * 1.05];
        this.setState({ yDomain: yDomainPadded, xDomain: xDomainPadded });
    }
    componentWillUnmount() {
        this.resizeOb.disconnect();
    }
    resizeChart() {
        const parent = this.chartSVG.parentElement;
        const cr = parent.getBoundingClientRect();
        const width = cr.width;
        const height = cr.height;
        const innerWidth = width - this.props.margin.left - this.props.margin.right;
        const innerHeight = height - this.props.margin.top - this.props.margin.bottom;
        this.brushSetup = brush()
            .extent([
            [0, 0],
            [innerWidth, innerHeight],
        ])
            .handleSize(10)
            .on('end', () => {
            const s = event.selection;
            if (s === null) {
                const flatData = this.props.data.flat();
                const xDomain = extent(flatData, (d) => d[this.props.x]);
                const xDomainPadded = [xDomain[0] * 0.95, xDomain[1] * 1.05];
                const yDomain = extent(flatData, (d) => d[this.props.y]);
                const yDomainPadded = [yDomain[0] * 0.95, yDomain[1] * 1.05];
                this.setState({ xDomain: xDomainPadded, yDomain: yDomainPadded });
            }
            else {
                const xDomain = [s[0][0], s[1][0]].map(this.xScale.invert, this.xScale);
                const yDomain = [s[1][1], s[0][1]].map(this.yScale.invert, this.yScale);
                select(this.brush).call(this.brushSetup.move, null);
                this.setState({ xDomain, yDomain });
            }
        });
        select(this.brush).call(this.brushSetup);
        this.setState({ innerWidth, innerHeight, height, width });
    }
}
LineScatter.defaultProps = {
    height: 500,
    width: 500,
    margin: {
        top: 25,
        right: 25,
        bottom: 75,
        left: 75,
    },
    radius: 5,
    labels: false,
};
//# sourceMappingURL=index.js.map