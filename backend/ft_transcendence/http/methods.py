from django.http import HttpRequest
from django.urls import path

from ft_transcendence.http import http


def GET(_path: str, callback):
    def wrapped(request: HttpRequest):
        if request.method != "GET":
            return http.MethodNotAllowed()
        return callback(request)

    return path(_path, wrapped)


def POST(_path: str, callback):
    def wrapped(request: HttpRequest):
        if request.method != "POST":
            return http.MethodNotAllowed()
        return callback(request)

    return path(_path, wrapped)


def DELETE(_path: str, callback):
    def wrapped(request: HttpRequest):
        if request.method != "DELETE":
            return http.MethodNotAllowed()
        return callback(request)

    return path(_path, wrapped)


def PUT(_path: str, callback):
    def wrapped(request: HttpRequest):
        if request.method != "PUT":
            return http.MethodNotAllowed()
        return callback(request)

    return path(_path, wrapped)
