import os
import logging
import uuid
import time

import dazl
from dazl import create, exercise, exercise_by_key

dazl.setup_default_logger(logging.INFO)


class CHESS:
    GameAccept = 'Chess.GameAccept'
    Game = 'Chess.Game'
    OperatorRole = 'Chess.OperatorRole'
    ActiveAction = 'Chess.ActiveAction'
    Surrender = 'Chess.Surrender'
    AcceptedDraw = 'Chess.AcceptedDraw'

def main():
    url = os.getenv('DAML_LEDGER_URL')
    ref = os.getenv('DAML_LEDGER_PARTY')

    operator_party = "Ref" if not ref else ref

    network = dazl.Network()
    network.set_config(url=url)

    logging.info(f'starting a the operator_bot for {operator_party}')
    client = network.aio_party(operator_party)

    @client.ledger_created(CHESS.GameAccept)
    def create_game(event): # pylint: disable=unused-variable
        logging.info(f'A game has been accepted: {event}')

        return client.submit_exercise(event.cid, 'Start')

    @client.ledger_created(CHESS.Game)
    def start_game(event): # pylint: disable=unused-variable
        logging.info(f'A new game: {event}')

        return client.submit_exercise(event.cid, 'Begin')

    @client.ledger_created(CHESS.ActiveAction)
    def advance_play(event):  # pylint: disable=unused-variable
        logging.info(f'A move!: {event}')
        gameId = event.cdata['gameId']

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party, 'gameId': gameId})
        logging.info(f'OperatorRole for {gameId} ? {res}')
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'AdvancePlay')

    @client.ledger_created(CHESS.Surrender)
    def acknowledge_surrender(event):  # pylint: disable=unused-variable
        logging.info(f'A surrender!: {event}')
        gameId = event.cdata['gameId']

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party, 'gameId': gameId})
        logging.info(f'OperatorRole for {gameId} ? {res}')
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'AcknowledgeSurrender')

    @client.ledger_created(CHESS.AcceptedDraw)
    def accept_draw(event):  # pylint: disable=unused-variable
        logging.info(f'A draw has been accepted!: {event}')
        gameId = event.cdata['gameId']

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party, 'gameId': gameId})
        logging.info(f'OperatorRole for {gameId} ? {res}')
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'AcknowledgeAcceptedDraw')

    network.run_forever()

if __name__ == '__main__':
    main()
