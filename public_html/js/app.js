'use strict';
var App = angular.module('campCunApp', ['angular-loading-bar']);

App.controller('AppCtrl', ['$scope', 'AppF','LocalS',
    function (scope, AppF, Local) {
        scope.changeTab = function(tab){
            AppF.mainView = tab;
            Local.setData("tab",AppF.mainView);
        }
        var setData = function(when){
            if(when === "afterLocal"){
                AppF.places = Local.getData("places");
                AppF.todos = Local.getData("todos");
            }
            scope.appF = AppF;
            console.log(scope.appF,"appF");
            // Set map here
            scope.initializeMap = function(){
                var latlng = new google.maps.LatLng(21.155783,-86.840402);
                var myOptions = {
                    zoom: 6,
                    center: latlng,
                    mapTypeId: google.maps.MapTypeId.TERRAIN
                };
                var map = new google.maps.Map(document.getElementById('map'),myOptions);
                
                for (var p in AppF.places){
                    var place = AppF.places[p];
                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(place.latitude,place.longitude),
                        map: map,
                        title: place.name,
                        icon: AppF.path+"/img/marker.png"
                    });
                }
            }
            scope.initializeMap();
        }
        var localPlaces = Local.getData("places");
        if(!localPlaces){
            AppF.getAll().then(function(allData){
                Local.setData("places",allData[0].data);
                Local.setData("todos",allData[1].data);
                AppF.places = allData[0].data;
                AppF.todos = allData[1].data;
            }).then(function(){
                setData("afterAjax");
            });
        } else {
            setData("afterLocal");
        }
    }]);

App.controller('tabsCtrl', ['$scope', 'AppF','LocalS',
    function (scope, AppF, Local) {
        scope.saveTodo = function(todo){
            for(var t in AppF.todos){
                if(AppF.todos[t].id == todo.id){
                    AppF.todos[t].checked = todo.checked;
                }
            }
            Local.setData("todos",AppF.todos);
        }
        scope.goToPlace = function(place){
            AppF.mainView = "place";
            AppF.place = place;
            scope.initialize = function() {
                if(AppF.place.latitude !== ""){
                    var mapOptions = {
                      center: { lat: parseFloat(AppF.place.latitude), lng: parseFloat(AppF.place.longitude)},
                      zoom: 6,
                      mapTypeId: google.maps.MapTypeId.TERRAIN
                    };
                    var map = new google.maps.Map(document.getElementById('placeMap'), mapOptions);
                    var myLatlng = new google.maps.LatLng(AppF.place.latitude,AppF.place.longitude);
                    var marker = new google.maps.Marker({
                        position: myLatlng,
                        title:AppF.place.name,
                        icon: AppF.path+"/img/marker.png"
                    });
                } else {
                    var mapOptions = {
                      center: { lat: 21.002357, lng: -87.170852},
                      zoom: 6,
                      mapTypeId: google.maps.MapTypeId.TERRAIN
                    };
                    var map = new google.maps.Map(document.getElementById('placeMap'), mapOptions);
                } 
            }
            $(document).ready(function(){
                scope.initialize();
            });
        }
    }]);

App.factory('AppF', ['$q','AjaxS','LocalS',
    function ($q, Ajax, Local) {
        return {
            mainView: (Local.getData("tab")) ? Local.getData("tab") : "map",
            subMenu: false,
            loggedIn: false,
            path: "views/home",
            api: "http://tu-desarrollo.com/apps/camp-cun-api/",
//            api: "index.php?url=",
            getAll: function(){
                return $q.all([
                    Ajax.request("post",this.api+"places/json",{}),
                    Ajax.request("post",this.api+"todos/json",{})
                ]);
            },
        }
    }]);

App.directive('directory', ['AppF',
    function (AppF) {
        return {
            strict: "E",
            scope: true,
            transclude: true,
            templateUrl: AppF.path+"/directory.html",
            controller: "tabsCtrl",
            link: function (scope, ele, attr, ctrl) {
                
            }
        };
    }]);

App.directive('place', ['AppF',
    function (AppF) {
        return {
            strict: "E",
            scope: true,
            transclude: true,
            templateUrl: AppF.path+"/place.html",
            controller: "tabsCtrl",
            link: function (scope, ele, attr, ctrl) {
                
            }
        };
    }]);

App.directive('todos', ['AppF',
    function (AppF) {
        return {
            strict: "E",
            scope: true,
            transclude: true,
            templateUrl: AppF.path+"/todos.html",
            controller: "tabsCtrl",
            link: function (scope, ele, attr, ctrl) {
                
            }
        };
    }]);

App.service('AjaxS', ['$http',
    function($http){
        return {
            request: function(method,url,params){
                if(angular.isUndefined(params)){ params = {}}
                params.apiKey = "2Q3xsKtpHe";
                var request = $http({
                    method: method, 
                    url: url, 
                    params: params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
                return request;
            }
        }
}]);
App.service('LocalS',function(){
    return {
        getData: function(what){
            var localData = localStorage.getItem(what);
            var data = (localData == null) ? false : angular.fromJson(localData);
            return data;
        },
        cleanData: function (what){
            if(what instanceof Array){
                for(var w in what){
                    localStorage.removeItem(what[w]);
                }
            } else {
                localStorage.removeItem(what);
            }
            return true;
        },
        setData: function (name,data){
            var dataJson = angular.toJson(data);
            localStorage.setItem(name,dataJson);
            return true;
        }
    }
})