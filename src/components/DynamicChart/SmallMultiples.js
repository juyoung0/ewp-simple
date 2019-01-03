/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated small multiples
 */

import * as d3 from 'd3';
import _ from 'lodash';
import './small_multples.css';

export class SmallMultiples {
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
        this.state = {init: true, width, height, datahub: props.datahub, eventhub: props.eventhub}
        ////console.log(this)
        // start the data generator for test
        // create the real time chart
        this.state.machines = {};
        this.state.datahub.state.currentRoot.nameSet = new Set(this.state.datahub.state.currentRank.map(d => d.name));
        this.state.prev_scroll = 0;
        this.state.cur_idx = 0;
        this.state.cur_display = 50;
        this.state.row_size = 5;
        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "small_multiple")
            .style('display', 'inline-flex');

        let small_multiple = this.smallMultiples();
        sel.call(small_multiple);

        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = small_multiple;
        this.state.timeout = props.timeout;
        //console.log(this.state, 'smallmulti')
        console.log('smallmulti',this.state)
        return this;
    }

    getComp() {
        return this.state.el;
    }


    simpleLine(grid, name, data, thisWidth, thisHeight) {
        var self = this;
        //console.log(grid, name, data, thisWidth, thisHeight)
        // settings
        let format = d3.format(",d"),
            timing = 500;


        let svgWidth = thisWidth, svgHeight = thisHeight, datum, border, chartTitle;
        let thisData = data, thisName = name;
        // set the dimensions and margins of the graph
        let margin = {top: 20, right: 2, bottom: 2, left: 2},
            width = svgWidth - margin.left - margin.right,
            height = svgHeight - margin.top - margin.bottom;

        var color = d3.scaleQuantile()
            .domain([0, 1])
            .range(["#D3D3D3", "#D3D3D3", 'yellow', "red"]);

        // define circle pack
        function chart() {
            let selection = grid;
            // parse the date / time
            let parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

            ////console.log(thisData, 'thisData')
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }

            let t = d3.transition()
                .duration(timing);

            // set the ranges
            let x = d3.scaleTime().range([0, width]);
            let y = d3.scaleLinear().range([height,0]);

            // define the line

            var svg = selection.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style('background', 'white')
                .on('click', function (d) {
                    //self.state.eventhub.timeline.pick(name);
                    ////console.log('timeline',d.name );
                    self.state.eventhub.timeline.state.name = d.name;
                    self.state.eventhub.timeline.state.호기 = d.호기;
                    self.state.eventhub.timeline.state.chart.update()
                })
                .append("g")
                //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //var context = svg.node().getContext('2d')

            let valueline = d3.line()
                .x(function (d) {
                    ////console.log(x(d.date),d.date)
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.r);
                }).curve(d3.curveLinear)
            //.context(context);

            // format the data
            data.forEach(function (d) {
                d.date = parseTime(d.dt);
                d.r = +d.r;
                d.v = +d.v;
            });

            // Scale the range of the data
            x.domain(d3.extent(thisData, function (d) {
                return d.date;
            }));
            y.domain([0,1]);

            // Add the valueline path.
            let error_line = svg
                .append("path")
                .datum(thisData)
                //.attr("class", "line")
                .style('fill', 'none')
                .style('stroke', 'steelblue')
                .style('stroke-width', 0.8)
                .attr("d", function (d) {
                    ////console.log(d,valueline(d))
                    return valueline(d);
                });

            /*
            context.beginPath();
            valueline(thisData);
            context.lineWidth = 1.5;
            context.strokeStyle = "steelblue";
            context.stroke();
            */


            // Add the X Axis
            /*
                        let x_axis = svg.append("g")
                            .attr("transform", "translate(0," + height + ")")
                            .call(d3.axisBottom(x).ticks(0));


                        // Add the Y Axis
                        //svg.append("g")
            //                    .call(d3.axisLeft(y));
                        /*
                        svg.append("text")
                            .attr("x", (width / 2))
                            .attr("y", 0 - (margin.top / 2))
                            .attr("text-anchor", "middle")
                            .style("font-size", "5px")
                            .style("text-decoration", "underline")
                            .text(()=>name);
                            */

            function update(data) {
                if (!data) return;

                console.log('smallMultple',data)

                x.domain(d3.extent(data, function (d) {
                    return d.date;
                }));

                error_line.datum(data)
                    .enter()
                    .transition(t)
                    .attr("d", valueline);
                /*
                                x_axis
                                    .transition(t)
                                    .call(d3.axisBottom(x).ticks(0));
                */

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
        chart()
        return chart;
    }

    smallMultiples() {
        var self = this;
        // settings
        let format = d3.format(",d"),
            timing = 500;

        let svgWidth = this.state.width, svgHeight = this.state.height, data, width = this.state.width,
            height = this.state.height, datum, border, chartTitle, datahub = this.state.datahub;

        // define circle pack
        function chart(s) {
            let selection = s;
            if (selection == undefined) {
                console.error("selection is undefined");
                return;
            }

            var t = d3.transition()
                .duration(timing);

            selection
                .style('display', 'block')
                .style('height', "100%")
                .style('overflow-y', 'auto');

            function update(data) {
                if (!data) return;
                //data = _.cloneDeep(data);

                let filtered = data.currentRank.filter(d => {
                    //console.log(d,self.state.datahub.state.currentRoot.machine);
                    //if (_.find(self.state.datahub.state.tag_threshold, function (o) {return o.tag == d.name;}) == undefined)
                    //    return false;

                    if (self.state.datahub.state.currentRoot.machine)
                        return (self.state.datahub.state.currentRoot.nameSet.has(d.name)) && (d.호기 == self.state.datahub.state.currentRoot.machine)
                    else
                        return (self.state.datahub.state.currentRoot.nameSet.has(d.name))
                });
                selection.selectAll('*').remove();

                console.log('sm-data',filtered,data)

                //self.state.cur_idx = 10;
                self.state.max_idx = Math.ceil(data.currentRank.length);

                let data_group = filtered.length > 60 ? filtered.slice(self.state.cur_idx, self.state.cur_idx + self.state.cur_display) : filtered;
                //console.log('data_group', data_group)

                // infinite scroll until it reaches to the end.
                selection
                    .on('scroll', (d, i) => {
                        let data_group;
                        let top = selection.node().scrollTop - self.state.prev_scroll;
                        let to_top = () => {
                            selection.node().scrollTop = 50;
                            //self.state.prev_scroll = selection.node().scrollTop;
                        }
                        //console.log('data', top, self.state.cur_idx, data.currentRank.length)
                        if ((top > 0 && top <= 100) || (top < 0 && top >= -100)) {
                            return;
                        }
                        //console.log('test')
                        if (top >= 100) {
                            //console.log('test redraw', top);
                            self.state.cur_idx = self.state.cur_idx + self.state.row_size;
                            data_group = filtered.slice(self.state.cur_idx, self.state.cur_idx + self.state.cur_display)
                            if (self.state.cur_idx <= data.currentRank.length) {
                                to_top();
                            }
                        }
                        else if (top == 0) {
                            //console.log('test redraw', top);
                            self.state.cur_idx = self.state.cur_idx - self.state.row_size;
                            data_group = filtered.slice(self.state.cur_idx, self.state.cur_idx + self.state.cur_display);
                            if (self.state.cur_idx != 0) {
                                to_top();
                            }
                        }
                        redraw(data_group);
                    });

                function redraw(data_group) {
                    selection.selectAll('*').remove();

                    let grids = selection.selectAll('div')
                        .data(data_group, function (d) {
                            return d;
                        })
                        .enter()
                        .append('div')
                        .attr('id', (d) => {
                            return "error_chart_" + d.name+'-'+d.호기;
                        })
                        .attr('title', d => d.name + '\n' + 'error:'+d.r)
                        .classed('small_multi', true)
                        .on("mouseover", function(d){
                            let item_rect = '#' + "rect-" + d.name + '-' + d.호기;
                            let item_sunburst = '#' + "sunburst-" + d.name + '-' + d.호기;
                            d3.selectAll('rect.node-rect')
                                .classed('active', false);
                            d3.select(item_rect)
                                .classed('active', true);

                            d3.selectAll('.node-sunburst')
                                .classed('active', false);
                            d3.select(item_sunburst)
                                .classed('active', true);
                        })
                        .on('click',function(d){
                            let machine = d.name;
                            let 호기 = d.호기;
                            let machineData = data.history.machines[호기][machine];
                            console.log(machineData)
                        })
                        .style('display', 'inline-flex')

                    //let w = width / 6-1;
                    let w = width/5-10;

                    //grids.exit().remove();
                    /*
                    grids
                        .sort((a, b) => {
                            return data.currentRank.indexOf(a.name) > data.currentRank.indexOf(b.name)
                        })
                        */

                    grids
                        .each(function (d) {
                            let machine = d.name;
                            let 호기 = d.호기;
                            let machineData = data.history.machines[호기][machine];
                            var grid = d3.select(this);
                            ////console.log(grid,machine,machineData,this)
                            //if (data.history.machines[machine] == null)
                            if (호기 == undefined) 호기 = 'ewp';
                            self.state.machines[machine+'-'+호기] = self.simpleLine(grid, machine, machineData, w, w)
                        });

                    // update line chart
                    for (let machine in self.state.datahub.state.currentRoot.nameSet) {
                        let 호기 = self.state.datahub.state.currentRoot.호기;
                        if (호기 == null) 호기 = 'ewp';
                        self.state.machines[machine+'-'+호기].update(data.history.values[machine][호기])
                    }

                    let sel_name = self.state.datahub.state.currentRoot.selected_name;
                    let sel_machine = self.state.datahub.state.currentRoot.selected_machine;

                    if (sel_name){
                        let item_small = '#' + "error_chart_" + sel_name+'-'+sel_machine;
                        location.hash = item_small;
                        d3.select(item_small)
                            .classed('selected', true);
                    }
                    //console.log('redraw smalls')
                }

                redraw(data_group);
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

}

