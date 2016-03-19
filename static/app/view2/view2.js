'use strict';

angular.module('myApp.register', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/register', {
            templateUrl: 'view2/view2.html',
            controller: 'registerCtrl',
            controllerAs: 'rg'
        });
    }])

    .controller('registerCtrl', [function ($http) {
        var vm = this;
        vm.save = save;
        /////////////////////////
        function save() {
            console.log(vm.user);
            $http.post('/register', vm.user).then(function (data) {
                var res = data.data;
                if (res.result !== 0) {
                    vm.user.password = '';
                } else {
                    vm.error = true;
                    vm.message = 'Username or Password not correct ...!';
                }
            }, function(err){
                vm.error = true;
                vm.message = err;
            });
        }
    }]);