/* STATE APLIKASI */
let currentSurat = "Al-Ikhlas";
let currentAyatIndex = 1;
const totalAyat = 4;

let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;
let seconds = 0;

const ayatData = {
  "Al-Ikhlas": [
    "قُلْ هُوَ اللَّهُ أَحَدٌ",
    "اللَّهُ الصَّمَدُ",
    "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
  ]
};

const recordedStatus = { 1: false, 2: false, 3: false, 4: false };

/* NAVIGASI HALAMAN */
function openPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  // Update navbar state
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  window.scrollTo(0, 0);
}

/* PENGATURAN TAHFIDZ */
function selectSurat(suratName) {
  currentSurat = suratName;
  openPage("setupPage");
}

function startLatihan() {
  currentAyatIndex = 1;
  updateRecordingUI();
  openPage("recordPage");
}

/* LOGIKA REKAMAN PER-AYAT */
function updateRecordingUI() {
  document.getElementById("recSuratTitle").innerText = currentSurat;
  document.getElementById("currentAyatBadge").innerText = `Ayat ${currentAyatIndex}`;
  document.getElementById("recStatusText").innerText = `Siap merekam Ayat ${currentAyatIndex}/${totalAyat}`;
  
  // Update grid ayat
  for (let i = 1; i <= totalAyat; i++) {
    const btn = document.getElementById(`ayatBtn-${i}`);
    btn.className = "ayat-num-btn";
    if (recordedStatus[i]) {
      btn.classList.add("done");
    } else if (i === currentAyatIndex) {
      btn.classList.add("active");
    }
  }

  // Update total direkam
  const doneCount = Object.values(recordedStatus).filter(Boolean).length;
  document.getElementById("recordedCountText").innerText = `${doneCount}/${totalAyat} direkam`;

  // Hide peek card
  document.getElementById("peekBox").style.display = "none";
}

async function toggleRecordState() {
  const mainBtn = document.getElementById("mainRecBtn");
  const recDot = document.getElementById("recDot");
  const waveform = document.getElementById("waveform");

  if (!isRecording) {
    // Mulai rekam
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
      mediaRecorder.onstop = saveRecording;

      mediaRecorder.start();
      isRecording = true;

      mainBtn.innerText = "⏹️ Selesai Rekam Ayat Ini";
      mainBtn.classList.add("recording");
      recDot.classList.add("active");
      waveform.style.display = "flex";

      startTimer();
    } catch (err) {
      alert("Akses mikrofon ditolak atau tidak didukung.");
    }
  } else {
    // Stop rekam
    mediaRecorder.stop();
    isRecording = false;

    stopTimer();
    mainBtn.innerText = "Ayat Berikutnya ➔";
    mainBtn.classList.remove("recording");
    recDot.classList.remove("active");
    waveform.style.display = "none";
  }
}

function saveRecording() {
  recordedStatus[currentAyatIndex] = true;

  if (currentAyatIndex < totalAyat) {
    currentAyatIndex++;
    updateRecordingUI();
    document.getElementById("mainRecBtn").innerText = "🎙️ Rekam Hafalanmu";
  } else {
    // Selesai seluruh ayat
    openPage("resultPage");
  }
}

/* TIMER FUNCTION */
function startTimer() {
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    document.getElementById("recTimer").innerText = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

/* BANTUAN FITUR */
function toggleLihatAyat() {
  const peekBox = document.getElementById("peekBox");
  const textArabic = document.getElementById("peekArabicText");
  
  textArabic.innerText = ayatData[currentSurat][currentAyatIndex - 1] || "تَكْسِ";
  peekBox.style.display = peekBox.style.display === "none" ? "block" : "none";
}

function toggleAwalanText() {
  const peekBox = document.getElementById("peekBox");
  const textArabic = document.getElementById("peekArabicText");
  
  const fullText = ayatData[currentSurat][currentAyatIndex - 1] || "";
  textArabic.innerText = fullText.split(" ").slice(0, 2).join(" ") + " ...";
  peekBox.style.display = peekBox.style.display === "none" ? "block" : "none";
}

function playCurrentQari() {
  alert(`Memutar Audio Qari Ayat ${currentAyatIndex}...`);
}

function playAwalan() {
  alert(`Memutar Awalan Audio Ayat ${currentAyatIndex}...`);
}

function selectQari(element, qariName) {
  document.querySelectorAll(".qari-item").forEach(el => el.classList.remove("selected"));
  element.classList.add("selected");
}
