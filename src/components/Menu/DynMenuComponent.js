/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated circle-pack
 */

import * as d3 from 'd3';

export class DynMenuComponent {
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
        let dyn_menu = this.dynMenu();

        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "dyn_menu")
            .style('display', 'inline-flex');

        this.state.sel = sel;
        this.state.el = dyn_menu();
        this.state.timeout = props.timeout;

        return this;
    }

    getComp() {
        return this.state.el;
    }

    dynMenu(){
        var container =  this.state.sel;
        var select = container
            .append('select')
            .attr('class','select')
            .on('change',onchange);

        var option_range = ['10min','30min','60min'];

        var options = select
            .selectAll('option')
            .data(option_range).enter()
            .append('option')
            .text(function (d) { return d; });

        function onchange() {
            let selectValue = container.select('select').property('value');
            container.append('p')
                .text(selectValue + ' is the last selected option.')
        };

        return container;
    }

}

