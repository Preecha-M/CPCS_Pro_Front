# RiceCare Frontend

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-1.27+-009639?logo=nginx&logoColor=white)

Frontend ของระบบ RiceCare สำหรับแสดงผลข้อมูล การนำทางผู้ใช้ และเชื่อมต่อบริการ Backend (FastAPI)  
พัฒนาด้วย **React + Vite + TypeScript**

---

## System Overview

### Frontend Responsibilities
- แสดงผลหน้าเว็บหลักและหน้าเฉพาะตามบทบาทผู้ใช้
- เรียกใช้งาน API ผ่านเส้นทาง `/api`
- โหลดสื่อแนะนำจากเส้นทาง `/guide_images`
- ทำงานร่วมกับ backend ภายใต้สถาปัตยกรรมแยก service

### Main Routes
- `/` หน้าแรกของระบบ
- `/guide` หน้าแนะนำการใช้งาน
- `/admin` หน้า dashboard สำหรับผู้ดูแล