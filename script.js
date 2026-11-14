
/* ==========================================
   DIGITAL BLIND NETWORK
   ACCESSIBLE WEBSITE JAVASCRIPT
========================================== */

"use strict";

/* ==========================================
   HELPER FUNCTIONS
========================================== */

const $ = (id) => document.getElementById(id);

function setStatus(id, message, error = false) {
    const element = $(id);

    if (element) {
        element.textContent = message;
        element.setAttribute("role", error ? "alert" : "status");
    }
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.hidden = page.id !== pageId;
    });

    const page = $(pageId);

    if (page) {
        page.hidden = false;
        page.scrollIntoView({ behavior: "smooth" });
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(name, fallback = "download") {
    return (name || fallback)
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .trim() || fallback;
}

function connectButton(id, callback) {
    const button = $(id);

    if (button) {
        button.addEventListener("click", callback);
    }
}

function connectForm(id, callback) {
    const form = $(id);

    if (form) {
        form.addEventListener("submit", callback);
    }
}

/* ==========================================
   NAVIGATION
========================================== */

function initializeNavigation() {
    document.querySelectorAll("nav button, .nav-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.page;
                const text = button.textContent.trim().toLowerCase();

                if (target && $(target)) {
                    showPage(target);
                } else if (text.includes("home")) {
                    showPage("homePage");
                } else if (text.includes("tool")) {
                    showPage("toolsPage");
                } else if (text.includes("about")) {
                    showPage("aboutPage");
                } else if (text.includes("logout")) {
                    logoutUser();
                }
            });
        });
}

/* ==========================================
   CAPTCHA
========================================== */

let captchaAnswer = 0;

function generateCaptcha() {
    const first = Math.floor(Math.random() * 9) + 1;
    const second = Math.floor(Math.random() * 9) + 1;

    captchaAnswer = first + second;

    if ($("captchaQuestion")) {
        $("captchaQuestion").textContent =
            `Accessibility CAPTCHA: ${first} plus ${second} equals what?`;
    }

    if ($("captchaAnswer")) {
        $("captchaAnswer").value = "";
    }
}

function listenCaptcha() {
    const question = $("captchaQuestion");

    if (!question) return;

    if (!("speechSynthesis" in window)) {
        setStatus("registerStatus", "Speech is not supported.", true);
        return;
    }

    const speech = new SpeechSynthesisUtterance(question.textContent);
    speech.lang = "en-IN";
    speech.rate = 0.9;

    speechSynthesis.cancel();
    speechSynthesis.speak(speech);
}

/* ==========================================
   DEMO ACCOUNT SYSTEM
========================================== */

const ACCOUNT_KEY = "dbn_demo_account";
const SESSION_KEY = "dbn_demo_session";

async function hashPassword(password) {
    if (window.crypto && crypto.subtle) {
        const data = new TextEncoder().encode(password);
        const digest = await crypto.subtle.digest("SHA-256", data);

        return Array.from(new Uint8Array(digest))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }

    return password;
}

function getAccount() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNT_KEY));
    } catch {
        return null;
    }
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

function updateProfile(account) {
    if (!account) return;

    if ($("profileName"))
        $("profileName").textContent = account.name;

    if ($("profileUsername"))
        $("profileUsername").textContent = account.username;

    if ($("profileEmail"))
        $("profileEmail").textContent = account.email;

    if ($("welcomeMessage"))
        $("welcomeMessage").textContent =
            `Welcome to Digital Blind Network, ${account.name}.`;
}

function loginUser(account) {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ username: account.username })
    );

    updateProfile(account);
    showPage("homePage");
}

function logoutUser() {
    localStorage.removeItem(SESSION_KEY);

    showPage("loginPage");

    if ($("loginPassword"))
        $("loginPassword").value = "";

    setStatus("loginStatus", "You have logged out successfully.");
}

/* ==========================================
   REGISTER
========================================== */

async function registerAccount(event) {
    event.preventDefault();

    const name = $("fullName")?.value.trim();
    const username = $("registerUsername")?.value.trim();
    const email = $("registerEmail")?.value.trim().toLowerCase();
    const password = $("registerPassword")?.value;
    const confirmPassword = $("confirmPassword")?.value;
    const answer = Number($("captchaAnswer")?.value);
    const privacy = $("privacyCheckbox")?.checked;

    if (!name || !username || !email || !password || !confirmPassword) {
        setStatus("registerStatus", "Please fill all required fields.", true);
        return;
    }

    if (password !== confirmPassword) {
        setStatus("registerStatus", "Passwords do not match.", true);
        return;
    }

    if (password.length < 8) {
        setStatus("registerStatus", "Password must contain at least 8 characters.", true);
        return;
    }

    if (answer !== captchaAnswer) {
        setStatus("registerStatus", "Incorrect CAPTCHA answer.", true);
        generateCaptcha();
        return;
    }

    if (!privacy) {
        setStatus("registerStatus", "Please accept the privacy checkbox.", true);
        return;
    }

    if (getAccount()) {
        setStatus("registerStatus", "Demo account already exists. Please log in.", true);
        return;
    }

    const account = {
        name,
        username,
        email,
        passwordHash: await hashPassword(password)
    };

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));

    setStatus("registerStatus", "Account created successfully. Please log in.");

    event.target.reset();
    generateCaptcha();

    showPage("loginPage");

    if ($("loginUsername")) {
        $("loginUsername").value = username;
    }
}

/* ==========================================
   LOGIN
========================================== */

async function handleLogin(event) {
    event.preventDefault();

    const identity = $("loginUsername")?.value.trim().toLowerCase();
    const password = $("loginPassword")?.value;

    const account = getAccount();

    if (!account) {
        setStatus("loginStatus", "Please create an account first.", true);
        return;
    }

    const passwordHash = await hashPassword(password || "");

    if (
        identity !== account.username.toLowerCase() &&
        identity !== account.email.toLowerCase()
    ) {
        setStatus("loginStatus", "Incorrect username or email.", true);
        return;
    }

    if (passwordHash !== account.passwordHash) {
        setStatus("loginStatus", "Incorrect password.", true);
        return;
    }

    setStatus("loginStatus", "Login successful.");
    loginUser(account);
}

/* ==========================================
   IMAGE RESIZE
========================================== */

let resizeImageFile = null;
let resizedImageBlob = null;

function initializeImageResize() {
    const input = $("resizeImageInput");

    if (!input) return;

    input.addEventListener("change", () => {
        resizeImageFile = input.files[0];
        resizedImageBlob = null;

        if (resizeImageFile && $("resizeImagePreview")) {
            $("resizeImagePreview").src =
                URL.createObjectURL(resizeImageFile);

            $("resizeImagePreview").alt = "Selected image preview";
        }

        setStatus("resizeStatus", "Image selected.");
    });
}

function resizeImage() {
    if (!resizeImageFile) {
        setStatus("resizeStatus", "Please select an image.", true);
        return;
    }

    const width = Number($("resizeWidth")?.value);
    const height = Number($("resizeHeight")?.value);
    const format = $("resizeFormat")?.value || "image/png";

    if (width <= 0 || height <= 0) {
        setStatus("resizeStatus", "Enter valid dimensions.", true);
        return;
    }

    const image = new Image();

    image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(image, 0, 0, width, height);

        canvas.toBlob(blob => {
            if (!blob) {
                setStatus("resizeStatus", "Resize failed.", true);
                return;
            }

            resizedImageBlob = blob;

            if ($("resizeImagePreview")) {
                $("resizeImagePreview").src = URL.createObjectURL(blob);
            }

            setStatus("resizeStatus", "Image resized successfully.");
        }, format);
    };

    image.onerror = () => {
        setStatus("resizeStatus", "Unable to load image.", true);
    };

    image.src = URL.createObjectURL(resizeImageFile);
}

function downloadResizedImage() {
    if (!resizedImageBlob) {
        setStatus("resizeStatus", "Resize an image first.", true);
        return;
    }

    downloadBlob(resizedImageBlob, "resized-image.png");
}

/* ==========================================
   IMAGE REDUCE
========================================== */

let reduceImageFile = null;
let reducedImageBlob = null;

function initializeImageReduce() {
    const input = $("imageInput");

    if (!input) return;

    input.addEventListener("change", () => {
        reduceImageFile = input.files[0];
        reducedImageBlob = null;

        if (reduceImageFile && $("imagePreview")) {
            $("imagePreview").src = URL.createObjectURL(reduceImageFile);
            $("imagePreview").alt = "Selected image preview";
        }

        setStatus("imageStatus", "Image selected.");
    });
}

function reduceImage() {
    if (!reduceImageFile) {
        setStatus("imageStatus", "Please select an image.", true);
        return;
    }

    const format = $("imageFormat")?.value || "image/jpeg";
    const quality = Number($("imageQuality")?.value || 80) / 100;
    const maxWidth = Number($("imageMaxWidth")?.value || 1200);

    const image = new Image();

    image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (maxWidth > 0 && width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(image, 0, 0, width, height);

        canvas.toBlob(blob => {
            if (!blob) {
                setStatus("imageStatus", "Reduction failed.", true);
                return;
            }

            reducedImageBlob = blob;

            if ($("imagePreview")) {
                $("imagePreview").src = URL.createObjectURL(blob);
            }

            setStatus(
                "imageStatus",
                `Image reduced. Size: ${Math.round(blob.size / 1024)} KB.`
            );
        }, format, quality);
    };

    image.onerror = () => {
        setStatus("imageStatus", "Unable to load image.", true);
    };

    image.src = URL.createObjectURL(reduceImageFile);
}

function downloadReducedImage() {
    if (!reducedImageBlob) {
        setStatus("imageStatus", "Reduce an image first.", true);
        return;
    }

    downloadBlob(reducedImageBlob, "reduced-image.jpg");
}

/* ==========================================
   IMAGE BACKGROUND / TEXT REMOVAL
========================================== */

function removeImageBackground() {
    setStatus(
        "passportStatus",
        "Background removal needs an AI processing service.",
        true
    );
}

function removeImageText() {
    setStatus(
        "textRemoveStatus",
        "Image text removal needs an image processing service.",
        true
    );
}

/* ==========================================
   PASSPORT PHOTO
========================================== */

let passportBlob = null;

function makePassportPhoto() {
    const file = $("passportPhoto")?.files[0];

    if (!file) {
        setStatus("passportStatus", "Select a photo first.", true);
        return;
    }

    const size = $("passportSize")?.value || "35x45";
    const dimensions = size.split("x").map(Number);

    const width = dimensions[0] || 35;
    const height = dimensions[1] || 45;

    const image = new Image();

    image.onload = () => {
        const canvas = document.createElement("canvas");

        canvas.width = width * 118;
        canvas.height = height * 118;

        const context = canvas.getContext("2d");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.max(
            canvas.width / image.width,
            canvas.height / image.height
        );

        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        context.drawImage(
            image,
            (canvas.width - scaledWidth) / 2,
            (canvas.height - scaledHeight) / 2,
            scaledWidth,
            scaledHeight
        );

        canvas.toBlob(blob => {
            if (!blob) {
                setStatus("passportStatus", "Photo creation failed.", true);
                return;
            }

            passportBlob = blob;

            if ($("passportPreview")) {
                $("passportPreview").src = URL.createObjectURL(blob);
                $("passportPreview").alt = "Passport photo preview";
            }

            setStatus("passportStatus", "Passport photo created.");
        }, "image/jpeg", 0.95);
    };

    image.onerror = () => {
        setStatus("passportStatus", "Unable to load photo.", true);
    };

    image.src = URL.createObjectURL(file);
}

function downloadPassportPhoto() {
    if (!passportBlob) {
        setStatus("passportStatus", "Create a photo first.", true);
        return;
    }

    downloadBlob(passportBlob, "passport-photo.jpg");
}

/* ==========================================
   TXT TOOL
========================================== */

function downloadTXT() {
    const text = $("txtInput")?.value || "";
    const filename = safeFilename($("txtFilename")?.value, "document.txt");

    const blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
    });

    downloadBlob(
        blob,
        filename.endsWith(".txt") ? filename : filename + ".txt"
    );

    setStatus("txtStatus", "TXT file downloaded.");
}

function clearTXT() {
    if ($("txtInput")) $("txtInput").value = "";

    setStatus("txtStatus", "Text cleared.");
}

/* ==========================================
   CODE EDITOR
========================================== */

function initializeCodeEditor() {
    const input = $("codeInput");

    if (!input) return;

    const savedCode = localStorage.getItem("dbn_saved_code");

    if (savedCode && !input.value) {
        input.value = savedCode;
    }
}

function saveCode() {
    const code = $("codeInput")?.value || "";

    localStorage.setItem("dbn_saved_code", code);

    setStatus("codeStatus", "Code saved in this browser.");
}

async function copyCode() {
    const code = $("codeInput")?.value || "";

    try {
        await navigator.clipboard.writeText(code);
        setStatus("codeStatus", "Code copied successfully.");
    } catch {
        const input = $("codeInput");

        if (!input) return;

        input.focus();
        input.select();

        const copied = document.execCommand("copy");

        setStatus(
            "codeStatus",
            copied ? "Code copied." : "Copy manually.",
            !copied
        );
    }
}

function downloadCode() {
    const code = $("codeInput")?.value || "";
    const language = $("codeLanguage")?.value || "html";

    const extensions = {
        html: "html",
        css: "css",
        javascript: "js",
        js: "js",
        text: "txt"
    };

    const extension = extensions[language] || "txt";

    downloadBlob(
        new Blob([code], { type: "text/plain;charset=utf-8" }),
        `my-code.${extension}`
    );

    setStatus("codeStatus", "Code downloaded.");
}

function clearCode() {
    if ($("codeInput")) $("codeInput").value = "";

    setStatus("codeStatus", "Editor cleared.");
}

function runCode() {
    const code = $("codeInput")?.value || "";
    const language = $("codeLanguage")?.value || "html";
    const preview = $("codePreview");

    if (!preview) {
        setStatus("codeStatus", "Preview frame unavailable.", true);
        return;
    }

    if (language !== "html") {
        setStatus("codeStatus", "Select HTML for live preview.", true);
        return;
    }

    preview.srcdoc = code;
    preview.hidden = false;

    setStatus("codeStatus", "HTML preview opened.");
}

function closePreview() {
    const preview = $("codePreview");

    if (preview) {
        preview.srcdoc = "";
        preview.hidden = true;
    }

    setStatus("codeStatus", "Preview closed.");
}

/* ==========================================
   VIDEO CONTROLS
========================================== */

function getVideo() {
    return $("videoPreview") || $("videoPlayer");
}

function rewindVideo() {
    const video = getVideo();

    if (!video) {
        setStatus("videoStatus", "Video player not found.", true);
        return;
    }

    video.currentTime = Math.max(0, video.currentTime - 10);
}

function forwardVideo() {
    const video = getVideo();

    if (!video) {
        setStatus("videoStatus", "Video player not found.", true);
        return;
    }

    video.currentTime = Math.min(
        video.duration || Infinity,
        video.currentTime + 10
    );
}

function trimVideo() {
    setStatus(
        "videoStatus",
        "Video trimming and export require a video processing engine.",
        true
    );
}

/* ==========================================
   AUDIO CONTROLS
========================================== */

function trimAudio() {
    setStatus(
        "audioStatus",
        "Audio trimming and export require an audio processing engine.",
        true
    );
}

function removeVocal() {
    setStatus(
        "vocalStatus",
        "Vocal removal requires an AI audio separation service.",
        true
    );
}

function removeMaleVocal() {
    removeVocal();
}

function removeFemaleVocal() {
    removeVocal();
}

function removeLeftRightChannel() {
    setStatus(
        "vocalStatus",
        "Channel separation requires audio processing support.",
        true
    );
}

function removeInstrumental() {
    removeVocal();
}

function separateVoice() {
    removeVocal();
}

/* ==========================================
   INITIALIZE WEBSITE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();

    generateCaptcha();
    connectButton("listenCaptcha", listenCaptcha);

    connectForm