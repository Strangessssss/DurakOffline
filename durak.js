class Durak{

    cardSuits= ["clubs", "diamonds", "hearts", "spades"]

    cardValues = {
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

    getUrlByCard(suit, value) {
        return `cards/English_pattern_${value}_of_${suit}.svg`
    }

    userGoes;
    userHand = [];
    botHand = [];

    constructor() {
        this.fillDeck();
        this.trumpCard = this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0];
        this.deck.unshift(this.trumpCard);
    }


    stacks = [];
    trumpCard;
    deck = [];

    fillDeck() {
        for (const suit of this.cardSuits) {
            for (const value in this.cardValues) {
                this.deck.push(
                    {
                        suit,
                        value
                    }
                )
            }
        }
    }

    botAnswers() {
        let botHandTemp = [...this.botHand];
        let answers = []
        let answered;
        for (const stack in this.stacks) {
            let possibleAnswers = []
            if (this.stacks[stack].length === 2) {
                continue;
            }
            for (const botCard of botHandTemp) {
                if (this.canAttack(botCard, this.stacks[stack][0])) {
                    possibleAnswers.push(botCard);
                    botHandTemp.splice(botHandTemp.indexOf(botCard), 1);
                }
            }
            answers.push({lyingCardIdx: stack, answer: possibleAnswers[this.getLeastCardIndex(possibleAnswers)]});
        }

        answered = answers.length === answers.filter(card => card.answer !== undefined).length;

        for (const answer of answers) {
            if (answer.answer === undefined) {
                continue;
            }
            this.stacks[answer.lyingCardIdx].push(answer.answer);
            this.botHand.splice(this.botHand.indexOf(answer.answer), 1);
        }
        return {answered, answers};
    }

    botAttacks() {
        let botHandTemp = [...this.botHand];
        let attackCards = [];
        if (this.stacks.length === 0) {
            let value = botHandTemp[this.getLeastCardIndex(botHandTemp)].value;
            for (const card of botHandTemp) {
                if (card.value === value) {
                    attackCards.push(card);
                }
            }
            if (this.deck.length > 0) {
                while (this.userHand.length - this.getTableCardsCount() - attackCards >= 1) {
                    attackCards.shift()
                }
            }
            else {
                while (this.userHand.length - this.getTableCardsCount() - attackCards >= 0) {
                    attackCards.shift()
                }
            }
            for (const card of attackCards) {
                this.putCardOnTable(card, null, false);
            }
            return attackCards;
        } else {
            let values = []
            for (const stack of this.stacks) {
                for (const card of stack) {
                    if (!values.includes(card.value)) {
                        values.push(card.value);
                    }
                }
            }
            for (const value of values) {
                for (const card of botHandTemp) {
                    if (card.value === value) {
                        attackCards.push(card);
                    }
                }
            }
            for (const card of attackCards) {
                this.putCardOnTable(card, null, false);
            }
            return attackCards;
        }
    }

    won(){
        return this.userHand.length === 0 || this.botHand.length === 0;
    }

    getTableCardsCount(){
        let count = 0;
        for (const stack of this.stacks) {
            for (const card in stack) {
               count++;
            }
        }
        return count;
    }

    drawCards(targetHand) {
        let newCards = []
        while (targetHand.length < 6) {
            if (this.deck.length === 0) {
                break;
            }
            let i = Math.floor(Math.random() * this.deck.length);
            if (i === 0 && this.deck.length !== 1) {
                continue;
            }
            let card = this.deck.splice(i, 1)[0];
            targetHand.push(card);
            newCards.push({
                i: targetHand.length - 1,
                card: card
            });
        }
        return newCards;
    }

    handOut(userFirst) {
        let userNewCards;
        let botNewCards;
        if (userFirst) {
            userNewCards = this.drawCards(this.userHand);
            botNewCards = this.drawCards(this.botHand);
        } else {
            botNewCards = this.drawCards(this.botHand);
            userNewCards = this.drawCards(this.userHand);
        }
        return {
            userNewCards,
            botNewCardsCount: botNewCards.length,
        }
    }

    canUse(card1, card2) {
        if (card2 === null) {
            if (this.stacks.length === 0) {
                return true;
            }
            for (const stack of this.stacks) {
                for (const lyingCard of stack) {
                    if (lyingCard.value === card1.value) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            return this.canAttack(card1, card2);
        }

    }

    getLeastCardIndex(cards) {
        let leastIdx = 0;
        for (let cardIdx = 1; cardIdx < cards.length; cardIdx++) {
            // Compare if the current card can be attacked by the least card
            if (!this.canAttack(cards[cardIdx], cards[leastIdx])) {
                leastIdx = cardIdx;
            }
        }
        return leastIdx;
    }

    canAttack(attackCard, lyingCard) {

        let attackCardTrump = attackCard.suit === this.trumpCard.suit;
        let lyingCardTrump = lyingCard.suit === this.trumpCard.suit;
        // conditions with trump cards
        if (attackCardTrump) {
            if (lyingCardTrump) {
                return this.cardValue(attackCard) > this.cardValue(lyingCard);
            }
            return true;
        }

        // if only lying card is trump card
        if (lyingCardTrump) {
            return false;
        }

        // simple cards
        if (attackCard.suit !== lyingCard.suit) {
            return false;
        }
        return this.cardValue(attackCard) > this.cardValue(lyingCard)
    }

    clearTable(){
        let count = 0;
        for (const stack of this.stacks) {
            count += stack.length;
        }
        this.stacks = []
        return count;
    }

    putCardOnTable(attackCard, lyingCard, userCard) {
        attackCard.userCard = userCard;
        if (userCard) {
            for (const cardIdx in this.userHand) {
                let _cardIdx = parseInt(cardIdx);
                if (this.userHand[_cardIdx].suit === attackCard.suit && this.userHand[_cardIdx].value === attackCard.value) {
                    this.userHand.splice(_cardIdx, 1);
                }
            }
        } else {
            for (const cardIdx in this.botHand) {
                let _cardIdx = parseInt(cardIdx);
                if (this.botHand[_cardIdx].suit === attackCard.suit && this.botHand[_cardIdx].value === attackCard.value) {
                    this.botHand.splice(_cardIdx, 1);
                }
            }
        }

        if (lyingCard === null) {
            this.stacks.push([attackCard]);
        } else {
            this.stacks[this.stackIdx(lyingCard)].push(attackCard);
        }
    }

    stackIdx(lyingCard) {
        for (const stack in this.stacks) {
            if (this.stacks[stack][0].suit === lyingCard.suit && this.stacks[stack][0].value === lyingCard.value) {
                return parseInt(stack);
            }
        }
        return -1;
    }

    cardValue(card) {
        return this.cardValues[card.value]
    }

    allAnswered() {
        for (const stack of this.stacks) {
            if (stack.length === 1) {
                return false;
            }
        }
        return true;
    }

    fromTableToBot() {
        for (const stack of this.stacks) {
            for (const card of stack) {
                this.botHand.push(card);
            }
        }
    }

    fromTableToUser() {
        for (const stack of this.stacks) {
            for (const card of stack) {
                this.userHand.push(card);
            }
        }
    }

    isUserFirst() {
        const botTrumpCards = []
        const userTrumpCards = []

        for (const card of this.userHand) {
            if (card.suit === this.trumpCard.suit) {
                userTrumpCards.push(card);
            }
        }

        for (const card of this.botHand) {
            if (card.suit === this.trumpCard.suit) {
                botTrumpCards.push(card);
            }
        }

        if (userTrumpCards.length === 0 || botTrumpCards.length === 0) {
            return Math.floor(Math.random() * 2);
        } else {
            return this.cardValue(botTrumpCards[this.getLeastCardIndex(botTrumpCards)]) > this.cardValue(userTrumpCards[this.getLeastCardIndex(userTrumpCards)]);
        }
    }
}

export default Durak;