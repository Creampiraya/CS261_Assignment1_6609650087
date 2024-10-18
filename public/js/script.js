// DOM Elements
const form = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const fields = ['username', 'password', 'role'];

// Event Listeners
fields.forEach(field => {
    document.getElementById(field).addEventListener('input', validateForm);
});

// Functions
function validateForm() {
    let isValid = true;
    
    // Clear all previous errors
    fields.forEach(field => {
        document.getElementById(`${field}-error`).textContent = '';
    });

    // Check if all fields are filled
    fields.forEach(field => {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            document.getElementById(`${field}-error`).textContent = 
                `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            isValid = false;
        }
    });

    // Enable/disable login button based on validation
    loginButton.disabled = !isValid;
    return isValid;
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
}

function displayUserInfo(data, selectedRole) {
    const userInfoDiv = document.getElementById('user-info');
    let html = '';

    if (data.status) {
        const commonFields = [
            { key: 'username', label: 'Username' },
            { key: 'displayname_th', label: 'Thai Name' },
            { key: 'displayname_en', label: 'English Name' },
            { key: 'email', label: 'Email' },
            { key: 'department', label: 'Department' },
            { key: 'type', label: 'User Type' }
        ];

        // Check if the returned type matches the selected role
        if ((data.type === 'student' && selectedRole === 'student') ||
            (data.type === 'employee' && selectedRole === 'lecturer')) {
            if (data.type === 'student') {
                // Student-specific fields
                const studentFields = [
                    { key: 'tu_status', label: 'Student Status' },
                    { key: 'statusid', label: 'Status ID' },
                    { key: 'faculty', label: 'Faculty' }
                ];
                commonFields.push(...studentFields);
            } else {
                // Lecturer-specific fields
                const lecturerFields = [
                    { key: 'StatusWork', label: 'Work Status' },
                    { key: 'StatusEmp', label: 'Employee Status' },
                    { key: 'organization', label: 'Organization' }
                ];
                commonFields.push(...lecturerFields);
            }

            html = `
                <div class="status-badge status-success">Active</div>
                ${commonFields.map(field => {
                    const value = data[field.key] || 'N/A';
                    return `
                        <div class="info-row">
                            <span class="info-label">${field.label}:</span>
                            <span class="info-value">${value}</span>
                        </div>
                    `;
                }).join('')}
            `;
        } else {
            html = `
                <div class="status-badge status-error">Role Mismatch</div>
                <div class="info-row">The selected role (${selectedRole}) does not match the user type (${data.type}). Please select the correct role and try again.</div>
            `;
        }
    } else {
        html = `
            <div class="status-badge status-error">Login Failed</div>
            <div class="info-row">${data.message || 'Authentication failed'}</div>
        `;
    }

    userInfoDiv.innerHTML = html;
    userInfoDiv.className = 'user-info show';
}

function submitLogin() {
    if (!validateForm()) return;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Clear previous messages
    document.getElementById('message').innerText = '';
    document.getElementById('user-info').className = 'user-info';

    // Disable login button during API call
    loginButton.disabled = true;

    fetch('https://restapi.tu.ac.th/api/v1/auth/Ad/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Application-Key': 'TU71707d92860dfdd6ad0e25a5d056526bc9217ab0e9e8bbeb86c6c3d86d5ec8ad9bca40281f8c70e90ba5e406eb0e1814'
        },
        body: JSON.stringify({ 
            "UserName": username, 
            "PassWord": password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.status) {
            throw new Error(data.message || 'Login failed');
        }
        displayUserInfo(data, role);
    })
    .catch(error => {
        document.getElementById('message').innerText = error.message;
        displayUserInfo({ status: false, message: error.message }, role);
    })
    .finally(() => {
        // Re-enable login button after API call
        validateForm();
    });
}