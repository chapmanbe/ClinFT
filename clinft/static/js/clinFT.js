//Garrett Cole
//University of Utah - BMI 6300 final project

var ua = window.navigator.userAgent.toLowerCase();
var isIE = !!ua.match(/msie|trident\/7|edge/);
var global_dx = []

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
        .replace(/\n$/g, '\n\n')// necessary for highlight/textarea alignment
        // replace reversed found term into reversed highlight class
        .reverse().replace(re, '>kram/<$&>"pitloot kram neerg"=ssalc kram<').reverse()
        .reverse().replace(re2, '>kram/<$&>"pitloot kram eulb"=ssalc kram<').reverse()
        .reverse().replace(re3, '>kram/<$&>"pitloot kram der"=ssalc kram<').reverse();
    return text;
}

document.addEventListener('DOMContentLoaded', function(event) {
    var event = document.createEvent("Event");
    event.initEvent('input', false, true);
    for (var i = 0; i < clinFTList.length; i++) {
        if (isIE){
            clinFTList[i].parentNode.getElementsByClassName('clinFT_highlights')[0].style.paddingRight = '2px';
        }
        clinFTList[i].dispatchEvent(event); // apply highlights to each clinFT instance when page loads
    }

    // Create the tooltip element
    var tt = document.createElement('div');
    tt.id = 'tooltip';
    document.body.appendChild(tt);
    // mouseout tooltip
    tt.addEventListener("mouseout", function(event){
        var e = event.toElement || event.relatedTarget;
        if (e.parentNode == this || e == this) {
            return;
        }
    this.style.visibility = "hidden";
    });

    //add the FHIR-returned condition list to the JS global_dx array
    var temp_global_dx = eval(document.getElementById('dxcode').innerHTML)
    for (var i = 0; i < temp_global_dx.length; i++){
        applyCode(temp_global_dx[i][0], temp_global_dx[i][1])
    }
});

// The highlights are behind the textarea, so chain the hover events
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
            //mouseout highlight
            if (tar != this) {
                document.getElementById('tooltip').style.visibility = "hidden";
            }
            tar.dispatchEvent(new Event('mousemove'));// Update this for IE compatibility (IE doesn't like "new Event" inline)
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
    var tooltip = document.getElementById('tooltip');
    if (theTextL in stterm_green) {
        tooltip.innerHTML = 'Discovered concept "' + stterm_green[theTextL][0] + '"<br>SNOMED: ' + stterm_green[theTextL][2] + '<br>ICD10: ' + stterm_green[theTextL][1];
        tooltip.innerHTML += '<button class="btn" onClick="applyCode(' + stterm_green[theTextL][2] + ',\''+ stterm_green[theTextL][0] +'\')">Apply codes</button>';
    }
    else if (theTextL in stterm_blue) {
        tooltip.innerHTML = 'Discovered concept "' + stterm_blue[theTextL][0] + '"<br>SNOMED: ' + stterm_blue[theTextL][2] + '<br>ICD10: ' + stterm_blue[theTextL][1];
        tooltip.innerHTML += '<button class="btn" onClick="applyCode(' + stterm_blue[theTextL][2] + ',\''+ stterm_blue[theTextL][0] +'\')">Apply codes</button>';
    }
    else {
        tooltip.innerHTML = 'Discovered concept "' + stterm_red[theTextL][0] + '"<br>SNOMED: ' + stterm_red[theTextL][2] + '<br>ICD10: ' + stterm_red[theTextL][1];
        tooltip.innerHTML += '<button class="btn" onClick="applyCode(' + stterm_red[theTextL][2] + ',\''+ stterm_red[theTextL][0] +'\')">Apply codes</button>';
    }
    
    hpos = highlight.getBoundingClientRect();
    tooltip.style.left = hpos.left-125+(hpos.width/2)+'px';// 125 = half tooltip width
    tooltip.style.top = hpos.top-90+window.scrollY+'px';// 90 = tooltip height
    tooltip.style.visibility = 'visible';
}

function applyCode(code, desc) {
    var flag = true;
    for (i=0;i<global_dx.length;i++) {
        if (global_dx[i][0] == code) {
            flag = false;
        }
    }
    if (flag == true){
        document.getElementById('dxcode').innerHTML = "";
        global_dx.push([code, desc]);
        temp_dx_text = "";
        for (var i=0;i<global_dx.length;i++) {
            temp_dx_text += global_dx[i][0] + ' : ' + global_dx[i][1] + ' <a style="color: #0000EE; cursor: pointer;" onClick="remove_dx(' + global_dx[i][0] + ')">x</a><br>';

        }
        document.getElementById('dxcode').innerHTML = temp_dx_text;
    } 
}

function remove_dx(dx) {
    for (var i=0;i<global_dx.length;i++) {
        if (global_dx[i][0] == dx){
            global_dx.splice(i,1);
        }
    }
    document.getElementById('dxcode').innerHTML = "";
    temp_dx_text = "";
        for (var i=0;i<global_dx.length;i++) {
            temp_dx_text += global_dx[i][0] + ' : ' + global_dx[i][1] + ' <a style="color: #0000EE; cursor: pointer;" onClick="remove_dx(' + global_dx[i][0] + ')">x</a><br>';

        }
        document.getElementById('dxcode').innerHTML = temp_dx_text;
}

// term_literal : [standard_name, ICD10_code, SNOMED_code]
var stterm_green = {
    "esophageal varices" : ["Esophageal Varices", "I85.0", "308129003"],
    "esophageal varix" : ["Esophageal Varices", "I85.0", "308129003"],
    "oesophageal varices" : ["Esophageal Varices", "I85.0", "308129003"],
    "oesophageal varix" : ["Esophageal Varices", "I85.0", "308129003"],
    "bleeding esophageal varices" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "bleeding esophageal varix" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "bleeding oesophageal varices" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "bleeding oesophageal varix" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "oesophageal varix with bleeding" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "esophageal varix with bleeding" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "esophageal varices w bleeding" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "oesophageal varices w bleeding" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "oesophageal varix with blood" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "esophageal varices with blood" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "oesophageal varix w blood" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "esophageal varices w blood" : ["Bleeding Esophageal Varices", "I85.01", "17709002"],
    "oesophageal varix without bleeding" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"],
    "esophageal varices without bleeding" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"],
    "oesophageal varix without blood" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"],
    "esophageal varices without blood" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"],
    "oesophageal varix w/o bleeding" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"],
    "esophageal varices w/o bleeding" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"],
    "oesophageal varix w/o blood" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"],
    "esophageal varices w/o blood" : ["Esophageal Varices Without Bleeding", "I85.00", "195476002"]
    /*,
    "downhill oesophageal varix" : ["Downhill Esophageal Varices", "I85.00", "721160006"],
    "downhill oesophageal varices" : ["Downhill Esophageal Varices", "I85.00", "721160006"],
    "downhill esophageal varices" : ["Downhill Esophageal Varices", "I85.00", "721160006"],
    "downhill esophageal varix" : ["Downhill Esophageal Varices", "I85.00", "721160006"],
    "solitary oesophageal varix" : ["Solitary Varix of Esophagus", "I85.00", "721206006"],
    "solitary oesophageal varices" : ["Solitary Varix of Esophagus", "I85.00", "721206006"],
    "solitary esophageal varices" : ["Solitary Varix of Esophagus", "I85.00", "721206006"],
    "solitary esophageal varix" : ["Solitary Varix of Esophagus", "I85.00", "721206006"].
    "solitary varix of oesophagus" : ["Solitary Varix of Esophagus", "I85.00", "721206006"],
    "solitary oesophageal varices" : ["Solitary Varix of Esophagus", "I85.00", "721206006"],
    "solitary esophageal varices" : ["Solitary Varix of Esophagus", "I85.00", "721206006"],
    "solitary esophageal varix" : ["Solitary Varix of Esophagus", "I85.00", "721206006"]
*/
};
var stterm_blue = {
    "dysphagia" : ["Dysphagia", "R13.1", "40739000"],
    "gastritis" : ["Gastritis", "K29", "4556007"]
};
var stterm_red = {
    "heartburn" : ["Heartburn", "R12", "722876002"]
};

//Javascript doesn't support RegEx negative look-behinds, which could be used to detect negation terms before a word. However, it
//does support negative look-aheads, so if we reverse the search string and regular expression, we can simulate negative look-behinds.
//replaced:
var re = new RegExp((")"+Object.keys(stterm_green).join("|")+"(").reverse()+"(?! evah ton seod| on| ton)","ig");
var re2 = new RegExp((")"+Object.keys(stterm_blue).join("|")+"(").reverse()+"(?! evah ton seod| on| ton)","ig");
var re3 = new RegExp((")"+Object.keys(stterm_red).join("|")+"(").reverse()+"(?! evah ton seod| on| ton)","ig");

function updateFhir(){
    alert("Saved successfully")
}
