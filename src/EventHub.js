/*
    created date : 04/01/2018
    purpose : control dataflow from server to components
    note: request data using rest-api and return
 */


import {SunBurst} from "./components/DynamicChart/SunBurst";
import {Treemap} from "./components/DynamicChart/Treemap";
import {SmallMultiples} from "./components/DynamicChart/SmallMultiples";
import {CircePack} from "./components/DynamicChart/CirclePack";
import {TimeLine} from "./components/DynamicChart/TimeLine";
import {DirectedGraph} from "./components/DynamicChart/DirectedGraph";
import {CrashHist} from "./components/DataTable/CrashHist";
import {Partition} from "./components/DynamicChart/Partition";
import {ImportantTag} from "./components/DataTable/ImportantTag";
import {StopScatter} from "./components/DynamicChart/StopScatter";
import {PartitionOld} from "./components/DynamicChart/PartitionOld";

export class EventHub {
    constructor(props) {
        let datahub = props.datahub;
        this.datahub = datahub;
        this.treemap = new Treemap();
        this.partition = new Partition();
        this.partition_old = new PartitionOld();
        this.small_multi = new SmallMultiples();
        this.sunburst = new SunBurst();
        this.circlepack = new CircePack();
        this.timeline = new TimeLine();
        this.directed_graph_in = new DirectedGraph();
        this.directed_graph_out = new DirectedGraph();
        this.crash_hist = new CrashHist();
        this.impt_tags = new ImportantTag();
        this.stop_scatter = new StopScatter();
        datahub.updateCurrent(datahub.state.currentTree);
        return this;
    }

    globalTimer(t) {
        // update global state in t time
        return true;
    }

    update(interval, err_rate) {
        let eventhub = this;
        let datahub = this.datahub;
        let redraw = (interval,err_rate)=>{
            datahub.getTreemapData();
            // update current root node data;
            datahub.state.currentRoot.level = err_rate;
            datahub.state.currentRoot.interval = interval;

            // update treemap or partition
            let vRoot = datahub.updateCurrent(_.cloneDeep(datahub.state.currentTree)).vRoot;
            console.log(vRoot,'eventhub')
            //eventhub.treemap.state.chart.update(vRoot);
            eventhub.partition.state.chart.update(vRoot);
            // update sunburst
            if (eventhub.sunburst.state.init) {
                eventhub.sunburst.state.chart.update(_.cloneDeep(vRoot))
            }
            // update small_multi
            if (eventhub.small_multi.state.init) {
                eventhub.small_multi.state.set = new Set(vRoot.descendants().map(d => {
                    return d.data.name;
                }));
                eventhub.small_multi.state.chart.update(datahub.state)
            }
            // update timeline
            //eventhub.timeline.state.chart.update();
            //eventhub.small_multi.state.chart.update(dr);
            if (eventhub.stop_scatter.state.init) {
                datahub.getStopHistory(eventhub.stop_scatter.state.current)
                    .then(d=>{
                        eventhub.stop_scatter.state.chart.update(d)
                    })
            }

            eventhub.prevInterval = interval;
            eventhub.prevErr = err_rate;


            // update important tags
            //eventhub.impt_tags.
        }

        if ((self.prevInterval != null && self.prevInterval != interval) ||
            eventhub.timer != null ||
            (self.prevErr != null && self.err != err_rate)) {
            eventhub.stop();
            redraw(interval,err_rate);
        }
        eventhub.timer = setTimeout(function () {
            //self.state.chart.update(self.getData());
            redraw(interval,err_rate);
            eventhub.update(interval, err_rate)
        }, interval);
    }

    stop() {
        let eventhub = this;
        clearTimeout(eventhub.timer);
        eventhub.timer = null;
    }
}

