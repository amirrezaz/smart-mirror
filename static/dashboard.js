angular.module("app",["ui.bootstrap", 'googlechart', 'countTo','chart.js']).controller("BarCtrl", function ($scope, $http, $interval) {

    $scope.show_yesterday_registrations = true;
    $scope.show_total_active_logged = true;
    $scope.show_chart = true;

    $http({
        method : "GET",
        url : "/total_active_logged"
    }).then(function mySuccess(response) {
        $scope.show_total_active_logged = false;
        $scope.total_active_logged = numeral(response.data.total_active_logged).format('0.00a');

    }, function myError(response) {
        $scope.total_active_logged = 0
    });

    $http({
        method : "GET",
        url : "/yesterday_registrations"
    }).then(function mySuccess(response) {
        $scope.show_yesterday_registrations = false;
        $scope.yesterday_registrations = numeral(response.data.yesterday_registrations).format('0,0');

    }, function myError(response) {
        $scope.yesterday_registrations = 0
    });

    $http({
        method : "GET",
        url : "/monthly_registrations"
    }).then(function mySuccess(response) {

        $scope.show_monthly_registrations = false;
        $scope.monthly_registrations = response.data.monthly_registrations;

        rows = [];
        $scope.data = []
        $scope.labels = []
        $scope.series = ['Registration acquisitions'];

        angular.forEach(response.data.monthly_registrations, function(value, key) {
            $scope.data.push(value.count)
            $scope.labels.push(value.date)

            rows.push({
                c: [
                    {v: value.date},
                    {v: value.count},
                    {v: numeral(value.count).format('0,0')}
                ]
            });
        });

        $scope.myChartObject = {};

        $scope.myChartObject.type = "ColumnChart";

        $scope.myChartObject.data = {"cols": [
                {id: "t", label: "Months", type: "string"},
                {id: "s", label: "Registration acquisitions", type: "number"},
                {role: "annotation", type: "string"}
            ], "rows": rows
        };


    }, function myError(response) {
        $scope.monthly_registrations = []
    });




}).config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
});
