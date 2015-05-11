'use strict';

angular.module('aib.timeline', [
    'd3'
  ]);


angular.module('aib.timeline')
  .directive('timelineviz', ['$q','d3Service',
    function($q, d3Service) {
        return {
            restrict: 'E',
            template: '<div id="vis-container"></div>',
            link: function(scope) {
                d3Service.d3().then(function(d3) {

                    scope.$watch('timeline', function(timeline){
                        if(timeline) {
                            clearVisualisation();
                            drawVisualisation(timeline.start, timeline.end, timeline.albums);
                        }
                    });

                    var drawVisualisation = function(start, end, albums) {
                        var width = 670,
                            height = 400,
                            color = d3.scale.category20b();

                        var PADDING = 50;

                        var svg = d3.select('#vis-container')
                            .append('svg')
                            .attr('id','timeline-graph')
                            .attr('width', width)
                            .attr('height', height);

                        var xScale = d3.scale.linear()
                            .domain([start,end])
                            .range([PADDING, width - PADDING * 2]);

                        var yPopScale = d3.scale.linear()
                            .domain([d3.min(albums, function(d) {
                                return d.popularity;
                            }), d3.max(albums, function(d) {
                                return d.popularity;
                            })])
                            .range([height - PADDING, PADDING]);


                        var rScale = d3.scale.linear()
                            .domain([d3.min(albums, function(d) {
                                return d.popularity;
                            }), d3.max(albums, function(d) {
                                return d.popularity;
                            })])
                            .range([10, 50]);

                        var opacityScale = d3.scale.linear()
                            .domain([d3.min(albums, function(d) {
                                return d.popularity;
                            }), d3.max(albums, function(d) {
                                return d.popularity;
                            })])
                            .range([0.9, 0.35]);

                        var albumGroup = svg.selectAll('g')
                            .data(albums)
                            .enter()
                            .append('g')
                            .on('mouseenter', function() {
                                d3.select(this)
                                    .select('text')
                                    .transition()
                                    .duration(100)
                                    .style({
                                        // opacity: '1'
                                    });
                            })
                            .on('mouseleave', function() { //Should add something to pin a name to a node
                                d3.select(this)
                                    .select('text')
                                    .transition()
                                    .duration(500)
                                    .style({
                                        // opacity: '0'
                                    });
                            })
                        ;


                        albumGroup.append('circle')
                            .attr('fill', function(d) {
                                return color(d.name);
                            })
                            .attr('fill-opacity', function(d) {
                                return opacityScale(d.popularity);
                            })
                            .attr('cx', function(d) {
                                return xScale(new Date(d.release_date).getFullYear());
                            })
                            .attr('cy', height)
                            .transition()
                            .duration(1000)
                            .attr('cy', function(d) {
                                return yPopScale(d.popularity);
                            })
                            .attr('r', 10)
                            .transition()
                            .duration(500)
                            .attr('r', function(d) {
                                return rScale(d.popularity);
                            });


                        albumGroup
                            .append('text')
                            .text(function(d) {
                                return d.name;
                            })
                            .attr('x', function(d) {
                                return xScale(new Date(d.release_date).getFullYear());
                            })
                            .attr('y', height)
                            .transition()
                            .duration(1500)
                            .attr('y', function(d) {
                                return yPopScale(d.popularity);
                            })
                            .attr('text-anchor', 'middle')
                            .attr('font-family', 'sans-serif')
                            .attr('font-size', '11px')
                            .attr('fill', 'black');
                            // .attr('opacity', '0');

                        // create axes
                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient('bottom')
                            .ticks(5)
                            .tickFormat(d3.format('<'));

                        svg.append('g')
                            .attr('class', 'axis x-axis')
                            .attr('transform', 'translate(0,' + (height - PADDING) + ')')
                            .call(xAxis);

                        var yAxis = d3.svg.axis()
                            .orient('left')
                            .scale(yPopScale);

                        svg.append('g')
                            .attr('class','axis y-axis')
                            .attr('transform', 'translate(' + PADDING + ',0)')
                            .call(yAxis);
                    };

                    var clearVisualisation = function() {
                        d3.select('#timeline-graph').remove();
                    };
                });
            }
        };
    }
]);



