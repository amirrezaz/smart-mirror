var app = angular.module("app",['chart.js']);


app.controller("BarCtrl", function ($scope, $http, $interval, $timeout) {

    $scope.total_active_logged_target = 3000000;
    $scope.total_active_logged_target_formatted = numeral($scope.total_active_logged_target).format('0a');

    var total_active_logged_refresh_time = {
        hour: 8,
        minute: 30,
        second: 0
    }

    var seven_days_registrations_refresh_time = {
        hour: 8,
        minute: 30,
        second: 0
    }

    var seven_days_subscriptions_refresh_time = {
        hour: 8,
        minute: 30,
        second: 0
    }

    var monthly_registrations_refresh_time = {
        hour: 8,
        minute: 30,
        second: 0
    }

    var min_subscriptions = 15;

    $scope.chart_line_labels=["1", "2", "3", "4", "5", "6", "7"];
    $scope.chart_line_options = {
        scales: {
            xAxes: [{
                display: false,
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                display: false,
                gridLines: {
                    display: false
                }
            }]
        },
        responsive: true,
        maintainAspectRatio: false
    }
    $scope.chart_line_colors = [{'pointBackgroundColor': "#fff",'backgroundColor': "#0A3E5D"}];

    function total_active_logged() {
        $scope.show_total_active_logged_spinner = true;
        $scope.show_total_active_logged_error = false;
        $http({
            method : "GET",
            url : "/total_active_logged"
        }).then(function mySuccess(response) {
            $scope.show_total_active_logged_spinner = false;
            $scope.total_active_logged = response.data.total_active_logged;
            $scope.total_active_logged_formatted = numeral($scope.total_active_logged).format('0.00a');
            $scope.total_active_logged_percentage = Math.trunc(100 * $scope.total_active_logged / $scope.total_active_logged_target);


        }, function myError(response) {
            $scope.total_active_logged = 0;
            $scope.total_active_logged_formatted = '0';
            $scope.total_active_logged_percentage = 0;
            $scope.show_total_active_logged_spinner = false;
            $scope.show_total_active_logged_error = true;
        });
    }

    function seven_days_registrations() {
        $scope.show_yesterday_registrations_spinner = true;
        $http({
            method : "GET",
            url : "/seven_days_registrations"
        }).then(function mySuccess(response) {

            $scope.show_yesterday_registrations_spinner = false;
            $scope.yesterday_registrations = numeral(response.data.seven_days_registrations[6].count).format('0,0');

            $scope.registrations_date_range = response.data.date_range;
            $scope.seven_days_registrations_data = [[]];
            response.data.seven_days_registrations.forEach(function(element, index) {
                $scope.seven_days_registrations_data[0].push(element.count);
            });

        }, function myError(response) {
            $scope.yesterday_registrations = 0;
            $scope.seven_days_registrations_data = [[]];
            $scope.show_yesterday_registrations_spinner = false;
        });
    }

    function seven_days_subscriptions() {
        $scope.show_yesterday_subscriptions_spinner = true;
        $scope.show_seven_days_subscriptions_box = true;

        $http({
            method : "GET",
            url : "/seven_days_subscriptions"
        }).then(function mySuccess(response) {

            $scope.show_yesterday_subscriptions_spinner = false;
            if (response.data.seven_days_subscriptions[6].count < min_subscriptions) {
                $scope.show_seven_days_subscriptions_box = false;
            }
            $scope.yesterday_subscriptions = numeral(response.data.seven_days_subscriptions[6].count).format('0,0');
            $scope.subscriptions_date_range = response.data.date_range;
            $scope.seven_days_subscriptions_data = [[]];
            response.data.seven_days_subscriptions.forEach(function(element, index) {
                $scope.seven_days_subscriptions_data[0].push(element.count);
            });

        }, function myError(response) {
            $scope.yesterday_subscriptions = 0;
            $scope.seven_days_subscriptions_data = [[]];
            $scope.show_yesterday_subscriptions_spinner = false;
            $scope.show_seven_days_subscriptions_box = false;
        });
    }

    function monthly_registrations() {
        $scope.show_monthly_registrations_spinner = true;

        $http({
            method : "GET",
            url : "/monthly_registrations"
        }).then(function mySuccess(response) {

            $scope.show_monthly_registrations_spinner = false;
            $scope.monthly_registrations = response.data.monthly_registrations;

            $scope.monthly_registrations_data = response.data.monthly_registrations;

        }, function myError(response) {
            $scope.monthly_registrations_data = [];
            $scope.show_monthly_registrations_spinner = false;
        });
    }

    function schedule_job(job, schedule_time) {
        $scope.today = today_format();
        job();
        var now = new Date();
        console.log(job.name + ' at ' + now);
        var diff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), schedule_time.hour, schedule_time.minute, schedule_time.second, 0) - now;

        if (diff < 0) {
            var msec_24hrs = 24*60*60*1000
             diff += msec_24hrs; // it's after 10am, try 10am tomorrow.
        }

        $timeout(function() {schedule_job(job, schedule_time)}, diff);
    }

    function today_format() {
        var now = new Date();
        var day = now.getDate();
        var suffix;
        if (day  >= 11 && day <= 13)
         suffix = 'th';
        else {
          suffix = {1: 'st', 2: 'nd', 3: 'rd'}[day % 10];
          if (typeof(suffix) == "undefined")
            suffix = 'th';
        }
        var day_name = now.toLocaleDateString('en-us', { weekday: 'long' });
        return day_name + ' ' + day + suffix;
    }

    schedule_job(total_active_logged, total_active_logged_refresh_time);
    schedule_job(seven_days_registrations, seven_days_registrations_refresh_time);
    schedule_job(seven_days_subscriptions, seven_days_subscriptions_refresh_time);
    schedule_job(monthly_registrations, monthly_registrations_refresh_time);

})


 app.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
});
