var j = jQuery.noConflict();

myApp.filter('resultsFilter', function () {
    return function (items) {
        // Create a new Array
        var filtered = [];
        // loop through existing Array
        for (var i = 0; i < items.length; i++) {
            if (items[i].passed === false){
                filtered[0].push(item);
            } else if (items[i].passed === "warning"){
                filtered[1].push(item);
            } else if (items[i].passed === "warning"){
                filtered[2].push(item);
            }
        }
        // boom, return the Array after iteration's complete
        return filtered;
        };
});


myApp.controller("PageController", function ($scope) {
    // Stores data submitted by user on all tests
    $scope.testResults = [{id: 0},
                          {id: 1},
                          {id: 2},
                          {id: 3},
                          {id: 4}];  
    // A Variable for a Button to toggle (Show/Hide) Test examples 
    $scope.testsExamples = false;
    $scope.allowSubmit = true;

    // Buttons for Previous/Next test
    $scope.back = function() {
        $scope.test = $scope.tests[$scope.test.id-1];
    }
    $scope.forward = function() {
        $scope.test = $scope.tests[$scope.test.id+1];
    }
    $scope.navigate = function(testId){
        $scope.test = $scope.tests[testId];
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
            $scope.starRate = 0;
        } else if (rate == 2){
            $scope.starRate = 33;
        } else if (rate == 3){
            $scope.starRate = 67;
        } else if (rate == 4){
            $scope.starRate = 100;
        }
    }

    $scope.selectCriteria = function(id){
        j('#score'+id).attr('checked', true);
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
                $scope.testsExamples = false;
                $scope.selected = false;
                $scope.allowSubmit = true;
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageCSS', 'disable': false }, function (response) { });

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
                if (newVal == 5){
                    $scope.checkResults();
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
                $scope.enableDisable = disable;
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
            $scope.scrollToTheElement = function(elementIndex) {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'scrollToElement', 'elementIndex': elementIndex }, function (response) { });
            };

            //Highlight the images in MAIN.html page hovered in the POPUP.html, plus pass varaible (whether onMouseEnter or onMouseLeave)
            $scope.highlightImage = function(elementIndex, approved) {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'HighlightImage', 'elementIndex': elementIndex, 'approved': approved }, function (response) { });
            };

            // Send request to CONTENT.js (which will find highlighted text), and then to Background.js which will actually SPEAK the text
            $scope.ttsGoogle = function() {
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'textToSpeech'}, function (response) { });
            };

            $scope.reset = function(testID) {
                if(testID){
                    $scope.testResults[testID] = null;
                } else if (!testID){
                    for (i=0; i<$scope.testResults.length; i++){
                        $scope.testResults[i].checkScore = null;
                        $scope.testResults[i].checkSummary = null;
                    }
                }
            };

            $scope.checkResults = function(){
                for (i=0; i<=4; i++){
                    if($scope.testResults[i]){
                        if(!$scope.testResults[i].checkScore){
                            $scope.allowSubmit = false; 
                        } 
                        if (!$scope.testResults[i].checkSummary){
                            $scope.allowSubmit = false;
                        }
                    } else {
                        $scope.allowSubmit = false;
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
                            description: "Fails all AT access, feedback & timing",
                            value: 0
                        }, {
                            description: "No TTS access, has CAPTCHA alternative",
                            value: 33
                        }, {
                            description: "Lacks feedback, but has AT access",
                            value: 67
                        }, {
                            description: "Easy access, good feedback",
                            value: 100
                        }],
                    }, {
                        id: 1,
                        name: 'Image ALT Attributes',
                        url: 'tests/test2.html',
                        webPage: 'http://www.web2access.org.uk/test/2/',
                        rank: [{
                            description: "No alt tags or explanations",
                            value: 0
                        }, {
                            description: "Inappropriate/confusing alt tags ",
                            value: 33
                        }, {
                            description: "Adequate alt tags but can lack clarity",
                            value: 67
                        }, {
                            description: "Good alt tags and explanations",
                            value: 100
                        }],
                    }, {
                        id: 2,
                        name: 'Link Target Definitions',
                        url: 'tests/test3.html',
                        webPage: 'http://www.web2access.org.uk/test/3/',
                        rank: [{
                            description: "Meaningless, duplicate & broken links ",
                            value: 0
                        }, {
                            description: "Non-defined ‘click here’, duplicates",
                            value: 33
                        }, {
                            description: "No broken/duplicates, some unclear links",
                            value: 67
                        }, {
                            description: "Skip nav and clear links throughout",
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
                            description: "Content available but unordered",
                            value: 33
                        }, {
                            description: "Content ordered / navigation difficult",
                            value: 67
                        }, {
                            description: "Content and structure retained",
                            value: 100
                        }],
                    }, {
                        id: 4,
                        name: 'Appropriate use of Tables',
                        url: 'tests/test5.html',
                        webPage: 'http://www.web2access.org.uk/test/8/',
                        rank: [{
                            description: "Layout using tables / access poor",
                            value: 0
                        }, {
                            description: "Data tables lack row/col headers",
                            value: 33
                        }, {
                            description: "Some data not associated with headers",
                            value: 67
                        }, {
                            description: "Tables have headers & associated data",
                            value: 100
                        }],
                    }, {
                        id: 5,
                        name: 'Summary of Tests',
                        url: 'tests/test6.html',
                        webPage: 'http://www.web2access.org.uk/',
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

// Test Progress Bar, idea taken from http://designscrazed.org/jquery-css3-progress-bars/
    var i = 1;
    j('.progressH .circle').removeClass().addClass('circle');
    j('.progressH .bar').removeClass().addClass('bar');
// End of Test Progres Bar
