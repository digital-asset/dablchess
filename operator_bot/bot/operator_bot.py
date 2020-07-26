import os
import logging
import uuid
import time

import dazl
from dazl import create, exercise, exercise_by_key

dazl.setup_default_logger(logging.INFO)


class CHESS:
    GameAccept = 'Chess:GameAccept'
    Game = 'Chess:Game'
    OperatorRole = 'Chess:OperatorRole'
    ActiveMove = 'Chess:ActiveMove'
    ActiveDrawClaim = 'Chess:ActiveDrawClaim'
    EndGameProposal = 'Chess:EndGameProposal'
    AcceptedDrawRequest = 'Chess:AcceptedDrawRequest'
    RejectedDrawRequest = 'Chess:RejectedDrawRequest'

class User:
    SessionRequest = 'User:SessionRequest'
    SessionRenameRequest = 'User:SessionRenameRequest'


def main():
    url = os.getenv('DAML_LEDGER_URL')
    ref = os.getenv('DAML_LEDGER_PARTY')
    operator_party = "UserAdmin" if not ref else ref

    # We do not use this party in the Operator
    #pub = os.getenv('DABL_PUBLIC_PARTY')
    #public_party = "Public" if not pub else pub

    network = dazl.Network()
    network.set_config(url=url)

    logging.info(f'starting a the operator_bot for {operator_party}')
    client = network.aio_party(operator_party)

    # Support for Chess
    @client.ledger_ready()
    def create_operator_role(event): # pylint: disable=unused-variable
        logging.info(f'Make sure we have an an operator role: {event}')
        operatorRoleArgs = {'operator':operator_party}
        res = client.find_active(CHESS.OperatorRole, operatorRoleArgs)
        if not res:
            logging.info(f'Creating an operator role contract {operatorRoleArgs}')
            return client.submit_create(CHESS.OperatorRole, operatorRoleArgs)
        else:
            logging.info(f'We have an operator role contract')

    @client.ledger_created(CHESS.GameAccept)
    def create_game(event): # pylint: disable=unused-variable
        logging.info(f'A game has been accepted: {event}')
        return client.submit_exercise(event.cid, 'Start')

    @client.ledger_created(CHESS.Game)
    def start_game(event): # pylint: disable=unused-variable
        logging.info(f'A new game: {event}')
        return client.submit_exercise(event.cid, 'Begin')

    @client.ledger_created(CHESS.ActiveMove)
    def advance_play(event):  # pylint: disable=unused-variable
        logging.info(f'A move!: {event}')

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party})
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'AdvancePlay', {'activeMoveId':event.cid})

    @client.ledger_created(CHESS.ActiveDrawClaim)
    def consider_draw_claim(event):  # pylint: disable=unused-variable
        logging.info(f'A draw claim!: {event}')

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party})
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'ConsiderDrawClaim', {'activeDrawClaimId':event.cid})

    @client.ledger_created(CHESS.EndGameProposal)
    def process_end_game_proposal(event):  # pylint: disable=unused-variable
        logging.info(f'An end game proposal!: {event}')

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party})
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'ProcessEndGameProposal', {'endGameProposalId':event.cid})

    @client.ledger_created(CHESS.AcceptedDrawRequest)
    def acknowledge_accepted_draw(event):  # pylint: disable=unused-variable
        logging.info(f'A draw has been accepted!: {event}')

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party})
        logging.info(f'found {res}')
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'AcknowledgeAcceptedDraw', {'acceptedDrawRequestId':event.cid})

    @client.ledger_created(CHESS.RejectedDrawRequest)
    def acknowledge_rejected_draw(event):  # pylint: disable=unused-variable
        logging.info(f'A draw has been rejected!: {event}')

        res = client.find_active(CHESS.OperatorRole, {'operator':operator_party})
        assert len(res) == 1
        (orId, _operatorRoleParams) = res.popitem()
        return client.submit_exercise(orId, 'AcknowledgeRejectedDraw', {'rejectedDrawRequestId':event.cid})

    # Support for sessions.
    @client.ledger_created(User.SessionRequest)
    def process_request(event): # pylint: disable=unused-variable
        logging.info(f'A client has logged in: {event}.')
        return client.submit_exercise( event.cid, 'Acknowledge', {})

    @client.ledger_created(User.SessionRenameRequest)
    def process_rename(event): # pylint: disable=unused-variable
        logging.info(f'A client requests a rename: {event}.')
        return client.submit_exercise( event.cid, 'AcknowledgeRename', {})

    network.run_forever()

if __name__ == '__main__':
    main()
