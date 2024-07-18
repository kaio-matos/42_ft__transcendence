from django.http import HttpResponse
import json


def JSONResponse(obj: dict | list, options={}) -> HttpResponse:
    """
    Generic response, avoid using it
    """

    response = {}
    response["data"] = obj
    return HttpResponse(
        json.dumps(response), content_type="application/json", **options
    )


def OK(obj: dict | list, options={}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/200
    """
    return JSONResponse(obj, options)


def Created(obj: dict | list, options={"status": 201}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/201
    """
    return JSONResponse(obj, options)


def NoContent(obj: dict | list, options={"status": 204}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/204
    """
    return JSONResponse(obj, options)


def BadRequest(obj: dict | list, options={"status": 400}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400
    """
    return JSONResponse(obj, options)


def Unauthorized(obj: dict | list, options={"status": 401}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/401
    """
    return JSONResponse(obj, options)


def Forbidden(obj: dict | list, options={"status": 403}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/403
    """
    return JSONResponse(obj, options)


def NotFound(obj: dict | list, options={"status": 404}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404
    """
    return JSONResponse(obj, options)


def MethodNotAllowed(options={"status": 405}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/405
    """
    return JSONResponse({"message": "Method not allowed"}, options)


def TooManyRequests(obj: dict | list, options={"status": 429}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/429
    """
    return JSONResponse(obj, options)


def InternalServerError(obj: dict | list, options={"status": 500}) -> HttpResponse:
    """
    https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/500
    """
    return JSONResponse(obj, options)
