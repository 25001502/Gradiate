// dashboard.js - Cleaned and organized version

/**
 * Initialize the dashboard when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
    // ========== MOBILE MENU TOGGLE ==========
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    mobileMenuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("show");
    });

    // ========== SEARCH FUNCTIONALITY ==========
    const searchBtn = document.querySelector(".dashboard-search button");
    searchBtn.addEventListener("click", function () {
        const searchTerm = document.querySelector(
            ".dashboard-search input"
        ).value;
        alert(
            "Search functionality coming soon! You searched for: " + searchTerm
        );
    });

    // ========== CHART.JS INTEGRATION ==========
    const ctx = document.getElementById("applicationChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
                {
                    label: "Applications",
                    data: [2, 5, 3, 8, 4, 7],
                    borderColor: "var(--secondary-blue)",
                    backgroundColor: "rgba(52, 152, 219, 0.1)",
                    fill: true,
                    tension: 0.3,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    // ========== NOTIFICATION BELL FUNCTIONALITY ==========
    const notificationBell = document.getElementById("notificationBell");
    const notificationsDropdown = notificationBell.querySelector(
        ".notifications-dropdown"
    );

    // Toggle dropdown when clicking the bell
    notificationBell.addEventListener("click", function (e) {
        e.stopPropagation(); // Prevent immediate close
        notificationBell.classList.toggle("active");
    });

    // Close when clicking outside
    document.addEventListener("click", function (event) {
        if (!notificationBell.contains(event.target)) {
            notificationBell.classList.remove("active");
        }
    });

    // Mark as read functionality
    notificationBell
        .querySelectorAll(".notification-item.unread")
        .forEach((item) => {
            item.addEventListener("click", function (e) {
                e.stopPropagation(); // Don't close dropdown when clicking notification
                this.classList.remove("unread");
                updateNotificationCount();
            });
        });

    /**
     * Update the notification count badge
     */
    function updateNotificationCount() {
        const unreadCount = notificationBell.querySelectorAll(
            ".notification-item.unread"
        ).length;
        const countElement = notificationBell.querySelector(
            ".notification-count"
        );

        if (unreadCount > 0) {
            countElement.textContent = unreadCount;
            countElement.style.display = "flex";
        } else {
            countElement.style.display = "none";
        }
    }

    // Initialize count
    updateNotificationCount();
});
