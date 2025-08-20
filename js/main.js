/*

    Yeah... so I need to clean this code up... A lot.

    This started out as a sketch and then metastized with lots of exceptions
    due to working with Aramaic rtl text.

    I will eventually clean it up.

*/

/* Universal Helper Functions */

//Query Selector
var q = document.querySelector.bind(document);

//Query Selector All
var qa = document.querySelectorAll.bind(document);

//Value from query selector
var qval = (selector) => {
    let elem = q(selector);
        if (elem == null || elem == undefined) return null;

    let name = elem.tagName.toLowerCase();

    if (name == "select")
        return q(selector).children[q(selector).selectedIndex].value;

    if (["input","textarea","button"].includes(name))
        return elem.value;

    return elem.innerHTML;
}

//Event Listener
var e = (query,event,func) => {
    if (query === window) {
        window.addEventListener(event,func);
        return;
    }
    let elements = qa(query);
    for (var i=0; i<elements.length; i++)
        elements[i].addEventListener(event,func);
};

//Sleep
var sleep = function(ms) {
    return new Promise((resolve, reject) => {
        if (q(`#animations`).value == "false") resolve();
        else setTimeout(resolve, ms);
    });
}

//GET Variables
var GET={};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(a,name,value){GET[name]=value;});

/* On to the playground! */

//Get the lesson file & section
let lessonFile = GET['lesson'] ?? 'lessons/lesson-01.md';
let sectionNum = GET['section'] ?? 1;
let scoreIndex = lessonFile+'_'+sectionNum; console.log("Score Index:",scoreIndex)

//Get reference to the playground div
let playground = q('#playground');

//Fetch the lesson
let lesson = await fetch(lessonFile);

if (!lesson.ok) {
    alert('Bad lesson file.');
    throw new Error(`Response status: ${response.status}`); //Should catch this somehow later
}

//Set score
let score = localStorage.getItem(scoreIndex);
if (score == null) {
    localStorage.setItem(scoreIndex,0);
    score = 0;
}
q('#score').innerHTML = score;

//Parse lesson
lesson = await lesson.text();
lesson = lesson.split('\n'); //console.log(lesson);

let title = "";
let section = [];
let type = "matching";

for (let l in lesson) {
    lesson[l] = lesson[l].trim();

    if (lesson[l] == "") continue;

    let [prefix, ...data] = lesson[l].split(' ')
    data = data.join(' ');

    //Lesson's name
    if (prefix == "#") {
        title = data;
    }
    //Section
    else if (prefix == "##") {
        //Add the new section
        section.push({
            "title":data,
            "exercises":[],
            "distractions":{
                l1:{},
                l2:{}
            }
        });
    }
    //Type
    else if (prefix == "###") {
        type = data;
        if (!section[section.length-1].distractions.l1?.[data]) {
            section[section.length-1].distractions.l1[data] = [];
            section[section.length-1].distractions.l2[data] = [];
        }
    }
    //Element
    else if (prefix == "-") {

        //Split off parts
        let [lang1, ...lang2] = data.split("==");
            lang2 = lang2.join('==').trim();
            lang1 = lang1.trim();

        //Add in exercise
        section[section.length-1].exercises.push({
            "type":type,
            "l1":lang1,
            "l2":lang2
        });

        //Add in distractions
        if (type == "sentences") { //If sentences, split up by word
            lang1 = lang1.split(' ');
            lang2 = lang2.replace(/\./g, "").split(' '); //remove periods from english
            section[section.length-1].distractions.l1[type].push(...lang1);
            section[section.length-1].distractions.l2[type].push(...lang2);
        }
        else {
            section[section.length-1].distractions.l1[type].push(lang1);
            section[section.length-1].distractions.l2[type].push(lang2);
        }
    }
}

//Post-processing
for (var s in section) {
    //Clean distraction pools down to uniques
    for (var t in section[s].distractions.l1)
        section[s].distractions.l1[t] = [...new Set(section[s].distractions.l1[t])];
    for (var t in section[s].distractions.l2)
        section[s].distractions.l2[t] = [...new Set(section[s].distractions.l2[t])];
}

let rand = (n) => Math.floor(Math.random()*n);

let langs = {
    'l1':'Aramaic',
    'l2':'English'
};

//Check if section exists
if (section[sectionNum-1] == null) {
    alert('Bad section number.');
    throw new Error(`Bad section number.`); //Should catch this somehow later
}

//Load up
let sec = section[sectionNum-1];
let ex = sec.exercises[rand(sec.exercises.length)];
let from = 'l1', to = 'l2';
if (rand(2)) { from = 'l2'; to = 'l1'; }
let distractions = sec.distractions[to][ex.type].sort(() => Math.random() - 0.5);

console.log('Type:',ex.type);
console.log('From:',langs[from], '→' ,langs[to]);
console.log('Exercise:',ex[from]);
if (type == "sentences") ex[to] = ex[to].split(' ');
console.log('Answer:', ex[to]);
console.log('Distractions:', distractions);

let formattedTo = ex[to].join(" ");

if (from == "l1") {
    ex[from] = `<gal>${ex[from].split("").reverse().join("")}</gal>`;
}
else {
    formattedTo = `<gal>${formattedTo.split("").reverse().join("")}</gal>`;
    for (var d in distractions) {
        distractions[d] = `<gal>${distractions[d].split("").reverse().join("")}</gal>`;
    }
}

playground.innerHTML += `<h2>${ex[from]}</h2>`;
playground.innerHTML += `<div id="landing"></div>`;
playground.innerHTML += `<small>Translate the above ${langs[from]} to ${langs[to]}...</small>`;
playground.innerHTML += `<ul id="possibilities"><li>${sec.distractions[to][ex.type].join('</li><li>')}</li></ul>`;
playground.innerHTML += `<div id="check" class="button">Check Answer</div>`;
playground.innerHTML += `<div id="answer">${formattedTo}</div>`;

// Attach events
e('#check','click',function (e) {

    //If the answer has been revealed, refresh
    if (this.innerHTML == "Next Exercise") {
        location.reload();
        return;
    }

    //Otherwise fade in answer and switch to next state
    q('#answer').style.opacity = '1';
    this.style.fontWeight = "bold";
    this.innerHTML = 'Next Exercise';

    //Then lock out the old controls
    q('#landing').style.opacity = ".5";
    q('#landing').style.pointerEvents = "none";
    q('#possibilities').style.opacity = ".5";
    q('#possibilities').style.pointerEvents = "none";

    //Check to see if the answer is correct

    //Get their work
    let landing = qa('#landing li');
    let theirAnswer = [];
    for (var i=0; i<landing.length; i++) {
        theirAnswer.push(landing[i].innerText);
    }

    //Get the correct answer
    let correctAnswer = ex[to].join(' ');

    //If it's an Aramaic answer, flip it
    if (to == 'l1') {
        theirAnswer.reverse();
        for (var a in theirAnswer) theirAnswer[a] = theirAnswer[a].split('').reverse().join('');
        theirAnswer = theirAnswer.join(' ');
    }
    //If it's English remove punctuation from the answer entirely
    else {
        correctAnswer = correctAnswer.replace(/\./g, "");
        theirAnswer = theirAnswer.join(' ').replace(/\./g, "");
    }

    //Print comparison to console
    console.log('Your Answer:',theirAnswer, "Correct Answer:",correctAnswer);
    
    //Check if they're the same.
    if (theirAnswer == correctAnswer) {
        q('#answer').style.backgroundColor = "rgb(128,255,128)";
        score++;
        localStorage.setItem(scoreIndex,score);
        q('#score').innerHTML = score;
    }
    else {
        q('#answer').style.backgroundColor = "rgb(225,128,128)";
    }

});
e('#possibilities li','click',function (e) { console.log(this,e);
    if (this.parentElement.id == "possibilities") {
        if (to == "l1")
            q('#landing').insertBefore(this, q('#landing').firstChild);
        else
            q('#landing').appendChild(this);
    }
    else {
        q('#possibilities').appendChild(this);
    }
});

e('#correct','click',function (e) {
    let reset = confirm("Do you want to reset your score?");
    if (reset) {
        //Reset local storage to zero for the lesson.
            localStorage.setItem(scoreIndex,0);
            score = 0;
            q('#score').innerHTML = score;
    }
});
e('#back','click',function (e) {
    window.location = 'index.html';
});