// Fetch latest datasets published to or updated on CKAN

var buildTemplate = function(data) {
    var template = $('#datasetTemplate').html();
    var rendered = Mustache.render(template, data);
    $('#datasetTarget').html(rendered);
};

var extractMetadata = function(meta, base) {
    var extras = meta.extras;
    var shortDescription = _.find(extras, function(o) { return o.key === "Description"}).value;
    base.desc = shortDescription;
    return base;
};

// todo update url to be dynamic from site.ckan variable
var getMetadata = function(data, callback) {
    var dataWithMetadata = { datasets: [] };
    data.forEach(function(d, index) {
        $.ajax("http://data.ctdata.org/api/3/action/package_show?id="+ d.id).done(function(meta) {
            var metadata = extractMetadata(meta.result, d);
            var created = meta.result.resources[0].created;
            var last_modified = meta.result.resources[0].last_modified;
            var timestamp = moment(d.timestamp);
            var cutoff = 201600145;
            var check = last_modified ? moment(last_modified) : moment(created);
            var resource_updated = timestamp - check < cutoff ? true : false;
            if (resource_updated) {
                dataWithMetadata.datasets.push(metadata);
            } else {

            }
            if (index === (data.length-1)) {
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
        .value();

    // call getMetadata
    callback(uniqData, buildTemplate);
};

(function(){
    $.ajax("http://data.ctdata.org/api/3/action/recently_changed_packages_activity_list?limit=10").done(function(data) {
        var results = data.result;
        structureData(results, getMetadata);
    })
})();
