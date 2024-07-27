from enum import Enum


# Events are responses from the backend to the frontend
# - example: After a player create a tournament we should notify all players invited to the tournament to join the tournament
class WSEvents(Enum):
    JOIN_TOURNAMENT = "JOIN_TOURNAMENT"


# Commands are requests from the frontend to the backend
# - example: During the tournament players will send data about their movements with specific commands
class WSCommands(Enum):
    pass


def WSResponse(event: WSEvents, data: dict) -> dict:
    """
    Generic response for web sockets connections
    """
    return {"event": event.value, "data": data}
