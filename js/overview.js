/*

    This is the overview page that goes over what's in a particular
    lesson as well as what audio files are ready to be used.

    This can be used to review the lesson, and to check if any
    additional sound files need to be recorded.

*/

/* Universal Helper Functions */
//Ok, time to spin these off into their own module... later.

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
        setTimeout(resolve, ms);
    });
}

//GET Variables
var GET={};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(a,name,value){GET[name]=value;});

/* Load in sounds */
let sound = [];
let successSound = new Audio('/sounds/success.mp3');
let failSound = new Audio('/sounds/fail.mp3');

function loadSound(name) {
    //Load the sound in if it doesn't exist
    if (sound[name]) return;
    try {
        sound[name] = new Audio('/sounds/'+name+'.mp3');
    }
    catch (error) {
        console.log(`Sound ${name} doesn't exist! Keeping quiet.`);
    }
}
function playSound(name) { console.log('Play: ' + name);
    //If it isn't loaded at all, load it
    try {
        if (sound[name] == undefined) {
            sound[name] = new Audio();
            sound[name].addEventListener("canplaythrough", (e) => {
                sound[name].play();
            });
            sound[name].src = '/sounds/'+name+'.mp3'
        }
        //Otherwise play it
        else {
            sound[name].play();
        }
    }
    catch (error) {
        console.log(`Sound ${name} doesn't exist! Keeping quiet.`);
    }
}
function stopSound() {
    //Stop all sounds
    for (var s in sound) {
        try {
            sound[s].stop();
        }
        catch (error) {
            console.log(`Sound ${s} doesn't exist! Keeping quiet.`);
        }
    }
}

/* On to the playground! */

//Get the lesson file & section
let lessonFile = GET['lesson'] ?? 'alphabet.md';
let sectionNum = GET['section'] ?? 1;
let scoreIndex = lessonFile+'_'+sectionNum; console.log("Score Index:",scoreIndex)

//Get reference to the overview div
let overview = q('#overview');

//Fetch the lesson
let lesson = await fetch('/lessons/'+lessonFile);

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

//Set star
let star = "";
if (score >= 10) star = "star";
if (score >= 25) star = "bronze";
if (score >= 50) star = "silver";
if (score >= 75) star = "gold";
if (score >= 100) star = "dove";
q('#score').className = star;

//Parse lesson
lesson = await lesson.text();
lesson = lesson.split('\n'); //console.log(lesson);

let title = "";
let section = [];
let type = "matching";

for (let l in lesson) {
    lesson[l] = lesson[l].trim();

    if (lesson[l] == "") continue;

    let [prefix, ...data] = lesson[l].split(' ');
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
                arc:{},
                eng:{}
            }
        });
    }
    //Type
    else if (prefix == "###") {
        type = data;
        if (!section[section.length-1].distractions.arc?.[data]) {
            section[section.length-1].distractions.arc[data] = [];
            section[section.length-1].distractions.eng[data] = [];
        }
    }
    //Element
    else if (prefix == "-") {

        //Split off parts
        let [arc, ...eng] = data.split("==");
            eng = eng.join('==').trim();
            arc = arc.trim();

        //Add in exercise
        section[section.length-1].exercises.push({
            "type":type,
            "arc":arc,
            "eng":eng
        });

        //Add in distractions
        if (type == "sentences") { //If sentences, split up by word
            arc = arc.split(' ');
            eng = eng.replace(/\./g, "").split(' '); //remove periods from english
            section[section.length-1].distractions.arc[type].push(...arc);
            section[section.length-1].distractions.eng[type].push(...eng);
        }
        else {
            section[section.length-1].distractions.arc[type].push(arc);
            section[section.length-1].distractions.eng[type].push(eng);
        }
    }
}

//Post-processing
for (var s in section) {
    //Clean distraction pools down to uniques
    for (var t in section[s].distractions.arc)
        section[s].distractions.arc[t] = [...new Set(section[s].distractions.arc[t])];
    for (var t in section[s].distractions.eng)
        section[s].distractions.eng[t] = [...new Set(section[s].distractions.eng[t])];
}

//Random number helper
let rand = (n) => Math.floor(Math.random()*n);

//Languages
let langs = {
    'arc':'Aramaic',
    'eng':'English'
};

//Check if section exists
if (section[sectionNum-1] == null) {
    alert('Bad section number.');
    throw new Error(`Bad section number.`); //Should catch this somehow later
}


//Stage the overview panel for the exercise
function stageExercise(exNum) {

    //Clear the playground
    overview.innerHTML = '';

    //Load up the section
    let sec = section[sectionNum-1]; console.log(sec);
    
    //Populate the playground
    overview.innerHTML += `<h2>Overview: ${sec["title"]}</h2>`;

    overview.innerHTML += `<h3>Exercises:</h3>`;

    let exerciseTable = `<table class="overviewTable">
    <tr>
    <th>Aramaic:</th>
    <th>&nbsp;</th>
    <th>&nbsp;</th>
    <th>English:</th>
    </tr>`;

    for (var e in sec.exercises) {
        let ex = sec.exercises[e];

        let rawAramaic = ex['arc'].replaceAll('_',' ');
        let aramaic = rawAramaic.replaceAll('_').split(' ');
            for (var a in aramaic) aramaic[a] = aramaic[a].split('').reverse().join('');
            aramaic = '<span>' + aramaic.join('</span> <span>') + '</span>';

        let english = ex['eng'].replaceAll('_',' ');

        exerciseTable += `<tr>
            <td class="arc">${aramaic}</td>
            <td><div class="soundCheck" data-sound="${rawAramaic}"></div></td>
            <td>→</td> 
            <td class="eng"><span>${english}</span></td>
        </tr>`;
    }

    exerciseTable += `</table>`;

    overview.innerHTML += exerciseTable;
    
    overview.innerHTML += `<h3>Vocabulary Sound Bank:</h3>`;


    //Vocabulary

    exerciseTable = `<table class="overviewTable">
    <tr>
    <th colspan="3">Aramaic:</th>
    </tr>`;

    console.log(sec.distractions.arc);
    let vocab = []; 
    for (var i in sec.distractions.arc) vocab.push(...sec.distractions.arc[i]);
    console.log(vocab);

    for (var v in vocab) {
        let ex = vocab[v];

        let rawAramaic = ex.replaceAll('_',' ');
        let aramaic = rawAramaic.replaceAll('_').split(' ');
            for (var a in aramaic) aramaic[a] = aramaic[a].split('').reverse().join('');
            aramaic = '<span>' + aramaic.join('</span> <span>') + '</span>';

        //let english = ex['eng'].replaceAll('_',' ');

        exerciseTable += `<tr>
            <td class="arc">${aramaic}</td>
            <td>→</td>
            <td><div class="soundCheck" data-sound="${rawAramaic}"></div></td>
        </tr>`;
    }

    exerciseTable += `</table>`;

    overview.innerHTML += exerciseTable;



    /*
    playground.innerHTML += `<div id="landing" class="${to}"></div>`;
    playground.innerHTML += `<small>Translate the above ${langs[from]} to ${langs[to]}...</small>`;
    playground.innerHTML += `<ul id="possibilities" class="${to}"><li>${possibilities.join('</li><li>')}</li></ul>`;
    playground.innerHTML += `<div id="check" class="button">Check Answer</div>`;
    playground.innerHTML += `<div id="answer" class="${to}">${correctAnswer}</div>`;
    */

    //Attach events

    qa('.soundCheck').forEach((item) => {
        try {
            item.innerHTML = '🔇';
            let soundFile = '/sounds/'+item.dataset.sound+'.mp3';
            let sound = new Audio();
            sound.addEventListener("canplaythrough", (e) => {
                item.style.cursor = "pointer";
                item.innerHTML = '🔊';
                item.addEventListener('click',() => {
                    sound.play();
                });
            });
            sound.src = soundFile;
        }
        catch (error) { 
            console.log("No sound for " + item.dataset.sound);
        }
    });


}//End stageExercise

stageExercise();


//Other events

//Reset score
e('#correct','click',function (e) {
    let reset = confirm("Do you want to reset your score?");
    if (reset) {
        //Reset local storage to zero for the lesson.
            localStorage.setItem(scoreIndex,0);
            score = 0;
            q('#score').innerHTML = score;
            q('#score').className = '';
    }
});

//Go back to the index
e('#back','click',function (e) {
    window.location = 'index.html';
});