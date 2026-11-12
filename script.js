
/* =========================================
   DIGITAL BLIND NETWORK
   Accessible Website JavaScript
   Developer: Dashrath Babu
   Junior Developer: Umakant Das
========================================= */

"use strict";

/* GLOBAL HELPERS */

const $ = (id) => document.getElementById(id);

let ffmpegInstance = null;
let ffmpegLoadingPromise = null;

let currentImage = null;
let currentResizeImage = null;
let currentAudioFile = null;
let currentVideoFile = null;

let audioObjectURL = null;
let videoObjectURL = null;

/* STATUS MESSAGE */

function announce(message) {
    const status = $("status");

    if (!status) return;

    status.textContent = "";

    setTimeout(() => {
        status.textContent = message;
    }, 100);
}

function setBusy(button, busy, text = "Please wait...") {
    if (!button) return;

    if (busy) {
        button.dataset.originalText = button.textContent;
        button.textContent = text;
        button.disabled = true;
    } else {
        button.textContent =
            button.dataset.originalText || button.textContent;
        button.disabled = false;
    }
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function safeFilename(name) {
    return String(name || "download")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .trim() || "download";
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = safeFilename(filename);

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function showDownloadLink(element, blob, filename) {
    if (!element) return;

    if (element.dataset.downloadURL) {
        URL.revokeObjectURL(element.dataset.downloadURL);
    }

    const url = URL.createObjectURL(blob);

    element.href = url;
    element.download = safeFilename(filename);
    element.dataset.downloadURL = url;
    element.hidden = false;
}

/* HOME AND ABOUT NAVIGATION */

function initializeNavigation() {
    const buttons = document.querySelectorAll("[data-page]");
    const pages = document.querySelectorAll(".page");

    function showPage(pageName) {
        pages.forEach(page => {
            page.hidden = page.id !== pageName;
        });

        buttons.forEach(button => {
            const active = button.dataset.page === pageName;

            button.classList.toggle("active", active);

            if (active) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        announce(
            pageName === "about"
                ? "About page opened"
                : "Home page opened"
        );
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });

    showPage("home");
}

/* INDIA TIME GREETING */

function initializeGreeting() {
    const greeting = $("welcomeMessage");

    if (!greeting) return;

    const hour = Number(
        new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            hour12: false,
            timeZone: "Asia/Kolkata"
        }).format(new Date())
    );

    let message;

    if (hour >= 5 && hour < 12) {
        message = "Good Morning! Welcome to Digital Blind Network";
    } else if (hour >= 12 && hour < 17) {
        message = "Good Afternoon! Welcome to Digital Blind Network";
    } else if (hour >= 17 && hour < 21) {
        message = "Good Evening! Welcome to Digital Blind Network";
    } else {
        message = "Good Night! Welcome to Digital Blind Network";
    }

    greeting.textContent = message;
}

/* FOOTER YEAR */

function initializeYear() {
    if ($("year")) {
        $("year").textContent = new Date().getFullYear();
    }
}

/* TEXT TO TXT */

function initializeTextDownload() {
    const button = $("downloadTxt");

    if (!button) return;

    button.addEventListener("click", () => {
        const text = $("txtInput")?.value || "";
        const filename = safeFilename(
            $("txtFilename")?.value || "my-text"
        );

        if (!text.trim()) {
            announce("Please enter some text first.");
            $("txtInput")?.focus();
            return;
        }

        const blob = new Blob(
            ["\uFEFF", text],
            { type: "text/plain;charset=utf-8" }
        );

        downloadBlob(blob, filename + ".txt");

        announce("TXT file downloaded successfully.");
    });
}

/* IMAGE LOADER */

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Unable to load image."));
        };

        image.src = url;
    });
}

/* IMAGE RESIZER */

function initializeImageResizer() {
    const fileInput = $("resizeImageFile");
    const button = $("resizeImage");

    if (!fileInput || !button) return;

    fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            announce("Please select a valid image.");
            return;
        }

        currentResizeImage = file;

        try {
            const image = await loadImage(file);

            $("resizeWidth").value = image.naturalWidth;
            $("resizeHeight").value = image.naturalHeight;

            const preview = $("resizeImagePreview");

            if (preview) {
                preview.replaceChildren();

                const img = document.createElement("img");
                img.src = URL.createObjectURL(file);
                img.alt = "Selected image preview";

                preview.appendChild(img);
            }

            announce("Image selected successfully.");

        } catch (error) {
            announce(error.message);
        }
    });

    button.addEventListener("click", async () => {
        if (!currentResizeImage) {
            announce("Please select an image first.");
            fileInput.focus();
            return;
        }

        const width = Number($("resizeWidth").value);
        const height = Number($("resizeHeight").value);
        const format = $("resizeFormat").value;

        if (
            !Number.isInteger(width) ||
            !Number.isInteger(height) ||
            width < 1 ||
            height < 1 ||
            width > 12000 ||
            height > 12000
        ) {
            announce("Enter valid image dimensions.");
            return;
        }

        setBusy(button, true, "Resizing image...");

        try {
            const image = await loadImage(currentResizeImage);
            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Canvas is not supported.");
            }

            if (format === "image/jpeg") {
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, width, height);
            }

            context.drawImage(image, 0, 0, width, height);

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(result => {
                    if (result) resolve(result);
                    else reject(new Error("Image export failed."));
                }, format, 0.92);
            });

            const extension = {
                "image/png": "png",
                "image/jpeg": "jpg",
                "image/webp": "webp"
            }[format] || "png";

            const filename =
                safeFilename(
                    currentResizeImage.name.replace(/\.[^.]+$/, "")
                ) + "-resized." + extension;

            showDownloadLink(
                $("resizeDownload"),
                blob,
                filename
            );

            $("resizeInfo").textContent =
                "Original: " + image.naturalWidth + " × " +
                image.naturalHeight +
                ". New: " + width + " × " + height +
                ". Size: " + formatBytes(blob.size);

            announce("Image resized successfully.");

        } catch (error) {
            announce("Image resize failed: " + error.message);
        } finally {
            setBusy(button, false);
        }
    });
}

/* IMAGE REDUCE */

function initializeImageReducer() {
    const fileInput = $("imageFile");
    const button = $("reduceImage");
    const quality = $("imageQuality");

    if (!fileInput || !button) return;

    quality?.addEventListener("input", () => {
        $("qualityValue").textContent = quality.value;
    });

    fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            announce("Please select a valid image.");
            return;
        }

        currentImage = file;

        try {
            const image = await loadImage(file);
            const preview = $("imagePreview");

            if (preview) {
                preview.replaceChildren();

                const img = document.createElement("img");
                img.src = URL.createObjectURL(file);
                img.alt = "Original image preview";

                preview.appendChild(img);
            }

            $("imageSizeInfo").textContent =
                "Original size: " + formatBytes(file.size) +
                ". Dimensions: " + image.naturalWidth +
                " × " + image.naturalHeight;

            announce("Image selected successfully.");

        } catch (error) {
            announce(error.message);
        }
    });

    button.addEventListener("click", async () => {
        if (!currentImage) {
            announce("Please select an image first.");
            fileInput.focus();
            return;
        }

        const format = $("imageFormat").value;
        const qualityValue = Number(quality.value) / 100;
        const maxWidth = Number($("imageMaxWidth").value);

        if (
            !Number.isFinite(maxWidth) ||
            maxWidth < 1 ||
            maxWidth > 12000
        ) {
            announce("Enter a valid maximum image width.");
            return;
        }

        setBusy(button, true, "Reducing image...");

        try {
            const image = await loadImage(currentImage);

            const scale = Math.min(
                1,
                maxWidth / image.naturalWidth
            );

            const width = Math.max(
                1,
                Math.round(image.naturalWidth * scale)
            );

            const height = Math.max(
                1,
                Math.round(image.naturalHeight * scale)
            );

            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Canvas is not supported.");
            }

            if (format === "image/jpeg") {
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, width, height);
            }

            context.drawImage(image, 0, 0, width, height);

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(result => {
                    if (result) resolve(result);
                    else reject(new Error("Image export failed."));
                }, format, qualityValue);
            });

            const extension = {
                "image/png": "png",
                "image/jpeg": "jpg",
                "image/webp": "webp"
            }[format] || "jpg";

            const filename =
                safeFilename(
                    currentImage.name.replace(/\.[^.]+$/, "")
                ) + "-reduced." + extension;

            showDownloadLink(
                $("imageDownload"),
                blob,
                filename
            );

            const difference = (
                100 - (blob.size / currentImage.size) * 100
            ).toFixed(1);

            $("imageSizeInfo").textContent =
                "Original: " + formatBytes(currentImage.size) +
                ". Reduced: " + formatBytes(blob.size) +
                ". Size change: " + difference + "%" +
                ". Dimensions: " + width + " × " + height;

            announce("Image reduction completed.");

        } catch (error) {
            announce("Image reduction failed: " + error.message);
        } finally {
            setBusy(button, false);
        }
    });
}

/* VIDEO PLAYER */

function initializeVideoPlayer() {
    const fileInput = $("videoFile");
    const video = $("videoPreview");

    if (!fileInput || !video) return;

    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            announce("Please select a valid video.");
            return;
        }

        currentVideoFile = file;

        if (videoObjectURL) {
            URL.revokeObjectURL(videoObjectURL);
        }

        videoObjectURL = URL.createObjectURL(file);
        video.src = videoObjectURL;

        $("videoStart").value = 0;

        announce("Video loaded successfully.");
    });

    $("rewindVideo")?.addEventListener("click", () => {
        video.currentTime = Math.max(
            0,
            video.currentTime - 10
        );

        announce("Rewind 10 seconds.");
    });

    $("forwardVideo")?.addEventListener("click", () => {
        video.currentTime = Math.min(
            Number.isFinite(video.duration)
                ? video.duration
                : video.currentTime + 10,
            video.currentTime + 10
        );

        announce("Forward 10 seconds.");
    });

    video.addEventListener("loadedmetadata", () => {
        $("videoEnd").value = Math.floor(video.duration);

        announce(
            "Video duration: " +
            Math.floor(video.duration) + " seconds."
        );
    });
}

/* AUDIO PLAYER */

function initializeAudioPlayer() {
    const fileInput = $("audioFile");
    const audio = $("audioPreview");

    if (!fileInput || !audio) return;

    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("audio/")) {
            announce("Please select a valid audio.");
            return;
        }

        currentAudioFile = file;

        if (audioObjectURL) {
            URL.revokeObjectURL(audioObjectURL);
        }

        audioObjectURL = URL.createObjectURL(file);
        audio.src = audioObjectURL;

        $("audioStart").value = 0;

        announce("Audio loaded successfully.");
    });

    audio.addEventListener("loadedmetadata", () => {
        $("audioEnd").value = Math.floor(audio.duration);

        announce(
            "Audio duration: " +
            Math.floor(audio.duration) + " seconds."
        );
    });
}

/* FFMPEG LOADER */

async function loadFFmpeg() {
    if (ffmpegInstance && ffmpegInstance.loaded) {
        return ffmpegInstance;
    }

    if (ffmpegLoadingPromise) {
        return ffmpegLoadingPromise;
    }

    ffmpegLoadingPromise = (async () => {
        announce("Loading media processing engine.");

        const { FFmpeg } = await import(
            "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/ffmpeg.js"
        );

        const { toBlobURL } = await import(
            "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js"
        );

        const ffmpeg = new FFmpeg();

        ffmpeg.on("progress", ({ progress }) => {
            if (Number.isFinite(progress)) {
                announce(
                    "Processing media " +
                    Math.round(progress * 100) + "%"
                );
            }
        });

        const coreURL = await toBlobURL(
            "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js",
            "text/javascript"
        );

        const wasmURL = await toBlobURL(
            "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm",
            "application/wasm"
        );

        await ffmpeg.load({
            coreURL,
            wasmURL
        });

        ffmpegInstance = ffmpeg;

        announce("Media engine loaded successfully.");

        return ffmpeg;
    })();

    try {
        return await ffmpegLoadingPromise;
    } finally {
        ffmpegLoadingPromise = null;
    }
}

/* TRIM VALIDATION */

function getExtension(filename, fallback) {
    const match = String(filename).match(/\.([a-zA-Z0-9]+)$/);

    return match ? match[1].toLowerCase() : fallback;
}

function validateTrim(start, end, duration) {
    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        end <= start
    ) {
        throw new Error("Invalid start or end time.");
    }

    if (
        Number.isFinite(duration) &&
        duration > 0 &&
        end > duration
    ) {
        throw new Error("End time exceeds media duration.");
    }
}

/* AUDIO TRIM AND MP3 EXPORT */

function initializeAudioTrimming() {
    const button = $("trimAudio");

    if (!button) return;

    button.addEventListener("click", async () => {
        if (!currentAudioFile) {
            announce("Please upload an audio file first.");
            $("audioFile").focus();
            return;
        }

        const start = Number($("audioStart").value);
        const end = Number($("audioEnd").value);

        setBusy(button, true, "Preparing audio...");

        let inputName = "input-audio";
        let outputName = "output-audio.mp3";

        try {
            validateTrim(start, end);

            const ffmpeg = await loadFFmpeg();

            inputName =
                "input-audio." +
                getExtension(currentAudioFile.name, "audio");

            await ffmpeg.writeFile(
                inputName,
                new Uint8Array(
                    await currentAudioFile.arrayBuffer()
                )
            );

            announce("Trimming audio. Please wait.");

            const result = await ffmpeg.exec([
                "-ss", String(start),
                "-i", inputName,
                "-t", String(end - start),
                "-vn",
                "-codec:a", "libmp3lame",
                "-q:a", "2",
                outputName
            ]);

            if (result !== 0) {
                throw new Error("Audio conversion failed.");
            }

            const data = await ffmpeg.readFile(outputName);

            const blob = new Blob(
                [data],
                { type: "audio/mpeg" }
            );

            showDownloadLink(
                $("audioDownload"),
                blob,
                safeFilename(
                    currentAudioFile.name.replace(/\.[^.]+$/, "")
                ) + "-trimmed.mp3"
            );

            announce("Audio trimming completed.");

        } catch (error) {
            announce("Audio error: " + error.message);
        } finally {
            try {
                if (ffmpegInstance) {
                    await ffmpegInstance.deleteFile(inputName);
                    await ffmpegInstance.deleteFile(outputName);
                }
            } catch (_) {}

            setBusy(button, false);
        }
    });
}

/* VIDEO TRIM AND MP4 EXPORT */

function initializeVideoTrimming() {
    const button = $("trimVideo");

    if (!button) return;

    button.addEventListener("click", async () => {
        if (!currentVideoFile) {
            announce("Please upload a video first.");
            $("videoFile").focus();
            return;
        }

        const start = Number($("videoStart").value);
        const end = Number($("videoEnd").value);

        const video = $("videoPreview");

        const duration = Number.isFinite(video.duration)
            ? video.duration
            : undefined;

        setBusy(button, true, "Preparing video...");

        let inputName = "input-video";
        let outputName = "output-video.mp4";

        try {
            validateTrim(start, end, duration);

            const ffmpeg = await loadFFmpeg();

            inputName =
                "input-video." +
                getExtension(currentVideoFile.name, "mp4");

            await ffmpeg.writeFile(
                inputName,
                new Uint8Array(
                    await currentVideoFile.arrayBuffer()
                )
            );

            announce("Video processing started.");

            const result = await ffmpeg.exec([
                "-ss", String(start),
                "-i", inputName,
                "-t", String(end - start),
                "-map", "0:v:0",
                "-map", "0:a?",
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart",
                outputName
            ]);

            if (result !== 0) {
                throw new Error("Video conversion failed.");
            }

            const data = await ffmpeg.readFile(outputName);

            const blob = new Blob(
                [data],
                { type: "video/mp4" }
            );

            showDownloadLink(
                $("videoDownload"),
                blob,
                safeFilename(
                    currentVideoFile.name.replace(/\.[^.]+$/, "")
                ) + "-trimmed.mp4"
            );

            announce("Video trimming completed.");

        } catch (error) {
            announce("Video error: " + error.message);
        } finally {
            try {
                if (ffmpegInstance) {
                    await ffmpegInstance.deleteFile(inputName);
                    await ffmpegInstance.deleteFile(outputName);
                }
            } catch (_) {}

            setBusy(button, false);
        }
    });
}

/* START WEBSITE */

document.addEventListener("DOMContentLoaded", () => {
    initializeNavigation();
    initializeGreeting();
    initializeYear();
    initializeTextDownload();
    initializeImageResizer();
    initializeImageReducer();
    initializeVideoPlayer();
    initializeAudioPlayer();
    initializeAudioTrimming();
    initializeVideoTrimming();

    announce("Digital Blind Network is ready.");
});
