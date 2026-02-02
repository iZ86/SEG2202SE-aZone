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
    profilePictureUrl VARCHAR(255),
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
    creditHours INT NOT NULL,
    UNIQUE (subjectCode, subjectName)
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
    courseName VARCHAR(255) NOT NULL UNIQUE,
    courseCode VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (programmeId) REFERENCES PROGRAMME(programmeId)
        ON DELETE CASCADE
);

CREATE TABLE STUDY_MODE (
    studyModeId INT AUTO_INCREMENT PRIMARY KEY,
    studyMode VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE PROGRAMME_INTAKE (
    programmeIntakeId INT AUTO_INCREMENT PRIMARY KEY,
    programmeId INT NOT NULL,
    intakeId INT NOT NULL,
    studyModeId INT NOT NULL,
    semester INT NOT NULL,
    semesterStartDate DATE NOT NULL,
    semesterEndDate DATE NOT NULL,
    enrollmentId INT,
    FOREIGN KEY (programmeId) REFERENCES PROGRAMME(programmeId)
        ON DELETE CASCADE,
    FOREIGN KEY (intakeId) REFERENCES INTAKE(intakeId)
        ON DELETE CASCADE,
    FOREIGN KEY (studyModeId) REFERENCES STUDY_MODE(studyModeId),
    FOREIGN KEY (enrollmentId) REFERENCES ENROLLMENT(enrollmentId),
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

CREATE TABLE CLASS_TYPE (
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

CREATE TABLE LECTURER_TITLE (
    lecturerTitleId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    lecturerTitle VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE LECTURER (
    lecturerId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    lecturerTitleId INT NOT NULL,
    email VARCHAR(350),
    phoneNumber VARCHAR(20),
    FOREIGN KEY (lecturerTitleId) REFERENCES LECTURER_TITLE(lecturerTitleId)
);

CREATE TABLE ENROLLMENT_SUBJECT (
    enrollmentSubjectId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    enrollmentId INT NOT NULL,
    subjectId INT NOT NULL,
    lecturerId INT NOT NULL,
    FOREIGN KEY (enrollmentId) REFERENCES ENROLLMENT(enrollmentId)
        ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES SUBJECT(subjectId)
        ON DELETE CASCADE,
    FOREIGN KEY (lecturerId) REFERENCES LECTURER(lecturerId)
        ON DELETE CASCADE,
    UNIQUE (enrollmentId, subjectId)
);

CREATE TABLE ENROLLMENT_SUBJECT_TYPE (
    enrollmentSubjectTypeId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    enrollmentSubjectId INT NOT NULL,
    classTypeId INT NOT NULL,
    venueId INT NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    dayId INT NOT NULL,
    numberOfSeats INT NOT NULL,
    grouping INT NOT NULL,
    FOREIGN KEY (enrollmentSubjectId) REFERENCES ENROLLMENT_SUBJECT(enrollmentSubjectId)
        ON DELETE CASCADE,
    FOREIGN KEY (classTypeId) REFERENCES CLASS_TYPE(classTypeId)
        ON DELETE CASCADE,
    FOREIGN KEY (venueId) REFERENCES VENUE(venueId)
        ON DELETE CASCADE,
    FOREIGN KEY (dayId) REFERENCES DAY(dayId)
        ON DELETE CASCADE,
    UNIQUE (enrollmentSubjectId, classTypeId, venueId, startTime, endTime, dayId)
);

CREATE TABLE SUBJECT_STATUS (
    subjectStatusId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    subjectStatus VARCHAR(255) NOT NULL
);

CREATE TABLE STUDENT_ENROLLMENT_SUBJECT_TYPE (
    studentId INT NOT NULL,
    enrollmentSubjectTypeId INT NOT NULL,
    subjectStatusId INT NOT NULL,
    FOREIGN KEY (studentId) REFERENCES STUDENT(studentId)
        ON DELETE CASCADE,
    FOREIGN KEY (enrollmentSubjectTypeId) REFERENCES ENROLLMENT_SUBJECT_TYPE(enrollmentSubjectTypeId)
        ON DELETE CASCADE,
    FOREIGN KEY (subjectStatusId) REFERENCES SUBJECT_STATUS(subjectStatusId)
        ON DELETE CASCADE,
    PRIMARY KEY (studentId, enrollmentSubjectTypeId)
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
INSERT INTO `CLASS_TYPE` (`classTypeId`, `classType`) VALUES
(1, 'Lecture'),
(2, 'Practical'),
(3, 'Tutorial'),
(4, 'Workshop');

INSERT INTO `ENROLLMENT` (`enrollmentId`, `enrollmentStartDateTime`, `enrollmentEndDateTime`) VALUES
(1, '2025-10-01 08:30:00', '2026-10-03 23:59:59');


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

INSERT INTO `COURSE` (`courseId`, `programmeId`, `courseName`, `courseCode`) VALUES
(1, 2, 'Diploma in Information Technology', 'DIIT'),
(2, 1, 'Bachelor of Science (Honours) in\r\nComputer Science', 'BCS'),
(3, 1, 'Bachelor of Science (Honours) in Information Technology', 'BIT'),
(4, 1, 'Bachelor of \r\nSoftware Engineering (Hons)', 'BSE'),
(5, 1, 'Bachelor (Honours)  \r\nin Finance', 'BFI'),
(6, 3, 'Foundation in Art', 'FIA'),
(7, 3, 'Foundation in Science and Technology', 'FIST'),
(8, 2, 'Diploma in Finance', 'DIF'),
(9, 2, 'Diploma in Business Administration', 'DIBA');

INSERT INTO `STUDY_MODE` (`studyMode`) VALUES
("Full Time"),
("Part Time");

INSERT INTO `PROGRAMME_INTAKE` (`programmeIntakeId`, `programmeId`, `intakeId`, `studyModeId`, `semester`, `semesterStartDate`, `semesterEndDate`, `enrollmentId`) VALUES
(1, 1, 202509, 1, 4, '2025-09-22', '2026-01-16', 1),
(2, 2, 202508, 1, 1, '2025-08-16', '2026-12-12', 1),
(3, 1, 202504, 1, 5, '2025-04-09', '2026-08-06', 1);


INSERT INTO `REGISTERED_USER` (`userId`, `firstName`, `lastName`, `email`, `phoneNumber`, `password`, `status`) VALUES
(10000001, 'admin', 'admin', 'admin@imail.sunway.edu.my', '-', '$argon2id$v=19$m=65536,t=3,p=1$Is6WCr0RuL4kQlaFSWee7w$ejJPE9Vs0BRYoA4eh5oYGuONU+gq8cnNLcXSeQzwVE0', 1),
(23049679, 'Isaac Ming', 'Yeow', 'izack86@gmail.com', '0111235123', '$argon2id$v=19$m=65536,t=3,p=1$Is6WCr0RuL4kQlaFSWee7w$ejJPE9Vs0BRYoA4eh5oYGuONU+gq8cnNLcXSeQzwVE0', 1),
(23055155, 'Jia Seng', 'Foo', 'skyfoojs@gmail.com', '0172681225', '$argon2id$v=19$m=65536,t=3,p=1$Is6WCr0RuL4kQlaFSWee7w$ejJPE9Vs0BRYoA4eh5oYGuONU+gq8cnNLcXSeQzwVE0', 1),
(23056138, 'Yu Xiang', 'Yeo', 'yyx@gmail.com', '0111231234', '$argon2id$v=19$m=65536,t=3,p=1$Is6WCr0RuL4kQlaFSWee7w$ejJPE9Vs0BRYoA4eh5oYGuONU+gq8cnNLcXSeQzwVE0', 1);

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

INSERT INTO `VENUE` (`venueId`, `venue`) VALUES
(1, 'UW-8-6'),
(2, 'UC-2-6'),
(3, 'NW-3-6'),
(4, 'EB-2-8'),
(5, 'NE-2-10'),
(6, 'UW-10-2'),
(7, 'UE-1-3'),
(8, 'JC1'),
(9, 'JC2'),
(10, 'JC3'),
(11, 'UC-9-10'),
(12, 'NE-2-16'),
(13, 'NW-2-12'),
(14, 'NE-5-7');

INSERT INTO `DAY` (`dayId`, `day`) VALUES
(1, 'Monday'),
(2, 'Tuesday'),
(3, 'Wednesday'),
(4, 'Thursday'),
(5, 'Friday'),
(6, 'Saturday'),
(7, 'Sunday');

INSERT INTO `LECTURER_TITLE` (`lecturerTitleId`, `lecturerTitle`) VALUES
(1, "None"),
(2, "DR."),
(3, "PROF."),
(4, "ASSOC. PROF.");

INSERT INTO `LECTURER` (`lecturerId`, `firstName`, `lastName`, `lecturerTitleId`, `email`, `phoneNumber`) VALUES
(3, 'Hakim', 'Amirul', 2, 'amirul.hakim92@example.com', '0128476392'),
(4, 'Rahman', 'Aisyah', 4, 'aisyah.rahman01@example.com', '0171392448'),
(5, 'Jian Wei', 'Lee', 3, 'jianwei.lee88@example.com', '0127652034'),
(6, 'Ramesh', 'Sandeep Kumar', 1, 'sandeep.kumar95@example.com', '0169485520'),
(7, 'Mei Ling', 'Tan', 1, 'meiling.tan77@example.com', '0135289104'),
(8, 'Hakim', 'Danish', 2, 'danish.hakimi24@example.com', '01128476619');

INSERT INTO `ENROLLMENT_SUBJECT` (`enrollmentSubjectId`, `enrollmentId`, `subjectId`, `lecturerId`) VALUES
(17, 1, 1, 3),
(18, 1, 2, 4),
(20, 1, 7, 6),
(21, 1, 4, 7),
(22, 1, 3, 3);

INSERT INTO `ENROLLMENT_SUBJECT_TYPE` (`enrollmentSubjectTypeId`, `enrollmentSubjectId`, `classTypeId`, `venueId`, `startTime`, `endTime`, `dayId`, `numberOfSeats`, `grouping`) VALUES
(44, 18, 1, 9, '10:00:00', '12:00:00', 2, 100, 1),
(55, 18, 1, 6, '10:00:00', '12:00:00', 2, 100, 2),
(45, 18, 2, 7, '08:30:00', '10:30:00', 3, 35, 2),
(46, 18, 1, 9, '12:00:00', '14:00:00', 5, 100, 3),
(47, 18, 2, 5, '16:00:00', '18:00:00', 5, 30, 1),
(48, 20, 1, 10, '08:00:00', '09:00:00', 4, 100, 2),
(49, 20, 4, 11, '10:00:00', '12:00:00', 5, 100, 4),
(50, 21, 1, 6, '11:00:00', '13:00:00', 1, 100, 2),
(51, 21, 3, 3, '13:00:00', '14:00:00', 3, 30, 2),
(76, 17, 1, 3, '12:00:00', '14:00:00', 1, 30, 1),
(77, 17, 2, 8, '08:00:00', '10:00:00', 1, 100, 1),
(78, 17, 4, 5, '15:00:00', '16:00:00', 2, 25, 2),
(79, 17, 2, 3, '14:00:00', '16:00:00', 2, 20, 3);

INSERT INTO `STUDENT_ENROLLMENT_SUBJECT_TYPE` (`studentId`, `enrollmentSubjectTypeId`, `subjectStatusId`) VALUES
(23049679, 44, 1),
(23049679, 49, 1),
(23055155, 44, 1),
(23055155, 51, 1),
(23056138, 44, 1);
