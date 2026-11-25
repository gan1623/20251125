const startButton = document.getElementById('startButton');
const statusText = document.getElementById('status');

const bubble = document.getElementById('bubble');
const levelStatus = document.getElementById('levelStatus');

startButton.addEventListener('click', startSenser);

async function startSenser() {
    try {
        if(typeof DeviceOrientationEvent === "undefined"){
            statusText.textContent = 'センサーAPIを利用できません';
            return;
        }

        if(typeof DeviceOrientationEvent.requestPermission === "function"){
            const permission = await DeviceOrientationEvent.requestPermission();

            if(permission !== 'granted'){
                statusText.textContent = 'センサーの利用が許可されませんでした';
                return;
            }

            window.addEventListener('deviceorientation', showOrientation);
            statusText.textContent = 'センサー情報を取得しています';

            startButton.disabled = true;
        }

    } catch (error) {
        statusText.textContent = 'センサーの開始に失敗しました';
        console.error(error);
    }
}

function showOrientation(event) {
    const alpha = event.alpha;
    const beta = event.beta;
    const gamma = event.gamma;

    if(beta === null || gamma === null){
        statusText.textContent = 'センサー情報を取得できません';
        return;
    }

    document.getElementById('alpha').textContent = alpha.toFixed(1) + "°";
    document.getElementById('beta').textContent = beta.toFixed(1) + "°";
    document.getElementById('gamma').textContent = gamma.toFixed(1) + "°";

    let x = gamma * 2;
    let y = beta * 2;

    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 100;

    if (distance > maxDistance) {
        x = x * maxDistance / distance;
        y = y * maxDistance / distance;
    }

    bubble.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

    const isLevel = Math.abs(beta) < 3 && Math.abs(gamma) <= 3;
    if (isLevel) {
        bubble.classList.add('level-ok');
        levelStatus.textContent = '水平です';
    } else {
        bubble.classList.remove('level-ok');
        levelStatus.textContent = '水平ではありません';
    }

    statusText.textContent = 'センサー情報を取得しました';
}

if("serviceWorker" in navigator){
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Workerを登録しました');
            console.log(registration.scope);
        } catch (error) {
            console.error('Service Worker registration failed: ', error);
        }
    });
}

alert(
    navigator.serviceWorker.controller
        ? "Service Worker制御中"
        : "Service Worker未制御"
);

caches.open("level-cache-v2").then(async (cache) => {
    const requests = await cache.keys();

    alert(
        requests.map(request => request.url).join("\n")
        || "キャッシュなし"
    );
});

