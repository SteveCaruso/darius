/*

    I'm actually happier with this code now.

    I cleaned it up from the initial commit.

    It still needs some more work, but so far so good. :-)

    -S

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
        setTimeout(resolve, ms);
    });
}

//GET Variables
var GET={};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(a,name,value){GET[name]=value;});

/* Load in sounds */
let successSound = new Audio('/sounds/success.mp3');
let failSound = new Audio('/sounds/fail.mp3');

/* On to the playground! */

//Get the lesson file & section
let lessonFile = GET['lesson'] ?? 'alphabet.md';
let sectionNum = GET['section'] ?? 1;
let scoreIndex = lessonFile+'_'+sectionNum; console.log("Score Index:",scoreIndex)

//Get reference to the playground div
let playground = q('#playground');

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

//Function to select random exercise and stage it.
function stageExercise(exNum) {

    //Clear the playground
    playground.innerHTML = '';

    //Load up the section
    let sec = section[sectionNum-1]; console.log(sec);
    
    //If there is no exercise num passed, randomize it
    if (exNum == null) exNum = rand(sec.exercises.length);

    //Grab the exercise
    let ex = sec.exercises[exNum];

    //Determine which language to which
    let from = 'arc', to = 'eng';
    if (rand(2)) { from = 'eng'; to = 'arc'; }

    //Single matching or sentences
    if (ex.type == "matching" || ex.type == "sentences") {

        //Get distractions
        let distractions = [...sec.distractions[to][ex.type].sort(() => Math.random() - 0.5)];

        //Determine the challenge to display
        let challenge = ex[from].replaceAll('_',' ');//.split(' ');

        //Determine the correct answer for comparison
        let correctAnswer = ex[to];
        let correctAnswerCheck = ex[to];

        //NOTE: Instead of removing punctuation here, I should keep things split between display and check.

        //Remove punctuation
        if (to == "eng") correctAnswerCheck = ex[to].replace(/\./g, ""); //Remove punctuation

        //Determine possibilities
        let possibilities = correctAnswerCheck.split(' ');

        //Add in 4 distractions
        for (var i=0; i<4; i++) {
            possibilities.push(distractions.pop());
        }

        //Fix non-breaking spaces everywhere
        correctAnswerCheck = correctAnswerCheck.replaceAll('_',' '); //nbsp
        for (var p in possibilities) possibilities[p] = possibilities[p].replaceAll('_',' ');
        
        //Reduce to uniques
        possibilities = [...new Set(possibilities)];

        //Shuffle possibilities
        possibilities = possibilities.sort(() => Math.random() - 0.5);

        //Chop up Aramaic for display
        if (from == "arc") {
            //Format the challenge
            challenge = challenge.split(' ');
            for (var c in challenge) challenge[c] = challenge[c].split('').reverse().join('');
            challenge = '<span>' + challenge.join('</span> <span>') + '</span>';

            //
        }
        if (to == "arc") {
            //Format distractions
            for (var p in possibilities)
                possibilities[p] = '<span>'+possibilities[p].split('').reverse().join('')+'</span>';
            //Format the correct answer
            correctAnswer = correctAnswer.split(' ');
            for (var c in correctAnswer) correctAnswer[c] = correctAnswer[c].split('').reverse().join('');
            correctAnswer = '<span>' + correctAnswer.join('</span> <span>') + '</span>';
        }
        correctAnswer = correctAnswer.replaceAll('_',' ');

        console.log(challenge, ' --- ', correctAnswer, ' --- ', correctAnswerCheck);
        
        //Populate the playground
        playground.innerHTML += `<h2 class="${from}">${challenge}</h2>`;
        playground.innerHTML += `<div id="landing" class="${to}"></div>`;
        playground.innerHTML += `<small>Translate the above ${langs[from]} to ${langs[to]}...</small>`;
        playground.innerHTML += `<ul id="possibilities" class="${to}"><li>${possibilities.join('</li><li>')}</li></ul>`;
        playground.innerHTML += `<div id="check" class="button">Check Answer</div>`;
        playground.innerHTML += `<div id="answer" class="${to}">${correctAnswer}</div>`;
        

        //Attach events

        //Add putting possibilities into the landing and back
        e('#possibilities li','click',function (e) { console.log(this,e);
            if (this.parentElement.id == "possibilities") {
                q('#landing').appendChild(this);
            }
            else {
                q('#possibilities').appendChild(this);
            }
        });

        //Check the answer
        e('#check','click', async function (e) {

            //If the answer has already been revealed, refresh
            if (this.innerHTML == "Next Exercise") {
                playground.style.opacity = 0;
                await sleep(510);
                stageExercise();
                playground.style.opacity = 1;
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

            //Get their answer
            let landing = qa('#landing li');
            let theirAnswer = [];
            for (var i=0; i<landing.length; i++) {
                
                //Get the text in the box.
                let text = landing[i].innerText;

                //If it's in Aramaic, reverse it
                if (to == "arc") text = text.split('').reverse().join('');

                //Add it to the answer
                theirAnswer.push(text);
            }
            theirAnswer = theirAnswer.join(' ');

            console.log("Your Answer: `" + theirAnswer + "` Correct Answer: `" + correctAnswerCheck + "`", theirAnswer == correctAnswerCheck); 

            //Check answer
            if (theirAnswer == correctAnswerCheck) {
                q('#answer').style.backgroundColor = "var(--correct)";
                score++;
                localStorage.setItem(scoreIndex,score);
                q('#score').innerHTML = score;
                
                let star = "";
                if (score >= 10) star = "star";
                if (score >= 25) star = "bronze";
                if (score >= 50) star = "silver";
                if (score >= 75) star = "gold";
                if (score >= 100) star = "dove";
                q('#score').className = star;

                successSound.play();

                //Set streak
                checkStreak();

            }
            else {
                q('#answer').style.backgroundColor = "var(--wrong)";
                failSound.play();
            }

        }); //END check answer

        return;


    }

}//End stageExercise

stageExercise();


//Streak
let last = parseInt(localStorage.getItem("last") ?? 0);
let streak = parseInt(localStorage.getItem("streak") ?? 0);

//Round down the timestamp to the day
let dayOffset = (1000 * 60 * 60 * 25); //25 hours, wiggleroom

function checkStreak() {

    //Calculate midnight timestamp today
    let now = new Date();
    let today = new Date(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`);
        today = today.valueOf();

    //Calculate midnight timestamp from last lesson
    let lastTime = new Date(last);
    let lastLesson = new Date(`${lastTime.getFullYear()}/${lastTime.getMonth() + 1}/${lastTime.getDate()}`);
    lastLesson = lastLesson.valueOf();

    //If the last lesson wasn't completed today, add to the streak
    if (lastLesson != today) {
        localStorage.setItem("streak",streak+1);
        localStorage.setItem("last",now.valueOf());
        console.log("Streak extended!");
    }
}


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