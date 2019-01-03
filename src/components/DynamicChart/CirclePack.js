/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated circle-pack
 @todo this is the component of testing
 */


import * as d3 from 'd3';

export class CircePack {
    constructor(props) {
        if (props == undefined) {
            this.state = {init: false};
            return this;
        }
        this.init(props);
        return this
    }

    init(props) {
        // alternative invocation
        //chart(chartDiv);
        // drive data into the chart roughly every second
        // in a normal use case, real time data would arrive through the network or some other mechanism
        let width = props.container.width;
        let height = props.container.height;
        this.state = {init: true, width, height}
        //console.log(this)
        // start the data generator for test
        // create the real time chart
        let circle_pack = this.circlePack();
        //.title("Real-time Sensor Chart")
        //.border(true)
        //.width(width)
        //.height(height)
        //.barWidth(1)

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "circle_pack")
            .style('display', 'inline-flex');

        sel.call(circle_pack);
        this.state.idx = 10;
        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = circle_pack;
        this.state.timeout = props.timeout;
        this.state.chart.update(this.getData());
        return this;
    }

    getComp() {
        return this.state.el;
    }

    // run demo for n times
    runDemo() {
        this.state.gen = true;
        let timeout = 3000;
        let self = this;
        //console.log('this',this)

        if (this.state.gen) {
            setTimeout(function(){
                self.state.chart.update(self.getData());
                self.runDemo();
                self.state.idx = self.state.idx - 1
            }, timeout);
        }
    }

    stopDemo() {
        this.state.gen = false;
    }

    circlePack() {
        var self = this;
        // settings
        let format = d3.format(",d"),
            timing = 500;

        let svgWidth = this.state.width, svgHeight = this.state.height, data, width = this.state.width,
            height = this.state.height, datum, border, chartTitle;

        let diameter = d3.max([svgHeight,svgWidth]) -4;

        var color = d3.scaleQuantile()
            .domain([0, 1])
            //.range(["#D3D3D3", "#D3D3D3", 'yellow', "red"]);
            .range(["#fef0d9", "#fdcc8a", '#fc8d59', "#e34a33", '#b30000']);

        var colorTitle = (d) => {
            let r = ['#65737e', '#a7adba', "#c0c5ce", "#eeeeee"];
            return r[d];
        };

        // define circle pack
        function chart(s) {
            let selection = s;
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }


            var pack = d3.pack()
                .size([svgWidth-4, svgHeight-4])

            var svg = selection.append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .classed('packed-circles',true);

            var vis = svg.append("g")
                .attr("transform", "translate(2, 2)");

            function update(vRoot) {
                if (!vRoot) return;

                pack(vRoot);

                vis.selectAll('*').remove();

                let circle = vis.selectAll("circle")
                    .data(vRoot.descendants() , (d)=>d)
                    .enter()
                    .append("circle")
                    .classed('node',true)
                    //.attr("r", 1e-6)
                    .attr("stroke", "black")
                    .attr("cx", function(d){ return d.x; })
                    .attr("cy", function(d){ return d.y; })
                    .style("fill", function (d) {
                        if (!d.children)
                            return color(d.data.r);
                        else
                            return colorTitle(d.depth);
                    })
                    .attr("r", function(d){ return d.value });

                return chart;
            }

            chart.update = update;
            chart.width = function (d) {
                if (arguments.length == 0) return svgWidth;
                svgWidth = d;
                return chart;
            };

            // svg height
            chart.height = function (d) {
                if (arguments.length == 0) return svgHeight;
                svgHeight = d;
                return chart;
            };

            // svg border
            chart.border = function (d) {
                if (arguments.length == 0) return border;
                border = d;
                return chart;
            };

            // chart title
            chart.title = function (d) {
                if (arguments.length == 0) return chartTitle;
                chartTitle = d;
                return chart;
            };

            return chart;


        } // end chart function

        // start circle pack

        //chart.update(this.getData());

        return chart;
    }

    // @todo remove this after testing
    getData() {
        let rnd = (t) => Math.round(Math.random() * 10000);
        let t = 1000;
        return {
            "name": "ewp",
            "children": [
                {
                    "name": "machine1",
                    "children": [
                        {
                            "name": "cluster",
                            "children": [
                                {"name": "AgglomerativeCluster", "v": rnd(t)},
                                {"name": "CommunityStructure", "v": rnd(t)},
                                {"name": "HierarchicalCluster", "v": rnd(t)},
                                {"name": "MergeEdge", "v": rnd(t)}
                            ]
                        },
                        {
                            "name": "graph",
                            "children": [
                                {"name": "BetweennessCentrality", "v": rnd(t)},
                                {"name": "LinkDistance", "v": rnd(t)},
                                {"name": "MaxFlowMinCut", "v": rnd(t)},
                                {"name": "ShortestPaths", "v": rnd(t)},
                                {"name": "SpanningTree", "v": rnd(t)}
                            ]
                        },
                        {
                            "name": "optimization",
                            "children": [
                                {"name": "AspectRatioBanker", "v": rnd(t)}
                            ]
                        }
                    ]
                },
                {
                    "name": "machine2",
                    "children": [
                        {"name": "Easing", "v": rnd(t)},
                        {"name": "FunctionSequence", "v": rnd(t)},
                        {
                            "name": "interpolate",
                            "children": [
                                {"name": "ArrayInterpolator", "v": rnd(t)},
                                {"name": "ColorInterpolator", "v": rnd(t)},
                                {"name": "DateInterpolator", "v": rnd(t)},
                                {"name": "Interpolator", "v": rnd(t)},
                                {"name": "MatrixInterpolator", "v": rnd(t)},
                                {"name": "NumberInterpolator", "v": rnd(t)},
                                {"name": "ObjectInterpolator", "v": rnd(t)},
                                {"name": "PointInterpolator", "v": rnd(t)},
                                {"name": "RectangleInterpolator", "v": rnd(t)}
                            ]
                        },
                        {"name": "ISchedulable", "v": rnd(t)},
                        {"name": "Parallel", "v": rnd(t)},
                        {"name": "Pause", "v": rnd(t)},
                        {"name": "Scheduler", "v": rnd(t)},
                        {"name": "Sequence", "v": rnd(t)},
                        {"name": "Transition", "v": rnd(t)},
                        {"name": "Transitioner", "v": rnd(t)},
                        {"name": "TransitionEvent", "v": rnd(t)},
                        {"name": "Tween", "v": rnd(t)}
                    ]
                },
                {
                    "name": "machine3",
                    "children": [
                        {
                            "name": "converters",
                            "children": [
                                {"name": "Converters", "v": rnd(t)},
                                {"name": "DelimitedTextConverter", "v": rnd(t)},
                                {"name": "GraphMLConverter", "v": rnd(t)},
                                {"name": "IDataConverter", "v": rnd(t)},
                                {"name": "JSONConverter", "v": rnd(t)}
                            ]
                        },
                        {"name": "DataField", "v": rnd(t)},
                        {"name": "DataSchema", "v": rnd(t)},
                        {"name": "DataSet", "v": rnd(t)},
                        {"name": "DataSource", "v": rnd(t)},
                        {"name": "DataTable", "v": rnd(t)},
                        {"name": "DataUtil", "v": rnd(t)}
                    ]
                },
                {
                    "name": "machine4",
                    "children": [
                        {"name": "DirtySprite", "v": rnd(t)},
                        {"name": "LineSprite", "v": rnd(t)},
                        {"name": "RectSprite", "v": rnd(t)},
                        {"name": "TextSprite", "v": rnd(t)}
                    ]
                },
                {
                    "name": "machine5",
                    "children": [
                        {"name": "FlareVis", "v": rnd(t)}
                    ]
                },
                {
                    "name": "machine6",
                    "children": [
                        {"name": "DragForce", "v": rnd(t)},
                        {"name": "GravityForce", "v": rnd(t)},
                        {"name": "IForce", "v": rnd(t)},
                        {"name": "NBodyForce", "v": rnd(t)},
                        {"name": "Particle", "v": rnd(t)},
                        {"name": "Simulation", "v": rnd(t)},
                        {"name": "Spring", "v": rnd(t)},
                        {"name": "SpringForce", "v": rnd(t)}
                    ]
                },
                {
                    "name": "machine7",
                    "children": [
                        {"name": "AggregateExpression", "v": rnd(t)},
                        {"name": "And", "v": rnd(t)},
                        {"name": "Arithmetic", "v": rnd(t)},
                        {"name": "Average", "v": rnd(t)},
                        {"name": "BinaryExpression", "v": rnd(t)},
                        {"name": "Comparison", "v": rnd(t)},
                        {"name": "CompositeExpression", "v": rnd(t)},
                        {"name": "Count", "v": rnd(t)},
                        {"name": "DateUtil", "v": rnd(t)},
                        {"name": "Distinct", "v": rnd(t)},
                        {"name": "Expression", "v": rnd(t)},
                        {"name": "ExpressionIterator", "v": rnd(t)},
                        {"name": "Fn", "v": rnd(t)},
                        {"name": "If", "v": rnd(t)},
                        {"name": "IsA", "v": rnd(t)},
                        {"name": "Literal", "v": rnd(t)},
                        {"name": "Match", "v": rnd(t)},
                        {"name": "Maximum", "v": rnd(t)},
                        {
                            "name": "methods",
                            "children": [
                                {"name": "add", "v": rnd(t)},
                                {"name": "and", "v": rnd(t)},
                                {"name": "average", "v": rnd(t)},
                                {"name": "count", "v": rnd(t)},
                                {"name": "distinct", "v": rnd(t)},
                                {"name": "div", "v": rnd(t)},
                                {"name": "eq", "v": rnd(t)},
                                {"name": "fn", "v": rnd(t)},
                                {"name": "gt", "v": rnd(t)},
                                {"name": "gte", "v": rnd(t)},
                                {"name": "iff", "v": rnd(t)},
                                {"name": "isa", "v": rnd(t)},
                                {"name": "lt", "v": rnd(t)},
                                {"name": "lte", "v": rnd(t)},
                                {"name": "max", "v": rnd(t)},
                                {"name": "min", "v": rnd(t)},
                                {"name": "mod", "v": rnd(t)},
                                {"name": "mul", "v": rnd(t)},
                                {"name": "neq", "v": rnd(t)},
                                {"name": "not", "v": rnd(t)},
                                {"name": "or", "v": rnd(t)},
                                {"name": "orderby", "v": rnd(t)},
                                {"name": "range", "v": rnd(t)},
                                {"name": "select", "v": rnd(t)},
                                {"name": "stddev", "v": rnd(t)},
                                {"name": "sub", "v": rnd(t)},
                                {"name": "sum", "v": rnd(t)},
                                {"name": "update", "v": rnd(t)},
                                {"name": "variance", "v": rnd(t)},
                                {"name": "where", "v": rnd(t)},
                                {"name": "xor", "v": rnd(t)},
                                {"name": "_", "v": rnd(t)}
                            ]
                        },
                        {"name": "Minimum", "v": rnd(t)},
                        {"name": "Not", "v": rnd(t)},
                        {"name": "Or", "v": rnd(t)},
                        {"name": "Query", "v": rnd(t)},
                        {"name": "Range", "v": rnd(t)},
                        {"name": "StringUtil", "v": rnd(t)},
                        {"name": "Sum", "v": rnd(t)},
                        {"name": "Variable", "v": rnd(t)},
                        {"name": "Variance", "v": rnd(t)},
                        {"name": "Xor", "v": rnd(t)}
                    ]
                },
                {
                    "name": "scale",
                    "children": [
                        {"name": "IScaleMap", "v": rnd(t)},
                        {"name": "LinearScale", "v": rnd(t)},
                        {"name": "LogScale", "v": rnd(t)},
                        {"name": "OrdinalScale", "v": rnd(t)},
                        {"name": "QuantileScale", "v": rnd(t)},
                        {"name": "QuantitativeScale", "v": rnd(t)},
                        {"name": "RootScale", "v": rnd(t)},
                        {"name": "Scale", "v": rnd(t)},
                        {"name": "ScaleType", "v": rnd(t)},
                        {"name": "TimeScale", "v": rnd(t)}
                    ]
                },
                {
                    "name": "util",
                    "children": [
                        {"name": "Arrays", "v": rnd(t)},
                        {"name": "Colors", "v": rnd(t)},
                        {"name": "Dates", "v": rnd(t)},
                        {"name": "Displays", "v": rnd(t)},
                        {"name": "Filter", "v": rnd(t)},
                        {"name": "Geometry", "v": rnd(t)},
                        {
                            "name": "heap",
                            "children": [
                                {"name": "FibonacciHeap", "v": rnd(t)},
                                {"name": "HeapNode", "v": rnd(t)}
                            ]
                        },
                        {"name": "IEvaluable", "v": rnd(t)},
                        {"name": "IPredicate", "v": rnd(t)},
                        {"name": "IValueProxy", "v": rnd(t)},
                        {
                            "name": "math",
                            "children": [
                                {"name": "DenseMatrix", "v": rnd(t)},
                                {"name": "IMatrix", "v": rnd(t)},
                                {"name": "SparseMatrix", "v": rnd(t)}
                            ]
                        },
                        {"name": "Maths", "v": rnd(t)},
                        {"name": "Orientation", "v": rnd(t)},
                        {
                            "name": "palette",
                            "children": [
                                {"name": "ColorPalette", "v": rnd(t)},
                                {"name": "Palette", "v": rnd(t)},
                                {"name": "ShapePalette", "v": rnd(t)},
                                {"name": "SizePalette", "v": rnd(t)}
                            ]
                        },
                        {"name": "Property", "v": rnd(t)},
                        {"name": "Shapes", "v": rnd(t)},
                        {"name": "Sort", "v": rnd(t)},
                        {"name": "Stats", "v": rnd(t)},
                        {"name": "Strings", "v": rnd(t)}
                    ]
                },
                {
                    "name": "vis",
                    "children": [
                        {
                            "name": "axis",
                            "children": [
                                {"name": "Axes", "v": rnd(t)},
                                {"name": "Axis", "v": rnd(t)},
                                {"name": "AxisGridLine", "v": rnd(t)},
                                {"name": "AxisLabel", "v": rnd(t)},
                                {"name": "CartesianAxes", "v": rnd(t)}
                            ]
                        },
                        {
                            "name": "controls",
                            "children": [
                                {"name": "AnchorControl", "v": rnd(t)},
                                {"name": "ClickControl", "v": rnd(t)},
                                {"name": "Control", "v": rnd(t)},
                                {"name": "ControlList", "v": rnd(t)},
                                {"name": "DragControl", "v": rnd(t)},
                                {"name": "ExpandControl", "v": rnd(t)},
                                {"name": "HoverControl", "v": rnd(t)},
                                {"name": "IControl", "v": rnd(t)},
                                {"name": "PanZoomControl", "v": rnd(t)},
                                {"name": "SelectionControl", "v": rnd(t)},
                                {"name": "TooltipControl", "v": rnd(t)}
                            ]
                        },
                        {
                            "name": "data",
                            "children": [
                                {"name": "Data", "v": rnd(t)},
                                {"name": "DataList", "v": rnd(t)},
                                {"name": "DataSprite", "v": rnd(t)},
                                {"name": "EdgeSprite", "v": rnd(t)},
                                {"name": "NodeSprite", "v": rnd(t)},
                                {
                                    "name": "render",
                                    "children": [
                                        {"name": "ArrowType", "v": rnd(t)},
                                        {"name": "EdgeRenderer", "v": rnd(t)},
                                        {"name": "IRenderer", "v": rnd(t)},
                                        {"name": "ShapeRenderer", "v": rnd(t)}
                                    ]
                                },
                                {"name": "ScaleBinding", "v": rnd(t)},
                                {"name": "Tree", "v": rnd(t)},
                                {"name": "TreeBuilder", "v": rnd(t)}
                            ]
                        },
                        {
                            "name": "events",
                            "children": [
                                {"name": "DataEvent", "v": rnd(t)},
                                {"name": "SelectionEvent", "v": rnd(t)},
                                {"name": "TooltipEvent", "v": rnd(t)},
                                {"name": "VisualizationEvent", "v": rnd(t)}
                            ]
                        },
                        {
                            "name": "legend",
                            "children": [
                                {"name": "Legend", "v": rnd(t)},
                                {"name": "LegendItem", "v": rnd(t)},
                                {"name": "LegendRange", "v": rnd(t)}
                            ]
                        },
                        {
                            "name": "operator",
                            "children": [
                                {
                                    "name": "distortion",
                                    "children": [
                                        {"name": "BifocalDistortion", "v": rnd(t)},
                                        {"name": "Distortion", "v": rnd(t)},
                                        {"name": "FisheyeDistortion", "v": rnd(t)}
                                    ]
                                },
                                {
                                    "name": "encoder",
                                    "children": [
                                        {"name": "ColorEncoder", "v": rnd(t)},
                                        {"name": "Encoder", "v": rnd(t)},
                                        {"name": "PropertyEncoder", "v": rnd(t)},
                                        {"name": "ShapeEncoder", "v": rnd(t)},
                                        {"name": "SizeEncoder", "v": rnd(t)}
                                    ]
                                },
                                {
                                    "name": "filter",
                                    "children": [
                                        {"name": "FisheyeTreeFilter", "v": rnd(t)},
                                        {"name": "GraphDistanceFilter", "v": rnd(t)},
                                        {"name": "VisibilityFilter", "v": rnd(t)}
                                    ]
                                },
                                {"name": "IOperator", "v": rnd(t)},
                                {
                                    "name": "label",
                                    "children": [
                                        {"name": "Labeler", "v": rnd(t)},
                                        {"name": "RadialLabeler", "v": rnd(t)},
                                        {"name": "StackedAreaLabeler", "v": rnd(t)}
                                    ]
                                },
                                {
                                    "name": "layout",
                                    "children": [
                                        {"name": "AxisLayout", "v": rnd(t)},
                                        {"name": "BundledEdgeRouter", "v": rnd(t)},
                                        {"name": "CircleLayout", "v": rnd(t)},
                                        {"name": "CirclePackingLayout", "v": rnd(t)},
                                        {"name": "DendrogramLayout", "v": rnd(t)},
                                        {"name": "ForceDirectedLayout", "v": rnd(t)},
                                        {"name": "IcicleTreeLayout", "v": rnd(t)},
                                        {"name": "IndentedTreeLayout", "v": rnd(t)},
                                        {"name": "Layout", "v": rnd(t)},
                                        {"name": "NodeLinkTreeLayout", "v": rnd(t)},
                                        {"name": "PieLayout", "v": rnd(t)},
                                        {"name": "RadialTreeLayout", "v": rnd(t)},
                                        {"name": "RandomLayout", "v": rnd(t)},
                                        {"name": "StackedAreaLayout", "v": rnd(t)},
                                        {"name": "TreeMapLayout", "v": rnd(t)}
                                    ]
                                },
                                {"name": "Operator", "v": rnd(t)},
                                {"name": "OperatorList", "v": rnd(t)},
                                {"name": "OperatorSequence", "v": rnd(t)},
                                {"name": "OperatorSwitch", "v": rnd(t)},
                                {"name": "SortOperator", "v": rnd(t)}
                            ]
                        },
                        {"name": "Visualization", "v": rnd(t)}
                    ]
                }
            ]
        };
    };
}

