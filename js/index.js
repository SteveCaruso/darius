import QrCode from "/js/qrcode.mjs";

//GET Variables
var GET={};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(a,name,value){GET[name]=value;});

//Query selector
var q = document.querySelector.bind(document);

//Query Selector All
var qa = document.querySelectorAll.bind(document);

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

//Base progress object
let progress = {
    "Learn Galilean Aramaic":Date.now(),
    "streak":parseInt(localStorage.getItem("streak") ?? 0),
    "last":parseInt(localStorage.getItem("last") ?? 0)
}; 
    
console.log(progress);

async function lesson(file) {

    //Set progress object for this lesson
    progress[file] = [];

    //Fetch the lesson
    let lesson = await fetch('/lessons/'+file);

    if (!lesson.ok) {
        alert('Bad lesson file.');
        throw new Error(`Response status: ${lesson.status}`); //Should catch this somehow later
    }
    //Parse lesson
    lesson = await lesson.text();
    lesson = lesson.split('\n');

    let sec = 1;

    for (let l in lesson) {
        lesson[l] = lesson[l].trim();
        if (lesson[l] == "") continue;

        let [prefix, ...data] = lesson[l].split(' ')
        data = data.join(' ');

        //Lesson's name
        if (prefix == "#") {
            q('#list').innerHTML += `
                <tr>
                    <th class="title">${data}</th>
                    <th class="count">Score</th>
                </tr>`;
        }
        //Section
        else if (prefix == "##") {
            let count = localStorage.getItem(file + '_' + sec)??0;
            let star = "";
            if (count >= 10) star = "star";
            if (count >= 25) star = "bronze";
            if (count >= 50) star = "silver";
            if (count >= 75) star = "gold";
            if (count >= 100) star = "dove";
            q('#list').innerHTML += `
            <tr>
                <td class="lessonTableTitle"><a href="/lesson.html?lesson=${file}&section=${sec}">${data}</a></td>
                <td class="count ${star}">${count}</td>
            </tr>`;
            progress[file].push([sec,parseInt(count)]);
            sec++;
        }
    } 
    return;
}
for (var l in lessons) await lesson(lessons[l]);

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

const data = encodeURI("http://localhost:5500/?load=" + await JSON.stringify(progress)); 

console.log(data);

const matrix = QrCode.generate(data);
const text = QrCode.render('svg', matrix);
document.querySelector('#qr-code').innerHTML = text;

e('#qr','click', async () => {
    q('#qr-save').classList.toggle('visible');
});
e('#close-qr-save','click', async () => {
    q('#qr-save').classList.toggle('visible');
});

e('#save-link','click', async () => {
    try {
        await navigator.clipboard.writeText(data);
        alert("Copied!");
    } catch (err) {
        alert('Failed to copy: ', err);
    }
});

//Load QR code data
if (GET['load']) {

    //Check FIRST
    let overwrite = confirm("Would you like to transfer your progress data to this browser?");

    //If it's a go
    if (overwrite) {

        //Grab the data
        let newData = JSON.parse(decodeURI(GET['load']));

        //Loop over and set
        for (let lesson in newData) {
            let exercise = newData[lesson];
            for (let e in exercise) {
                console.log(lesson+'_'+exercise[e][0],exercise[e][1]);
                localStorage.setItem(lesson+'_'+exercise[e][0],exercise[e][1]);
            }
        }

        //Progress transferred!
        q('#streak').innerHTML = `Progress transfered!`;

        //Wait
        await sleep(1000);

        //Refresh
        window.location = '/';

        await sleep(5000);

    }

}

//Set up streak
let last = parseInt(localStorage.getItem("last") ?? 0);
let streak = parseInt(localStorage.getItem("streak") ?? 0);

//Round down the timestamp to the day
let dayOffset = (1000 * 60 * 60 * 25); //25 hours, wiggleroom

//Calculate today and yesterday
let now = new Date();

// Extract day, month, and year
let day = now.getDate();
let month = now.getMonth() + 1;
let year = now.getFullYear();

//Calculate midnight today
let today = new Date(`${year}/${month}/${day}`);
    today = today.valueOf();

//Check
console.log("Last lesson:", new Date(last)); 
console.log("A day ago:", new Date(today - dayOffset));

//If the last lesson completed, minus a day, is less than today, the streak is good.
if (last >= today - dayOffset) {
    if (streak > 0) 
        q('#streak').innerHTML = `${streak} days!`;
}
else {
    console.log("Streak lost!");
    localStorage.setItem("streak",0);
    if (last != 0)
        q('#streak').innerHTML = `Welcome back!`;
}