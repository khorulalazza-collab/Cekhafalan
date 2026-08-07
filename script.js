/* =====================================================
   CEKHAFALAN
   Script utama aplikasi
===================================================== */


/* =====================================================
   NAVIGASI
===================================================== */

function hideAllPages() {

  const pages = document.querySelectorAll(".page");

  pages.forEach(function(page) {
    page.classList.remove("active");
  });

}


function openHome() {

  hideAllPages();

  document
    .getElementById("homePage")
    .classList.add("active");

  window.scrollTo(0, 0);

}


function openTahfidz() {

  hideAllPages();

  document
    .getElementById("tahfidzPage")
    .classList.add("active");

  window.scrollTo(0, 0);

}


function openMurottal() {

  hideAllPages();

  document
    .getElementById("murottalPage")
    .classList.add("active");

  window.scrollTo(0, 0);

}


function openRecorder() {

  hideAllPages();

  document
    .getElementById("recorderPage")
    .classList.add("active");

  window.scrollTo(0, 0);

}


/* =====================================================
   DATA TAHFIDZ SEMENTARA
===================================================== */

let suratAktif = "";

const dataSurat = {

  "Al-Fatihah": {

    ayat: `
      بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
    `

  },

  "Al-Ikhlas": {

    ayat: `
      قُلْ هُوَ اللَّهُ أَحَدٌ
    `

  },

  "An-Nas": {

    ayat: `
      قُلْ أَعُوذُ بِرَبِّ النَّاسِ
    `

  }

};


/* =====================================================
   PILIH SURAT
===================================================== */

function pilihSurat(namaSurat) {

  suratAktif = namaSurat;

  const surat =
    dataSurat[namaSurat];

  if (!surat) {

    return;

  }

  document
    .getElementById("namaSurat")
    .textContent = namaSurat;

  document
    .getElementById("ayatText")
    .textContent = surat.ayat.trim();

  document
    .getElementById("ayatBox")
    .style.display = "block";

  document
    .getElementById("ayatText")
    .classList.remove("hidden");

  window.scrollTo(0, 0);

}


/* =====================================================
   SEMBUNYIKAN / TAMPILKAN AYAT
===================================================== */

let ayatDisembunyikan = false;


function toggleAyat() {

  const ayat =
    document.getElementById("ayatText");

  const tombol =
    event.target;

  ayatDisembunyikan =
    !ayatDisembunyikan;


  if (ayatDisembunyikan) {

    ayat.classList.add("hidden");

    tombol.textContent =
      "👁️ Tampilkan Ayat";

  }

  else {

    ayat.classList.remove("hidden");

    tombol.textContent =
      "🙈 Sembunyikan Ayat";

  }

}


/* =====================================================
   REKAM AUDIO
===================================================== */

let mediaRecorder = null;

let audioChunks = [];

let audioStream = null;

let recordedAudioUrl = null;

let recordingTimer = null;

let recordingSeconds = 0;


/* =====================================================
   MULAI REKAM
===================================================== */

async function startRecording() {

  clearRecordError();

  const status =
    document.getElementById("recordStatus");

  const startButton =
    document.getElementById("startRecordBtn");

  const stopButton =
    document.getElementById("stopRecordBtn");


  /* Cek dukungan browser */

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    showRecordError(
      "❌ Browser ini tidak mendukung akses mikrofon."
    );

    return;

  }


  try {

    console.log(
      "Meminta izin mikrofon..."
    );


    /* Minta akses mikrofon */

    audioStream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });


    console.log(
      "Mikrofon berhasil diizinkan."
    );


    audioChunks = [];


    /* Buat MediaRecorder */

    let options = {};


    /*
      Gunakan WebM jika tersedia.
      Kalau tidak, biarkan browser memilih format.
    */

    if (
      MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
    ) {

      options.mimeType =
        "audio/webm;codecs=opus";

    }


    mediaRecorder =
      new MediaRecorder(
        audioStream,
        options
      );


    /* Saat ada data audio */

    mediaRecorder.ondataavailable =
      function(event) {

        if (event.data.size > 0) {

          audioChunks.push(
            event.data
          );

        }

      };


    /* Saat rekaman berhenti */

    mediaRecorder.onstop =
      function() {

        const mimeType =
          mediaRecorder.mimeType ||
          "audio/webm";


        const audioBlob =
          new Blob(
            audioChunks,
            {
              type: mimeType
            }
          );


        if (recordedAudioUrl) {

          URL.revokeObjectURL(
            recordedAudioUrl
          );

        }


        recordedAudioUrl =
          URL.createObjectURL(
            audioBlob
          );


        const audioPlayer =
          document.getElementById(
            "recordedAudio"
          );


        audioPlayer.src =
          recordedAudioUrl;


        document
          .getElementById("recordResult")
          .style.display = "block";


        console.log(
          "Rekaman selesai:",
          audioBlob.size,
          "bytes"
        );

      };


    /* Mulai rekaman */

    mediaRecorder.start();


    startButton.disabled = true;

    stopButton.disabled = false;


    status.innerHTML =
      "🔴 Sedang merekam...";


    startTimer();

  }

  catch (error) {

    console.error(
      "Recording error:",
      error
    );


    let pesan = "";


    if (
      error.name === "NotAllowedError"
    ) {

      pesan =
        "⚠️ <strong>Mikrofon tidak diizinkan.</strong><br>" +
        "Silakan izinkan akses mikrofon pada browser.";

    }

    else if (
      error.name === "NotFoundError"
    ) {

      pesan =
        "⚠️ <strong>Mikrofon tidak ditemukan.</strong><br>" +
        "Pastikan perangkat memiliki mikrofon.";

    }

    else if (
      error.name === "NotReadableError"
    ) {

      pesan =
        "⚠️ <strong>Mikrofon sedang digunakan.</strong><br>" +
        "Tutup aplikasi lain yang sedang menggunakan mikrofon.";

    }

    else {

      pesan =
        "⚠️ <strong>Gagal mengakses mikrofon.</strong><br>" +
        "Error: " +
        error.name +
        "<br>" +
        error.message;

    }


    showRecordError(pesan);

  }

}


/* =====================================================
   STOP REKAM
===================================================== */

function stopRecording() {

  if (!mediaRecorder) {

    return;

  }


  if (
    mediaRecorder.state === "recording"
  ) {

    mediaRecorder.stop();

  }


  /* Matikan mikrofon */

  if (audioStream) {

    audioStream
      .getTracks()
      .forEach(function(track) {

        track.stop();

      });

  }


  document
    .getElementById("startRecordBtn")
    .disabled = false;


  document
    .getElementById("stopRecordBtn")
    .disabled = true;


  document
    .getElementById("recordStatus")
    .innerHTML =
    "✅ Rekaman selesai";


  stopTimer();

}


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

  recordingSeconds = 0;

  updateTimer();


  recordingTimer =
    setInterval(function() {

      recordingSeconds++;

      updateTimer();

    }, 1000);

}


function stopTimer() {

  if (recordingTimer) {

    clearInterval(
      recordingTimer
    );

    recordingTimer = null;

  }

}


function updateTimer() {

  const minutes =
    Math.floor(
      recordingSeconds / 60
    );

  const seconds =
    recordingSeconds % 60;


  document
    .getElementById("recordTimer")
    .textContent =
      String(minutes).padStart(2, "0")
      + ":" +
      String(seconds).padStart(2, "0");

}


/* =====================================================
   REKAM ULANG
===================================================== */

function resetRecording() {

  stopTimer();


  if (audioStream) {

    audioStream
      .getTracks()
      .forEach(function(track) {

        track.stop();

      });

  }


  if (recordedAudioUrl) {

    URL.revokeObjectURL(
      recordedAudioUrl
    );

    recordedAudioUrl = null;

  }


  mediaRecorder = null;

  audioStream = null;

  audioChunks = [];


  document
    .getElementById("recordedAudio")
    .src = "";


  document
    .getElementById("recordResult")
    .style.display = "none";


  document
    .getElementById("startRecordBtn")
    .disabled = false;


  document
    .getElementById("stopRecordBtn")
    .disabled = true;


  document
    .getElementById("recordStatus")
    .innerHTML =
    "🎤 Siap merekam";


  recordingSeconds = 0;

  updateTimer();

  clearRecordError();

}


/* =====================================================
   ERROR
===================================================== */

function showRecordError(message) {

  const box =
    document.getElementById(
      "recordError"
    );


  box.innerHTML =
    message;


  box.style.display =
    "block";

}


function clearRecordError() {

  const box =
    document.getElementById(
      "recordError"
    );


  box.innerHTML = "";

  box.style.display =
    "none";

}


/* =====================================================
   INISIALISASI
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "Cekhafalan siap."
    );

  }
);
