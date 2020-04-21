from models import Games, Users, Cards
from playersAndBoard import Board
from app import db
import random

def getUser(user_id):
    return Users.query.get(user_id)

def getGame(game_id):
    return Games.query.get(game_id)

def createUserByName(username):
    """adds a new user to database with name, returns user"""
    existing_u = Users.query.filter_by(username=username).first()

    if not existing_u:
        u = Users(username=username)
        db.session.add(u)
        db.session.commit()
        return [u, 'created new user']
    else:
        return [existing_u, 'user already exists']

def addUserToGame(code, user_id):
    """adds a user to a game by entering the game code"""
    g = Games.query.filter_by(code=code).first()
    if not g:
        return [None, 'game code does not exist']

    u = Users.query.get(user_id)
    u.game_id = g.id
    db.session.commit()
    return [g, 'added user to game']


def createNewGame(user_id):
    """instantiates a new game and adds a player to the game"""

    #first check if user is already playing a game
    u = Users.query.get(user_id)
    if u.game_id:
        return [Games.query.get(u.game_id), 'user already playing game']

    while True:
        rand_code = random.randrange(10000, 99999)
        existing_code = Games.query.filter_by(code=rand_code).first()

        if not existing_code:
            g = Games(code=rand_code)
            db.session.add(g)
            db.session.commit()

            u.game_id = g.id
            u.isAdmin = True
            db.session.commit()
            return [g, 'created new game']

def initializeGame(game_id):
    g = Games.query.get(game_id)
    users = list(u for u in g.users)
    board = Board(users, g)

def getCards(user_id):
    u = Users.query.get(user_id)
    print(user_id)
    cards = u.cards
    hand = {
        'hand': [],
        'uphand': [],
        'downhand':[]
    }

    for c in cards:
        hand[c.location].append({
            'id': c.id,
            'suit': c.suit,
            'value': c.value,
            'name': c.name,
        })

    return [hand, 'retrieved user cards']


def setUsersCardsByType(new_location, newCard_ids, user_id):
    u = Users.query.get(user_id)
    prevCards = filter(lambda c: c.location == new_location, list(c for c in u.cards))
    for c in prevCards:
        c.owner = None
        c.location = None
    db.session.commit()

    newCards = map(lambda cid: Cards.query.get(cid), newCard_ids)
    for c in newCards:
        c.owner=user_id
        c.location=new_location
    db.session.commit()

def getPileTopByUser(user_id):
    u = Users.query.get(user_id)
    g = Games.query.get(u.game_id)
    topCard = Cards.query.filter_by(game_id=g.id, location='top').first()
    if topCard:
        return [topCard, 'retrieved top of the pile']
    else:
        return [topCard, 'top of the pile is empty']

def swapTopOfPile(newTopCard, user_id):
    [topCard, _] = getPileTopByUser(user_id)
    if topCard:
        topCard.location = 'pile'
    newTopCard.location = 'top'
    db.session.commit()

def getCurrentPlayerByUser(user_id):
    u = Users.query.get(user_id)
    g = Games.query.get(u.game_id)
    gameUsers = list(u for u in g.users)

    return [gameUsers[g.currentPlayerIndex], 'retrieved current player']

def validateCards(card_ids, user_id):
    print('ids', card_ids)
    cards = [Cards.query.get(cid) for cid in card_ids]
    print('cards', cards)
    #check if every card is the same value:
    value = cards[0].value
    for c in cards:
        if c.value != value:
            return [False, 'cards must be the same value']

    #check if the value is playable
    [topCard, _] = getPileTopByUser(user_id)
    if not topCard:
        return [True, 'card can be played because pile is empty']

    if value in [2,10]:
        return [True, '2 and 10 are always playable']

    if topCard.value == 7 and value <= 7:
        return [True, 'top card is 7 and value is less than 7']

    if topCard.value != 7 and value >= topCard.value:
        return [True, 'card is bigger than card below']

    else:
        return [False, ('value '+str(value)+' cannot be played on a '+str(topCard.value))]

def playValidatedCards(card_ids, user_id):
    cards = [Cards.query.get(cid) for cid in card_ids]

    for c in cards:
        c.owner = None
        c.location = 'pile'
    db.session.commit()
    swapTopOfPile(cards[0], user_id)
    return 'updated cards'

def changeToNextPlayer(user_id):
    u = Users.query.get(user_id)
    g = Games.query.get(u.game_id)
    game_users = list(g.users)
    g.currentPlayerIndex = (g.currentPlayerIndex + 1) % len(game_users)
    db.session.commit()

    return [game_users[g.currentPlayerIndex], 'increased current player index']


def moveCardsToHand(user_id, cards):
    for c in cards:
        c.owner=user_id
        c.location='hand'
    db.session.commit()

def getPileCards(user_id):
    u = Users.query.get(user_id)
    g = Games.query.get(u.game_id)
    return Cards.query.filter(Cards.game_id.like(g.id)).filter(Cards.location.in_(['pile', 'top']))

def addPileToUser(user_id):
    pileCards = getPileCards(user_id)
    moveCardsToHand(user_id, pileCards)
    return 'fetched'

def calculateNumToDeal(user, deck):
    userHand = list(filter(lambda c: c.location == 'hand', list(user.cards)))
    print('userHand', userHand)
    emptySpots = 4 - len(userHand)
    return min(emptySpots, len(deck))

def refillUsersHand(user_id):
    u = Users.query.get(user_id)
    g = Games.query.get(u.game_id)
    deck = list(Cards.query.filter(Cards.game_id.like(g.id)).filter(Cards.location.like('deck')))
    cardsToDeal = deck[-calculateNumToDeal(u, deck)::]
    print('dealing', calculateNumToDeal(u, deck), cardsToDeal)
    moveCardsToHand(user_id, cardsToDeal)

    if len(list(u.cards)) == 0:
        upCards = Cards.query.filter(Cards.owner.like(u.id)).filter(Cards.location.like('uphand'))
        if upCards:
            moveCardsToHand(user_id, upCards)
            return [upCards, 'refilled with upcards']
        else:
            u.usingDownCards = True
            db.session.commit()
            return [[], 'player using downcards']

    return [cardsToDeal, 'refilled from deck']
