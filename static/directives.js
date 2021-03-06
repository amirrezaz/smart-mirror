app.directive('weather', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        scope: {
            locations: '@',
        },
        templateUrl: '/static/weather.html',
        link: function (scope, element, attrs) {

            function update(location) {

                $http({
                    method : "GET",
                    url : "/weather/"+location
                }).then(function mySuccess(response) {
                    var data = response.data;
                    scope.location = location;
                    scope.temperature = data.current.temperature;
                    scope.feels_like = data.current.feels_like;
                    scope.icon = data.current.icon;
                    scope.summary = data.current.summary;
                    scope.wind_speed = data.current.wind_speed;
                    if (data.current.precip_type == 'rain')
                        scope.precip_icon = 'umbrella'
                    else
                        scope.precip_icon = 'snow-precip'

                    if (data.current.precip_prob > 0)
                        scope.precip_prob=data.current.precip_prob;

                    scope.daily = data.daily;
                    scope.hourly = data.hourly.slice(0,12);

                }, function myError(response) {
                    return
                });
            }

            scope.locations=scope.locations.split(',');
            scope.location_index = 0;
            scope.locations_length = scope.locations.length;

            update(scope.locations[scope.location_index])

            var interval = 15 * 60 * 1000 //15 min

            $interval(update, interval, 0, true, scope.locations[scope.location_index]);

            scope.next = function() {
                scope.location_index = scope.location_index + 1;
                if (scope.location_index >= scope.locations_length)
                    scope.location_index = 0;
                update(scope.locations[scope.location_index]);
            };

            scope.previous = function() {
                scope.location_index = scope.location_index - 1;
                if (scope.location_index == -1)
                    scope.location_index = scope.locations_length - 1;
                update(scope.locations[scope.location_index]);
            };

        }
    };
}]);

app.directive('calendars', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        scope: {
            type: '@',
            owner:'@'
        },
        templateUrl: '/static/calendar.html',

        link: function (scope, element, attrs) {

            function update() {

                var url = scope.type == 'google' ? '/calendar/google' : '/calendar/icloud';

                $http({
                    method : "GET",
                    url : url
                }).then(function mySuccess(response) {
                    if(typeof(response.data.error) == "undefined")
                        scope.days = response.data.days;
                    else
                        scope.error = scope.type + ' calendar: ' + response.data.error;
                }, function myError(response) {
                    scope.error = scope.type + ' calendar: ' + response.data.error;
                });
            }

            update();

            var interval = 10 * 60 * 1000 //15 min

            $interval(update, interval);

        }
    };
}]);

app.directive('news', ['$http','$interval',function ($http,$interval) {

    return {
        restrict: 'E', // element
        scope: {
          channels: '@'
        },
        templateUrl: '/static/news.html',

        link: function (scope, element, attrs) {

            scope.news_channels = scope.channels.split(',');

            scope.update = function(channel) {

                $http({
                    method : "GET",
                    url : '/news/'+ channel
                }).then(function mySuccess(response) {
                    scope.news = response.data.news;
                    scope.selected_channel=channel;
                }, function myError(response) {
                    scope.error = response.data.error;
                });
            }

            scope.selected_channel=scope.news_channels[0];
            scope.update(scope.news_channels[0]);

            var interval = 20 * 60 * 1000 //20 min

            $interval(scope.update, interval, 0, true, scope.news_channels[0] );

        }
    };
}]);


app.directive('quote', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        templateUrl: '/static/quote.html',

        link: function (scope, element, attrs) {

            scope.update = function() {

                $http({
                    method : "GET",
                    url : '/quote/'
                }).then(function mySuccess(response) {
                    scope.text = response.data.text;
                    scope.author = response.data.author;

                }, function myError(response) {
                    scope.error = response.data.error;
                });
            }

            scope.update();

            var interval = 60 * 60 * 1000 //60 min
            $interval(scope.update, interval);

        }
    };
}]);

app.directive('poem', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        templateUrl: '/static/poem.html',

        link: function (scope, element, attrs) {

            scope.update = function() {

                $http({
                    method : "GET",
                    url : '/poem/'
                }).then(function mySuccess(response) {
                    scope.poem = response.data.poem;
                    scope.author = response.data.author;

                }, function myError(response) {
                    scope.error = response.data.error;
                });
            }

            scope.update();

            var interval = 60 * 60 * 1000 //60 min
            $interval(scope.update, interval);

        }
    };
}]);


app.directive('covid19', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        scope: {
          country: '@'
        },
        templateUrl: '/static/covid19.html',

        link: function (scope, element, attrs) {

            scope.update = function() {

                $http({
                    method : "GET",
                    url : '/covid19/' + scope.country
                }).then(function mySuccess(response) {

                    scope.options = {
                        // scales: {
                        //   yAxes: [
                        //     {
                        //       id: 'y-axis-1',
                        //       type: 'linear',
                        //       display: true,
                        //       position: 'left'
                        //     },
                        //     {
                        //       id: 'y-axis-2',
                        //       type: 'linear',
                        //       display: true,
                        //       position: 'right'
                        //     }
                        //   ]
                        // }
                        elements: {
                            point: {
                                radius: 1,
                                hoverRadius: 1
                            }
                        },
                        responsive: true,
                      };


                    scope.labels = response.data.confirmed.labels;

                    scope.series = ['confirmed','deaths'];

                    scope.data = [response.data['confirmed']['values_diff'], response.data['deaths']['values_diff']];
                    scope.colors = ['#FFFFFF', '#D0CECE'];

                    scope.today_confirmed = response.data['confirmed']['values_diff'][response.data['confirmed']['values_diff'].length - 1];
                    scope.today_deaths = response.data['deaths']['values_diff'][response.data['deaths']['values_diff'].length - 1];

                    scope.total_confirmed = response.data['confirmed']['values'][response.data['confirmed']['values'].length - 1];
                    scope.total_deaths = response.data['deaths']['values'][response.data['deaths']['values'].length - 1];

                    var yesterday_confirmed = response.data['confirmed']['values_diff'][response.data['confirmed']['values_diff'].length - 2];
                    var yesterday_deaths = response.data['deaths']['values_diff'][response.data['deaths']['values_diff'].length - 2];

                    scope.diff_confirmed = Math.trunc((scope.today_confirmed / yesterday_confirmed)*100);
                    scope.diff_deaths = Math.trunc((scope.today_deaths / yesterday_deaths)*100);


                }, function myError(response) {
                    scope.error = response.data.error;
                })
            };


            scope.update();

            var interval = 10 * 60 * 1000; //20 min
            $interval(scope.update, interval);

        }
    };
}]);

app.directive('distance', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        scope: {
            origin: '@',
            destination: '@',
            destinationName: '@'
        },
        templateUrl: '/static/distance.html',

        link: function (scope, element, attrs) {

            scope.update = function() {

                $http({
                    method : "GET",
                    url : '/distance/'+ scope.origin + '/' + scope.destination
                }).then(function mySuccess(response) {
                    scope.duration = response.data.duration + ' to ' + scope.destinationName;

                }, function myError(response) {
                    scope.error = response.data.error;
                });
            }

            scope.update();

            var interval = 10 * 60 * 1000 //20 min
            $interval(scope.update, interval);

        }
    };
}]);

app.directive('clock', ['$http','$timeout',function ($http, $timeout) {

    return {
        restrict: 'E', // element
        scope: {
          channels: '@'
        },
        templateUrl: '/static/clock.html',

        link: function (scope, element, attrs) {

            scope.clock = "loading clock..."; // initialise the time variable
            scope.tickInterval = 1000 //ms

            var tick = function() {
                var today = new Date();
                var options = { weekday: 'short', month: 'long', day: 'numeric'};
                scope.date_english = today.toLocaleDateString("en-US", options);
                scope.date_persian = today.toLocaleDateString("fa-IR", options);
                scope.time_english = today.toLocaleTimeString("en-US",{hour:'2-digit',minute:'2-digit'})
                scope.time_persian = today.toLocaleTimeString("en-US",{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'})

                $timeout(tick, scope.tickInterval); // reset the timer
            }

            // Start the timer
            $timeout(tick, scope.tickInterval);
        }
    };
}]);

app.directive('capture', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        templateUrl: '/static/camera.html',

        link: function (scope, element, attrs) {

            scope.capture = function() {

                $http({
                    method : "GET",
                    url : '/capture/'
                }).then(function mySuccess(response) {
                    scope.image_name = response.data.image_name;
                    scope.show_image = true;

                }, function myError(response) {

                });
            };

            scope.upload_image = function() {
                scope.uploading = true;
                $http({
                    method : "GET",
                    url : '/upload/'+scope.image_name
                }).then(function mySuccess(response) {
                    scope.show_image = false;
                    scope.uploading = false;

                }, function myError(response) {
                    scope.uploading = false;

                });
            }
        }
    };
}]);

app.directive('record', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        templateUrl: '/static/record.html',

        link: function (scope, element, attrs) {

            scope.record = function() {

                $http({
                    method : "GET",
                    url : '/record/'
                }).then(function mySuccess(response) {
                    scope.video_name = response.data.video_name;
                    scope.show_video = true;

                }, function myError(response) {

                });
            }

            scope.upload_video = function() {
                scope.uploading = true;
                $http({
                    method : "GET",
                    url : '/upload_video/'+scope.video_name
                }).then(function mySuccess(response) {
                    scope.show_video = false;
                    scope.uploading = false;

                }, function myError(response) {
                    scope.uploading = false;

                });
            }


        }
    };
}]);

app.directive('power', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        templateUrl: '/static/power.html',

        link: function (scope, element, attrs) {

            scope.power = function($event, type) {

                $event.stopPropagation();

                $http({
                    method: "GET",
                    url: '/power/' + type
                }).then(function mySuccess(response) {

                }, function myError(response) {

                });


            }

        }
    };
}]);

app.directive('face', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        link: function (scope, element, attrs) {

            scope.update = function() {
                $http({
                    method: "GET",
                    url: '/face'
                }).then(function mySuccess(response) {
                    scope.$parent.$broadcast('face_id',response.data.id)

                }, function myError(response) {

                });
            }

            $interval(scope.update, 5000)

        }
    };
}]);

