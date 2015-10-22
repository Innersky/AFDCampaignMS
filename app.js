(function(){
    angular.module('campaignMS', [])
        .service('campaignsService', function(){
            campaigns = [
                {
                    id: 1,
                    title: 'BMW 3 Series',
                    current: {},
                    history: []
                },
                {
                    id: 2,
                    title: 'BMW 5 Series',
                    current: {},
                    history: []
                },
                {
                    id: 3,
                    title: 'BMW 7 Series',
                    current: {},
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
        .directive('slider', function() {
            return {
                template: '<div class="col-md-4 form-inline"></div><div class="col-md-8" style="padding-top: 7px"><div style="background: #0081BB"></div></div>',
                restrict: 'E',
                link: function (scope, element, attrs) {
                    element[0].firstChild.innerHTML = '<div class="input-group"><div class="input-group-addon">Class ' + attrs.fraudRate + '</div><input type="text" class="form-control" value="' + attrs.default + '" style="width: 50px;" /><div class="input-group-addon">%</div></div>';

                    noUiSlider.create(element[0].childNodes[1].childNodes[0], {
                        start: 40,
                        connect: 'lower',
                        range: {
                            'min': [ 0 ],
                            'max': [ 100 ]
                        }
                    });

                }
            }
        });
})();