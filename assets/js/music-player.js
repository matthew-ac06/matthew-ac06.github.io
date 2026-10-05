document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".music-item");

    items.forEach(function (item) {
        const audio = item.querySelector(".music-audio");
        const cd = item.querySelector(".music-cd");
        const button = item.querySelector(".music-play");
        const progress = item.querySelector(".music-progress");

        button.addEventListener("click", function () {
            items.forEach(function (otherItem) {
                if (otherItem !== item) {
                    const otherAudio = otherItem.querySelector(".music-audio");
                    const otherCd = otherItem.querySelector(".music-cd");
                    const otherButton = otherItem.querySelector(".music-play");
                    const otherProgress = otherItem.querySelector(".music-progress");

                    otherAudio.pause();
                    otherAudio.currentTime = 0;
                    otherItem.classList.remove("playing");
                    otherCd.classList.remove("playing");
                    otherButton.textContent = "▶";
                    otherProgress.value = 0;
                }
            });

            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        });

        audio.addEventListener("play", function () {
            item.classList.add("playing");
            cd.classList.add("playing");
            button.textContent = "Ⅱ";
        });

        audio.addEventListener("pause", function () {
            item.classList.remove("playing");
            cd.classList.remove("playing");
            button.textContent = "▶";
        });

        audio.addEventListener("loadedmetadata", function () {
            progress.max = audio.duration;
        });

        audio.addEventListener("timeupdate", function () {
            progress.value = audio.currentTime;
        });

        progress.addEventListener("input", function () {
            audio.currentTime = progress.value;
        });

        audio.addEventListener("ended", function () {
            item.classList.remove("playing");
            cd.classList.remove("playing");
            button.textContent = "▶";
            progress.value = 0;
        });
    });
});