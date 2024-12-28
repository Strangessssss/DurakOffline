import Durak from "./durak.js";

let durak = new Durak();

function updateInfo(){
    console.log("------Update info-------");
    console.log(durak.userHand);
    console.log(durak.botHand);
    console.log(durak.stacks);
}

////////////////////////////////////////// HTML LOGIC //////////////////////////////////////////////////////

// elements
let $userHand = $("#user-hand");
let $botHand = $("#bot-hand");
let table = $("#table");
let $deck = $("#deck");
let userFunctionBut = $("#user-function");
let botFunction = $("#bot-function");

$(function(){
    for (let i = 0; i < durak.deck.length ; i++) {
        $deck.append("<img class='card-back' draggable='false' src='cards/card-back.png' alt=''>")
        $deck.children().last().css("translate", `-${i*0.3}px -${i*0.3}px`)
    }
    $deck.children().first().attr("src",
        durak.getUrlByCard(
            durak.trumpCard.suit,
            durak.trumpCard.value
        )
    );

    $deck.children().first().css("rotate", "90deg")
    $deck.children().first().css("translate", `2rem`)

    $handOut(durak.userGoes);

    // userGoes = isUserFirst(); RETURN
    durak.userGoes = true;
})

function alignCards(){
    const botHandCards = $botHand.children();
    const userHandCards = $userHand.children();
    botHandCards.each((index, card) => {
        $(card).css({
            "rotate": (-getDegreeByIndex(index, botHandCards.length)).toString() + "deg",
            "left": getCardPosition(index, botHandCards.length, $botHand.outerWidth()).toString() + "px",
        });
    });
    userHandCards.each((index, card) => {
        $(card).css({
            "rotate": getDegreeByIndex(index, userHandCards.length).toString() + "deg",
            "left": getCardPosition(index, userHandCards.length, $userHand.outerWidth()).toString() + "px",
        });
    });
}

function getDegreeByIndex(index, length) {
    const range = 40;
    const start = -20;
    if (length === 1) return 0;
    const step = range / (length - 1);
    return start + step * index;
}

function getCardPosition(index, totalCards, containerWidth) {
    let rangeX = 400;
    const startX = (containerWidth - rangeX) / 2;
    const stepX = totalCards > 1 ? rangeX / (totalCards - 1) : 0;
    return startX + stepX * index;
}


function dragElement(draggableElem) {
    let HookX;
    let HookY;

    draggableElem.on("mousedown", function(e) {dragMouseDown(e)});

    function dragMouseDown(e) {
        // sets the hook ( where mouse took teh card )
        HookX = Math.abs(e.clientX - draggableElem.offset().left);
        HookY = Math.abs(e.clientY - draggableElem.offset().top);

        draggableElem.on("mousemove", function(e) {replaceElem(e)});
        draggableElem.on("mouseup mouseout", function(e) {putCard(e)});

        $("body").append(draggableElem);
        draggableElem.removeClass("on-hand");
        draggableElem.addClass("on-drag");
        draggableElem.css("rotate", '');
        draggableElem.css("left", e.clientX - HookX + 'px');
        draggableElem.css("top", e.clientY - HookY + 'px');
        alignCards();
    }

    function replaceElem(e) {

        // changes the position of card relating to mouse
        draggableElem.css("left", e.clientX - HookX + 'px');
        draggableElem.css("top", e.clientY - HookY + 'px');

    }

    function putCard(e) {
        // gets the current card object from html
        let card = {suit: draggableElem.attr("suit"), value:draggableElem.attr("value")};
        // removes events from card  so that it does not move after mouse is up
        draggableElem.off("mouseup mouseout mousemove");
        draggableElem.removeClass("on-drag");

        // if the card does not appropriate or user puts it wrong way
        if (!IsIn(e.clientX, e.clientY, table.offset().left, table.offset().top, table.outerWidth(), table.outerHeight())) {
            // sets the card's position to 0 to avoid render errors
            draggableElem.css("left", '');
            draggableElem.css("top", '');
            $userHand.append(draggableElem);
            draggableElem.addClass("on-hand");
            alignCards();
            return;
        }

        // checks if user want to put the card on the other card
        let stacks = $(".stack");
        for (const stack of stacks) {
            const $stack = $(stack);
            let lyingCard = {suit: $stack.children().last().attr("suit"), value: $stack.children().last().attr("value")};
            // checks if stack has only 1 card to avoid 3 cards on each other
            if ($stack.children().length === 1 && IsIn(
                e.clientX,
                e.clientY,
                stack.offsetLeft,
                stack.offsetTop,
                $stack.outerWidth(),
                $stack.outerHeight()) && durak.canAttack(card, lyingCard)
            ) {
                durak.putCardOnTable(card, lyingCard, true);

                // adds the card to stack
                $userAnswers(card, $stack, draggableElem)

                let botAttack = $botAttacks();
                while(botAttack){
                    botAttack = $botAttacks();
                }
                if (durak.allAnswered()){
                    setUserFunctionText(null);
                    setTimeout(()=> {
                        $clearTable(true)
                        setUserFunctionText(null);
                        durak.userGoes = true;
                        $handOut();
                        setTimeout(()=> {setBotFunctionText(null)}, 2000)
                    }, 1500)
                }
                return;
            }
        }
        if (durak.canUse(card, null) && durak.userGoes){

            setUserFunctionText(null)

            durak.userGoes = true;

            draggableElem.off("mousedown");
            // sets the logic before putting card on table in html
            durak.putCardOnTable(card, null, true);
            // puts card on table ( not on the other card )
            $userAttacks(card, draggableElem,null);

            $botAnswers();

            return;
        }
        // sets the card's position to 0 to avoid render errors
        draggableElem.css("left", '');
        draggableElem.css("top", '');
        $userHand.append(draggableElem);
        draggableElem.addClass("on-hand");
        alignCards();
    }
}

userFunctionBut.on("click", function() {
    let userGoesTemp = durak.userGoes;
    if (durak.userGoes) {
        if (durak.allAnswered()) {
            $clearTable(true);
            durak.userGoes = false;
        }
        else {
            durak.fromTableToBot();
            durak.userGoes = true;
            $clearTable(false);
        }
    }
    else{
        if (durak.allAnswered()) {
            $clearTable(true);
            durak.userGoes = true;
        }
        else {
            durak.fromTableToUser();
            durak.userGoes = false;
            $clearTable(false);
            setUserFunctionText("Take:(")
        }
    }


    $handOut(userGoesTemp);
    if (!durak.userGoes) {
        $botAttacks();
    }


})

function setUserFunctionText(text){
    if (text === null){
        userFunctionBut.css("visibility", "hidden");
        return;
    }
    userFunctionBut.css("visibility", "visible");
    userFunctionBut.text(text);
}

function setBotFunctionText(text){
    if (text === null){
        botFunction.css("visibility", "hidden");
        return;
    }
    botFunction.css("visibility", "visible");
    botFunction.text(text);
}


function $handOut(userFirst){
    durak.handOut(userFirst);
    if (userFirst){
        $fillUserHand()
        $fillBotHand();
    }
    else{
        $fillBotHand();
        $fillUserHand()
    }
    let difference = $deck.children().length - durak.deck.length;
    for (let i = 0; i < difference; i++) {
        $deck.children().last().remove();
    }
    alignCards();
}

function $fillUserHand(){
    $userHand.empty();
    for (const cardIdx in durak.userHand) {
        $userHand.append("<img class='card on-hand' draggable='false' src='' alt=''>")

        let {suit, value} = durak.userHand[parseInt(cardIdx)];
        $userHand.children().last().attr("suit", suit)
        $userHand.children().last().attr("value", value)

        let $card = $(".card").eq(parseInt(cardIdx)).attr("src", durak.getUrlByCard(suit, value));
        dragElement($card);
    }

}

function $clearTable(fillBat){
    let count = durak.clearTable();
    for (const stack of table.children()) {
        stack.remove();
    }
    if (fillBat)
        bat(count)
    durak.stacks = []
}

function bat(cardsCount) {
    let bat = $("#bat");
    for (let i = 0; i < cardsCount; i++) {
        setTimeout(() =>{
            bat.append("<img src=\"cards/card-back.png\" alt=\"\">");
            bat.children().last().css("rotate", (Math.random() * 10 - Math.random() * 10) + 'deg');
            bat.children().last().css("translate", (Math.random() * 4 - Math.random() * 8) + 'rem ' + (Math.random() * 2 - Math.random() * 4) + 'rem');
        }, i * 200)
    }
}

function $userAttacks(card, elem){
    let cardOnTable;
    let rotate;
    table.append("<div class='stack'>")
    table.children().last().append(`<img class="card on-table" src="${durak.getUrlByCard(card.suit, card.value)}" alt="">`);
    cardOnTable = table.children().last().children().last();
    rotate = (Math.random() * 10 - Math.random() * 10) + 'deg';
    cardOnTable.css("rotate", rotate);
    table.children().last().css("width", table.children().last().children().last().css("width"));
    table.children().last().css("height", table.children().last().children().last().css("height"));
    cardOnTable.attr("suit", card.suit);
    cardOnTable.attr("value", card.value);
    cardOnTable.css("visibility", "hidden");
    elem.animate({
            "left": cardOnTable.offset().left + "px",
            "top": cardOnTable.offset().top + "px",
            "rotate": rotate,
            "width": cardOnTable.css("width"),
        },
        300,
        () => {
            elem.remove();
            cardOnTable.css("visibility", "visible");
        })
    $won();
}

function $botAnswers(){
    let botAttack = durak.botAnswers()
    for (const answer of botAttack.answers) {
        if (answer.answer === undefined){
            setTimeout(() =>{
                setUserFunctionText("Bat!")
                setBotFunctionText("Take:(")
            }, 1500)
            return;
        }
        setTimeout(() => {
            let card = answer.answer;
            let stack = $(table.children()[answer.lyingCardIdx]);
            let chosenCard = $($botHand.children()[Math.floor(Math.random() * $botHand.children().length)]);
            let offset = chosenCard.offset();
            stack.append(`<img class="card on-table" src="${durak.getUrlByCard(card.suit, card.value)}" alt=""/>`);
            $("body").append(chosenCard);
            let lyingCard = stack.children().last();
            SetBotCard(lyingCard, card, offset, chosenCard);
            chosenCard.animate({
                    "left": lyingCard.offset().left + "px",
                    "top": lyingCard.offset().top + "px",
                },
                600,
                () => {
                    chosenCard.remove();
                    lyingCard.css("visibility", "visible");
                    setUserFunctionText("Bat!")
                }
            )
            alignCards();
            }, Math.random() * 2500);``
    }
    $won();
}

function $won(){
    if (durak.won()){
        console.log("WINNNNNN!!!!!!!!!");
    }
}

function $botAttacks(){
    setBotFunctionText(null)
    let botAttack = durak.botAttacks();
    let i = 0;
    for (const card of botAttack) {
        setTimeout(() => {
            let chosenCard = $($botHand.children()[Math.floor(Math.random() * $botHand.children().length)]);
            let offset = chosenCard.offset();
            table
            .append("<div class='stack'>")
            table
            .children().last().append(`<img class="card on-table" src="${durak.getUrlByCard(card.suit, card.value)}" alt=""/>`);
            $(
            "body").append(chosenCard);
        let lyingCard = table.children().last().children().last();

        SetBotCard(lyingCard, card, offset, chosenCard);

        table.children().last().css("height", chosenCard.css("height"));
        table.children().last().css("width", chosenCard.css("width"));
        chosenCard.animate({
                "left": lyingCard.offset().left + "px",
                "top": lyingCard.offset().top + "px",
            },
            600,
            () => {
                chosenCard.remove();
                lyingCard.css("visibility", "visible");
            }
        )
            alignCards();

        }, i * 200)
    }
    userFunctionBut.text("take:(")
    $won();
    return durak.botAttacks.length !== 0;
}

function SetBotCard(lyingCard, card, offset, chosenCard){
    lyingCard.css("translate", "1rem")
    lyingCard.attr("suit", card.suit);
    lyingCard.attr("value", card.value);
    lyingCard.css("visibility", "hidden");
    chosenCard.css("position", "absolute");
    chosenCard.css("left", offset.left + "px");
    chosenCard.css("top", offset.top + "px");
    chosenCard.attr("src", `${durak.getUrlByCard(card.suit, card.value)}`);
    chosenCard.css("rotate", "");
    chosenCard.css("width", lyingCard.css("width"));
}

function $userAnswers(card, stack, elem) {
    let cardOnTable;
    let rotate;
    stack.append(`<img class="card on-table" src="${durak.getUrlByCard(card.suit, card.value)}" alt="">`);
    cardOnTable = stack.children().last();
    rotate = (Math.random() * 10 - Math.random() * 10) + 'deg';
    cardOnTable.css("rotate", rotate);
    stack.css("width", stack.children().last().css("width"));
    stack.css("height", table.children().last().children().last().css("height"));
    cardOnTable.attr("suit", card.suit);
    cardOnTable.attr("value", card.value);
    cardOnTable.css("visibility", "hidden");
    elem.animate({
            "left": cardOnTable.offset().left + "px",
            "top": cardOnTable.offset().top + "px",
            "rotate": rotate,
            "width": cardOnTable.css("width"),
        },
        300,
        () => {
            elem.remove();
            cardOnTable.css("visibility", "visible");
        })
    $won();
}

function $fillBotHand(){
    $botHand.empty();
    for (const i in durak.botHand) {
        $botHand.append("<img class='card-back bot-card' draggable='false' src='cards/card-back.png' alt=''>")
    }
}

/////////////////////////// MATH FUNCTIONS //////////////////////////////////////////////////////

function IsIn(objX, objY, fromX, fromY, width, height) {
    return (objX >= fromX && objX <= fromX + width && objY >= fromY && objY <= fromY + height);
}

