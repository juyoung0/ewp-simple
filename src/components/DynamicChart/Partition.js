/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated treemap
 */

import * as d3 from 'd3';
import _ from 'lodash';
import './treemap.css';

//import testdata from '/static/data/flare.csv';

export class Partition {
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
        let partition = this.partition();

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "partition")
            .style('background', 'white')
            .style('height', height + 'px')
            .style('overflow-x', 'auto')
            .style('overflow-y', 'auto');


        sel.call(partition);
        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = partition;
        return this;
    }

    getComp() {
        return this.state.el;
    }

    highlight(corr) {
        console.log('hg', corr)
        switch (corr) {
            case 'btn-corr-affected':
                d3.selectAll('.affecting')
                    .style('opacity', 0.2)
                d3.selectAll('.affected')
                    .style('opacity', 1)
                break;
            case 'btn-corr-affecting':
                d3.selectAll('.affecting')
                    .style('opacity', 1)
                d3.selectAll('.affected')
                    .style('opacity', 0.2)
                break;
            default:
                d3.selectAll('.affecting')
                    .style('opacity', 1)
                d3.selectAll('.affected')
                    .style('opacity', 1)
                break;
        }

    }

    partition() {
        let self = this;
        // settings
        let format = d3.format(",d"),
            timing = 500;

        let svgWidth = this.state.width, svgHeight = this.state.height, data, width = this.state.width,
            height = this.state.height, datum, border, chartTitle;

        let margin_top = 20;
        let padding = 3;
        let font_size = 11;
        let rh = 10; // leaves nodes, box size

        height = svgHeight - margin_top;

        function hovered(hover) {
            ////console.log(hover)
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

            selection.style('height', svgHeight);

            var colors = ["#fef0d9", "#fdcc8a", '#fc8d59', "#e34a33", '#b30000'];

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
                if (0.04 <= t) {
                    return colors[4];
                }
            }

            var colorTitle = (d) => {
                let r = ['#fff', "#777777", '#d3d3d3', "#eaeaea"];
                return r[d];
            };

            var svg_tree = selection.append("svg")
            //.attr("height", svgHeight)
                .classed('treemap', true);


            var svg = svg_tree.append('g')
                .attr("transform", "translate(" + 0 + "," + 0 + ")");

/*
            var legend = svg_tree.append('g')
                .attr("transform", "translate(" + 0 + "," + 0 + ")");
            let l_d = [1, 2, 3, 4, 5];
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
                    return color((d - 1) / 100);
                });

            legend_g
                .append('text')
                .text(function (d, i) {
                    return '~' + d + '%'
                })
                .attr('text-anchor', 'end')
                .attr('fill', function (d) {
                    if (d == 5) return 'white';
                    return '#333'
                })
                .attr('font-size', '20px')
                .attr('x', l_w)
                .attr('y', margin_top - 3)
*/

            var format = d3.format(",d");

            //if (error) throw error;
            //data = self.getData();
            data = self.state.datahub.state.currentTree;
            //////console.log(data, 'test')

            /*
            .sort(function (a, b) {
                return b.height - a.height || b.value - a.value;
            });
            */

            ////console.log(vRoot, vRoot.descendants().length)

            var treemap = d3.partition()
                .padding(padding);

            var t = d3.transition().duration(timing);

            function collapsed(d) {
                if (d.children && d.children.length != 0 && d.children[0].children) {
                    d.children.forEach(collapsed);
                } else {
                    d.__children = d.children;
                    delete d.children;
                }
            }


            function update(root) {
                if (!root) return;
                let data = _.clone(root.data);
                let leaves = _.clone(root.leaves());
                collapsed(data);


                let vRoot = d3.hierarchy(data)
                    .sum(function (d) {
                        return d.children ? 0 : 1;
                    })
                    .sort(function (a, b) {
                        return b.value - a.value;
                    });
                //console.log(data,leaves,vRoot);


                let len = vRoot.descendants().length;
                let total_h = (len * rh + (vRoot.leaves().length - 3) * padding);
                let total_w = rh * (vRoot.height + 1) + ((vRoot.height - 1) * padding * 1.5);
                //console.log(total_h,total_w)
                treemap.size([total_h, total_w * 2]);
                //svg_tree.attr('height',total_h);
                console.log(total_h, total_w)
                svg_tree.attr('width', total_h)
                //console.log('rh',d3.max(vRoot.leaves().map(d=>d.length)),vRoot.leaves())
                svg_tree.attr('viewBox', [0, 0, total_h, rh*1000].join(' '));


                let tree = treemap(vRoot);

                svg.selectAll('*').remove();
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

                cell.filter(d => !d.data.children)
                    .append('text')
                    .style('font-size', rh)
                    .selectAll('tspan.leaves')
                    .data(function (d) {
                        return d.data.name;
                    })
                    .enter()
                    .append('tspan')
                    //.style('text-anchor','middle')
                    .attr('x', d => 0)
                    .attr('y', function (d, i) {
                        return 9 * i + 8
                    })
                    .text(d => {
                        return d
                    });

                let bar_g = svg.selectAll('.node-bar-group')
                    .data(vRoot.leaves())
                    .enter()
                    .append('g')
                    .classed('node-bar-group', true)
                    .attr("transform", function (d) {
                        return "translate(" + (d.x0) + "," + (d.y0 + font_size * 3) + ")";
                    });

                let node_bar = bar_g.selectAll('.node-bar')
                    .data(d => {
                        return leaves.filter(item => {
                            return (d.data.name == item.data.설비) && (d.data.machine == item.data.호기)
                        })
                    })
                    .enter()
                    .append('g')
                    .attr("transform", function (d, i) {
                        return "translate(0," + (i * rh) + ")";
                    })
                    .on("mouseover", hovered(true))
                    .on("mouseout", hovered(false))



                let bar = node_bar.append("rect")
                    .classed('node-rect', true)
                    //.data(vRoot.descendants())
                    .classed('node-leaf', function (d) {
                        return !d.children;
                    })
                    .attr("id", function (d) {
                        return "rect-" + d.data.name + '-' + d.data.호기;
                    })
                    .attr("width", function (d) {
                        //return Math.max(0, d.y1 - d.y0);
                        return rh + padding;
                    })
                    .attr("height", function (d) {
                        //return Math.max(0, d.x1 - d.x0);
                        return rh;
                    })
                    .on('click', function (d) {
                        ////console.log('clicked')
                        if (d.children) return;
                        let thisItem = d3.select(this);
                        self.state.datahub.state.currentRoot.selected_name = d.data.name;
                        self.state.datahub.state.currentRoot.selected_machine = d.data.호기;
                        find_idx(d.data.name, d.data.호기);
                        //console.log('test',thisItem.classed('selected'),thisItem)
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
                            d3.select('#sunburst-' + d.data.name + '-' + d.data.호기)
                                .classed('selected', true);
                        }
                        self.state.eventhub.timeline.state.name = d.data.name;
                        self.state.eventhub.timeline.state.호기 = d.data.호기;
                        self.state.datahub.getTimelineData(d.data.name)
                            .then(res => {
                                console.log('getTimelineData', d.data.name, res)
                                self.state.eventhub.timeline.state.chart.update(res);
                            })

                        // popup correlated tags and blur others
                        if (d3.select(this).classed('bar-selected')) {
                            bar.classed('bar-selected', false);
                            bar.classed('affected', false);
                            bar.classed('affecting', false);
                            bar.style('opacity', 1);
                            return
                        }
                        bar.classed('bar-selected', false);
                        bar.classed('affected', false);
                        bar.classed('affecting', false);

                        bar.style('opacity', 0.2);
                        d3.select(this)
                            .classed('bar-selected', true)
                            .style('opacity', 1);

                        console.log('corr', self.state.datahub.state)
                        let affected = self.state.datahub.state.corr.tags[d.data.name].affected;
                        let affecting = self.state.datahub.state.corr.tags[d.data.name].affecting;
                        console.log('sample', affected, affecting);

                        // filter corrs
                        bar.filter(function (d) {
                            return affected.indexOf(d.data.name) != -1
                        })
                            .classed('affected', true)
                            .style('opacity', 1);

                        bar.filter(function (d) {
                            return affecting.indexOf(d.data.name) != -1
                        })
                            .classed('affecting', true)
                            .style('opacity', 1)

                        self.state.datahub.getStopHistory(d.data.name)
                            .then(res => {
                                if (self.state.eventhub.stop_scatter.init) {
                                    console.log('getStopHistory', res, self.state.eventhub.stop_scatter)
                                    self.state.eventhub.stop_scatter.current = d.data.name;
                                    self.state.eventhub.stop_scatter.state.chart.update(res);
                                }

                            })
                    })
                    .style("fill", function (d) {
                        if (!d.children)
                            return color(d.data.r);
                        else
                            return colorTitle(d.depth);
                    })


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

                let rect = cell
                    .filter(d => d.children)
                    .append("rect")
                    .classed('node-rect', true)
                    .data(vRoot.descendants())
                    .attr("id", function (d) {
                        return "rect-" + d.data.name + '-' + d.data.호기;
                    })
                    .attr("width", function (d) {
                        return d.children ? Math.max(0, d.x1 - d.x0) : rh;
                    })
                    .attr("height", function (d) {
                        return d.children ? Math.max(0, d.y1 - d.y0) : rh;
                    })
                    .style("fill", function (d) {
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
                    .style('stroke', function (d) {
                        let p = d3.select(this);
                        let rect_d = d3.select(p.node().parentNode).data()[0];
                        return rect_d.depth >= 2 ? '#333' : 'white';
                    })
                    .attr("x", function (d, i) {
                        let p = d3.select(d3.select(this).node().parentNode);
                        let rect_d = d3.select(p.node().parentNode).data()[0];
                        let name = p.data()[0].data.name;
                        let yh = ((rect_d.x1 - rect_d.x0) - (name.length * font_size)) / 2;
                        let yy = name.length * (font_size + 10) - 10
                        return (yy <= (rect_d.x1 - rect_d.x0)) ? yh + i * (font_size + 2) : font_size + 2 + (i * 30);
                    })
                    .attr("y", function (d, i) {
                        let p = d3.select(d3.select(this).node().parentNode);
                        let rect_d = d3.select(p.node().parentNode).data()[0]
                        let name = p.data()[0].data.name;
                        let xw = ((rect_d.y1 - rect_d.y0 + font_size - 4) / 2);
                        //return isNaN(Number(d)) ? xw : xw+3.5;
                        return xw;
                    })
                    .text(function (d) {
                        return d;
                    });

                node_bar.append("title")
                    .text(function (d) {
                        if (!d.children)
                            return d.data.name + "\nError:" + d.data.r + "\nValue:" + d.value;
                        else
                            return d.data.name + "\nValue:" + d.value;
                    });

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
                    ////console.log(item,d3.select(item))
                    if (thisItem.node() != null) {
                        find_idx(sel_name, sel_machine);
                        thisItem
                            .classed('selected', true);
                        let item_sunburst_id = "#sunburst-" + sel_name + '-' + sel_machine;
                        d3.selectAll('.node-sunburst')
                            .classed('selected', false);
                        d3.select(item_sunburst_id)
                            .classed('selected', true);
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