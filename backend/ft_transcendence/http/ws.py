from enum import Enum


# Events are responses from the backend to the frontend
# - example: After a player create a match we should notify all players invited to the match to join the match
class WSEvents(Enum):
    MATCH_BEGIN = "onMatchBegin"
    MATCH_START = "onMatchStart"
    MATCH_UPDATE = "onMatchUpdate"
    MATCH_FINISH = "onMatchFinish"
    CHAT_JOIN = "onChatJoin"
    CHAT_MESSAGE = "onChatMessage"
    ERROR = "onError"
    FRIEND_ACTIVITY_STATUS = "onFriendActivityStatusChange"


# Commands are requests from the frontend to the backend
# - example: During the match players will send data about their movements with specific commands
class WSCommands(Enum):
    JOIN_MATCH = "JOIN_MATCH"
    KEY_PRESS = "KEY_PRESS"
    CHAT_JOIN = "CHAT_JOIN"
    CHAT_SEND_MESSAGE = "CHAT_SEND_MESSAGE"


def WSResponse(event: WSEvents, data: dict) -> dict:
    """
    Generic response for web sockets connections
    """
    return {"type": "send_event", "event": {"event": event.value, "data": data}}
