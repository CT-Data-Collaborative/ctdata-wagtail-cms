// Fetch latest datasets published to or updated on CKAN

var buildTemplate = function(data) {
    var template = $('#datasetTemplate').html();
    var rendered = Mustache.render(template, data);
    $('#datasetTarget').html(rendered);
};

var extractMetadata = function(meta, base) {
    var extras = meta.extras;
    var resources = meta.resources;
    var shortDescription = _.find(extras, function(o) { return o.key === "Description"}).value;;
    base.desc = shortDescription;
    return base;
};

// todo update url to be dynamic from site.ckan variable
var getMetadata = function(data, callback) {
    var dataWithMetadata = { datasets: [] };
    data.forEach(function(d) {
        $.ajax("http://data.ctdata.org/api/3/action/package_show?id="+ d.id).done(function(meta) {
            var metadata = extractMetadata(meta.result, d);
            dataWithMetadata.datasets.push(metadata);
            if (dataWithMetadata.datasets.length === data.length) {
                console.log(dataWithMetadata.datasets.length);
                // call buildTemplate
                callback(dataWithMetadata);
            }
        });
    });
};

var structureData = function(data, callback) {
    var recentlyUpdated = [];
    var options = {year: "numeric", month: "long",day: "numeric"};
    data.forEach(function(d) {
        dateObj = new Date(d.timestamp);
        var dataset = {
            'name': d.data.package.title,
            'id': d.data.package.name,
            'url': 'http://data.ctdata.org/visualization/' + d.data.package.name,
            'timestamp': d.timestamp,
            'date': dateObj.toLocaleDateString('en', options)
        };
        recentlyUpdated.push(dataset);
    });

    // call getMetadata
    var uniqData = _.chain(recentlyUpdated)
        .uniqBy(function(d) { return d.name; })
        .slice(0,3)
        .value();

    callback(uniqData, buildTemplate);
};

(function(){
    $.ajax("http://data.ctdata.org/api/3/action/recently_changed_packages_activity_list?limit=10").done(function(data) {
        var results = data.result;
        structureData(results, getMetadata);
    })
})();
