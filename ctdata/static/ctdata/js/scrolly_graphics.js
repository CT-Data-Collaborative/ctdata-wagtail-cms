var scrollVis = function () {
    var margin = {top: 40, right: 20, bottom: 30, left: 50},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var t = d3.transition()
        .duration(500)
        .ease(d3.easeLinear);

    var t2 = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    var units = "Filings";
    var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scaleOrdinal(d3.schemeCategory20);

    var migration_data = null;
    var lastIndex = -1;
    var activeIndex = 0;

    var svg = null;
    var g = null;

    // parse the date / time
    var parseTime = d3.timeParse("%Y");

    // set the ranges

    // Migration Data
    var migrationLineX = d3.scaleTime().range([0, width]);
    var migrationLineY = d3.scaleLinear().range([height, 0]);

    var xAxisMigration = d3.axisBottom().scale(migrationLineX);
    var yAxisMigration = d3.axisLeft().scale(migrationLineY);

    // Indexed Population Data
    var indexedPopLineX = d3.scaleTime().range([0, width]);
    var indexedPopLineY = d3.scaleLinear().range([height, 0]);

    var xAxisIndexedPop = d3.axisBottom().scale(indexedPopLineX);
    var yAxisIndexedPop = d3.axisLeft().scale(indexedPopLineY);

    // CT Population
    var populationLineX = d3.scaleTime().range([0, width]);
    var populationLineY = d3.scaleLinear().range([height, 0]);

    var xAxisPopulation = d3.axisBottom().scale(populationLineX);
    var yAxisPopulation = d3.axisLeft().scale(populationLineY).tickFormat(d3.formatPrefix(".1", 1e6));

    // Births
    var birthsLineX = d3.scaleTime().range([0, width]);
    var birthsLineY = d3.scaleLinear().range([height, 0]);

    var xAxisBirths = d3.axisBottom().scale(birthsLineX);
    var yAxisBirths = d3.axisLeft().scale(birthsLineY);

    // net migration
    var net_line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return migrationLineX(d.year);
        })
        .y(function (d) {
            return migrationLineY(d.net);
        });

    // international migration
    var international_line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return migrationLineX(d.year);
        })
        .y(function (d) {
            return migrationLineY(d.international);
        });

    // domestic migration
    var domestic_line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return migrationLineX(d.year);
        })
        .y(function (d) {
            return migrationLineY(d.domestic);
        });

    var reference_line = d3.line()
        .x(function (d) {
            return migrationLineX(d.year);
        })
        .y(function () {
            return migrationLineY(0);
        });

    var ctIndexedLine = d3.line()
        .curve(d3.curveNatural)
        .x(function(d) {
            return indexedPopLineX(d.year)
        })
        .y(function(d) {
            return indexedPopLineY(d.connecticut)
        });

    var neIndexedLine = d3.line()
        .curve(d3.curveNatural)
        .x(function(d) {
            return indexedPopLineX(d.year)
        })
        .y(function(d) {
            return indexedPopLineY(d.new_england)
        });

    var neighboringIndexedLine = d3.line()
        .curve(d3.curveNatural)
        .x(function(d) {
            return indexedPopLineX(d.year)
        })
        .y(function(d) {
            return indexedPopLineY(d.neighboring)
        });

    // CT Population Graph
    var populationCTLine = d3.line()
        .curve(d3.curveNatural)
        .x(function(d) {
            return populationLineX(d.year)
        })
        .y(function (d) {
            return populationLineY(d.population)
        });

    // Births

    var birthsLine = d3.line()
        .curve(d3.curveNatural)
        .x(function(d) {
            return birthsLineX(d.year)
        })
        .y(function (d) {
            return birthsLineY(d.births)
        });

    // When scrolling to a new section, the scroller will pass
    // back the name of the graphic transition that has been attached.
    // The correction function for that section will be called to initiate
    // the transitions.
    var activateFunctions = {};

    var updateFunctions = [];
    /**
     * chart
     *
     * @param selection - the current d3 selection(s)
     *  to draw the visualization in. For this
     *  example, we will be drawing it in #vis
     */

    var chart = function (selection) {
        selection.each(function (rawData) {
            // create svg and give it a width and height
            svg = d3.select(this).selectAll('svg').data([migrationData]);
            var svgE = svg.enter().append('svg');

            // @v4 use merge to combine enter and existing selection
            svg = svg.merge(svgE);

            svg.attr('width', width + margin.left + margin.right);
            svg.attr('height', height + margin.top + margin.bottom);

            svg.append('g');

            g = svg.select('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


            var migrationData = getMigrationData(rawData);
            var indexedPopulationData = getIndexedPopulation(rawData);
            var flowData = getFlowData(rawData);
            var birthsData = getBirthsData(rawData);
            var populationData = getCTPopulation(rawData);

            setupVis(migrationData, indexedPopulationData, flowData, birthsData, populationData);

            setupSections();
        });
    };

    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param migrationData - data object for migration series.
     */

    var setupVis = function (migrationData, indexedPopulationData, flowData, birthsData, populationData) {

        console.table(populationData);


        // Migration Data
        migrationLineX.domain(d3.extent(migrationData, function (d) {
            return d.year;
        }));

        var migration_max_y = d3.max(migrationData, function (d) {
            return Math.max(d.net, d.domestic, d.international);
        });

        var migration_min_y = d3.min(migrationData, function (d) {
            return Math.min(d.net, d.domestic, d.international);
        });

        migrationLineY.domain([migration_min_y + migration_min_y * .1, migration_max_y + migration_max_y * .1]);

        // IndexedPopulation Data

        indexedPopLineX.domain(d3.extent(indexedPopulationData, function (d) {
            return d.year;
        }));

        var indexedPopMaxY = d3.max(indexedPopulationData, function (d) {
            return Math.max(d.connecticut, d.neighboring, d.new_england);
        });


        var indexedPopMinY = d3.min(indexedPopulationData, function (d) {
            return Math.min(d.connecticut, d.neighboring, d.new_england);
        });

        indexedPopLineY.domain([indexedPopMinY - indexedPopMinY * .025, indexedPopMaxY + indexedPopMaxY * .025]);

        // CT Population Data

        var popExtent = d3.extent(populationData, function (d) {
            return d.population;
        });

        populationLineY.domain([popExtent[0] - popExtent[0] * .025, popExtent[1] + popExtent[1] * .025]);

        populationLineX.domain(d3.extent(populationData, function (d) {
            return d.year;
        }));


        // Births Data
        var birthCountExtent = d3.extent(birthsData, function(d) {
            return d.births;
        });

        birthsLineY.domain([birthCountExtent[0] - birthCountExtent[0] * .025, birthCountExtent[1] + birthCountExtent[1] * .025]);

        birthsLineX.domain(d3.extent(birthsData, function(d) {
            return d.year;
        }));

        function axisFactory(target, id_base, type, axis) {
            if (type === 'x') {
                return target.append('g')
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", type + " axis")
                    .attr("id", id_base + "_" + type + "_axis")
                    .style('opacity', 0)
                    .call(axis);
            } else {
                return target.append('g')
                    .attr("class", type + " axis")
                    .attr("id", id_base + "_" + type + "_axis")
                    .style('opacity', 0)
                    .call(axis);
            }
        }

        //Population Axes
        g.append('g')
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .attr("id", "population_x_axis")
            .style('opacity', 0)
            .call(xAxisPopulation);

        g.append('g')
            .attr("class", "y axis")
            .attr("id", "population_y_axis")
            .style('opacity', 0)
            .call(yAxisPopulation);


        // Migration Axes
        g.append('g')
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .attr("id", "migration_x_axis")
            .style('opacity', 0)
            .call(xAxisMigration);

        g.append('g')
            .attr("class", "y axis")
            .attr("id", "migration_y_axis")
            .style('opacity', 0)
            .call(yAxisMigration);

        // Indexed Population Axes
        g.append('g')
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .attr("id", "indexed_pop_x_axis")
            .style('opacity', 0)
            .call(xAxisIndexedPop);

        g.append('g')
            .attr("class", "y axis")
            .attr("id", "indexed_pop_y_axis")
            .style('opacity', 0)
            .call(yAxisIndexedPop);

        // Births Axes
        axisFactory(g, "births", "y", yAxisBirths);
        axisFactory(g, "births", "x", xAxisBirths);


        // migration lines
        g.append("path")
            .data([migrationData])
            .attr("class", "ref-line")
            .attr("id", "migration-ref-line")
            .style("stroke", "black")
            .style("opacity", 0)
            .attr("d", reference_line);

        g.append("path")
            .data([migrationData])
            .attr("class", "line")
            .attr("id", "domestic-line")
            .style("stroke", "red")
            .style("stroke-width", 5)
            .style("opacity", 0)
            .attr("d", domestic_line);

        g.append("path")
            .data([migrationData])
            .attr("class", "line")
            .attr("id", "international-line")
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .attr("d", international_line);

        g.append("path")
            .data([migrationData])
            .attr("class", "line")
            .attr("id", "net-line")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .attr("d", net_line);

        // Indexed Population Lines
        g.append("path")
            .data([indexedPopulationData])
            .attr("class", "line")
            .attr("id", "ct-indexed-line")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .attr("d", ctIndexedLine);

        g.append("path")
            .data([indexedPopulationData])
            .attr("class", "line")
            .attr("id", "ne-indexed-line")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .attr("d", neIndexedLine);

        g.append("path")
            .data([indexedPopulationData])
            .attr("class", "line")
            .attr("id", "neighboring-indexed-line")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .attr("d", neighboringIndexedLine);

        // CT Population Lines

        g.append("path")
            .data([populationData])
            .attr("class", "line")
            .attr("id", "ct-population-line")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .attr("d", populationCTLine);

        // Births Lines
        g.append("path")
            .data([birthsData])
            .attr("class", "line")
            .attr("id", "births-line")
            .style("stroke-width", 2)
            .style("opacity", 0)
            .attr("d", birthsLine);

        var sankey = d3.sankey()
            .nodeWidth(36)
            .nodePadding(25)
            .size([(width), height]);



        /* Initialize tooltip */
        var tipLinks = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10,0])
            .html(function(d) {
                return d.source.displayName + " → " +
                    d.target.name + "\n" + format(d.value);
            })
            .style("display", "none")
            .style("z-index", 99);


        g.call(tipLinks);

        var path = sankey.link();

        sankey.nodes(flowData.nodes).links(flowData.links).layout(32);

        var link = g.append("g").selectAll(".link")
            .data(flowData.links)
            .enter().append("path")
            .attr("class", "link right-link")
            .attr("d", path)
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .style("opacity", 0)
            .sort(function (a, b) {
                return b.dy - a.dy;
            })
            .on('mouseover', tipLinks.show)
            .on('mouseout', tipLinks.hide);

        link.filter(function(d) {
            return d.target.name == 'Connecticut';
        }).attr("class", "link left-link");

        var top_sources = ["New York", "Massachusetts"];
        var top_targets = ["New York", "Florida", "Massachusetts"];

        link.filter(function(d) {
            return (d.target.name == 'Connecticut' & top_sources.indexOf(d.source.displayName) >= 0);
        }).attr("class", "link left-link top-sources");

        link.filter(function(d) {
            return (d.source.name == 'Connecticut' & top_targets.indexOf(d.target.displayName) >= 0);
        }).attr("class", "link right-link top-targets");

        link.append("title")
            .text(function (d) {
                return d.source.displayName + " → " +
                    d.target.name + "\n" + format(d.value);
            });

        var node = g.append("g").selectAll(".node")
            .data(flowData.nodes)
            .enter().append("g")
            .attr("class", "node left-node")
            .style("opacity", 0)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.drag()
                .subject(function (d) {
                    return d;
                })
                .on("start", function () {
                    this.parenNode.appendChild(this);
                })
                .on("drag", dragmove));

        node.filter(function(d) { return d.x > width / 2; })
            .attr("class", "node right-node");

        node.append("rect")
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d) {
                return d.color = color(d.name.replace(/ .*/, ""));
            })
            .style("stroke", function (d) {
                return d3.rgb(d.color).darker(2);
            })
            .append("title").text(function (d) {
            return d.displayName + "\n" + d.value;
        });

        node.append("text")
          .attr("x", -6)
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) { return d.displayName; })
        .filter(function(d) { return d.x < width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");


        function dragmove(d) {
            d3.select(this)
                .attr("transform",
                    "translate("
                    + d.x + ","
                    + (d.y = Math.max(
                            0, Math.min(height - d.dy, d3.event.y))
                    ) + ")");
            sankey.relayout();
            link.attr("d", path);
        };
    }

    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
         /**
         * ACTIVATE FUNCTIONS
         *
         * These will be called when scrolled to
         **/

        activateFunctions['Canva 1'] = canvaOne;
        activateFunctions['CT Population'] = ctPopulation;
        activateFunctions['Canva 2'] = canvaTwo;
        activateFunctions['Births'] = births;
        activateFunctions['Net Domestic Migration'] = ctNetDomesticMigration;
        activateFunctions['Net Domestic Migration - Region'] = regionalDomesticMigration;
        activateFunctions['Alluvial In Migration'] = alluvialInMigration;
        activateFunctions['Alluvial Out Migration'] = alluvialOutMigration;
        activateFunctions['Canva 3'] = canvaThree;
        activateFunctions['CT Population and Migration by Education'] = migrationByEducation;
        activateFunctions['Migration by Age In'] = migrationByAgeIn;
        activateFunctions['Migration by Age Out Boomers'] = migrationByAgeOutBoomers;
        activateFunctions['Migration by Age Out College and Seniors'] = migrationByAgeOutCollege;
        activateFunctions['Migration by Age Out Post Recession'] = migrationByAgePostRecession;
        activateFunctions['CT Net International Migration'] = ctNetInternationalMigration;
        activateFunctions['CT Net International / Domestic Migration'] = ctNetMigration;
        activateFunctions['Indexed Population'] = indexedPopulation;

    };

    // Transition Functions
    function canvaOne() {
        hideCTPopulation();
    }

    function ctPopulation() {
        d3.select("#population_x_axis").style("opacity", 1);
        d3.select("#population_y_axis").style("opacity", 1);
        d3.select("#ct-population-line").style("stroke-width", 5).style("opacity", 1);
    }

    function hideCTPopulation() {
        d3.select("#population_x_axis").style("opacity", 0);
        d3.select("#population_y_axis").style("opacity", 0);
        d3.select("#ct-population-line").style("stroke-width", 5).style("opacity", 0);
    }
    function canvaTwo() {
        hideCTPopulation();
        hideBirths();
    }

    function births() {
        hideMigration();
        d3.select("#births_x_axis").style("opacity", 1);
        d3.select("#births_y_axis").style("opacity", 1);
        d3.select("#births-line").style("stroke-width", 5).style("opacity", 1);
    }

    function hideBirths() {
        d3.select("#births_x_axis").style("opacity", 0);
        d3.select("#births_y_axis").style("opacity", 0);
        d3.select("#births-line").style("stroke-width", 5).style("opacity", 0);
    }

    function ctNetDomesticMigration() {
        hideBirths();
        hideAlluvial();
        d3.select("#migrationa-ref-line").style("opacity", 1);
        d3.select("#migration_x_axis").style("opacity", 1);
        d3.select("#migration_y_axis").style("opacity", 1);
        d3.select("#domestic-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-line").transition(t).style("stroke-width", 2).style("opacity", 0);
        d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", 0);
    }

    function ctNetInternationalMigration() {
        d3.select("#domestic-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#net-line").transition(t).style("stroke-width", 2).style("opacity", 0);
        d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", 1);
    }

    function ctNetMigration() {
        hideIndexedPopulation();
        d3.select("#migrationa-ref-line").style("opacity", 1);
        d3.select("#migration_x_axis").style("opacity", 1);
        d3.select("#migration_y_axis").style("opacity", 1);
        d3.select("#domestic-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#international-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#net-line").transition(t).style("stroke-width", 5).style("opacity", 1);
    }

    function regionalDomesticMigration() {

    }

    function alluvialInMigration() {
        hideIndexedPopulation();
        hideMigration()
        d3.selectAll(".d3-tip").style("display", "block");
        d3.selectAll(".left-node").transition(t).style("opacity", 1);
        d3.selectAll(".left-link").transition(t2).style("opacity", 1);
        d3.selectAll(".right-link").transition(t).style("opacity", 0);
        d3.selectAll(".right-node").transition(t).style("opacity", 0);
    }

    function alluvialOutMigration() {
        d3.selectAll(".right-link").transition(t).style("opacity", 1);
        d3.selectAll(".right-node").transition(t2).style("opacity", 1);
    }

    function hideAlluvial() {
        d3.selectAll(".d3-tip").style("display", "none");
        d3.selectAll(".left-node").transition(t).style("opacity", 0);
        d3.selectAll(".left-link").transition(t2).style("opacity", 0);
        d3.selectAll(".right-link").transition(t).style("opacity", 0);
        d3.selectAll(".right-node").transition(t).style("opacity", 0);
    }

    function canvaThree() {
        hideAlluvial();
    }

    function migrationByEducation() {

    }

    function migrationByAgeIn() {

    }

    function migrationByAgeOutBoomers() {

    }

    function migrationByAgeOutCollege() {

    }

    function migrationByAgePostRecession() {

    }


    function hideMigration() {
        d3.select("#migrationa-ref-line").style("opacity", 0);
        d3.select("#migration_x_axis").style("opacity", 0);
        d3.select("#migration_y_axis").style("opacity", 0);
        d3.select("#domestic-line").style("opacity", 0);
        d3.select("#net-line").style("opacity", 0);
        d3.select("#international-line").style("opacity", 0);
    }

    function hideIndexedPopulation() {
        d3.select("#indexed_pop_x_axis").style("opacity", 0);
        d3.select("#indexed_pop_y_axis").style("opacity", 0);
        d3.select("#ct-indexed-line").style("opacity", 0);
        d3.select("#ne-indexed-line").style("opacity", 0);
        d3.select("#neighboring-indexed-line").style("opacity", 0);
    }

    function indexedPopulation() {
        hideMigration();
        hideIndexedPopulation();
        d3.select("#indexed_pop_x_axis").style("opacity", 1);
        d3.select("#indexed_pop_y_axis").style("opacity", 1);
        d3.select("#ct-indexed-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#ne-indexed-line").transition(t).style("stroke-width", 3).style("opacity", .5);
        d3.select("#neighboring-indexed-line").transition(t).style("stroke-width", 3).style("opacity", .5);
    }

    function neIndexedPopulation() {
        d3.select("#ct-indexed-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#ne-indexed_line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#neighboring-indexed_line").transition(t).style("stroke-width", 2).style("opacity", 0);
    }

    function neighboringIndexedPopulation() {
        d3.select("#ct-indexed-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#ne-indexed_line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#neighboring-indexed_line").transition(t).style("stroke-width", 5).style("opacity", 1);
    }

    // Dataloading Functions
    var getIndexedPopulation = function(rawData) {
        var indexedPopulation = rawData.filter(function(e) {
            return e.name == 'IndexedPopulation';
        })[0].data;

        indexedPopulation.forEach(function(d) {
            d.year = parseTime(d.Year);
            d.connecticut = +d['Connecticut'];
            d.new_england = +d['New England'];
            d.neighboring = +d['Neighboring States'];
        });
        return indexedPopulation;
    };

    var getMigrationData = function(rawData) {
        var migration = rawData.filter(function(e) { return e.name === 'MigrationData';})[0].data;

        migration.forEach(function(d) {
               d.year = parseTime(d.Year);
               d.net = +d['Net Migration'];
               d.international = +d['International'];
               d.domestic = +d['Domestic'];
           });

       return migration;

    };

    var getFlowData = function(rawData) {
        flows = rawData.filter(function(e) { return e.name == 'Influencers';})[0].data;
        var graph = {"nodes": [], "links": []};

        flows.forEach(function(f) {
            graph.nodes.push({"name": f.source});
            graph.nodes.push({"name": f.target});
            graph.links.push({"source": f.source, "target": f.target, "value": +f.value });
        });


        graph.nodes = d3.nest().key(function(d) { return d.name; }).map(graph.nodes).keys();

        graph.links.forEach(function(d, i) {
           graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
           graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        graph.nodes.forEach(function(d,i) {
            var displayName = d.replace("From ", "").replace("To ", "");
            graph.nodes[i] = { "name": d, "node": i, "displayName": displayName};
        });
        return graph;
    };

    var getCTPopulation = function(rawData) {
        var pop =  rawData.filter(function(e) { return e.name === 'CTPopulation';})[0].data;
        pop.forEach(function(d) {
            d.year = parseTime(d.year);
            d.population = +d.population;
        })
        return pop;
    };

    var getBirthsData = function(rawData) {
        var births = rawData.filter(function(e) { return e.name === 'Births';})[0].data;
        births.forEach(function(d) {
            d.year = parseTime(d.year);
            d.births = +d.births;
        });
        return births;
    };

    var getMigrationByAgeData = function(rawData) {
        var migration = rawData.filter(function(e) { return e.name === 'InOutNetDomesticMigByAge';})[0].data;
        return migration;
    };

    var getMigrationByEducationData = function(rawData) {
        var migration = rawData.filter(function(e) { return e.name === 'PopNetMigrationByEd';})[0].data;
        return migration;
    };
    /**
     * @param graphic_id - identifier for graphic as passed in via data attribute
     */
    chart.activate = function (graphic_id) {
        activateFunctions[graphic_id]();
    };

    return chart;
};

function display(data) {
    var plot = scrollVis();
    d3.select('#scrolly-vis')
        .datum(data)
        .call(plot);

    var scroll = scroller()
        .container(d3.select('#scrolly-story'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));

    // setup event handling
    scroll.on('active', function (index) {

        // highlight current step text
        d3.selectAll('.step')
            .style('opacity', function (d, i) { return i === index ? 1 : 0.1; })
            .each(function(d, i) {
                //  Check to see if section has a data-graphic id passed in, if it does
                //  we need to pass it back to the graphic dispatch function
                if (i === index) {
                    var gid = d3.select(this).select('div[data-graphic-id]');
                    if (gid.size() > 0) {
                        var dataFunc = gid.attr('data-graphic-id');
                        console.log(dataFunc);
                        plot.activate(dataFunc);
                    }
                }
            });

    });
}
