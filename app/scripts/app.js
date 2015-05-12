'use strict';

angular.module('aib', [
    'ui.bootstrap',
    'aib.services',
    'aib.timeline',
    'aib.tourmapper',
    'underscore'
  ]);

angular.module('aib')
    .controller('TypeaheadCtrl', ['$scope', '$http', '$q', 'artistService', 'albumService',
 'echoNest', 'metaScoreService', 'mapFactory', 'artistGigography',
    function($scope, $http, $q, artistService, albumService, echoNest, metaScoreService, mapFactory, artistGigography) {
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
            $scope.selectedArtist = $model;
            // Get artist id mapping
            var artistProfiles = echoNest.getArtistProfile($scope.selectedArtist.id);
            var spotifyInfo = artistService.getArtist($scope.selectedArtist.id);

            $q.all([artistProfiles, spotifyInfo]).then(function(res){
                var profiles = res[0];
                var artistsInfo = res[1];

                //Info

                //Years of activity
                var start = profiles.artist.years_active[0].start;
                var end = profiles.artist.years_active[0].end ? 
                            profiles.artist.years_active[0].end : new Date().getFullYear();

                var popularity = albumService.getAlbums(artistsInfo.albumIds.join());
                var critics = metaScoreService.getAlbumScores($scope.selectedArtist.name);
            
                $q.all([popularity, critics]).then(function(results){
                    var albums = results[0];
                    albums.scores = _.object(_.map(results[1].data.scores,function(item){
                        return [item.album, item.score];
                    }));
                    $scope.timeline = {
                    	start: start,
                    	end: end,
                    	albums: albums.data.albums
                    };
                });

                // Map information
                var songkick = _.find(profiles.artist.foreign_ids, function(foreign_id){
                	return foreign_id.catalog === 'songkick';
                });
                artistGigography.get(songkick.foreign_id).then(function(d){
                	$scope.gigography = d;
                });
            });
        };
    }
]);
