document.addEventListener('DOMContentLoaded', function () {
    const moodForm = document.getElementById('mood-form');
    const dateInput = document.getElementById('date');
    const moodInput = document.getElementById('mood');
    const moodButtons = document.querySelectorAll('.mood-btn');
    const stressSlider = document.getElementById('stress');
    const stressValue = document.getElementById('stress-value');
    const activitiesInput = document.getElementById('activities');
    const filterDateInput = document.getElementById('filter-date');
    const entryList = document.getElementById('entry-list');
    const logMoodSection = document.getElementById('log-mood-section');
    const pastEntriesSection = document.getElementById('past-entries-section');
    const logMoodBtn = document.getElementById('log-mood-btn');
    const viewEntriesBtn = document.getElementById('view-entries-btn');
    const moodTotalCtx = document.getElementById('mood-total-chart').getContext('2d');
    const stressCtx = document.getElementById('stress-chart').getContext('2d');
    const forumForm = document.getElementById('forum-form');
    const forumMessages = document.getElementById('forum-messages');
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const homeBtn = document.getElementById('home-btn');
    const profileBtn = document.getElementById('profile-btn');
    const forumBtn = document.getElementById('forum-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profilePage = document.getElementById('profile-page');
    const forumPage = document.getElementById('forum-page');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const mainContainer = document.getElementById('main-container');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const goToLogin = document.getElementById('go-to-login');
    const goToRegister = document.getElementById('go-to-register');

    let moodData = [];
    let stressData = [];
    let labels = [];
    const storedEntries = JSON.parse(localStorage.getItem('entries')) || [];

    const isLoggedIn = () => localStorage.getItem('isLoggedIn') === 'true';

    moodButtons.forEach(button => {
        button.addEventListener('click', function () {
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            moodInput.value = this.dataset.mood;
        });
    });

    function initCharts() {
        storedEntries.forEach(entry => {
            labels.push(entry.date);
            moodData.push(entry.mood);
            stressData.push(entry.stress);
        });

        const moodTotalChart = new Chart(moodTotalCtx, {
            type: 'pie',
            data: {
                labels: getMoodLabels(),
                datasets: [{
                    label: 'Mood Total',
                    data: getMoodCount(),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw}`;
                            }
                        }
                    }
                }
            }
        });

        const stressChart = new Chart(stressCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Stress Level',
                        data: stressData,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        stressSlider.addEventListener('input', function () {
            stressValue.textContent = stressSlider.value;
        });

        return { moodTotalChart, stressChart };
    }

    let { moodTotalChart, stressChart } = initCharts();

    moodForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const date = dateInput.value;
        const mood = moodInput.value;
        const stress = stressSlider.value;
        const activities = activitiesInput.value;
        if (date && mood && stress) {
            addMoodEntry(date, mood, stress, activities);
            dateInput.value = '';
            moodInput.value = '';
            stressSlider.value = '5';
            stressValue.textContent = '5';
            activitiesInput.value = '';
            moodButtons.forEach(btn => btn.classList.remove('selected'));
        }
    });

    logMoodBtn.addEventListener('click', function () {
        logMoodSection.classList.remove('hidden');
        pastEntriesSection.classList.add('hidden');
    });

    viewEntriesBtn.addEventListener('click', function () {
        logMoodSection.classList.add('hidden');
        pastEntriesSection.classList.remove('hidden');
        displayEntries(storedEntries);
    });

    filterDateInput.addEventListener('input', function () {
        const filterDate = filterDateInput.value;
        const filteredEntries = storedEntries.filter(entry => entry.date === filterDate);
        displayEntries(filteredEntries);
    });

    entryList.addEventListener('click', function (e) {
        if (e.target.classList.contains('edit-btn')) {
            const entryIndex = e.target.dataset.index;
            editEntry(entryIndex);
        } else if (e.target.classList.contains('delete-btn')) {
            const entryIndex = e.target.dataset.index;
            deleteEntry(entryIndex);
        }
    });

    function addMoodEntry(date, mood, stress, activities) {
        const entry = { date, mood, stress: parseInt(stress), activities };
        storedEntries.push(entry);
        localStorage.setItem('entries', JSON.stringify(storedEntries));

        labels.push(date);
        moodData.push(mood);
        stressData.push(stress);
        updateCharts();
    }

    function updateCharts() {
        moodTotalChart.data.labels = getMoodLabels();
        moodTotalChart.data.datasets[0].data = getMoodCount();
        moodTotalChart.update();

        stressChart.data.labels = labels;
        stressChart.data.datasets[0].data = stressData;
        stressChart.update();
    }

    function displayEntries(entries) {
        entryList.innerHTML = '';
        entries.forEach((entry, index) => {
            const li = document.createElement('li');
            const moodIcon = getMoodIcon(entry.mood);
            li.innerHTML = `
                <div>
                    <strong>Date:</strong> ${entry.date}<br>
                    <strong>Mood:</strong> ${moodIcon} ${entry.mood}<br>
                    <strong>Stress Level:</strong> ${entry.stress}<br>
                    <strong>Activities:</strong> ${entry.activities}<br>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;
            entryList.appendChild(li);
        });
    }

    function editEntry(index) {
        const entry = storedEntries[index];
        dateInput.value = entry.date;
        moodInput.value = entry.mood;
        stressSlider.value = entry.stress;
        stressValue.textContent = entry.stress;
        activitiesInput.value = entry.activities;

        storedEntries.splice(index, 1);
        localStorage.setItem('entries', JSON.stringify(storedEntries));
        updateCharts();
        displayEntries(storedEntries);
    }

    function deleteEntry(index) {
        storedEntries.splice(index, 1);
        labels.splice(index, 1);
        stressData.splice(index, 1);
        localStorage.setItem('entries', JSON.stringify(storedEntries));
        updateCharts();
        displayEntries(storedEntries);
    }

    function getMoodLabels() {
        return ['Happy', 'Sad', 'Anxious', 'Stressed', 'Calm'];
    }

    function getMoodCount() {
        const moodCount = [0, 0, 0, 0, 0];

        storedEntries.forEach(entry => {
            switch (entry.mood) {
                case 'Happy':
                    moodCount[0]++;
                    break;
                case 'Sad':
                    moodCount[1]++;
                    break;
                case 'Anxious':
                    moodCount[2]++;
                    break;
                case 'Stressed':
                    moodCount[3]++;
                    break;
                case 'Calm':
                    moodCount[4]++;
                    break;
                default:
                    break;
            }
        });

        return moodCount;
    }

    function getMoodIcon(mood) {
        const moodIcons = {
            Happy: '😊',
            Sad: '😢',
            Anxious: '😟',
            Stressed: '😫',
            Calm: '😌'
        };
        return moodIcons[mood] || '❓';
    }

    // Forum Chatbox
    forumForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const message = document.getElementById('forum-message').value;
        const messages = JSON.parse(localStorage.getItem('forum-messages')) || [];
        messages.push({ text: message, user: 'You' });
        localStorage.setItem('forum-messages', JSON.stringify(messages));
        displayMessages();
        document.getElementById('forum-message').value = '';
        simulateChatbotResponse(message);
    });

    function displayMessages() {
        const messages = JSON.parse(localStorage.getItem('forum-messages')) || [];
        forumMessages.innerHTML = '';
        messages.forEach((message) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${message.user}:</strong> ${message.text}`;
            forumMessages.appendChild(li);
        });
    }

    toggleSidebarBtn.addEventListener('click', function () {
        sidebar.classList.toggle('show');
    });

    function hideAllSections() {
        profilePage.classList.add('hidden');
        mainContainer.classList.add('hidden');
        forumPage.classList.add('hidden');
        loginPage.classList.add('hidden');
        registerPage.classList.add('hidden');
    }

    homeBtn.addEventListener('click', function () {
        if (isLoggedIn()) {
            hideAllSections();
            sidebar.classList.remove('show');
            mainContainer.classList.remove('hidden');
        } else {
            alert('Please log in first.');
        }
    });

    profileBtn.addEventListener('click', function () {
        if (isLoggedIn()) {
            hideAllSections();
            sidebar.classList.remove('show');
            profilePage.classList.remove('hidden');
        } else {
            alert('Please log in first.');
        }
    });

    forumBtn.addEventListener('click', function () {
        if (isLoggedIn()) {
            hideAllSections();
            sidebar.classList.remove('show');
            forumPage.classList.remove('hidden');
        } else {
            alert('Please log in first.');
        }
    });

    logoutBtn.addEventListener('click', function () {
        localStorage.setItem('isLoggedIn', 'false');
        hideAllSections();
        sidebar.classList.remove('show');
        loginPage.classList.remove('hidden');
    });

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        alert('Registration successful! Please login.');
        hideAllSections();
        loginPage.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const storedUsername = localStorage.getItem('username');
        const storedPassword = localStorage.getItem('password');
        if (username === storedUsername && password === storedPassword) {
            localStorage.setItem('isLoggedIn', 'true');
            alert('Login successful!');
            hideAllSections();
            mainContainer.classList.remove('hidden');
        } else {
            alert('Invalid username or password. Please try again.');
        }
    });

    goToLogin.addEventListener('click', function (e) {
        e.preventDefault();
        hideAllSections();
        loginPage.classList.remove('hidden');
    });

    goToRegister.addEventListener('click', function (e) {
        e.preventDefault();
        hideAllSections();
        registerPage.classList.remove('hidden');
    });

    // Initial setup
    if (isLoggedIn()) {
        hideAllSections();
        mainContainer.classList.remove('hidden');
    } else {
        hideAllSections();
        loginPage.classList.remove('hidden');
    }
});
