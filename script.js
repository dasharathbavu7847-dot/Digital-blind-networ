
// ==========================================
// DIGITAL BLIND NETWORK
// Accessible Website JavaScript
// ==========================================

"use strict";

// ==========================================
// 1. WELCOME GREETING
// ==========================================

function updateGreeting() {
    const greetingElement = document.getElementById("greeting");

    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greeting = "";

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning!";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon!";
    } else if (hour >= 17 && hour < 21) {
        greeting = "Good Evening!";
    } else {
        greeting = "Good Night!";
    }

    greetingElement.textContent =
        greeting + " Welcome to Digital Blind Network.";
}

// ==========================================
// 2. CURRENT YEAR
// ==========================================

function updateYear() {
    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ==========================================
// 3. ACCESSIBLE ANNOUNCEMENTS
// ==========================================

function announceMessage(message) {
    let announcement = document.getElementById("announcement");

    if (!announcement) {
        announcement = document.createElement("div");
        announcement.id = "announcement";
        announcement.setAttribute("role", "status");
        announcement.setAttribute("aria-live", "polite");

        announcement.style.position = "absolute";
        announcement.style.width = "1px";
        announcement.style.height = "1px";
        announcement.style.padding = "0";
        announcement.style.margin = "-1px";
        announcement.style.overflow = "hidden";
        announcement.style.clip = "rect(0, 0, 0, 0)";
        announcement.style.whiteSpace = "nowrap";
        announcement.style.border = "0";

        document.body.appendChild(announcement);
    }

    announcement.textContent = message;
}

// ==========================================
// 4. WELCOME BUTTON
// ==========================================

function welcomeUser() {
    announceMessage(
        "Welcome to Digital Blind Network. " +
        "Explore accessible digital tools and resources."
    );
}

// ==========================================
// 5. YOUTUBE CHANNEL
// ==========================================

function openYouTube() {
    window.open(
        "https://www.youtube.com/@anysolutionofblindpeople",
        "_blank",
        "noopener,noreferrer"
    );
}

// ==========================================
// 6. WHATSAPP GROUP
// ==========================================

function openWhatsAppGroup() {
    window.open(
        "https://chat.whatsapp.com/ILZQ9pGR1za6MIpDCizyN1?s=cl&p=a&iam=2",
        "_blank",
        "noopener,noreferrer"
    );
}

// ==========================================
// 7. DISCORD SERVER
// ==========================================

function openDiscord() {
    window.open(
        "https://discord.gg/fuqvfDhJk",
        "_blank",
        "noopener,noreferrer"
    );
}

// ==========================================
// 8. WHATSAPP CHANNEL
// ==========================================

function openWhatsAppChannel() {
    announceMessage(
        "WhatsApp Channel link is not configured yet."
    );
}

// ==========================================
// 9. TEXT FILE CREATOR
// ==========================================

function createTextFile() {
    const text = prompt(
        "Enter the text you want to save:"
    );

    if (text === null) {
        announceMessage("Text file creation cancelled.");
        return;
    }

    const blob = new Blob(
        [text],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = "digital-blind-network.txt";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    announceMessage(
        "Your text file download has started."
    );
}

// ==========================================
// 10. AUDIO EDITING INFORMATION
// ==========================================

function audioEditingInfo() {
    announceMessage(
        "Audio editing section. " +
        "Explore audio recording, trimming, " +
        "editing and audio management tools."
    );
}

// ==========================================
// 11. VIDEO EDITING INFORMATION
// ==========================================

function videoEditingInfo() {
    announceMessage(
        "Video editing section. " +
        "Explore video cutting, trimming, " +
        "editing and video management tools."
    );
}

// ==========================================
// 12. ACCESSIBILITY INFORMATION
// ==========================================

function accessibilityInfo() {
    announceMessage(
        "Accessibility resources include screen readers, " +
        "accessible applications and technology tutorials."
    );
}

// ==========================================
// 13. BACK TO TOP
// ==========================================

function backToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    announceMessage("Returned to the top of the website.");
}

// ==========================================
// 14. KEYBOARD ACCESSIBILITY
// ==========================================

document.addEventListener("keydown", function (event) {

    if (event.altKey && event.key === "Home") {
        backToTop();
    }

});

// ==========================================
// 15. INITIALIZE WEBSITE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    updateGreeting();
    updateYear();

    console.log(
        "Digital Blind Network website initialized successfully."
    );

});

// ==========================================
// END DIGITAL BLIND NETWORK SCRIPT
// ==========================================
