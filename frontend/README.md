# PRESENZA

### Smart Attendance Management System

Presenza is a web-based attendance management system designed to make student management, attendance tracking, and attendance reporting simpler and more organized.

---

## ✨ Features

### 👥 Student Management
- Add new students
- Edit student information
- Delete students
- Search students
- View student records

### 📊 Student Overview
- Total number of students
- Class and section information
- Attendance overview
- Overall attendance statistics

### ✅ Attendance Management
- Select subject and date
- Mark students as Present or Absent
- Mark the entire class Present or Absent
- Save attendance records
- Prevent duplicate attendance records

### 📈 Reports & Analytics
- Individual student attendance reports
- Subject-wise attendance reports
- Attendance percentages
- Download attendance reports as CSV

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Axios
- Lucide React

### Backend
- Python
- Flask
- Flask-SQLAlchemy

### Database
- MySQL

---

## 📁 Project Structure

```text
attendance-system/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── google_sheet.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   │   ├── presencia-logo.png
│   │   ├── soa-logo.webp
│   │   └── campus-banner.jpg
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md