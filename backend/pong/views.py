from ft_transcendence.http import http

response = {}
response['index'] = 'Hello'
response['testing'] = 'World'


def index(request):
    return http.OK(response)
