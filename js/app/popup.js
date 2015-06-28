﻿// jQeury and AngularJS have similar syntax, by declaring this now for jQuery you need to use "j" instead of "$"
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


myApp.controller("PageController", function ($scope, $http) {

    $scope.testResults = [ {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15} ]; 
    // numbers of manual tests
    $scope.manualTests = [5,9,10,12,14];
    $scope.websiteSummary;

    // A Variable for a Button to toggle (Show/Hide) Test examples 
    $scope.testsExamples = false;
    //$scope.allowSubmit = true;

    $http.get("http://office.web2access.org.uk/tests.json").success(function(response) {
        // Select only first 15 tests
        $scope.tests = response.slice(0, 16);
        // Default Value for test, to start from Test 1
        $scope.test = $scope.tests[0];
    });

    // Buttons for Previous/Next test
    // Note that the Test IDs in DB start from 1, not from 0 as we got used to for normal arrays.
    $scope.back = function() {
        $scope.saveResults();
        $scope.test = $scope.tests[$scope.test.id-2];
    }
    $scope.forward = function() {
        $scope.saveResults();
        $scope.test = $scope.tests[$scope.test.id];
    }
    $scope.navigate = function(testId){
        $scope.saveResults();
        $scope.test = $scope.tests[testId-1];
    }

    // Fixed Nav section at the beginning of the page
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
    // The END of the Fixed Nav Section

    // Find active tabs, i.e. tab you are currently browsing in
    chrome.tabs.query({'active': true},
        function (tabs) {
            if (tabs.length > 0)
            {   
                // Grab the title and URL of the page you are currently on
                // Tab's URL, retrieved long way to get the Hostname, port, etc. on request
                $scope.title = tabs[0].title;
                $scope.parser = document.createElement('a');
                $scope.url = tabs[0].url;
                $scope.parser.href = $scope.url;

                // Stores data submitted by user on all tests
                $scope.website = {"domain": $scope.parser.host, "finished": false };
                console.log($scope.website);
                                    

                // Watch the test's id changing and use the functions accordingly
                $scope.$watch('test.id', function(newVal, oldVal, scope) {
                    $scope.checkResults();
                    if (!$scope.allowSubmit){
                        $scope.warningMessage = true;
                    } else {
                        $scope.warningMessage = false;
                    }
                    // Change of the Test ID means that a test was switched, then it is better to clean everything left from previous tests
                    $scope.cleanPreviousCSS();
                    $scope.testsExamples = false;
                    $scope.selected = false;
                    $scope.allowSubmit = true;
                    // When the test has been switched, return the CSS back to normal, for test 5.
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageCSS', 'disable': false }, function (response) { });
                    $scope.enableDisable = false;

                    // change the url of the test, which links to corrensponding HTML file on the Tests folder.
                    $scope.testUrl = 'tests/test'+newVal+'.html';

                    // Change the URL if test is manual
                    for (i = 0; i < $scope.manualTests.length; i++){
                        if (newVal === $scope.manualTests[i]){
                            $scope.manualUrl = 'tests/test'+newVal+'.html';
                            $scope.manualTest = true;
                            $http.get("http://office.web2access.org.uk/tests/"+newVal+".json").success(function(response) {
                                $scope.responseTest = response;
                            });
                            return;
                        } else {
                            $scope.manualTest = false;
                        }
                    }


                    if($scope.testResults[newVal] && $scope.testResults[newVal].checkScore){
                        $scope.rate = 1 + Math.floor($scope.testResults[newVal].checkScore / 33);
                    } else {
                        $scope.rate = 0;
                        $scope.overStar = 1;
                    }

                    if (newVal == 1){
                        $scope.requestForms();
                    }
                    if (newVal == 2){
                        $scope.requestImages();
                    }
                    if (newVal == 3){
                        $scope.requestLinks();
                    }
                    if (newVal == 4){
                        $scope.requestFrames();
                    }
                    if (newVal == 8){
                        $scope.requestTables();
                    }
                    if (newVal == 16){
                        $scope.checkResults();
                    }
                });
        

                window.onload = function() {
                    console.log("onload");
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'CheckForResults' }, function (response) { 
                        console.log("some stuff: ");
                        if (response){
                            console.log("yes, I've received response: " + response);
                            $scope.testNotFinished = true;
                            $scope.testResults = response.testResults;
                            $scope.$apply();
                        }
                    });
                }

                $scope.saveResults = function(){
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'SaveResults', 'testResults': $scope.testResults }, function () { });
                };

                // Summary regarding a Website wouldn't be bnded in the same manner as the TestResults do, because of the NG-INCLUDE usage
                $scope.saveSummary = function(websiteSummary) {
                    $scope.websiteSummary = websiteSummary;
                };
                //$scope.$watch('testResults', function(newVal, oldVal, scope) {
                
                //}, true);
                // TRUE attribute is needed for DEEP watch, in other words, for checking the Update of the array, not only Insert, Delete or Sort

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
                $scope.requestFrames = function(){
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageFrames' }, function (response) {
                        $scope.testData = response;
                        $scope.$apply();
                    });
                };

                // Test 4,
                $scope.requestLinks = function(){
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageLinks' }, function (response) {
                        $scope.testData = response;
                        $scope.$apply();
                    });
                };

                // Test 5,
                $scope.toggleCSS = function(disable) {
                    $scope.enableDisable = disable;
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageCSS', 'disable': disable }, function (response) { });
                };

                // Test 8,
                $scope.requestTables = function() {
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageTables' }, function (response) { 
                        $scope.testData = response;
                        $scope.$apply();
                    });
                };

                // Test 9,
                $scope.toggleOrder = function(disable) {
                    $scope.enableDisable = disable;
                    chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageOrder', 'disable': disable }, function (response) { });
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
                        chrome.tabs.sendMessage(tabs[0].id, { 'action': 'DeleteResults' }, function () { });
                    }
                };

                $scope.checkResults = function(){
                    for (i=0; i<15; i++){
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
                    if (!$scope.websiteSummary){
                        $scope.allowSubmit = false;
                    }
                };
            }
    });
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