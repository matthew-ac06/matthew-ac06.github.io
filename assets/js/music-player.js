document.addEventListener("DOMContentLoaded", function () {
    const players = document.querySelectorAll("audio");

    players.forEach(function (player) {
        player.addEventListener("play", function () {
            players.forEach(function (otherPlayer) {
                if (otherPlayer !== player) {
                    otherPlayer.pause();
                }
            });
        });
    });
});