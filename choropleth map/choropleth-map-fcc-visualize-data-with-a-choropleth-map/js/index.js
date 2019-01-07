var promisses = [d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'), d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json')];

Promise.all(promisses).then(function (d) {return processData(d);});

function processData(data) {
  for (var i = 0; i < data.length; i++) {
    console.log(JSON.stringify(data[i]));
  }

  var w = 1000;
  var h = 0.6 * w;
  var padding = 60;

  var svg = d3.select('#chart-bg').append('svg');

  svg.attr('width', w + 2 * padding).
  attr('height', h + 2 * padding).
  attr('id', 'map');

  //console.log(JSON.stringify(data[0]));
  //console.log(JSON.stringify(data[1]));

  var counties = topojson.feature(data[0], data[0].objects.counties);

  var path = d3.geoPath();

  var edu = data[1].map(function (obj) {return obj.bachelorsOrHigher;});

  var eduMax = d3.max(edu);
  var eduMin = d3.min(edu);
  var yu = 0;
  var xu = eduMin / 100;
  var legRange = [yu];
  var legDomain = [xu];

  for (var _i = 0; _i < 8; _i++) {
    yu += 35;
    legRange.push(yu);
    xu += (eduMax - eduMin) / 700;
    legDomain.push(xu);
  }

  console.log(JSON.stringify(legDomain) + ',' + JSON.stringify(legRange));

  var legScale = d3.scaleLinear().domain(legDomain).range(legRange);

  var ticks = [].concat(legDomain);
  ticks.pop();

  var legAxis = d3.axisBottom(legScale).tickValues(ticks);

  legAxis.tickFormat(d3.format(".1%"));

  svg.selectAll('path').
  data(counties.features).
  enter().
  append('path').
  attr('d', path).
  attrs(function (d, i) {
    var eduTarget = data[1].filter(function (obj) {return obj.fips === d.id;});
    //console.log(JSON.stringify(eduTarget));
    return { 'data-fips': eduTarget[0].fips,
      'data-education': eduTarget[0].bachelorsOrHigher, 'fill': pickColor(eduTarget[0].bachelorsOrHigher, eduMax, eduMin) };
  }).
  attr('class', 'county').
  attr('transform', 'translate(' + padding + ',' + padding + ')').
  on('mouseover', function (d) {
    var eduTarget = data[1].filter(function (obj) {return obj.fips === d.id;});
    //console.log(JSON.stringify(eduTarget));
    //console.log(JSON.stringify(d));
    d3.select('#tooltip').
    style('opacity', '0.9').
    style('top', d3.event.pageY + 'px').
    style('left', d3.event.pageX + 15 + 'px').
    attr('data-education', '' + eduTarget[0].bachelorsOrHigher);
    d3.select('#tip-info').text(eduTarget[0].area_name + ', ' + eduTarget[0].state + ': ' + eduTarget[0].bachelorsOrHigher + '%');
  }).
  on('mouseout', function (d) {
    d3.select('#tooltip').
    style('opacity', '0');
  });

  svg.append("path").
  datum(topojson.mesh(data[0], data[0].objects.states, function (a, b) {return a !== b;})).
  attr("class", "states").
  attr("d", path).
  attr('transform', 'translate(' + padding + ',' + padding + ')');

  var legend = svg.append('g').
  attrs(
  { 'id': 'legend',
    'width': '225px',
    'height': '60px' });


  var modifiedLegData = d3.schemeBlues[9];
  modifiedLegData.shift();

  legend.selectAll('rect').
  data(modifiedLegData).
  enter().
  append('rect').
  attrs(function (d, i) {
    console.log(d);
    return {
      'x': i * 35,
      'width': 35,
      'height': 35,
      'fill': '' + d };

  });

  legend.attr('transform', 'translate(620,50)');

  legend.append('g').
  call(legAxis).
  attr('transform', 'translate(0,35)');
}

function pickColor(eduValue, max, min) {
  //console.log(JSON.stringify(d3.schemeOranges[6]));
  var index = Math.floor((eduValue - min) / (max - min) * 8 + 1);
  return d3.schemeBlues[9][index];
}