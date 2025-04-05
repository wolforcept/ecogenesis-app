var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

const BOARD_W = 8;
const BOARD_H = 8;
const imageMana = {
    5: "forest",
    8: "forest",
    15: "forest",
    17: "forest",
    23: "forest",
    10: "forest",
    41: "water",
    37: "water",
    38: "water",
    35: "water",
    43: "water",
    39: "water",
    44: "desert",
    7: "desert",
    45: "desert",
    46: "desert",
    47: "desert",
    48: "desert",
    27: "mountain",
    18: "mountain",
    31: "mountain",
    20: "mountain",
    52: "mountain",
    57: "mountain",
    32: "forest,water",
    21: "forest,water",
    19: "forest,water",
    11: "forest,water",
    28: "forest,water",
    29: "forest,water",
    25: "forest,water",
    62: "forest,desert",
    12: "forest,desert",
    51: "forest,desert",
    64: "mountain,desert",
    9: "mountain,desert",
    30: "mountain,desert",
    3: "forest,mountain",
    16: "forest,mountain",
    26: "forest,mountain",
    65: "water,mountain",
    2: "water,mountain",
    66: "water,mountain",
    67: "water,desert",
    68: "water,desert",
    69: "water,desert",
    1: "magic",
    61: "magic",
    70: "forest,magic",
    49: "forest,magic",
    34: "water,magic",
    71: "water,magic",
    40: "mountain,magic",
    73: "mountain,magic",
    50: "desert,magic",
    63: "desert,magic",
    14: "desert,animal",
    59: "desert,animal",
    36: "water,animal",
    60: "water,animal",
    42: "forest,animal",
    53: "forest,animal",
    54: "mountain,animal",
    55: "mountain,animal",
    56: "animal",
    58: "animal",
}
const colors = {
    forest: "#008a17ff",
    water: "#1750b9ff",
    desert: "#db3f18ff",
    mountain: "#5a5a5aff",
    animal: "#f3c649ff",
    magic: "#ae00ffff",
}
const difficulty = window.location.hash;
const objective = difficulty ? run(difficulty.substring(1)) : run("easy");
console.log(objective)
const board = {};
const allDice = {};
let discardPile = [];
let selectedDice = null;
let currentCard;
let firstMove = true;
const remainingDice = {
    forest: 5,
    water: 5,
    desert: 5,
    mountain: 5,
    animal: 5,
    magic: 5
}

const powerGreen = {
    isActive: false,
    selectedDice: []
};

let deck = shuffle(Object.keys(imageMana));

function shuffle(array) {
    let i = array.length;
    while (i != 0) {
        let r = Math.floor(Math.random() * i);
        i--;
        [array[i], array[r]] = [array[r], array[i]];
    }
    return array;
}

function cantMove(dx, dy, prevColors) {

    let collided = false;

    prevColors.forEach(({ pos, color }) => {
        const x = Number(pos.split(",")[0]);
        const y = Number(pos.split(",")[1]);
        const newX = x + dx;
        const newY = y + dy;
        if (newX < 0 || newY < 0 || newX >= BOARD_W || newY >= BOARD_H)
            collided = true
    })

    return collided;

    // for (let x = 0; x < BOARD_W; x++) {
    //     for (let y = 0; y < BOARD_H; y++) {
    //         let newX = x - dx;
    //         let newY = y - dy;
    //         if (board[x + "," + y].data.color !== "#000000FF" && (newX < 0 || newY < 0 || newX >= BOARD_W || newY >= BOARD_H))
    //             return true
    //     }
    // }
    // return false;
}

function moveBoard(dx, dy) {

    const prevColors = Object.keys(board).filter(x => board[x].data.color !== null).map(pos => ({ pos, color: board[pos].data.color, number: board[pos].data.number }));

    if (cantMove(dx, dy, prevColors)) return;

    Object.keys(board).forEach(pos => {
        board[pos].data.color = null;
        board[pos].update();
    });

    prevColors.forEach(({ pos, color, number }) => {
        const x = Number(pos.split(",")[0]);
        const y = Number(pos.split(",")[1]);
        const newPos = (x + dx) + "," + (y + dy);
        board[newPos].data.color = color;
        board[newPos].data.number = number;
        board[pos].update();
        board[newPos].update();
    })

    // Object.keys(board).forEach(id => {

    //     const prevColor = board[id].data.color;
    // });
    // for (let x = 0; x < BOARD_W; x++) {
    //     for (let y = 0; y < BOARD_H; y++) {
    //         board[x + "," + y].data.color = prevColors[(x - dx) + "," + (y - dy)]
    //         board[x + "," + y].update()
    //     }
    // }

    checkWin();
}

function hasNeighbours(pos, number) {
    const up = (pos.data.x) + "," + (pos.data.y - 1)
    const down = (pos.data.x) + "," + (pos.data.y + 1)
    const left = (pos.data.x - 1) + "," + (pos.data.y)
    const right = (pos.data.x + 1) + "," + (pos.data.y)

    return (board[up] && board[up].data.color !== null && Math.abs(board[up].data.number - number) <= 1) ||
        (board[down] && board[down].data.color !== null && Math.abs(board[down].data.number - number) <= 1) ||
        (board[left] && board[left].data.color !== null && Math.abs(board[left].data.number - number) <= 1) ||
        (board[right] && board[right].data.color !== null && Math.abs(board[right].data.number - number) <= 1);
}

function hasFourNeighbours(pos) {
    const up = (pos.data.x) + "," + (pos.data.y - 1)
    const down = (pos.data.x) + "," + (pos.data.y + 1)
    const left = (pos.data.x - 1) + "," + (pos.data.y)
    const right = (pos.data.x + 1) + "," + (pos.data.y)

    return (board[up] && board[up].data.color !== null) &&
        (board[down] && board[down].data.color !== null) &&
        (board[left] && board[left].data.color !== null) &&
        (board[right] && board[right].data.color !== null);
}

function placeCard(pos) {

    if (!selectedDice || selectedDice.hasClass("disabled") || pos.data.color !== null) return;

    if (!hasNeighbours(pos, selectedDice.number) && !firstMove) return;

    if (remainingDice[selectedDice.color] <= 0) return;

    remainingDice[selectedDice.color]--;
    firstMove = false;

    pos.data.color = selectedDice.color;
    pos.data.number = selectedDice.number;
    selectedDice.reroll();
    selectedDice = null;
    makeNextCard();
    pos.update();

    checkWin();

    checkAllPlacedDice();
    //     const { x, y, color } = pos.data;
    //     if (color !== null) return
    //     pos.data.color = "white"
    //     pos.update()
}

function checkAllPlacedDice() {
    for (let id in board) {
        const pos = board[id];
        if (hasFourNeighbours(pos)) {
            remainingDice[pos.data.color]++;
            updateAllDice();
            pos.data.number = 0;
            pos.update();
        }
    }
}

function makePos(x, y) {
    const pos = $(`<div class="pos" style="left: ${x + 1}0vh; top: ${y + 1}0vh;"></div>`)
    pos.data = { x, y, color: null }
    pos.update = () => {
        if (pos.data.color && pos.data.number >= 0) {

            const diceCoordX = numbersXcoords[pos.data.number];
            const diceCoordY = numbersYcoords[pos.data.number];

            pos.css("background-image", `url(assets/dice/dice_${pos.data.color}.png)`);
            pos.css("background-repeat", `no-repeat`);
            pos.css("background-size", (48 * .58) + `vh`);
            pos.css("background-position-x", `${diceCoordX * .58}vh`);
            pos.css("background-position-y", `${diceCoordY * .58}vh`);

        } else
            pos.css("background-image", "none")
        // if (pos.data.color !== null)
        //     pos.css("background-image", `url(${images[pos.data.color]})`)
        // else
        //     pos.css("background-image", "none")
    }
    pos.update();

    pos.on("click", () => placeCard(pos))

    board[x + "," + y] = pos;
    return pos;
}

function makeObjectivePos(x, y, color) {
    const pos = $(`<div class="objective pos" style="left: ${x + 1}0vh; top: ${y + 1}0vh;"></div>`)
    pos.css("background-image", `url(assets/board/${color}.png)`);
    return pos;
}

function isBoardEqual() {
    for (pos in objective) {

        if (objective[pos] == "any") continue;
        if (board[pos].data.color !== objective[pos])
            return false
    }
    return true;
}

function checkWin() {
    if (isBoardEqual()) {
        gameOver(true);
    }
}

function gameOver(isWin) {
    if (isWin)
        $("#gameoverWin").show();
    else
        $("#gameoverLoss").show();
}

function startActivateCardPower() {

    const choice = $(`<div class="chooser"></div>`)
    for (const color of currentCard.colors) {
        const butt = $(`<div><img src="assets/symbols/${color}.png"></div>`)
        choice.append(butt);
        butt.on("click", () => {
            choice.remove();
            activateCardPower(color);
        });
    }
    $("body").append(choice)
}

function activateCardPower(color) {
    // if (color === "forest") 
    powerGreenStart()
}

function makeNextCard(keepPrev = false) {

    if (keepPrev) {
        discardPile.unshift(currentCard.id)
    }

    if (deck.length === 0) {

        if (discardPile.length == 0) {
            gameOver(false);
            return;
        }
        deck = discardPile;
        discardPile = [];
    }

    const id = deck.pop();

    const card = $(`<div class="card" style="background-image: url(assets/cards/${id}.png);"></div>`)
    const cardSymbols = $(`<div class="symbols"></div>`)
    card.append(cardSymbols);

    imageMana[id].split(",").forEach(symbolId => {
        const symbol = $(`<img class="symbol" src="assets/symbols/${symbolId}.png">`)
        cardSymbols.append(symbol)
    });

    card.id = id;
    card.colors = imageMana[id].split(",");

    $(".card").remove();

    currentCard = card;
    updateAllDice();

    $("#cardWrapper").append(card);
    $("#cardUp").css("opacity", "0%");
    $("#cardDown").css("opacity", "0%");

    updateNrOfCards();
}

function updateNrOfCards() {
    // const nr = $(`<div class="nrOfCards">${deck.length}/66</div>`);
    $("#nrWrapper").empty();
    for (let i = 0; i < deck.length; i++) {
        $("#nrWrapper").append($(`<div class="nrOfCards"></div>`));
    }
}

function updateAllDice() {
    for (let d in allDice) {
        allDice[d].update();
    }
}

//                      0        1          2         3         4       5           6
const numbersXcoords = [0,  /**/ 0,    /**/ 0,   /**/ -16, /**/ -16, /**/ -32, /**/ -32]
const numbersYcoords = [0,  /**/ -32,  /**/ -16, /**/ -32, /**/ -16, /**/ -16, /**/ -32]
function makeDice(_c) {

    const dice = $(`<div class="dice"></div>`);

    dice.on("touchend", () => {

        if (powerGreen.isActive) {
            if (powerGreen.selectedDice.includes(dice))
                powerGreen.selectedDice.splice(powerGreen.selectedDice.indexOf(dice), 1)
            else if (powerGreen.selectedDice.length < 3)
                powerGreen.selectedDice.push(dice)
            updateAllDice();
        }

        if (dice.hasClass("disabled")) return;
        if (remainingDice[dice.color] <= 0) return;
        selectedDice = dice;
        updateAllDice();
    })

    dice.reroll = () => {
        dice.number = 1 + Math.floor(Math.random() * 6);
        dice.update();
    }

    dice.update = () => {

        const diceCoordX = numbersXcoords[dice.number];
        const diceCoordY = numbersYcoords[dice.number];
        dice.css(`background-image`, `url(assets/dice/dice_${dice.color}.png)`);
        dice.css(`background-position-x`, `${diceCoordX}vh`);
        dice.css(`background-position-y`, `${diceCoordY}vh`);
        allDice[dice.color] = dice;

        if (powerGreen.isActive) {
            dice.removeClass("disabled")
            if (powerGreen.selectedDice.includes(dice))
                dice.addClass("selected")
            else
                dice.removeClass("selected")
            return;
        }

        if (currentCard && !currentCard.colors.includes(dice.color)) {
            dice.removeClass("selected")
            dice.addClass("disabled")
            return;
        }

        dice.removeClass("disabled")

        if (dice === selectedDice) dice.addClass("selected")
        else dice.removeClass("selected")

        dice.empty();
        for (let i = 0; i < remainingDice[dice.color]; i++) {
            dice.append($(`<div class="ball" style="background-color: ${colors[dice.color]}"><div>`))
        }
    }

    dice.color = _c;
    dice.reroll();

    $("#dice").append(dice);
}

$(() => {

    $("#gameoverWin").hide();
    $("#gameoverLoss").hide();

    $("#powerGreen").hide();

    $(".restartButton").on("click", () => location.reload());

    makeDice("water");
    makeDice("forest");
    makeDice("desert");
    makeDice("mountain");
    makeDice("animal");
    makeDice("magic");

    const showObjectiveButton = $(`#showObjectiveButton`)
    showObjectiveButton.on("touchstart", () => {
        $("#objective").css("opacity", "100%")
    });
    showObjectiveButton.on("touchend", () => {
        $("#objective").css("opacity", "0%")
    });

    makeNextCard();

    for (let x = 0; x < BOARD_W; x++) {
        for (let y = 0; y < BOARD_H; y++) {
            $("#board").append(makePos(x, y));
        }
    }

    for (let x = 0; x < BOARD_W; x++) {
        for (let y = 0; y < BOARD_H; y++) {
            const here = objective[x + "," + y];
            if (here)
                $("#objective").append(makeObjectivePos(x, y, here));
        }
    }

    $("#buttonLeft").on('click', () => moveBoard(-1, 0))
    $("#buttonRight").on('click', () => moveBoard(1, 0))
    $("#buttonUp").on('click', () => moveBoard(0, -1))
    $("#buttonDown").on('click', () => moveBoard(0, 1))

    $("#buttonFullscreen").on('click', () => openFullscreen())

    let touchstartY = 0
    let touchendY = 0
    let touchDy = 0

    const cardDown = $(`<div id="cardUp">USE EFFECT<br/><br/><svg 
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="88px" height="27px">
<path fill-rule="evenodd"  fill="rgb(255, 255, 255)"
 d="M44.000,14.1000 L0.000,26.1000 L0.000,12.000 L44.000,0.000 L87.1000,12.000 L87.1000,26.1000 L44.000,14.1000 Z"/>
</svg></div>`)
    const cardUp = $(`<div id="cardDown"><svg 
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="88px" height="27px">
<path fill-rule="evenodd"  fill="rgb(255, 255, 255)"
 d="M44.000,12.000 L87.1000,0.000 L87.1000,14.1000 L44.000,26.1000 L0.000,14.1000 L0.000,0.000 L44.000,12.000 Z"/>
</svg><br/>DISCARD</div>`)
    $("#cardWrapper").append(cardUp);
    $("#cardWrapper").append(cardDown);

    function checkDirection() {
        if (touchendY < touchstartY) startActivateCardPower();
        if (touchendY > touchstartY) makeNextCard(true);
    }
    $("#cardWrapper").on("touchstart", (e) => {
        touchstartY = e.changedTouches[0].screenY
    })
    $("#cardWrapper").on("touchmove", (e) => {
        touchDy = touchstartY - e.changedTouches[0].screenY
        $("#cardWrapper").css("margin-top", (-100 + 10000 / (Math.abs(touchDy) + 100)) * touchDy / Math.abs(touchDy))
        // $("#cardUp").css("margin-top", touchDy)
        // $("#cardDown").css("margin-top", touchDy)
        // $("#cardWrapper").css("margin-top", -10 * touchDy / Math.abs(touchDy) * Math.log(Math.abs(touchDy), 1.1))
        if (touchDy > 0) {
            cardDown.css("opacity", touchDy + "%")
            cardUp.css("opacity", 0)
        } else {
            cardDown.css("opacity", 0)
            cardUp.css("opacity", Math.abs(touchDy) + "%")
        }
    })
    $("#cardWrapper").on("touchend", (e) => {
        touchendY = e.changedTouches[0].screenY
        if (Math.abs(touchDy) > 180)
            checkDirection()
        $("#cardWrapper").css("margin-top", 0)
        cardUp.css("opacity", 0)
        cardDown.css("opacity", 0)
    })

    document.addEventListener('contextmenu', event => event.preventDefault());

})

function powerGreenStart() {
    powerGreen.isActive = true;
    updateAllDice();
    $("#powerGreen").show();
}

function powerGreenEnd() {
    powerGreen.isActive = false;
    powerGreen.selectedDice.forEach(dice => dice.reroll());
    powerGreen.selectedDice = [];
    $("#powerGreen").hide();
    makeNextCard();
}