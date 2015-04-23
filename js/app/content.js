//alert('content script loaded');

// Every page (in browser) is going to have this CONTENT script

// First thng that it does is Adds a LISTENET and starts listen to upcoming messages
chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {

    //debugger; 

    var testData = {};
    var testElements = [];
    var testElement = {};
    var numDefault = 0;
    var numDanger = 0;
    var numWarning = 0;
    var currentElement = null;

    function initialVariablesForEachTest(passedCurrentElement, index){
        numDefault++;
        testElement = {};
        testElement.passed = true;
        testElement.index = index;
        currentElement = passedCurrentElement;
        currentElement.addClass("testSuccess elementHighlightIndex"+ index); 
    }

    function testFailed(testElement, currentElement, failureMessage){
        numDanger++;
        testElement.passed = false;
        testElement.reason = failureMessage;
        currentElement.addClass("testDanger");
    }

    function testWarned(testElement, currentElement, failureMessage){
        numWarning++;
        testElement.passed = "warning";
        testElement.reason = failureMessage;
        currentElement.addClass("testWarning");
    }

    function sendResponseToPopUp(){
        testData.testElements = testElements;
        testData.numDanger = numDanger;
        testData.numDefault = numDefault;
        testData.numWarning = numWarning;
        testData.numPassed = numDefault - (numDanger + numWarning);
        var percentage = (numDanger/numDefault)*100;
        testData.failurePercentage = Math.round(percentage);

        if(testData.failurePercentage < 25){
            testData.suggestedMark = 4;
        } else if (testData.failurePercentage >= 25 && testData.failurePercentage < 50){
            testData.suggestedMark = 3;
        } else if (testData.failurePercentage >= 50 && testData.failurePercentage < 75){
            testData.suggestedMark = 2;
        } else if (testData.failurePercentage >= 75) {
            testData.suggestedMark = 1;
        }
        // Send response back to POPUP.js
        sendResponse(testData);
    }

    // Clear everything before moving to another Test
    if(request && request.action != 'HighlightImage' && request.action != 'scrollToElement'){
        // Remove all CSS classes for each test to start from scratch
        $('.highlightItems').removeClass('highlightItems');
        $('.testDanger').removeClass('testDanger');
        $('.testSuccess').removeClass('testSuccess');
        $('.testWarning').removeClass('testWarning');
        $('*[class*="elementHighlightIndex"]').removeClass (function (index, css) {
            return (css.match (/(^|\s)elementHighlightIndex\S+/g) || []).join(' ');
        });
        // Nullify all global variables, before starting another test
        testData = {};
        testElements = [];
        numDefault = 0;
        numDanger = 0;
        numWarning = 0;
    }

    // Request that may come from the Doogle Extension in order to highlight Hovered image
    if (request.action == 'HighlightImage') {
        var element = $('.elementHighlightIndex' + request.elementIndex);
        if (request.approved){
            if(element.is("input") && (element.attr('type') == "radio" || element.attr('type') == "checkbox")){
                element.wrap( "<span class='black'></span>" );
            }
            $('.elementHighlightIndex' + request.elementIndex).addClass('black');
        }
        if (!request.approved){
            $('.black').removeClass('black');
        }
    }

    if (request.action == 'textToSpeech') {
        // Code to get the Selected Text from the page taken from Google Extension Samples
        // SEL--Speak Selection - https://developer.chrome.com/extensions/samples
        var focused = document.activeElement;
        var selectedText;
        if (focused) {
            try {
                selectedText = focused.value.substring(focused.selectionStart, focused.selectionEnd);
            } catch (err) {

            }
        }
        if (selectedText == undefined) {
            var sel = window.getSelection();
            var selectedText = sel.toString();
        }
        
        chrome.runtime.sendMessage({toSay: selectedText}, function() {}); 
        console.log(request.toSay);
    }

    // If clicked on the element in the Test Results sections scroll to that element to make it easier to find
    if (request.action == 'scrollToElement'){
        $('html, body').animate({
            scrollTop: $('.elementHighlightIndex' + request.elementIndex).offset().top - 100
        }, 1000);

        console.log($('.elementHighlightIndex' + request.elementIndex).offset().top);
    }


    /*  
        Test Number 1
    */
    if (request.action == 'PageForms') {
        // Global variable to count all elements from the FORM
        var i = 0
        
        // Highlight all existing form elements
        $('form').each(function(index) {
            $(this).addClass("highlightItems");
        });

        // Check for labels on most common inputs fields: text, radio, checkbox, textarea, etc.
        $("input[type!='hidden'], textarea, select").each(function(index) {
            
            initialVariablesForEachTest($(this), index);

            i = index;
            var type = $(this).attr('type');


            // Check whether Input field of IMAGE type, has an ALT attribute
            if (type == "image"){
                var alt = $(this).attr('alt');
                
                if (alt == null || (alt != null && alt.trim() == "")) {
                    testFailed(testElement, currentElement, "No ALT tag on Input of Image Type");
                }

            // Check whether the buttons have been provided with VALUES
            } else if (type == "submit" || type == "reset" || type == "button"){
                var value = $(this).attr('value');
                
                if (value == null || (value != null && value.trim() == "")) {
                    testFailed(testElement, currentElement, "No Value provided for Button");
                }

            // Check all other Input fields, such as Radio, Text, Checkbox; for LABELS
            // Solution taken from http://stackoverflow.com/questions/4844594/jquery-select-the-associated-label-element-of-a-input-field 
            } else {
                // Some Labels wil have FOR set...
                var label = $('label[for="' + $(this).attr('id') + '"]');

                // However, some labels will be the PARENT of the associated input field
                if(label.length <= 0) {
                    var parentElem = $(this).parent(),
                        parentTagName = parentElem.get(0).tagName.toLowerCase();

                    if(parentTagName == "label") {
                        label = parentElem;
                    }
                }
                if(label.length <=0){
                    testFailed(testElement, currentElement, "An Input Field is not Labeled");
                }
            }
            // Radio and CheckBox are treated separately because Their CSS can't be adjusted easily
            if (type == "radio" || type == "checkbox"){
                if (testElement.passed == true){
                    $(this).wrap( "<span class='testSuccess'></span>" );
                } else {
                    $(this).wrap( "<span class='testDanger'></span>" );
                }
            }

            testElements.push(testElement);
        });

        $('button').each(function(index) {
            numDefault++;
            var testElement = {}
            testElement.passed = true;
            testElement.index = i + index + 1;
            $(this).addClass("testSuccess");
            $(this).addClass("elementHighlightIndex"+ testElement.index);

            var text = $(this).text();

            if (text == null || (text != null && text.trim() == "")) {
                testFailed(testElement, $(this), "Button Doesn't contain text");
            }

            testElements.push(testElement);
        });

        sendResponseToPopUp();
    }

    

    /*  
        Test Number 2
    */
    if (request.action == 'PageImages') {

        var badNames = ["picture of", "image of", "graphic of"];
        // Loop through all images on the website
        $('img').each(function(index) {
            initialVariablesForEachTest($(this), index);
            // Store Image's Alt text and it's index (number) on the page
            var alt = $(this).attr('alt');
            testElement.alt = alt;
            

            if (alt != null) {
                if (alt.trim() == ""){
                    testElement.alt = " ";
                    testFailed(testElement, currentElement, "An empty ALT text is being provided");
                }
            } else {
                testFailed(testElement, currentElement, "No ALT text has been provided");
            }

            if (testElement.passed == true){
                for (var i = 0; i < badNames.length; i++){
                    if (alt.toLowerCase().trim().indexOf(badNames[i].trim()) != -1){
                        testWarned(testElement, currentElement, "Ambiguous alternative text is provided");
                    }
                }
            }
            // Create and Array of URLs basically :)
            testElements.push(testElement);
        });

        sendResponseToPopUp();
    }


    /*  
        Test Number 3
    */
    if (request.action == 'PageLinks') {

        // Lists of Bad HTTP Status responses and Ambigious texts
        var badNames = ["click here!", "click here", "click", "here", "share", "list", "read more", "read", "more", "download", "click for details", "info", "link", "link to", "jump", "jump to", "visit", "watch now", "select"];
        var brokenLinks = [401, 403, 404, 410, 500, 12002, 12007, 12029, 12031];

        // Loop through all links found on the website, and get the Index of the Link 
        $('a').each(function(index) {
            initialVariablesForEachTest($(this), index);


            var href = $(this).attr('href');
            var text = $(this).text();
            testElement.link = href;
            testElement.text = text;
            
            
            if (href != null) {
                // Links with empty HREFs are mostly used to activate a JavaScript function
                if (href.trim() == "" || href.trim() == "#") {
                    testFailed(testElement, currentElement, "Link Contains an empty HREF attribute");
                }
            } else {
                testFailed(testElement, currentElement, "Link Doesn't contain an HREF attribute");
            }

            if (text == null || (text != null && text.trim() == "")){
               testFailed(testElement, currentElement, "Link Doesn't contain Text");
            } else {
                for (var i = 0; i < badNames.length; i++){
                    if (text.toLowerCase().trim() == badNames[i].trim()){
                        testFailed(testElement, currentElement, "Ambiguous link name is provided");
                    }
                }
            }

            // Find broken Links through sending an HTTP request and getting status of the page
            // Solution taken from http://stackoverflow.com/questions/1591401/javascript-jquery-check-broken-links
            
            try{
                var http = new XMLHttpRequest();
                http.open('HEAD', href, false);
                http.send();
                testElement.status = http.status;
            }
            catch(err){
                if (http && http.status && http.statusText){
                    testFailed(testElement, currentElement, '"' + http.status + ": " + http.statusText + '"');
                } else {
                    testFailed(testElement, currentElement, "Failed to send request to the page");
                }                
            }

            // And then compare that status against the ones mentioned in the Broken Links array
            if (testElement.passed){
                for (var i = 0; i < brokenLinks.length; i++){
                    if (testElement.status == brokenLinks[i]) {
                        testFailed(testElement, currentElement, '"' + http.status + ": " + http.statusText + '"');
                    }    
                }   
            }
            

            // Method to find duplicated Links
            // HOWEVER, DELETE THE SECOND IF CHECK IF YOU WANT TO HAVE MULTIPLE MISTAKES BEING MENTIONED IN THE STATISTICS
            if (testElement.passed == true){

                if (testElements.length > 0){
                    testElements.forEach(function(link) {
                        if(text.toLowerCase().trim() == link.text.toLowerCase().trim()){
                            // Uncomment this if you want all the duplicated text being highlighted
                            // link.passed = "warning"; 
                            testWarned(testElement, currentElement, "Duplicated Link Name");
                        }
                    });
                }

                // Find Links that are presented in URL forms, taken from http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
                var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                
                if(pattern.test(text)) {
                    testWarned(testElement, currentElement, "Text is Written as a URL, check for meaning");
                }
            }

            testElements.push(testElement);
        });
        
        sendResponseToPopUp();
    }

    
    /*  
        Test Number 4
        performed by simply Disabling/Enabling all "LINK" tags from the webpageusing jQuery.
        "link" tags are used to include External or Internal CSS onto a webpage
        in the similar manner that "script" allows to include JavaScript files/code
    */
    if (request.action == 'PageCSS') {
        if (request.disable){
            $('link[rel="stylesheet"]').attr('disabled', 'disabled');
        }
        if (!request.disable){
            $('link[rel="stylesheet"]').removeAttr('disabled');
        }
    }


    /*  
        Test Number 5
    */
    if (request.action == 'PageTables') {

        $('table').each(function(index) {
            initialVariablesForEachTest($(this), index);

            var thead = $(this).children('thead');


            if(thead.length <= 0) {
                var th = $(this).find('tr th');

                if (th.length){
                    testWarned(testElement, currentElement, "Head cell provided, <th>, but no <thead>");
                } else {
                    testFailed(testElement, currentElement, "No table header: <th> and <thead>");
                }
            } else {
                var th = $(this).find('th');

                if (th.length){
                    $(this).addClass("testSuccess");
                } else {
                    testFailed(testElement, currentElement, "Header provided, <thead>, but no <th>");
                }
            }

            testElements.push(testElement);
        });
        
        sendResponseToPopUp();
    }
});

// Storing the data in Chrome.Storage.Sync

// chrome.storage.sync.set({'value': imgCount}, function() {
//     chrome.storage.sync.get("value", function(data) {
//         console.log("data", data.value);
//     });
// });