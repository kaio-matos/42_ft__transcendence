def WSResponse(event: str, data: dict) -> dict:
    """
    Generic response for web sockets connections
    """
    return {"event": event, "data": data}
