/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated treemap
 */
import * as d3 from 'd3';
import 'd3-scale-chromatic';
import './sunburst.css';
import "d3-selection-multi";
import './directed_graph.css';


export class DirectedGraph {
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
        this.state = {init: true, width, height, datahub, eventhub,direct:props.direct}
        this.state.root = "EWP";
        let graph = this.graph();

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "directed_graph"+props.direct)
            .style('display', 'inline-flex');

        sel.call(graph);
        this.state.idx = 10;
        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = graph;
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

    graph() {
        let self = this;
        // settings
        let format = d3.format(",d"),
            timing = 500;

        let svgWidth = this.state.width, svgHeight = this.state.height, data, width = this.state.width,
            height = this.state.height, datum, border, chartTitle;

        // define sunburst
        function chart(s) {
            ////console.log('test', obj_self)
            let selection = s;
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }


            var colors = d3.scaleOrdinal(d3.schemeCategory10);


            let svg = selection.append("svg")
                    .attr('width',width)
                    .attr('height',height)
                    .style('background','white');
            let rx,ry, node, link,edgepaths,edgelabels;



            function update(root) {
                if (!root) return;
                let data = _.cloneDeep(root);
                let nodes = data.nodes;
                let links = data.links;
                svg.selectAll('*').remove();
                svg.append('g')
                    .attr("transform", function (d) {return "translate(" + 2 + ", " + 13 + ")";})
                    .append('text')
                    .text(()=>{return self.state.direct =='in' ? 'Affected' : 'Affecting'})
                let simulation = d3.forceSimulation()
                    .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(width/3).strength(1).iterations(10))
                    .force("charge", d3.forceManyBody())
                    .force("center", d3.forceCenter(width / 2, height / 2));


                function dragstarted(d) {
                    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }

                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }
                function ticked() {
                    link
                        .attr("x1", function (d) {return d.source.x;})
                        .attr("y1", function (d) {return d.source.y;})
                        .attr("x2", function (d) {return d.target.x;})
                        .attr("y2", function (d) {return d.target.y;});

                    node
                        .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

                    edgepaths.attr('d', function (d) {
                        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                    });

                    edgelabels.attr('transform', function (d) {
                        if (d.target.x < d.source.x) {
                            var bbox = this.getBBox();

                            rx = bbox.x + bbox.width / 2;
                            ry = bbox.y + bbox.height / 2;
                            return 'rotate(180 ' + rx + ' ' + ry + ')';
                        }
                        else {
                            return 'rotate(0)';
                        }
                    });
                }



                svg.append('defs').append('marker')
                    .attrs({'id':'arrowhead',
                        'viewBox':'-0 -5 10 10',
                        'refX':13,
                        'refY':0,
                        'orient':'auto',
                        'markerWidth':13,
                        'markerHeight':13,
                        'xoverflow':'visible'})
                    .append('svg:path')
                    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                    .attr('fill', '#999')
                    .style('stroke','none');

                link = svg.selectAll(".link"+'-'+self.state.direct)
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("class", "link"+'-'+self.state.direct)
                    .attr('marker-end','url(#arrowhead)');

                link.append("title")
                    .text(function (d) {return d.type;});

                edgepaths = svg.selectAll(".edgepath"+'-'+self.state.direct)
                    .data(links)
                    .enter()
                    .append('path')
                    .attrs({
                        'class': 'edgepath'+'-'+self.state.direct,
                        'fill-opacity': 0,
                        'stroke-opacity': 0,
                        'id': function (d, i) {return 'edgepath' + i+'-'+self.state.direct}
                    })
                    .style("pointer-events", "none");

                edgelabels = svg.selectAll(".edgelabel")
                    .data(links)
                    .enter()
                    .append('text')
                    .style("pointer-events", "none")
                    .attrs({
                        'class': 'edgelabel'+'-'+self.state.direct,
                        'id': function (d, i) {return 'edgelabel' + i},
                        'font-size': 10,
                        'fill': '#aaa'
                    });

                edgelabels.append('textPath')
                    .attr('xlink:href', function (d, i) {return '#edgepath' + i+'-'+self.state.direct})
                    .style("text-anchor", "middle")
                    .style("pointer-events", "none")
                    .attr("startOffset", "50%")
                    .text(function (d) {return d.type});

                node = svg.selectAll(".node")
                    .data(nodes)
                    .enter()
                    .append("g")
                    .attr("class", "graph-node")
                    .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                        //.on("end", dragended)
                    );

                node.append("circle")
                    .attr("r", 8)
                    .style("fill", function (d, i) {return colors(i);})

                node.append("title")
                    .text(function (d) {return d.id;});

                node.append("text")
                    .attr("dy", -3)
                    .text(function (d) {return d.name});

                simulation
                    .nodes(nodes)
                    .on("tick", ticked);

                simulation.force("link")
                    .links(links);

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
        // start
        return chart;
    }
}