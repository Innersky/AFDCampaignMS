(function(){
    angular.module('campaignMS', [])
        .service('campaignsService', function(){
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
                    balance: 5000000,
                    current: {
                        AClicks: 0,
                        BClicks: 0,
                        CClicks: 0,
                        DClicks: 0
                    },
                    history: []
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
                    balance: 8000000,
                    current: {
                        AClicks: 0,
                        BClicks: 0,
                        CClicks: 0,
                        DClicks: 0
                    },
                    history: []
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
                    balance: 10000000,
                    current: {
                        AClicks: 0,
                        BClicks: 0,
                        CClicks: 0,
                        DClicks: 0
                    },
                    history: []
                }
            ];
            currentID = 1;
            this.getCurrentID = function() {
                return currentID;
            };
            this.setCurrentID = function(id) {
                currentID = id;
            };
            this.getAll = function() {
                return campaigns;
            };
        })
        .controller('headerController', function($scope, campaignsService){
            $scope.isSet = function(id) {
                return campaignsService.getCurrentID() === id;
            };
            $scope.setTab = function(id) {
                campaignsService.setCurrentID(id);
            };
            $scope.allCampaigns = campaignsService.getAll();
        })
        .controller('campaignController', function($scope, campaignsService){
            $scope.allCampaigns = campaignsService.getAll();
            $scope.isSet = function(id) {
                return campaignsService.getCurrentID() === id;
            };
        })
        .controller('subCampaignController', function($scope){
            $scope.ruleChart = null;

            $scope.applyChanges = function() {
                $scope.campaign.rules.forEach(function(element, index) {
                    $scope.ruleChart.datasets[0].points[index].value = element.rate;
                    $scope.ruleChart.update();
                });
            };

            $scope.run = function() {
                $scope.campaign.isRun = true;
            };

            $scope.stop = function() {
                $scope.campaign.isRun = false;
            };
        })
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
                    scope.campaign.rules.forEach(function(element) {
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
                        ctrl.$setViewValue(Math.ceil(values[handle]));
                        ctrl.$render();
                    });
                }
            }
        });
})();