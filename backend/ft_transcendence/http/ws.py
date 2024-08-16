from enum import Enum


# Events are responses from the backend to the frontend
# - example: After a player create a match we should notify all players invited to the match to join the match
class WSEvents(Enum):
    # TODO: refactor MATCH_BEGIN to PLAYER_NOTIFY_MATCH_BEGIN or something like that
    MATCH_BEGIN = "onMatchBegin"
    MATCH_START = "onMatchStart"
    MATCH_UPDATE = "onMatchUpdate"
    MATCH_END = "onMatchEnd"
    # TODO: refactor TOURNAMENT_END to PLAYER_NOTIFY_TOURNAMENT_END or something like that
    TOURNAMENT_END = "onTournamentEnd"
    CHAT_JOIN = "onChatJoin"
    CHAT_MESSAGE = "onChatMessage"
    ERROR = "onError"
    FRIEND_ACTIVITY_STATUS = "onFriendActivityStatusChange"


# Commands are requests from the frontend to the backend
# - example: During the match players will send data about their movements with specific commands
class WSCommands(Enum):
    MATCH_JOIN = "MATCH_JOIN"
    KEY_PRESS = "KEY_PRESS"
    CHAT_JOIN = "CHAT_JOIN"
    CHAT_SEND_MESSAGE = "CHAT_SEND_MESSAGE"


def WSResponse(event: WSEvents, data: dict) -> dict:
    """
    Generic response for web sockets connections
    """
    return {"type": "send_event", "event": {"event": event.value, "data": data}}
