var scrollVis = function () {
    var margin = {top: 75, right: 20, bottom: 30, left: 100},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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

    // Net Migration Region
    var regionalMigrationLineX = d3.scaleTime().range([0, width]);
    var regionalMigrationLineY = d3.scaleLinear().range([height, 0]);

    var xAxisRegionalMigration = d3.axisBottom().scale(regionalMigrationLineX);
    var yAxisRegionalMigration = d3.axisLeft().scale(regionalMigrationLineY).tickFormat(d3.format(".2%"));

    // Net Migrational Region States
    var regionalStateMigrationLineX = d3.scaleTime().range([0, width]);
    var regionalStateMigrationLineY = d3.scaleLinear().range([height, 0]);

    var xAxisRegionalStateMigration = d3.axisBottom().scale(regionalStateMigrationLineX);
    var yAxisRegionalStateMigration = d3.axisLeft().scale(regionalStateMigrationLineY).tickFormat(d3.format(".2%"));

    // Net Migration States
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


    var regionalMigrationCTLine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalMigrationLineY(d.Connecticut);
        });

    var regionalMigrationNELine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalMigrationLineY(d['New England']);
        });

    var regionalMigrationNeighboringLine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalMigrationLineY(d['Neighboring States']);
        });

    // Regional Migration by State
    var regionalStateCTMigrationLine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalStateMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalStateMigrationLineY(d.Connecticut);
        });

    var regionalStateMAMigrationLine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalStateMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalStateMigrationLineY(d.Massachusetts);
        });

    var regionalStateRIMigrationLine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalStateMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalStateMigrationLineY(d['Rhode Island']);
        });

    var regionalStateNJMigrationLine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalStateMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalStateMigrationLineY(d['New Jersey']);
        });

    var regionalStateNYMigrationLine = d3.line()
        .curve(d3.curveNatural)
        .x(function (d) {
            return regionalStateMigrationLineX(d.year);
        })
        .y(function (d) {
            return regionalStateMigrationLineY(d['New York']);
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
            var regionalNetDomestic = getRegionalNetDomestic(rawData);
            var regionalStateNetDomestic = getRegionalStateNetDomestic(rawData);

            setupVis(migrationData,
                indexedPopulationData,
                flowData,
                birthsData,
                populationData,
                regionalNetDomestic,
                regionalStateNetDomestic
            );

            setupSections();
        });
    };

    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param migrationData - data object for migration series.
     */

    var setupVis = function (migrationData, indexedPopulationData, flowData, birthsData, populationData, regionalNetDomesticData, regionalStateNetDomesticData) {

        // Migration Data - Set X and Y domain
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


        // Set up labels for the Net Migration Graph
        var netMigrationAnnotationLabels = [
            {
                data: { year: '2016', population: migrationData[migrationData.length-1]['net'] },
                dx: -35,
                dy: -110,
                id: "net-migration-annotation",
                note: { title: "Net Migration" }
            },
            {
                data: { year: '2016', population: migrationData[migrationData.length-1]['international'] },
                dx: -50,
                dy: 25,
                id: "international-migration-annotation",
                note: { title:  "International Migration" }
            },
            {
                data: { year: '2016', population: migrationData[migrationData.length-1]['domestic'] },
                dx: -25,
                dy: -75,
                id: "domestic-migration-annotation",
                note: { title:  "Domestic Migration" }
            }
        ];

        // Annotaion Function for Net Migration
        var makeNetMigrationAnnotations = d3.annotation()
            .annotations(netMigrationAnnotationLabels)
            .type(d3.annotationCallout).accessors({
                x: function x(d) {
                    return migrationLineX(parseTime(d.year)); },
                y: function y(d) {
                    console.log(migrationLineY(d.population));
                    return migrationLineY(d.population); }
            }).accessorsInverse({
                year: function year(d) { return parseTime(migrationLineX.invert(d.x))},
                population: function population(d) { return migrationLineY.invert(d.y)}
            });

        //
        // // Factory function for generating annotations within a label series with custom classes.
        // // Useful for scrolling when adding labels incrementally
        // var netMigrationAnnotationFactory = function(id) {
        //     var labels = netMigrationAnnotationLabels.filter(function(l) { return l.id === id});
        //     return d3.annotation()
        //         .annotations(labels)
        //         .type(d3.annotationCallout).accessors({
        //             x: function x(d) {
        //                 return populationLineX(parseTime(d.year)); },
        //             y: function y(d) { return populationLineY(d.population); }
        //         }).accessorsInverse({
        //             year: function year(d) { return parseTime(populationLineX.invert(d.x))},
        //             population: function population(d) { return populationLineY.invert(d.y)}
        //         });
        // };



        // IndexedPopulation Data
        //
        // indexedPopLineX.domain(d3.extent(indexedPopulationData, function (d) {
        //     return d.year;
        // }));
        //
        // var indexedPopMaxY = d3.max(indexedPopulationData, function (d) {
        //     return Math.max(d.connecticut, d.neighboring, d.new_england);
        // });
        //
        //
        // var indexedPopMinY = d3.min(indexedPopulationData, function (d) {
        //     return Math.min(d.connecticut, d.neighboring, d.new_england);
        // });
        //
        // indexedPopLineY.domain([indexedPopMinY - indexedPopMinY * .025, indexedPopMaxY + indexedPopMaxY * .025]);


        // Set Domain for CT Population Graph
        var popExtent = d3.extent(populationData, function (d) {
            return d.population;
        });

        populationLineY.domain([popExtent[0] - popExtent[0] * .025, popExtent[1] + popExtent[1] * .025]);

        populationLineX.domain(d3.extent(populationData, function (d) {
            return d.year;
        }));

        // Annotation Labels for Population Graph
        var populationAnnotationLabels = [
            {
                data: { year: '2013', population: 3596003 },
                dx: -50,
                dy: -25,
                note: { title: "2013: 3,596,003"},
                subject: { radius: 4 }
            },
            {
                data: { year: '2016', population: 3576452 },
                dx: -45,
                dy: 45,
                note: { title: "2016: 3,576,452"},
                subject: { radius: 4 }
            }
        ];

        // Annotation Function for Population Graph
        var makePopulationAnnotations = d3.annotation()
            .annotations(populationAnnotationLabels)
            .type(d3.annotationCalloutCircle).accessors({
                x: function x(d) {
                    return populationLineX(parseTime(d.year)); },
                y: function y(d) { return populationLineY(d.population); }
            }).accessorsInverse({
                year: function year(d) { return parseTime(populationLineX.invert(d.x))},
                population: function population(d) { return populationLineY.invert(d.y)}
            });


        // Set domain for birth graph
        var birthCountExtent = d3.extent(birthsData, function(d) {
            return d.births;
        });

        birthsLineY.domain([birthCountExtent[0] - birthCountExtent[0] * .025, birthCountExtent[1] + birthCountExtent[1] * .025]);
        birthsLineX.domain(d3.extent(birthsData, function(d) {
            return d.year;
        }));

        // Annotations for Birth Graph per and post recession shading boxes
        var recessionShadingLabels = [
            {
                data: { year: '2004', births: birthsLineY.domain()[1] },
                dx: 0,
                dy: 3,
                note: { title: "Pre-recession" },
                subject: {
                    height: height,
                    width: birthsLineX(parseTime("2007")) - birthsLineX(parseTime("2004"))
                }
            },
            {
                data: { year: '2013', births: birthsLineY.domain()[1] },
                dx: 0,
                dy: 3,
                note: { title: "Post-recession" },
                subject: {
                    height: height,
                    width: birthsLineX(parseTime("2016")) - birthsLineX(parseTime("2013"))
                }
            }
        ];


        const shadingAnnotation = d3.annotationCustomType(
          d3.annotationCalloutRect,
          {"className": "shading",
            "connector":{"type":"line"},
            "note":{"lineType":"vertical",
            "align":"left"}});


        var makeRecessionShadingAnnotations = d3.annotation()
            .annotations(recessionShadingLabels)
            .type(shadingAnnotation).accessors({
                x: function x(d) {
                    return birthsLineX(parseTime(d.year)); },
                y: function y(d) {
                    return birthsLineY(d.births); }
            }).accessorsInverse({
                year: function year(d) { return parseTime(birthsLineX.invert(d.x))},
                births: function births(d) { return birthsLineY.invert(d.y)}
            });


        // Regional Migration
        var regionalMigrationMaxY = d3.max(regionalNetDomesticData, function (d) {
            return Math.max(d['Connecticut'], d['New England'], d['Neighboring States']);
        });

        var regionalMigrationMinY = d3.min(regionalNetDomesticData, function (d) {
            return Math.min(d['Connecticut'], d['New England'], d['Neighboring States']);
        });

        // regionalMigrationLineY.domain(
        //     [
        //         regionalMigrationMinY - Math.abs(regionalMigrationMinY * .05),
        //         regionalMigrationMaxY + Math.abs(regionalMigrationMaxY * .05)
        //     ]
        // );

         regionalMigrationLineY.domain([-0.015, .002]);

        regionalMigrationLineX.domain(d3.extent(regionalNetDomesticData, function (d) { return d.year; }));

         // Annotations for Birth Graph per and post recession shading boxes
        var regionalMigrationLabels = [
            {
                data: { year: '2016', population: regionalNetDomesticData[regionalNetDomesticData.length-1]['Connecticut'] },
                dx: -35,
                dy: 25,
                id: "net-migration-ct-annotation",
                note: { title: "Connecticut" }
            },
            {
                data: { year: '2016', population: regionalNetDomesticData[regionalNetDomesticData.length-1]['New England'] },
                dx: -25,
                dy: -75,
                id: "net-migration-ne-annotation",
                note: { title:  "New England" }
            },
            {
                data: { year: '2016', population: regionalNetDomesticData[regionalNetDomesticData.length-1]['Neighboring States'] },
                dx: -5,
                dy: -95,
                id: "net-migration-neigh-annotation",
                note: { title:  "Neighboring States" }
            }
        ];


        // Factory function for generating annotations within a label series with custom classes.
        // Useful for scrolling when adding labels incrementally
        var regionalMigrationAnnotationFactory = function(id) {
            var labels = regionalMigrationLabels.filter(function(l) { return l.id === id});
            return d3.annotation()
                .annotations(labels)
                .type(d3.annotationCallout).accessors({
                    x: function x(d) {
                        return regionalMigrationLineX(parseTime(d.year)); },
                    y: function y(d) { return regionalMigrationLineY(d.population); }
                }).accessorsInverse({
                    year: function year(d) { return parseTime(regionalMigrationLineX.invert(d.x))},
                    population: function population(d) { return regionalMigrationLineY.invert(d.y)}
                });
        };




        // Regional State Migration
        // var regionalStateMigrationMaxY = d3.max(regionalStateNetDomesticData, function (d) {
        //     return Math.max(d.Connecticut, d.Massachusetts, d['Rhode Island'],
        //         d['New York'], d['New Jersey']);
        // });
        //
        // var regionalStateMigrationMinY = d3.min(regionalStateNetDomesticData, function (d) {
        //     return Math.min(d.Connecticut, d.Massachusetts, d['Rhode Island'],
        //         d['New York'], d['New Jersey']);
        // });

        // regionalStateMigrationLineY.domain([
        //     regionalStateMigrationMinY - Math.abs(regionalStateMigrationMinY * .05),
        //     regionalStateMigrationMaxY + Math.abs(regionalStateMigrationMaxY * .05),
        // ]);
        regionalStateMigrationLineY.domain([-0.015, .002]);

        regionalStateMigrationLineX.domain(d3.extent(regionalStateNetDomesticData, function (d) {
            return d.year;
        }));

        console.log(regionalStateMigrationLineY.domain())

        function drawAxis(target, id_base, type, axis) {
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

        function drawLine(target, data, id, color, lineClass, callable) {
            target.append("path")
                .data([data])
                .attr("class", lineClass)
                .attr("id", id)
                .style("stroke", color)
                .style("opacity", 0)
                .attr("d", callable);
        }

        function drawTitle(target, id, title) {
            target.append("text")
                .attr("x", (width / 2) + margin.left)
                .attr("y", (margin.top / 1.5))
                .attr("text-anchor", "middle")
                .attr("id", id)
                .style("font-size", "20px")
                .style("font-weight", "600")
                .style("text-decoration", "underline")
                .style("display", "none")
                .text(title);
        }


        function annotate(target, annotationClass, callable) {
            target.append('g')
                .append("g")
                .attr("class", annotationClass)
                .style("display", "none")
                .call(callable);
        }

        function drawShadeBox(target, id, startX, endX, xFunction, fill) {
            target.append("rect").attr("id", id)
                .attr("x", xFunction(startX))
                .attr("y", 0)
                .attr("width", function () {
                    return xFunction(endX) - xFunction(startX);
                })
                .attr("height", height)
                .attr("opacity", 0)
                .attr("fill", fill);
        }


        // Canva Images
        g.append('svg:image')
            .attr("xlink:href", "/static/ctdata/images/migration_one.png")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .attr("id", "canva_one")
            .style('opacity', 1);

        g.append('svg:image')
            .attr("xlink:href", "/static/ctdata/images/migration_two.png")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .attr("id", "canva_two")
            .style('opacity', 0);

        g.append('svg:image')
            .attr("xlink:href", "/static/ctdata/images/migration_three.png")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .attr("id", "canva_three")
            .style('opacity', 0);

        g.append('svg:image')
            .attr("xlink:href", "/static/ctdata/images/migration_four.png")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .attr("id", "canva_four")
            .style('opacity', 0);

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
        drawAxis(g, "births", "y", yAxisBirths);
        drawAxis(g, "births", "x", xAxisBirths);

        // Regional Migration Axis
        drawAxis(g, "regional_net", "y", yAxisRegionalMigration);
        drawAxis(g, "regional_net", "x", xAxisRegionalMigration);

        // Regional State Migration Axis
        drawAxis(g, "regional_state_net", "y", yAxisRegionalStateMigration);
        drawAxis(g, "regional_state_net", "x", xAxisRegionalStateMigration);

        // CT Population Lines
        drawLine(g, populationData, "ct-population-line", "steelblue", "line", populationCTLine);
        annotate(g, "annotation-population", makePopulationAnnotations);
        drawTitle(svg, "population-title", "Population: 2001-2016");

        // migration lines
        drawLine(g, migrationData, "migration-ref-line", "black", "ref-line", reference_line);
        drawLine(g, migrationData, "domestic-line", "steelblue", "line", domestic_line);
        drawLine(g, migrationData, "international-line", "black", "line", international_line);
        drawLine(g, migrationData, "net-line", "black", "line", net_line);
        drawTitle(svg, "net-migration-title", "Net Migrations");
        annotate(g, "net-migration-annotation", makeNetMigrationAnnotations);

        // annotate(g, "international-migration-annotation", netMigrationAnnotationFactory("international-migration-annotation"));
        // annotate(g, "domestic-migration-annotation", netMigrationAnnotationFactory("domestic-migration-annotation"));
        // annotate(g, "net-migration-annotation", netMigrationAnnotationFactory("net-migration-annotation"));

        // // Indexed Population Lines
        // g.append("path")
        //     .data([indexedPopulationData])
        //     .attr("class", "line")
        //     .attr("id", "ct-indexed-line")
        //     .style("stroke-width", 2)
        //     .style("opacity", 0)
        //     .attr("d", ctIndexedLine);
        //
        // g.append("path")
        //     .data([indexedPopulationData])
        //     .attr("class", "line")
        //     .attr("id", "ne-indexed-line")
        //     .style("stroke-width", 2)
        //     .style("opacity", 0)
        //     .attr("d", neIndexedLine);
        //
        // g.append("path")
        //     .data([indexedPopulationData])
        //     .attr("class", "line")
        //     .attr("id", "neighboring-indexed-line")
        //     .style("stroke-width", 2)
        //     .style("opacity", 0)
        //     .attr("d", neighboringIndexedLine);


        // Births Lines
        drawShadeBox(g, "prerecession-shading", parseTime("2004"), parseTime("2007"), populationLineX, "lightgrey");
        drawShadeBox(g, "postrecession-shading", parseTime("2013"), parseTime("2016"), populationLineX, "lightgrey");
        annotate(g, "annotation-recession", makeRecessionShadingAnnotations);
        drawLine(g, birthsData, "births-line", "steelblue", "line", birthsLine);
        drawTitle(svg, "births-title", "Pre and Post Recession Births");

        // Regional Net
        drawLine(g, regionalNetDomesticData, "regional-net-ct", "steelblue", "line", regionalMigrationCTLine);
        drawLine(g, regionalNetDomesticData, "regional-net-ne", "black", "line", regionalMigrationNELine);
        drawLine(g, regionalNetDomesticData, "regional-net-neigh", "black", "line", regionalMigrationNeighboringLine);
        drawTitle(svg, "regional-net-migration-title", "Migrations as Percent of Total Population");
        annotate(g, "net-migration-ct-annotation", regionalMigrationAnnotationFactory("net-migration-ct-annotation"));
        annotate(g, "net-migration-ne-annotation", regionalMigrationAnnotationFactory("net-migration-ne-annotation"));
        annotate(g, "net-migration-neigh-annotation", regionalMigrationAnnotationFactory("net-migration-neigh-annotation"));


        // Regional State
        drawLine(g, regionalStateNetDomesticData, "regional-state-ct", "steelblue", "line", regionalStateCTMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-ma", "black", "line", regionalStateMAMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-ny", "black", "line", regionalStateNYMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-nj", "black", "line", regionalStateNJMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-ri", "black", "line", regionalStateNJMigrationLine);


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

        // link.append("title")
        //     .text(function (d) {
        //         return d.source.displayName + " → " +
        //             d.target.name + "\n" + format(d.value);
        //     });

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
        activateFunctions['Net Domestic Migration Regional CT'] = regionalDomesticMigrationCT;
        activateFunctions['Net Domestic Migration Regional All'] = regionalDomesticMigrationAll;
        activateFunctions['Net Domestic Migration State CT'] = stateDomesticMigrationCT;
        activateFunctions['Net Domestic Migration State All'] = stateDomesticMigrationAll;
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
        d3.select("#canva_one").style("opacity", 1);
    }

    function hideCanvaOne() {
        d3.select("#canva_one").style("opacity", 0);
    }

    function ctPopulation() {
        hideCanvaOne();
        hideCanvaTwo();
        d3.select("#population_x_axis").style("opacity", 1);
        d3.select("#population_y_axis").style("opacity", 1);
        d3.select("#ct-population-line").style("stroke-width", 5).style("opacity", 1);
        d3.select(".annotation-population").style("display", "block");
        d3.select("#population-title").style("display", "block");
    }

    function hideCTPopulation() {
        d3.select("#population_x_axis").style("opacity", 0);
        d3.select("#population_y_axis").style("opacity", 0);
        d3.select("#ct-population-line").style("stroke-width", 5).style("opacity", 0);
        d3.select(".annotation-population").style("display", "none");
        d3.select("#population-title").style("display", "none");
    }
    function canvaTwo() {
        hideCTPopulation();
        hideBirths();
        d3.select("#canva_two").style("opacity", 1);
    }

    function hideCanvaTwo() {
        d3.select("#canva_two").style("opacity", 0);
    }

    function births() {
        hideMigration();
        hideCanvaTwo();
        d3.select("#births_x_axis").style("opacity", 1);
        d3.select("#births_y_axis").style("opacity", 1);
        d3.select("#births-line").style("stroke-width", 5).style("opacity", 1);
        d3.select("#prerecession-shading").style("opacity", 0.4);
        d3.select("#postrecession-shading").style("opacity", 0.4);
        d3.select(".annotation-recession").style("display", "block");
        d3.select("#births-title").style("display", "block");
    }

    function hideBirths() {
        d3.select("#births_x_axis").style("opacity", 0);
        d3.select("#births_y_axis").style("opacity", 0);
        d3.select("#births-line").style("stroke-width", 5).style("opacity", 0);
        d3.select("#prerecession-shading").style("opacity", 0);
        d3.select("#postrecession-shading").style("opacity", 0);
        d3.select(".annotation-recession").style("display", "none");
        d3.select("#births-title").style("display", "none");
    }

    function ctNetDomesticMigration() {
        hideBirths();
        hideAlluvial();
        hideRegionalNetMigration();
        d3.select("#migration-ref-line").style("opacity", 1);
        d3.select("#migration_x_axis").style("opacity", 1);
        d3.select("#migration_y_axis").style("opacity", 1);
        d3.select("#domestic-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-line").transition(t).style("stroke-width", 5).style("opacity", .75);
        d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", .75);
        d3.select("#net-migration-title").style("display", "block");
        d3.selectAll(".net-migration-annotation").style("display", "block");
    }

    function ctNetInternationalMigration() {
        hideRegionalNetMigration();
        d3.select("#domestic-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#net-line").transition(t).style("stroke-width", 2).style("opacity", 0);
        d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-migration-title").style("display", "block");
    }

    function ctNetMigration() {
        hideIndexedPopulation();
        hideRegionalNetMigration();
        d3.select("#migrationa-ref-line").style("opacity", 1);
        d3.select("#migration_x_axis").style("opacity", 1);
        d3.select("#migration_y_axis").style("opacity", 1);
        d3.select("#domestic-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#international-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#net-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-migration-title").style("display", "block");
    }

    function hideMigration() {
        d3.select("#migration-ref-line").style("opacity", 0);
        d3.select("#migration_x_axis").style("opacity", 0);
        d3.select("#migration_y_axis").style("opacity", 0);
        d3.select("#domestic-line").style("opacity", 0);
        d3.select("#net-line").style("opacity", 0);
        d3.select("#international-line").style("opacity", 0);
        d3.select("#net-migration-title").style("display", "none");
        d3.selectAll(".net-migration-annotation").style("display", "none");
    }


    function regionalDomesticMigrationCT() {
        hideIndexedPopulation();
        hideMigration();
        d3.select("#regional_net_x_axis").style("opacity", 1);
        d3.select("#regional_net_y_axis").style("opacity", 1);
        d3.select("#regional-net-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-net-ne").transition(t).style("opacity", 0);
        d3.select("#regional-net-neigh").transition(t).style("opacity", 0);
        d3.select("#regional-net-migration-title").style("display", "block");
        d3.selectAll(".net-migration-ct-annotation").style("display", "block");
        d3.selectAll(".net-migration-ne-annotation").style("display", "none");
        d3.selectAll(".net-migration-neigh-annotation").style("display", "none");

    }

    function regionalDomesticMigrationAll() {
        hideStateDomesticMigration();
        d3.select("#regional_net_x_axis").style("opacity", 1);
        d3.select("#regional_net_y_axis").style("opacity", 1);
        d3.select("#regional-net-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-net-ne").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-net-neigh").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-net-migration-title").style("display", "block");
        d3.selectAll(".net-migration-ct-annotation").style("display", "block");
        d3.selectAll(".net-migration-ne-annotation").style("display", "block");
        d3.selectAll(".net-migration-neigh-annotation").style("display", "block");
    }

    function stateDomesticMigrationCT() {
        hideRegionalNetMigration();
        hideAlluvial();
        d3.select("#regional_state_net_x_axis").style("opacity", 1);
        d3.select("#regional_state_net_y_axis").style("opacity", 1);
        d3.select("#regional-state-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-ma").transition(t).style("opacity", 0);
        d3.select("#regional-state-ny").transition(t).style("opacity", 0);
        d3.select("#regional-state-nj").transition(t).style("opacity", 0);
        d3.select("#regional-state-ri").transition(t).style("opacity", 0);
        d3.select("#regional-net-migration-title").style("display", "block");
    }

    function stateDomesticMigrationAll() {
        hideAlluvial();
        d3.select("#regional_state_net_x_axis").style("opacity", 1);
        d3.select("#regional_state_net_y_axis").style("opacity", 1);
        d3.select("#regional-state-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-ma").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-ny").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-nj").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-ri").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-net-migration-title").style("display", "block");
    }

    function hideStateDomesticMigration() {
        d3.select("#regional_state_net_x_axis").style("opacity", 0);
        d3.select("#regional_state_net_y_axis").style("opacity", 0);
        d3.select("#regional-state-ct").transition(t).style("opacity", 0);
        d3.select("#regional-state-ma").transition(t).style("opacity", 0);
        d3.select("#regional-state-ny").transition(t).style("opacity", 0);
        d3.select("#regional-state-nj").transition(t).style("opacity", 0);
        d3.select("#regional-state-ri").transition(t).style("opacity", 0);
        d3.select("#regional-net-migration-title").style("display", "none");
    }

    function alluvialInMigration() {
        hideIndexedPopulation();
        hideStateDomesticMigration();
        hideMigration();
        hideCanvaThree();
        d3.selectAll(".d3-tip").style("display", "block");
        d3.selectAll(".left-node").transition(t).style("opacity", 1);
        d3.selectAll(".left-link").transition(t2).style("opacity", 1);
        d3.selectAll(".right-link").transition(t).style("opacity", 0);
        d3.selectAll(".right-node").transition(t).style("opacity", 0);
    }

    function alluvialOutMigration() {
        hideCanvaThree();
        d3.selectAll(".left-node").transition(t).style("opacity", 1);
        d3.selectAll(".left-link").transition(t2).style("opacity", 1);
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
        d3.select("#canva_three").style("opacity", 1);
    }

    function hideCanvaThree() {
        d3.select("#canva_three").style("opacity", 0);
    }

    function migrationByEducation() {
        hideCanvaThree();
    }

    function migrationByAgeIn() {

    }

    function migrationByAgeOutBoomers() {

    }

    function migrationByAgeOutCollege() {

    }

    function migrationByAgePostRecession() {

    }



    function hideIndexedPopulation() {
        d3.select("#indexed_pop_x_axis").style("opacity", 0);
        d3.select("#indexed_pop_y_axis").style("opacity", 0);
        d3.select("#ct-indexed-line").style("opacity", 0);
        d3.select("#ne-indexed-line").style("opacity", 0);
        d3.select("#neighboring-indexed-line").style("opacity", 0);
    }

    function hideRegionalNetMigration() {
        d3.select("#regional_net_x_axis").style("opacity", 0);
        d3.select("#regional_net_y_axis").style("opacity", 0);
        d3.select("#regional-net-ct").style("opacity", 0);
        d3.select("#regional-net-ne").style("opacity", 0);
        d3.select("#regional-net-neigh").style("opacity", 0);
        d3.select("#regional-net-migration-title").style("display", "none");
        d3.selectAll(".net-migration-ct-annotation").style("display", "none");
        d3.selectAll(".net-migration-ne-annotation").style("display", "none");
        d3.selectAll(".net-migration-neigh-annotation").style("display", "none");
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

    // function neIndexedPopulation() {
    //     d3.select("#ct-indexed-line").transition(t).style("stroke-width", 2).style("opacity", .25);
    //     d3.select("#ne-indexed_line").transition(t).style("stroke-width", 5).style("opacity", 1);
    //     d3.select("#neighboring-indexed_line").transition(t).style("stroke-width", 2).style("opacity", 0);
    // }
    //
    // function neighboringIndexedPopulation() {
    //     d3.select("#ct-indexed-line").transition(t).style("stroke-width", 2).style("opacity", .25);
    //     d3.select("#ne-indexed_line").transition(t).style("stroke-width", 2).style("opacity", .25);
    //     d3.select("#neighboring-indexed_line").transition(t).style("stroke-width", 5).style("opacity", 1);
    // }

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
        });
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

    var getRegionalNetDomestic = function(rawData) {
        var rnd = rawData.filter(function(e) { return e.name === 'RegionalNetDomestic';})[0].data;
        rnd.forEach(function(d) {
            d.year = parseTime(d.year);
        });
        return rnd;
    };

    var getRegionalStateNetDomestic = function(rawData) {
       var rsnd =  rawData.filter(function(e) { return e.name === 'NewEnglandStatesNetDomestic';})[0].data;
        rsnd.forEach(function(d) {
            d.year = parseTime(d.Year);
        });
        return rsnd;
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
