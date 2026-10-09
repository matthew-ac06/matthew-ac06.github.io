/* audio visualizer */
document.addEventListener("DOMContentLoaded", function () {
    const players = document.querySelectorAll("audio");
    const canvas = document.getElementById("audio-visualizer");

    if (!canvas) return;

    const canvasCtx = canvas.getContext("2d");

    let audioContext;
    let analyser;
    let dataArray;

    const sources = new Map();

    const barCount = 48;
    const barValues = new Array(barCount).fill(0);

    function setupVisualizer(player) {
        if (!audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;

            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();

            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.35;

            dataArray = new Uint8Array(analyser.frequencyBinCount);

            analyser.connect(audioContext.destination);
        }

        if (!sources.has(player)) {
            const source = audioContext.createMediaElementSource(player);

            source.connect(analyser);

            sources.set(player, source);
        }
    }

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function draw() {
        requestAnimationFrame(draw);

        const currentPlayer = [...players].find(function (player) {
            return !player.paused;
        });

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        if (!analyser || !currentPlayer) {
            for (let i = 0; i < barCount; i++) {
                barValues[i] *= 0.85;
            }

            return;
        }

        analyser.getByteFrequencyData(dataArray);

        const visualizerColor = getComputedStyle(
            canvas.parentElement
        ).getPropertyValue("--visualizer-color").trim();

        canvasCtx.fillStyle = visualizerColor;

        const minFrequency = 40;
        const maxFrequency = Math.min(
            audioContext.sampleRate / 2,
            16000
        );

        for (let i = 0; i < barCount; i++) {
            const startFrequency =
                minFrequency *
                Math.pow(
                    maxFrequency / minFrequency,
                    i / barCount
                );

            const endFrequency =
                minFrequency *
                Math.pow(
                    maxFrequency / minFrequency,
                    (i + 1) / barCount
                );

            const startBin = Math.floor(
                startFrequency /
                (audioContext.sampleRate / analyser.fftSize)
            );

            const endBin = Math.min(
                dataArray.length - 1,
                Math.ceil(
                    endFrequency /
                    (audioContext.sampleRate / analyser.fftSize)
                )
            );

            let sum = 0;
            let count = 0;

            for (
                let bin = startBin;
                bin <= endBin;
                bin++
            ) {
                sum += dataArray[bin];
                count++;
            }

            const targetValue = count > 0 ? sum / count : 0;

            if (targetValue > barValues[i]) {
                barValues[i] +=
                    (targetValue - barValues[i]) * 0.75;
            } else {
                barValues[i] +=
                    (targetValue - barValues[i]) * 0.2;
            }
        }

        const gap = 3;
        const barWidth =
            canvas.width / barCount - gap;

        for (let i = 0; i < barCount; i++) {
            const barHeight =
                (barValues[i] / 255) *
                canvas.height *
                0.9;

            const x =
                i * (canvas.width / barCount) +
                gap / 2;

            const y =
                canvas.height - barHeight;

            canvasCtx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );
        }
    }

    players.forEach(function (player) {
        player.addEventListener("play", function () {
            players.forEach(function (otherPlayer) {
                if (otherPlayer !== player) {
                    otherPlayer.pause();
                }
            });

            setupVisualizer(player);

            if (audioContext.state === "suspended") {
                audioContext.resume();
            }
        });
    });

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    draw();
});

/* lightbox & zoom */
    const images = document.querySelectorAll(".portfolio-item img");
    const lightbox = document.getElementById("image-lightbox");
    const lightboxImage = document.getElementById("lightbox-image");

    images.forEach(function (image) {
        image.addEventListener("click", function () {
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;
            lightboxImage.classList.remove("zoomed");
            lightboxImage.style.transformOrigin = "center center";
            lightbox.style.display = "flex";
        });
    });

    lightboxImage.addEventListener("click", function (event) {
        event.stopPropagation();

        if (!lightboxImage.classList.contains("zoomed")) {
            const rect = lightboxImage.getBoundingClientRect();

            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;

            lightboxImage.style.transformOrigin = x + "% " + y + "%";
            lightboxImage.classList.add("zoomed");
        } else {
            lightboxImage.classList.remove("zoomed");

            setTimeout(function () {
                if (!lightboxImage.classList.contains("zoomed")) {
                    lightboxImage.style.transformOrigin = "center center";
                }
            }, 200);
        }
    });

    lightbox.addEventListener("click", function () {
        lightbox.style.display = "none";
        lightboxImage.classList.remove("zoomed");
        lightboxImage.style.transformOrigin = "center center";
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            lightbox.style.display = "none";
            lightboxImage.classList.remove("zoomed");
            lightboxImage.style.transformOrigin = "center center";
        }
    });