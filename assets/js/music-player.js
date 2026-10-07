document.addEventListener("DOMContentLoaded", function () {
    const players = document.querySelectorAll("audio");
    const canvas = document.getElementById("audio-visualizer");
    const ctx = canvas.getContext("2d");

    let audioContext;
    let analyser;
    let source;
    let currentPlayer;

    function setupVisualizer(player) {
        if (currentPlayer === player) return;

        if (!audioContext) {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 128;
        }

        if (source) {
            source.disconnect();
        }

        source = audioContext.createMediaElementSource(player);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        currentPlayer = player;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = canvas.offsetHeight;
    }

    function draw() {
        requestAnimationFrame(draw);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!analyser || !currentPlayer || currentPlayer.paused) return;

        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);

        const barCount = 32;
        const barWidth = canvas.width / barCount;

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * data.length / barCount);
            const barHeight = (data[dataIndex] / 255) * canvas.height;

            ctx.fillStyle = "mediumspringgreen";
            ctx.fillRect(
                i * barWidth,
                canvas.height - barHeight,
                barWidth - 1,
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