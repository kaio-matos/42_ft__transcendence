from enum import Enum


# Events are responses from the backend to the frontend
# - example: After a player create a tournament we should notify all players invited to the tournament to join the tournament
class WSEvents(Enum):
    TOURNAMENT_BEGIN = "onTournamentBegin"
    TOURNAMENT_START = "onTournamentStart"
    TOURNAMENT_UPDATE = "onTournamentUpdate"
    TOURNAMENT_FINISH = "onTournamentFinish"
    CHAT_JOIN = "onChatJoin"
    CHAT_MESSAGE = "onChatMessage"
    ERROR = "onError"
    FRIEND_ACTIVITY_STATUS = "onFriendActivityStatusChange"


# Commands are requests from the frontend to the backend
# - example: During the tournament players will send data about their movements with specific commands
class WSCommands(Enum):
    JOIN_TOURNAMENT = "JOIN_TOURNAMENT"
    KEY_PRESS = "KEY_PRESS"
    CHAT_JOIN = "CHAT_JOIN"
    CHAT_SEND_MESSAGE = "CHAT_SEND_MESSAGE"


def WSResponse(event: WSEvents, data: dict) -> dict:
    """
    Generic response for web sockets connections
    """
    return {"type": "send_event", "event": {"event": event.value, "data": data}}
