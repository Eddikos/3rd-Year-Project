//alert('content script loaded');

// Every page (in browser) is going to have this CONTENT script

// First thng that it does is Adds a LISTENET and starts listen to upcoming messages
chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {

    //debugger; 

    // Remove all CSS classes for each test to start from scratch
    if(request && request.action != 'HighlightImage'){
        $('.highlightItems').removeClass('highlightItems');
        $('.testDanger').removeClass('testDanger');
        $('.testSuccess').removeClass('testSuccess');
        $('.testWarning').removeClass('testWarning');
        $('*[class*="blue"]').removeClass (function (index, css) {
            return (css.match (/(^|\s)blue\S+/g) || []).join(' ');
        });
    }

    /*  
        Test Number 1
    */
    if (request.action == 'PageForms') {
        var formData = {};
        var formElements = [];
        var numberOfForms = 0;
        var numberOfFormElements = 0;
        var notLabeledFields = 0;
        var i = 0
        
        // Count and Highlight all existing forms
        $('form').each(function(index) {
            numberOfForms++;
            $(this).addClass("highlightItems");
        });

        // Check for labels on most common inputs fields: text, radio, checkbox, textarea, etc.
        $("input[type!='hidden'], textarea, select").each(function(index) {
            i = index;
            numberOfFormElements++;
            var formElement = {}
            var type = $(this).attr('type');
            var currentFormElement = $(this);

            formElement.passed = true;
            formElement.index = index;
            
            $(this).addClass("blue"+ index);

            // Check whether Input field of IMAGE type, has an ALT attribute
            if (type == "image"){
                var alt = $(this).attr('alt');
                
                if (alt == null || (alt != null && alt.trim() == "")) {
                    testFailed(formElement, currentFormElement, "No ALT tag on Input of Image Type");
                }

            // Check whether the buttons have been provided with VALUES
            } else if (type == "submit" || type == "reset" || type == "button"){
                var value = $(this).attr('value');
                
                if (value == null || (value != null && value.trim() == "")) {
                    testFailed(formElement, currentFormElement, "No Value provided for Button");
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
                    testFailed(formElement, currentFormElement, "An Input Field is not Labeled");

                    // Radio and CheckBox are treated separately because Their CSS can't be adjusted easily
                    if (type == "radio" || type == "checkbox"){
                        $(this).wrap( "<span class='testDanger'></span>" );
                    }
                }
            }

            formElements.push(formElement);
        });

        $('button').each(function(index) {
            numberOfFormElements++;
            var text = $(this).text();
            var formElement = {}

            formElement.passed = true;
            formElement.index = i + index + 1;

            $(this).addClass("blue"+ formElement.index);

            if (text == null || (text != null && text.trim() == "")) {
                testFailed(formElement, $(this), "Button Doesn't contain text");
            }

            formElements.push(formElement);
        });

        function testFailed(formElement, currentFormElement, failureMessage){
            notLabeledFields++;
            formElement.passed = false;
            currentFormElement.addClass("testDanger");
            formElement.reason = failureMessage;
        }

        formData.formElements = formElements;
        formData.numberOfForms = numberOfForms;
        formData.notLabeledFields = notLabeledFields;
        formData.numberOfFormElements = numberOfFormElements;

        // Send response back to POPUP.js
        sendResponse(formData);
    }


    /*  
        Test Number 2
    */
    if (request.action == 'PageImages') {
        var imgData = {};
        var imgs = [];
        var numberOfImages = 0;
        var numberOfImagesWithAlt = 0;
        var numberOfImagesWithEmptyAlt = 0
        
        // Loop through all images on the website
        $('img').each(function(index) {
            numberOfImages++;
            
            var img = {};
            var alt = $(this).attr('alt');
          
            $(this).addClass("blue"+ index);

            // Store Image's Alt text and it's index (number) on the page
            img.alt = alt;
            img.index = index;
            img.passed = true;

            if (alt != null) {
                numberOfImagesWithAlt++;

                if (alt.trim() == ""){
                    numberOfImagesWithEmptyAlt++;
                    img.alt = " ";
                    img.passed = false;
                    $(this).addClass("testDanger");
                    img.reason = "An empty ALT text is being provided";
                }
            } else {
                img.passed = false;
                $(this).addClass("testDanger");
                img.reason = "No ALT text has been provided";
            }

            if (img.passed){
                $(this).addClass("testSuccess");
            }
            // Create and Array of URLs basically :)
            imgs.push(img);
        });

        imgData.imgs = imgs;
        imgData.numberOfImages = numberOfImages;
        imgData.numberOfImagesWithAlt = numberOfImagesWithAlt;
        imgData.numberOfImagesWithEmptyAlt = numberOfImagesWithEmptyAlt;
        // Send response Back to POPUP.js
        sendResponse(imgData);
    }


    /*  
        Test Number 3
    */
    if (request.action == 'PageLinks') {
        var badNames = ["click here!", "click here", "click", "here", "share", "list", "read more", "read", "more", "download", "click for details", "info", "link", "link to", "jump", "jump to", "visit", "watch now", "select"]
        var brokenLinks = [401, 403, 404, 410, 500, 12002, 12007, 12029, 12031];
        var linkData = {};
        var links = [];
        var numberOfLinks = 0;
        var numberOfBadLinks = 0;
        var numberOfDuplicatedLinks = 0;

        // Loop through all links found on the website, and get the Index of the Link 
        $('a').each(function(index) {
            numberOfLinks++;

            $(this).addClass("testSuccess");
            $(this).addClass("blue"+ index);

            var currentLink = $(this);
            var pageLink = {};            
            var href = $(this).attr('href');
            var text = $(this).text();
            pageLink.index = index;
            pageLink.link = href;
            pageLink.text = text;
            pageLink.passed = true;
            
            if (href != null) {
                // Links with empty HREFs are mostly used to activate a JavaScript function
                if (href.trim() == "" || href.trim() == "#") {
                    testFailed("Link Contains an empty HREF attribute");
                }
            } else {
                testFailed("Link Doesn't contain an HREF attribute");
            }
            if (text == null || (text != null && text.trim() == "")){
               testFailed("Link Doesn't contain Text");

            } else {
                for (var i = 0; i < badNames.length; i++){
                    if (text.toLowerCase().trim() == badNames[i].trim()){
                        testFailed("Ambiguous link name is provided");
                    }
                }
            }

            // Find broken Links through sending an HTTP request and getting status of the page
            // Solution taken from http://stackoverflow.com/questions/1591401/javascript-jquery-check-broken-links
            var http = new XMLHttpRequest();
            http.open('HEAD', href, false);
            http.send();
            pageLink.status = http.status;
            
            // And then compare that status against the ones mentioned in the Broken Links array
            for (var i = 0; i < brokenLinks.length; i++){
                if (pageLink.status == brokenLinks[i]) {
                    testFailed('"' + http.status + ": " + http.statusText + '"');
                }    
            }

            // Method to find duplicated Links
            // HOWEVER, DELETE THE SECOND IF CHECK IF YOU WANT TO HAVE MULTIPLE MISTAKES BEING MENTIONED IN THE STATISTICS
            if (links.length > 0 && pageLink.passed == true){
                links.forEach(function(link) {
                    if(text.toLowerCase().trim() == link.text.toLowerCase().trim()){
                        numberOfDuplicatedLinks++;
                        pageLink.passed = "warning";
                        //link.passed = "warning";
                        pageLink.reason = "Duplicated Link Name";
                        currentLink.addClass("testWarning");
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
                pageLink.passed = "warning";
                pageLink.reason = "Text is Written as a URL, check for meaning";
                currentLink.addClass("testWarning");
            }

            function testFailed(failureMessage){
                numberOfBadLinks++;
                pageLink.passed = false;
                pageLink.reason = failureMessage;
                currentLink.addClass("testDanger");
            }

            links.push(pageLink);
        });
        
        linkData.links = links;
        linkData.numberOfLinks = numberOfLinks;
        linkData.numberOfBadLinks = numberOfBadLinks;
        linkData.numberOfDuplicatedLinks = numberOfDuplicatedLinks;
        // Send response Back to POPUP.js
        sendResponse(linkData);
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
        var tableData = {};
        var tables = [];
        var numberOfTables = 0;
        var numberOfDangerTables = 0;
        var numberOfWarningTables = 0;

        $('table').each(function(index) {
            numberOfTables++;

            $(this).addClass("highlightItems blue"+ index);

            var pageTable = {};            

            pageTable.passed = true;
            pageTable.index = index;

            var thead = $(this).children('thead');

            if(thead.length <= 0) {
                var th = $(this).find('tr th');

                if (th.length){
                    numberOfWarningTables++;
                    pageTable.passed = "warning";
                    pageTable.reason = "Head cell provided, <th>, but no <thead>"
                    $(this).addClass("testWarning");
                } else {
                    numberOfDangerTables++;
                    pageTable.passed = false;
                    pageTable.reason = "No table header: <th> and <thead>"
                    $(this).addClass("testDanger");
                }
            } else {
                var th = $(this).find('th');

                if (th.length){
                    $(this).addClass("testSuccess");
                } else {
                    numberOfDangerTables++;
                    pageTable.passed = false;
                    pageTable.reason = "Header provided, <thead>, but no <th>";
                    $(this).addClass("testDanger");
                }
            }
            
            tables.push(pageTable);
        });
        
        tableData.tables = tables;
        tableData.numberOfTables = numberOfTables;
        tableData.numberOfDangerTables = numberOfDangerTables;
        tableData.numberOfWarningTables = numberOfWarningTables;
        // Send response Back to POPUP.js
        sendResponse(tableData);
    }

    // Request that may come from the Doogle Extension in order to highlight Hovered image
    if (request.action == 'HighlightImage') {
        if (request.approved){
            $('.blue' + request.imageIndex).addClass('black');
        }
        if (!request.approved){
            $('.black').removeClass('black');
        }
    }

});
    // Storing the data in Chrome.Storage.Sync

    // chrome.storage.sync.set({'value': imgCount}, function() {
    //     chrome.storage.sync.get("value", function(data) {
    //         console.log("data", data.value);
    //     });
    // });