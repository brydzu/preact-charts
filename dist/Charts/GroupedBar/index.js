import { h, Component } from 'preact';
import { Axis } from '../../Axis';
import { scaleLinear, scaleBand, scaleOrdinal } from 'd3-scale';
import { max } from 'd3-array';
import { pluckUnique } from '../../Utils/pluck';
import { colourArray } from '../../colors';
export class GroupedBar extends Component {
    constructor(props) {
        super(props);
        this.createBars = (x0, x1, y, height, groups, colourScale) => {
            return groups.map((group) => h("g", { transform: `translate(${x0(group)}, 0)` }, this.props.data[group].map((entry) => h("rect", { width: x1.bandwidth(), x: x1(entry.name), y: y(entry.value), height: height - y(entry.value), fill: colourScale(entry.name), title: entry.value.toFixed(4) }))));
        };
        const innerWidth = props.width - props.margin.right - props.margin.left;
        const innerHeight = props.height - props.margin.top - props.margin.bottom;
        this.state = {
            height: props.height,
            innerHeight,
            width: props.width,
            innerWidth,
        };
    }
    render({ margin, ticks, data, groups, legendReference, name }, { height, width, innerHeight, innerWidth }) {
        let yMax = 0;
        for (const key of groups) {
            const groupMax = max(data[key], (d) => d.value);
            yMax = groupMax > yMax ? groupMax : yMax;
        }
        const names = pluckUnique(data[groups[0]], 'name');
        const yScale = scaleLinear()
            .range([innerHeight, 0])
            .domain([0, yMax])
            .nice();
        const xScale = scaleBand()
            .rangeRound([0, innerWidth])
            .paddingInner(0.1)
            .domain(groups);
        const x1 = scaleBand()
            .padding(0.05)
            .domain(names)
            .rangeRound([0, xScale.bandwidth()]);
        const colourScale = scaleOrdinal(colourArray);
        return (h("svg", { ref: (svg) => this.chartSVG = svg, class: name, height: height, width: width },
            h("g", { transform: `translate(${margin.left}, ${margin.top})` },
                h(Axis, { height: innerHeight, axisType: 'x', scale: xScale, rotateScaleText: true }),
                h(Axis, { width: innerWidth, axisType: 'y', scale: yScale, grid: true, ticks: ticks }),
                data &&
                    this.createBars(xScale, x1, yScale, innerHeight, groups, colourScale),
                names &&
                    names.map((barName, idx) => h("g", { transform: `translate(0, ${idx * 20})` },
                        h("rect", { x: innerWidth + margin.right - 18, width: 18, height: 15, strokeWidth: '1px', fill: colourScale(barName) }),
                        h("text", { x: innerWidth + margin.right - 24, y: 9, dy: '0.35em', "text-anchor": 'end' }, legendReference[barName]))))));
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
        this.setState({ innerWidth, innerHeight, height, width });
    }
}
GroupedBar.defaultProps = {
    height: 500,
    width: 500,
    margin: {
        top: 25,
        right: 25,
        bottom: 75,
        left: 50,
    },
    ticks: 6,
};
//# sourceMappingURL=index.js.map