from django.shortcuts import render
from django.http import HttpResponse
import json


def JSONResponse(obj):
    return HttpResponse(json.dumps(obj), content_type="application/json")


response = {}
response['index'] = 'Hello'
response['testing'] = 'World'


def index(request):
    return JSONResponse(response)
