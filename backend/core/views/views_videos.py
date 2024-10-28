from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
import requests
import logging
from core.models import CustomUser, VoiceTier
from django.conf import settings 
from django.views import View
import uuid
from core.serializers import VideoSerializer, ScheduledVideoSerializer
from core.models import Video, ScheduledVideo
from django.utils.dateparse import parse_date, parse_time
from django.utils import timezone
from datetime import datetime

logger = logging.getLogger(__name__)


def get_all_videos(request, pk):
	if request.user.is_authenticated:
		if request.method == "GET":
			try:
				all_videos  = Video.objects.filter(user_id=pk)
				if not all_videos.exists():
					return JsonResponse({'error': {'message': 'Whoops this user does not exist'}})
				else:
					videos = VideoSerializer(all_videos, many=True).data
					return JsonResponse({'data': videos})
			except Exception as e:
				logger.error(f"Error getting all videos", str(e))
				return JsonResponse({'error': {'message':{'Whoops something went wrong while connecting to the server.'}}}, status=500)
	return JsonResponse({'error': {'message':{'Whoops. You are not authenticated. Please login'}}}, status=500)
		
def delete_video(request, pk): # THis is video id
	if request.user.is_authenticated:
		try:
			# user_id = request.data.get('id')
			video = Video.objects.get(id=pk)
			if video.exists():
				video.delete()
				return JsonResponse({'data': 'deleted'})
			else:
				return JsonResponse({'error': {'message': "This video does not exist anymore."}})
		except Exception as e:
			logger.error(f"Error deleting videos", str(e))
			return JsonResponse({'error': {'message':{'Whoops something went wrong while connecting to the server.'}}}, status=500)
	return JsonResponse({'error': {'message':{'Whoops. You are not authenticated. Please login'}}}, status=500)



def change_video_upload_time(request, pk):
    try:
        # Retrieve data from the request
        user_id = request.data.get('id')
        date_str = request.data.get('date')  # Example format: "October 12, 2024"
        time_str = request.data.get('time')  # Example format: "12:00"
        
        # Validate and parse date and time
        try:
            parsed_date = datetime.strptime(date_str, "%B %d, %Y").date()
            parsed_time = datetime.strptime(time_str, "%H:%M").time()
        except ValueError:
            return JsonResponse({'error': {'message': "Invalid date or time format."}}, status=400)
        
        # Ensure date is today or later
        today = timezone.now().date()
        if parsed_date < today:
            return JsonResponse({'error': {'message': "The date cannot be in the past."}}, status=400)
        
        # Get the video and verify conditions
        try:
            video = Video.objects.get(id=pk)
        except Video.DoesNotExist:
            return JsonResponse({'error': {'message': "This video does not exist anymore."}}, status=404)
        
        if video.upload_status == "Uploaded":
            return JsonResponse({'error': {'message': "This video has already been uploaded."}}, status=400)
        
        # Update upload date and time
        video.upload_date = parsed_date
        video.upload_time = parsed_time
        video.save()
        
        return JsonResponse({'data': 'Upload time changed successfully.'})
    
    except Exception as e:
        logger.error(f"Error updating video upload time: {str(e)}")
        return JsonResponse({'error': {'message': "Whoops, something went wrong while connecting to the server."}}, status=500)


def edit_scheduled_video(request, pk):
    try:
        # Retrieve ScheduledVideo instance
        try:
            scheduled_video = ScheduledVideo.objects.get(id=pk)
        except ScheduledVideo.DoesNotExist:
            return JsonResponse({'error': {'message': "This scheduled video does not exist."}}, status=404)
        
        platforms = request.data.get('platforms', [])  # Get list of platforms from checkboxes
        scheduled_date_str = request.data.get('scheduled_date')
        scheduled_time_str = request.data.get('scheduled_time')
        
        # Validate platforms list and update
        valid_platform_names = [choice[0] for choice in ScheduledVideo.PLATFORM_CHOICES]
        valid_platforms = Platform.objects.filter(name__in=[p for p in platforms if p in valid_platform_names])
        
        if valid_platforms.count() != len(platforms):
            return JsonResponse({'error': {'message': "One or more invalid platform choices."}}, status=400)

        scheduled_video.platforms.set(valid_platforms)

        # Validate and parse date and time as before
        if scheduled_date_str:
            try:
                scheduled_date = datetime.strptime(scheduled_date_str, "%B %d, %Y").date()
            except ValueError:
                return JsonResponse({'error': {'message': "Invalid date format."}}, status=400)

            today = timezone.now().date()
            if scheduled_date < today:
                return JsonResponse({'error': {'message': "The scheduled date cannot be in the past."}}, status=400)

        if scheduled_time_str:
            try:
                scheduled_time = datetime.strptime(scheduled_time_str, "%H:%M").time()
            except ValueError:
                return JsonResponse({'error': {'message': "Invalid time format."}}, status=400)

        # Apply date and time changes if valid
        if scheduled_date_str:
            scheduled_video.scheduled_date = scheduled_date
        if scheduled_time_str:
            scheduled_video.scheduled_time = scheduled_time
        scheduled_video.save()
        
        return JsonResponse({'data': 'Scheduled video updated successfully.'})
    
    except Exception as e:
        logger.error(f"Error updating scheduled video: {str(e)}")
        return JsonResponse({'error': {'message': "Whoops, something went wrong while connecting to the server."}}, status=500)


def filter_videos_by_platforms(request, pk):
    try:
        platform = request.data.get('platform')
        print(platform)
        videos = ScheduledVideo.objects.filter(platform=platform, user=pk)
        if videos:
            serializer = ScheduledVideoSerializer(videos, many=True).data
            return JsonResponse({'data': serializer})
        else:
            return JsonResponse({'error': {'message': 'No video exists for this platform'}})
    except Exception as e:
        logger.error(f"Error in filter videos by id: {str(e)}")
        return JsonResponse({'error': {'message': "Whoops, something went wrong while connecting to the server."}}, status=500)
