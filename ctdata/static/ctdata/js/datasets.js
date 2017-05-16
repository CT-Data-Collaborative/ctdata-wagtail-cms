// Fetch latest datasets published to or updated on CKAN

var buildTemplate = function(data) {
    var template = $('#datasetTemplate').html();
    var rendered = Mustache.render(template, {datasets: data});
    $('#datasetTarget').html(rendered);
};

var fetchMetadata = function(dataset) {
    var metadataGetter = {
        retrieve: function() {
            return $.ajax("http://data.ctdata.org/api/3/action/package_show?id="+ dataset.id).then(function(d) {
                return d.result;
            });
        },
        process: function() {
            return this.retrieve().then(function(d) {
                dataset['desc'] = _.find(d.extras, function(o) { return o.key === "Description"}).value;
                return dataset;
            });
        }
    };
    return metadataGetter;
};

var getMetadata = function(data) {
    return data.map(function (d) {
        return fetchMetadata(d).process();
    });
};

function restructureData(data) {
    var options = {year: "numeric", month: "long",day: "numeric"};
    return data.map(function(d) {
        dateObj = new Date(d.timestamp);
        return {
            'name': d.data.package.title,
            'id': d.data.package.name,
            'url': 'http://data.ctdata.org/visualization/' + d.data.package.name,
            'timestamp': d.timestamp,
            'date': dateObj.toLocaleDateString('en', options)
        };
    })
};


(function(){
    var recentDatasets = {
        json: function() {
            return $.getJSON("http://data.ctdata.org/api/3/action/recently_changed_packages_activity_list?limit=50").then(function(data) {
                return data;
            });
        },
        filtered: function() {
            return this.json().then(function(data) {
                return data.result.filter(function(d) { return d.activity_type != 'deleted package' });
            });
        },
        structured: function() {
            return this.filtered().then(function(filtered) {
                return _.chain(restructureData(filtered)).uniqBy(function(d) { return d.name; }).sortBy(-'date').value();
            });
        },
        metadata: function() {
            return this.structured().then(function(structured) {
                return getMetadata(structured.slice(0,3));
            });
        },
        publish: function() {
            this.metadata().then(function(metadata) {
                console.log(metadata);
                $.when(metadata[0], metadata[1], metadata[2]).done(function(a,b,c) {
                    buildTemplate([a,b,c])
                })
            });
        }
    };
    recentDatasets.publish();
})();
