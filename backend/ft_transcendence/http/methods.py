import traceback
from django.core.exceptions import ValidationError
from django.http import HttpRequest
from django.urls import path

from ft_transcendence.http import http


def wrapCallback(method: str, callback):
    def wrapped(request: HttpRequest, **kwargs):
        try:
            if request.method != method:
                return http.MethodNotAllowed()
            return callback(request, **kwargs)
        except ValidationError as e:
            if hasattr(e, "error_dict"):
                return http.UnprocessableEntity({"error": e.message_dict})
            else:
                return http.UnprocessableEntity({"error": {"_errors": e.messages}})
        except Exception as e:
            return http.InternalServerError(
                {"error": {"_errors": traceback.format_exception_only(e)}}
            )

    return wrapped


def GET(_path: str, callback):
    return path(_path, wrapCallback("GET", callback))


def POST(_path: str, callback):
    return path(_path, wrapCallback("POST", callback))


def DELETE(_path: str, callback):
    return path(_path, wrapCallback("DELETE", callback))


def PUT(_path: str, callback):
    return path(_path, wrapCallback("PUT", callback))
