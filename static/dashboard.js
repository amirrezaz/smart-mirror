var app = angular.module("app",['chart.js']);


app.controller("BarCtrl", function ($scope, $http, $interval, $timeout) {

    $scope.show_yesterday_registrations = true;
    $scope.show_total_active_logged = true;
    $scope.show_yesterday_subscriptions = true;
    $scope.show_monthly_registrations = true;

    $scope.total_active_logged_target = 3000000;
    $scope.total_active_logged_target_formatted = numeral($scope.total_active_logged_target).format('0a');

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

    $http({
        method : "GET",
        url : "/total_active_loggeds"
    }).then(function mySuccess(response) {
        $scope.show_total_active_logged = false;
        $scope.total_active_logged = response.data.total_active_logged;
        $scope.total_active_logged_formatted = numeral($scope.total_active_logged).format('0.00a');
        $scope.total_active_logged_percentage = Math.trunc(100 * $scope.total_active_logged / $scope.total_active_logged_target);


    }, function myError(response) {
        $scope.total_active_logged = 0
    });

    $http({
        method : "GET",
        url : "/seven_days_registrationss"
    }).then(function mySuccess(response) {

        $scope.show_yesterday_registrations = false;
        $scope.yesterday_registrations = numeral(response.data.seven_days_registrations[6].count).format('0,0');

        $scope.registrations_date_range = response.data.date_range;
        $scope.seven_days_registrations_data = [[]];
        response.data.seven_days_registrations.forEach(function(element, index) {
            $scope.seven_days_registrations_data[0].push(element.count);
        });

    }, function myError(response) {
        $scope.yesterday_registrations = 0
    });


    $http({
        method : "GET",
        url : "/seven_days_subscriptionss"
    }).then(function mySuccess(response) {

        $scope.show_yesterday_subscriptions = false;
        $scope.yesterday_subscriptions = numeral(response.data.seven_days_subscriptions[6].count).format('0,0');

        $scope.subscriptions_date_range = response.data.date_range;
        $scope.seven_days_subscriptions_data = [[]];
        response.data.seven_days_subscriptions.forEach(function(element, index) {
            $scope.seven_days_subscriptions_data[0].push(element.count);
        });

    }, function myError(response) {
        $scope.yesterday_subscriptions = 0
    });


    $http({
        method : "GET",
        url : "/monthly_registrations"
    }).then(function mySuccess(response) {

        $scope.show_monthly_registrations = false;
        $scope.monthly_registrations = response.data.monthly_registrations;

        $scope.monthly_registrations_data = response.data.monthly_registrations;

    }, function myError(response) {
        $scope.monthly_registrations = []
    });

})


 app.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
});
