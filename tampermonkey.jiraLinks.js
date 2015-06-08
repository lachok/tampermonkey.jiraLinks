// ==UserScript==
// @name         Jira Links
// @namespace    http://github.com/lachok
// @version      0.1
// @description  Find jira issue IDs on the page and create links for them
// @author       You
// @match        https://mail.google.com/*
// @grant        none
// ==/UserScript==

(function() {

    var options = {
        jiraIssuePrefix: 'JPO',
        jiraBrowseUrl: 'https://jira.atlassian.com/browse'
    };
        
    var jiraIssueWithSpaceRegex = new RegExp('^' + options.jiraIssuePrefix + ' ', 'i');
    var jiraIssueRegex = new RegExp('^' + options.jiraIssuePrefix + '-\\d{1,5}', 'i');
    
    function textNodesUnder(el){
        var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
        while(n=walk.nextNode()) a.push(n);
        return a;
    }

    function wrapMatchesInNode(textNode) {

        var temp = document.createElement('div');

        textNode.data = textNode.data.replace(jiraIssueWithSpaceRegex, options.jiraIssuePrefix + '-');

        temp.innerHTML = textNode.data.replace(jiraIssueRegex, '<a href="' + options.jiraBrowseUrl + '/$&">$&</a>');

        // temp.innerHTML is now:
        // "n    This order's reference number is <a href="/order/RF83297">RF83297</a>.n"
        // |_______________________________________|__________________________________|___|
        //                     |                                      |                 |
        //                 TEXT NODE                             ELEMENT NODE       TEXT NODE

        // Extract produced nodes and insert them
        // before original textNode:
        while (temp.firstChild) {
            console.log(temp.firstChild.nodeType);
            textNode.parentNode.insertBefore(temp.firstChild, textNode);
        }
        // Logged: 3,1,3

        // Remove original text-node:
        textNode.parentNode.removeChild(textNode);

    }


    function doc_keyUp(e) {
        if (e.ctrlKey && e.keyCode == 73) {
            var textNodes = textNodesUnder(document);

            for(var i = 0; i < textNodes.length; i++) {
                if (/^EV(-| )\d{3,5}/.test(textNodes[i].wholeText)) {
                    //textNodes[i].parentElement.style.color = '#ff0000';
                    wrapMatchesInNode(textNodes[i]);
                }
            }
        }
    }
    // register the handler
    document.addEventListener('keyup', doc_keyUp, false);
})();

