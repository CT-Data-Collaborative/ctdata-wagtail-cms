function measureText(pText, pFontSize, pStyle) {
    var lDiv = document.createElement('div');

    document.body.appendChild(lDiv);

    if (pStyle != null) {
        lDiv.style = pStyle;
    }
    lDiv.style.fontSize = "" + pFontSize + "px";
    lDiv.style.position = "absolute";
    lDiv.style.left = -1000;
    lDiv.style.top = -1000;

    lDiv.innerHTML = pText;

    var lResult = {
        width: lDiv.clientWidth,
        height: lDiv.clientHeight
    };

    document.body.removeChild(lDiv);
    lDiv = null;

    return lResult;
}

var scrollVis = function () {
    var margin = {top: 75, right: 50, bottom: 150, left: 100},
        width = 700 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    var t = d3.transition()
        .duration(500)
        .ease(d3.easeLinear);

    var t2 = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    var units = "Filings";
    var formatNumber = d3.format(",.0f"),
        formatPercent = d3.format(".0%"),
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scaleOrdinal(d3.schemeCategory20);

    var svg = null;
    var g = null;

    // var legendHorz = (width + margin.left)/3;
    // var legendVert = (height + margin.bottom *.8);
    var legendHorz = margin.left;
    var legendVert = margin.top;

    // parse the date / time
    var parseTime = d3.timeParse("%Y");
    var toNumber = function(v) {
        return +v;
    };

    var migrationFieldMapping = [
        {'raw': 'Year', 'final': 'year', 'conversion': parseTime},
        {'raw': 'Net Migration', 'final': 'net', 'conversion': toNumber},
        {'raw': 'International', 'final': 'international', 'conversion': toNumber},
        {'raw': 'Domestic', 'final': 'domestic', 'conversion': toNumber}
    ];

    var populationFieldMapping = [
        {'raw': 'year', 'final': 'year', 'conversion': parseTime},
        {'raw': 'population', 'final': 'population', 'conversion': toNumber}
    ];

    var birthsFieldMapping = [
        {'raw': 'Year', 'final': 'year', 'conversion': parseTime},
        {'raw': 'Births', 'final': 'births', 'conversion': toNumber},
        {'raw': 'Deaths', 'final': 'deaths', 'conversion': toNumber},
        {'raw': 'Natural Increas', 'final': 'natural', 'conversion': toNumber}
    ];

    var regionalNetDomesticFieldMapping = [
        {'raw': 'year', 'final': 'year', 'conversion': parseTime},
    ];

    var regionalStateNetDomesticFieldMapping = [
        {'raw': 'Year', 'final': 'year', 'conversion': parseTime},
    ];

    var drsFieldMapping = [
        {'raw': 'year', 'final': 'year', 'conversion': parseTime},
        {'raw': '15-50', 'final': '$15k-$50k', 'conversion': toNumber},
        {'raw': '50-100', 'final': '$50k-$100k', 'conversion': toNumber},
        {'raw': '100-200', 'final': '$100k-$200k', 'conversion': toNumber},
        {'raw': '200-500', 'final': '$200k-$500k', 'conversion': toNumber},
        {'raw': '500-1000', 'final': '$500k-$1m', 'conversion': toNumber},
        {'raw': '1000-5000', 'final': '$1m-$5m', 'conversion': toNumber},
        {'raw': '5000+', 'final': '$5m+', 'conversion': toNumber},
    ];

    // var migrationByAgeFieldMapping = [
    //     {'raw': 'count', 'final': 'count', 'conversion': toNumber}
    // ];

    var agiFlowsFieldMapping = [
        {'raw': 'count', 'final': 'count', 'conversion': toNumber}
    ];

    // set the ranges

    // Migration Data
    var migrationLineX = d3.scaleTime().range([0, width]);
    var migrationLineY = d3.scaleLinear().range([height, 0]);

    var xAxisMigration = d3.axisBottom().scale(migrationLineX);
    var yAxisMigration = d3.axisLeft().scale(migrationLineY);


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

    // Net Migrationa Region States
    var regionalStateMigrationLineX = d3.scaleTime().range([0, width]);
    var regionalStateMigrationLineY = d3.scaleLinear().range([height, 0]);

    var xAxisRegionalStateMigration = d3.axisBottom().scale(regionalStateMigrationLineX);
    var yAxisRegionalStateMigration = d3.axisLeft().scale(regionalStateMigrationLineY).tickFormat(d3.format(".2%"));

     // Migration by Age

    var migrationByAgeY = d3.scaleBand().rangeRound([0, height]).paddingInner(0.05).align(0.1);
    var migrationByAgeX = d3.scaleLinear().range([0, width]);

    var xAxisMigrationByAge = d3.axisBottom().scale(migrationByAgeX);
    var yAxisMigrationByAge = d3.axisLeft().scale(migrationByAgeY);

    // Flows by AGI

    var agiFlowsY = d3.scaleBand().rangeRound([0, height]).paddingInner(0.05).align(0.1);
    var agiFlowsX = d3.scaleLinear().range([0, width]);

    var xAxisAGIFlows = d3.axisBottom().scale(agiFlowsX);
    var yAxisAGIFlows = d3.axisLeft().scale(agiFlowsY);

    // DRS Out
    var drsOutLineX = d3.scaleTime().range([0, width]);
    var drsOutLineY = d3.scaleLinear().range([height, 0]);

    var xAxisDRSOut = d3.axisBottom().scale(drsOutLineX);
    var yAxisDRSOut = d3.axisLeft().scale(drsOutLineY).tickFormat(formatPercent);


    var lineFactory = function(xScale, yScale, xVar, yVar) {
        return d3.line()
            .curve(d3.curveNatural)
            .x(function(d) {
                return xScale(d[xVar]);
            })
            .y(function(d) {
                return yScale(d[yVar]);
            });
    };

    var net_line = lineFactory(migrationLineX, migrationLineY, 'year', 'net');
    var international_line = lineFactory(migrationLineX, migrationLineY, 'year', 'international');
    var domestic_line = lineFactory(migrationLineX, migrationLineY, 'year', 'domestic');

    var reference_line = d3.line()
        .x(function (d) {
            return migrationLineX(d.year);
        })
        .y(function () {
            return migrationLineY(0);
        });

    // CT Population Graph
    var populationCTLine = lineFactory(populationLineX, populationLineY, 'year', 'population');


    // Births
    var birthsLine = lineFactory(birthsLineX, birthsLineY, 'year', 'births');
    var deathsLine = lineFactory(birthsLineX, birthsLineY, 'year', 'deaths');

    var regionalMigrationCTLine = lineFactory(regionalMigrationLineX, regionalMigrationLineY, 'year', 'Connecticut');

    var regionalMigrationNELine = lineFactory(regionalMigrationLineX, regionalMigrationLineY, 'year', 'New England');

    var regionalMigrationNeighboringLine = lineFactory(regionalMigrationLineX, regionalMigrationLineY, 'year', 'Neighboring States');



    // Regional Migration by State
    var regionalStateCTMigrationLine = lineFactory(regionalStateMigrationLineX, regionalStateMigrationLineY, 'year', 'Connecticut');
    var regionalStateMAMigrationLine = lineFactory(regionalStateMigrationLineX, regionalStateMigrationLineY, 'year', 'Massachusetts');
    var regionalStateNJMigrationLine = lineFactory(regionalStateMigrationLineX, regionalStateMigrationLineY, 'year', 'New Jersey');
    var regionalStateRIMigrationLine = lineFactory(regionalStateMigrationLineX, regionalStateMigrationLineY, 'year', 'Rhode Island');
    var regionalStateNYMigrationLine = lineFactory(regionalStateMigrationLineX, regionalStateMigrationLineY, 'year', 'New York');


    // DRS Outmigration Lines
    var agi15Line = lineFactory(drsOutLineX, drsOutLineY, 'year', '$15k-$50k');
    var agi50Line = lineFactory(drsOutLineX, drsOutLineY, 'year', '$50k-$100k');
    var agi100Line = lineFactory(drsOutLineX, drsOutLineY, 'year', '$100k-$200k');
    var agi200Line = lineFactory(drsOutLineX, drsOutLineY, 'year', '$200k-$500k');
    var agi500Line = lineFactory(drsOutLineX, drsOutLineY, 'year', '$500k-$1m');
    var agi1000Line = lineFactory(drsOutLineX, drsOutLineY, 'year', '$1m-$5m');
    var agi5000Line = lineFactory(drsOutLineX, drsOutLineY, 'year', '$5m+');

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
                .attr('transform', 'translate(' + margin.left + ',' + (margin.top+50) + ')');


            // var migrationData = getMigrationData(rawData);
            var populationData = dataLoader(rawData, 'CTPopulation', populationFieldMapping);
            var migrationData = dataLoader(rawData, 'MigrationData', migrationFieldMapping);
            var birthsData = dataLoader(rawData, 'NaturalIncrease', birthsFieldMapping);
            var regionalNetDomestic = dataLoader(rawData, 'RegionalNetDomestic', regionalNetDomesticFieldMapping);
            var regionalStateNetDomestic = dataLoader(rawData, 'NewEnglandStatesNetDomestic', regionalStateNetDomesticFieldMapping);
            var educationFlow = dataLoader(rawData, 'EducationFlow', []);
            var flowData = getFlowData(rawData);
            var drsData = dataLoader(rawData, 'DRSOut', drsFieldMapping);
            var agiFlowsData = dataLoader(rawData, 'FlowsByAGI', agiFlowsFieldMapping);
            var migrationAgeData = dataLoader(rawData, 'MigrationByAge', []);

            setupVis(migrationData,
                flowData,
                birthsData,
                populationData,
                regionalNetDomestic,
                regionalStateNetDomestic,
                educationFlow,
                drsData,
                agiFlowsData,
                migrationAgeData
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

    var setupVis = function (migrationData, flowData, birthsData, populationData,
                             regionalNetDomesticData, regionalStateNetDomesticData, educationFlow,
                             drsData, agiFlowsData, migrationAgeData) {

        console.log(agiFlowsData);
        // Migration Data - Set X and Y domain
        migrationLineX.domain(d3.extent(migrationData, function (d) {
            return d.year;
        }));


        // migrationLineY.domain([migration_min_y + migration_min_y * .1, migration_max_y + migration_max_y * .1]);
        migrationLineY.domain([-31000,22000]);

        // Annotations for Birth Graph per and post recession shading boxes
        var migrationRecessionShadingLabels = [
            {
                data: { year: '2004', births: migrationLineY.domain()[1] },
                dx: 0,
                dy: 3,
                note: { title: "Pre-recession" },
                subject: {
                    height: height,
                    width: migrationLineX(parseTime("2007")) - migrationLineX(parseTime("2004"))
                }
            },
            {
                data: { year: '2013', births: migrationLineY.domain()[1] },
                dx: 0,
                dy: 3,
                note: { title: "Post-recession" },
                subject: {
                    height: height,
                    width: migrationLineX(parseTime("2016")) - migrationLineX(parseTime("2013"))
                }
            }
        ];


        const migrationShadingAnnotation = d3.annotationCustomType(
          d3.annotationCalloutRect,
          {"className": "migration-recession-shading",
            "connector":{"type":"line"},
            "note":{"lineType":"vertical",
            "align":"left"}});


        var makeMigrationRecessionShadingAnnotations = d3.annotation()
            .annotations(migrationRecessionShadingLabels)
            .type(migrationShadingAnnotation).accessors({
                x: function x(d) {
                    return migrationLineX(parseTime(d.year)); },
                y: function y(d) {
                    return migrationLineY(d.births); }
            }).accessorsInverse({
                year: function year(d) { return parseTime(migrationLineX.invert(d.x))},
                births: function births(d) { return migrationLineY.invert(d.y)}
            });



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

        var netMigrationLegendScale = d3.scaleOrdinal()
            .domain(['Domestic', 'International', 'Net'])
            .range(['Steelblue', 'Orange', 'Black']);


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
                data: { year: '2010', population: 3579899 },
                dx: -50,
                dy: 0,
                note: { title: "2010: 3,579,889"},
                subject: { radius: 4 }
            },
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

        // birthsLineY.domain([birthCountExtent[0] - birthCountExtent[0] * .025, birthCountExtent[1] + birthCountExtent[1] * .025]);

        birthsLineY.domain([25000,45000]);
        birthsLineX.domain(d3.extent(birthsData, function(d) {
            return d.year;
        }));

        var naturalIncreaseLegendScale = d3.scaleOrdinal()
            .domain(['Births', 'Deaths'])
            .range(['Steelblue', '#BD392F']);


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
        regionalMigrationLineY.domain([-0.015, .002]);

        regionalMigrationLineX.domain(d3.extent(regionalNetDomesticData, function (d) { return d.year; }));

        var regionalMigrationLegendScale = d3.scaleOrdinal()
            .domain(['Connecticut', 'New England', 'Neighboring States'])
            .range(['Steelblue', '#BD392F', '#3AC2A6']);


        regionalStateMigrationLineY.domain([-0.015, .002]);

        regionalStateMigrationLineX.domain(d3.extent(regionalStateNetDomesticData, function (d) {
            return d.year;
        }));

        var stateMigrationLegendScale1 = d3.scaleOrdinal()
            .domain(['CT', 'MA', 'RI'])
            .range(['Steelblue', 'Grey', 'Green']);

         var stateMigrationLegendScale2 = d3.scaleOrdinal()
            .domain(['CT', 'NY', 'NJ'])
            .range(['Steelblue', 'Orange', 'Purple']);


        // DRS Domain and Legend

        drsOutLineX.domain(d3.extent(drsData, function(d) { return d.year; }));
        drsOutLineY.domain([-.15, 0]);

        var drsLegendScale = d3.scaleOrdinal(d3.schemeCategory20)
            .domain(['$15k-$50k', '$50k-$100k', '$100k-$200k', '$200k-$500k', '$500k-$1m', '$1m-$5m', '$5m+']);

        // AGI Flow Bar Charts
        agiFlowsY.domain(agiFlowsData.map(function(d) { return d.agi; }));
        agiFlowsX.domain([-30000,30000]);

        var outInNetScale = d3.scaleOrdinal()
            .domain(['Out', 'In', 'Net'])
            .range(['#91B2E5', '#C2D898', 'Black']);


        // Migration By Age Bar Chars
        migrationByAgeY.domain(migrationAgeData.map(function(d) { return d.age; }));
        migrationByAgeX.domain([-50000, 50000]);

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

        function drawLine(target, data, id, color, dasharray, lineClass, callable) {
            target.append("path")
                .data([data])
                .attr("class", lineClass)
                .attr("id", id)
                .style("stroke", color)
                .style("stroke-dasharray", function() {
                    if (dasharray == "solid") {
                        return ("1, 0")
                    } else {
                        return dasharray
                    }
                })
                .style("opacity", 0)
                .attr("d", callable);
        }

        function drawTitle(target, id, title, legend) {
            target.append("text")
                // .attr("x", (width / 2) + margin.left)
                .attr("x", margin.left)
                .attr("y", function() {
                    if (legend) {
                        return margin.top / 1.5
                    } else {
                        return margin.top * 1.5
                    }
                })
                .attr("text-anchor", "left")
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

        function drawSource(target, id, source) {
            target.append("text")
                .attr("x", margin.left)
                .attr("y", height + margin.top + margin.bottom/2 + 25)
                .attr("text-anchor", "left")
                .attr("id", id)
                .style("font-size", "16px")
                .style("font-weight", "400")
                .style("display", "none")
                .text(source);
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
            .attr("xlink:href", "/static/ctdata/images/migration_four.png")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .attr("id", "canva_four")
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
            .attr("xlink:href", "/static/ctdata/images/migration_five.png")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .attr("id", "canva_five")
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


        // Births Axes
        drawAxis(g, "births", "y", yAxisBirths);
        drawAxis(g, "births", "x", xAxisBirths);

        // Regional Migration Axis
        drawAxis(g, "regional_net", "y", yAxisRegionalMigration);
        drawAxis(g, "regional_net", "x", xAxisRegionalMigration);

        // Regional State Migration Axis
        drawAxis(g, "regional_state_net", "y", yAxisRegionalStateMigration);
        drawAxis(g, "regional_state_net", "x", xAxisRegionalStateMigration);

        // Migration By Age Axis
        drawAxis(g, "migration_age", "x", xAxisMigrationByAge);
        drawAxis(g, "migration_age", "y", yAxisMigrationByAge);

        // AGI Flow Axis
        drawAxis(g, 'agi_flows', 'x', xAxisAGIFlows);
        drawAxis(g, 'agi_flows', 'y', yAxisAGIFlows);

        // DRS Axes
        drawAxis(g, "drs", "y", yAxisDRSOut);
        drawAxis(g, "drs", "x", xAxisDRSOut);

        // CT Population Lines
        drawLine(g, populationData, "ct-population-line", "steelblue", "solid","line", populationCTLine);
        annotate(g, "annotation-population", makePopulationAnnotations);
        drawTitle(svg, "population-title", "CT Population: 2001-2016", false);
        drawSource(svg, "population-source", "Source: ​Census Population Estimates");

        // migration lines
        drawShadeBox(g, "migration-prerecession-shading", parseTime("2004"), parseTime("2007"), populationLineX, "lightgrey");
        drawShadeBox(g, "migration-postrecession-shading", parseTime("2013"), parseTime("2016"), populationLineX, "lightgrey");
        drawLine(g, migrationData, "migration-ref-line", "black", "solid", "ref-line", reference_line);
        drawLine(g, migrationData, "domestic-line", "steelblue", "solid", "line", domestic_line);
        drawLine(g, migrationData, "international-line", "orange", "solid", "line", international_line);
        drawLine(g, migrationData, "net-line", "black", "solid", "line", net_line);
        drawTitle(svg, "net-migration-title", "Net Migration", true);
        annotate(g, "net-migration-annotation", makeNetMigrationAnnotations);
        annotate(g, "migration-recession-annotation", makeMigrationRecessionShadingAnnotations);
        drawSource(svg, "migration-source", "Source: ​Census Population Estimates");

        svg.append("g")
            .attr("class", "netMigrationLegend")
            .attr("transform", "translate(" + legendHorz + "," + legendVert + ")")
            .style("display", "none");

        var netMigrationLegendOrdinal = d3.legendColor()
            .shapeWidth(15)
            .orient("horizontal")
            .shapePadding(120)
            .scale(netMigrationLegendScale);

        svg.select(".netMigrationLegend").call(netMigrationLegendOrdinal);

        var legendReflow = function(selector) {
            var x = 0;
            var i = 0;
            var currentLegend = svg.select(selector);
            var cells  = currentLegend.select('.legendCells');
            cells.selectAll('.cell').each(function(d,i) {
                var text = d3.select(this).select('text.label');
                var textSize = measureText(text.text(), 16, 'Roboto');
                text.attr("transform", "translate(17,15)").attr("style", "text-anchor: left;");
                d3.select(this).attr("transform", function() {
                    if (i == 0) {
                        x = textSize.width + 40;
                        return "translate(0,0)";
                    } else {
                        var oldX = x;
                        x += textSize.width + 40;
                        return "translate(" + oldX + ",0)";
                    }
                })
            });
        };

        legendReflow(".netMigrationLegend");
        // Births Lines
        drawShadeBox(g, "prerecession-shading", parseTime("2004"), parseTime("2007"), populationLineX, "lightgrey");
        drawShadeBox(g, "postrecession-shading", parseTime("2013"), parseTime("2016"), populationLineX, "lightgrey");
        annotate(g, "annotation-recession", makeRecessionShadingAnnotations);
        drawLine(g, birthsData, "births-line", "steelblue", "solid", "line", birthsLine);
        drawLine(g, birthsData, "deaths-line", "#BD392F", "solid", "line", deathsLine);
        drawTitle(svg, "births-title", "Pre and Post Recession Births and Deaths", true);
        drawSource(svg, "births-source", "Source: ​Census Population Estimates");

        svg.append("g")
            .attr("class", "birthsLegend")
            .attr("transform", "translate(" + legendHorz + "," + legendVert + ")")
            .style("display", "none");

        var naturalIncreaseOrdinalLegend = d3.legendColor()
            .shapeWidth(15)
            .orient("horizontal")
            .shapePadding(120)
            .scale(naturalIncreaseLegendScale);

        svg.selectAll(".birthsLegend").call(naturalIncreaseOrdinalLegend);
        legendReflow(".birthsLegend");

        // Regional Net
        drawLine(g, regionalNetDomesticData, "regional-net-ct", "steelblue", "solid", "line", regionalMigrationCTLine);
        drawLine(g, regionalNetDomesticData, "regional-net-ne", "#BD392F", "solid", "line", regionalMigrationNELine);
        drawLine(g, regionalNetDomesticData, "regional-net-neigh", "#3AC2A6", "solid", "line", regionalMigrationNeighboringLine);
        drawTitle(svg, "regional-net-migration-title", "Domestic Migration as Percent of Total Population", true);
        drawSource(svg, "regional-source", "Source: ​Census Population Estimates");

        svg.append("g")
            .attr("class", "regionalMigrationLegend")
            .attr("transform", "translate(" + legendHorz + "," + legendVert + ")")
            .style("display", "none");

        var migrationLegendOrdinal = d3.legendColor()
            .shapeWidth(15)
            // .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .orient("horizontal")
            .shapePadding(120)
            .scale(regionalMigrationLegendScale);

        svg.select(".regionalMigrationLegend").call(migrationLegendOrdinal);
        legendReflow(".regionalMigrationLegend");

        // Regional State
        drawLine(g, regionalStateNetDomesticData, "regional-state-ct", "steelblue", "solid", "line", regionalStateCTMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-ma", "grey", "solid", "line", regionalStateMAMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-ri", "green", "solid", "line", regionalStateRIMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-ny", "orange", "solid", "line", regionalStateNYMigrationLine);
        drawLine(g, regionalStateNetDomesticData, "regional-state-nj", "purple", "solid", "line", regionalStateNJMigrationLine);
        drawSource(svg, "regional-state-source", "Source: ​Census Population Estimates");

        svg.append("g")
            .attr("class", "stateMigrationLegend1")
            .attr("transform", "translate(" + legendHorz + "," + legendVert + ")")
            .style("display", "none");

        svg.append("g")
            .attr("class", "stateMigrationLegend2")
            .attr("transform", "translate(" + legendHorz + "," + legendVert + ")")
            .style("display", "none");

        var stateMigrationLegendOrdinal1 = d3.legendColor()
            .shapeWidth(15)
            // .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .orient("horizontal")
            .shapePadding(120)
            .scale(stateMigrationLegendScale1);

        var stateMigrationLegendOrdinal2 = d3.legendColor()
            .shapeWidth(15)
            // .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .orient("horizontal")
            .shapePadding(120)
            .scale(stateMigrationLegendScale2);

        svg.select(".stateMigrationLegend1").call(stateMigrationLegendOrdinal1);
        legendReflow(".stateMigrationLegend1");
        svg.select(".stateMigrationLegend2").call(stateMigrationLegendOrdinal2);
        legendReflow(".stateMigrationLegend2");
        // Migration By Age

        svg.append("g")
            .attr("class", "migrationByAgeLegend")
            .attr("transform", "translate(" + legendHorz + "," + legendVert + ")")
            .style("display", "none");

        g.selectAll('.migration-by-age-bar')
            .data(migrationAgeData.filter(function(d) { return d.type != 'net' }))
            .enter().append('rect')
            .attr("class", function(d) {
                return "migration-by-age-bar migration-by-age-bar--" + (d.count < 0 ? "negative" : "positive"); })
            .attr("id", function(d) {
                return d.age.slice(0,3) + d.type;
            })
            .attr("x", function(d) {
                return migrationByAgeX(Math.min(0, d.count)) })
            .attr("y", function(d) {
                return migrationByAgeY(d.age);
            })
            .attr("height", migrationByAgeY.bandwidth())
            .attr("width", function(d) {
                return Math.abs(migrationByAgeX(d.count) - migrationByAgeX(0));
            })
            .style("fill", function(d) {
                return d.count < 0 ? '#91B2E5' : '#C2D898';
            })
            .style("opacity", 0)

        g.selectAll('circle.migration-by-age-net-circle')
            .data(migrationAgeData.filter(function(d) { return d.type == 'net'}))
            .enter().append('circle')
            .attr('class', 'migration-by-age-net-circle')
            .attr('cx', function(d) {
                return migrationByAgeX(d.count)
            })
            .attr('cy', function(d) {
                return migrationByAgeY(d.age) + migrationByAgeY.bandwidth()/2
            })
            .attr('r', 7.5)
            .style('fill', 'black')
            .style('opacity', 0);

        drawTitle(svg, 'migration-by-age-title', 'Migration by Age', true);
        drawSource(svg, 'migration-by-age-source', 'Source: US Census American Community Survey');

        var migrationByAgeOrdinal = d3.legendColor()
            .shapeWidth(15)
            // .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .orient("horizontal")
            .shapePadding(120)
            .scale(outInNetScale);

        svg.select(".migrationByAgeLegend").call(migrationByAgeOrdinal);
        legendReflow(".migrationByAgeLegend");


        // AGI Flows
        svg.append("g")
            .attr("class", "agiFlowsLegend")
            .attr("transform", "translate(" + legendHorz + "," + legendVert + ")")
            .style("display", "none");

        g.selectAll('.agi-flow-bar')
            .data(agiFlowsData.filter(function(d) { return d.type != 'Net Returns' }))
            .enter().append('rect')
            .attr("class", function(d) {
                return "agi-flow-bar agi-flow-bar--" + (d.count < 0 ? "negative" : "positive"); })
            .attr("x", function(d) {
                return agiFlowsX(Math.min(0, d.count)) })
            .attr("y", function(d) {
                return agiFlowsY(d.agi);
            })
            .attr("height", agiFlowsY.bandwidth())
            .attr("width", function(d) {
                return Math.abs(agiFlowsX(d.count) - agiFlowsX(0));
            })
            .style("fill", function(d) {
                return d.count < 0 ? '#91B2E5' : '#C2D898';
            })
            .style("opacity", 0);

        g.selectAll('circle.agi-flow-circle')
            .data(agiFlowsData.filter(function(d) { return d.type == 'Net Returns'}))
            .enter().append('circle')
            .attr('class', 'agi-flow-circle')
            .attr('cx', function(d) {
                return agiFlowsX(d.count)
            })
            .attr('cy', function(d) {
                return agiFlowsY(d.agi) + agiFlowsY.bandwidth()/2
            })
            .attr('r', 7.5)
            .style('fill', 'black')
            .style('opacity', 0);

        drawTitle(svg, 'agi-flows-title', 'Migration by Adjusted Gross Income', true);
        drawSource(svg, 'migration-by-agi-source', 'Source: IRS Gross Migration Files');

        var agiFlowOrdinal = d3.legendColor()
            .shapeWidth(15)
            // .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .orient("horizontal")
            .shapePadding(120)
            .scale(outInNetScale);

        svg.select(".agiFlowsLegend").call(agiFlowOrdinal);
        legendReflow(".agiFlowsLegend");

        // DRS Drawing
        var drsDrawer = function(id, key, line) {
            drawLine(g, drsData, id, drsLegendScale(key), "solid", "line", line);
        };

        drsDrawer('drs15k', '$15k-$50k', agi15Line);
        drsDrawer('drs50k', '$50k-$100k', agi50Line);
        drsDrawer('drs100k', '$100k-$200k', agi100Line);
        drsDrawer('drs200k', '$200k-$500k', agi200Line);
        drsDrawer('drs500k', '$500k-$1m', agi500Line);
        drsDrawer('drs1m', '$1m-$5m', agi1000Line);
        drsDrawer('drs5m', '$5m+', agi5000Line);
        drawTitle(svg, "drs-title", "Out Migration by Adjusted Gross Income", true);
        drawSource(svg, 'migration-by-drs-source', 'Source: CT Department of Revenue Services');

        svg.append("g")
            .attr("class", "drsLegend")
            .attr("transform", "translate(" + 50 + "," + legendVert + ")")
            .style("display", "none");


        var drsLegendOrdinal = d3.legendColor()
            .shapeWidth(15)
            .orient("horizontal")
            .shapePadding(85)
            .scale(drsLegendScale);

        svg.select(".drsLegend").call(drsLegendOrdinal);
        // legendReflow(".drsLegend");

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

        drawTitle(svg, 'sankey-title', 'In and Out-migration by State', false);
        drawSource(svg, 'sankey-source', 'Source: IRS State-to-State In and Out Flow Files');

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
        activateFunctions['Net International Migration'] = ctNetInternationalMigration;
        activateFunctions['Net Domestic Migration Regional CT'] = regionalDomesticMigrationCT;
        activateFunctions['Net Domestic Migration Regional All'] = regionalDomesticMigrationAll;
        activateFunctions['Net Domestic Migration State CT'] = stateDomesticMigrationCT;
        activateFunctions['Net Domestic Migration State All'] = stateDomesticMigrationAll;
        activateFunctions['Alluvial In Migration'] = alluvialInMigration;
        activateFunctions['Alluvial Out Migration'] = alluvialOutMigration;
        activateFunctions['Canva 3'] = canvaThree;
        activateFunctions['Canva 5'] = canvaFive;
        activateFunctions['CT Population and Migration by Education'] = migrationByEducation;
        activateFunctions['CT Net International Migration'] = ctNetInternationalMigration;
        activateFunctions['CT Net International / Domestic Migration'] = ctNetMigration;
        activateFunctions['Migration by Age'] = migrationByAge;
        activateFunctions['Flows by AGI'] = flowsByAGI;
        activateFunctions['DRS Out Migration by AGI Low'] = drsOutLow;
        activateFunctions['DRS Out Migration by AGI Rest'] = drsOutRest;
    };

    // Reveal Functions

    function canvaOne() {
        hiderDispatch('hideCanvaOne');
        d3.select("#canva_one").style("opacity", 1);
    }

    function ctPopulation() {
        hiderDispatch('hidePopulation');
        d3.select("#population_x_axis").style("opacity", 1);
        d3.select("#population_y_axis").style("opacity", 1);
        d3.select("#ct-population-line").style("stroke-width", 5).style("opacity", 1);
        d3.select(".annotation-population").style("display", "block");
        d3.select("#population-title").style("display", "block");
        d3.select("#population-source").style("display", "block");
    }


    function canvaTwo() {
        hiderDispatch('hideCanvaTwo');
        d3.select("#canva_two").style("opacity", 1);
    }

    function births() {
        hiderDispatch('hideBirths');
        d3.select("#births_x_axis").style("opacity", 1);
        d3.select("#births_y_axis").style("opacity", 1);
        d3.select("#births-line").style("stroke-width", 5).style("opacity", 1);
        d3.select("#deaths-line").style("stroke-width", 5).style("opacity", 1);
        d3.select("#prerecession-shading").style("opacity", 0.4);
        d3.select("#postrecession-shading").style("opacity", 0.4);
        d3.select(".annotation-recession").style("display", "block");
        d3.select("#births-title").style("display", "block");
        d3.selectAll(".birthsLegend").style("display", "block");
        d3.select("#births-source").style("display", "block");
    }

    function ctNetDomesticMigration() {
        hiderDispatch('hideMigration');
        try {
            d3.select("#migration-ref-line").style("opacity", 1);
            d3.select("#migration_x_axis").style("opacity", 1);
            d3.select("#migration_y_axis").style("opacity", 1);
            d3.select("#domestic-line").transition(t).style("stroke-width", 5).style("opacity", 1);
            d3.select("#net-line").transition(t).style("stroke-width", 5).style("opacity", 0);
            d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", 0);
            d3.select("#net-migration-title").style("display", "block");
            d3.selectAll(".migration-recession-annotation").style("display", "block");
            d3.select("#migration-prerecession-shading").style("opacity", 0.4);
            d3.select("#migration-postrecession-shading").style("opacity", 0.4);
            d3.selectAll(".netMigrationLegend").style("display", "block");
            d3.select("#migration-source").style("display", "block");
        } catch (err) {
        }

    }

    function ctNetInternationalMigration() {
        hiderDispatch('hideMigration');
        // hideRegionalNetMigration();
        d3.select("#migration-ref-line").style("opacity", 1);
        d3.select("#migration_x_axis").style("opacity", 1);
        d3.select("#migration_y_axis").style("opacity", 1);
        d3.select("#domestic-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#international-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-migration-title").style("display", "block");
        d3.selectAll(".migration-recession-annotation").style("display", "block");
        d3.select("#migration-prerecession-shading").style("opacity", 0.4);
        d3.select("#migration-postrecession-shading").style("opacity", 0.4);
        d3.selectAll(".netMigrationLegend").style("display", "block");
        d3.select("#migration-source").style("display", "block");
    }

    function ctNetMigration() {
        hiderDispatch('hideMigration');
        d3.select("#migrationa-ref-line").style("opacity", 1);
        d3.select("#migration_x_axis").style("opacity", 1);
        d3.select("#migration_y_axis").style("opacity", 1);
        d3.select("#domestic-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#international-line").transition(t).style("stroke-width", 2).style("opacity", .25);
        d3.select("#net-line").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#net-migration-title").style("display", "block");
        d3.select(".net-migration-annotation").style("display", "block");
        d3.select("#migration-source").style("display", "block");
    }

    function regionalDomesticMigrationCT() {
        hiderDispatch('hideRegionalNetMigration');
        d3.select("#regional_net_x_axis").style("opacity", 1);
        d3.select("#regional_net_y_axis").style("opacity", 1);
        d3.select("#regional-net-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-net-ne").transition(t).style("opacity", 0);
        d3.select("#regional-net-neigh").transition(t).style("opacity", 0);
        d3.select("#regional-net-migration-title").style("display", "block");
        d3.selectAll(".regionalMigrationLegend").style("display", "block");
        d3.select("#regional-source").style("display", "block");
    }

    function regionalDomesticMigrationAll() {
        hiderDispatch('hideRegionalNetMigration');
        d3.select("#regional_net_x_axis").style("opacity", 1);
        d3.select("#regional_net_y_axis").style("opacity", 1);
        d3.select("#regional-net-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-net-ne").transition(t).style("stroke-width", 5).style("opacity", .5);
        d3.select("#regional-net-neigh").transition(t).style("stroke-width", 5).style("opacity", .5);
        d3.select("#regional-net-migration-title").style("display", "block");
        d3.selectAll(".regionalMigrationLegend").style("display", "block");
        d3.select("#regional-source").style("display", "block");
    }

    function stateDomesticMigrationCT() {
        hiderDispatch('hideStateDomesticMigration');
        d3.select("#regional_state_net_x_axis").style("opacity", 1);
        d3.select("#regional_state_net_y_axis").style("opacity", 1);
        d3.select("#regional-state-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-ma").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-ri").transition(t).style("stroke-width", 5).style("opacity", 1);
        d3.select("#regional-state-ny").transition(t).style("opacity", 0);
        d3.select("#regional-state-nj").transition(t).style("opacity", 0);
        d3.select("#regional-net-migration-title").style("display", "block");
        d3.selectAll(".stateMigrationLegend1").style("display", "block");
        d3.selectAll(".stateMigrationLegend2").style("display", "none");
        d3.select("#regional-state-source").style("display", "block");
    }

    function stateDomesticMigrationAll() {
        hiderDispatch('hideStateDomesticMigration');
        try {
            d3.select("#regional_state_net_x_axis").style("opacity", 1);
            d3.select("#regional_state_net_y_axis").style("opacity", 1);
            d3.select("#regional-state-ct").transition(t).style("stroke-width", 5).style("opacity", 1);
            d3.select("#regional-state-ma").transition(t).style("stroke-width", 5).style("opacity", 0);
            d3.select("#regional-state-ri").transition(t).style("stroke-width", 5).style("opacity", 0);
            d3.select("#regional-state-ny").transition(t).style("stroke-width", 5).style("opacity", 1);
            d3.select("#regional-state-nj").transition(t).style("stroke-width", 5).style("opacity", 1);
            d3.select("#regional-net-migration-title").style("display", "block");
            d3.selectAll(".stateMigrationLegend1").style("display", "none");
            d3.selectAll(".stateMigrationLegend2").style("display", "block");
            d3.select("#regional-state-source").style("display", "block");
        }
        catch(err) {
            console.log(err);
        }

    }


    function alluvialInMigration() {
        hiderDispatch('hideAlluvial');
        d3.selectAll(".d3-tip").style("display", "block");
        d3.selectAll(".left-node").transition(t).style("opacity", 1);
        d3.selectAll(".left-link").transition(t2).style("opacity", 1);
        d3.selectAll(".right-link").transition(t).style("opacity", 0);
        d3.selectAll(".right-node").transition(t).style("opacity", 0);
        d3.select("#sankey-title").style("display", "block");
        d3.select("#sankey-source").style("display", "block");
    }

    function alluvialOutMigration() {
        hiderDispatch('hideAlluvial');
        d3.selectAll(".left-node").transition(t).style("opacity", 1);
        d3.selectAll(".left-link").transition(t2).style("opacity", 1);
        d3.selectAll(".right-link").transition(t).style("opacity", 1);
        d3.selectAll(".right-node").transition(t2).style("opacity", 1);
        d3.select("#sankey-title").style("display", "block");
        d3.select("#sankey-source").style("display", "block");
    }

    function canvaThree() {
        hiderDispatch('hideCanvaThree');
        d3.select("#canva_three").style("opacity", 1);
    }

    function canvaFive() {
        hiderDispatch('hideCanvaFive');
        d3.select("#canva_five").style("opacity", 1);
    }
    function migrationByEducation() {
        hideCanvaThree();
    }

    function drsOutLow() {
        hiderDispatch('hideDRS');
        d3.select("#drs_x_axis").style("opacity", 1);
        d3.select("#drs_y_axis").style("opacity", 1);
        d3.select("#drs15k").transition(t).style("opacity", 1).style("stroke-width", 5);
        d3.select("#drs50k").transition(t).style("opacity", 1).style("stroke-width", 5);
        d3.select("#drs100k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs200k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs500k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs1m").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs5m").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select(".drsLegend").transition(t).style("display", "block");
        d3.select("#drs-title").style("display", "block");
        d3.select("#migration-by-drs-source").style("display", "block");
    }

    function drsOutRest() {
        hiderDispatch('hideDRS');
        d3.select("#drs_x_axis").style("opacity", 1);
        d3.select("#drs_y_axis").style("opacity", 1);
        d3.select("#drs15k").transition(t).style("opacity", .5).style("stroke-width", 3);
        d3.select("#drs50k").transition(t).style("opacity", .5).style("stroke-width", 3);
        d3.select("#drs100k").transition(t).style("opacity", 1).style("stroke-width", 5);
        d3.select("#drs200k").transition(t).style("opacity", 1).style("stroke-width", 5);
        d3.select("#drs500k").transition(t).style("opacity", 1).style("stroke-width", 5);
        d3.select("#drs1m").transition(t).style("opacity", 1).style("stroke-width", 5);
        d3.select("#drs5m").transition(t).style("opacity", 1).style("stroke-width", 5);
        d3.select(".drsLegend").transition(t).style("display", "block");
        d3.select("#drs-title").style("display", "block");
        d3.select("#migration-by-drs-source").style("display", "block");
    }

    function migrationByAge() {
        hiderDispatch('hideMigrationByAge');
        d3.select('#migration_age_x_axis').style('opacity', 1);
        d3.select('#migration_age_y_axis').style('opacity', 1);
        d3.selectAll(".migration-by-age-bar").transition(t).style("opacity", 1);
        d3.selectAll('.migration-by-age-net-circle').transition(t).style('opacity', 1);
        d3.select('#migration-by-age-title').style('display', 'block');
        d3.select(".migrationByAgeLegend").transition(t).style("display", "block");
        d3.select("#migration-by-age-source").style("display", "block");

    }

    function flowsByAGI() {
        hiderDispatch('hideAGIFlows');
        d3.select('#agi_flows_x_axis').style('opacity', 1);
        d3.select('#agi_flows_y_axis').style('opacity', 1);
        d3.selectAll(".agi-flow-bar").transition(t).style("opacity", 1);
        d3.selectAll('.agi-flow-circle').transition(t).style('opacity', 1);
        d3.select('#agi-flows-title').style('display', 'block');
        d3.select(".agiFlowsLegend").transition(t).style("display", "block");
        d3.select("#migration-by-agi-source").style("display", "block");
    }

    // Hide Functions

    var hiderArray = [
        {'name': 'hideCanvaOne', 'hider': hideCanvaOne },
        {'name': 'hideCanvaTwo', 'hider': hideCanvaTwo },
        {'name': 'hideCanvaThree', 'hider': hideCanvaThree },
        {'name': 'hideCanvaFive', 'hider': hideCanvaFive },
        {'name': 'hideBirths', 'hider': hideBirths },
        {'name': 'hideAlluvial', 'hider': hideAlluvial },
        {'name': 'hideRegionalNetMigration', 'hider': hideRegionalNetMigration },
        {'name': 'hidePopulation', 'hider': hideCTPopulation },
        {'name': 'hideMigration', 'hider': hideMigration },
        {'name': 'hideStateDomesticMigration', 'hider': hideStateDomesticMigration },
        {'name': 'hideDRS', 'hider': hideDRS},
        {'name': 'hideMigrationByAge', 'hider': hideMigrationByAge},
        {'name': 'hideAGIFlows', 'hider': hideAGIFlows}
    ];

    var hiderDispatch = function(toExclude) {
        var hidersToCall = hiderArray.filter(function(h) {
            return h.name != toExclude;
        });
        hidersToCall.forEach(function(h) {
            h.hider();
        });
    }
    function hideCanvaOne() {
        d3.select("#canva_one").style("opacity", 0);
    }

    function hideCTPopulation() {
        d3.select("#population_x_axis").style("opacity", 0);
        d3.select("#population_y_axis").style("opacity", 0);
        d3.select("#ct-population-line").style("stroke-width", 5).style("opacity", 0);
        d3.select(".annotation-population").style("display", "none");
        d3.select("#population-title").style("display", "none");
        d3.select("#population-source").style("display", "none");
    }


    function hideCanvaTwo() {
        d3.select("#canva_two").style("opacity", 0);
    }


    function hideBirths() {
        d3.select("#births_x_axis").style("opacity", 0);
        d3.select("#births_y_axis").style("opacity", 0);
        d3.select("#births-line").style("stroke-width", 5).style("opacity", 0);
        d3.select("#deaths-line").style("stroke-width", 5).style("opacity", 0);
        d3.select("#prerecession-shading").style("opacity", 0);
        d3.select("#postrecession-shading").style("opacity", 0);
        d3.select(".annotation-recession").style("display", "none");
        d3.select("#births-title").style("display", "none");
        d3.selectAll(".birthsLegend").style("display", "none");
        d3.select("#births-source").style("display", "none");
    }

    function hideMigration() {
        d3.select("#migration-ref-line").style("opacity", 0);
        d3.select("#migration_x_axis").style("opacity", 0);
        d3.select("#migration_y_axis").style("opacity", 0);
        d3.select("#domestic-line").style("opacity", 0);
        d3.select("#net-line").style("opacity", 0);
        d3.select("#international-line").style("opacity", 0);
        d3.select("#net-migration-title").style("display", "none");
        d3.select("#migration-prerecession-shading").style("opacity", 0);
        d3.select("#migration-postrecession-shading").style("opacity", 0);
        d3.selectAll(".migration-recession-annotation").style("display", "none");
        d3.selectAll(".netMigrationLegend").style("display", "none");
        d3.select("#migration-source").style("display", "none");
    }


    function hideAlluvial() {
        d3.selectAll(".d3-tip").style("display", "none");
        d3.selectAll(".left-node").transition(t).style("opacity", 0);
        d3.selectAll(".left-link").transition(t2).style("opacity", 0);
        d3.selectAll(".right-link").transition(t).style("opacity", 0);
        d3.selectAll(".right-node").transition(t).style("opacity", 0);
        d3.select("#sankey-title").style("display", "none");
        d3.select("#sankey-source").style("display", "none");
    }

    function hideCanvaThree() {
        d3.select("#canva_three").style("opacity", 0);
    }

    function hideCanvaFive() {
        d3.select("#canva_five").style("opacity", 0);
    }

    function hideRegionalNetMigration() {
        d3.select("#regional_net_x_axis").style("opacity", 0);
        d3.select("#regional_net_y_axis").style("opacity", 0);
        d3.select("#regional-net-ct").style("opacity", 0);
        d3.select("#regional-net-ne").style("opacity", 0);
        d3.select("#regional-net-neigh").style("opacity", 0);
        d3.select("#regional-net-migration-title").style("display", "none");
        d3.selectAll(".regionalMigrationLegend").style("display", "none");
        d3.select("#regional-source").style("display", "none");
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
        d3.selectAll(".stateMigrationLegend1").style("display", "none");
        d3.selectAll(".stateMigrationLegend2").style("display", "none");
        d3.select("#regional-state-source").style("display", "none");
    }

    function hideDRS() {
        d3.select("#drs_x_axis").style("opacity", 0);
        d3.select("#drs_y_axis").style("opacity", 0);
        d3.select("#drs15k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs50k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs100k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs200k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs500k").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs1m").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select("#drs5m").transition(t).style("opacity", 0).style("stroke-width", 1);
        d3.select(".drsLegend").transition(t).style("display", "none");
        d3.select("#drs-title").style("display", "none");
        d3.select("#migration-by-drs-source").style("display", "none");
    }

    function hideMigrationByAge() {
        d3.selectAll('.migration-by-age-bar').style('opacity', 0);
        d3.select('#migration_age_x_axis').style('opacity', 0);
        d3.select('#migration_age_y_axis').style('opacity', 0);
        d3.selectAll('.migration-by-age-net-circle').style('opacity', 0);
        d3.select('#migration-by-age-title').style('display', 'none');
        d3.select(".migrationByAgeLegend").transition(t).style("display", "none");
        d3.select("#migration-by-age-source").style("display", "none");
    }

    function hideAGIFlows() {
        d3.select('#agi_flows_x_axis').style('opacity', 0);
        d3.select('#agi_flows_y_axis').style('opacity', 0);
        d3.selectAll(".agi-flow-bar").style("opacity", 0);
        d3.selectAll('.agi-flow-circle').style('opacity', 0);
        d3.select('#agi-flows-title').style('display', 'none');
        d3.select(".agiFlowsLegend").transition(t).style("display", "none");
        d3.select("#migration-by-agi-source").style("display", "none");
    }

    // Dataloading Functions

    var rowConvert = function(row, mapping) {
        mapping.forEach(function (f) {
            row[f.final] = f.conversion(row[f.raw]);
        })
    };

    var dataLoader = function(rawData, key, mapping) {
        var filtered = rawData.filter(function(e) {
            return e.name == key;
        })[0].data;
        filtered.forEach(function(row) {
            rowConvert(row, mapping);
        });
        return filtered;
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
