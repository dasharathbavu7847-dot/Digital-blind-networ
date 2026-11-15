
/* ==========================================
   DIGITAL BLIND NETWORK
   SCRIPT.JS
   CREATE ACCOUNT REMOVED
========================================== */

"use strict";

/* ==========================================
   HELPER
========================================== */

const $ = (id) => document.getElementById(id);

function setStatus(id, message, error = false) {
    const element = $(id);

    if (element) {
        element.textContent = message;
        element.setAttribute("role", error ? "alert" : "status");
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

    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ==========================================
   NAVIGATION
========================================== */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.hidden = page.id !== pageId;
    });

    const page = $(pageId);

    if (page) {
        page.hidden = false;
        page.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });

    showPage("homePage");

});

/* ==========================================
   IMAGE RESIZER
========================================== */

let resizeFile = null;
let resizeBlob = null;

$("resizeImageFile")?.addEventListener("change", function () {
    resizeFile = this.files[0] || null;

    if (!resizeFile) return;

    const preview = $("resizeImagePreview");

    if (preview) {
        preview.src = URL.createObjectURL(resizeFile);
        preview.hidden = false;
    }

    setStatus("resizeInfo", "Image selected.");
});

$("resizeImage")?.addEventListener("click", function () {

    if (!resizeFile) {
        setStatus("resizeInfo", "Please select an image.", true);
        return;
    }

    const width = Number($("resizeWidth")?.value);
    const height = Number($("resizeHeight")?.value);
    const format = $("resizeFormat")?.value || "image/png";

    if (width <= 0 || height <= 0) {
        setStatus("resizeInfo", "Enter valid dimensions.", true);
        return;
    }

    const image = new Image();

    image.onload = function () {

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(image, 0, 0, width, height);

        canvas.toBlob(blob => {

            if (!blob) {
                setStatus("resizeInfo", "Resize failed.", true);
                return;
            }

            resizeBlob = blob;

            const download = $("resizeDownload");

            if (download) {
                download.href = URL.createObjectURL(blob);
                download.hidden = false;
            }

            setStatus("resizeInfo", "Image resized successfully.");

        }, format, 0.95);

    };

    image.src = URL.createObjectURL(resizeFile);

});

$("resizeDownload")?.addEventListener("click", function () {

    if (resizeBlob) {
        downloadBlob(resizeBlob, "resized-image.png");
    }

});

/* ==========================================
   IMAGE REDUCE
========================================== */

let imageFile = null;
let reducedBlob = null;

$("imageFile")?.addEventListener("change", function () {

    imageFile = this.files[0] || null;

    if (!imageFile) return;

    const preview = $("imagePreview");

    if (preview) {
        preview.src = URL.createObjectURL(imageFile);
        preview.hidden = false;
    }

    setStatus("imageSizeInfo", "Image selected.");

});

$("imageQuality")?.addEventListener("input", function () {

    if ($("qualityValue")) {
        $("qualityValue").textContent = this.value;
    }

});

$("reduceImage")?.addEventListener("click", function () {

    if (!imageFile) {
        setStatus("imageSizeInfo", "Select an image first.", true);
        return;
    }

    const format = $("imageFormat")?.value || "image/jpeg";
    const quality = Number($("imageQuality")?.value || 80) / 100;
    const maxWidth = Number($("imageMaxWidth")?.value || 1200);

    const image = new Image();

    image.onload = function () {

        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(image, 0, 0, width, height);

        canvas.toBlob(blob => {

            if (!blob) {
                setStatus("imageSizeInfo", "Image reduction failed.", true);
                return;
            }

            reducedBlob = blob;

            const download = $("imageDownload");

            if (download) {
                download.href = URL.createObjectURL(blob);
                download.hidden = false;
            }

            setStatus(
                "imageSizeInfo",
                "Reduced Image: " + Math.round(blob.size / 1024) + " KB"
            );

        }, format, quality);

    };

    image.src = URL.createObjectURL(imageFile);

});

$("removeImage")?.addEventListener("click", function () {

    imageFile = null;
    reducedBlob = null;

    if ($("imageFile")) $("imageFile").value = "";

    if ($("imagePreview")) {
        $("imagePreview").src = "";
        $("imagePreview").hidden = true;
    }

    if ($("imageDownload")) {
        $("imageDownload").hidden = true;
    }

    setStatus("imageSizeInfo", "Image removed.");

});

/* ==========================================
   PASSPORT PHOTO
========================================== */

$("makePassportPhoto")?.addEventListener("click", function () {

    const file = $("passportPhoto")?.files[0];

    if (!file) {
        setStatus("passportStatus", "Select a photo first.", true);
        return;
    }

    const image = new Image();

    image.onload = function () {

        const canvas = document.createElement("canvas");

        canvas.width = 413;
        canvas.height = 531;

        const context = canvas.getContext("2d");

        context.fillStyle = $("passportBackground")?.value || "white";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.max(
            canvas.width / image.width,
            canvas.height / image.height
        );

        const width = image.width * scale;
        const height = image.height * scale;

        context.drawImage(
            image,
            (canvas.width - width) / 2,
            (canvas.height - height) / 2,
            width,
            height
        );

        canvas.toBlob(blob => {

            if (!blob) return;

            const download = $("passportDownload");

            if (download) {
                download.href = URL.createObjectURL(blob);
                download.hidden = false;
            }

            setStatus("passportStatus", "Passport photo created.");

        }, "image/jpeg", 0.95);

    };

    image.src = URL.createObjectURL(file);

});

/* ==========================================
   TXT TOOL
========================================== */

$("downloadTxt")?.addEventListener("click", function () {

    const text = $("txtInput")?.value || "";

    const filename = ($("txtFilename")?.value || "document")
        .replace(/[<>:"/\\|?*]/g, "_");

    downloadBlob(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
        filename.endsWith(".txt") ? filename : filename + ".txt"
    );

    setStatus("txtStatus", "TXT downloaded successfully.");

});

$("clearTxt")?.addEventListener("click", function () {

    if ($("txtInput")) {
        $("txtInput").value = "";
    }

    setStatus("txtStatus", "Text cleared.");

});

/* ==========================================
   CODE EDITOR
========================================== */

$("saveCode")?.addEventListener("click", function () {

    localStorage.setItem(
        "dbn_saved_code",
        $("codeInput")?.value || ""
    );

    setStatus("codeStatus", "Code saved.");

});

$("copyCode")?.addEventListener("click", async function () {

    const code = $("codeInput")?.value || "";

    try {

        await navigator.clipboard.writeText(code);

        setStatus("codeStatus", "Code copied.");

    } catch {

        const input = $("codeInput");

        if (input) {
            input.focus();
            input.select();

            document.execCommand("copy");
        }

        setStatus("codeStatus", "Copy completed.");

    }

});

$("downloadCode")?.addEventListener("click", function () {

    const code = $("codeInput")?.value || "";
    const language = $("codeLanguage")?.value || "html";

    const extension = {
        html: "html",
        css: "css",
        javascript: "js"
    }[language] || "txt";

    downloadBlob(
        new Blob([code], { type: "text/plain;charset=utf-8" }),
        "my-code." + extension
    );

    setStatus("codeStatus", "Code downloaded.");

});

$("clearCode")?.addEventListener("click", function () {

    if ($("codeInput")) {
        $("codeInput").value = "";
    }

    setStatus("codeStatus", "Editor cleared.");

});

$("runCode")?.addEventListener("click", function () {

    const language = $("codeLanguage")?.value || "html";

    if (language !== "html") {
        setStatus("codeStatus", "Select HTML to run preview.", true);
        return;
    }

    const preview = $("codePreview");

    if (preview) {
        preview.srcdoc = $("codeInput")?.value || "";
        preview.hidden = false;
    }

    setStatus("codeStatus", "Preview opened.");

});

$("closePreview")?.addEventListener("click", function () {

    if ($("codePreview")) {
        $("codePreview").srcdoc = "";
        $("codePreview").hidden = true;
    }

    setStatus("codeStatus", "Preview closed.");

});

/* ==========================================
   VIDEO CONTROLS
========================================== */

$("videoFile")?.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const video = $("videoPreview");

    if (video) {
        video.src = URL.createObjectURL(file);
    }

    setStatus("videoToolStatus", "Video selected.");

});

$("rewindVideo")?.addEventListener("click", function () {

    const video = $("videoPreview");

    if (video) {
        video.currentTime = Math.max(0, video.currentTime - 10);
    }

});

$("forwardVideo")?.addEventListener("click", function () {

    const video = $("videoPreview");

    if (video) {
        video.currentTime = Math.min(
            video.duration || Infinity,
            video.currentTime + 10
        );
    }

});

/* ==========================================
   AUDIO CONTROLS
========================================== */

$("audioFile")?.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const audio = $("audioPreview");

    if (audio) {
        audio.src = URL.createObjectURL(file);
    }

    setStatus("audioToolStatus", "Audio selected.");

});

$("playVocalPreview")?.addEventListener("click", function () {

    $("audioPreview")?.play();

});

$("pauseVocalPreview")?.addEventListener("click", function () {

    $("audioPreview")?.pause();

});

/* ==========================================
   ACCOUNT SYSTEM REMOVED
========================================== */

/*
    CREATE ACCOUNT REMOVED
    REGISTER REMOVED
    LOGIN REMOVED
    LOGOUT REMOVED
    CAPTCHA REMOVED
    ACCOUNT STORAGE REMOVED
*/

/* ==========================================
   WEBSITE READY
========================================== */

console.log("Digital Blind Network Ready - No Account System");
