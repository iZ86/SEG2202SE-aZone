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
    status INT DEFAULT 1 NOT NULL
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
    description VARCHAR(3000),
    creditHours INT NOT NULL
);

CREATE TABLE ENROLLMENT (
    enrollmentId INT AUTO_INCREMENT PRIMARY KEY,
    enrollmentStartDateTime DATETIME NOT NULL,
    enrollmentEndDateTime DATETIME NOT NULL
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
    programmeId INT NOT NULL,
    courseName VARCHAR(255) NOT NULL,
    FOREIGN KEY (programmeId) REFERENCES PROGRAMME(programmeId)
        ON DELETE CASCADE
);

CREATE TABLE PROGRAMME_INTAKE (
    programmeIntakeId INT AUTO_INCREMENT PRIMARY KEY,
    programmeId INT NOT NULL,
    intakeId INT NOT NULL,
    semester INT NOT NULL,
    semesterStartPeriod DATE NOT NULL,
    semesterEndPeriod DATE NOT NULL,
    FOREIGN KEY (programmeId) REFERENCES PROGRAMME(programmeId)
        ON DELETE CASCADE,
    FOREIGN KEY (intakeId) REFERENCES INTAKE(intakeId)
        ON DELETE CASCADE,
    UNIQUE (programmeId, intakeId, semester)
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

CREATE TABLE ENROLLMENT_PROGRAMME_INTAKE (
    programmeIntakeId INT,
    enrollmentId INT,
    FOREIGN KEY (programmeIntakeId) REFERENCES PROGRAMME_INTAKE(programmeIntakeId)
        ON DELETE CASCADE,
    FOREIGN KEY (enrollmentId) REFERENCES ENROLLMENT(enrollmentId)
        ON DELETE CASCADE,
    PRIMARY KEY (programmeIntakeId, enrollmentId)
);

CREATE TABLE CLASSTYPE (
    classTypeId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    classType VARCHAR(255) NOT NULL
);

CREATE TABLE VENUE (
    venueId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    venue VARCHAR(255) NOT NULL
);

CREATE TABLE DAY(
    dayId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    day VARCHAR(9) NOT NULL
);

CREATE TABLE ENROLLMENT_SUBJECT (
    enrollmentSubjectId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    enrollmentId INT NOT NULL,
    subjectId INT NOT NULL,
    classTypeId INT NOT NULL,
    venueId INT NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    dayId INT NOT NULL,
    FOREIGN KEY (enrollmentId) REFERENCES ENROLLMENT(enrollmentId)
        ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES SUBJECT(subjectId)
        ON DELETE CASCADE,
    FOREIGN KEY (classTypeId) REFERENCES CLASSTYPE(classTypeId)
        ON DELETE CASCADE,
    FOREIGN KEY (venueId) REFERENCES VENUE(venueId)
        ON DELETE CASCADE,
    FOREIGN KEY (dayId) REFERENCES DAY(dayId)
        ON DELETE CASCADE,
    UNIQUE (enrollmentId, subjectId, classTypeId, venueId, startTime, endTime, dayId)
);

CREATE TABLE SUBJECT_STATUS (
    subjectStatusId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    subjectStatus VARCHAR(255) NOT NULL
);

CREATE TABLE STUDENT_ENROLLMENT_SUBJECT (
    studentId INT NOT NULL,
    enrollmentSubjectId INT NOT NULL,
    subjectStatusId INT NOT NULL,
    FOREIGN KEY (studentId) REFERENCES STUDENT(studentId)
        ON DELETE CASCADE,
    FOREIGN KEY (enrollmentSubjectId) REFERENCES ENROLLMENT_SUBJECT(enrollmentSubjectId)
        ON DELETE CASCADE,
    FOREIGN KEY (subjectStatusId) REFERENCES SUBJECT_STATUS(subjectStatusId)
        ON DELETE CASCADE,
    PRIMARY KEY (studentId, enrollmentSubjectId)
);

CREATE TABLE STUDENT_COURSE_PROGRAMME_INTAKE (
    studentId INT NOT NULL,
    courseId INT NOT NULL,
    programmeIntakeId INT NOT NULL,
    status INT DEFAULT 1 NOT NULL,
    FOREIGN KEY (studentId) REFERENCES STUDENT(studentId)
        ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES COURSE(courseId)
        ON DELETE CASCADE,
    FOREIGN KEY (programmeIntakeId) REFERENCES PROGRAMME_INTAKE(programmeIntakeId)
        ON DELETE CASCADE,
    PRIMARY KEY (studentId, courseId, programmeIntakeId)
);

-- DATA MANIPULATION LANGUAGE --
-- The password is encrypted with "abc" --
-- All of the users have the same password "test123"
INSERT INTO `CLASSTYPE` (`classTypeId`, `classType`) VALUES
(1, 'Lecture'),
(2, 'Practical'),
(3, 'Tutorial'),
(4, 'Workshop');

INSERT INTO `ENROLLMENT` (`enrollmentId`, `enrollmentStartDateTime`, `enrollmentEndDateTime`) VALUES
(1, '2025-10-01 08:30:00', '2025-10-03 23:59:59');


INSERT INTO `INTAKE` (`intakeId`) VALUES
(202501),
(202502),
(202504),
(202508),
(202509);

INSERT INTO `PROGRAMME` (`programmeId`, `programmeName`) VALUES
(1, 'Bachelors Degree'),
(2, 'Diploma'),
(3, 'Foundation');

INSERT INTO `COURSE` (`courseId`, `programmeId`, `courseName`) VALUES
(1, 2, 'Diploma in Information Technology'),
(2, 1, 'Bachelor of Science (Honours) in\r\nComputer Science'),
(3, 1, 'Bachelor of Science (Honours) in Information Technology'),
(4, 1, 'Bachelor of \r\nSoftware Engineering (Hons)'),
(5, 1, 'Bachelor (Honours)  \r\nin Finance'),
(6, 3, 'Foundation in Art'),
(7, 3, 'Foundation in Science and Technology'),
(8, 2, 'Diploma in Finance'),
(9, 2, 'Diploma in Business Administration');

INSERT INTO `PROGRAMME_INTAKE` (`programmeIntakeId`, `programmeId`, `intakeId`, `semester`, `semesterStartPeriod`, `semesterEndPeriod`) VALUES
(1, 1, 202509, 4, '2025-09-22', '2026-01-16'),
(2, 2, 202508, 1, '2025-08-16', '2025-12-12'),
(3, 1, 202504, 5, '2025-04-09', '2025-08-06');

INSERT INTO `ENROLLMENT_PROGRAMME_INTAKE` (`programmeIntakeId`, `enrollmentId`) VALUES (1, 1);

INSERT INTO `REGISTERED_USER` (`userId`, `firstName`, `lastName`, `email`, `phoneNumber`, `password`, `status`) VALUES
(10000001, 'admin', 'admin', 'admin@imail.sunway.edu.my', '-', '$argon2id$v=19$m=65536,t=3,p=4$OXj/r5uJaBioWzU37JW0wA$qEKKZL7Fn9TEgwV0iZ2PP/ZnBRmyKibmWBWP/9LizdM', 1),
(23049679, 'Isaac Ming', 'Yeow', 'izack86@gmail.com', '0111235123', '$argon2id$v=19$m=65536,t=3,p=4$OXj/r5uJaBioWzU37JW0wA$qEKKZL7Fn9TEgwV0iZ2PP/ZnBRmyKibmWBWP/9LizdM', 1),
(23055155, 'Jia Seng', 'Foo', 'skyfoojs@gmail.com', '0172681225', '$argon2id$v=19$m=65536,t=3,p=4$OXj/r5uJaBioWzU37JW0wA$qEKKZL7Fn9TEgwV0iZ2PP/ZnBRmyKibmWBWP/9LizdM', 1),
(23056138, 'Yu Xiang', 'Yeo', 'yyx@gmail.com', '0111231234', '$argon2id$v=19$m=65536,t=3,p=4$OXj/r5uJaBioWzU37JW0wA$qEKKZL7Fn9TEgwV0iZ2PP/ZnBRmyKibmWBWP/9LizdM', 1);

INSERT INTO `ADMIN` (`adminId`) VALUES (10000001);

INSERT INTO `STUDENT` (`studentId`) VALUES
(23049679),
(23055155),
(23056138);

INSERT INTO `STUDENT_COURSE_PROGRAMME_INTAKE` (`studentId`, `courseId`, `programmeIntakeId`, `status`) VALUES
(23049679, 3, 3, 1),
(23055155, 4, 1, 1),
(23056138, 2, 1, 1);

INSERT INTO `SUBJECT` (`subjectId`, `subjectCode`, `subjectName`, `description`, `creditHours`) VALUES
(1, 'SEG2202', 'Software Engineering', 'This is a subject called Software Engineering.', 4),
(2, 'CSC1024', 'Programming Principles', 'This is a subject called Programming Principles.', 4),
(3, 'MTH1114', 'Computer Mathematics', 'This is a subject called Computer Mathematics.', 4),
(4, 'NET1014', 'Networking Principles', 'This is a subject called Networking Principles.', 4),
(5, 'CSC1202', 'Computer Orgnisation', 'This is a subject called Computer Orgnisation.', 4),
(6, 'ENG1044', 'English for Computer Technology Studies', 'This is a subject called English for Computer Technology Studies.', 4),
(7, 'FEL1204', 'Principles of Marketing', 'This is a subject called English for Principles of Marketing.', 4),
(8, 'FEL1304', 'Startup Foundry', 'This is a subject called Startup Foundry.', 4);

INSERT INTO `COURSE_SUBJECT` (`courseId`, `subjectId`) VALUES
(2, 2),
(2, 3),
(3, 4),
(4, 1),
(4, 2);

INSERT INTO `SUBJECT_STATUS` (`subjectStatusId`, `subjectStatus`) VALUES
(1, 'Active'),
(2, 'Exempted'),
(3, 'Completed');
