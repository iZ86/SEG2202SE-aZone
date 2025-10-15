DROP DATABASE IF EXISTS AZONE_DATABASE;

CREATE DATABASE AZONE_DATABASE;

USE AZONE_DATABASE;

CREATE TABLE REGISTERED_USER (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(350) UNIQUE NOT NULL,
    phoneNumber VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    status TINYINT(1) DEFAULT 1
);

CREATE TABLE PROGRAMME (
    programmeId INT AUTO_INCREMENT PRIMARY KEY,
    programmeName VARCHAR(255) NOT NULL
);

CREATE TABLE INTAKE (
    intakeId INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE SUBJECT (
    subjectId INT AUTO_INCREMENT PRIMARY KEY,
    subjectCode VARCHAR(50) NOT NULL,
    subjectName VARCHAR(255) NOT NULL,
    description TEXT,
    creditHours INT
);

CREATE TABLE ENROLLMENT (
    enrollmentId INT AUTO_INCREMENT PRIMARY KEY,
    enrollmentStartDateTime DATETIME,
    enrollmentEndDateTime DATETIME
);

CREATE TABLE ADMIN (
    adminId INT AUTO_INCREMENT PRIMARY KEY,
    FOREIGN KEY (adminId) REFERENCES REGISTERED_USER(userId)
        ON DELETE CASCADE
);

CREATE TABLE STUDENT (
    studentId INT AUTO_INCREMENT PRIMARY KEY,
    FOREIGN KEY (studentId) REFERENCES REGISTERED_USER(userId)
        ON DELETE CASCADE
);

CREATE TABLE COURSE (
    courseId INT AUTO_INCREMENT PRIMARY KEY,
    programmeId INT,
    courseName VARCHAR(255) NOT NULL,
    FOREIGN KEY (programmeId) REFERENCES PROGRAMME(programmeId)
        ON DELETE CASCADE
);

CREATE TABLE PROGRAMME_INTAKE (
    programmeIntakeId INT AUTO_INCREMENT PRIMARY KEY,
    programmeId INT,
    intakeId INT,
    semester INT,
    semesterStartPeriod DATE,
    semesterEndPeriod DATE,
    FOREIGN KEY (programmeId) REFERENCES PROGRAMME(programmeId)
        ON DELETE CASCADE,
    FOREIGN KEY (intakeId) REFERENCES INTAKE(intakeId)
        ON DELETE CASCADE,
    UNIQUE (programmeIntakeId, programmeId, intakeId, semester)
);

CREATE TABLE COURSE_SUBJECT (
    courseId INT,
    subjectId INT,
    FOREIGN KEY (courseId) REFERENCES COURSE(courseId)
        ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES SUBJECT(subjectId)
        ON DELETE CASCADE,
    PRIMARY KEY (courseId, subjectId)
);

CREATE TABLE STUDENT_SUBJECT (
    studentId INT,
    subjectId INT,
    FOREIGN KEY (studentId) REFERENCES STUDENT(studentId)
        ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES SUBJECT(subjectId)
        ON DELETE CASCADE,
    PRIMARY KEY (studentId, subjectId)
);

CREATE TABLE ENROLLMENT_PROGRAMME_INTAKE (
    programmeIntakeId INT,
    enrollmentId INT,
    FOREIGN KEY (programmeIntakeId) REFERENCES PROGRAMME_INTAKE(programmeIntakeId)
        ON DELETE CASCADE,
    FOREIGN KEY (enrollmentId) REFERENCES ENROLLMENT(enrollmentId)
        ON DELETE CASCADE,
    PRIMARY KEY (programmeIntakeId, enrollmentId)
);

CREATE TABLE ENROLLMENT_SUBJECT (
    enrollmentId INT,
    subjectId INT,
    FOREIGN KEY (enrollmentId) REFERENCES ENROLLMENT(enrollmentId)
        ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES SUBJECT(subjectId)
        ON DELETE CASCADE,
    PRIMARY KEY (enrollmentId, subjectId)
);

CREATE TABLE STUDENT_COURSE_PROGRAMME_INTAKE (
    studentId INT,
    courseId INT,
    programmeIntakeId INT,
    FOREIGN KEY (studentId) REFERENCES STUDENT(studentId)
        ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES COURSE(courseId)
        ON DELETE CASCADE,
    FOREIGN KEY (programmeIntakeId) REFERENCES PROGRAMME_INTAKE(programmeIntakeId)
        ON DELETE CASCADE,
    PRIMARY KEY (studentId, courseId, programmeIntakeId)
);