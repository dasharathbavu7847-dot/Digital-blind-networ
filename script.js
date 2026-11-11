
/* ==========================================
   DIGITAL BLIND NETWORK
   script.js - Accessibility Website
   ========================================== */

const $ = (id) => document.getElementById(id);

/* ---------- Welcome Greeting ---------- */

(function () {
  const hour = new Date().getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }

  const message =
    greeting + "! Welcome to Digital Blind Network.";

  const banner = $("welcomeGreeting");

  if (banner) {
    banner.textContent = message;
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      if ("speechSynthesis" in window) {
        speechSynthesis.speak(
          new SpeechSynthesisUtterance(message)
        );
      }
    }, 1000);
  });
})();

/* ---------- Demo Email OTP ---------- */

if ($("sendOtp")) {
  $("sendOtp").onclick = () => {
    $("loginStatus").textContent =
      "Demo only: Connect email OTP authentication.";
  };
}

if ($("loginForm")) {
  $("loginForm").onsubmit = (event) => {
    event.preventDefault();

    $("loginStatus").textContent =
      "Demo login. Secure authentication backend required.";
  };
}

/* ---------- Text to Speech ---------- */

if ($("speak")) {
  $("speak").onclick = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text to Speech is not supported.");
      return;
    }

    speechSynthesis.cancel();

    const text = $("ttsText").value;

    speechSynthesis.speak(
      new SpeechSynthesisUtterance(text)
    );
  };
}

if ($("stopSpeak")) {
  $("stopSpeak").onclick = () => {
    speechSynthesis.cancel();
  };
}

/* ---------- Audio to Text ---------- */

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let text = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      text += event.results[i][0].transcript;
    }

    $("speechResult").value = text;
  };

  recognition.onerror = (event) => {
    $("speechStatus").textContent =
      "Speech error: " + event.error;
  };
}

if ($("startSpeech")) {
  $("startSpeech").onclick = () => {
    if (recognition) {
      recognition.start();

      $("speechStatus").textContent =
        "Listening...";
    } else {
      $("speechStatus").textContent =
        "Speech recognition is unavailable.";
    }
  };
}

if ($("stopSpeech")) {
  $("stopSpeech").onclick = () => {
    if (recognition) recognition.stop();
  };
}

/* ---------- Text to TXT File ---------- */

if ($("downloadText")) {
  $("downloadText").onclick = () => {
    const text = $("fileText").value;

    const blob = new Blob(
      [text],
      { type: "text/plain;charset=utf-8" }
    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download =
      $("fileName").value || "notes.txt";

    link.click();

    URL.revokeObjectURL(link.href);
  };
}

/* ---------- Video Player ---------- */

if ($("videoFile")) {
  $("videoFile").onchange = (event) => {
    const file = event.target.files[0];

    if (file) {
      $("player").src = URL.createObjectURL(file);
    }
  };
}

if ($("forward10")) {
  $("forward10").onclick = () => {
    const video = $("player");

    video.currentTime = Math.min(
      video.duration || Infinity,
      video.currentTime + 10
    );
  };
}

if ($("back10")) {
  $("back10").onclick = () => {
    $("player").currentTime = Math.max(
      0,
      $("player").currentTime - 10
    );
  };
}

/* ---------- Camera Recording ---------- */

let cameraStream;
let mediaRecorder;
let recordingChunks = [];

if ($("startRecord")) {
  $("startRecord").onclick = async () => {
    try {
      cameraStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

      $("preview").srcObject = cameraStream;

      recordingChunks = [];

      mediaRecorder =
        new MediaRecorder(cameraStream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) {
          recordingChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(
          recordingChunks,
          { type: mediaRecorder.mimeType }
        );

        const url = URL.createObjectURL(blob);

        $("recordDownload").href = url;
        $("recordDownload").hidden = false;

        $("recordStatus").textContent =
          "Recording ready. Download your video.";

        cameraStream.getTracks().forEach(
          track => track.stop()
        );
      };

      mediaRecorder.start();

      $("startRecord").disabled = true;
      $("stopRecord").disabled = false;

      $("recordStatus").textContent =
        "Recording started.";

    } catch (error) {
      $("recordStatus").textContent =
        "Recording unavailable: " + error.message;
    }
  };
}

if ($("stopRecord")) {
  $("stopRecord").onclick = () => {
    if (
      mediaRecorder &&
      mediaRecorder.state !== "inactive"
    ) {
      mediaRecorder.stop();
    }

    $("startRecord").disabled = false;
    $("stopRecord").disabled = true;
  };
}

/* ---------- Reminder ---------- */

let reminderTimer;

if ($("setReminder")) {
  $("setReminder").onclick = () => {
    const message = $("reminderText").value;

    const time =
      new Date($("reminderTime").value).getTime();

    if (!message || !time || time <= Date.now()) {
      $("reminderStatus").textContent =
        "Enter a reminder and future time.";
      return;
    }

    clearTimeout(reminderTimer);

    reminderTimer = setTimeout(() => {
      alert("Digital Blind Network Reminder: " + message);
    }, time - Date.now());

    $("reminderStatus").textContent =
      "Reminder set. Keep this page open.";
  };
}
