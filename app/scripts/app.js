'use strict';

angular.module('aib', [
    'ui.bootstrap',
    'ngRoute',
    'aib.services',
    'aib.timeline',
    'aib.tourmapper',
    'underscore'
]);


angular
    .module('aib').config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/dashboard/0wz0jO9anccPzH04N7FLBH' //default to LOW
            }).when('/dashboard/:artistId', {
                templateUrl: 'views/dashboard.html',
                controller: 'AIBController'
            })
            .otherwise({
                redirectTo: '/'
            });
    });

angular.module('aib')
    .controller('TypeaheadCtrl', ['$scope', '$http', '$q', '$location',
        function($scope, $http, $q, $location) {
            $scope.getArtists = function(val) {
                return $http.get('https://api.spotify.com/v1/search?', {
                    params: {
                        q: '*' + val + '*',
                        type: 'artist'
                    }
                }).then(function(res) {
                    return res.data.artists.items;
                });
            };
            $scope.onSelect = function($model) {
                $location.path('dashboard/' + $model.id);
            };
        }
    ]);

angular.module('aib').controller('AIBController', ['$scope', '$http', '$q', '$routeParams', 'artistService', 'albumService',
    'echoNest', 'metaScoreService', 'mapFactory', 'artistGigography',
    function($scope, $http, $q, $routeParams, artistService, albumService, echoNest, metaScoreService, mapFactory, artistGigography) {
        $scope.loadingTimeline = true;
        $scope.loadingHistory = true;

        $scope.artistId = $routeParams.artistId;

        // Get artist id mapping
        var artistInfo = artistService.getArtist($scope.artistId);
        var spotifyInfo = artistService.getArtistAlbums($scope.artistId);
        var artistProfiles = echoNest.getArtistProfile($scope.artistId);

        $q.all([artistInfo, artistProfiles, spotifyInfo]).then(function(res) {
            var artistInfo = res[0];
            var profiles = res[1];
            var artistsInfo = res[2];

            //Info

            //Years of activity
            var start = profiles.artist.years_active[0].start;
            var end = profiles.artist.years_active[0].end ?
                profiles.artist.years_active[0].end : new Date().getFullYear();

            var popularity = albumService.getAlbums(artistsInfo.albumIds.join());
            var critics = metaScoreService.getAlbumScores(profiles.artist.name);

            $scope.loadingTimeline = false;

            $q.all([popularity, critics]).then(function(results) {
                var albums = results[0];
                albums.scores = _.object(_.map(results[1].data.scores, function(item) {
                    return [item.album, item.score];
                }));
                $scope.timeline = {
                    start: start,
                    end: end,
                    albums: albums.data.albums
                };
            });

            // Map information
            var songkick = _.find(profiles.artist.foreign_ids, function(foreign_id) {
                return foreign_id.catalog === 'songkick';
            });
            artistGigography.get(songkick.foreign_id).then(function(d) {
                $scope.gigography = d;
            });
            $scope.loadingHistory = false;
            $scope.selectedArtist  = artistInfo.data;
        });
    }
])