# 🎓 SEG2202SE - University Subject Enrollment Platform

**SEG2202SE** is a Software Engineering assignment project developed by students of the **Bachelor of Software Engineering**, **Sunway University (September 2025 Intake)**.  

The **University Subject Enrollment Platform** is a web-based system designed to **simplify and enhance the subject registration process** for university students.  

This project was developed to address common issues faced by students at **Sunway University**, where the existing enrollment system often **crashes** or performs **poorly during high-demand periods**.

---

## 💡 Problem Statement

  During subject enrollment periods, many students experience:
<ul>
  <li>Frequent website crashes due to heavy traffic.</li>
  <li>Slow loading times and unresponsive pages.</li>
  <li>Poor user interface, making the process confusing and time-consuming.</li>
</ul>
  These challenges create frustration and inefficiency during one of the most critical periods of the academic semester.

---

## 🧩 Project Objective

- Build a **reliable, responsive, and stable enrollment platform** for university students.  
- Simplify the **subject selection and scheduling** process.  
- Ensure the system can **handle high traffic** during enrollment periods.  
- Provide a **clean, modern, and user-friendly interface**.  

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React.js (TypeScript)             |
| Backend      | Node.js + Express (TypeScript)    |
| Database     | MySQL via **XAMPP**               |
| API Style    | RESTful                           |

---

## 🚀 Getting Started (with XAMPP)

Follow these steps to set up the **University Subject Enrollment Platform** on your local machine.

### 🧰 Prerequisites

- [XAMPP](https://www.apachefriends.org/index.html) with MySQL enabled  
- Node.js (v18+ recommended)  
- npm or yarn  

---

### 1. Clone the Repository

```bash
git clone https://github.com/iZ86/SEG2202SE.git
cd SEG2202SE/root
```

### 2. Set Up the MySQL Database
1. Launch XAMPP Control Panel and start MySQL.
2. Open your browser and go to http://localhost/phpmyadmin.
3. Create a new database called:
```bash
subjectenrollmentdatabase
```
4. Import the SQL schema:
- Click on the okujobseekerdatabase database in phpMyAdmin.
- Copy the `database.txt` file from the **/database** folder.
- Go to the SQL tab and paste it.

### 3. Install Dependencies
```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 4. Run the Application
Start both backend and frontend servers by just do this in the terminal:
```bash
# cd back to /SEG2202SE/root/
npm run dev
```

### 5. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
#### ✅ You’re now up and running!

