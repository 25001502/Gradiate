document.addEventListener("DOMContentLoaded", function () {
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll(".toggle-password");
    togglePasswordButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const input = this.previousElementSibling;
            const icon = this.querySelector("i");

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });
    });

    // DOM elements
    const form = document.querySelector(".register-form");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const emailInput = document.getElementById("email");

    // Create error message elements
    const passwordError = document.createElement("p");
    passwordError.className = "error-message";
    passwordInput.parentElement.parentElement.appendChild(passwordError);

    const confirmPasswordError = document.createElement("p");
    confirmPasswordError.className = "error-message";
    confirmPasswordInput.parentElement.parentElement.appendChild(
        confirmPasswordError
    );

    const emailError = document.createElement("p");
    emailError.className = "error-message";
    emailInput.parentElement.appendChild(emailError);

    // Password strength and validation
    passwordInput.addEventListener("input", () => {
        const password = passwordInput.value;
        const hints = document.querySelectorAll(".hint");
        const strengthMeter = document.querySelector(".password-strength");

        // Reset all hints
        hints.forEach((hint) => {
            hint.classList.remove("valid");
        });

        // Check password requirements
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // Update hints
        if (hasMinLength)
            document.querySelector(".hint:nth-child(1)").classList.add("valid");
        if (hasUppercase)
            document.querySelector(".hint:nth-child(2)").classList.add("valid");
        if (hasNumber)
            document.querySelector(".hint:nth-child(3)").classList.add("valid");
        if (hasSpecialChar)
            document.querySelector(".hint:nth-child(4)").classList.add("valid");

        // Update strength meter
        strengthMeter.className = "password-strength";
        const validCount = [
            hasMinLength,
            hasUppercase,
            hasNumber,
            hasSpecialChar,
        ].filter(Boolean).length;

        if (password.length === 0) {
            strengthMeter.className = "password-strength";
        } else if (password.length < 6) {
            strengthMeter.classList.add("strength-weak");
        } else if (validCount < 3) {
            strengthMeter.classList.add("strength-medium");
        } else if (validCount === 3) {
            strengthMeter.classList.add("strength-strong");
        } else {
            strengthMeter.classList.add("strength-very-strong");
        }

        checkPasswordsMatch();
    });

    confirmPasswordInput.addEventListener("input", checkPasswordsMatch);

    function checkPasswordsMatch() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = "Passwords do not match.";
        } else {
            confirmPasswordError.textContent = "";
        }
    }

    // Form submit validation
    form.addEventListener("submit", function (e) {
        let isValid = true;
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        emailError.textContent = "";

        const password = passwordInput.value;
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!(hasMinLength && hasUppercase && hasNumber && hasSpecialChar)) {
            passwordError.textContent =
                "Password must be at least 8 characters, include an uppercase letter, a number, and a special character.";
            isValid = false;
        }

        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = "Passwords do not match.";
            isValid = false;
        }

        if (!validateEmail(emailInput.value)) {
            emailError.textContent = "Please enter a valid email address.";
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });

    function validateEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }
});
