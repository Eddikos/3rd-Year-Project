myApp.service('pageInfoService', function() {
    this.getInfo = function(callback) {
        var model = {};
        
        // Find active tabs, i.e. tab you are browsing
        chrome.tabs.query({'active': true},
        function (tabs) {
            if (tabs.length > 0)
            {
                // Grab the title and URL of the page you are currently on
                model.title = tabs[0].title;
                model.url = tabs[0].url;
                
                // Then Send message directly to that one tab
                // i.e. you are sending to the CONTENT.js script
                // which is listening for messages
                // And when the response comes from CONTENT.js, it will apply it straight away
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageInfo' }, function (response) {
                    model.pageInfos = response;
                    callback(model);
                });
            }

        });
    };
});

myApp.controller("PageController", function ($scope, pageInfoService) {
    // Will be passed to the PageController which is in the POPUP.html
    $scope.message = "This is a demo extension for Web2Access Accessibility tool";  
    
    // Call the function which is up, and use the varaible Callback, straight away... INFO
    pageInfoService.getInfo(function (info) {
        // These variables are also passed to POPUP.html
        $scope.title = info.title;
        $scope.url = info.url;
        $scope.pageInfos = info.pageInfos;
        
        $scope.$apply();
    });


    $scope.tests =
    [ { name: 'test1.html', url: 'tests/test1.html'},
      { name: 'test2.html', url: 'tests/test2.html'},
      { name: 'test3.html', url: 'tests/test3.html'},
      { name: 'test4.html', url: 'tests/test4.html'},
      { name: 'test5.html', url: 'tests/test5.html'} ];
    $scope.test = $scope.tests[0];

});