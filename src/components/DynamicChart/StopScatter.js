/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated small multiples
 */

import * as d3 from 'd3';
import './timeline.css'
import './partition.css'

export class StopScatter {
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
        this.state = {init: true, width, height, datahub: props.datahub, eventhub: props.eventhub, data: props.data}

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "stop_scatter")
            .style('background', 'white')

        let stop_scatter = this.stopScatter();
        this.state.idx = 10;
        this.state.el = el;
        this.state.sel = sel;
        this.state.timeout = props.timeout;
        sel.call(stop_scatter);
        this.state.chart = stop_scatter;
        return this;
    }

    getComp() {
        return this.state.el;
    }


    stopScatter() {
        console.log('stopScatter')
        var self = this;
        // settings
        let format = d3.format(",d"),
            timing = 100;
        let svgWidth = this.state.width, svgHeight = this.state.height - 30,
            data = this.state.data, datum, border, chartTitle, name = this.state.name;

        this.state.current = this.state.datahub.state.currentRank[0];
        // set the dimensions and margins of the graph
        let margin = {top: 5, right: 50, bottom: 20, left: 120, sub_top: 0, sub_bottom: 0},
            width = svgWidth - margin.left - margin.right,
            height = svgHeight - margin.top - margin.bottom,
            height2 = margin.bottom - margin.sub_top - margin.sub_bottom;

                // The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
        var xScale = d3.scaleBand().range([0, width]);

        var yScale = d3.scaleBand().range([height, 0]);

        // the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
        var xAxis = d3.axisBottom()
            .scale(xScale);

        var yAxis = d3.axisLeft()
            .scale(yScale);

        // again scaleOrdinal
        let error_types= ['비계획정비정지', '계획중간정비정지', '감발운전', '불시정지', '기동실패']
        var color = d3.scaleOrdinal()
            .domain(error_types)
            .range(['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0']);


        // define circle pack
        function chart(s) {
            let selection = s;
            // parse the date / time
            let parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

            let svg = selection
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // format the data
            function update(data) {
                //if (!data) return;

                let tags = Object.keys(data).filter(d=>d != 'dates');
                let dates = data.dates;
                xScale.domain(dates);
                yScale.domain(tags);
                svg.selectAll("*").remove();
                console.log('stopscatter',tags,dates)

                // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis.
                svg.append('g')
                    .attr('transform', 'translate(0,' + height + ')')
                    .attr('class', 'x axis')
                    .call(xAxis);

                // y-axis is translated to (0,0)
                svg.append('g')
                    .attr('transform', 'translate(0,0)')
                    .attr('class', 'y axis')
                    .call(yAxis);

                let tagGroup = svg.selectAll('.tag-group')
                    .data(tags)
                    .enter()
                    .append('g')
                    .attr("transform",
                        function (d) {
                           return "translate(" + 0 + "," + yScale(d) + ")";
                        });

                var tagPoint = tagGroup.selectAll('.tag-point')
                    .data(d=>data[d])
                    .enter().append('rect')
                    .attr('class', 'tag-point')
                    .attr('x', function (d) {
                        console.log(xScale.bandwidth())
                        return xScale(d.date.split(' ')[0])+xScale.bandwidth()/2-20
                    })
                    .attr('y', 0)
                    .attr('width', function (d) {
                        return 40;
                    })
                    .attr('height',function (d) {
                        return yScale.bandwidth()
                    })
                    .style('fill', function (d) {
                        return color(d.error_type);
                    })
                    .on('click',function (d) {
                        self.state.datahub.getStopData(d.date.split(' ')[0])
                            .then(res=>{
                                self.state.eventhub.partition_old.state.chart.update(res);
                            })
                    });

                tagPoint.append('title')
                    .attr('x', function (d) {
                        return xScale(d.date)/2;
                    })
                    .text(function (d) {
                        return JSON.stringify(d);
                    });

                /*
                // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
                svg.append('text')
                    .attr('x', 10)
                    .attr('y', 10)
                    .attr('class', 'label')
                    .text('Date');


                svg.append('text')
                    .attr('x', width)
                    .attr('y', height - 10)
                    .attr('text-anchor', 'end')
                    .attr('class', 'label')
                    .text('Tags');
                    */
                // I feel I understand legends much better now.
                // define a group element for each color i, and translate it to (0, i * 20).
                var legend = svg.selectAll('legend')
                    .data(error_types)
                    .enter().append('g')
                    .attr('class', 'legend')
                    .attr('transform', function (d, i) {
                        return 'translate(0,' + i * 20 + ')';
                    });

                // give x value equal to the legend elements.
                // no need to define a function for fill, this is automatically fill by color.
                legend.append('rect')
                    .attr('x', width)
                    .attr('width', 12)
                    .attr('height', 12)
                    .style('fill', color);

                // add text to the legend elements.
                // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
                legend.append('title')
                    .attr('x', width - 6)
                    .attr('y', 9)
                    .attr('dy', '.35em')
                    .style('font-size',9)
                    .style('text-anchor', 'end')
                    .text(function (d) {
                        return d;
                    });


                // d3 has a filter fnction similar to filter function in JS. Here it is used to filter d3 components.
                /*
                legend.on('click', function (type) {
                    d3.selectAll('.bubble')
                        .style('opacity', 0.15)
                        .filter(function (d) {
                            return d.Species == type;
                        })
                        .style('opacity', 1);
                })
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
        //chart.update()

        return chart;
    }
}

