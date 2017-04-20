function initialize() {
  console.log("initialized");
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
          if (i === index) {
            console.log(d3.select(this).select('div[data-graphic-id]').attr('data-graphic-id'));
          }
        });

  });
}

initialize();
