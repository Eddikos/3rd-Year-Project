//alert('content script loaded');

// Every page (in browser) is going to have this CONTENT script

// First thng that it does is Adds a LISTENET and starts listen to upcoming messages
chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {

    //debugger;
        
        

    // And it will listen specifically for this PageInfo action
    if (request.action == 'PageInfo') {
        var urls = [];
        var numberOfLinks = 0;
        // Normal jQuery stuff
        $('a').each(function() {
            numberOfLinks++;

            var pageLink = {};            

            var href = $(this).attr('href');

            if (href != null && href.indexOf("http") == 0)
            {
                //only add urls that start with http
                pageLink.url = href;
                // Create and Array of URLs basically :)

                console.log(pageLink);
                urls.push(pageLink);
            }
        });
        
        console.log(urls);




        // // Storing the data in Chrome.Storage.Sync
        // console.log(imgCount);

        // chrome.storage.sync.set({'value': imgCount}, function() {
        //     chrome.storage.sync.get("value", function(data) {
        //         console.log("data", data.value);
        //     });
        // });

        // Send response Back to POPUP.js
        sendResponse(urls);
    }

    if (request.action == 'PageImages') {
        var imgs = [];
        
        var numberOfImages = 0;
        var numberOfImagesWithAlt = 0;
        var numberOfImagesWithEmptyAlt = 0
        

        var imgCount = 0;
        $('img').each(function(index) {
            numberOfImages++;

            var pageInfo = {};
            
            var alt = $(this).attr('alt');
          
            $(this).addClass("blue");
            $(this).attr("ng-class","myclass");
            $(this).addClass("" + index + "");

            console.log($(this));

            if (alt != null)
            {
                //only add urls that start with http
                pageInfo.alt = alt
                // Create and Array of URLs basically :)
                imgs.push(pageInfo);
                imgCount++;
            }
            if (alt == null){
                numberOfImagesWithEmptyAlt++;
            }
        });

        
        console.log(imgs);

        sendResponse(imgs);
    }
});