/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated treelist
 */

import * as d3 from 'd3';
import 'bootstrap-css-only/css/bootstrap-grid.min.css';
import './menu.css';
import sim_template from "./sim.html";

export class SimComponent {
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
        // init treelist
        // invoke the chart
        let el = document.createElement('div');
        let sel = d3.select(el)
            .attr("id", "sim_menu")
            .html(sim_template)
        //.style('display', 'inline-flex');



        this.menu(sel);
        this.state.el = el;
        this.state.sel = sel;
        return this;
    }

    getComp() {
        return this.state.el;
    }

    menu(s) {
        let selection = s;
        if (selection == undefined) {
            console.error("selection is undefined");
            return;
        }
        let self = this;

        //$('.datepicker').datepicker();


        selection.select('#btn_sim').on('click',function (d) {
            console.log('btn_sim')
            alert("Simulation starts.")
            let sim_set = false;
            let sim = setInterval(function(){
                if (sim_set == false){
                    sim_set = true;
                    self.state.datahub.getSimulation(sim_set).then(res=>{
                        if (res == false) {
                            alert("Simulation ends.")
                            clearInterval(sim);
                        }
                        else{
                            self.state.eventhub.partition_old.state.chart.update(res);
                        }
                    })
                }
                else{
                    self.state.datahub.getSimulation(sim_set).then(res=>{
                        if (res == false) {
                            alert("Simulation ends.")
                            clearInterval(sim);
                        }
                        else{
                            self.state.eventhub.partition_old.state.chart.update(res);
                        }
                    })
                }

                },
                180000);
        })
    }
}

