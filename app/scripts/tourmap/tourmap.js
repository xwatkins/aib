'use strict';

angular.module('aib.tourmapper', [
    'd3'
]);

angular.module('aib.tourmapper')
  .factory('mapFactory', ['$http', function($http) {
    return {
      getMapData: function() {
        return $http.get('scripts/tourmap/uk.json')
          .success(function(uk){
            return uk;
          });
      }
    };
  }]);

  angular.module('aib.tourmapper')
  .directive('map', ['d3Service', 'mapFactory',
    function(d3Service, mapFactory) {
    return {
      template: '<div id="tourmap-container"></div>',
      restrict: 'A',
      link: function(scope) {
        d3Service.d3().then(function(d3) {

          scope.$watch('gigography', function(events) {
            if(events) {
              clearVisualisation();
              drawVisualisation(events);
            }
          });

          var clearVisualisation = function() {
            d3.select('#tourmap-graph').remove();
          };

          var drawVisualisation = function(events) {
            var width = 660,
                height = 860;

            var radius = d3.scale.sqrt()
                .domain([0, 1e6])
                .range([0, 15]);

            var svg = d3.select('#tourmap-container').append('svg')
                .attr('id', 'tourmap-graph')
                .attr('width', width)
                .attr('height', height);

            mapFactory.getMapData().then(function(data){
              var uk = data.data;

              var projection = d3.geo.albers()
                  .center([0, 55.4])
                  .rotate([4.4, 0])
                  .parallels([50, 60])
                  .scale(4000)
                  .translate([width / 2, height / 2]);

              var path = d3.geo.path()
                  .projection(projection)
                  .pointRadius(2);

              svg.selectAll('.subunit')
                  .data(topojson.feature(uk, uk.objects.subunits).features)
                  .enter().append('path')
                  .attr('class', function(d) { return 'subunit ' + d.id; })
                  .attr('d', path);

              svg.append('path')
                  .datum(topojson.feature(uk, uk.objects.places))
                  .attr('d', path)
                  .attr('class', 'place');

              svg.selectAll('.place-label')
                  .data(topojson.feature(uk, uk.objects.places).features)
                  .enter().append('text')
                  .attr('class', 'place-label')
                  .attr('transform', function(d) { return 'translate(' + projection(d.geometry.coordinates) + ')'; })
                  .attr('dy', '.35em')
                  .text(function(d) { return d.properties.name; });

              svg.selectAll('.place-label')
                  .attr('x', function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
                  .style('text-anchor', function(d) { return d.geometry.coordinates[0] > -1 ? 'start' : 'end'; });


                svg.selectAll('.event-location')
                  .data(eventsToTopoJSON(events))
                    .enter()
                  .append('path')
                    .attr('d', path.pointRadius(6))
                    .attr('class','event-location');

                svg.selectAll('.event-number')
                  .data(eventsToTopoJSON(events))
                    .enter()
                  .append('path')
                    .attr('d', path.pointRadius(
                      10
                      //function(d) {return Math.round(radius(d.features.popularity*10000000));}
                      )
                    )
                    .attr('class','event-location');
            });
          };
        });
      }
    };
  }]);

var eventsToTopoJSON = function(events) {
  var topo = [];
  events.forEach(function(el) {
    topo.push({
      type:'Feature',
      id:el.id,
      geometry: {
        type:'Point',
        coordinates:[
          el.location.lng,
          el.location.lat
        ]
      }, features: {
        popularity:el.popularity
      }

    });
  });
  return topo;
};
