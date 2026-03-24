import random

from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from symbols.models import Symbol

from .models import GameResult, GameSession


TRANSACTION_FIELDS = {
    'credit': serializers.IntegerField(),
    'debit': serializers.IntegerField(),
    'balance': serializers.IntegerField(),
}


@extend_schema(
    summary='Listar todos os símbolos',
    responses={
        200: inline_serializer(
            name='SymbolListResponse',
            many=True,
            fields={
                'id': serializers.IntegerField(),
                'name': serializers.CharField(),
                'description': serializers.CharField(),
                'level': serializers.ChoiceField(choices=['normal', 'plus', 'gold']),
                'image': serializers.URLField(),
            },
        ),
    },
)
@api_view(['GET'])
def list_symbols(request):
    symbols = Symbol.objects.all()
    data = [
        {
            'id': s.id,
            'name': s.name,
            'description': s.description,
            'level': s.level,
            'image': request.build_absolute_uri(s.image.url) if s.image else None,
        }
        for s in symbols
    ]
    return Response(data)


@extend_schema(
    summary='Criar nova sessão de jogo',
    request=inline_serializer(
        name='NewSessionRequest',
        fields={'player_name': serializers.CharField()},
    ),
    responses={
        200: inline_serializer(
            name='NewSessionResponse',
            fields={
                'session_id': serializers.UUIDField(),
                'player_name': serializers.CharField(),
                **TRANSACTION_FIELDS,
            },
        ),
        400: OpenApiResponse(description='player_name is required'),
    },
    examples=[
        OpenApiExample(
            'Exemplo',
            request_only=True,
            value={'player_name': 'Gean'},
        ),
    ],
)
@api_view(['POST'])
def new_session(request):
    player_name = request.data.get('player_name', '').strip()
    if not player_name:
        return Response({'error': 'player_name is required'}, status=status.HTTP_400_BAD_REQUEST)

    session = GameSession.objects.create(player_name=player_name)
    return Response({
        'session_id': str(session.id),
        'player_name': session.player_name,
        'credit': GameSession.INITIAL_BALANCE,
        'debit': 0,
        'balance': session.balance,
    })


RUN_RESPONSE_FIELDS = {
    'player_name': serializers.CharField(),
    'symbols': serializers.ListField(
        child=inline_serializer(
            name='SymbolData',
            fields={
                'id': serializers.IntegerField(),
                'name': serializers.CharField(),
                'level': serializers.ChoiceField(choices=['normal', 'plus', 'gold']),
                'image': serializers.URLField(),
            },
        ),
    ),
    'points': serializers.IntegerField(),
    **TRANSACTION_FIELDS,
}


@extend_schema(
    summary='Rodar o caça-níquel',
    description='Sorteia 3 símbolos aleatórios e calcula a pontuação. '
                '3 normais = 100pts, 3 plus = 300pts, 3 gold = 1.000.000pts.',
    request=None,
    responses={
        200: inline_serializer(name='RunResponse', fields={**RUN_RESPONSE_FIELDS}),
        404: OpenApiResponse(description='Session not found'),
        400: OpenApiResponse(description='No symbols registered'),
        402: OpenApiResponse(description='Créditos insuficientes'),
    },
)
@api_view(['POST'])
def run(request, session_id):
    return _run_game(request, session_id)


@extend_schema(
    summary='Rodar forçando resultado de um nível',
    description='Força 3 símbolos iguais do nível informado (normal, plus ou gold). Endpoint de teste.',
    request=None,
    responses={
        200: inline_serializer(name='RunForcedResponse', fields={
            'player_name': serializers.CharField(),
            'symbols': serializers.ListField(
                child=inline_serializer(
                    name='SymbolDataForced',
                    fields={
                        'id': serializers.IntegerField(),
                        'name': serializers.CharField(),
                        'level': serializers.ChoiceField(choices=['normal', 'plus', 'gold']),
                        'image': serializers.URLField(),
                    },
                ),
            ),
            'points': serializers.IntegerField(),
            **TRANSACTION_FIELDS,
        }),
        404: OpenApiResponse(description='Session not found'),
        400: OpenApiResponse(description='No symbols of this level'),
    },
)
@api_view(['POST'])
def run_forced(request, session_id, level):
    if level not in ('normal', 'plus', 'gold'):
        return Response({'error': 'Invalid level. Use normal, plus or gold.'}, status=status.HTTP_400_BAD_REQUEST)
    return _run_game(request, session_id, forced_level=level)


@extend_schema(
    summary='Rodar 10x - perde tudo',
    description='Roda uma vez gerando resultado que não pontua e zera todo o saldo.',
    request=None,
    responses={
        200: inline_serializer(name='Run10xResponse', fields={
            'player_name': serializers.CharField(),
            'symbols': serializers.ListField(child=serializers.DictField()),
            'points': serializers.IntegerField(),
            **TRANSACTION_FIELDS,
        }),
        404: OpenApiResponse(description='Session not found'),
        402: OpenApiResponse(description='Créditos insuficientes'),
    },
)
@api_view(['POST'])
def run_10x(request, session_id):
    try:
        session = GameSession.objects.get(id=session_id)
    except (GameSession.DoesNotExist, ValueError):
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    if session.balance < GameSession.COST_PER_RUN:
        return Response({
            'error': 'Créditos insuficientes',
            'player_name': session.player_name,
            'credit': 0,
            'debit': 0,
            'balance': session.balance,
        }, status=status.HTTP_402_PAYMENT_REQUIRED)

    symbols = list(Symbol.objects.all())
    if not symbols:
        return Response({'error': 'No symbols registered'}, status=status.HTTP_400_BAD_REQUEST)

    # Garante 3 símbolos de níveis diferentes para nunca pontuar
    levels = list({s.level for s in symbols})
    if len(levels) >= 2:
        s1 = random.choice([s for s in symbols if s.level == levels[0]])
        s2 = random.choice([s for s in symbols if s.level == levels[1]])
        s3 = random.choice([s for s in symbols if s.level == levels[0]])
        picked = [s1, s2, s3]
    else:
        picked = random.choices(symbols, k=3)

    debit = session.balance
    result = GameResult(session=session, symbol_1=picked[0], symbol_2=picked[1], symbol_3=picked[2], points=0)
    result.save()

    session.balance = 0
    session.save(update_fields=['balance'])

    def symbol_data(s):
        return {
            'id': s.id,
            'name': s.name,
            'level': s.level,
            'image': request.build_absolute_uri(s.image.url) if s.image else None,
        }

    return Response({
        'player_name': session.player_name,
        'symbols': [symbol_data(s) for s in picked],
        'points': 0,
        'credit': 0,
        'debit': debit,
        'balance': 0,
    })


def _run_game(request, session_id, forced_level=None):
    try:
        session = GameSession.objects.get(id=session_id)
    except (GameSession.DoesNotExist, ValueError):
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    if session.balance < GameSession.COST_PER_RUN:
        return Response({
            'error': 'Créditos insuficientes',
            'player_name': session.player_name,
            'credit': 0,
            'debit': 0,
            'balance': session.balance,
        }, status=status.HTTP_402_PAYMENT_REQUIRED)

    debit = GameSession.COST_PER_RUN
    session.balance -= debit

    if forced_level:
        symbols = list(Symbol.objects.filter(level=forced_level))
        if not symbols:
            return Response({'error': f'No symbols with level {forced_level}'}, status=status.HTTP_400_BAD_REQUEST)
        symbol = random.choice(symbols)
        picked = [symbol, symbol, symbol]
    else:
        symbols = list(Symbol.objects.all())
        if not symbols:
            return Response({'error': 'No symbols registered'}, status=status.HTTP_400_BAD_REQUEST)
        picked = random.choices(symbols, k=3)

    result = GameResult(
        session=session,
        symbol_1=picked[0],
        symbol_2=picked[1],
        symbol_3=picked[2],
    )
    credit = result.calculate_points()
    result.points = credit
    session.balance += credit
    session.save(update_fields=['balance'])
    result.save()

    def symbol_data(s):
        return {
            'id': s.id,
            'name': s.name,
            'level': s.level,
            'image': request.build_absolute_uri(s.image.url) if s.image else None,
        }

    return Response({
        'player_name': session.player_name,
        'symbols': [symbol_data(s) for s in picked],
        'points': credit,
        'credit': credit,
        'debit': debit,
        'balance': session.balance,
    })
