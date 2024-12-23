
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

let userHand = [];
let botHand = [];


let cardsOnTable = [];
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


function handOut(userFirst){
    let fillingHand = userFirst ? userHand: botHand;

    for (let i = 0; i < 2; i++) {
        while (fillingHand.length !== 6) {
            let card = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
            fillingHand.push(card);
        }
        fillingHand = !userFirst ? userHand: botHand;
    }

    console.log(userHand);
    console.log(botHand);
}

function suits(card){
    if (card === null && cardsOnTable.length === 0){
        if (){
            return true;
        }
        for (const cardOnTable of cardsOnTable) {
            if ()
        }
    }
}


////////////////////////////////////////// HTML LOGIC //////////////////////////////////////////////////////


// elements

let $userHand = $("#user-hand");
let $botHand = $("#bot-hand");
let table = $("#table");
let cards = $(".card");

$(function(){
    fillDeck();
    handOut(true);

    for (let i = 0; i < userHand.length; i++){
        $userHand.append("<img class='card on-hand' draggable='false' src='' alt=''>")

        let {suit, value} = userHand[i];

        $userHand.children().last().attr("suit", suit)
        $userHand.children().last().attr("value", value)

        let card = $(".card").eq(i).attr("src", getUrlByCard(suit, value));

        dragElement(card);
    }

    for (let i = 0; i < botHand.length; i++){
        $botHand.append("<img class='card-back' draggable='false' src='' alt=''>")
        $(".card-back").eq(i).attr("src", "cards/card-back.png");
    }

})


function dragElement(draggableElem) {
    let HookX;
    let HookY;

    draggableElem.on("mousedown", function(e) {dragMouseDown(e)});

    function dragMouseDown(e) {
        HookX = Math.abs(e.clientX - draggableElem.offset().left);
        HookY = Math.abs(e.clientY - draggableElem.offset().top);
        draggableElem.on("mousemove", function(e) {replaceElem(e)});
        draggableElem.on("mouseup mouseout", function(e) {dragOff(e)});
        $("body").append(draggableElem);
        draggableElem.removeClass("on-hand");
        draggableElem.css("left", e.clientX - HookX + 'px');
        draggableElem.css("top", e.clientY - HookY + 'px');
    }

    function replaceElem(e) {
        draggableElem.css("left", e.clientX - HookX + 'px');
        draggableElem.css("top", e.clientY - HookY + 'px');
    }

    function dragOff(e) {
        draggableElem.off("mouseup mouseout mousemove");
        if (!IsIn(e.clientX, e.clientY, table.offset().left, table.offset().top, table.outerWidth(), table.outerHeight())) {
            hand.append(draggableElem);
            draggableElem.addClass("on-hand");
            draggableElem.css("left", '');
            draggableElem.css("top", '');
            return;
        }
        draggableElem.off("mousedown");
        draggableElem.addClass("on-table");
        draggableElem.css("left", '');
        draggableElem.css("top", '');
        draggableElem.css("rotate",  (Math.random() * 10 - Math.random() * 10) + 'deg');
        let stacks = $(".stack");
        for (const stack of stacks) {
            const $stack = $(stack);
            if ($stack.length === 1 && IsIn(
                e.clientX,
                e.clientY,
                stack.offsetLeft,
                stack.offsetTop,
                $stack.outerWidth(),
                $stack.outerHeight()
            )) {
                $stack.append(draggableElem);
                draggableElem.css("translate", "1rem")
                return;
            }
        }

        table.append("<div class='stack'><div>")
        table.children().last().append(draggableElem);
        table.children().last().css("width", draggableElem.css("width"));
        table.children().last().css("height", draggableElem.css("height"));
    }
}

function bat(cardsCount){
    let bat = $("#bat");
    for (let i = 0; i < cardsCount; i++) {
        bat.append("<img src=\"cards/card-back.png\" alt=\"\">");
        bat.children().last().css("rotate",  (Math.random() * 10 - Math.random() * 10) + 'deg');
        bat.children().last().css("translate",  (Math.random() * 4 - Math.random() * 8) + 'rem ' + (Math.random() * 2 - Math.random() * 4) + 'rem');
    }
}

/////////////////////////// MATH FUNCTIONS //////////////////////////////////////////////////////

function IsIn(objX, objY, fromX, fromY, width, height){
    return (objX >= fromX && objX <= fromX + width && objY >= fromY && objY <= fromY + height);
}

