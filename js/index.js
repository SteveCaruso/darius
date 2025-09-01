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
                <td class="lessonTableTitle">
                    <a href="/lesson.html?lesson=${file}&section=${sec}">${data}</a>
                    <a class="overviewLink" href="/overview.html?lesson=${file}&section=${sec}">ⓘ</a>
                </td>
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

//Dev
//const data = encodeURI("http://localhost:5500/?load=" + await JSON.stringify(progress)); 
//Prod
const data = encodeURI("http://learn.galileanaramaic.com/?load=" + await JSON.stringify(progress)); 

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
            if (lesson == "streak" || lesson == "last") {
                console.log(lesson,exercise);
                localStorage.setItem(lesson,exercise);
            }
            else for (let e in exercise) {
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

//Notifications
let notify = localStorage.getItem('notify') ?? false;
    if (notify != false) 
        notify = JSON.parse(notify);
let notificationTimeoutId = null;

//Set notification
e(`#setNotify`,'click', async () => {

    //Set the notifications element
    notify = {
        'h':parseInt(q(`#hour`).value) + parseInt(q(`#meridian`).value),
        'm':parseInt(q(`#minute`).value)
    };
    localStorage.setItem('notify',JSON.stringify(notify));
    //Set the notification timer[----] 
    setNotification();
    //Close panel
    q(`#notificationSettings`).classList.remove('show');
    //Switch interface on
    q(`#notifications`).classList.add('on');
    //Jonah speaks!
    q('#streak').innerHTML = `Reminder set!`;
    await sleep(2000);
    q('#streak').innerHTML = ``;

});

//Kill a notification
e(`#removeNotify`,'click', async () => {
    //Switch it off
    notify = false;
    localStorage.setItem('notify',notify);
    //Send a message to the Service Worker to schedule the notification
    cancelNotification();
    //Close panel
    q(`#notificationSettings`).classList.remove('show');
    //Switch interface off
    q(`#notifications`).classList.remove('on');
    //Jonah speaks!
    q('#streak').innerHTML = `Reminder cleared!`;
    await sleep(2000);
    q('#streak').innerHTML = ``;
});

//Toggle the notification window
q(`#notifications`).onclick = () => {
    q(`#notificationSettings`).classList.toggle('show');
};

//On/off indicator
if (notify != false) {
    setNotification();
    let hour = notify.h;
    let minute = notify.m;
    q(`#notifications`).classList.add('on');
    if (hour >= 12) {
        q(`#meridian option[value='12']`).selected = true;
        hour -= 12;
    }
    q(`#hour option[value='${hour}']`).selected = true;
    q(`#minute option[value='${minute}']`).selected = true;
}

async function setNotification() {
    console.log("Setting a notification...");

    //Get permission here
    Notification.requestPermission().then(async (permission) => {

        if (permission !== "granted") {
            alert("Cannot obtain permissions.");
            return;
        }

        let now = new Date();
        let targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                                notify.h, notify.m, 0, 0
                        );

        if (targetTime <= now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        console.log(targetTime);

        let timeUntilNotification = targetTime.getTime() - now.getTime();

        notificationTimeoutId = setTimeout(function() {
            const notification = new Notification('Aramaic Reminder!', {
                body: `Jonah says: It's time for your Aramaic lesson!"`,
                icon: `https://learn.galileanaramaic.com/img/jonah.png`
            });

            notification.onclick = function() {
                window.open('https://learn.galileanaramaic.com', '');
            };

            setNotification();

        }, timeUntilNotification);

    });
}
async function cancelNotification() {
    clearTimeout(notificationTimeoutId);
}

//Activate Service Worker
//if ('serviceWorker' in navigator) {
//    navigator.serviceWorker.register('/js/service-worker.js');
//}