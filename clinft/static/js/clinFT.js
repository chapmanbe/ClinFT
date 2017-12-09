//Garrett Cole
//University of Utah - BMI 6300 project
//Textarea highlighting adapted from http://codersblock.com/blog/highlight-text-inside-a-textarea/

var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);

var clinFTList = document.getElementsByClassName('clinFT_textarea');

//add reverse() function to strings for RegEx negative look-behind simulation
String.prototype.reverse = function () {
    return this.split('').reverse().join('');
}

for (var i = 0; i < clinFTList.length; i++) {
    clinFTList[i].addEventListener('input', handleInput, false);
    clinFTList[i].addEventListener('scroll', handleScroll, false);
}

function handleInput() {
    var text = this.value;
    var highlightedText = applyHighlights(text);
    this.parentNode.getElementsByClassName('clinFT_highlights')[0].innerHTML = highlightedText;
    processMarks();
}

function handleScroll() {
    var scrollTop = this.scrollTop;
    this.parentNode.getElementsByClassName('clinFT_backdrop')[0].scrollTop = scrollTop;
}

function applyHighlights(text) {
    text = text
        .replace(/\n$/g, '\n\n');
    text = text
        // .replace(/[A-F].*?\b/g, '<mark class="green mark tooltip">$&</mark>')
        // .replace(/[G-P].*?\b/g, '<mark class="blue mark tooltip">$&</mark>')
        // .replace(/[Q-Z].*?\b/g, '<mark class="red mark tooltip">$&</mark>')
        .reverse().replace(re, '>kram/<$&>"pitloot kram neerg"=ssalc kram<').reverse()
        .reverse().replace(re2, '>kram/<$&>"pitloot kram der"=ssalc kram<').reverse();
        //.replace(re, '<mark class="green mark tooltip">$&</mark>')
    return text;
}

document.addEventListener('DOMContentLoaded', function(event) {
    var event = document.createEvent("Event");
    event.initEvent('input', false, true);
    for (var i = 0; i < clinFTList.length; i++) {
        if (isIE){
            clinFTList[i].parentNode.getElementsByClassName('clinFT_highlights')[0].style.paddingRight = '2px';
        }
        clinFTList[i].dispatchEvent(event); //apply highlights to each clinFT instance when page loads
    }

    //Create the tooltip element
    var tt = document.createElement('div');
    tt.id = 'tooltip';
    document.body.appendChild(tt);
    //mouseout tooltip
    tt.addEventListener("mouseout", function(event){
        var e = event.toElement || event.relatedTarget;
        if (e.parentNode == this || e == this) {
            return;
        }
    this.style.visibility = "hidden";
    });
});

//The highlights are behind the textarea, so chain the hover events - UPDATE THIS FOR IE COMPATIBILITY (IE doesn't like "new Event" inline)!!!
function processMarks(){
    var markList = document.getElementsByClassName('mark');
    for (var i = 0; i < markList.length; i++) {
        markList[i].addEventListener('mousemove', function(e){
            handleHover(this);
        }, false);
        markList[i].parentNode.parentNode.parentNode.getElementsByClassName('clinFT_textarea')[0].addEventListener('mousemove',function(ev){
            this.style.display = "none";
            var tar = document.elementFromPoint(ev.clientX, ev.clientY);
            this.style.display = "block";
            //if (!tar.classList.contains('mark') || !tar.classList.contains('btn')) {
            //if (tar != document.getElementById('tooltip') || tar != document.getElementById('tooltip').getElementsByClassName('btn')[0]) {
            //console.log(tar);
            //mouseout highlight
            if (tar != this) {
                document.getElementById('tooltip').style.visibility = "hidden";
            }
            tar.dispatchEvent(new Event('mousemove'));
        },false);
    }
}

document.addEventListener('click', function() {
    if (this != document.getElementById('tooltip')){
        document.getElementById('tooltip').style.visibility = "hidden";
    }
});

function handleHover(highlight) {
    var theText = highlight.innerHTML;
    var theTextL = theText.toLowerCase();
    //document.getElementById('examType').value = theText;
    var tooltip = document.getElementById('tooltip');
    if (theTextL in snomed){
        tooltip.innerHTML = 'Discovered SNOMED concept:<br>' + snomed[theTextL][0] + ' : ' + snomed[theTextL][1];
    }
    else {
        tooltip.innerHTML = 'Discovered SNOMED concept:<br>' + snomed_other[theTextL][0] + ' : ' + snomed_other[theTextL][1];
    }
    
    tooltip.innerHTML += '<button class="btn">Apply SNOMED code</button>';
    hpos = highlight.getBoundingClientRect();
    tooltip.style.left = hpos.left-125+(hpos.width/2)+'px'; //150 = half tooltip width
    tooltip.style.top = hpos.top-80+window.scrollY+'px'; //80 = tooltip height
    tooltip.style.visibility = 'visible';
}

var snomed = {
    "esophageal varicesx" : ["Esophageal Varices", "28670008"]
    //"dysphagia" : "40739000",
    //"heartburn" : "16331000"
};
var snomed_other = {
    "dysphagia" : ["Dysphagia", "40739000"]
}

//Javascript doesn't support RegEx negative look-behinds, which could be used to detect negation terms before a word. However, it
//does support negative look-aheads, so if we reverse the search string and regular expression, we can simulate negative look-behinds.
//Adapted from: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
//replaced:
//var re = new RegExp(Object.keys(snomed).join("|"), "ig");
//with:
var re = new RegExp((")"+Object.keys(snomed).join("|")+"(").reverse()+"(?! on| ton)","ig");
var re2 = new RegExp((")"+Object.keys(snomed_other).join("|")+"(").reverse()+"(?! on| ton)","ig");
//and reverse replacement string above as well.
