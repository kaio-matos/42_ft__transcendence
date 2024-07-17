from django.http import HttpResponse
import json


def JSONResponse(obj, options={}):
    """
     Generic response, avoid using it

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return HttpResponse(json.dumps(obj), content_type="application/json", **options)


def OK(obj, options={}):
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/200

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)


def Created(obj, options={'status': 201}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/201

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(json.dumps(obj), options)


def NoContent(obj, options={'status': 204}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/204

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)


def BadRequest(obj, options={'status': 400}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)


def Unauthorized(obj, options={'status': 401}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/401

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)


def Forbidden(obj, options={'status': 403}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/403

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)


def NotFound(obj, options={'status': 404}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)


def TooManyRequests(obj, options={'status': 429}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/429

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)


def InternalServerError(obj, options={'status': 500}):
    """
     https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/500

    :param obj: Dictionary
    :param options: Dictionary
    :return: django.http.HTTPResponse
    """
    return JSONResponse(obj, options)
