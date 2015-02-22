//alert('content script loaded');

// Every page (in browser) is going to have this CONTENT script

// First thng that it does is Adds a LISTENET and starts listen to upcoming messages
chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {

    //debugger;

    if(request){
        $('.highlightItems').removeClass('highlightItems');
    }


    /*  
        Test Number 1
    */
    if (request.action == 'PageForms') {
        var formData = {};
        var numberOfForms = 0;
        var numberOfInputFields = 0;
        var notLabeledFields = 0;

        // Count and Highlight all existing forms
        $('form').each(function(index) {
            numberOfForms++;
            $(this).addClass("highlightItems");
        });

        // Check for labels on most common inputs fields: text, radio, checkbox, textarea, etc.
        $("input[type!='hidden'], textarea, select").each(function(index) {
            numberOfInputFields++;

            var type = $(this).attr('type');

            // Check whether Input field of IMAGE type, has an ALT attribute
            if (type == "image"){
                var alt = $(this).attr('alt');
                
                if (alt == null || (alt != null && alt.trim() == "")) {
                    notLabeledFields++;
                }

            // Check whether the buttons have been provided with VALUES
            } else if (type == "submit" || type == "reset" || type == "button"){
                var value = $(this).attr('value');
                
                if (value == null || (value != null && value.trim() == "")) {
                    notLabeledFields++;
                }

            // Check all other Input fields, such as Radio, Text, Checkbox; for LABELS
            } else {
                // Some Labels wil have FOR set...
                var label = $('label[for="'+$(this).attr('id')+'"]');

                // However, some labels will be the PARENT of the associated input field
                if(label.length <= 0) {
                    var parentElem = $(this).parent(),
                        parentTagName = parentElem.get(0).tagName.toLowerCase();

                    if(parentTagName == "label") {
                        label = parentElem;
                    }
                }
                if(label.length <=0){
                    notLabeledFields++;
                }
            }
        });

        $('button').each(function(index) {
            var text = $(this).text();

            if (text == null || (text != null && text.trim() == "")) {
                notLabeledFields++;
            }
        });

        formData.numberOfForms = numberOfForms;
        formData.numberOfInputFields = numberOfInputFields;
        formData.notLabeledFields = notLabeledFields;

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
        var imgCount = 0;
        
        // Loop through all images on the website
        $('img').each(function(index) {
            $(this).addClass("highlightItems");
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
                }
            } else {
                img.passed = false;
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
        var badNames = ["click here!", "click here", "click", "here", "share", "list", "read more", "read", "more", "download", "click for details", "info"]
        var brokenLinks = [401, 403, 404, 410, 500, 12002, 12007, 12029, 12031];
        var linkData = {};
        var links = [];
        var numberOfLinks = 0;
        var numberOfBadLinks = 0;
        var numberOfDuplicatedLinks = 0;

        // Loop through all links found on the website, and get the Index of the Link 
        $('a').each(function(index) {
            $(this).addClass("highlightItems");
            numberOfLinks++;

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
                    numberOfBadLinks++;
                    pageLink.passed = false;
                    pageLink.reason = "Link Contains an empty HREF attribute";
                }
            } else {
                numberOfBadLinks++;
                pageLink.passed = false;
                pageLink.reason = "Link Doesn't contain an HREF attribute";
            }
            if (text == null || (text != null && text.trim() == "")){
                numberOfBadLinks++;
                pageLink.passed = false;
                pageLink.reason = "Link Doesn't contain Text";
            } else {
                for (var i = 0; i < badNames.length; i++){
                    if (text.toLowerCase().trim() == badNames[i].trim()){
                        numberOfBadLinks++;
                        pageLink.passed = false;
                        pageLink.reason = "Ambiguous link name is provided";
                    }
                }
            }

            // Find broken Links through sending an HTTP request and getting status of the page
            var http = new XMLHttpRequest();
            http.open('HEAD', href, false);
            http.send();
            pageLink.status = http.status;
            
            // And then compare that status against the ones mentioned in the Broken Links array
            for (var i = 0; i < brokenLinks.length; i++){
                if (pageLink.status == brokenLinks[i]) {
                    numberOfBadLinks++;
                    pageLink.passed = false;
                    pageLink.reason = '"' + http.status + ": " + http.statusText + '"';
                }    
            }

            // HOWEVER, DELETE THE SECOND IF CHECK IF YOU WANT TO HAVE MULTIPLE MISTAKES BEING MENTIONED IN THE STATISTICS
            if (links.length > 0 && pageLink.passed == true){
                links.forEach(function(link) {
                    if(text.toLowerCase().trim() == link.text.toLowerCase().trim()){
                        numberOfDuplicatedLinks++;
                        pageLink.passed = "warning";
                        link.passed = "warning";
                        pageLink.reason = "Duplicated Link Name";
                    }
                });
            }


            links.push(pageLink);
        });
        
        linkData.links = links;
        linkData.numberOfDuplicatedLinks = numberOfDuplicatedLinks;
        linkData.numberOfLinks = numberOfLinks;
        linkData.numberOfBadLinks = numberOfBadLinks;
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
        $('table').each(function(index) {
            $(this).addClass("highlightItems");
        });
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


    // // Storing the data in Chrome.Storage.Sync

    // chrome.storage.sync.set({'value': imgCount}, function() {
    //     chrome.storage.sync.get("value", function(data) {
    //         console.log("data", data.value);
    //     });
    // });