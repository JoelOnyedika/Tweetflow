from rest_framework import status
from rest_framework.decorators import api_view
from core.models import CustomUser
from core.serializers import *
import logging
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import  IsAuthenticated

logger = logging.getLogger(__name__)


def get_user_credits(request, pk):
    permission_classes = [IsAuthenticated]
    try:
        if request.user.is_authenticated and request.user.id == pk:
            credits = CustomUser.objects.filter(id=pk)
            
            serializer = CreditsSerializer(credits, many=True).data
            if serializer is None:
                return JsonResponse({"error": {"message": "Seems like you are not this user. Please relogin"}}, status=status.HTTP_404_NOT_FOUND)
            return JsonResponse({ 'data': serializer }, status=200)
    except Exception as e:
        logger.error(f"Get credits error: {str(e)}")
        return JsonResponse({"error": {"message": "Something went wrong..."}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def chop_user_credits(request, pk):
    permission_classes = (IsAuthenticated)
    print(request.data)

    try:
        user = request.user
        # Ensure the authenticated user is the same as the one being modified
        if user.is_authenticated and user.id == pk:
            print(request.data)
            # Get the credit amount to be deducted from the request body
            try:
                amount_of_credits = int(request.data.get('amount'))
            except (TypeError, ValueError):
                return JsonResponse({'error': {'message': "Invalid credit amount provided."}}, status=400)

            # Fetch the user from the database
            custom_user = CustomUser.objects.get(id=pk)
            initial_credits = custom_user.credits
            print(custom_user)

            # Check if the user has enough credits
            if initial_credits >= amount_of_credits:
                # Deduct the credits and update the user record
                custom_user.credits = initial_credits - amount_of_credits
                custom_user.save()
                print('fdsa')
                
                # Return success response with updated user data
                return JsonResponse({'data': {'credits': custom_user.credits}}, status=200)
            else:
                print('asdf')
                return JsonResponse({'error': {'message': "You do not have enough credits."}}, status=400)
        else:
            return JsonResponse({'error': {'message': "Unauthorized request."}}, status=403)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': {'message': "User not found."}}, status=404)

    except Exception as e:
        logger.error(f"Chop credits error: {str(e)}")
        print(e)
        return JsonResponse({"error": {"message": "Something went wrong."}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)