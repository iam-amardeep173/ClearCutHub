const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY';
const APP_ID = 'YOUR_APP_ID';
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

let oauthToken = '';

function isLocalhost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

function onApiLoad() {
  if (isLocalhost()) {
    alert("Google Drive import only works on deployed version.");
    return;
  }

  gapi.load('auth', { callback: onAuthApiLoad });
  gapi.load('picker');
}

function onAuthApiLoad() {
  gapi.auth.authorize(
    {
      client_id: CLIENT_ID,
      scope: SCOPES,
      immediate: false
    },
    authResult => {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
      } else {
        alert("Authorization failed");
      }
    }
  );
}

function createPicker() {
  if (oauthToken) {
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes("application/pdf");

    const picker = new google.picker.PickerBuilder()
      .setAppId(APP_ID)
      .setOAuthToken(oauthToken)
      .addView(view)
      .setDeveloperKey(API_KEY)
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);
  }
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const fileId = data.docs[0].id;
    fetch('/upload-from-drive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: fileId,
        accessToken: oauthToken
      })
    })
    .then(res => res.json())
    .then(res => {
      if (res.message) {
        alert("File uploaded successfully.");
      } else {
        alert("Upload failed: " + (res.error || "Unknown error"));
      }
    })
    .catch(err => {
      console.error('Upload error:', err);
      alert("Upload failed.");
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('googleDrivePicker');
  if (btn) {
    btn.addEventListener('click', onApiLoad);
  }
});
