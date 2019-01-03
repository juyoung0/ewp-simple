/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated treemap
 */
import * as d3 from 'd3';
import 'd3-scale-chromatic';
import './sunburst.css';

export class SunBurst {
    constructor(props) {
        if (props == undefined) {
            this.state = {init: false};
            return this;
        }
        this.init(props);
        return this
    }

    init(props) {
        let width = props.container.width;
        let height = props.container.height;
        let datahub = props.datahub;
        let eventhub = props.eventhub;
        let parent = props.container.el;
        this.state = {init: true, width, height, datahub, eventhub,parent};
        this.state.root = "EWP";
        let sunburst = this.sunburst();

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "sunburst")
            .style('display', 'inline-flex');

        sel.call(sunburst);
        this.state.idx = 10;
        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = sunburst;
        this.state.timeout = props.timeout;
        this.state.level = 0.6;
        //this.state.chart.update(this.getData());
        return this;
    }

    getComp() {
        return this.state.el;
    }

    // run demo for n times
    runDemo() {
        this.state.gen = true;
        let timeout = 6000;
        let self = this;
        //////console.log('this',this)
        self.state.chart.update(self.state.datahub.getTreemapData());
        return;

        if (this.state.gen) {
            setTimeout(function () {
                //self.state.chart.update(self.getData());
                self.state.chart.update(self.state.datahub.getTreemapData());
                self.runDemo();
                self.state.idx = self.state.idx - 1
            }, timeout);
        }
    }

    stopDemo() {
        this.state.gen = false;
    }

    sunburst() {
        let self = this;
        // settings
        let format = d3.format(",d"),
            timing = 500;

        let svgWidth = this.state.width, svgHeight = this.state.height, data, width = this.state.width,
            height = this.state.height, datum, border, chartTitle;

        function hovered(hover) {
            //console.log(hover)
            return function (d) {
                let item = '#' + "error_chart_" + d.data.name;
                if (hover) {
                    let item = '#' + "error_chart_" + d.data.name;
                    d3.selectAll('.node-sunburst')
                        .classed('active', false);
                    d3.select(this).select('rect')
                        .classed('active', true);
                    d3.select(item)
                        .classed('hovered', true)
                }
                else {
                    d3.select(this).select('rect')
                        .classed('active', false);
                    d3.select(item)
                        .classed('hovered', false)
                }
            };
        }

        // define sunburst
        function chart(s) {
            ////console.log('test', obj_self)
            let selection = s;
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }

            var radius = (Math.min(width, height) / 2) - 10;


            var x = d3.scaleLinear()
                .range([0, 2 * Math.PI]);

            var y = d3.scaleSqrt()
                .range([0, radius]);
/*
            var color = d3.scaleQuantile()
                .domain([0, 1])
                //.range(["#D3D3D3", "#D3D3D3", 'yellow', "red"]);
                .range(["#fef0d9", "#fdcc8a", '#fc8d59', "#e34a33", '#b30000']);
                */
            var colors = ["#fef0d9", "#fdcc8a", '#fc8d59', "#e34a33", '#b30000', '#670000'];
            function color(t) {
                if (0 <= t && t < 0.01) {
                    return colors[0];
                }
                if (0.01 <= t && t < 0.02) {
                    return colors[1];
                }
                if (0.02 <= t && t < 0.03) {
                    return colors[2];
                }
                if (0.03 <= t && t < 0.04) {
                    return colors[3];
                }
                if (0.04 <= t && t < 0.05) {
                    return colors[4];
                }
                if (t >= 0.05) {
                    return colors[5];
                }
            }

            ////console.log(d3.schemeCategory10);
            /*
                        var colorTitle = (d)=>{
                            let r = ['#65737e','#a7adba',"#c0c5ce","#eeeeee"];
                            return r[d];
                        };
            */
            var colorTitle = d3.scaleOrdinal(['#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b', '#F012BE', '#B10DC9', '#111111', '#AAAAAA', '#DDDDDD']);

            var partition = d3.partition();

            var arc = d3.arc()
                .startAngle(function (d) {
                    return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
                })
                .endAngle(function (d) {
                    return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
                })
                .innerRadius(function (d) {
                    return Math.max(0, y(d.y0));
                })
                .outerRadius(function (d) {
                    return Math.max(0, y(d.y1));
                });

            ////console.log(obj_self.state, width, height);

            let rad = d3.min([width,height]);

            var svg = selection.append("svg")
                .attr("width", rad)
                .attr("height", rad)
                .style('background','white')
                .append("g")
                .attr("transform", "translate(" + (rad/2) + "," + (rad / 2) + ")");

            let find_idx = (name, 호기) => {

                let currentRank = self.state.datahub.state.currentRank.filter(d => {
                    return self.state.datahub.state.currentRoot.nameSet.has(d.name)
                });
                let idx = currentRank.findIndex(d => {
                    return (name == d.name && 호기 == d.호기)
                });
                self.state.eventhub.small_multi.state.cur_idx = idx;
                self.state.eventhub.small_multi.state.chart.update(self.state.datahub.state);
            }

            function update(root) {
                if (!root) return;
                ////console.log(root, 'sunburst');
                svg.selectAll('*').remove();
                svg.selectAll(".node-sunburst")
                    .data(partition(root).descendants())
                    .enter().append("path")
                    .classed('node-sunburst',true)
                    .attr("d", arc)
                    .style("fill", function (d) {
                        //return color((d.children ? d : d.parent).data.r);
                        if (!d.children)
                            return color(d.data.r);
                        else
                            return colorTitle((d.children ? d : d.parent).data.name);
                    })
                    .attr("id", function (d) {
                        return "sunburst-" + d.data.name + '-' + d.data.호기;
                    })
                    .style('stroke', '#333')
                    .style('stroke-width', (d) => {
                        if (!d.children)
                            return 0.1;
                        else
                            return 1;
                    })
                    .on("mouseover", hovered(true))
                    .on("mouseout", hovered(false))
                    .on('click', function (d) {
                        //console.log('clicked')
                        if (d.children) return;
                        let item = '#' + "error_chart_" + d.data.name + '-' + d.data.호기;
                        let thisItem = d3.select(this);
                        self.state.datahub.state.currentRoot.selected_name = d.data.name;
                        self.state.datahub.state.currentRoot.selected_machine = d.data.호기;
                        find_idx(d.data.name, d.data.호기);
                        location.hash = item;
                        if (thisItem.classed('selected')) {
                            thisItem
                                .classed('selected', false);
                            d3.selectAll('.small_multi')
                                .classed('selected', false);
                            d3.selectAll('.node-rect')
                                .classed('selected',false);
                            self.state.datahub.state.currentRoot.selected_name = null;
                            self.state.datahub.state.currentRoot.selected_machine = null;
                        }
                        else {
                            d3.selectAll('.node-sunburst')
                                .classed('selected', false);
                            thisItem
                                .classed('selected', true);

                            d3.selectAll('.node-rect')
                                .classed('selected', false);
                            d3.select('#rect-'+d.data.name+'-'+d.data.호기)
                                .classed('selected', true);

                            // call directed-graph
                            if(!self.state.eventhub.directed_graph_in.state.init && !self.state.eventhub.directed_graph_out.state.init){
                                let container = $('#Relation');
                                console.log(container.width(),container.height());
                                let graphContainer = {'width':container.width(),'height':container.parent().height()/2};
                                self.state.eventhub.directed_graph_in.init(Object.assign(self.state,{container:graphContainer}));
                                self.state.eventhub.directed_graph_out.init(Object.assign(self.state,{container:graphContainer}));
                                //console.log(self.state.parent,self.state.eventhub.directed_graph.getComp());
                                //self.state.parent.append(self.state.eventhub.directed_graph.getComp());
                                container.empty();
                                container.append(self.state.eventhub.directed_graph_in.getComp());
                                container.append(self.state.eventhub.directed_graph_out.getComp());
                            }
                            let data = self.state.datahub.getGraphData(_.cloneDeep(d.data));
                            //console.log('graph',data)
                            self.state.eventhub.directed_graph_in.state.chart.update(data);
                            self.state.eventhub.directed_graph_out.state.chart.update(data);
                        }
                        self.state.eventhub.timeline.state.name = d.data.name;
                        self.state.eventhub.timeline.state.호기 = d.data.호기;
                        self.state.eventhub.timeline.state.chart.update()
                    })
                    .append("title")
                    .text(function (d) {
                        if (d.data.r)
                            return d.data.name + "\n" + 'error:' + d.data.r;
                        else
                            return d.data.name + "\n" + 'machines:' + d.value;
                    });

                /*
                svg.transition()
                    .duration(750)
                    .tween("scale", function () {
                        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                            yd = d3.interpolate(y.domain(), [d.y0, 1]),
                            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                        return function (t) {
                            x.domain(xd(t));
                            y.domain(yd(t)).range(yr(t));
                        };
                    })
                    .selectAll("path")
                    .attrTween("d", function (d) {
                        return function () {
                            return arc(d);
                        };
                    });
                    */

                let sel_name = self.state.datahub.state.currentRoot.selected_name;
                let sel_machine = self.state.datahub.state.currentRoot.selected_machine;

                if (sel_name != null) {
                    let item = "#sunburst-" + sel_name + '-' + sel_machine;
                    let thisItem = d3.select(item);

                    //console.log(item,d3.select(item))
                    if (thisItem.node() != null) {
                        thisItem
                            .classed('selected', true);

                        let item_rect_id = "#rect-" + sel_name + '-' + sel_machine;

                        d3.selectAll('.node-rect')
                            .classed('selected', false);
                        d3.select(item_rect_id)
                            .classed('selected',true);

                        find_idx(sel_name, sel_machine);
                    }
                    self.state.eventhub.timeline.state.name = sel_name;
                    self.state.eventhub.timeline.state.호기 = sel_machine;
                    self.state.eventhub.timeline.state.chart.update()
                }
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
        // start treemap
        return chart;
    }
}