/* audio visualizer */
document.addEventListener("DOMContentLoaded", function () {
    const players = document.querySelectorAll("audio");
    const canvas = document.getElementById("audio-visualizer");
    const ctx = canvas.getContext("2d");

    let audioContext;
    let analyser;
    const sources = new Map();

    const barCount = 32;
    const segmentCount = 20;
    const activeSegments = new Array(barCount).fill(0);
    const audioBoost = 1.8;
    const audioRange = 200;

    function setupVisualizer(player) {
        if (!audioContext) {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 128;
            analyser.connect(audioContext.destination);
        }

        if (!sources.has(player)) {
            const source = audioContext.createMediaElementSource(player);
            source.connect(analyser);
            sources.set(player, source);
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = canvas.offsetHeight;
    }

    function draw() {
        requestAnimationFrame(draw);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentPlayer = [...players].find(function (player) {
            return !player.paused;
        });

        let data = null;

        if (analyser && currentPlayer) {
            data = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(data);
        }

        const barWidth = canvas.width / barCount;
        const segmentHeight = canvas.height / segmentCount;
        const gap = 6;

        for (let i = 0; i < barCount; i++) {
            let targetSegments = 0;

            if (data) {
                const dataIndex = Math.floor(i * data.length * 0.7 / barCount);

                const normalized = data[dataIndex] / 255;

                targetSegments = Math.round(
                    Math.pow(normalized, 0.7) * segmentCount
                );
            }

            if (activeSegments[i] < targetSegments) {
                activeSegments[i] += 1;
            } else if (activeSegments[i] > targetSegments) {
                activeSegments[i] -= 1;
            }

            for (let j = 0; j < segmentCount; j++) {
                const active = j < activeSegments[i];

                if (!active) continue;

                ctx.fillStyle = "mediumspringgreen";

                ctx.fillRect(
                    i * barWidth,
                    canvas.height - (j + 1) * segmentHeight + gap / 2,
                    barWidth - gap,
                    segmentHeight - gap
                );
            }
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

/* lightbox/zoom */
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
});