/*
    created date : 04/01/2018
    purpose : control dataflow from server to components
    note: request data using rest-api and return
 */

import * as d3 from 'd3';
import _ from 'lodash';

export class DataHub {
    constructor(props) {
        this.state = {
            history: {keys: [], size: 0, machines: {1: {}, 2: {}}, dt: new Date(2018, 7, 11)},
            currentRank: [],
            currentTree: {},
            corr: {},
            crashHist: [],
            currentRoot: {
                name: 'EWP',
                machine: null,
                '호기': 'ewp',
                level: 0.01,
                interval: 60000,
                vRoot: null,
                nameSet: new Set()
            }
        };
        let self = this;

        async function loadCrashHist() {
            const data = await d3.csv('data/ewp정지자료.csv');
            self.state.crashHist = data;
            return data;
        }

        this.loadCrashHist = loadCrashHist;
        //this.state.currentRank = loadTree();
        //this.state.history = loadHist();
        //console.log(loadHist())
        //this.state.currentRoot.nameSet = new Set(this.state.currentRank.map(d => d.name));
        return this
    }

    async preload() {
        this.state.currentTree = await this.getTreemapData();
        this.state.history = await this.gethistory();
        this.state.currentRank = this.state.history.keys;
        this.state.corr = await this.getCorr("5");
        console.log(this.state.history, this.state.currentRank)
        this.state.currentRoot.nameSet = new Set(this.state.currentRank.map(d => d.name));
        this.updateCurrent(this.state.currentTree);
        if (this.state.currentRank.length == 0) {
            this.state.currentRank = _.orderBy(_.map(_.filter(this.state.currentRoot.vRoot.leaves(), d => d.data.r), d => d.data), 'r', 'desc')
            console.log('currentRank', this.state.currentRank)
        }
        return this.state;
    }

    getData() {
        return this.state;
    }

    globalTimer(t) {
        // update global state in t time
        return true;
    }

    async getCorr(machine) {
        let param = {"machine": machine};
        let requestCorrData = async () => {
            let url = '/api/correlation';
            const response = await fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(param)
                });
            const data = await response.json();
            return data;
        }
        const data = await requestCorrData();
        console.log(data)
        return data;
    }

    updateCurrent(data) {
        let level = this.state.currentRoot.level;
        let interval = this.state.currentRoot.interval;

        //console.log('updateCurrent',level,interval);
        function searchTree(element, name, machine) {
            if (element.name == name && element.machine == machine) {
                return element;
            } else if (element.children != null) {
                var i;
                var result = null;
                for (i = 0; result == null && i < element.children.length; i++) {
                    result = searchTree(element.children[i], name, machine);
                }
                return result;
            }
            return null;
        }

        function filterRoot(element, parent, level) {
            if (element.children != null) {
                var i;
                var result = null;
                for (i = 0; result == null && i < element.children.length; i++) {
                    filterRoot(element.children[i], element, level);
                }
            } else {
                parent.children = parent.children.filter(d => {
                    return d.r > level;
                })
            }
            return parent;
        }

        function filterRoot(element, parent, machine) {
            if (!element.machine)
                element.machine = parent.machine;
            if (element.children != null) {
                var i;
                var result = null;
                for (i = 0; result == null && i < element.children.length; i++) {
                    filterRoot(element.children[i], element, machine);
                }
            }
            return parent;
        }


        //console.log('updateCurrent', data, this.state.currentRoot.name, this.state.currentRoot.machine, this.state.currentRoot.level)
        // find root node from the explorer
        if (this.state.currentRoot.name != "EWP") {
            data = searchTree(data, this.state.currentRoot.name, this.state.currentRoot.machine);
        }
        let cd = _.cloneDeep(data);
        data = filterRoot(cd, cd, level);

        let vRoot = d3.hierarchy(data)
            .sum(function (d) {
                return d.r ? 1 : 0;
            }).sort(function (a, b) {
                return b.data.r - a.data.r;
            });

        this.state.currentRoot.vRoot = vRoot;
        this.state.currentRoot.nameSet = new Set(vRoot.descendants().map(d => d.data.name));
        return this.state.currentRoot;
    }

    async getStopData(date) {
        let param = {date}

        let requestStopData = async () => {
            let url = '/api/stopdata';
            const response = await fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(param)
                });
            const data = await response.json();
            let vRoot = d3.hierarchy(data)
                .sum(function (d) {
                    return d.r ? 1 : 0;
                }).sort(function (a, b) {
                    return b.data.r - a.data.r;
                });
            return vRoot;
        }
        const data = await requestStopData();

        return data;

    }

    storeData_de(data) {
        // iterate the new data object then push into the history

        var self = this.state;
        let formatTime = d3.timeFormat("%B %d, %Y %I %p %I:%M %S .%L");

        function addMinutes(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        let d0 = addMinutes(self.history.dt, 1);
        let dt = formatTime(d0);

        self.history.dt = d0;

        if (self.history['keys'] === [])
            self.history['keys'] = Object.keys(data);

        self.history['size'] = self.history['size'] + 1;
        let current = [];
        let store = (d) => {
            if (d.children) {
                d.children.forEach(store)
            }
            else {
                let name = d.name;
                let 호기 = d.호기;
                let 계통 = d.계통;
                let 설비 = d.설비;
                let newData = {name, 호기, 계통, 설비, dt, r: d.r, v: Math.round(Math.random() * 1000)};
                // keep current data to get the rank
                current.push(newData);
                if (self.history['machines'][호기] != null && (name in self.history['machines'][호기])) {
                    self.history['machines'][호기][name].push(newData);
                }
                else if (self.history['machines'][호기]) {
                    self.history['machines'][호기][name] = [newData];
                }
                else {
                    self.history['machines'][호기] = {}
                }
            }
        };
        // update rank
        let limit = 18144000;
        let checkSize = (d) => {
            if (d.size > limit) {
                d.keys.forEach((name) => {
                    //console.log(name)
                    d['machines'][호기][name].shift();
                })
            }
        };
        // iterate
        store(data);
        // keep data size under the limit
        checkSize(self.history);
        self.currentRank = _.orderBy(current, 'r', 'desc');

        ////console.log(self.currentRank);
        return self.history;
    }

    getRank(data) {

        self.currentRank = _.orderBy(current, 'r', 'desc');

        ////console.log(self.currentRank);
        return self.history;
    }

    getGraphData(node) {
        let data = _.cloneDeep(this.state.currentRank).filter(d => d != node);
        node.id = node.호기 + '-' + node.name;
        node.label = node.id + '-' + node.r;

        function pickCandidates(c, times) {
            let results = [];
            for (let i = 0; i < times; i++) {
                let r = d3.scaleLinear().domain([0, 1]).range([0, c.length - 1]);
                let x = c[Math.round(r(Math.random()))];
                x.id = x.호기 + '-' + x.name;
                x.label = x.id + '-' + x.r;
                results.push(x);
                let index = c.indexOf(x);
                if (index !== -1) c.splice(index, 1);
            }
            return [results, c];
        }

        function createLinks(nodes, thisNode) {
            let [from, to] = pickCandidates(nodes, 4);
            to = to.filter(d => d != thisNode);
            return from.map(d => {
                return {"source": d.id, "target": thisNode.id, "type": thisNode.계통}
            })
                .concat(to.map(d => {
                    return {"source": thisNode.id, "target": d.id, "type": thisNode.계통}
                }));
        }

        let nodes = [node].concat(pickCandidates(data, 8)[0]);
        let links = createLinks(_.cloneDeep(nodes), node);
        return {nodes, links};
    }

    async getTimelineData(tag) {
        let param = {"date": "2015-01-01T00:00:00.000Z", "date2": "2015-01-13T21:20:00.000Z", "tag": tag};
        let requestTimelineData = async () => {
            let url = '/api/data';
            const response = await fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(param)
                });
            const data = await response.json();
            return data;
        }
        const data = await requestTimelineData();
        console.log(data)
        return data;
    }

    async loadImportant() {
        let requestImportantData = async () => {
            let url = '/api/important';
            const response = await fetch(url);
            const data = await response.json();
            return data;
        }
        const data = await requestImportantData();
        console.log(data)
        return data;
    }

    async getTreemapData(start_time, interval) {
        // request data for the treemap from start_time with the interval and return it
        let requestTreemapData = async () => {
            let url = '/api/json';
            const response = await fetch(url);
            const data = await response.json();
            return data;
        }
        const data = await requestTreemapData();
        return data;
    }

    async getStopHistory(tag) {
        let param = {"tag": tag};
        let requestStopHistory = async () => {
            let url = '/api/stop';
            const response = await fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(param)
                });
            const data = await response.json();
            return data;
        }
        const data = await requestStopHistory();
        return data;
    }

    async gethistory(start_time, tags) {
        let requestHistory = async () => {
            let url = '/api/history';
            const response = await fetch(url);
            const data = await response.json();
            return data;
        }
        const data = await requestHistory();
        return data;
    }

    async getSimulation(setup, start_date, end_date, interval) {
        console.log('getSimulation')
        let requestSimulation = async () => {
            let url = '/api/simulation';
            let param = {"start": "2017-12-01T00:00:00.000Z", "end": "2017-12-02T00:00:00.000Z", "interval": "1"};

            if (setup) {
                const response = await fetch(url,
                    {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(param)
                    });
                const data = await response.json();
                return data;
            }
            else {
                const response = await fetch(url);
                const data = await response.json();
                return data;
            }
        }
        const data = await requestSimulation();
        if (data == {}) return false;
        let vRoot = d3.hierarchy(data)
            .sum(function (d) {
                return d.r ? 1 : 0;
            }).sort(function (a, b) {
                return b.data.r - a.data.r;
            });
        console.log('getsim',vRoot)
        return vRoot;
    }
}

