let model;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');
const alertBox = document.getElementById('alertBox');

const DANGEROUS_CLASSES = ["person", "cat", "dog"];

// 웹캠 켜기
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 480, height: 360 },
    audio: false,
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve(video);
  });
}

// 사물 인식 실행
async function detectObjects() {
  if (!model) {
    output.innerText = "모델 로딩 중...";
    model = await cocoSsd.load();
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const predictions = await model.detect(canvas);
  output.innerHTML = "";
  alertBox.classList.add("hidden");

  if (predictions.length === 0) {
    output.innerText = "아무 것도 인식되지 않았습니다.";
    return;
  }

  let detectedItems = [];

  predictions.forEach(pred => {
    const label = pred.class;
    const accuracy = (pred.score * 100).toFixed(1);
    detectedItems.push(`${label} (${accuracy}%)`);

    // 위험 객체 발견 시 경고
    if (DANGEROUS_CLASSES.includes(label)) {
      alertBox.classList.remove("hidden");
    }

    // 시각적으로 표시 (캔버스에는 직접 그리지만 사용자는 비디오만 봄)
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    ctx.strokeRect(...pred.bbox);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.fillText(label, pred.bbox[0], pred.bbox[1] - 10);
  });

  output.innerHTML = `인식된 사물: <br><strong>${detectedItems.join("<br>")}</strong>`;
}

// 초기화
setupCamera();
