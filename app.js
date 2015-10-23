(function(){
    angular.module('campaignMS', [])
        //Angular service for fetching data and post data
        .service('campaignsService', function($interval){
            campaigns = [
                {
                    id: 1,
                    title: 'BMW 3 Series',
                    rules: [
                        {
                            name: 'Class A',
                            rate: 100
                        },
                        {
                            name: 'Class B',
                            rate: 80
                        },
                        {
                            name: 'Class C',
                            rate: 60
                        },
                        {
                            name: 'Class D',
                            rate: 40
                        }
                    ],
                    base: 20,
                    isRun: false,
                    startTime: null,
                    duration: 0,
                    balance: 5000000,
                    currentClicks: {
                        'Class A': 0,
                        'Class B': 0,
                        'Class C': 0,
                        'Class D': 0
                    },
                    histories: []
                },
                {
                    id: 2,
                    title: 'BMW 5 Series',
                    rules: [
                        {
                            name: 'Class A',
                            rate: 100
                        },
                        {
                            name: 'Class B',
                            rate: 80
                        },
                        {
                            name: 'Class C',
                            rate: 60
                        },
                        {
                            name: 'Class D',
                            rate: 40
                        }
                    ],
                    base: 40,
                    isRun: false,
                    startTime: null,
                    duration: 0,
                    balance: 8000000,
                    currentClicks: {
                        'Class A': 0,
                        'Class B': 0,
                        'Class C': 0,
                        'Class D': 0
                    },
                    histories: []
                },
                {
                    id: 3,
                    title: 'BMW 7 Series',
                    rules: [
                        {
                            name: 'Class A',
                            rate: 100
                        },
                        {
                            name: 'Class B',
                            rate: 80
                        },
                        {
                            name: 'Class C',
                            rate: 60
                        },
                        {
                            name: 'Class D',
                            rate: 40
                        }
                    ],
                    base: 70,
                    isRun: false,
                    startTime: null,
                    duration: 0,
                    balance: 10000000,
                    currentClicks: {
                        'Class A': 0,
                        'Class B': 0,
                        'Class C': 0,
                        'Class D': 0
                    },
                    histories: []
                }
            ];
            var currentID = 1;
            this.getCurrentID = function() {
                return currentID;
            };
            this.setCurrentID = function(id) {
                currentID = id;
            };
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
        //controller for header and nav bar
        .controller('headerController', function($scope, campaignsService){
            $scope.isSet = function(id) {
                return campaignsService.getCurrentID() === id;
            };
            $scope.setTab = function(id) {
                campaignsService.setCurrentID(id);
            };
            $scope.allCampaigns = campaignsService.getAll();
        })
        //campaign controller for all campaigns
        .controller('campaignController', function($scope, campaignsService){
            $scope.allCampaigns = campaignsService.getAll();
            $scope.isSet = function(id) {
                return campaignsService.getCurrentID() === id;
            };
        })
        //the controller for single campaign
        .controller('subCampaignController', function($scope, campaignsService){
            $scope.ruleChart = null;
            $scope.tempRules = [];
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
                $scope.stop();
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
                    var currentSeconds = new Date().getTime() / 1000;
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
                        step: 10,
                        connect: 'lower',
                        range: {
                            'min': [ 0 ],
                            'max': [ 100 ]
                        }
                    });

                    rangeSlider.noUiSlider.on('update', function( values, handle ) {
                        //console.log(scope.campaign);
                        ctrl.$setViewValue(Math.ceil(values[handle]));
                        ctrl.$render();
                    });
                }
            }
        });

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
})();