var app = angular.module("app",[]);


app.controller("MirrorCtrl", function ($scope, $http, $interval, $timeout) {



})


 app.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
});
