var j = jQuery.noConflict();

myApp.controller("PageController", function ($scope) {
    // Stores data submitted by user on all tests
    $scope.testResults = [{id: 0},
                          {id: 1},
                          {id: 2},
                          {id: 3},
                          {id: 4}];  
    // A Variable for a Button to toggle (Show/Hide) Test examples 
    $scope.testsExamples = true;
    $scope.allowSubmit = [];

    // Buttons for Previous/Next test
    $scope.back = function() {
        $scope.test = $scope.tests[$scope.test.id-1];
        $scope.selected = false;
    }
    $scope.forward = function() {
        $scope.test = $scope.tests[$scope.test.id+1];
        $scope.selected = false;
    }

    $scope.rate = 3;
    $scope.max = 4;
    $scope.isReadonly = false;
    $scope.overStar = 1;

    $scope.hoveringOver = function(value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };
    $scope.selectStar = function(rate) {
        $scope.overStar = rate;
        if (rate == 1){
            $scope.dude = 0;
        } else if (rate == 2){
            $scope.dude = 33;
        } else if (rate == 3){
            $scope.dude = 67;
        } else if (rate == 4){
            $scope.dude = 100;
        }
    }


    // Find active tabs, i.e. tab you are browsing
    chrome.tabs.query({'active': true},
    function (tabs) {
        if (tabs.length > 0)
        {
            // Grab the title and URL of the page you are currently on
            $scope.title = tabs[0].title;
            // Tab's URL, retrieved long way to get the Hostname, port, etc. on request
            $scope.parser = document.createElement('a');
            $scope.url = tabs[0].url;
            $scope.parser.href = $scope.url


            // Watch the test's id changing and use the functions accordingly
            $scope.$watch('test.id', function(newVal, oldVal, scope) {
                // Change of the Test ID means that a test was switched, then it is better to clean 
                $scope.cleanPreviousCSS();
                $scope.testsExamples = true;

                if($scope.testResults[newVal] && $scope.testResults[newVal].checkScore){
                    $scope.rate = 1 + Math.floor($scope.testResults[newVal].checkScore / 33);
                } else {
                    $scope.rate = 0;
                    $scope.overStar = 1;
                }

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

            $scope.$watch('testResults[test.id].checkScore', function(newVal, oldVal, scope) {
                $scope.rate = 1 + Math.floor(newVal / 33);
            });
        
            // Send blank request to the page to trigger function to clean the CSS from previous test
            $scope.cleanPreviousCSS = function() {
                chrome.tabs.sendMessage(tabs[0].id, {}, function() {});
            };

            // Test 1, highlight Forms
            $scope.requestForms = function() {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageForms' }, function (response) { 
                    $scope.testData = response;
                    $scope.$apply();
                });
            };

            // Test 2, Send messages to the main web page (CONTENTS.js), which has Listen function, and get the response asnwer
            $scope.requestImages = function(){
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageImages' }, function (response) {
                    $scope.testData = response;
                    $scope.$apply();
                });
            };

            // Test 3,
            $scope.requestLinks = function(){
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageLinks' }, function (response) {
                    $scope.testData = response;
                    $scope.$apply();
                });
            };

            // Test 4,
            $scope.toggleCSS = function(disable) {
                $scope.disabled = disable;
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageCSS', 'disable': disable }, function (response) { });
            };

            // Test 5,
            $scope.requestTables = function() {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageTables' }, function (response) { 
                    $scope.testData = response;
                    $scope.$apply();
                });
            };

            //Highlight the images in MAIN.html page hovered in the POPUP.html, plus pass varaible (whether onMouseEnter or onMouseLeave)
            $scope.highlightImage = function(imageIndex, approved) {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'HighlightImage', 'imageIndex': imageIndex, 'approved': approved }, function (response) { });
            };

            // Send request to CONTENT.js (which will find highlighted text), and then to Background.js which will actually SPEAK the text
            $scope.ttsGoogle = function() {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'textToSpeech'}, function (response) { });
            };

            $scope.reset = function(testID) {
                if(testID){
                    $scope.testResults[testID] = null;
                } else if (!testID){
                    $scope.testResults = [];
                }
            };

            $scope.checkResults = function(){
                for (i=0; i<=4; i++){
                    if($scope.testResults[i]){
                        if(!$scope.testResults[i].checkScore){
                            $scope.allowSubmit[i] = "Test "+(i+1)+": Score"; 
                        } 
                        if (!$scope.testResults[i].checkSummary){
                            if($scope.allowSubmit[i]){
                                $scope.allowSubmit[i] = $scope.allowSubmit[i]+" and Summary";
                            } else {
                                $scope.allowSubmit[i] = "Test "+(i+1)+": Summary";
                            }
                        }
                    } else {
                        $scope.allowSubmit[i] = "Test "+(i+1)+": Score and Summary";
                    }
                }
            }
        }
    });


    $scope.tests = [{
                        id: 0,
                        name: 'Login, Signup and Other Forms Accessible',
                        url: 'tests/test1.html',
                        webPage: 'http://www.web2access.org.uk/test/1/',
                        rank: [{
                            description: "Failure with screen reader - No labels",
                            value: 0
                        }, {
                            description: "Failure with screen reader - Bad CAPTCHA",
                            value: 33
                        }, {
                            description: "Good CAPTCHA, some missing Labels",
                            value: 67
                        }, {
                            description: "Labeled Forms, no CAPTCHA",
                            value: 100
                        }],
                    }, {
                        id: 1,
                        name: 'Image ALT Attributes',
                        url: 'tests/test2.html',
                        webPage: 'http://www.web2access.org.uk/test/2/',
                        rank: [{
                            description: "None ALT text, No option to add",
                            value: 0
                        }, {
                            description: "Inadequate/sparse ALT tag text",
                            value: 33
                        }, {
                            description: "ALT tag text, but lacks clarity",
                            value: 67
                        }, {
                            description: "Acceptable alternative text",
                            value: 100
                        }],
                    }, {
                        id: 2,
                        name: 'Link Target Definitions',
                        url: 'tests/test3.html',
                        webPage: 'http://www.web2access.org.uk/test/3/',
                        rank: [{
                            description: "Non-defined links such as 'click here'",
                            value: 0
                        }, {
                            description: "Non-defined links such as 'click here', but with explanatory title attributes",
                            value: 33
                        }, {
                            description: "Most links understandable with some duplicates",
                            value: 67
                        }, {
                            description: "Links fully appropriate",
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
                            description: "Layout tables lead to poor access",
                            value: 0
                        }, {
                            description: "Data tables, if used, have no headings. Layout tables don't impact on screen reader.",
                            value: 33
                        }, {
                            description: "Data tables incorrect layout. Navigation with a screen reader possible with effort.",
                            value: 67
                        }, {
                            description: "No Layout Tables, all Data Tables labeled.",
                            value: 100
                        }],
                    }];

    // Default Value for test, to start from Test 1
    $scope.test = $scope.tests[0];
});


// JQUERY Related code for the POPUP.html
    j(document).ready(function(){
        j('#nav_stick').hide();
        j(window).scroll(function() {

            if(j(this).scrollTop() > 100) {
                j('#nav_stick').fadeIn("slow");
            } else {
                j('#nav_stick').fadeOut("slow");
            }

        });
    });
