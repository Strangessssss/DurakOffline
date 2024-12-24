
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

function botAttacks(){
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

    trumpCard = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    deck.unshift(trumpCard);
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
    for (const cardIdx in cards) {
        if (canAttack(cards[leastIdx], cards[cardIdx])){
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
        stacks[stackIdx(lyingCard)].push(attackCard);
    }
}

function stackIdx(lyingCard){
    for (const stack in stacks) {
        if (stacks[parseInt(stack)][0].suit === lyingCard.suit && stacks[parseInt(stack)][0].value === lyingCard.value) {
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

})


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
        draggableElem.css("left", e.clientX - HookX + 'px');
        draggableElem.css("top", e.clientY - HookY + 'px');
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

        // sets the card's position to 0 to avoid render errors
        draggableElem.css("left", '');
        draggableElem.css("top", '');

        // if the card does not appropriate or user puts it wrong way
        if (!IsIn(e.clientX, e.clientY, table.offset().left, table.offset().top, table.outerWidth(), table.outerHeight())) {
            $userHand.append(draggableElem);
            draggableElem.addClass("on-hand");
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
                // sets the card's html before putting on table in html
                draggableElem.addClass("on-table");
                draggableElem.off("mousedown");
                draggableElem.css("rotate",  (Math.random() * 10 - Math.random() * 10) + 'deg');

                userAttacks(card, lyingCard);

                // adds the card to stack
                putCardOnTable(draggableElem, card, $stack)
                return;
            }
        }
        if (canUse(card, null)){
            userGoes = true;
            // sets the card's html before putting on table in html
            draggableElem.addClass("on-table");
            draggableElem.off("mousedown");
            draggableElem.css("rotate",  (Math.random() * 10 - Math.random() * 10) + 'deg');

            // sets the logic before putting card on table in html
            userAttacks(card, null);
            // puts card on table ( not on the other card )
            putCardOnTable(card, null, draggableElem);

            let botAttack = botAttacks()
            for (const answer of botAttack.answers) {
                if (answer.answer === undefined){
                    continue;
                }

                setTimeout(() =>{
                    putCardOnTable(answer.answer, $(table.children()[answer.lyingCardIdx]), null)
                    $botHand.children().last().remove();
                }, Math.random() * 1000);
            }

            functionBut.css("visibility", "visible");
            functionBut.text("Bat!")
            return;
        }
        $userHand.append(draggableElem);
        draggableElem.addClass("on-hand");
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

function putCardOnTable(card, stack, elem){
    if (stack === null){
        table.append("<div class='stack'>")
        table.children().last().append(`<img class="card on-table" src="${getUrlByCard(card.suit, card.value)}" alt="">`);
        table.children().last().css("rotate",  (Math.random() * 10 - Math.random() * 10) + 'deg');
        table.children().last().css("width", table.children().last().children().last().css("width"));
        table.children().last().css("height", table.children().last().children().last().css("height"));
        table.children().last().children().last().attr("suit", card.suit);
        table.children().last().children().last().attr("value", card.value);
    }
    else{
        stack.append(`<img class="card on-table" src="${getUrlByCard(card.suit, card.value)}" alt=""/>`);
        stack.children().last().css("translate", "1rem")
        stack.children().last().attr("suit", card.suit);
        stack.children().last().attr("value", card.value);
    }
    if (elem !== null) {
        elem.remove();
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

