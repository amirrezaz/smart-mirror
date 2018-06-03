app.directive('weather', ['$http',function ($http) {

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
            update(scope.locations[scope.location_index]);

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

app.directive('calendars', ['$http',function ($http) {

    return {
        restrict: 'E', // element
        scope: {
            type: '@',
            owner:'@'
        },
        templateUrl: '/static/calendar.html',

        link: function (scope, element, attrs) {

            scope.$on('face_id',function(event,args){
                scope.show_calendar = scope.owner == args;
            });


            function update() {

                var url = scope.type == 'google' ? '/calendar/google' : '/calendar/icloud';

                $http({
                    method : "GET",
                    url : url
                }).then(function mySuccess(response) {
                    scope.days = response.data.days;
                    if (scope.days) {
                        scope.day = response.data.days[0];
                    }
                }, function myError(response) {
                    scope.error = response.data.error;
                });
            }

            update();
        }
    };
}]);

app.directive('news', ['$http',function ($http) {

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
                    url : '/news/'+channel
                }).then(function mySuccess(response) {
                    scope.news = response.data.news;
                }, function myError(response) {
                    scope.error = response.data.error;
                });
            }

            scope.update(scope.news_channels[0]);
        }
    };
}]);


app.directive('quote', ['$http',function ($http) {

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
        }
    };
}]);

app.directive('distance', ['$http','$timeout',function ($http, $timeout) {

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
                    scope.duration = response.data.duration + 'to ' + scope.destinationName;

                }, function myError(response) {
                    scope.error = response.data.error;
                });
            }

            scope.update();
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

app.directive('camera', ['$http','$interval',function ($http, $interval) {

    return {
        restrict: 'E', // element
        templateUrl: '/static/camera.html',

        link: function (scope, element, attrs) {

            scope.max_count = 5;

            scope.count_down = function() {
                scope.count = scope.count - 1;
                if (scope.count == 0) {
                    scope.count = ''
                    $http({
                        method : "GET",
                        url : '/capture/'
                    }).then(function mySuccess(response) {

                    }, function myError(response) {

                    });
                }
            }

            scope.capture = function() {

                scope.count = scope.max_count;

                $interval(scope.count_down, 1000, scope.max_count);

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

app.directive('progressBar', [function () {

  return {
    restrict: 'E', // element
    scope: {
      curVal: '=', // bound to 'cur-val' attribute, playback progress
      maxVal: '='  // bound to 'max-val' attribute, track duration
    },
    template: '<div class="progress-bar"><div class="progress-bar-bar"></div></div>',

    link: function (scope, element, attrs) {
      // grab element references outside the update handler
      var progressBarBkgdElement = angular.element(element[0].querySelector('.progress-bar')),
          progressBarMarkerElement = angular.element(element[0].querySelector('.progress-bar-bar'));

      // set the progress-bar-marker width when called
      function updateProgress() {
        var progress = 0,
            currentValue = scope.curVal,
            maxValue = scope.maxVal,
            // recompute overall progress bar width inside the handler to adapt to viewport changes
            progressBarWidth = progressBarBkgdElement.prop('clientWidth');

        if (scope.maxVal) {
          // determine the current progress marker's width in pixels
          progress = Math.min(currentValue, maxValue) * 100 / maxValue;
        }

        // set the marker's width
        progressBarMarkerElement.css('width', progress + '%');
      }

      // curVal changes constantly, maxVal only when a new track is loaded
      scope.$watch('curVal', updateProgress);
      scope.$watch('maxVal', updateProgress);
    }
  };


}])

app.directive('barchart', [function () {

  return {
    restrict: 'E', // element
    replace: true,
    scope: {
      data: '='
    },
    templateUrl: '/static/barchart.html',

    link: function (scope, element, attrs) {

        const bar_container_style = {
          'background-color': 'rgba(4, 111, 178, 0.3)',
          'display': 'grid'
        };

        function update() {

            if (typeof scope.data == 'undefined')
                return

            var max = Math.max.apply(Math,scope.data.map(function(o){return o.count;}))

            var bars = [];

            scope.data.forEach(function(element, index) {
                var new_bar_container_style = Object.assign({}, bar_container_style);

                new_bar_container_style['grid-template-rows'] = (max - element.count) + 'fr' + ' ' + element.count +'fr';

                bars.push({
                    'container_style': new_bar_container_style,
                    'label_month': element.date.month,
                    'label_year': element.date.year,
                    'value': numeral(element.count).format('0,0')
                });
            });

            scope.bars = bars;
        }

        scope.$watch('data', update);

    }
  };



 }])