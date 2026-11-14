
"use strict";

// ========================================
// HOME, ABOUT AND TOOLS NAVIGATION
// ========================================

const homeSection = document.getElementById("homeSection");
const aboutSection = document.getElementById("aboutSection");
const toolsSection = document.getElementById("toolsSection");

function showSection(section) {
    homeSection.hidden = true;
    aboutSection.hidden = true;
    toolsSection.hidden = true;

    section.hidden = false;
    section.focus();
}

document.getElementById("homeButton")
.addEventListener("click", function () {
    showSection(homeSection);
});

document.getElementById("aboutButton")
.addEventListener("click", function () {
    showSection(aboutSection);
});

document.getElementById("toolsButton")
.addEventListener("click", function () {
    showSection(toolsSection);
});

// ========================================
// TEXT TO SPEECH
// ========================================

const ttsText = document.getElementById("ttsText");

document.getElementById("speakButton")
.addEventListener("click", function () {

    const text = ttsText.value.trim();

    if (!text) {
        alert("Please enter text first.");
        ttsText.focus();
        return;
    }

    if (!("speechSynthesis" in window)) {
        alert("Speech is not supported in this browser.");
        return;
    }

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 0.9;

    speechSynthesis.speak(speech);
});

document.getElementById("stopSpeechButton")
.addEventListener("click", function () {

    if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
    }
});

// ========================================
// EXPORT TEXT
// ========================================

function downloadText(text, filename) {

    const blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 1000);
}

document.getElementById("exportTextButton")
.addEventListener("click", function () {

    const text = ttsText.value.trim();

    if (!text) {
        alert("Please enter text first.");
        ttsText.focus();
        return;
    }

    downloadText(text, "digital-world-text.txt");
});

// ========================================
// IMAGE UPLOAD AND PREVIEW
// ========================================

const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const imageStatus = document.getElementById("imageStatus");

const removeImageButton =
    document.getElementById("removeImageButton");

let imageObjectURL = null;

imageUpload.addEventListener("change", function () {

    const file = imageUpload.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        imageStatus.textContent =
            "Please select a valid image.";

        imageUpload.value = "";
        return;
    }

    if (imageObjectURL) {
        URL.revokeObjectURL(imageObjectURL);
    }

    imageObjectURL = URL.createObjectURL(file);

    imagePreview.src = imageObjectURL;
    imagePreview.alt = "Uploaded image: " + file.name;
    imagePreview.hidden = false;

    imageStatus.textContent =
        "Image uploaded successfully: " + file.name;

    removeImageButton.disabled = false;
});

removeImageButton.addEventListener("click", function () {

    imageUpload.value = "";

    imagePreview.removeAttribute("src");
    imagePreview.hidden = true;

    if (imageObjectURL) {
        URL.revokeObjectURL(imageObjectURL);
        imageObjectURL = null;
    }

    imageStatus.textContent =
        "Image removed successfully.";

    removeImageButton.disabled = true;
});

// ========================================
// AUDIO UPLOAD AND DOWNLOAD
// ========================================

const audioUpload = document.getElementById("audioUpload");
const audioPlayer = document.getElementById("audioPlayer");

const downloadAudioButton =
    document.getElementById("downloadAudioButton");

const removeAudioButton =
    document.getElementById("removeAudioButton");

let audioObjectURL = null;
let audioFile = null;

audioUpload.addEventListener("change", function () {

    const file = audioUpload.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("audio/")) {

        alert("Please select a valid audio file.");

        audioUpload.value = "";
        return;
    }

    if (audioObjectURL) {
        URL.revokeObjectURL(audioObjectURL);
    }

    audioFile = file;

    audioObjectURL = URL.createObjectURL(file);

    audioPlayer.src = audioObjectURL;
    audioPlayer.hidden = false;

    downloadAudioButton.disabled = false;
    removeAudioButton.disabled = false;
});

downloadAudioButton.addEventListener("click", function () {

    if (!audioFile || !audioObjectURL) {
        return;
    }

    const link = document.createElement("a");

    link.href = audioObjectURL;
    link.download = audioFile.name;

    document.body.appendChild(link);
    link.click();
    link.remove();
});

removeAudioButton.addEventListener("click", function () {

    audioUpload.value = "";

    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();
    audioPlayer.hidden = true;

    if (audioObjectURL) {
        URL.revokeObjectURL(audioObjectURL);
        audioObjectURL = null;
    }

    audioFile = null;

    downloadAudioButton.disabled = true;
    removeAudioButton.disabled = true;
});

// ========================================
// SPEECH TO TEXT
// ========================================

const speechResult = document.getElementById("speechResult");
const speechStatus = document.getElementById("speechStatus");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function (event) {

        let text = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            text += event.results[i][0].transcript;
        }

        speechResult.value += text;
    };

    recognition.onstart = function () {
        speechStatus.textContent = "Listening started.";
    };

    recognition.onend = function () {
        speechStatus.textContent = "Listening stopped.";
    };

    recognition.onerror = function (event) {
        speechStatus.textContent =
            "Speech error: " + event.error;
    };
}

document.getElementById("startListeningButton")
.addEventListener("click", function () {

    if (!recognition) {

        speechStatus.textContent =
            "Speech recognition is not supported.";

        return;
    }

    try {
        recognition.start();
    } catch (error) {
        speechStatus.textContent =
            "Speech recognition is already running.";
    }
});

document.getElementById("stopListeningButton")
.addEventListener("click", function () {

    if (recognition) {
        recognition.stop();
    }
});

// ========================================
// EXPORT SPEECH TEXT
// ========================================

document.getElementById("exportSpeechButton")
.addEventListener("click", function () {

    const text = speechResult.value.trim();

    if (!text) {

        alert("No speech text available.");

        speechResult.focus();
        return;
    }

    downloadText(text, "speech-result.txt");
});

// ========================================
// FEEDBACK EMAIL
// ========================================

document.getElementById("sendFeedbackButton")
.addEventListener("click", function () {

    const feedback =
        document.getElementById("feedbackMessage")
        .value.trim();

    if (!feedback) {

        alert("Please write your feedback first.");

        document.getElementById("feedbackMessage").focus();
        return;
    }

    // Replace this with your real email address
    const emailAddress = "YOUR_EMAIL@gmail.com";

    const subject = encodeURIComponent(
        "Digital World for Blind Users Feedback"
    );

    const body = encodeURIComponent(feedback);

    window.location.href =
        "mailto:" + emailAddress +
        "?subject=" + subject +
        "&body=" + body;
});
