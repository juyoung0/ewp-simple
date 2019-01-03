/*
 writer : skyjin (dryjins@gmail.com)
 init: 2018-05-25
 purpose : animated treelist
 */

import * as d3 from 'd3';
import 'bootstrap-css-only/css/bootstrap-grid.min.css';
import './menu.css';
import menu_template from "./menu.html";
import html2canvas from 'html2canvas';
import { Base64 } from 'js-base64';
import * as pdfmake from 'pdfmake/build/pdfmake.js';
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// pdfMake.fonts = {
//     HANBatang: {
//         normal: 'HANBatang.ttf',
//         bold: 'HANBatang.ttf',
//         italics: 'HANBatang.ttf',
//         bolditalics: 'HANBatang.ttf'
//     }
// };

export class MenuComponent {
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
            .attr("id", "menu")
            .html(menu_template)
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
        let obj_self = this;



        setInterval(function () {
            let d= new Date();
            d3.select('#timer').text(d.toString().replace(/\(([^)]+)\)/,"").replace("GMT+0900","").trim());
        },1000)


        selection.selectAll('.btn-corr')
            .on('click',function (d) {
                selection.selectAll('.btn-corr')
                    .classed('active',false);

                d3.select(this)
                    .classed('active',true);

                let corr = d3.select(this).attr('class').split(' ')[0];

                switch (corr){
                    case 'btn-corr-affected':
                        obj_self.state.eventhub.partition.highlight(corr);
                        break;
                    case 'btn-corr-affecting':
                        obj_self.state.eventhub.partition.highlight(corr);
                        break;
                    default:
                        obj_self.state.eventhub.partition.highlight(corr);
                        break;
                }
            })

        let svg_tree = selection.select('#tree_legend');
        let svgWidth = this.state.width-4;
        let color = ["#fef0d9", "#fdcc8a", '#fc8d59', "#e34a33", '#b30000'];
        let margin_top = 5
        let legend = svg_tree.append('div')
            .style('display','flex')
            .style('margin-left','2px')

        let l_d = [1, 2, 3, 4, 5];
        let l_w = svgWidth / l_d.length;
        console.log('svg_tree',svg_tree,svgWidth,obj_self.state,l_w)

        let legend_g = legend.selectAll('.legends-rect')
            .data(l_d)
            .enter()
            .append('div')
            .style('background-color', function (d, i) {
                return color[i];
            })
            .text(function (d, i) {
                return '~' + d + '%'
            })
            .style("width", function (d, i) {
                console.log('width',l_w)
                return l_w+'px';
            })
            .style("height", function (d, i) {
                //return margin_top+'px';
            })
            .style('text-align','right')
            .style('color',function (d,i) {
                if (i == 4) return '#fff'
            })
            .style('font-size', '12px');


        function diagnosis_report(img, date){
            let result_content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam aliquam lectus elit, quis consequat neque aliquam sagittis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus vehicula eleifend orci mattis vulputate. Duis nec auctor dui, non condimentum diam. Integer libero lacus, dictum id gravida et, tincidunt quis lectus. Etiam vel orci feugiat, condimentum mi ac, volutpat ligula. Cras laoreet risus non sodales convallis.\n" +
                "\n" +
                "Praesent laoreet id augue at posuere. Etiam malesuada eros tincidunt purus laoreet, in pulvinar metus aliquam. Vestibulum ultrices hendrerit augue et rhoncus. Aliquam gravida neque id odio molestie, ut vehicula ante lacinia. Etiam pellentesque efficitur felis, vitae pellentesque orci faucibus ac. Ut et est at eros congue iaculis et vitae magna. Suspendisse potenti.\n" +
                "\n" +
                "Sed fringilla facilisis placerat. Donec bibendum ipsum sapien, quis finibus ligula rhoncus sed. Sed id lacus felis. Vivamus gravida ligula eget auctor laoreet. Fusce a scelerisque turpis. Praesent consectetur mattis purus. Donec sit amet mattis massa, a fermentum lacus. Maecenas fermentum ac risus ut suscipit. Sed vitae consequat leo. Nunc malesuada, nibh sit amet pretium dapibus, nisl ante accumsan elit, viverra venenatis sapien urna sit amet nunc. Aliquam sit amet dapibus turpis. Duis ultricies dui nulla, non tristique odio eleifend non. Praesent quis ex massa. Pellentesque vulputate pulvinar enim quis cursus. Aenean porta, nisi a condimentum dapibus, ex lorem dictum velit, eleifend suscipit lectus justo non nisl. Praesent et sem quis lectus dignissim eleifend non a felis.\n" +
                "\n" +
                "Ut facilisis ut nulla sit amet accumsan. Sed pharetra efficitur rutrum. Donec sem enim, faucibus at lorem vel, hendrerit fermentum risus. Vestibulum felis libero, varius ut maximus sed, maximus vel mi. Pellentesque rutrum sem mauris, pharetra porttitor tellus rhoncus suscipit. Sed et imperdiet sem, sit amet volutpat nulla. Fusce id iaculis arcu, dapibus pulvinar ipsum.\n" +
                "\n" +
                "Pellentesque non commodo metus, sed posuere ante. Pellentesque imperdiet arcu vitae arcu tempus ultrices. Nunc interdum purus id sapien finibus, ac malesuada nibh tincidunt. Aliquam hendrerit orci sit amet nisl ornare laoreet. Praesent volutpat mauris quis mi accumsan, vitae imperdiet dui semper. Donec convallis felis eu lacinia accumsan. Vivamus placerat in dolor et euismod. Phasellus turpis metus, aliquet et faucibus vel, vestibulum quis leo. Aliquam sit amet purus ac arcu posuere suscipit id non lectus. Integer viverra lacus in mauris fermentum auctor.";


            let log_data = "1381602978.263;43.169;2.732;54.098;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602978.328;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576\n" +
                "1381602979.327;0;1.031;98.969;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602980.328;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602981.327;1;0;99;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602982.327;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602983.327;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602984.327;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602985.327;0;0;99.010;0;0.990;0;0;0;0;0;77344768;81469440;148561920;737816576;0;16384;\n" +
                "1381602986.327;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602987.327;0.990;0;99.010;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602988.328;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602989.332;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602990.327;0;0;100;0;0;0;0;0;0;0;77344768;81469440;148561920;737816576;\n" +
                "1381602991.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381602992.328;1;0;99;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381602993.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381602994.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381602995.328;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381602996.327;0;0;99;0;0;1;0;0;0;0;77340672;81469440;148566016;737816576;0;\n" +
                "1381602997.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381602998.328;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381602999.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603000.328;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603001.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603002.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603003.327;0.990;0;99.010;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603004.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603005.327;0;1;99;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603006.328;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603007.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603008.328;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603009.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603010.327;1;0;99;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;\n" +
                "1381603011.327;0;0;100;0;0;0;0;0;0;0;77340672;81469440;148566016;737816576;";

            let docDefinition = {
                content: [
                    {
                        text: 'Report',
                        style: 'header'
                    },
                    "\n\n",
                    {
                        style: 'tableExample',
                        table: {
                            widths: [55, 150,50,'*'],
                            height: [20, 20, 60],
                            headerRows: 1,
                            body: [
                                [{text: 'Title', style: 'tableHeader',  alignment: 'center'},  {text: 'Emergency Diagnosis Reporting', colSpan:3, alignment: 'center'},{},{}],
                                [{text: 'Date', style: 'tableHeader',  alignment: 'center'}, {text: date.toString().slice(0,25),  alignment: 'center'},
                                    {text: 'Staff', style: 'tableHeader',alignment: 'center'}, {text: 'Sungahn Ko, Juyoung Oh, Dongyun Han',  alignment: 'center'}],
                                [ {text: 'Abstract',style: 'tableHeader',alignment: 'center'},
                                    {text:[
                                            {text: 'Facility:',fontSize: 15, bold: true}, ' BFPT\n',
                                            {text: 'Power Plant:',fontSize: 15, bold: true}, ' #8 \n',
                                            {text: 'Failure time:',fontSize: 15, bold: true} , date.toString().slice(0,25)+"\n",
                                            {text: 'Failure Category:',fontSize: 15, bold: true}, 'Unexpected Halt \n',
                                            {text: 'Rated Output(MW):',fontSize: 15, bold: true}, '500\n',
                                            {text: 'Facility Category:',fontSize: 15, bold: true}, 'Turbine \n',
                                            {text: 'Failure Resaon:',fontSize: 15, bold: true}, 'TB BFPT:A_L33LPSV_C: LP Stop Valve Closed'
                                        ], colSpan: 3},{},{} ]
                            ]
                        }
                    },
                    {
                        image: img,
                        width: 500,
                        alignment: 'center'
                    },
                    "\n\n"
                    ,
                    {
                        style: 'tableExample',
                        table: {
                            widths: [35,30,25,50,50,50,55, '*'],
                            height: [20, 20, '*'],
                            headerRows: 2,
                            body: [
                                [  {text: 'Detail', colSpan:8, style: 'tableHeader', alignment: 'center'},{},{},{},{},{},{},{}],
                                [  {text: 'Failure Place', style: 'tableHeader_detail', alignment: 'center'},
                                    {text: 'Failure Facility', style: 'tableHeader_detail', alignment: 'center'},
                                    {text: 'Power Plant(#)', style: 'tableHeader_detail', alignment: 'center'},
                                    {text: 'Failure Time', style: 'tableHeader_detail', alignment: 'center'},
                                    {text: 'Failure Category', style: 'tableHeader_detail', alignment: 'center'},
                                    {text: 'Facility Category', style: 'tableHeader_detail', alignment: 'center'},
                                    {text: 'Failure Reason', style: 'tableHeader_detail', alignment: 'center'},
                                    {text: 'Explanation ', style: 'tableHeader_detail', alignment: 'center', fontSize: 20},
                                ],
                                [{text: 'Boiler Feed Pump',  alignment: 'center'},
                                     'BFPT',1, '2018-07-17 12:00','load rejection','Turbine','Facility defection', 'BFPT (B) MP OB M / S Cooler : Rejection is occurred due to internal leakage'
                                ],
                                [{text: 'Boiler Feed Pump',  alignment: 'center'},
                                    'BFPT',4, '2018-07-07 08:00','planning stop','Turbine','Etc', 'BFPT-B: Maintenance suspension'
                                ],
                                [{text: 'Boiler Feed Pump',  alignment: 'center'},
                                    'BFP',8, '2018-07-06 21:00','Unexpected Halt','Turbine','Facility defection', 'BFPT A Main Pump Unit: Stopped by rising W / W temperature due to insufficient water supply'
                                ],
                                [{text: 'Aerophore',  alignment: 'center'},
                                    'PAF',2, '2018-07-05 17:00','load rejection','Boiler','Poor repair', 'PA Fan-A: Electric Fault'
                                ],
                                [{text: 'Aerophore',  alignment: 'center'},
                                    'PAF',4, '2018-07-05 16:00','dependent failure','Boiler','Poor repair', 'PA Fan-A: suspended by Boiler load rejection '
                                ],
                                [{text: 'Aerophore',  alignment: 'center'},
                                    'GGH',8, '2018-07-04 20:00','unplanned maintenance','Boiler','Facility defection', 'GAH Outlet Temp: Stopped for Maintenance'
                                ],
                                [{text: 'Boiler Tube',  alignment: 'center'},
                                    'Eco Tube',1, '2018-07-02 16:00','planning stop','Boiler','Facility defection', 'ECO Tube: Suspended by leakage'
                                ],
                                [{text: 'Boiler Tube',  alignment: 'center'},
                                    'W/W Tube',1, '2018-07-01 1:00','load rejection','Boiler','Poor Fuel', 'W/W Tube: Suspended by temperature'
                                ]
                            ]
                        }
                    },  {
                        style: 'tableExample',
                        table: {
                            widths: [55, '*'],
                            body: [
                                [{text: 'Causality', style: 'tableHeader',  alignment: 'center'},
                                    {text: "TB BFPT:A_L33LPSV_C: LP Stop Valve Closed   \n " +
                                        "<= \n" +
                                        "TB BFPT:A_L33HPSV_C: HP Stop Valve Closed\n" +
                                        "FW PT01A XQ01: BFPT Disch Press High > 388kg/cm^2\n" +
                                        "FW PT02A XQ01: BFPT BP Suction Pr Low-Low < 0.5kg/cm^2\n" +
                                        "FW PT03A XQ01: BFPT Suct Flow Hi-Hi\n" +
                                        "DW PT01A XQ01: BFPT MP Lube Oil Press Low < 0.8kg/cm^2\n" +
                                        "FW FCV01A YQ01: BFPT Suction Flow Low-Low < 0\n" +
                                        "FP XAPT21 MM ZQ05: BFPT Min. FCV Opened\n " +
                                        "HE LT01 M XQ03: FeedWater Tank Level Low-Low < 824mm\n"}]
                            ]
                        }
                    },
                    {
                        style: 'tableExample',
                        table: {
                            widths: ['*'],
                            // height: [200],
                            headerRows: 1,
                            body: [
                                [{text: 'Log Data', style: 'tableHeader',  alignment: 'center'}],
                                [{text: log_data}]
                            ]
                        }
                    }
                ],
                styles:{
                    header: {
                        fontSize: 22,
                        bold: true,
                        alignment: 'center'
                    },
                    tableExample: {
                        margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    },
                    tableHeader_detail: {
                        bold: true,
                        fontSize: 8,
                        color: 'black'
                    }
                }
                // ,
                // defaultStyle: {
                //     font: 'HANBatang'
                // }
            };



            let data = pdfMake.createPdf(docDefinition);
            data.getDataUrl(function(url){
                Email.sendWithAttachment(
                    "ivaderlab.unist@gmail.com",    //"from@you.com",
                    "ivaderlab.unist@gmail.com",    //"to@them.com",
                    "Diagnosis Report: Warning is detected.",           //     "Subject",
                    "This mail is for Diagnosis Report: Warning is detected.",//     "Body",
                    "smtp.gmail.com",               //     "host.yourisp.com",
                    "ivaderlab.unist@gmail.com",    //     "username",
                    "ivaderlab.unist.ac.kr",        //     "password",
                    url,                //   "attachment"
                    function done(message) {console.log(message); alert("reporing!");}
                );
            });
        }

        selection.select('button.btn-update').on('click', function (d) {
            console.log(d, 'test', selection.select('button.btn-update').property("value"), self.state);
            let sec = d3.select('#input_interval').property("value");
            let err = d3.select('#input_err_rate').property("value");
            sec = sec == "" ? 60000 : sec * 1000;
            err = err == "" ? 0.6 : err / 100;

            obj_self.state.eventhub.update(sec, err)
        })

        selection.select('button.btn-save').on('click', function (d) {
            let el = document.querySelector("div.lm_root");
            let img;
            let dt;

            html2canvas(el,{scale:3}).then(canvas => {
                console.log(canvas)
                dt = new Date();
                img = canvas.toDataURL("image/png");
                let downloadLink = document.createElement("a");
                downloadLink.href = img;
                downloadLink.download = dt;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                //2018.07.06 added by dyhan
                diagnosis_report(img, new Date());
            });
        })
    }
}

