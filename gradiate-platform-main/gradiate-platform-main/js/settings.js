/**
 * Main settings page functionality
 * Handles modals, password validation, and interactive elements
 */
document.addEventListener("DOMContentLoaded", function () {
    // Cache DOM elements
    const modals = {
        "email-modal": document.getElementById("email-modal"),
        "password-modal": document.getElementById("password-modal"),
        "delete-modal": document.getElementById("delete-modal"),
    };

    // Toggle password visibility for all password inputs
    document.querySelectorAll(".toggle-password").forEach((button) => {
        button.addEventListener("click", function () {
            const input = this.previousElementSibling;
            const icon = this.querySelector("i");

            // Toggle input type and icon
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

    /**
     * Password strength and validation functionality
     */
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById(
        "confirm-new-password"
    );
    const passwordMatchError = document.getElementById("password-match-error");

    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", validatePasswordStrength);
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", checkPasswordsMatch);
    }

    /**
     * Validates password strength and updates UI indicators
     */
    function validatePasswordStrength() {
        const password = this.value;
        const hints = document.querySelectorAll("#password-modal .hint");
        const strengthMeter = document.querySelector(
            "#password-modal .password-strength"
        );

        // Reset all hints
        hints.forEach((hint) => {
            hint.classList.remove("valid");
        });

        // Check password requirements
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // Update hints based on validation
        if (hasMinLength)
            document
                .querySelector("#password-modal .hint:nth-child(1)")
                .classList.add("valid");
        if (hasUppercase)
            document
                .querySelector("#password-modal .hint:nth-child(2)")
                .classList.add("valid");
        if (hasNumber)
            document
                .querySelector("#password-modal .hint:nth-child(3)")
                .classList.add("valid");
        if (hasSpecialChar)
            document
                .querySelector("#password-modal .hint:nth-child(4)")
                .classList.add("valid");

        // Update strength meter visual indicators
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
    }

    /**
     * Checks if passwords match and displays error if they don't
     */
    function checkPasswordsMatch() {
        if (newPasswordInput && confirmPasswordInput) {
            if (
                newPasswordInput.value !== confirmPasswordInput.value &&
                confirmPasswordInput.value.length > 0
            ) {
                passwordMatchError.textContent = "Passwords do not match.";
            } else {
                passwordMatchError.textContent = "";
            }
        }
    }

    // Handle password form submission
    const passwordForm = document.getElementById("password-form");
    if (passwordForm) {
        passwordForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const password = newPasswordInput.value;
            const hasMinLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            // Validate password requirements
            if (
                !(hasMinLength && hasUppercase && hasNumber && hasSpecialChar)
            ) {
                alert(
                    "Password must be at least 8 characters, include an uppercase letter, a number, and a special character."
                );
                return;
            }

            // Validate password match
            if (newPasswordInput.value !== confirmPasswordInput.value) {
                alert("Passwords do not match.");
                return;
            }

            // Simulate successful password change
            alert("Password successfully changed (simulated)");
            this.reset();
            modals["password-modal"].style.display = "none";
        });
    }

    // Modal control functions
    document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const targetModal = this.getAttribute("data-target");
            if (modals[targetModal]) {
                modals[targetModal].style.display = "block";
            }
        });
    });

    // Close modals when X or cancel button is clicked
    document
        .querySelectorAll(".close-modal, .cancel-btn")
        .forEach((closeBtn) => {
            closeBtn.addEventListener("click", function () {
                this.closest(".modal").style.display = "none";
            });
        });

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
        Object.values(modals).forEach((modal) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    // Delete account confirmation
    const deleteAccountBtn = document.getElementById("delete-account-btn");
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", function () {
            modals["delete-modal"].style.display = "block";
        });
    }

    // Email form submission
    const emailForm = document.getElementById("email-form");
    if (emailForm) {
        emailForm.addEventListener("submit", function (e) {
            e.preventDefault();
            alert("Email change request submitted (simulated)");
            this.reset();
            modals["email-modal"].style.display = "none";
        });
    }

    // Delete form submission
    const deleteForm = document.getElementById("delete-form");
    if (deleteForm) {
        deleteForm.addEventListener("submit", function (e) {
            e.preventDefault();
            alert("Account deletion request submitted (simulated)");
            this.reset();
            modals["delete-modal"].style.display = "none";
        });
    }

    // Clickable settings items
    document.querySelectorAll(".setting-item.clickable").forEach((item) => {
        item.addEventListener("click", function () {
            const title = this.querySelector("h3").textContent;
            alert(`Navigating to ${title} section (simulated)`);
        });
    });

    // Initialize toggle switches with default values
    document.querySelectorAll(".toggle-switch input").forEach((toggle) => {
        // Default state based on ID (simulating saved preferences)
        toggle.checked =
            toggle.id.includes("email") || toggle.id.includes("recruiter");
    });
});
