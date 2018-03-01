
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
          progress = Math.min(currentValue, maxValue) / maxValue * progressBarWidth;
        }

        // set the marker's width
        progressBarMarkerElement.css('width', progress + 'px');
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
      height: '=',
      data: '='
    },
    templateUrl: '/static/barchart.html',

    link: function (scope, element, attrs) {

        scope.bar_chart_container_style = {
          'margin-top': '10px',
          'width': '100%',
          'height': '100%',
          'display': 'flex'
        };

        scope.y_axis_style = {
          'height': 'calc(100% - 62px)',//scope.height + 50 + 'px',
          'width': '4px',
          'background-color': '#0C364A',
          'border-bottom': '5px solid white'
        };

        scope.x_axis_style = {
          'width': '100%',
          'border-top': '5px solid white',
          'display': 'flex',
          'color': 'white',
          'padding': '15px 15px 0px 15px',
          'box-sizing': 'border-box',
        };

        scope.x_axis_top_style = {
          'width': '100%',
          'height': '50px',
          'display': 'flex',
          'justify-content': 'center',
          'color': 'white',
          'padding': '0 15px 0 15px',
          'box-sizing': 'border-box',
          'background-color': 'rgba(12, 54, 74, 0.2)'
        };

        scope.label_style = {
          'flex': '1',
          'display': 'flex',
          'justify-content': 'center',
          'font-size': '20px',
          'text-align': 'center'
        };

        scope.number_label_style = {
          'flex': '1',
          'height': '100%',
          'display': 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          'margin': '0 15px 0 15px',
          'background-color': 'red',
          'background-color': '#011B2B',
          'font-size': '20px'
        };

        scope.bars_container_style = {
          'justify-content': 'space-around',
          'height':  '100%',//scope.height + 'px',
          'display': 'flex',
          'align-items': 'flex-end',
          'padding-left': '30px',
          'padding-right': '30px',
          'background-image': "repeating-linear-gradient(" +
          "transparent," +
          "transparent "+ scope.height / 10 +"px," +
          "rgba(12, 54, 74, 0.2) "+ scope.height / 10 +"px," +
          "rgba(12, 54, 74, 0.2) "+ scope.height / 5 +"px)"
        };

        const bar_container_style = {
          'height': '100%',
          'background-color': 'rgba(2, 48, 76, 0.52)',
          'display': 'flex',
          'flex-direction': 'column',
          'margin-right': '30px'
        };

        const bar_style = {
          'margin-top': 'auto',
          'border-top': '4px solid white',
          'width': '4vw',
          'background-color': '#02C3AA',
          'transition': 'all 1s ease-in-out',
          'z-index': '1'
        };

        scope.x_container_style = {
            'display': 'flex',
            'flex-direction': 'column',
            'width': '100%'
        }


        function update() {

            if (typeof scope.data == 'undefined')
                return

            var max = Math.max.apply(Math,scope.data.map(function(o){return o.count;}))

            var bars = [];

            scope.data.forEach(function(element, index) {
                var new_bar_style = Object.assign({}, bar_style);
                var new_bar_container_style = Object.assign({}, bar_container_style);

                new_bar_style['height'] = 100 * (element.count / max)+'%';

                if (index == scope.data.length - 1)
                    new_bar_container_style['margin-right']='0px';

                bars.push({
                    'style': new_bar_style,
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