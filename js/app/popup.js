myApp.controller("PageController", function ($scope) {
    // Stores data submitted by user on all tests
    $scope.testResults = [];  

    // Buttons for Previous/Next test
    $scope.back = function() {
        $scope.test = $scope.tests[$scope.test.id-1];
        $scope.selected = false;
    }
    $scope.forward = function() {
        $scope.test = $scope.tests[$scope.test.id+1];
        $scope.selected = false;
    }






    // Find active tabs, i.e. tab you are browsing
    chrome.tabs.query({'active': true},
    function (tabs) {
        if (tabs.length > 0)
        {
            // Grab the title and URL of the page you are currently on
            $scope.title = tabs[0].title;
            $scope.parser = document.createElement('a');
            $scope.url = tabs[0].url;
            $scope.parser.href = $scope.url


            // Watch the test's id changing and use the functions accordingly
            $scope.$watch('test.id', function(newVal, oldVal, scope) {
                if (newVal == 0){
                    $scope.requestForms();
                }
                if (newVal == 1){
                    $scope.requestImages();
                }
                if (newVal == 2){
                    $scope.requestLinks();
                }
                if (newVal == 4){
                    $scope.requestTables();
                }
            });
    
            $scope.requestForms = function() {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageForms' }, function (response) { });
            };

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

            $scope.toggleCSS = function(disable) {
                $scope.disabled = disable;
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageCSS', 'disable': disable }, function (response) { });
            };


            $scope.requestTables = function() {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageTables' }, function (response) { });
            };

            //Highlight the images in MAIN.html page hovered in the POPUP.html, plus pass varaible (whether onMouseEnter or onMouseLeave)
            $scope.highlightImage = function(imageIndex, approved) {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'HighlightImage', 'imageIndex': imageIndex, 'approved': approved }, function (response) { });
            };


            // ????????????????????????????????????????????
            $scope.selected = function(){
                $scope.selected = true;
            };
            // ????????????????????????????????????????????
        }
    });


    $scope.tests = [{
                        id: 0,
                        name: 'Login, Signup and Other Forms Accessible',
                        url: 'tests/test1.html',
                        webPage: 'http://www.web2access.org.uk/test/1/',
                        rank: [{
                            description: "Failure with screen reader and keyboard - Lacks labels to forms.",
                            value: 0
                        }, {
                            description: "Failure with screen reader (e.g. CAPTCHA without alternative or inaccessible forms).",
                            value: 33
                        }, {
                            description: "CAPTCHA alternative offered or some accessible forms but some labels may be misleading.",
                            value: 67
                        }, {
                            description: "Simple, accessible forms with clear labels e.g. 'username (email)' and 'password'.",
                            value: 100
                        }],
                    }, {
                        id: 1,
                        name: 'Image ALT Attributes',
                        url: 'tests/test2.html',
                        webPage: 'http://www.web2access.org.uk/test/2/',
                        rank: [{
                            description: "None, detrimental to understanding of content. No option to add alt-tag if uploading image to web pages.",
                            value: 0
                        }, {
                            description: "Inadequate/sparse alternative text even to actual website images not just those added by users.",
                            value: 33
                        }, {
                            description: "Alternative text offered but lacks brevity or clarity e.g. image of duck.",
                            value: 67
                        }, {
                            description: "Acceptable alternative text throughout.",
                            value: 100
                        }],
                    }, {
                        id: 2,
                        name: 'Link Target Definitions',
                        url: 'tests/test3.html',
                        webPage: 'http://www.web2access.org.uk/test/3/',
                        rank: [{
                            description: "Non-defined links such as 'click here' or just 'download'.",
                            value: 0
                        }, {
                            description: "Non-defined links such as 'click here' or just 'download', but with explanatory title attributes.",
                            value: 33
                        }, {
                            description: "Most links understandable or provided in sentences. May have some duplicates.",
                            value: 67
                        }, {
                            description: "Links fully appropriate, used throughout the site plus alternative navigation element.",
                            value: 100
                        }],
                    }, {
                        id: 3,
                        name: 'Removal of Stylesheet',
                        url: 'tests/test4.html',
                        webPage: 'http://www.web2access.org.uk/test/5/',
                        rank: [{
                            description: "Page is unusable.",
                            value: 0
                        }, {
                            description: "Content accessible.",
                            value: 33
                        }, {
                            description: "Content and navigation accessible.",
                            value: 67
                        }, {
                            description: "Fully accessible with correct document structure.",
                            value: 100
                        }],
                    }, {
                        id: 4,
                        name: 'Appropriate use of Tables',
                        url: 'tests/test5.html',
                        webPage: 'http://www.web2access.org.uk/test/8/',
                        rank: [{
                            description: "Page layout is built using tables and access is poor",
                            value: 0
                        }, {
                            description: "Data tables, if used, have no headings. Layout tables do not impact on screen reader.",
                            value: 33
                        }, {
                            description: "Data tables incorrect layout. Navigation with a screen reader possible with effort.",
                            value: 67
                        }, {
                            description: "Page layout does not use tables and/or headered tables are used to present data.",
                            value: 100
                        }],
                    }];

    // Default Value for test, to start from 1
    $scope.test = $scope.tests[0];
});

            