# 🤖 AI Mock Interview & Placement Readiness Platform

An AI-powered web application that helps students prepare for technical interviews and improve their placement readiness through **adaptive interviews, resume analysis, performance tracking, and personalized recommendations**.

## 🚀 Features

* 🎯 **Adaptive Interview Engine** – Dynamically increases, decreases, or maintains question difficulty based on candidate performance.
* 🧠 **AI Follow-up Questions** – Maintains interview context and generates relevant follow-up questions.
* 📄 **Resume Analyzer** – Analyzes resumes and identifies technical skill gaps.
* 📊 **Placement Readiness Engine** – Combines resume, interview, and skill assessment data to generate readiness results.
* 🗺️ **Personalized Roadmap** – Recommends technologies, projects, certifications, and interview topics based on weaknesses.
* 🏢 **AI Recruiter Simulator** – Provides company-specific interview experiences for profiles such as Google, Amazon, Microsoft, TCS, Infosys, and Startups.
* 🏆 **Peer Challenge Arena** – AI-generated HR, Technical, Aptitude, and Domain challenges with scores, ranks, badges, streaks, and leaderboards.
* 🔐 **Enterprise Authentication** – Password validation, password reset, account lockout, login history, session management, and security alerts.
* 👥 **RBAC** – Separate permissions for **Student, Mentor, and Administrator** roles.
* 📈 **Performance History** – Tracks interview progress and allows recommendations to evolve over time.
* 🚫 **Duplicate & Skip Handling** – Prevents duplicate questions, detects repeated answers, and handles skipped questions.

## 🛠️ Tech Stack

**Frontend:** Next.js, React, TypeScript, Tailwind CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB, Mongoose
**AI:** Groq LLM
**Authentication:** JWT, Session Management, RBAC
**Deployment:** Vercel + Render

## 👥 Roles

| Role          | Access                                    |
| ------------- | ----------------------------------------- |
| Student       | Interviews, Reports, Challenges, Progress |
| Mentor        | Student Performance & Feedback            |
| Administrator | User Management & Platform Monitoring     |

## 🔐 Authentication Note

Email verification is implemented in the authentication flow. However, **live email delivery is currently limited in the Render Free deployment environment due to SMTP/email-service restrictions**.

## 🌐 Live Demo

**Frontend:**
https://ai-mock-interview-with-resume-analyze.vercel.app

**Backend:**
https://ai-mock-interview-with-resume-analyzer-1.onrender.com

## 👨‍💻 Author

**Vijayalakshmi B**
B.E. Computer Science and Engineering

GitHub: https://github.com/vijaya-nila
