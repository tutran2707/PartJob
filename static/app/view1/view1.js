'use strict';

angular.module('myApp.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'view1/view1.html',
    controller: 'loginCtrl',
    controllerAs: 'loginCtrl'
  });
}])

.controller('loginCtrl', ['$http', function($http) {
    var vm = this;
      vm.user = {};
      vm.submit = submit;
      console.log($http);
      ///////////////////////////
      function submit(){
        console.log( vm.user);
        $http.post('http://localhost:8088/login', vm.user).then(function (data) {
          console.log(data);

          var res = data.data;
          if (data.status == 200) {
            vm.user = {};

            alert('success');
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