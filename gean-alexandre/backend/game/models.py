import uuid

from django.db import models

from symbols.models import Symbol


class GameSession(models.Model):
    INITIAL_BALANCE = 100
    COST_PER_RUN = 10

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player_name = models.CharField(max_length=150, default='Anônimo')
    balance = models.IntegerField(default=INITIAL_BALANCE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.player_name} ({self.id}) - saldo {self.balance}'


class GameResult(models.Model):
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='results')
    symbol_1 = models.ForeignKey(Symbol, on_delete=models.CASCADE, related_name='+')
    symbol_2 = models.ForeignKey(Symbol, on_delete=models.CASCADE, related_name='+')
    symbol_3 = models.ForeignKey(Symbol, on_delete=models.CASCADE, related_name='+')
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    POINTS_MAP = {
        Symbol.Level.NORMAL: 100,
        Symbol.Level.PLUS: 300,
        Symbol.Level.GOLD: 1000000,
    }

    def __str__(self):
        return f'{self.session_id} | {self.symbol_1} - {self.symbol_2} - {self.symbol_3} = {self.points}pts'

    def calculate_points(self):
        symbols = [self.symbol_1, self.symbol_2, self.symbol_3]
        if symbols[0].id == symbols[1].id == symbols[2].id:
            return self.POINTS_MAP.get(symbols[0].level, 0)
        return 0
