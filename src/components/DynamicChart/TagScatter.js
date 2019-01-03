/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated small multiples
 */

import * as d3 from 'd3';
import './timeline.css'


export class TagScatter {
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
        this.state = {init: true, width, height, datahub: props.datahub, eventhub: props.eventhub}

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "time_line")
            .style('background','white')
            .style('display', 'inline-block');

        let time_line = this.timeLine();
        this.state.idx = 10;
        this.state.el = el;
        this.state.sel = sel;
        this.state.timeout = props.timeout;
        sel.call(time_line);
        this.state.chart = time_line;
        return this;
    }

    getComp() {
        return this.state.el;
    }

    // run demo for n times
    runDemo() {
        this.state.gen = true;
        let timeout = 300;
        let self = this;
        ////console.log('this',this)

        if (this.state.gen) {
            setTimeout(function () {
                self.state.chart.update(self.getData());
                self.runDemo();
                self.state.idx = self.state.idx - 1
            }, timeout);
        }
    }

    timeLine() {
        var self = this;
        // settings
        let format = d3.format(",d"),
            timing = 100;
        let svgWidth = this.state.width, svgHeight = this.state.height - 30,
            data, datum, border, chartTitle, name = this.state.name;

        // set the dimensions and margins of the graph
        let margin = {top: 5, right: 10, bottom: 50, left: 35, sub_top: 20, sub_bottom: 15},
            width = svgWidth - margin.left - margin.right,
            height = svgHeight - margin.top - margin.bottom,
            height2 = margin.bottom - margin.sub_top - margin.sub_bottom;

        var color = d3.scaleQuantile()
            .domain([0, 1])
            .range(["#7fc97f", "#beaed4", '#fdc086', "red"]);

        // define circle pack
        function chart(s) {
            let selection = s;
            // parse the date / time
            let parseTime = d3.timeParse("%B %d, %Y %I %p %I:%M %S .%L");

            let temp = self.state.datahub.getData();
            if (name == null)
                data = temp['history']['machines'][temp.currentRank[0]['호기']][temp.currentRank[0]['name']]
            ////console.log(thisData, 'thisData')
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }

            let t = d3.transition()
                .duration(timing);

            let brush = d3.brushX()
                .extent([[0, 0], [width, height2]])
                .on("brush end", brushed);

            var zoom = d3.zoom()
                .scaleExtent([1, Infinity])
                .translateExtent([[0, 0], [width, height]])
                .extent([[0, 0], [width, height]])
                .on("zoom", zoomed);

            let timeline_menu = selection.append('div')
                .attr('class', 'timeline-menu')
                .style('background', 'white')
            //.style('border-bottom','solid 1px #333');


            let range = ['day', 'hour'];


            let title = timeline_menu
                .append('span')
                .text(temp.currentRank[0]['name']);

            let ranges_buttons = timeline_menu
                .append('div')
                .attr('class', 'btn-group btn-group-xs btn-justified pull-right');



            function addSecs(date, secs) {
                return new Date(date.getTime() + secs*1000);
            }

            ranges_buttons.append('input')
                .attr("class",'form-control input-sm')
                .attr('placeholder','Start-time')

            ranges_buttons
                .selectAll('span.range-buttons')
                .data(range)
                .enter()
                .append('span')
                .attr('class', 'btn btn-xs btn-info range-buttons')
                .attr('id',(d)=>{return 'range-button-'+d})
                .on('click', (d) => {
                    d3.selectAll('.range-buttons')
                        .classed('active', false);
                    d3.select('#range-button-'+d)
                        .classed('active', true);
                    zoomRange(d);
                })
                .text(d => d.toUpperCase());

            function zoomRange(d) {
                svg.select(".zoom").call(zoom.transform, d3.zoomIdentity);
                switch (d){
                    case 'day':
                    {
                        let d0 = new Date(2018,7,11);
                        let d1 = addSecs(d0,60*60*24);
                        svg.select(".zoom")
                            .transition()
                            .duration(1000)
                            .call(zoom.transform, d3.zoomIdentity
                                .scale(width / (x(d1) - x(d0)))
                                .translate(x(d0), 0));
                        break;
                    }
                    case 'hour':
                    {
                        let d0 = new Date(2018,7,11);
                        let d1 = addSecs(d0,60*60);
                        svg.select(".zoom")
                            .transition()
                            .duration(1000)
                            .call(zoom.transform, d3.zoomIdentity
                                .scale(width / (x(d1) - x(d0)))
                                .translate(x(d0), 0));
                        break;
                    }
                }
            }

            // append menu buttons and title area
            var svg = selection.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom + margin.sub_bottom + margin.sub_top)
                .style('background', 'white');

            svg.append("defs").append("clipPath")
                .attr("id", "clip-timeline")
                .append("rect")
                .attr("width", width)
                .attr("height", height)



            let main = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            let sub = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + (margin.top + height + margin.sub_top) + ")");

            //.call(zoom);

            // set the ranges
            let x = d3.scaleTime().range([0, width]);
            let x2 = d3.scaleTime().range([0, width]);
            let y = d3.scaleLinear().range([height, 0]);
            let y2 = d3.scaleLinear().range([height2, 0]);

            // Scale the range of the data
            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));

            x2.domain(d3.extent(data, function (d) {
                return d.date;
            }));

            y.domain([0, d3.max(data, (d) => d.v)]);

            y2.domain([0, d3.max(data, (d) => d.v)]);

            // Add the X Axis
            let xAxis = d3.axisBottom(x).ticks(10)

            let x_axis = main.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            let xAxis2 = d3.axisBottom(x2).ticks(10);

            let x_axis2 = sub.append("g")
                .attr("transform", "translate(0," + height2 + ")")
                .call(xAxis2);

            // Add the Y Axis
            let yAxis = d3.axisLeft(y).ticks(5);
            let y_axis = main.append("g")
                .call(yAxis);

            // define the line
            let valueline = d3.line()
                .x(function (d) {
                    ////console.log(x(d.date),d.date)
                    return x(d.date);
                })
                .y(function (d) {
                    ////console.log(y(d.r),d.r)
                    return y(d.v);
                }).curve(d3.curveLinear);

            let valueline2 = d3.line()
                .x(function (d) {
                    ////console.log(x(d.date),d.date)
                    return x2(d.date);
                })
                .y(function (d) {
                    ////console.log(y(d.r),d.r)
                    return y2(d.v);
                }).curve(d3.curveLinear);

            function brushed() {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                var s = d3.event.selection || x2.range();
                x.domain(s.map(x2.invert, x2));
                value_line.attr("d", valueline);
                x_axis.call(xAxis);
                svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                    .scale(width / (s[1] - s[0]))
                    .translate(-s[0], 0));
            }

            function zoomed() {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
                var t = d3.event.transform;
                x.domain(t.rescaleX(x2).domain());
                value_line.attr("d",valueline)
                x_axis.call(xAxis);
                sub.select(".brush").call(brush.move, x.range().map(t.invertX, t));
            }

            // format the data
            data.forEach(function (d) {
                d.date = parseTime(d.dt);
                d.r = +d.r;
                d.v = +d.v;
            });


            // Add the valueline path.
            let value_line = main
                .append("path")
                .datum(data)
                .attr("class", "line")
                .style('fill', 'none')
                .style('stroke', 'steelblue')
                .style('stroke-width', 0.8)
                .attr("clip-path", "url(#clip-timeline)")
                .attr("d", function (d) {
                    ////console.log(d,valueline(d))
                    return valueline(d);
                });

            let value_line2 = sub
                .append("path")
                .datum(data)
                .attr("class", "line")
                .style('fill', 'none')
                .style('stroke', 'steelblue')
                .style('stroke-width', 2)
                .attr("d", function (d) {
                    ////console.log(d,valueline(d))
                    return valueline2(d);
                });

            svg.append("rect")
                .attr("class", "zoom")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(zoom);


            let b = sub.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, x.range());

            function update() {
                //if (!data) return;
                let temp = self.state.datahub.getData();

                name = self.state.name;
                if (name == null) {
                    data = temp['history']['machines'][temp.currentRank[0]['호기']][temp.currentRank[0]['name']];
                    title.text(() => temp.currentRank[0]['name']);
                }
                else {
                    data = temp['history']['machines'][self.state.호기][name];
                    title.text(() => name);
                }

                ////console.log('timeline',name,data);

                // format the data
                data.forEach(function (d) {
                    d.date = parseTime(d.dt);
                    d.r = +d.r;
                    d.v = +d.v;
                });

                x.domain(d3.extent(data, function (d) {
                    return d.date;
                }));

                x2.domain(d3.extent(data, function (d) {
                    return d.date;
                }));

                x_axis
                    .transition(t)
                    .call(d3.axisBottom(x).ticks(10));

                x_axis2
                    .transition(t)
                    .call(d3.axisBottom(x).ticks(10));

                value_line.datum(data)
                    .transition(t)
                    .attr("d", function (d) {
                        //console.log(d, valueline(d))
                        return valueline(d);
                    });

                value_line2.datum(data)
                    .transition(t)
                    .attr("d", function (d) {
                        //console.log(d, valueline(d))
                        return valueline2(d);
                    });

                // removes handle to resize the brush
                d3.selectAll('.brush>.handle').remove();
                // removes crosshair cursor
                d3.selectAll('.brush>.overlay').remove();

                let selected_range = d3.select('span.range-buttons.active');
                if(selected_range.node()){
                    let d = selected_range.data()[0];
                    zoomRange(d)
                }

                // transition
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
        //chart.update()

        return chart;
    }
}

