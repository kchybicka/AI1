document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([53.430127, 14.564802], 18);
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);

    const marker = L.marker([53.430127, 14.564802]).addTo(map);
    marker.bindPopup("<strong>To jest pinezka.</strong>");

    document.getElementById("myLocation").addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 13);
                    L.marker([latitude, longitude]).addTo(map).bindPopup("You are here!").openPopup();
                },
                error => {
                    alert("Błąd pobierania lokalizacji: " + error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
        }
    });

    document.getElementById("downloadMap").addEventListener("click", () => {
        leafletImage(map, (err, canvas) => {
            if (err) {
                console.error("Błąd przechwytywania obrazu mapy:", err);
                return;
            }

            const rasterMap = document.createElement("canvas");
            rasterMap.width = 300;
            rasterMap.height = 300;
            const rasterContext = rasterMap.getContext("2d");
            rasterContext.drawImage(canvas, 0, 0, 300, 300);

            splitImageIntoPuzzle(rasterMap);
        });
    });

    function splitImageIntoPuzzle(canvas) {
        const pieceSize = 75; // Size of each puzzle piece for a 4x4 grid
        const puzzleContainer = document.getElementById("puzzleContainer");
        puzzleContainer.innerHTML = '';  // Clear any existing pieces

        let index = 0;
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const piece = document.createElement("canvas");
                piece.width = pieceSize;
                piece.height = pieceSize;
                piece.classList.add("puzzlePiece");
                piece.setAttribute("data-index", index);
                piece.id = "piece" + index;

                piece.getContext("2d").drawImage(canvas, x * pieceSize, y * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);

                piece.draggable = true;
                piece.addEventListener("dragstart", dragStart);
                piece.addEventListener("dragover", dragOver);
                piece.addEventListener("drop", drop);

                puzzleContainer.appendChild(piece);
                index++;
            }
        }
        shufflePuzzle();
    }

    function dragStart(e) {
        e.dataTransfer.setData("text/plain", e.target.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("text/plain");
        const draggedElement = document.getElementById(draggedId);
        const targetElement = e.target;

        if (targetElement && targetElement.classList.contains("puzzlePiece")) {
            const temp = document.createElement("div");
            targetElement.parentNode.insertBefore(temp, targetElement);
            draggedElement.parentNode.insertBefore(targetElement, draggedElement);
            temp.parentNode.insertBefore(draggedElement, temp);
            temp.parentNode.removeChild(temp);

            checkPuzzleCompletion();
        }
    }

    function shufflePuzzle() {
        const puzzleContainer = document.getElementById("puzzleContainer");
        for (let i = puzzleContainer.children.length; i >= 0; i--) {
            puzzleContainer.appendChild(puzzleContainer.children[Math.random() * i | 0]);
        }
    }

    function checkPuzzleCompletion() {
        const pieces = document.querySelectorAll(".puzzlePiece");
        let completed = true;

        pieces.forEach((piece, index) => {
            const correctIndex = parseInt(piece.getAttribute("data-index"), 10);
            if (index !== correctIndex) {
                completed = false;
            }
        });

        if (completed) {
            alert("Puzzle ułożone poprawnie!");
        }
    }
});
