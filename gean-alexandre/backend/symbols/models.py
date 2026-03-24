from io import BytesIO

from django.core.files.base import ContentFile
from django.db import models
from PIL import Image


class Symbol(models.Model):
    class Level(models.TextChoices):
        NORMAL = 'normal', 'Normal'
        PLUS = 'plus', 'Plus'
        GOLD = 'gold', 'Gold'

    MAX_SIZE = 500

    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='symbols/')
    description = models.TextField(blank=True)
    level = models.CharField(max_length=10, choices=Level.choices, default=Level.NORMAL)

    def __str__(self):
        return f'{self.name} ({self.get_level_display()})'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if not self.image:
            return

        img = Image.open(self.image.path)

        if img.width <= self.MAX_SIZE and img.height <= self.MAX_SIZE:
            return

        # Redimensiona mantendo proporção para caber em 500x500
        img.thumbnail((self.MAX_SIZE, self.MAX_SIZE), Image.LANCZOS)

        # Cria canvas 500x500 transparente (ou branco para JPEG)
        if img.mode in ('RGBA', 'LA', 'P'):
            canvas = Image.new('RGBA', (self.MAX_SIZE, self.MAX_SIZE), (0, 0, 0, 0))
        else:
            canvas = Image.new('RGB', (self.MAX_SIZE, self.MAX_SIZE), (255, 255, 255))
            if img.mode != 'RGB':
                img = img.convert('RGB')

        # Centraliza a imagem no canvas
        offset_x = (self.MAX_SIZE - img.width) // 2
        offset_y = (self.MAX_SIZE - img.height) // 2
        canvas.paste(img, (offset_x, offset_y))

        # Salva no mesmo path
        buf = BytesIO()
        fmt = 'PNG' if canvas.mode == 'RGBA' else 'JPEG'
        canvas.save(buf, format=fmt, quality=90)

        self.image.save(
            self.image.name.split('/')[-1],
            ContentFile(buf.getvalue()),
            save=False,
        )
        # Salva só o campo image sem reprocessar
        super().save(update_fields=['image'])
