//alert('content script loaded');

// Every page (in browser) is going to have this CONTENT script

// First thng that it does is Adds a LISTENET and starts listen to upcoming messages
chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {

    //debugger;
        
    // And it will listen specifically for this PageLinks action
    if (request.action == 'PageLinks') {
        var links = [];
        var numberOfLinks = 0;

        // Loop through all links found on the website
        $('a').each(function() {
            numberOfLinks++;

            var pageLink = {};            
            var href = $(this).attr('href');

            if (href != null && href.indexOf("http") == 0) {
                //only add links that start with http
                pageLink.link = href;
                // Create and Array of links basically :)
                links.push(pageLink);
            }
        });
        
        // Send response Back to POPUP.js
        sendResponse(links);
    }



    if (request.action == 'PageImages') {
        var imgs = [];
        var numberOfImages = 0;
        var numberOfImagesWithAlt = 0;
        var numberOfImagesWithEmptyAlt = 0
        var imgCount = 0;
        
        // Loop through all images on the website
        $('img').each(function(index) {
            numberOfImages++;
            
            var img = {};
            var alt = $(this).attr('alt');
          
            $(this).addClass("blue"+ index);

            if (alt != null) {
                // Store Image's Alt text and it's index (number) on the page
                img.alt = alt;
                img.index = index;
                // Create and Array of URLs basically :)
                imgs.push(img);
                imgCount++;
            }
            if (alt == null){
                numberOfImagesWithEmptyAlt++;
            }
        });

        // Send response Back to POPUP.js
        sendResponse(imgs);
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