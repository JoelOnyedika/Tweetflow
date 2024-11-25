from django.db import models
from django.contrib.auth.models import User
import uuid
from django.contrib.auth.models import AbstractUser
from datetime import timedelta, time, date
from django.utils.timezone import now

# Create your models here.
class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    plan = models.CharField(max_length=20, choices=[('free', 'Free'), ('starter', 'Starter'), ('enterprise', 'Enterprise')], default='free')
    start_date = models.DateTimeField(auto_now_add=True)
    credits = models.IntegerField(default=30)
    voices_id = models.JSONField(default=list, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def set_end_date(self, duration_days):
        if self.start_date:
            self.end_date = self.start_date + timedelta(days=duration_days)
            self.save()

    def __str__(self):
        return str(self.id)


class UserSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    platform = models.CharField(max_length=30, default="youtube")
    interval = models.CharField(max_length=30, default="weekly")
    recieve_emails = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user'], name='unique_user_settings')
        ]

class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField(default="Please Modify and Change my Style")
    template_name = models.CharField(max_length=30)
    font_family = models.CharField(max_length=30, default='Arial')
    text_animation = models.CharField(max_length=30, default='None')
    font_size = models.IntegerField(default=30)
    line_height = models.IntegerField(default=1.5)
    text_color = models.CharField(max_length=8, default='#ff0000')
    background_color = models.CharField(max_length=8, default='#708090')
    text_outline_color = models.CharField(max_length=8, default='#ffffff')
    top_margin = models.IntegerField(default=960)
    left_margin = models.IntegerField(default=270)
    right_margin = models.IntegerField(default=0)
    media = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # def __str__(self):
    #     return self.template_name


class Video(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    title = models.CharField(max_length=200)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    tweet_text = models.TextField()
    upload_date = models.DateField(default=date.today)
    upload_time = models.TimeField(default=now)
    upload_status = models.TextField(default="Pending") #Failed, Uploaded, Pending
    video_url = models.URLField(max_length=200)  # URL of the generated video
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.tweet_text

class Voice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    voice_file = models.URLField()
    api_voice_id = models.CharField(max_length=100)  # ID returned by 11Labs API
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class VoiceTier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=100)
    plan = models.CharField(max_length=100)
    price = models.IntegerField(default=4)
    preview_url = models.CharField(max_length=100)
    image_url = models.URLField(null=True)
    voice_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)


class ScheduledVideo(models.Model):
    PLATFORM_CHOICES = [
        ('youtube', 'YouTube'),
        ('tiktok', 'TikTok'),
        ('instagram', 'Instagram'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)  # Link to the generated video
    platforms = models.ManyToManyField('Platform', default='youtube')
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.video

class Platform(models.Model):
    name = models.CharField(max_length=20, unique=True, choices=ScheduledVideo.PLATFORM_CHOICES)
