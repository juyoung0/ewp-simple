/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : show previous crash history
 */
import * as d3 from 'd3';
import './imptTags.css'
export class CrashHist {
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
        let createTable = this.createTable();

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "crashHist")
            .style('background','white')

        sel.call(createTable);
        this.state.el = el;
        this.state.sel = sel;
        this.state.chart = createTable;
        return this;
    }

    getComp() {
        return this.state.el;
    }

    createTable() {
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
            let table = selection.append('table')
                .attr('width','100%')
                .attr('id','crash_hist_table')
                .attr('class','fixed_headers');

            let thead = table.append('thead')
                //.attr('class','thead-light')
                .style('display','table');

            let tbody = table.append('tbody')
                .style('display','block')
                .style('overflow-y','auto');

            let input =thead.append('tr')
                .append('th')
                .attr('colspan',17)
                .append('input')
                .attr('id','hist_input')
                .attr('class','form-control input input-sm')
                .attr('width','100%')
                .attr('placeholder','Search');

            function findItem(text) {

            }

            function update(data) {
                if (!data) return;

                let header = data.columns;

                console.log(header,data)

                thead.append('tr')
                    .selectAll('th')
                    .data(header)
                    .enter()
                    .append('th')
                    .text(d=>d);

                let tr = tbody.selectAll('tr')
                    .data(data)
                    .enter()
                    .append('tr');

                tr.selectAll('td')
                    .data(d=>{return header.map(item=>d[item])})
                    .enter()
                    .append('td')
                    .text(d=>d);

                input.on('keypress',function (d) {
                    let text = d3.select('#hist_input').node().value;
                    tr.style('display','none');

                    tr.filter(d=>{
                          return JSON.stringify(d).indexOf(text) !=-1;
                      })
                      .style('display','block')
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
        // end createTable
        return chart;
    }
}