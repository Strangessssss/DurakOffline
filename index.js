
////////////////////////////// GAME INFO //////////////////////////////////////////////////

const suits = ["clubs", "diamonds", "hearts", "spades"]

const values = {
    "ace": 600,
    "king": 500,
    "queen": 400,
    "jack": 300,
    "10": 200,
    "9": 100,
    "8": 0,
    "7": -100,
    "6": -200,
    "5": -300,
    "4": -400,
    "3": -500,
    "2": -600
}

function getUrlByCard(suit, value) {
    return `cards/English_pattern_${value}_of_${suit}.svg`
}

////////////////////////////////////////// GAME LOGIC //////////////////////////////////////////////////////

let botSkipsInstantly = false; // if there are cards that bot can answer, it answers not matter whether it does not have cards for the rest

let userGoes;
let userHand = [];
let botHand = [];


let stacks = [];
let trumpCard;
let deck = [];

function fillDeck() {
    for (const suit of suits) {
        for (const value in values) {
            deck.push(
                {
                    suit,
                    value
                }
            )
        }
    }
}

function botAnswers(){
    let botHandTemp = [...botHand];
    let answers = []
    let answered;
    for (const stack in stacks) {
        let possibleAnswers = []
        if (stacks[stack].length === 2){
            continue;
        }
        for (const botCard of botHandTemp) {
            if (canAttack(botCard, stacks[stack][0])) {
                possibleAnswers.push(botCard);
                botHandTemp.splice(botHandTemp.indexOf(botCard), 1);
            }
        }
        answers.push({lyingCardIdx: stack, answer: possibleAnswers[getLeastCardIndex(possibleAnswers)]});
    }

    answered = answers.length === answers.filter(card => card.answer !== undefined).length;

    for (const answer of answers) {
        if (answer.answer === undefined) {
            continue;
        }
        stacks[answer.lyingCardIdx].push(answer.answer);
        botHand.splice(botHand.indexOf(answer.answer), 1);
    }
    return {answered, answers};
}

function botAttacks(){
    let botHandTemp = [...botHand];
    let attackCards = [];
    if (stacks.length === 0){
        console.log(botHandTemp[getLeastCardIndex(botHandTemp)])
        let value = botHandTemp[getLeastCardIndex(botHandTemp)].value;
        for (const card of botHandTemp) {
            if (card.value === value){
                attackCards.push(card);
            }
        }
        return attackCards;
    }
    else{
        let values = []
        for (const stack of stacks) {
            for (const card of stack) {
                if (!values.includes(card.value)){
                    values.push(card.value);
                }
            }
        }
        for (const value of values) {
            for (const card of botHandTemp) {
                if (card.value === value){
                    attackCards.push(card);
                }
            }
        }
        return attackCards;
    }
}

function handOut(userFirst){
    if (userFirst) {
        while (userHand.length < 6) {
            let card = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
            userHand.push(card);
        }
        while (botHand.length < 6) {
            let card = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
            botHand.push(card);
        }
    }
    else {
        while (botHand.length < 6) {
            let card = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
            botHand.push(card);
        }
        while (userHand.length < 6) {
            let card = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
            userHand.push(card);
        }
    }
}

function canUse(card1, card2){
    if (card2 === null) {
       if (stacks.length === 0){
           return true;
       }
       for (const stack of stacks) {
           for (const lyingCard of stack) {
               if (lyingCard.value === card1.value){
                   return true;
               }
           }
       }
       return false;
   }
   else{
        return canAttack(card1, card2);
   }

}

function getLeastCardIndex(cards){
    let leastIdx = 0;
    for (let cardIdx = 1; cardIdx < cards.length; cardIdx++) {
        // Compare if the current card can be attacked by the least card
        if (!canAttack(cards[cardIdx], cards[leastIdx])) {
            leastIdx = cardIdx;
        }
    }
    return leastIdx;
}

function canAttack(attackCard, lyingCard) {

    let attackCardTrump = attackCard.suit === trumpCard.suit;
    let lyingCardTrump = lyingCard.suit === trumpCard.suit;
    // conditions with trump cards
    if (attackCardTrump){
        if (lyingCardTrump){
            return cardValue(attackCard) > cardValue(lyingCard);
        }
        return true;
    }

    // if only lying card is trump card
    if (lyingCardTrump){
        return false;
    }

    // simple cards
    if (attackCard.suit !== lyingCard.suit){
        return false;
    }
    return cardValue(attackCard) > cardValue(lyingCard)
}

function userAttacks(attackCard, lyingCard){
    attackCard.userCard = true;
    userHand.splice(userHand.findIndex(elem => (elem.suit === attackCard.suit && elem.value === attackCard.value)), 1)
    if (lyingCard === null) {
        stacks.push([attackCard]);
    }
    else {
        console.log(stacks)
        console.log(stackIdx(lyingCard))
        stacks[stackIdx(lyingCard)].push(attackCard);
    }
}

function stackIdx(lyingCard){
    for (const stack of stacks) {
        if (stack.suit === lyingCard.suit && stack.value === lyingCard.value) {
            return parseInt(stack);
        }
    }
    return -1;
}

function cardValue(card){
    return values[card.value]
}

function allAnswered(){
    for (const stack of stacks) {
        if (stack.length === 1){
            return false;
        }
    }
    return true;
}

////////////////////////////////////////// HTML LOGIC //////////////////////////////////////////////////////


// elements
let $userHand = $("#user-hand");
let $botHand = $("#bot-hand");
let table = $("#table");
let $deck = $("#deck");
let functionBut = $("#function");

$(function(){

    fillDeck();
    handOut(true);
    trumpCard = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    deck.unshift(trumpCard);

    for (let i = 0; i < deck.length ; i++) {
        $deck.append("<img class='card-back' draggable='false' src='cards/card-back.png' alt=''>")
        $deck.children().last().css("translate", `-${i*0.3}px -${i*0.3}px`)
    }
    $deck.children().first().attr("src",
        getUrlByCard(
            trumpCard.suit,
            trumpCard.value
        )
    );

    $deck.children().first().css("rotate", "90deg")
    $deck.children().first().css("translate", `2rem`)

    handOut(userGoes);
    $handOut(userGoes);

    // userGoes = isUserFirst(); RETURN
    userGoes = true;

    alignCards()
})

function isUserFirst(){
    const botTrumpCards = []
    const userTrumpCards = []

    for (const card of userHand) {
        if (card.suit === trumpCard.suit){
            userTrumpCards.push(card);
        }
    }

    for (const card of botHand) {
        if (card.suit === trumpCard.suit){
            botTrumpCards.push(card);
        }
    }

    if (userTrumpCards.length === 0 || botTrumpCards.length === 0) {
        return Math.floor(Math.random() * 2);
    }
    else{
        return cardValue(botTrumpCards[getLeastCardIndex(botTrumpCards)]) > cardValue(userTrumpCards[getLeastCardIndex(userTrumpCards)]);
    }
}

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
                $stack.outerHeight()) && canAttack(card, lyingCard)
            ) {
                userAttacks(card, lyingCard);

                // adds the card to stack
                putCardOnTable(draggableElem, card, $stack)
                return;
            }
        }
        if (canUse(card, null) && userGoes){

            userGoes = true;

            draggableElem.off("mousedown");

            // sets the logic before putting card on table in html
            userAttacks(card, null);
            // puts card on table ( not on the other card )
            $userAttacks(card, draggableElem,null);

            let botAttack = botAnswers()
            for (const answer of botAttack.answers) {
                if (answer.answer === undefined){
                    continue;
                }

                setTimeout(() =>{
                    putCardOnTable(answer.answer, $(table.children()[answer.lyingCardIdx]), null)

                }, Math.random() * 1000);
            }

            alignCards();

            functionBut.css("visibility", "visible");
            functionBut.text("Bat!")
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

functionBut.on("click", function() {
    let userGoesTemp = userGoes;
    if (allAnswered()) {
        bat(stacks.length * 2);
        userGoes = !userGoes;
    }
    else {
        for (const stack of stacks) {
            for (const card of stack) {
                botHand.push(card);
            }
        }
    }
    stacks = [];
    for (const stack of table.children()) {
        stack.remove();
    }

    handOut(userGoesTemp);
    $handOut(userGoesTemp);
    alignCards()

    if (!userGoes) {
        console.log(botAttacks())
        for (const botAttackCard of botAttacks()) {
            $botAttacks(botAttackCard)
        }
    }
})

function $handOut(userFirst){
    if (userFirst){
        $fillUserHand()
        $fillBotHand();
    }
    else{
        $fillBotHand();
        $fillUserHand()
    }
    let difference = $deck.children().length - deck.length;
    for (let i = 0; i < difference; i++) {
        $deck.children().last().remove();
    }
}

function $fillUserHand(){
    $userHand.empty();
    for (const cardIdx in userHand) {
        $userHand.append("<img class='card on-hand' draggable='false' src='' alt=''>")

        let {suit, value} = userHand[parseInt(cardIdx)];

        $userHand.children().last().attr("suit", suit)
        $userHand.children().last().attr("value", value)

        let $card = $(".card").eq(parseInt(cardIdx)).attr("src", getUrlByCard(suit, value));

        dragElement($card);
    }

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

function $userAttacks(card, elem, stack){
    if (stack === null) {
        let cardOnTable;
        let rotate;
        table.append("<div class='stack'>")
        table.children().last().append(`<img class="card on-table" src="${getUrlByCard(card.suit, card.value)}" alt="">`);
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
    }
}

function $botAttacks(card){
    let chosenCard = $($botHand.children()[Math.floor(Math.random() * $botHand.children().length)]);
    let offset = chosenCard.offset();
    table.append("<div class='stack'>")
    table.children().last().append(`<img class="card on-table" src="${getUrlByCard(card.suit, card.value)}" alt=""/>`);
    $("body").append(chosenCard);
    let lyingCard = table.children().last().children().last();
    lyingCard.css("translate", "1rem")
    lyingCard.attr("suit", card.suit);
    lyingCard.attr("value", card.value);
    lyingCard.css("visibility", "hidden");
    chosenCard.css("position", "absolute");
    chosenCard.css("left", offset.left + "px");
    chosenCard.css("top", offset.top + "px");
    chosenCard.attr("src", `${getUrlByCard(card.suit, card.value)}`);
    chosenCard.css("rotate", "");
    chosenCard.css("width", lyingCard.css("width"));
    table.children().last().css("height", chosenCard.css("height"));
    table.children().last().css("width", chosenCard.css("width"));
    chosenCard.animate({
            "left": lyingCard.offset().left + "px",
            "top": lyingCard.offset().top + "px",
        },
        600,
        () =>
        {
            chosenCard.remove();
            lyingCard.css("visibility", "visible");
        }
    )
    alignCards();
}



function putCardOnTable(card, stack, elem){
    let cardOnTable;
    let rotate;
    if (stack === null){
        table.append("<div class='stack'>")
        table.children().last().append(`<img class="card on-table" src="${getUrlByCard(card.suit, card.value)}" alt="">`);
        cardOnTable = table.children().last().children().last();
        rotate = (Math.random() * 10 - Math.random() * 10) + 'deg';
        cardOnTable.css("rotate",  rotate);
        table.children().last().css("width", table.children().last().children().last().css("width"));
        table.children().last().css("height", table.children().last().children().last().css("height"));
        cardOnTable.attr("suit", card.suit);
        cardOnTable.attr("value", card.value);
        cardOnTable.css("visibility", "hidden");
    }
    else{
        let chosenCard = $($botHand.children()[Math.floor(Math.random() * $botHand.children().length)]);
        let offset = chosenCard.offset();
        stack.append(`<img class="card on-table" src="${getUrlByCard(card.suit, card.value)}" alt=""/>`);
        $("body").append(chosenCard);
        let lyingCard = stack.children().last();
        lyingCard.css("translate", "1rem")
        lyingCard.attr("suit", card.suit);
        lyingCard.attr("value", card.value);
        lyingCard.css("visibility", "hidden");
        chosenCard.css("position", "absolute");
        chosenCard.css("left", offset.left + "px")
        chosenCard.css("top", offset.top + "px")
        chosenCard.attr("src", `${getUrlByCard(card.suit, card.value)}`)
        chosenCard.css("rotate", "")
        chosenCard.css("width", lyingCard.css("width"));
        chosenCard.animate({
            "left": lyingCard.offset().left + "px",
            "top": lyingCard.offset().top + "px",
        },
            600,
            () =>
            {
                chosenCard.remove();
                lyingCard.css("visibility", "visible");
            }
        )
        alignCards();

    }
    if (elem !== null) {
        elem.animate({
            "left": cardOnTable.offset().left + "px",
            "top": cardOnTable.offset().top + "px",
            "rotate": rotate,
            "width": cardOnTable.css("width"),
        },
            300 ,
            () => {
            elem.remove();
            cardOnTable.css("visibility", "visible");
        })
    }
}

function $fillBotHand(){
    $botHand.empty();
    for (const i in botHand) {
        $botHand.append("<img class='card-back bot-card' draggable='false' src='cards/card-back.png' alt=''>")
    }
}

/////////////////////////// MATH FUNCTIONS //////////////////////////////////////////////////////

function IsIn(objX, objY, fromX, fromY, width, height) {
    return (objX >= fromX && objX <= fromX + width && objY >= fromY && objY <= fromY + height);
}

