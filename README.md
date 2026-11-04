# 🚗 SafeDrive – Vehicle Trip Logger

## 📌 Project Description

**SafeDrive – Vehicle Trip Logger** is a web-based application designed to help users record, manage, and track their vehicle trips efficiently.

The application allows users to maintain digital records of their journeys, including starting location, destination, travel date, distance covered, trip duration, and vehicle details.

SafeDrive helps users organize their travel history, monitor vehicle usage, calculate trip statistics, and maintain trip records in one centralized platform.

---

## 🌐 Live Demo

🚀 **Live Website:** https://safedrive-tau.vercel.app

Explore the SafeDrive application and experience vehicle trip management, trip history tracking, and distance monitoring.

> **Note:** Replace the demo URL with your actual deployed website link. If the project is not deployed yet, you can mention:https://safedrive-tau.vercel.app

## 🎯 Project Objectives

- Record and manage vehicle trips digitally.
- Store trip details in a database.
- Track distance travelled by vehicles.
- Maintain complete trip history.
- Calculate total distance covered.
- Monitor vehicle usage and travel activities.
- Reduce manual record-keeping.

---

## ✨ Features

- **User Registration and Login:** User authentication.
- **Add New Trip:** Record new vehicle journeys.
- **Trip Management:** View, update, and delete trip records.
- **Vehicle Details:** Maintain vehicle information.
- **Trip History:** View previously completed trips.
- **Distance Tracking:** Calculate total distance travelled.
- **Dashboard:** Display trip statistics and summaries.
- **Responsive Design:** User-friendly interface for desktop and mobile devices.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend Development |
| Flask | Web Application Framework |
| HTML5 | Web Page Structure |
| CSS3 | Styling and Layout |
| JavaScript | Frontend Interactions |
| MySQL | Database Management |
| Git & GitHub | Version Control |

---

## 📂 Project Folder Structure

```text
SafeDrive/
│
├── app.py
│
├── database/
│   └── db.sql
│
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── add_trip.html
│   └── trip_history.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── script.js
│   │
│   └── images/
│
├── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SafeDrive.git
```

### 2. Navigate to the Project Folder

```bash
cd SafeDrive
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure MySQL Database

- Open MySQL Workbench.
- Create a database named `safedrive`.
- Import or execute the SQL script from `database/db.sql`.
- Configure your MySQL username and password in the application.

### 6. Run the Application

```bash
python app.py
```

### 7. Open in Browser

```text
http://127.0.0.1:5000/
```

---

## 🗄️ Database Design

The application can use the following database tables.

### 1. Users Table

- user_id
- username
- email
- password

### 2. Vehicles Table

- vehicle_id
- user_id
- vehicle_name
- vehicle_number
- vehicle_type

### 3. Trips Table

- trip_id
- user_id
- vehicle_id
- start_location
- destination
- trip_date
- distance
- duration

---

## 📊 Future Enhancements

- GPS-based live vehicle tracking.
- Google Maps integration.
- Fuel consumption monitoring.
- Trip expense calculator.
- Monthly and yearly travel reports.
- Export trip history to PDF or Excel.
- Advanced analytics dashboard.
- Emergency contact and safety features.

---

## 🎓 Project Use Case

SafeDrive can be useful for:

- Individual vehicle owners.
- Daily commuters.
- Students.
- Small transportation businesses.
- People who want to maintain digital travel records.

---

## 👩‍💻 Developer Information

**Project Name:** SafeDrive – Vehicle Trip Logger

**Project Type:** Web-Based Application

**Domain:** Vehicle Management / Travel Tracking

**Backend:** Python and Flask

**Frontend:** HTML, CSS and JavaScript

**Database:** MySQL

---

## 🌟 Conclusion

SafeDrive provides a convenient digital solution for recording and managing vehicle trips. By combining Python, Flask, and MySQL, the application makes trip tracking simple, organized, and efficient.

This project demonstrates practical implementation of web development, database management, CRUD operations, and backend programming.

---

## ⭐ Support

If you find this project useful, don't forget to give the repository a ⭐ Star!

**Thank you for visiting SafeDrive!** 🚗
