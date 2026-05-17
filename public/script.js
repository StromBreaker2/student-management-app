// DOM Elements
const studentForm = document.getElementById('student-form');
const studentsList = document.getElementById('students-list');
const totalStudents = document.getElementById('total-students');
const emptyState = document.getElementById('empty-state');
const tableContainer = document.querySelector('.table-container');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formMessage = document.getElementById('form-message');

// Form Inputs
const idInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const rollNumberInput = document.getElementById('roll_number');
const courseInput = document.getElementById('course');
const gradeInput = document.getElementById('grade');

// State
let students = [];
let isEditing = false;

const API_URL = '/api/students';

// Initialize
document.addEventListener('DOMContentLoaded', fetchStudents);

// Fetch all students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch students');
        students = await response.json();
        renderStudents();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Render students table
function renderStudents() {
    totalStudents.textContent = students.length;
    studentsList.innerHTML = '';

    if (students.length === 0) {
        emptyState.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tableContainer.classList.remove('hidden');

    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.style.animation = 'fadeIn 0.3s ease-out forwards';
        tr.innerHTML = `
            <td><strong>${escapeHTML(student.roll_number)}</strong></td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.course)}</td>
            <td>${escapeHTML(student.grade || '-')}</td>
            <td>
                <button class="btn edit-btn" onclick="editStudent('${student._id}')">Edit</button>
                <button class="btn danger-btn" onclick="deleteStudent('${student._id}')">Delete</button>
            </td>
        `;
        studentsList.appendChild(tr);
    });
}

// Form Submit Handler (Add or Update)
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
        name: nameInput.value.trim(),
        roll_number: rollNumberInput.value.trim(),
        course: courseInput.value.trim(),
        grade: gradeInput.value.trim()
    };

    try {
        if (isEditing) {
            const id = idInput.value;
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update student');
            showMessage('Student updated successfully!', 'success');
        } else {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to add student');
            showMessage('Student added successfully!', 'success');
        }

        resetForm();
        fetchStudents();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Edit Student
function editStudent(id) {
    const student = students.find(s => s._id === id);
    if (!student) return;

    isEditing = true;
    idInput.value = student._id;
    nameInput.value = student.name;
    rollNumberInput.value = student.roll_number;
    courseInput.value = student.course;
    gradeInput.value = student.grade || '';

    formTitle.textContent = 'Edit Student Record';
    submitBtn.textContent = 'Update Student';
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete Student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student record?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to delete student');
        }

        showMessage('Student deleted successfully!', 'success');
        fetchStudents();

        if (isEditing && idInput.value == id) {
            resetForm();
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Cancel Edit
cancelBtn.addEventListener('click', resetForm);

// Reset Form
function resetForm() {
    studentForm.reset();
    isEditing = false;
    idInput.value = '';
    formTitle.textContent = 'Add New Student';
    submitBtn.textContent = 'Add Student';
    cancelBtn.classList.add('hidden');
}

// Show Message
function showMessage(msg, type) {
    formMessage.textContent = msg;
    formMessage.className = `message ${type}`;
    formMessage.classList.remove('hidden');
    setTimeout(() => {
        formMessage.classList.add('hidden');
    }, 5000);
}

// Helper to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
