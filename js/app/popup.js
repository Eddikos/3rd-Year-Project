myApp.controller("PageController", function ($scope) {
    // Will be passed to the PageController which is in the POPUP.html
    $scope.message = "This is a demo extension for Web2Access Accessibility tool"; 
        
    $scope.tests = [ { name: 'Login, Signup and Other Forms Accessible', url: 'tests/test1.html', number: 0},
                    { name: 'Image ALT Attributes', url: 'tests/test2.html', number: 1},
                    { name: 'Link Target Definitions', url: 'tests/test3.html', number: 2},
                    { name: 'Removal of Stylesheet', url: 'tests/test4.html', number: 3},
                    { name: 'Appropriate use of Tables', url: 'tests/test5.html', number: 4} ];

    // Default Value for test, to start from 1
    $scope.test = $scope.tests[0];

    // Buttons for Previous/Next test
    $scope.back = function() {
        $scope.test = $scope.tests[$scope.test.number-1];
    }
    $scope.forward = function() {
        $scope.test = $scope.tests[$scope.test.number+1];
    }


    // Watch the test's number changing and use the functions accordingly
    $scope.$watch('test.number', function(newVal, oldVal, scope) {
        if (newVal == 1){
            $scope.requestImages();
        }
        if (newVal == 2){
            $scope.requestLinks();
        }
    });



    // Find active tabs, i.e. tab you are browsing
    chrome.tabs.query({'active': true},
    function (tabs) {
        if (tabs.length > 0)
        {
            // Grab the title and URL of the page you are currently on
            $scope.title = tabs[0].title;
            $scope.url = tabs[0].url;
            
            // Send messages to the main web page (CONTENTS.js), which has Listen function, and get the response asnwer
            $scope.requestImages = function(){
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageImages' }, function (response) {
                    $scope.pageImages = response;
                    $scope.$apply();
                });
            };

            $scope.requestLinks = function(){
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageLinks' }, function (response) {
                    $scope.pageLinks = response;
                    $scope.$apply();
                });
            };

            //Highlight the images in MAIN.html page hovered in the POPUP.html, plus pass varaible (whether onMouseEnter or onMouseLeave)
            $scope.highlightImage = function(imageIndex, approved) {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'HighlightImage', 'imageIndex': imageIndex, 'approved': approved }, function (response) { });
            };

            $scope.toggleCSS = function(disable) {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'ToggleCSS', 'disable': disable }, function (response) { });
            };
        }
    });
});

            