from django.test import TestCase
from datetime import date, time, timedelta
from .models import (
    CustomUser, UserSettings, Template, Video, Voice, VoiceTier, ScheduledVideo, Platform
)

class CustomUserModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.plan, "free")
        self.assertEqual(self.user.credits, 30)
        self.assertIsNone(self.user.end_date)

    def test_set_end_date(self):
        self.user.set_end_date(30)
        self.assertEqual(self.user.end_date, self.user.start_date + timedelta(days=30))


class UserSettingsModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )

    def test_user_settings_creation(self):
        settings = UserSettings.objects.create(user=self.user)
        self.assertEqual(settings.user, self.user)
        self.assertEqual(settings.platform, "youtube")
        self.assertEqual(settings.interval, "weekly")

    def test_unique_user_settings(self):
        UserSettings.objects.create(user=self.user)
        with self.assertRaises(Exception):
            UserSettings.objects.create(user=self.user)


class TemplateModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )

    def test_template_creation(self):
        template = Template.objects.create(
            user=self.user,
            template_name="Sample Template"
        )
        self.assertEqual(template.user, self.user)
        self.assertEqual(template.template_name, "Sample Template")
        self.assertEqual(template.font_family, "Arial")


class VideoModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )

    def test_video_creation(self):
        video = Video.objects.create(
            user=self.user,
            title="Sample Video",
            tweet_text="This is a test tweet",
            video_url="http://example.com/video.mp4"
        )
        self.assertEqual(video.title, "Sample Video")
        self.assertEqual(video.upload_status, "Pending")


class VoiceModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )

    def test_voice_creation(self):
        voice = Voice.objects.create(
            user=self.user,
            name="Test Voice",
            voice_file="http://example.com/voice.mp3",
            api_voice_id="12345"
        )
        self.assertEqual(voice.name, "Test Voice")
        self.assertEqual(voice.api_voice_id, "12345")


class VoiceTierModelTest(TestCase):
    def test_voice_tier_creation(self):
        voice_tier = VoiceTier.objects.create(
            name="Premium Voice",
            plan="enterprise",
            price=10,
            preview_url="http://example.com/preview.mp3",
            voice_id="12345"
        )
        self.assertEqual(voice_tier.name, "Premium Voice")
        self.assertEqual(voice_tier.plan, "enterprise")
        self.assertEqual(voice_tier.price, 10)


class PlatformModelTest(TestCase):
    def test_platform_creation(self):
        platform = Platform.objects.create(name="youtube")
        self.assertEqual(platform.name, "youtube")


class ScheduledVideoModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )
        self.video = Video.objects.create(
            user=self.user,
            title="Scheduled Video",
            tweet_text="Scheduled video tweet",
            video_url="http://example.com/video.mp4"
        )
        self.platform = Platform.objects.create(name="youtube")

    def test_scheduled_video_creation(self):
        scheduled_video = ScheduledVideo.objects.create(
            user=self.user,
            video=self.video,
            scheduled_date=date.today(),
            scheduled_time=time(10, 30)
        )
        scheduled_video.platforms.add(self.platform)
        self.assertEqual(scheduled_video.user, self.user)
        self.assertEqual(scheduled_video.video, self.video)
        self.assertIn(self.platform, scheduled_video.platforms.all())
