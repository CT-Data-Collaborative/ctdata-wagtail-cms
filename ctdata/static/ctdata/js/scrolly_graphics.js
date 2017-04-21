var scrollVis = function () {
    var margin = {top: 40, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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
    var migrationLineX = d3.scaleTime().range([0, width]);
    var migrationLineY = d3.scaleLinear().range([height, 0]);

    var xAxisMigration = d3.axisBottom().scale(migrationLineX);
    var yAxisMigration = d3.axisLeft().scale(migrationLineY);

    // net migration
    var net_line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return x(d.year);
        })
        .y(function (d) {
            return y(d.net);
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
            console.log(rawData);
            var migrationData = rawData[0]['data'].forEach(function(d) {
                d.year = parseTime(d.Year);
                d.net = +d['Net Migration'];
                d.international = +d['International'];
                d.domestic = +d['Domestic'];
            });
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

            setupVis(migrationData);

            setupSections();
        });
    };

    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param migrationData - data object for migration series.
     */

    var setupVis = function (migrationData) {
        g.append('g')
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .attr("id", "migration_x_axis")
            .call(xAxisMigration);

        g.select('.x.axis').style('opacity', 0);

        g.append('g')
            .attr("class", "y axis")
            .attr("id", "migration_y_axis")
            .call(yAxisMigration);

        g.select('.y.axis').style('opacity', 0);

        g.append("path")
            .data([migrationData])
            .attr("class", "ref-line")
            .style("stroke", "black")
            .style("opacity", 0)
            .attr("d", reference_line);

        // Add the valueline2 path.
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

    };

    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions['CT Net Domestic Migration'] = ctNetDomesticMigration;
        activateFunctions['CT Net International Migration'] = ctNetInternationalMigration;
        activateFunctions['CT Net International / Domestic Migration'] = ctNetMigration;

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

    function ctNetDomesticMigration() {
        var t = d3.transition().duration(500).ease(d3.easeLinear);

        d3.select("#migration_x_axis").style("opacity", 1);
        d3.select("#migration_y_axis").style("opacity", 1);
        d3.select("#domestic-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-line").transition(t).style("stroke-width", 2).style("opacity", 0);
        d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", 0);
    }

    function ctNetInternationalMigration() {
        var t = d3.transition().duration(500).ease(d3.easeLinear);

        d3.select("#domestic-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#net-line").transition(t).style("stroke-width", 2).style("opacity", 0);
        d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", 1);
    }

    function ctNetMigration() {
        var t = d3.transition().duration(500).ease(d3.easeLinear);

        d3.select("#domestic-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#international-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#net-line").transition(t).style("stroke-width", 5).style("opacity", 1);
    }

    /**
     * @param index - index of the activated section
     */
    // chart.activate = function (index) {
    //     activeIndex = index;
    //     var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    //     var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    //     scrolledSections.forEach(function (i) {
    //         activateFunctions[i]();
    //     });
    //     lastIndex = activeIndex;
    // };
    /**
     * @param graphic_id - identifier for graphic as passed in via data attribute
     */
    chart.activate = function (graphic_id) {
        activateFunctions[graphic_id]();
    }

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
                        console.log(gid.attr('data-graphic-id'));
                    }
                }
            });

    });
}

display(scrolly_data);
