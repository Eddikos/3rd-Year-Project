//alert('content script loaded');

// Every page (in browser) is going to have this CONTENT script

// First thng that it does is Adds a LISTENET and starts listen to upcoming messages
chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {

    debugger;

    // And it will listen specifically for this PageInfo action
    if (request.action == 'PageInfo') {
        var pageInfos = [];
        
        // Normal jQuery stuff
        $('a').each(function() {
            var pageInfo = {};
            
            var href = $(this).attr('href');

            if (href != null && href.indexOf("http") == 0)
            {
                //only add urls that start with http
                pageInfo.url = href
                // Create and Array of URLs basically :)
                pageInfos.push(pageInfo);
            }
        });
        
        $('img').each(function() {
            var pageInfo = {};
            
            var alt = $(this).attr('alt');

            if (alt != null)
            {
                //only add urls that start with http
                pageInfo.url = alt
                // Create and Array of URLs basically :)
                pageInfos.push(pageInfo);
            }
        });
        
        // Send response Back to POPUP.js
        sendResponse(pageInfos);
    }
});