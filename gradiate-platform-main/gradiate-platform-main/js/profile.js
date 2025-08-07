document.addEventListener("DOMContentLoaded", function () {
    // Edit button functionality
    document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const sectionId = button.dataset.section;
            const isEditing = button.textContent === "Edit";

            button.textContent = isEditing ? "Save" : "Edit";
            toggleEditMode(sectionId, isEditing);

            if (!isEditing) {
                saveSection(sectionId);
                showToast("Changes saved successfully");
            }
        });
    });

    // Role select change handler
    const roleSelect = document.getElementById("edit-role");
    if (roleSelect) {
        roleSelect.addEventListener("change", () => {
            updateAcademicFields(roleSelect.value);
        });
    }

    // Initialize file uploads
    initFileUpload("report-card");
    initFileUpload("transcript");
});

function toggleEditMode(sectionId, isEditing) {
    const section = document.getElementById(sectionId);

    section.querySelectorAll(".edit-input").forEach((input) => {
        input.style.display = isEditing ? "block" : "none";
    });

    section.querySelectorAll(".detail-value").forEach((value) => {
        value.style.display = isEditing ? "none" : "block";
    });

    section.querySelectorAll(".edit-only").forEach((el) => {
        el.style.display = isEditing ? "table-cell" : "none";
    });

    if (sectionId === "academic-info") {
        const roleValue =
            document.getElementById("edit-role")?.value ||
            document.getElementById("role").textContent;
        updateAcademicFields(roleValue);
    }
}

function updateAcademicFields(role) {
    document.querySelector(".student-fields").style.display =
        role === "Graduate" ? "none" : "block";
    document.querySelector(".graduate-fields").style.display =
        role === "Graduate" ? "block" : "none";
}

function saveSection(sectionId) {
    const section = document.getElementById(sectionId);

    section.querySelectorAll(".detail-item").forEach((item) => {
        const span = item.querySelector(".detail-value");
        const input = item.querySelector(".edit-input");

        if (!input || !span) return;

        if (input.tagName === "SELECT") {
            span.textContent = input.options[input.selectedIndex].textContent;
        } else if (input.tagName === "INPUT" && input.type !== "file") {
            span.textContent = input.value;
        }
    });
}

function initFileUpload(type) {
    const fileInput = document.getElementById(`edit-${type}`);
    const uploadBtn = document.getElementById(`upload-${type}`);
    const removeBtn = document.getElementById(`remove-${type}`);
    const preview = document.getElementById(`${type}-preview`);
    const fileLink = document.getElementById(`${type}-link`);
    const noFile = document.getElementById(`no-${type}`);

    if (!fileInput) return;

    uploadBtn?.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(
                e.target.files[0],
                type,
                preview,
                fileLink,
                noFile
            );
        }
    });

    removeBtn?.addEventListener("click", () => {
        fileInput.value = "";
        fileLink.style.display = "none";
        noFile.style.display = "inline";
        fileLink.href = "#";
        fileLink.textContent = "";
        showToast(`${type.replace("-", " ")} removed`);
    });
}

function handleFileUpload(file, type, preview, fileLink, noFile) {
    // Validate file
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
        showToast("Please upload a PDF, JPG, or PNG file");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast("File size must be less than 5MB");
        return;
    }

    // Update UI
    fileLink.textContent = file.name;
    fileLink.style.display = "inline";
    noFile.style.display = "none";

    // Clear previous preview
    preview.innerHTML = "";

    // Create icon based on file type
    const icon = document.createElement("i");
    icon.className = file.type.includes("image")
        ? "fas fa-file-image file-icon"
        : "fas fa-file-pdf file-icon";

    preview.appendChild(icon);
    preview.appendChild(fileLink);

    showToast(`${type.replace("-", " ")} uploaded successfully`);
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
