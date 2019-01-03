import {DataHub} from "./DataHub";
import {EventHub} from "./EventHub";
import {DetailComponent} from "./components/Detail/DetailComponent";
import {OverviewComponent} from "./components/Overview/OverviewComponent";
import {Explorer} from "./components/DynamicChart/Explorer";
import {MenuComponent} from "./components/Menu/MenuComponent";
// import css
import 'bootstrap-css-only/css/bootstrap.min.css';
import './layout.css';
import 'datatables.net';
import dt from 'datatables.net-bs';
import {SimComponent} from "./components/Menu/SimComponent";

export class LayoutComponent {
    // setup layout config
    constructor() {
        let config = {
            content: [{
                type: 'column',
                content: [
                    {
                        type: 'row',
                        content: [{
                            type: 'column',
                            width: 15,
                            content: [{
                                type:'stack',
                                content:[
                                    {
                                        type: 'component',
                                        componentName: 'MenuComponent',
                                        title: 'Menu',
                                    },
                                    {
                                        type: 'component',
                                        componentName: 'SimComponent',
                                        title: 'Simulation',
                                    }
                                ]
                            },
                                {
                                    type: 'stack',
                                    content: [
                                        {
                                            type: 'component',
                                            componentName: 'Explorer',
                                        },
                                        {
                                            type: 'component',
                                            componentName: 'CrashHist'
                                        }
                                    ]
                                }

                            ]
                        }, {
                            type: 'column',
                            content: [
                                {
                                    type: 'row',
                                    height: 75,
                                    content: [
                                        {
                                            type: 'stack',
                                            width: 35,
                                            content: [
                                                /*
                                                {
                                                    type: 'component',
                                                    componentName: 'DynamicChartComponent.treemap',
                                                    title:'Treemap'
                                                },
                                                */
                                                {
                                                    type: 'component',
                                                    componentName: 'DynamicChartComponent.partition',
                                                    title: 'Partition'
                                                },
                                                {
                                                    type: 'component',
                                                    componentName: 'DynamicChartComponent.sunburst',
                                                    title: 'Sunburst'
                                                },
                                                /*
                                                {
                                                    type: 'component',
                                                    componentName: 'DynamicChartComponent.circlepack',
                                                },
                                                */
                                                {
                                                    type: 'component',
                                                    componentName: 'OverviewComponent'
                                                }
                                            ]
                                        },{
                                            type:'stack',
                                            width: 35,
                                            content:[ {
                                                type: 'component',
                                                componentName: 'ImptTags',
                                                title: 'Critical Tags'
                                            }
                                            , {
                                                    type: 'component',
                                                    componentName: 'DynamicChartComponent.partition_old',
                                                    title: 'Partition Prev'
                                                }
                                            ]
                                        },
                                        {
                                            type: 'row',
                                            width: 15,
                                            content: [{
                                                type: 'component',
                                                width: 30,
                                                componentName: 'DynamicChartComponent.real_time_error',
                                                title: 'Error Prob.'
                                            }]
                                        }


                                    ]
                                }

                            ]
                        }]
                    },
                    {
                        type: 'stack',
                        height: 25,
                        content: [
                            {
                                type: 'component',
                                componentName: 'TimeLineComponent',
                                title: "Time Line"
                            },
                            {
                                type: 'component',
                                componentName: 'StopScatterComponent',
                                title: "Stop History"
                            },
                            {
                                type: 'component',
                                componentName: 'DetailComponent',
                                title: 'Detail'
                            }
                        ]
                    }
                ]
            }]
        };
        let self = this;

        // create components store
        let datahub = new DataHub();
        let eventhub = new EventHub({datahub: datahub});
        // register layout
        let myLayout = new GoldenLayout(config);
        // display layout
        this.state = {config, myLayout, datahub, eventhub};
        // init components when datahub is ready
        datahub.preload().then(res=>{
            self.init();

        });

        return this
    }

    init() {
        let self = this;
        let myLayout = this.state.myLayout;
        let datahub = this.state.datahub;
        let eventhub = this.state.eventhub;
        dt(window, $);


        let el = document.querySelector('div.ajax-loader')
        el.style.display='none';

        // register components
        myLayout.registerComponent('testComponent', function (container, componentState) {
            container.getElement().html('<div id="' + componentState.componentName + '"></div>');
        });
        myLayout.registerComponent('Relation', function (container, componentState) {
            container.on('open', () => {
                container.getElement().html('<div id="' + componentState.componentName + '" width="100%" height="' + container.height + '"></div>');
            });
        });
        myLayout.registerComponent('DynamicChartComponent.circlepack', function (container, componentState) {
            container.on('open', () => {
                let props = {container};
                props.datahub = datahub;
                props.eventhub = eventhub;
                //let comp = eventhub.circlepack.init(props);
                //container.getElement().html(comp.getComp());
                //eventhub.circlepack.state.chart.update(datahub.state.currentRoot.vRoot);
            })
        });
        myLayout.registerComponent('DynamicChartComponent.real_time_error', function (container, componentState) {
            // create 9 sensors for demo
            container.on('open', () => {
                let props = {container};
                props.datahub = datahub;
                props.eventhub = eventhub;
                let comp = eventhub.small_multi.init(props);
                container.getElement().html(comp.getComp());
                // @todo register data update event
                comp.state.chart.update(datahub.state);
            })
        });
        myLayout.registerComponent('StopScatterComponent', function (container, componentState) {
            // create 9 sensors for demo
            container.on('open', () => {

                let props = {container};
                if (!props.container.width) {
                    props.container.width = container.getElement().parent().width();
                    props.container.height = container.getElement().parent().height();
                }
                props.datahub = datahub;
                props.eventhub = eventhub;
                let comp = eventhub.stop_scatter.init(props);
                container.getElement().html(comp.getComp());
            })
        });
        myLayout.registerComponent('DynamicChartComponent.partition', function (container, componentState) {
            container.on('open', () => {
                let props = {container};
                props.datahub = datahub;
                props.eventhub = eventhub;
                let comp = eventhub.partition.init(props);
                container.getElement().html(comp.getComp());
                eventhub.partition.state.chart.update(datahub.state.currentRoot.vRoot);
            });
        });
        myLayout.registerComponent('DynamicChartComponent.partition_old', function (container, componentState) {
            container.on('open', () => {
                let props = {container};
                props.datahub = datahub;
                props.eventhub = eventhub;
                let comp = eventhub.partition_old.init(props);
                container.getElement().html(comp.getComp());
                //eventhub.partition_old.state.chart.update(datahub.state.currentRoot.vRoot);
            });
        });
        myLayout.registerComponent('CrashHist', function (container, componentState) {
                container.on('open', () => {
                    let props = {container};
                    props.datahub = datahub;
                    props.eventhub = eventhub;
                    let comp = eventhub.crash_hist.init(props);
                    container.getElement().html(comp.getComp());
                    // @todo register data update event
                    datahub.loadCrashHist().then(d => {
                        eventhub.crash_hist.state.chart.update(d);
                        $('#crashHist').find('tbody')
                            .css('height', container.getElement().parent().height() - d3.select('#crashHist > table> thead').node().offsetHeight);
                        let s = d3.select('#crashHist > table> tbody > tr > td');
                        if (s._groups[0][0] != null) {
                            d.columns.forEach((item, idx) => {
                                d3.select('#crashHist > table> thead > tr > th:nth-child(' + (idx + 1) + ')').style('width', d3.select('#crashHist > table> tbody > tr > td:nth-child(' + (idx + 1) + ')').style('width'));
                            });
                        }
                    });
                })

            myLayout.registerComponent('ImptTags', function (container, componentState) {
                container.on('open', () => {
                    let props = {container};
                    props.datahub = datahub;
                    props.eventhub = eventhub;
                    let comp = eventhub.impt_tags.init(props);
                    container.getElement().html(comp.getComp());
                    // @todo register data update event
                    datahub.loadImportant().then(d=>{
                        eventhub.impt_tags.state.chart.update(d);
                        function waitRender () {
                            if ($('#important_tag_table > tbody > tr > td:nth-child(1)').width() == undefined) {
                                setTimeout(waitRender, 500); // give everything some time to render
                            }
                            if ($('#important_tag_table > tbody > tr > td:nth-child(1)').width()<0) {
                                setTimeout(waitRender, 500); // give everything some time to render
                            }
                            else{
                                console.log($('#important_tag_table > tbody > tr > td:nth-child(1)').width())
                                $(document).ready( function () {
                                   // $('#important_tag_table').DataTable().clear();
                                    //$('#important_tag_table').DataTable().destroy();
                                    $('#important_tag_table').DataTable({
                                        paging: false,
                                        scrollY: container.getElement().height()-90,
                                        dom:'<"search"f><"top"l>rt<"bottom"ip><"clear">'
                                    });
                                } );
                                /*
                                $('#important_tag_table').find('tbody')
                                    .css('height', container.getElement().parent().height() - d3.select('#important_tag_table > thead').node().offsetHeight);
                                let s = d3.select('#important_tag_table >  tbody > tr > td');
                                if (s._groups[0][0] != null) {
                                    "0".repeat(6).split("").forEach((item, idx) => {
                                        console.log('test', $('#important_tag_table > tbody > tr > td:nth-child(' + (idx + 1) + ')').width())

                                        $('#important_tag_table >  thead > tr:nth-child(2) > th:nth-child(' + (idx + 1) + ')').width($('#important_tag_table > tbody > tr > td:nth-child(' + (idx + 1) + ')').width());
                                    });
                                }
                                */
                            }
                        }
                        waitRender();


                                            })
                });
            })

            container.on('resize', () => {
            })
        });
        myLayout.registerComponent('DynamicChartComponent.sunburst', function (container, componentState) {
            container.on('open', () => {
                let props = {container};
                props.container.el = container.getElement();
                props.datahub = datahub;
                props.eventhub = eventhub;
                if (!props.container.width) {
                    props.container.width = container.getElement().parent().width();
                    props.container.height = container.getElement().parent().height();
                    container.getElement().css('display', 'inline-flex');
                    console.log(props)
                    let comp = eventhub.sunburst.init(props);
                    container.getElement().html(comp.getComp());
                    eventhub.sunburst.state.chart.update(datahub.state.currentRoot.vRoot);
                }
                // @todo register data update event러
                // 보
                //comp.runDemo();
            });
        });
        myLayout.registerComponent('TimeLineComponent', function (container, componentState) {
            container.on('open', () => {
                let props = {container};
                props.datahub = datahub;
                props.eventhub = eventhub;
                datahub.getTimelineData(datahub.state.currentRank[0]['name'])
                    .then(res=>{
                        props.data = res;
                        console.log(props.data);
                        let comp = eventhub.timeline.init(props);
                        container.getElement().html(comp.getComp());
                    })
            })
        });
        myLayout.registerComponent('Explorer', function (container, componentState) {
            container.on('open', () => {
                let props = {container};
                container.getElement().css('overflow-y', 'auto');
                props.datahub = datahub;
                props.eventhub = eventhub;
                //console.log('eventhub', eventhub)
                var comp = new Explorer(props);
                eventhub.explorer = comp;
                container.getElement().html(comp.getComp());
            })
        });
        myLayout.registerComponent('DetailComponent', function (container, componentState) {
            container.on('open', () => {
                let props = {container};
                let comp = new DetailComponent(props);
                container.on('show', () => {
                    ////console.log('show')
                    container.getElement().html(comp.getComp());
                });
                container.on('open', () => {
                    container.getElement().html(comp.getComp());
                })
            })
        });
        myLayout.registerComponent('OverviewComponent', function (container, componentState) {
            let props = {container};
            props.datahub = datahub;
            props.eventhub = eventhub;
            let comp = new OverviewComponent(props);

            container.on('open', () => {
                container.getElement().html(comp.getComp());
            })
        });
        myLayout.registerComponent('MenuComponent', function (container, componentState) {

            container.on('open', () => {
                let props = {container};
                props.datahub = datahub;
                props.eventhub = eventhub;
                props.container.width = container.getElement().parent().width();
                let comp = new MenuComponent(props);
                container.getElement().html(comp.getComp());
                let mh = $('#menu').height();
                console.log('MenuComp',mh);
                container.setSize(false, mh);
                //myLayout.root.getItemsById("MenuComponent")[0].parent.config.height = mh;
                myLayout.updateSize();
            })
        });

        myLayout.registerComponent('SimComponent', function (container, componentState) {

            let props = {container};
            props.container.width = container.getElement().parent().parent().width();
            props.datahub = datahub;
            props.eventhub = eventhub;
            let comp = new SimComponent(props);

            container.on('tab', () => {
                container.getElement().html(comp.getComp());
                let mh = $('#sim_menu').height();
                container.setSize(false, mh);

            })
        });

        self.state.myLayout.init();
        self.state.eventhub.update(60000 * 10, 0.01);

    }

    getState() {
        return this.state;
    }
}