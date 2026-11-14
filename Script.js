
"use strict";

let firstNumber = 0;
let secondNumber = 0;
let correctAnswer = 0;

const registerForm = document.getElementById("registerForm");

const fullName = document.getElementById("fullName");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const captchaAnswer = document.getElementById("captchaAnswer");
const privacyPolicy = document.getElementById("privacyPolicy");

const registerStatus = document.getElementById("registerStatus");

function generateCaptcha() {
    firstNumber = Math.floor(Math.random() * 20) + 1;
    secondNumber = Math.floor(Math.random() * 20) + 1;

    correctAnswer = firstNumber + secondNumber;

    document.getElementById("captchaQuestion").textContent =
        "What is " + firstNumber + " plus " + secondNumber + "?";

    captchaAnswer.value = "";

    document.getElementById("captchaError").textContent = "";
}

document.getElementById("listenCaptcha")
.addEventListener("click", function () {

    if (!("speechSynthesis" in window)) {
        registerStatus.textContent =
            "Audio is not supported in this browser.";
        return;
    }

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        "CAPTCHA verification. " +
        firstNumber + " plus " +
        secondNumber + ". What is the answer?"
    );

    speech.lang = "en-IN";
    speech.rate = 0.85;

    speechSynthesis.speak(speech);
});

document.getElementById("changeCaptcha")
.addEventListener("click", function () {

    generateCaptcha();

    registerStatus.textContent =
        "CAPTCHA changed successfully.";
});

function showError(id, message) {
    document.getElementById(id).textContent = message;
}

function clearErrors() {
    [
        "nameError",
        "usernameError",
        "emailError",
        "passwordError",
        "confirmPasswordError",
        "captchaError",
        "privacyError"
    ].forEach(function (id) {
        showError(id, "");
    });

    registerStatus.textContent = "";
}

function getAccounts() {
    try {
        return JSON.parse(
            localStorage.getItem("digitalWorldAccounts") || "[]"
        );
    } catch (error) {
        return [];
    }
}

function showHome(account) {

    document.getElementById("registerSection").hidden = true;
    document.getElementById("homeSection").hidden = false;
    document.getElementById("aboutSection").hidden = true;
    document.getElementById("toolsSection").hidden = true;

    document.getElementById("profileName").textContent = account.name;
    document.getElementById("profileUsername").textContent = account.username;
    document.getElementById("profileEmail").textContent = account.email;

    document.getElementById("homeSection").focus();
}

function showSection(sectionName) {

    document.getElementById("registerSection").hidden = true;
    document.getElementById("homeSection").hidden = true;
    document.getElementById("aboutSection").hidden = true;
    document.getElementById("toolsSection").hidden = true;

    const section = document.getElementById(sectionName);

    section.hidden = false;
    section.focus();
}

registerForm.addEventListener("submit", function (event) {

    event.preventDefault();
    clearErrors();

    let valid = true;

    const nameValue = fullName.value.trim();
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim().toLowerCase();
    const passwordValue = password.value;
    const confirmValue = confirmPassword.value;
    const captchaValue = captchaAnswer.value.trim();

    if (!nameValue) {
        showError("nameError", "Name is required.");
        valid = false;
    }

    if (!usernameValue) {
        showError("usernameError", "Username is required.");
        valid = false;
    } else if (usernameValue.length < 3) {
        showError("usernameError",
            "Username must contain at least 3 characters.");
        valid = false;
    }

    if (!emailValue) {
        showError("emailError", "Email is required.");
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        showError("emailError", "Enter a valid email.");
        valid = false;
    }

    if (!passwordValue) {
        showError("passwordError", "Password is required.");
        valid = false;
    } else if (passwordValue.length < 8) {
        showError("passwordError",
            "Password must contain at least 8 characters.");
        valid = false;
    }

    if (!confirmValue) {
        showError("confirmPasswordError",
            "Confirm password is required.");
        valid = false;
    } else if (passwordValue !== confirmValue) {
        showError("confirmPasswordError",
            "Passwords do not match.");
        valid = false;
    }

    if (!captchaValue) {
        showError("captchaError", "CAPTCHA is required.");
        valid = false;
    } else if (!/^\d+$/.test(captchaValue) ||
               Number(captchaValue) !== correctAnswer) {

        showError("captchaError", "Incorrect CAPTCHA.");
        generateCaptcha();
        valid = false;
    }

    if (!privacyPolicy.checked) {
        showError("privacyError",
            "Please agree to the Privacy Policy.");
        valid = false;
    }

    if (!valid) {
        registerStatus.textContent =
            "Please correct the errors and try again.";
        return;
    }

    const accounts = getAccounts();

    const exists = accounts.some(function (account) {
        return account.username.toLowerCase() ===
                   usernameValue.toLowerCase() ||
               account.email.toLowerCase() === emailValue;
    });

    if (exists) {
        registerStatus.textContent =
            "Username or Email already exists.";

        showError("usernameError",
            "Please choose another Username or Email.");

        return;
    }

    const account = {
        name: nameValue,
        username: usernameValue,
        email: emailValue,
        password: passwordValue
    };

    try {

        accounts.push(account);

        localStorage.setItem(
            "digitalWorldAccounts",
            JSON.stringify(accounts)
        );

        localStorage.setItem(
            "digitalWorldCurrentUser",
            usernameValue
        );

        registerStatus.textContent =
            "Account created successfully.";

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }

        showHome(account);

    } catch (error) {

        registerStatus.textContent =
            "Account could not be saved. Please try again.";
    }
});

document.getElementById("homeButton")
.addEventListener("click", function () {

    const currentUsername =
        localStorage.getItem("digitalWorldCurrentUser");

    const account = getAccounts().find(function (item) {
        return item.username === currentUsername;
    });

    if (account) {
        showHome(account);
    } else {
        showSection("registerSection");
    }
});

document.getElementById("aboutButton")
.addEventListener("click", function () {
    showSection("aboutSection");
});

document.getElementById("toolsButton")
.addEventListener("click", function () {
    showSection("toolsSection");
});

document.getElementById("logoutButton")
.addEventListener("click", function () {

    localStorage.removeItem("digitalWorldCurrentUser");

    showSection("registerSection");

    registerStatus.textContent =
        "Logged out successfully.";
});

generateCaptcha();

(function () {

    const currentUsername =
        localStorage.getItem("digitalWorldCurrentUser");

    const account = getAccounts().find(function (item) {
        return item.username === currentUsername;
    });

    if (account) {
        showHome(account);
    }

})();
