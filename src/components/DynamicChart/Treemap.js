/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated treemap
 */

import * as d3 from 'd3';
import './treemap.css';
import _ from 'lodash';

//import testdata from '/static/data/flare.csv';

export class Treemap {
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
        this.state = {init: true, width, height, datahub, eventhub}
        this.state.root = "EWP";
        let treemap = this.treemap();

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "tremapp")
            .style('display', 'inline-flex');

        sel.call(treemap);
        this.state.idx = 10;
        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = treemap;
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
        ////console.log('this',this)
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

    treemap() {
        var self = this;
        // settings
        let format = d3.format(",d"),
            timing = 500;

        let svgWidth = this.state.width, svgHeight = this.state.height, data, width = this.state.width,
            height = this.state.height, datum, border, chartTitle;

        let margin_top = 20;

        height = svgHeight - margin_top;

        function hovered(hover) {
            //console.log(hover)
            return function (d) {
                let item = '#' + "error_chart_" + d.data.name + '-' + d.data.호기;
                if (hover) {
                    d3.selectAll('rect.node-rect')
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

        // define treemap
        function chart(s) {
            let selection = s;
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }

            var colors = ["#fef0d9", "#fdcc8a", '#fc8d59', "#e34a33", '#b30000', '#670000'];

            /*
            var color = d3.scaleQuantile()
                .domain([0, 1])
                //.range(["#D3D3D3", "#D3D3D3", 'yellow', "red"]);
                .range(colors);
                */

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

            var colorTitle = (d) => {
                let r = ['#a382ff', "#b893ff", "#ccbaff",'e1d7ff'];
                return r[d];
            };

            var svg_tree = selection.append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .classed('treemap', true)

            var svg = svg_tree.append('g')
                .attr("transform", "translate(" + 0 + "," + margin_top + ")");

            var legend = svg_tree.append('g')
                .attr("transform", "translate(" + 0 + "," + 0 + ")");
            let l_d = [1, 2, 3, 4, 5, 99];
            let l_w = svgWidth / l_d.length;
            let legend_g = legend.selectAll('.legends-rect')
                .data(l_d)
                .enter()
                .append('g')
                .attr("transform", function (d, i) {
                    return "translate(" + i * l_w + "," + 0 + ")"
                })
            let legned_rect = legend_g
                .append('rect')
                .attr("width", function (d, i) {
                    return l_w;
                })
                .attr("height", function (d, i) {
                    return margin_top;
                })
                .style('fill', function (d, i) {
                    return color((d-1) / 100);
                });
            legend_g
                .append('text')
                .text(function (d, i) {
                    return '~'+d + '%'
                })
                .attr('text-anchor', 'end')
                .attr('fill', function (d) {
                    if (d== 99) return 'white';
                    return '#333'
                })
                .attr('font-size', '20px')
                .attr('x', l_w)
                .attr('y', margin_top - 3)


            var format = d3.format(",d");

            //if (error) throw error;
            //data = self.getData();
            data = self.state.datahub.getTreemapData();
            ////console.log(data, 'test')
            let vRoot = d3.hierarchy(data)
                .sum(function (d) {
                    //return d.v;
                    return 1;
                })
                .sort(function (a, b) {
                    return b.data.r - a.data.r;
                });
            /*
            .sort(function (a, b) {
                return b.height - a.height || b.value - a.value;
            });
            */

            //console.log(vRoot, vRoot.descendants().length)

            var treemap = d3.treemap()
                .size([width, height])
                //.padding([30,4,4,4])
                .paddingOuter(3)
                .paddingTop(20)
                //.paddingLeft(4)
                //.paddingRight(4)
                .paddingInner(1)
            //.tile(d3['treemapResquarify'])
            //.round(true);

            var t = d3.transition().duration(timing);

            function update(vRoot) {
                if (!data) return;


                let tree = treemap(vRoot);
                svg.selectAll('*').remove();
                //console.log('vRoot', vRoot, vRoot.descendants())
                let cell = svg
                    .selectAll(".node")
                    .data(vRoot.descendants())
                    .enter().append("g")
                    .classed('node', true)
                    //.sort((a,b)=>b.data.r- a.data.r)
                    .attr("transform", function (d) {
                        return "translate(" + d.x0 + "," + d.y0 + ")";
                    })
                    .on("mouseover", hovered(true))
                    .on("mouseout", hovered(false));


                let find_idx = (name, 호기) => {
                    let currentRank = self.state.datahub.state.currentRank.filter(d => {
                        return self.state.datahub.state.currentRoot.nameSet.has(d.name)
                    });
                    let idx = currentRank.findIndex(d => {
                        return (name == d.name && 호기 == d.호기)
                    });
                    self.state.eventhub.small_multi.state.cur_idx = idx;
                    self.state.eventhub.small_multi.state.chart.update(self.state.datahub.state);
                };

                let rect = cell.append("rect")
                    .classed('node-rect', true)
                    .data(vRoot.descendants())
                    .attr("id", function (d) {
                        return "rect-" + d.data.name + '-' + d.data.호기;
                    })
                    .attr("width", function (d) {

                        return Math.max(0, d.x1 - d.x0 - 1);
                    })
                    .attr("height", function (d) {
                        return Math.max(0, d.y1 - d.y0 - 1);
                    })
                    .on('click', function (d) {
                        //console.log('clicked')
                        if (d.children) return;
                        let thisItem = d3.select(this);
                        self.state.datahub.state.currentRoot.selected_name = d.data.name;
                        self.state.datahub.state.currentRoot.selected_machine = d.data.호기;
                        find_idx(d.data.name, d.data.호기);
                        console.log('test',thisItem.classed('selected'),thisItem)
                        if (thisItem.classed('selected')) {
                            thisItem
                                .classed('selected', false);
                            d3.selectAll('.small_multi')
                                .classed('selected', false);

                            d3.selectAll('.node-sunburst')
                                .classed('selected', false);

                            self.state.datahub.state.currentRoot.selected_name = null;
                            self.state.datahub.state.currentRoot.selected_machine = null;
                        }
                        else {
                            d3.selectAll('.node-rect')
                                .classed('selected', false);
                            thisItem
                                .classed('selected', true);

                            d3.selectAll('.node-sunburst')
                                .classed('selected', false);
                            d3.select('#sunburst-'+d.data.name+'-'+d.data.호기)
                                .classed('selected', true);
                        }
                        self.state.eventhub.timeline.state.name = d.data.name;
                        self.state.eventhub.timeline.state.호기 = d.data.호기;
                        self.state.eventhub.timeline.state.chart.update()

                        // call directed-graph
                        if(!self.state.eventhub.directed_graph_in.state.init && !self.state.eventhub.directed_graph_out.state.init){
                            let container = $('#Relation');
                            //console.log(container.width(),container.height());
                            let graphContainer = {'width':container.width(),'height':container.parent().height()/2};
                            self.state.eventhub.directed_graph_in.init(Object.assign(self.state,{container:graphContainer,direct:'in'}));
                            self.state.eventhub.directed_graph_out.init(Object.assign(self.state,{container:graphContainer,direct:'out'}));
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
                    })
                    .style("fill", function (d) {
                        if (!d.children)
                            return color(d.data.r);
                        else
                            return colorTitle(d.depth);
                    })

                cell.append("clipPath")
                    .attr("id", function (d) {
                        return "clip-" + d.data.name + "-" + d.data.호기;
                    })
                    .append("use")
                    .attr("xlink:href", function (d) {
                        return "#rect-" + d.data.name + "-" + d.data.호기;
                    });


                let label = cell.append("text")
                    .attr("clip-path", function (d) {
                        return "url(#clip-" + d.data.name + "-" + d.data.호기 + ")";
                    })

                cell.append('rect')
                    .style('fill', 'gray')
                    .attr("clip-path", function (d) {
                        return "url(#clip-" + d.data.name + "-" + d.data.호기 + ")";
                    });


                let branch = label
                    .filter(function (d) {
                        return d.children;
                    })
                    .selectAll("tspan")
                    .data(function (d) {
                        return d.data.name;
                    }).enter().append("tspan")
                    .style('stroke', (d) => {
                        if (d.depth == 0) return 'white'
                    })
                    .attr("x", function (d, i) {
                        if (i == null) //console.log(d, i, 'null')
                            return i ? null : 4;
                    })
                    .attr("y", 15)
                    .text(function (d) {
                        return d;
                    })

                let title = cell.append("title")
                    .text(function (d) {
                        if (!d.children)
                            return d.data.name + "\nError:" + d.data.r + "\nValue:" + d.value;
                        else
                            return d.data.name + "\nValue:" + d.value;
                    });

                let sel_name = self.state.datahub.state.currentRoot.selected_name;
                let sel_machine = self.state.datahub.state.currentRoot.selected_machine;

                if (sel_name != null) {
                    let item = "#rect-" + sel_name + '-' + sel_machine;
                    let thisItem = d3.select(item);
                    //console.log(item,d3.select(item))
                    if (thisItem.node() != null) {
                        find_idx(sel_name,sel_machine);
                        thisItem
                            .classed('selected', true);
                        let item_sunburst_id = "#sunburst-" + sel_name + '-' + sel_machine;
                        d3.selectAll('.node-sunburst')
                            .classed('selected',false);
                        d3.select(item_sunburst_id)
                            .classed('selected',true);
                        let item_small = '#' + "error_chart_" + sel_name + '-' + sel_machine;
                        d3.selectAll('.small_multi')
                            .classed('selected', false);
                        d3.select(item_small)
                            .classed('selected', true);
                    }
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