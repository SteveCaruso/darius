// Constants for localStorage keys
const NOTIFICATION_SETTINGS_KEY = 'notify';

// Object to hold notification settings
let notificationSettings = {
  hour: null,
  minute: null,
  enabled: false
};

let notificationTimeoutId = null;

// Function to load settings from localStorage
function loadNotificationSettings() {
  const storedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  if (storedSettings) {
    try {
      notificationSettings = JSON.parse(storedSettings);
    } catch (error) {
      console.error("Error parsing localStorage settings:", error);
      notificationSettings = { hour: null, minute: null, enabled: false }; // Reset to defaults
    }

    //Initialize UI based on loaded settings.
    updateUI(); //Assume that functions updateUI() exists.
  } else {
    notificationSettings = { hour: null, minute: null, enabled: false };
  }
}

// Function to save settings to localStorage
function saveNotificationSettings() {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(notificationSettings));
}

// Function to update the UI based on the current notification settings
function updateUI() {
  // Example: update input fields and enable/disable a button
  // In a real application, you would interact with the actual HTML elements
  console.log(`Updating UI with:`, notificationSettings);
}

function scheduleDailyNotification(hour, minute) {
  removeDailyNotification();
  notificationSettings.hour = hour;
  notificationSettings.minute = minute;
  notificationSettings.enabled = true;
  saveNotificationSettings();

  createNotificationJob(hour, minute);
}

function createNotificationJob(hour, minute) {
  let now = new Date();
  let targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);

  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  let timeUntilNotification = targetTime.getTime() - now.getTime();

  notificationTimeoutId = setTimeout(function() {
    const notification = new Notification('Daily Reminder', {
      body: 'This is your daily notification!'
    });

    notification.onclick = function() {
      window.open('https://www.example.com', '_blank');
    };
  }, timeUntilNotification);
}

function removeDailyNotification() {
  if (notificationTimeoutId !== null) {
    clearTimeout(notificationTimeoutId);
    notificationTimeoutId = null;
  }
  notificationSettings.hour = null;
  notificationSettings.minute = null;
  notificationSettings.enabled = false;
  saveNotificationSettings();
  updateUI(); // Refresh UI after removing notification
}

// Event listeners for UI elements
document.addEventListener('DOMContentLoaded', function() {
  loadNotificationSettings();

  // Example: Setting the notification
  const setNotificationButton = document.getElementById('setNotification');
  if (setNotificationButton) {
    setNotificationButton.addEventListener('click', function() {
      const hourInput = document.getElementById('notificationHour');
      const minuteInput = document.getElementById('notificationMinute');
      scheduleDailyNotification(parseInt(hourInput.value, 10), parseInt(minuteInput.value, 10));
    });
  }

  // Example: Removing the notification
  const removeNotificationButton = document.getElementById('removeNotification');
  if (removeNotificationButton) {
    removeNotificationButton.addEventListener('click', removeDailyNotification);
  }
});