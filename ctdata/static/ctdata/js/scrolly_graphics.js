var scrollVis = function () {
    var margin = {top: 40, right: 20, bottom: 30, left: 50},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var t = d3.transition()
        .duration(500)
        .ease(d3.easeLinear);


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

            setupVis(migrationData, indexedPopulationData);

            setupSections();
        });
    };

    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param migrationData - data object for migration series.
     */

    var setupVis = function (migrationData, indexedPopulationData) {
        console.table(indexedPopulationData)
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

        indexedPopLineX.domain(d3.extent(indexedPopulationData, function(d) {
            return d.year;
        }));

        var indexedPopMaxY = d3.max(indexedPopulationData, function(d) {
            return Math.max(d.connecticut, d.neighboring, d.new_england);
        });


        var indexedPopMinY = d3.min(indexedPopulationData, function(d) {
            return Math.min(d.connecticut, d.neighboring, d.new_england);
        });

        indexedPopLineY.domain([indexedPopMinY - indexedPopMinY * .025, indexedPopMaxY + indexedPopMaxY * .025]);


        g.append('g')
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .attr("id", "migration_x_axis")
            .style('opacity', 0)
            .call(xAxisMigration);

        g.append('g')
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .attr("id", "indexed_pop_x_axis")
            .style('opacity', 0)
            .call(xAxisIndexedPop);


        g.append('g')
            .attr("class", "y axis")
            .attr("id", "migration_y_axis")
            .style('opacity', 0)
            .call(yAxisMigration);

        g.append('g')
            .attr("class", "y axis")
            .attr("id", "indexed_pop_y_axis")
            .style('opacity', 0)
            .call(yAxisIndexedPop);


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
    };

    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions['CT Net Domestic Migration'] = ctNetDomesticMigration;
        activateFunctions['CT Net International Migration'] = ctNetInternationalMigration;
        activateFunctions['CT Net International / Domestic Migration'] = ctNetMigration;
        activateFunctions['Indexed Population'] = indexedPopulation;
        /**
         * ACTIVATE FUNCTIONS
         *
         * These will be called when scrolled to
         **/

        /**
         * ctNetDomesticMigration
         *
         * displays the initial migration graphic with axes
         */
    };

    // Transition Functions
    function ctNetDomesticMigration() {
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
