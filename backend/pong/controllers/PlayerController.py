from django.core import serializers
from django.http import HttpRequest, HttpResponse
from ft_transcendence.http import http
from pong.models import Player
from django.views.decorators.csrf import csrf_exempt



def index(request: HttpRequest) -> HttpResponse:
    players = Player.objects.all()
    players = [player.toDict() for player in players]
    print(players)

    return http.OK(players)

@csrf_exempt
def create(request: HttpRequest) -> HttpResponse:
    #return http.OK({})
    if request.method == 'POST':
        try:
            # Tenta converter o corpo da requisição de JSON para um dicionário Python
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')

            if not name or not email:
                return UnprocessableEntity({'error': 'Nome e email são obrigatórios'})
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):

                return UnprocessableEntity({'error': 'Email inválido'})
            if Player.objects.filter(email=email).exists():

                return UnprocessableEntity({'error': 'Email já está em uso'})

 
            player = Player(name=name, email=email)
            player.save()

            return Created({'id': player.id, 'name': player.name, 'email': player.email})
        except json.JSONDecodeError:
            # Captura erro de JSON inválido e retorna status 422
            return UnprocessableEntity({'error': 'JSON inválido'})
    else:
        return MethodNotAllowed()



