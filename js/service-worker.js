let notificationTimeoutId = null;  //Important to share it globally

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

addEventListener('message', function(event) {
  // event is an ExtendableMessageEvent object
  console.log(`The client sent me a message: ${event}`);

  
});

self.addEventListener('message', function(event) {
    event.source.postMessage('Event received!');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated!');
    this.setInterval(() => console.log('TEST'), 2000);
});

/*
self.addEventListener('install', function(event) {
    //console.log
    event.source.postMessage('Service Worker installed!');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated!');
    event.source.postMessage('Service Worker activated!');
});


self.addEventListener('message', function(event) {
    event.source.postMessage('Event received!');

    if (event.data.type === 'scheduleNotification') {
        event.source.postMessage('Scheduling notification...');
        const { hour, minute } = event.data;
        scheduleNotification(hour, minute);
    } 
    else if (event.data.type === 'removeNotification') {
        event.source.postMessage('Removing notification...');
        removeNotification();
    }
});

function scheduleNotification(hour, minute) {

    console.log("Registering a notification...");

    let now = new Date();
    let targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);

    if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    let timeUntilNotification = targetTime.getTime() - now.getTime();

    notificationTimeoutId = setTimeout(function() {
        const notification = new Notification('Aramaic Reminder!', {
            body: `Jonah says: It's time for your Aramaic lesson!"`,
            icon: `https://learn.galileanaramaic.com/img/jonah.png`
        });

        notification.onclick = function() {
            window.open('https://learn.galileanaramaic.com', '_blank');
        };

        scheduleNotification(hour, minute);

    }, timeUntilNotification);

}


function removeNotification() {
    clearTimeout(notificationTimeoutId);
    notificationTimeoutId = null;
}*/