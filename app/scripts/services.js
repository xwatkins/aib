'use strict';

/*global _:false */
angular.module('aib.services', ['underscore']);

var songkickID = 'zNsbeO3A1boYdJjN';
var echonestID = 'ZIIXBXAKFJWAUX2SN';

angular.module('aib.services').factory('artistService', ['$http', function($http) {
    return {
        getArtist: function(artistId) {
            return $http.get('https://api.spotify.com/v1/artists/' + artistId).then(function(artist) {
                return artist;
            });
        },
        getArtistAlbums: function(artistId) {
            return $http.get('https://api.spotify.com/v1/artists/' + artistId + '/albums', {
                params: {
                    album_type: 'album',
                    country: 'GB'
                }
            }).then(function(artist) {
                artist.albumIds = _.pluck(artist.data.items, 'id');
                return artist;
            });
        }
    };
}]);

angular.module('aib.services').factory('albumService', function($http) {
    return {
        getAlbums: function(albumIds) {
            return $http.get('https://api.spotify.com/v1/albums?', {
                params: {
                    ids: albumIds
                }
            }).then(function(albums) {
                return albums;
            });
        }
    };
});

angular.module('aib.services').factory('artistGigography', function($http, $q) {
    return {
        get: function(mbid, page) {
            mbid = mbid.replace('songkick:artist:','');
            return $http.jsonp('http://api.songkick.com/api/3.0/artists/' + mbid + '/gigography.json', {
                params: {
                    apikey: songkickID,
                    page: page,
                    jsoncallback: 'JSON_CALLBACK'
                }
            }).then(function(res) {
                // Get total number of pages
                var pages = Math.floor(res.data.resultsPage.totalEntries/res.data.resultsPage.perPage);
                var promises = [];
                for(var i=1;i<=pages;i++) {
                    promises.push(
                    $http.jsonp('http://api.songkick.com/api/3.0/artists/' + mbid + '/gigography.json', {
                        params: {
                            apikey: songkickID,
                            page: i,
                            jsoncallback: 'JSON_CALLBACK'
                        }
                    }));
                }
                return $q.all(promises).then(function(results){
                   return _.chain(results)
                        .map(function(d){
                            return d.data.resultsPage.results.event;
                        })
                        .flatten().value();
                });
            });
        }
    };
});

angular.module('aib.services').factory('echoNest', ['$http',function($http) {
    return {
        getArtistProfile: function(spotifyId) {
            return $http.jsonp('http://developer.echonest.com/api/v4/artist/profile?bucket=years_active&', {
                params: {
                    api_key: echonestID,
                    format: 'jsonp',
                    id: 'spotify:artist:' + spotifyId,
                    bucket: 'id:songkick',
                    callback:'JSON_CALLBACK'
                }
            }).then(function(resp) {
                return resp.data.response;
            });
        }
    };
}]);

angular.module('aib.services').factory('metaScoreService', function($http) {
    return {
        getAlbumScores: function(artistName) {
            artistName = artistName.replace(' ','-');
            return $http.get('http://nodejs-xwatkins.rhcloud.com/score/' + artistName).success(function(result) {
                return result;
            }).error(function(data) {
                console.log(data);
            });
        }
    };
});
