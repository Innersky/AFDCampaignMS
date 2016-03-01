(function(){
    angular.module('campaignMS', [])
        //Angular service for fetching data and post data
        .service('campaignsService', function($interval,$http){
            //Data below is hard coded
            var campaigns = [];
            $http.get('./campaigns.json').success(function(data) {
                campaigns = data;
                console.log(campaigns);
            });
            this.getAll = function() {
                return campaigns;
            };

            this.runCampaign = function(campaignID) {
                return true;
            };

            this.stopCampaign = function(campaignID) {
                return true;
            };
            var clicks;
            clicks = $interval(function() {
                campaigns.forEach(function(element) {
                    if(element.isRun) {
                        var newClicks = {
                            'Class A': getRandomInt(20, 300),
                            'Class B': getRandomInt(100, 700),
                            'Class C': getRandomInt(500, 1000),
                            'Class D': getRandomInt(40, 200)
                        };
                        var now = new Date().getTime();
                        element.duration = Math.ceil((now - element.startTime) / 1000);
                        element.rules.forEach(function(e) {
                            element.balance -= newClicks[e.name] * e.rate * element.base / 100;
                            element.currentClicks[e.name] += newClicks[e.name];
                        });
                    }
                });
            }, 1000);
        })
        //campaign controller for all campaigns
        .controller('campaignController', function($scope, campaignsService){
            $scope.currentID = 1;
            $scope.allCampaigns = campaignsService.getAll();
            $scope.isSet = function(id) {
                return $scope.currentID === id;
            };
            $scope.setTab = function(id) {
                $scope.currentID = id;
            };
        })
        //the controller for single campaign
        .controller('subCampaignController', function($scope, campaignsService){
            $scope.ruleChart = null;
            $scope.tempRules = [];
            $scope.isChange = false;
            $scope.changeDetected = function() {
                $scope.isChange = true;
            };
            $scope.changeApplied = function() {
                $scope.isChange = false;
            };
            $scope.tempBase = $scope.campaign.base;
            $scope.campaign.rules.forEach(function(element) {
                var name = element.name;
                var rate = element.rate;
                var rule = {
                    'name': name,
                    'rate': rate
                };
                $scope.tempRules.push(rule);
            });

            $scope.applyChanges = function() {
                $scope.stop();
                $scope.campaign.rules = [];
                $scope.tempRules.forEach(function(element) {
                    var name = element.name;
                    var rate = element.rate;
                    var rule = {
                        'name': name,
                        'rate': rate
                    };
                    $scope.campaign.rules.push(rule);
                });
                $scope.tempRules.forEach(function(element, index) {
                    $scope.ruleChart.datasets[0].points[index].value = element.rate;
                    $scope.ruleChart.update();
                });
                $scope.campaign.base = $scope.tempBase;
                $scope.changeApplied();
            };

            $scope.run = function() {
                if(!$scope.campaign.isRun && campaignsService.runCampaign($scope.campaign.id)) {
                    $scope.campaign.isRun = true;
                    $scope.campaign.startTime = new Date().getTime();
                    $scope.campaign.duration = 0;
                }
            };

            $scope.stop = function() {
                if($scope.campaign.isRun && campaignsService.stopCampaign($scope.campaign.id)) {
                    $scope.campaign.isRun = false;
                    var tempRules = [];
                    var tempClicks = {};
                    $scope.campaign.rules.forEach(function(element) {
                        var name = element.name;
                        var rate = element.rate;
                        var rule = {
                            'name': name,
                            'rate': rate
                        };
                        var click = $scope.campaign.currentClicks[name];
                        tempRules.push(rule);
                        tempClicks[name] = click;
                    });
                    var newHistory = {
                        startTime: $scope.campaign.startTime,
                        duration: $scope.campaign.duration,
                        rules: tempRules,
                        clicks: tempClicks,
                        base: $scope.campaign.base,
                        balance: $scope.campaign.balance
                    };
                    $scope.campaign.histories.push(newHistory);
                }
            };
        })
        //directive to handle chart
        .directive('ruleChart', function() {
            return {
                template: '<canvas width="550" height="270"></canvas>',
                restrict: 'E',
                link: function (scope, element) {
                    var data = {
                        labels : [],
                        datasets : [
                            {
                                fillColor : "rgba(151,187,205,0.5)",
                                strokeColor : "rgba(151,187,205,1)",
                                pointColor : "rgba(151,187,205,1)",
                                pointStrokeColor : "#fff",
                                data : []
                            }
                        ]
                    }
                    scope.tempRules.forEach(function(element) {
                        data.labels.push(element.name);
                        data.datasets[0].data.push(element.rate);
                    });
                    var ctx = element[0].firstChild.getContext("2d");
                    var myChart = new Chart(ctx).Line(data, {

                        //Boolean - If we want to override with a hard coded scale
                        scaleOverride : true,

                        //** Required if scaleOverride is true **
                        //Number - The number of steps in a hard coded scale
                        scaleSteps : 10,
                        //Number - The value jump in the hard coded scale
                        scaleStepWidth : 10,
                        //Number - The scale starting value
                        scaleStartValue : 0,
                        //Boolean - Whether to show labels on the scale
                        scaleShowLabels : true,

                        //Interpolated JS string - can access value
                        scaleLabel : "<%=value%>%",
                    });

                    scope.ruleChart = myChart;
                }
            };
        })
        //directive for slider range select
        .directive('slider', function() {
            return {
                template: '<div style="background: #0081BB"></div>',
                restrict: 'E',
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {
                    var rangeSlider = element[0].firstChild;

                    noUiSlider.create(rangeSlider, {
                        start: scope.rule.rate,
                        step: 1,
                        connect: 'lower',
                        range: {
                            'min': [ 0 ],
                            'max': [ 100 ]
                        }
                    });

                    scope.syncSlider = function(value) {
                        rangeSlider.noUiSlider.set(value);
                    };

                    rangeSlider.noUiSlider.on('update', function( values, handle ) {
                        ctrl.$setViewValue(Math.ceil(values[handle]));
                        ctrl.$render();
                    });
                }
            }
        })
        //if a ng-model value need to be listened, simply add attribute 'listen-change' to the directive.
        //if the value is changed, it will run changeDetected() function within the scope.
        .directive('listenChange', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    scope.$watch(attrs['ngModel'], function (newValue, oldValue) {
                        if(newValue === oldValue){
                            return;
                        }
                        scope.changeDetected();
                    });
                }
            };
        });

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
})();