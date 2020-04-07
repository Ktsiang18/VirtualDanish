#!/usr/bin/python
from pieces import *
import random
import time

class Player(object):
    """Players have a hand and down cards."""

    def __init__(self, num):
        self.name = 'Player ' + str(num)
        self.hand = []
        self.upCards = []
        self.downCards = []
        self.usingDownCards = False

    def readHand(self):
        print('\nHand: ', list(c.name for c in self.hand))
        print('Up Cards: ', list(c.name for c in self.upCards))

    def swapCards(self):
        print('\n', self.name, 'you may swap out your cards.')
        while True:
            self.readHand()
            try:
                swapInput = input('Which cards would you like to Swap? ')

                #user types 'done' when finished swapping
                if swapInput == 'done':
                    break

                #Ask user for two cards to swap
                [handCardInput, upCardInput] = swapInput.split(' ')
                handCardIdx = list(map(lambda c: c.name, self.hand)).index(handCardInput)
                upCardIdx = list(map(lambda c: c.name, self.upCards)).index(upCardInput)

                #swap cards
                self.hand[handCardIdx], self.upCards[upCardIdx] = self.upCards[upCardIdx], self.hand[handCardIdx]
                print('Successfully swapped', handCardInput, ' and ', upCardInput, '! \n')
            except:
                print('Cards not found, please re-enter cards to swap (example: H3 S10)')

    def retrieveCardFromHand(self, cardInput):
        for card in self.hand:
            if card.name == cardInput:
                return card
        print('You do not have a', cardInput, 'please choose a card in your hand')
s    def putDownCard(self, card, pile, usingDownCards=False):
        pile.pileCards.append(card)
        if usingDownCards:
            self.downCards.remove(card)
        else:
            self.hand.remove(card)

    def pickUpPile(self, pile):
        self.hand.extend(pile.pileCards)
        self.hand.sort(key = lambda c: c.value)
        pile.pileCards = []

    def refillHand(self, deck):
        while len(self.hand) < 4 and deck.cards:
            self.hand.append(deck.dealCard())
            self.hand.sort(key=lambda c: c.value)
        if not self.hand:
            if self.upCards:
                self.hand.extend([c for c in self.upCards])
                self.upCards = []
            elif self.downCards:
                self.usingDownCards = True

    def takePlayersTurn(self, deck, pile):
        print('\n', self.name, '\'s turn \n')
        print('Top of the pile: ', (pile.readTop().name if pile.pileCards else '-'))

        #if downcards are being used, choose a number 1-4 to pick which cards
        if self.usingDownCards:
            print('Down Cards: ', list('---' for c in self.downCards))
            while True:
                try:
                    cardInput = int(input('Please choose a down card from to play: '))
                    time.sleep(.5)

                    if 0 < cardInput <= len(self.downCards):
                        card = self.downCards[cardInput-1]
                        print('Card Chosen: ', card.name)
                        time.sleep(.5)

                        if pile.verifyCardIsPlayable(card):
                            print('Valid card! Putting down card.')
                            self.putDownCard(card, pile, True)
                            time.sleep(.5)
                        else:
                            print('Picking up pile.')
                            time.sleep(.5)
                            self.putDownCard(card, pile, True)
                            self.pickUpPile(pile)
                            self.usingDownCards = False
                        break

                except Exception as e:
                    print('Invalid value, please choose a number from 1-4')
                    print(e)
        else:
            #repeatedly choose a card until one is accepted
            self.readHand()
            while True:
                cardInput = input('Please choose which card(s) to play: ')

                if cardInput == 'pick up':
                    self.pickUpPile(pile)
                    return

                cardInputs = cardInput.split(' ')
                cards = []

                for ci in cardInputs:
                    cards.append(self.retrieveCardFromHand(ci))

                if pile.verifyCardsArePlayable(cards):
                    for c in cards:
                        self.putDownCard(c, pile)
                    self.refillHand(deck)
                    break


        #player has won if their hand is empty and they have played all down cards
        if not self.hand and not self.downCards:
            return True

class Board(object):
    """Main board object with center pile, remaining deck and player piles."""

    def __init__(self, numPlayers):
        self.deck = Deck()
        self.pile = Pile()
        self.players = [Player(i) for i in range(1, numPlayers+1)]
        self.currentPlayer = 0
        self.dealInitalCards()

    def dealInitalCards(self):
        for player in self.players:
            for i in range(4):
                player.hand.append(self.deck.dealCard())
                player.upCards.append(self.deck.dealCard())
                player.downCards.append(self.deck.dealCard())
            player.hand.sort(key=lambda c: c.value)
            player.upCards.sort(key=lambda c: c.value)

    def handleTurnChanges(self):
        if self.pile.pileCards:
            if self.pile.readTop().value == 8:
                self.currentPlayer += 1
            if self.pile.readTop().value == 10:
                self.pile.pileCards = []
                self.currentPlayer -= 1

    def changePlayer(self):
        self.currentPlayer += 1
        self.currentPlayer = self.currentPlayer % len(self.players)

    def handleCurrentPlayersTurn(self):
        currentPlayer = self.players[self.currentPlayer]
        gameWon = currentPlayer.takePlayersTurn(self.deck, self.pile)
        self.handleTurnChanges()

        return gameWon

    def handleGameWon(self):
        currentPlayer = self.players[self.currentPlayer]
        print('Congradulations! Winner is: ', currentPlayer.name)
