myApp.controller("PageController", function ($scope) {
    // Will be passed to the PageController which is in the POPUP.html
    $scope.message = "This is a demo extension for Web2Access Accessibility tool"; 
        
    $scope.tests = [ { name: 'Login, Signup and Other Forms Accessible', url: 'tests/test1.html', number: 0},
                    { name: 'Image ALT Attributes', url: 'tests/test2.html', number: 1},
                    { name: 'Link Target Definitions', url: 'tests/test3.html', number: 2},
                    { name: 'Removal of Stylesheet', url: 'tests/test4.html', number: 3},
                    { name: 'Appropriate use of Tables', url: 'tests/test5.html', number: 4} ];

    // Default Value for test, to start from 1
    $scope.test = $scope.tests[1];

    // Buttons for Previous/Next test
    $scope.back = function() {
        $scope.test = $scope.tests[$scope.test.number-1];
    }

    $scope.forward = function() {
        $scope.test = $scope.tests[$scope.test.number+1];

        if ($scope.test.number == 2){
             $scope.requestLinks();
        }
    }



    // Find active tabs, i.e. tab you are browsing
    chrome.tabs.query({'active': true},
    function (tabs) {
        if (tabs.length > 0)
        {
            // Grab the title and URL of the page you are currently on
            $scope.title = tabs[0].title;
            $scope.url = tabs[0].url;
            
            // Then Send message directly to that one tab
            // i.e. you are sending to the CONTENT.js script
            // which is listening for messages
            // And when the response comes from CONTENT.js, it will apply it straight away
            chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageImages' }, function (response) {
                $scope.pageImages = response;
                $scope.$apply();
            });

            $scope.requestLinks = function(){
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageInfo' }, function (response) {
                    $scope.pageLinks = response;
                    $scope.$apply();
                });
            };
        }
    });
});

            