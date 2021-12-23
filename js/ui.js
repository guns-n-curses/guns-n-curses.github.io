


let ui = {};



ui.language = "fr";
ui.gender = "f";



ui.switchLanguage = function () {

    ui.language = (ui.language == "en") ? "fr" : "en";
    ui.redrawAllCards();
}



ui.switchGender = function () {

    ui.gender = (ui.gender == "m") ? "f" : "m";
    ui.redrawAllCards();
}



ui.init = function () {

    ui.display = new ROT.Display({
        width: 19,
        height: 19,
        fontFamily: "unifont",
        fontSize: 16,
        forceSquareRatio: true,
        bg: "#2b2a33",
        fg: "#FFFFFFC0",
    });
    $("#canvas-container").append(ui.display.getContainer());

    ui.splashScreen();
}



ui.splashScreen = function () {

    ui.display.clear();

    for (let i = 0; i < 333; i++) {
        let x = Math.floor(9.5 * Math.random() + 9.5 * Math.random());
        let y = 19 - Math.floor((19 * Math.random() * 19 * Math.random()) / 361 * 19);
        let c = Math.sqrt((9.5-x)*(9.5-x) + y*y) / 19;
        ui.display.draw(
            x, y,
            '~', ROT.Color.toHex(ROT.Color.interpolate([255, 0, 0], [127, 127, 0], c)), "#00000010"
        );
    }
    ui.display.drawText(3, 8,  "-------------");
    ui.display.drawText(3, 9,  "GUNS И CURSES");
    ui.display.drawText(3, 10, "-------------");
}

setInterval(ui.splashScreen, 100);

ui.cards = [];



ui.addCard = function (classes, content) {

    ui.cards.push({ classes, content });

    ui.redrawAllCards();
}



ui.drawCard = function (card) {

    let div = document.createElement("div");
    div.innerHTML = `
        <div class="card container pre removable ${card.classes}">${card.content()}</div>
    `;
    $("#container").append(div);
}



ui.redrawAllCards = function() {

    $(".removable.card").remove();

    ui.cards.forEach(ui.drawCard);
}



ui.checkCharacter = function() {

    setTimeout(() => {
        let type = $("input[name='race-radio']:checked").val();
        let name = $("#character-name").val();
        if (type && name && name.length > 1) $("#characterOk").removeClass("btn-ghost");
        else $("#characterOk").addClass("btn-ghost");
    }, 20);
}



ui.characterChoiceOk = function() {

    setTimeout(() => {
        let type = $("input[name='race-radio']:checked").val();
        let name = $("#character-name").val();
        if (type && name && name.length > 1)
            manager.startGame();
    }, 20);
}



ui.gameStateUI = {};



ui.gameStateUI["home"] = function () {

    ui.addCard("welcome-card", () => tr`
    <strong>*** GUNS & CURSES ***</strong>

    ${"Welcome, adventurer."}
    <a onclick="manager.newGame()">${"Start a new game"}</a>
    <a onclick="manager.consultBookOfDeath()">${"Consult the book of death"}</a>
    <a onclick="ui.switchLanguage()">${"Change language"}</a>
    <a onclick="ui.switchGender()">${"Change gender"} (${ui.gender == 'm' ? "male" : "female" })</a>
    `);
}



ui.gameStateUI["characterChoice"] = function () {

    ui.addCard("character-choice", () => tr`
<div class="terminal-card" onchange="ui.checkCharacter()"><header>${"YOUR CHARACTER"}</header><div>
${"Name:"}
<input id="character-name" onkeydown="ui.checkCharacter()" name="character-name" type="text" required minlength="2" />

${"Race:"}
  <input name="race-radio" type="radio" id="human-radio" value="human"/> <label for="human-radio"><a>${"Human"}</a></label>
  <input name="race-radio" type="radio" id="robot-radio" value="robot"/> <label for="robot-radio"><a>${"Robot"}</a></label>

<button id="characterOk" class="btn btn-primary btn-ghost" onclick="ui.characterChoiceOk()">${"Start"}</button>
</div></div>
`);
}







