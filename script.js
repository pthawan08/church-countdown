let countdownInterval;
let timeRemaining; // เวลาที่เหลือ (วินาที)
let isRunning = false;

// ตัวแปรสำหรับ Element 
const timerDisplay = document.getElementById('timer-display');
const setNameAndStartButton = document.getElementById('set-and-start-button');
const stopButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');
const messageElement = document.getElementById('message');
const currentItemNameDisplay = document.getElementById('current-item-name'); // ส่วนแสดงชื่อรายการ
const nextItemNameInput = document.getElementById('next-item-name');
const nextItemDurationInput = document.getElementById('next-item-duration');

// ตัวแปรใหม่สำหรับติดตามเวลาที่หมดลง
let isOvertime = false;
let startTime; // เวลาเริ่มต้น (Timestamp)
let durationMinutes = 0; // เก็บค่าระยะเวลาจาก Input (ใช้ในการคำนวณ Overtime)
let pauseStartTime = 0; // เก็บเวลาที่กดหยุดชั่วคราว

// ฟังก์ชันแสดงผลเวลาในรูปแบบ MM:SS
function formatTime(totalSeconds) {
    const totalSecondsAbs = Math.abs(totalSeconds); 
    const minutes = Math.floor(totalSecondsAbs / 60);
    const seconds = totalSecondsAbs % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// ฟังก์ชันจัดการคลาส Overtime (เพิ่ม/ลบการกระพริบ)
function toggleOvertimeClass(activate) {
    if (activate) {
        // เปิดโหมดกระพริบ
        timerDisplay.classList.add('overtime-blink');
        currentItemNameDisplay.classList.add('overtime-blink');
    } else {
        // ปิดโหมดกระพริบ
        timerDisplay.classList.remove('overtime-blink');
        currentItemNameDisplay.classList.remove('overtime-blink');
    }
}

// ฟังก์ชันอัปเดตตัวนับเวลาทุกวินาที
function updateTimer() {
    if (!isRunning) return;

    // คำนวณเวลาปัจจุบันและเวลาที่คาดว่าจะสิ้นสุด (endTime)
    const currentTime = Date.now();
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = startTime + durationMs;
    
    // เวลาที่เหลือ (ถ้าติดลบหมายถึงเลยเวลาแล้ว)
    const totalSecondsDifference = Math.floor((endTime - currentTime) / 1000); 

    if (totalSecondsDifference >= 0) {
        // *** 1. ส่วนนับถอยหลังปกติ (Countdown) ***
        timeRemaining = totalSecondsDifference;
        timerDisplay.textContent = formatTime(timeRemaining);
        
        // ตรวจสอบและปิดโหมด Overtime หากกลับมาทันเวลา
        if (isOvertime) {
            isOvertime = false;
            toggleOvertimeClass(false); // หยุดกระพริบ
            messageElement.style.display = 'none';
        }

        // เปลี่ยนสีเตือนเมื่อเหลือน้อยกว่า 1 นาที
        if (timeRemaining <= 60) {
            timerDisplay.style.color = '#ff6347'; // สีส้ม/แดง
        } else {
            timerDisplay.style.color = '#ffffff'; 
        }
        
    } else {
        // *** 2. ส่วนจัดการเมื่อหมดเวลาแล้ว (Overtime) ***
        
        const elapsedOvertime = Math.abs(totalSecondsDifference); 
        
        // ตั้งค่าเริ่มต้นเมื่อหมดเวลาครั้งแรก
        if (!isOvertime) {
            isOvertime = true;
            toggleOvertimeClass(true); // เริ่มกระพริบ
            messageElement.textContent = `*** หมดเวลา! (รายการ ${currentItemNameDisplay.textContent}) ***`;
            messageElement.style.display = 'block'; 
        }

        // แสดงผลเวลาที่เลยมาแล้ว (ไม่มีเครื่องหมายลบ)
        timerDisplay.textContent = formatTime(elapsedOvertime); 
        
        // อัปเดตข้อความ Overtime
        messageElement.textContent = `เลยเวลาแล้ว: ${formatTime(elapsedOvertime)} นาที`;
    }
}


// ฟังก์ชันตั้งค่าและเริ่มการนับถอยหลัง
function setDurationAndStart() {
    const itemName = nextItemNameInput.value.trim() || "รายการถัดไป";
    const newDurationMinutes = parseInt(nextItemDurationInput.value); 
    
    if (isNaN(newDurationMinutes) || newDurationMinutes <= 0) {
        alert("กรุณาใส่ระยะเวลาเป็นนาทีที่ถูกต้อง (มากกว่า 0)");
        return;
    }
    
    // กำหนดค่าใหม่
    durationMinutes = newDurationMinutes; 
    currentItemNameDisplay.textContent = itemName;
    
    // ตั้งค่าตัวแปรเริ่มต้น
    isOvertime = false;
    toggleOvertimeClass(false); // ตรวจสอบให้แน่ใจว่าปิดกระพริบแล้ว
    startTime = Date.now(); // บันทึกเวลาที่เริ่มนับ
    
    // เตรียมการนับถอยหลัง
    clearInterval(countdownInterval);
    isRunning = true;
    
    // อัปเดตหน้าจอเริ่มต้น
    timerDisplay.textContent = formatTime(durationMinutes * 60);
    timerDisplay.style.color = '#ffffff';
    messageElement.style.display = 'none';
    
    setNameAndStartButton.textContent = 'เริ่มใหม่/กำหนด';
    stopButton.textContent = 'หยุดชั่วคราว';
    
    // เริ่มนับถอยหลัง
    countdownInterval = setInterval(updateTimer, 1000);
}

// ฟังก์ชันหยุดชั่วคราว / เล่นต่อ
function togglePause() {
    if (durationMinutes === 0) {
        alert("กรุณากำหนดเวลาและเริ่มก่อนที่จะกดเล่นต่อ");
        return;
    }
    
    if (!isRunning) {
        // ถ้าหยุดอยู่ (เล่นต่อ)
        
        // คำนวณเวลาที่หยุดไป
        const pausedDuration = Date.now() - pauseStartTime; 
        
        // ปรับเวลาเริ่มต้นให้ชดเชยเวลาที่หยุดไป
        startTime += pausedDuration; 
        
        isRunning = true;
        stopButton.textContent = 'หยุดชั่วคราว';
        countdownInterval = setInterval(updateTimer, 1000);
        
    } else if (isRunning) {
        // ถ้ากำลังนับอยู่ (หยุดชั่วคราว)
        pauseStartTime = Date.now(); // บันทึกเวลาที่หยุด
        clearInterval(countdownInterval);
        isRunning = false;
        stopButton.textContent = 'เล่นต่อ';
    }
}

// ฟังก์ชันรีเซ็ตทั้งหมด
function resetCountdown() {
    clearInterval(countdownInterval);
    isRunning = false;
    isOvertime = false;
    timeRemaining = 0;
    durationMinutes = 0;
    
    toggleOvertimeClass(false); // หยุดกระพริบ
    
    timerDisplay.textContent = "00:00"; 
    timerDisplay.style.color = '#ffffff';
    messageElement.style.display = 'block';
    messageElement.textContent = "ป้อนรายการและกด 'กำหนดเวลาและเริ่ม'";
    stopButton.textContent = 'หยุดชั่วคราว';
    setNameAndStartButton.textContent = 'กำหนดเวลาและเริ่ม';
    currentItemNameDisplay.textContent = "โปรแกรมรอบนมัสการ";
}

// ผูกฟังก์ชันเข้ากับปุ่ม
setNameAndStartButton.addEventListener('click', setDurationAndStart);
stopButton.addEventListener('click', togglePause);
resetButton.addEventListener('click', resetCountdown);

// *** เริ่มต้นเมื่อโหลดหน้าเว็บ ***
resetCountdown();