/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated treelist
 */

import * as d3 from 'd3';
import './Explorer.css';
import 'bootstrap-css-only/css/bootstrap-grid.min.css';

export class Explorer {
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
        this.state = {init: true, width, height, datahub,eventhub}
        // init treelist
        let explorer = this.explorer();

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "explorer")
            .style('display', 'inline-flex');

        sel.call(explorer);
        this.state.idx = 10;
        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = explorer;
        this.state.timeout = props.timeout;
        //let data = this.state.datahub.getTreemapData();
        //console.log(data,'test')
        //this.state.chart.update(data,data);
        return this;
    }

    getComp() {
        return this.state.el;
    }

    explorer() {
        var self = this;
        // settings
        let svgWidth = this.state.width, svgHeight = this.state.height, data, width = this.state.width,
            height = this.state.height, datum, border, chartTitle,id=0;


        var margin = {top: 30, right: 20, bottom: 30, left: 20},
            barHeight = 20,
            barWidth = (width - margin.left - margin.right) * 0.7;

        var i = 0,
            duration = 400,
            root;
        // define treemap
        function chart(s) {
            let selection = s;
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }

            function elbow(d, i) {
                //console.log(d);
                return "M" + d.source.y + "," + d.source.x
                    + "V" + d.target.x + "H" + (d.target.y-0);
            }

            var diagonal = d3.linkHorizontal()
                .x(function(d) { return d.y; })
                .y(function(d) { return d.x; });

            var svg = selection.append("svg")
                .attr("width", width) // + margin.left + margin.right)
                .attr("height", height) // + margin.left + margin.right)
                .classed('explorer',true)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            data = self.state.datahub.state.currentTree;
            root = d3.hierarchy(data);
            root.x0 = 0;
            root.y0 = 0;

            function collapsed(d){
                if (d.children) {
                    d.children.forEach(collapsed)
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
            }
            root.children.forEach(collapsed);
            update(root);

            // Toggle children on click.
            function click(d) {
                d3.selectAll('.node-exp .active')
                    .classed('active',false);

                d3.select(this)
                    .classed('active',true);

                self.state.datahub.state.currentRoot.name = d.data.name;
                self.state.datahub.state.currentRoot.machine = d.data.machine || d.data.호기;
                //console.log(d,self.state.datahub.state.currentRoot.machine);
                self.state.datahub.updateCurrent(self.state.datahub.state.currentTree);
                self.state.eventhub.partition.state.chart.update(self.state.datahub.state.currentRoot.vRoot);
                self.state.eventhub.sunburst.state.chart.update(self.state.datahub.state.currentRoot.vRoot);
                self.state.eventhub.small_multi.state.chart.update(self.state.datahub.state)
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }

            var colorTitle = d3.scaleOrdinal()
                .domain([4, 0])
                .range(["#c0c5ce",'#a7adba','#65737e','#4f5b66'])

            function color(d) {
                return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
            }

            function update(source) {
                if (!data) return;



                // Compute the flattened node list.
                var nodes = root.descendants();

                var height = Math.max(svgHeight, nodes.length * barHeight + margin.top + margin.bottom);

                d3.select("svg").transition()
                    .duration(duration)
                    .attr("height", height);

                d3.select(self.frameElement).transition()
                    .duration(duration)
                    .style("height", height + "px");

                var index = -1;
                root.eachBefore(function(n) {
                    n.x = ++index * barHeight;
                    n.y = n.depth * 20;
                });

                // Update the nodes…
                var node = svg.selectAll(".node-exp")
                    .data(nodes, function(d) { return d.id || (d.id = ++i); });

                var nodeEnter = node.enter().append("g")
                    .attr("class", "node-exp")
                    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                    .style("opacity", 0);

                // Enter any new nodes at the parent's previous position.
                nodeEnter.append("rect")
                    .attr("y", -barHeight / 2)
                    .attr("height", barHeight-2)
                    .attr("width", barWidth)
                    //.style("fill", color)
                    .on("click", click);

                nodeEnter.append("text")
                    .attr("dy", 3.5)
                    .attr("dx", 5.5)
                    .text(function(d) { return d.data.name; });

                // Transition nodes to their new position.
                nodeEnter.transition()
                    .duration(duration)
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    .style("opacity", 1);

                node.transition()
                    .duration(duration)
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    .style("opacity", 1)
                    .select("rect")
                    //.style("fill", color);

                // Transition exiting nodes to the parent's new position.
                node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                    .style("opacity", 0)
                    .remove();

                // Update the links…
                var link = svg.selectAll(".link")
                    .data(root.links(), function(d) { return d.target.id; });

                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d,i) {
                        var o = {x: source.x0, y: source.y0};
                        //return diagonal({source: o, target: o});
                        return elbow(d,i);
                    })
                    .transition()
                    .duration(duration)
                    //.attr("d", diagonal);
                    .attr("d", elbow);

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", elbow);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d,i) {
                        var o = {x: source.x, y: source.y};
                        //return diagonal({source: o, target: o});
                        return elbow(d,i);
                    })
                    .remove();

                // Stash the old positions for transition.
                root.each(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

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

        //chart.update(data, data);

        // start treemap
        return chart;
    }
}

