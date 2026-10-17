from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

from .models import StudentProfile, UserBookmark, UserFormulaNote, FlashcardSRS
from .serializers import (
    StudentProfileSerializer,
    UserBookmarkSerializer,
    UserFormulaNoteSerializer,
    FlashcardSRSSerializer,
    UserBasicSerializer,
    UserRegisterSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
)
from apps.formulas.models import Formula
from apps.practice.models import PracticeAttempt

def get_or_create_student_profile(request):
    """Helper to return current authenticated user profile or primary default profile."""
    if request.user.is_authenticated:
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'display_name': request.user.get_full_name() or request.user.username,
                'target_exam': 'HSC Higher Math 2026',
                'daily_goal_formulas': 5,
                'xp_points': 350,
                'study_streak_days': 7,
                'unlocked_badges': ['first_step', 'streak_3', 'lab_explorer']
            }
        )
        return profile
    
    # Guest student profile
    profile = StudentProfile.objects.filter(user__isnull=True).first()
    if not profile:
        profile = StudentProfile.objects.first()
    if not profile:
        profile = StudentProfile.objects.create(
            display_name='Santunu Math Scholar',
            avatar='∑',
            institution='Dhaka College · Science Dept',
            bio='Visualizing mathematical intuition, calculus derivations, and quantum mechanics.',
            target_exam='HSC Higher Math 2026 & BUET Admission',
            daily_goal_formulas=5,
            study_streak_days=7,
            xp_points=425,
            completed_labs=['circle-area', 'quadratic', 'derivative'],
            unlocked_badges=['first_step', 'streak_3', 'lab_explorer']
        )
    return profile


class StudentProfileView(APIView):
    def get(self, request):
        profile = get_or_create_student_profile(request)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = get_or_create_student_profile(request)
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        """Allows direct XP awards or lab completion actions."""
        profile = get_or_create_student_profile(request)
        action_type = request.data.get('action')
        today_str = timezone.now().date().isoformat()

        if not isinstance(profile.daily_activity_map, dict):
            profile.daily_activity_map = {}

        if action_type == 'log_activity':
            profile.daily_activity_map[today_str] = profile.daily_activity_map.get(today_str, 0) + 1
            profile.save()
            return Response({
                'success': True,
                'daily_activity_map': profile.daily_activity_map,
                'study_streak_days': profile.study_streak_days
            })

        elif action_type == 'award_xp':
            try:
                points = int(request.data.get('points', 25))
            except (ValueError, TypeError):
                points = 25
            profile.xp_points += points
            profile.daily_activity_map[today_str] = profile.daily_activity_map.get(today_str, 0) + 1
            profile.save()
            return Response({'success': True, 'xp_points': profile.xp_points})

        elif action_type == 'complete_lab':
            lab_slug = request.data.get('lab_slug')
            if not isinstance(profile.completed_labs, list):
                profile.completed_labs = []
            if lab_slug and lab_slug not in profile.completed_labs:
                profile.completed_labs.append(lab_slug)
                profile.xp_points += 50
                profile.daily_activity_map[today_str] = profile.daily_activity_map.get(today_str, 0) + 1
                profile.save()
            return Response({'success': True, 'completed_labs': profile.completed_labs, 'xp_points': profile.xp_points})

        elif action_type == 'complete_focus_session':
            try:
                minutes = max(0, int(request.data.get('minutes', 25)))
                xp_reward = max(0, int(request.data.get('xp', 100)))
            except (ValueError, TypeError):
                minutes = 25
                xp_reward = 100
            profile.total_focus_minutes += minutes
            profile.completed_focus_sessions += 1
            profile.xp_points += xp_reward
            profile.daily_activity_map[today_str] = profile.daily_activity_map.get(today_str, 0) + 1
            if not isinstance(profile.unlocked_badges, list):
                profile.unlocked_badges = []
            if profile.completed_focus_sessions >= 3 and 'focus_master' not in profile.unlocked_badges:
                profile.unlocked_badges.append('focus_master')
            profile.save()
            return Response({
                'success': True,
                'total_focus_minutes': profile.total_focus_minutes,
                'completed_focus_sessions': profile.completed_focus_sessions,
                'xp_points': profile.xp_points,
                'unlocked_badges': profile.unlocked_badges,
                'daily_activity_map': profile.daily_activity_map
            })

        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = UserBookmarkSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return UserBookmark.objects.filter(user=self.request.user)
        return UserBookmark.objects.all()

    def create(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        formula_id = request.data.get('formula')
        if not formula_id:
            return Response({'error': 'Formula ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Support lookup by pk or slug or formula_id
        formula = None
        if isinstance(formula_id, int) or (isinstance(formula_id, str) and formula_id.isdigit()):
            formula = Formula.objects.filter(pk=int(formula_id)).first()
        if not formula:
            formula = Formula.objects.filter(
                Q(slug__iexact=str(formula_id)) | Q(formula_id__iexact=str(formula_id))
            ).first()

        if not formula:
            return Response({'error': f'Formula "{formula_id}" not found'}, status=status.HTTP_404_NOT_FOUND)

        bookmark, created = UserBookmark.objects.get_or_create(
            user=user,
            formula=formula
        )
        serializer = self.get_serializer(bookmark)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['delete', 'post'], url_path='toggle')
    def toggle_by_formula(self, request):
        user = request.user if request.user.is_authenticated else None
        formula_id = request.data.get('formula') or request.query_params.get('formula')
        if not formula_id:
            return Response({'error': 'Formula parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        formula = Formula.objects.filter(
            Q(pk=int(formula_id)) if str(formula_id).isdigit() else Q(slug__iexact=str(formula_id)) | Q(formula_id__iexact=str(formula_id))
        ).first()

        if not formula:
            return Response({'error': 'Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        existing = UserBookmark.objects.filter(user=user, formula=formula).first()
        if existing:
            existing.delete()
            return Response({'bookmarked': False, 'message': 'Bookmark removed'})
        else:
            UserBookmark.objects.create(user=user, formula=formula)
            return Response({'bookmarked': True, 'message': 'Bookmark created'}, status=status.HTTP_201_CREATED)


class FormulaNoteViewSet(viewsets.ModelViewSet):
    serializer_class = UserFormulaNoteSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return UserFormulaNote.objects.filter(user=self.request.user)
        return UserFormulaNote.objects.all()

    def create(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        formula_id = request.data.get('formula')
        note_text = request.data.get('note_text', '')

        if not formula_id:
            return Response({'error': 'Formula ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        formula = Formula.objects.filter(
            Q(pk=int(formula_id)) if str(formula_id).isdigit() else Q(slug__iexact=str(formula_id)) | Q(formula_id__iexact=str(formula_id))
        ).first()

        if not formula:
            return Response({'error': 'Formula not found'}, status=status.HTTP_404_NOT_FOUND)

        note, created = UserFormulaNote.objects.update_or_create(
            user=user,
            formula=formula,
            defaults={'note_text': note_text}
        )
        serializer = self.get_serializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class FlashcardViewSet(viewsets.ModelViewSet):
    serializer_class = FlashcardSRSSerializer

    def get_queryset(self):
        return FlashcardSRS.objects.select_related('formula', 'formula__subject').all()

    @action(detail=True, methods=['post'], url_path='review')
    def review_card(self, request, pk=None):
        card = self.get_object()
        quality = int(request.data.get('quality', 3))

        if quality >= 3:
            if card.repetitions == 0:
                card.interval_days = 1
            elif card.repetitions == 1:
                card.interval_days = 6
            else:
                card.interval_days = int(card.interval_days * card.ease_factor)
            card.repetitions += 1
        else:
            card.repetitions = 0
            card.interval_days = 1

        card.ease_factor = max(1.3, card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        card.next_due_date = timezone.now().date() + timedelta(days=card.interval_days)
        card.save()

        # Award XP for review
        profile = get_or_create_student_profile(request)
        profile.xp_points += 15
        profile.save()

        return Response({
            'success': True,
            'repetitions': card.repetitions,
            'interval_days': card.interval_days,
            'ease_factor': round(card.ease_factor, 2),
            'next_due_date': card.next_due_date,
            'xp_points': profile.xp_points
        })


class StudentStatsView(APIView):
    def get(self, request):
        profile = get_or_create_student_profile(request)
        total_formulas = Formula.objects.count()

        if request.user.is_authenticated:
            total_attempts = PracticeAttempt.objects.filter(user=request.user).count()
            correct_attempts = PracticeAttempt.objects.filter(user=request.user, is_correct=True).count()
            bookmarks_count = UserBookmark.objects.filter(user=request.user).count()
            notes_count = UserFormulaNote.objects.filter(user=request.user).count()
        else:
            total_attempts = PracticeAttempt.objects.count()
            correct_attempts = PracticeAttempt.objects.filter(is_correct=True).count()
            bookmarks_count = UserBookmark.objects.count()
            notes_count = UserFormulaNote.objects.count()

        accuracy = round((correct_attempts / total_attempts * 100), 1) if total_attempts > 0 else 85.0
        due_flashcards_count = FlashcardSRS.objects.filter(next_due_date__lte=timezone.now().date()).count()

        daily_target = max(1, profile.daily_goal_formulas or 5)
        labs_count = len(profile.completed_labs) if isinstance(profile.completed_labs, list) else 0

        return Response({
            'is_authenticated': request.user.is_authenticated,
            'streak_days': profile.study_streak_days,
            'xp_points': profile.xp_points,
            'level': (profile.xp_points // 200) + 1,
            'formulas_mastered': total_formulas,
            'practice_questions_solved': correct_attempts or 12,
            'practice_accuracy_pct': accuracy,
            'bookmarks_count': bookmarks_count,
            'notes_count': notes_count,
            'due_flashcards_count': due_flashcards_count,
            'completed_labs_count': labs_count,
            'total_focus_minutes': profile.total_focus_minutes,
            'completed_focus_sessions': profile.completed_focus_sessions,
            'daily_goal_target': daily_target,
            'daily_goal_progress': min(100, int((labs_count + (correct_attempts % 5)) / daily_target * 100)),
            'target_exam_date': profile.target_exam_date,
            'daily_activity_map': profile.daily_activity_map or {},
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        username = data['username']
        email = data.get('email', '')
        password = data['password']
        display_name = data.get('display_name') or username
        institution = data.get('institution') or 'BehindTheMath Scholar'
        target_exam = data.get('target_exam') or 'HSC Higher Math 2026'
        target_exam_date = data.get('target_exam_date')
        guest_progress = data.get('guest_progress', {})

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=display_name
        )

        xp_points = guest_progress.get('xp_points', 350)
        completed_labs = guest_progress.get('completed_labs', ['circle-area', 'quadratic'])
        unlocked_badges = guest_progress.get('unlocked_badges', ['first_step', 'streak_3'])
        total_focus_minutes = guest_progress.get('total_focus_minutes', 0)
        completed_focus_sessions = guest_progress.get('completed_focus_sessions', 0)
        daily_activity_map = guest_progress.get('daily_activity_map', {})

        profile = StudentProfile.objects.create(
            user=user,
            display_name=display_name,
            institution=institution,
            target_exam=target_exam,
            target_exam_date=target_exam_date,
            xp_points=max(100, int(xp_points)),
            completed_labs=completed_labs if isinstance(completed_labs, list) else [],
            unlocked_badges=unlocked_badges if isinstance(unlocked_badges, list) else [],
            total_focus_minutes=int(total_focus_minutes),
            completed_focus_sessions=int(completed_focus_sessions),
            daily_activity_map=daily_activity_map if isinstance(daily_activity_map, dict) else {},
        )

        # Migrate guest bookmarks
        guest_bookmarks = guest_progress.get('bookmarks', [])
        if isinstance(guest_bookmarks, list):
            for f_id in guest_bookmarks:
                f_obj = Formula.objects.filter(
                    Q(pk=int(f_id)) if str(f_id).isdigit() else Q(slug__iexact=str(f_id)) | Q(formula_id__iexact=str(f_id))
                ).first()
                if f_obj:
                    UserBookmark.objects.get_or_create(user=user, formula=f_obj)

        # Migrate guest notes
        guest_notes = guest_progress.get('notes', {})
        if isinstance(guest_notes, dict):
            for f_id, text in guest_notes.items():
                if text and str(text).strip():
                    f_obj = Formula.objects.filter(
                        Q(pk=int(f_id)) if str(f_id).isdigit() else Q(slug__iexact=str(f_id)) | Q(formula_id__iexact=str(f_id))
                    ).first()
                    if f_obj:
                        UserFormulaNote.objects.update_or_create(user=user, formula=f_obj, defaults={'note_text': str(text)})

        token = Token.objects.create(user=user)
        return Response({
            'success': True,
            'token': token.key,
            'user': UserBasicSerializer(user).data,
            'profile': StudentProfileSerializer(profile).data,
            'message': 'Account created successfully!'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        if '@' in username:
            user_obj = User.objects.filter(email__iexact=username).first()
            if user_obj:
                username = user_obj.username

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        profile, _ = StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                'display_name': user.get_full_name() or user.username,
                'target_exam': 'HSC Higher Math 2026',
                'daily_goal_formulas': 5,
                'xp_points': 450,
                'study_streak_days': 7,
                'unlocked_badges': ['first_step', 'streak_3', 'lab_explorer']
            }
        )

        return Response({
            'success': True,
            'token': token.key,
            'user': UserBasicSerializer(user).data,
            'profile': StudentProfileSerializer(profile).data,
            'message': f'Welcome back, {profile.display_name}!'
        })


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
        return Response({'success': True, 'message': 'Logged out successfully.'})


class CurrentUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            profile = get_or_create_student_profile(request)
            return Response({
                'is_authenticated': True,
                'user': UserBasicSerializer(request.user).data,
                'profile': StudentProfileSerializer(profile).data,
            })

        profile = get_or_create_student_profile(request)
        return Response({
            'is_authenticated': False,
            'user': None,
            'profile': StudentProfileSerializer(profile).data,
        })


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        if not request.user.check_password(old_password):
            return Response({'error': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()

        Token.objects.filter(user=request.user).delete()
        new_token = Token.objects.create(user=request.user)

        return Response({
            'success': True,
            'token': new_token.key,
            'message': 'Password updated successfully!'
        })


class StudentAvatarUploadView(APIView):
    """
    Endpoint for uploading student avatar images.
    Accepts:
    1. Multipart file upload ('avatar' or 'image' or 'file')
    2. JSON payload with base64 data string ('avatar': 'data:image/...;base64,...')
    
    Resizes and compresses the image so that the output is guaranteed to be strictly under 500 KB.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        import base64
        import io
        from .image_processor import optimize_avatar_image, save_avatar_file
        
        profile = get_or_create_student_profile(request)
        uploaded_file = request.FILES.get('avatar') or request.FILES.get('image') or request.FILES.get('file')
        
        image_stream = None
        if uploaded_file:
            image_stream = uploaded_file
        else:
            avatar_data = request.data.get('avatar')
            if avatar_data and isinstance(avatar_data, str) and avatar_data.startswith('data:image/'):
                try:
                    format_part, base64_part = avatar_data.split(';base64,')
                    image_bytes = base64.b64decode(base64_part)
                    image_stream = io.BytesIO(image_bytes)
                except Exception as e:
                    return Response({'error': f'Invalid base64 image data: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            elif avatar_data and len(avatar_data) <= 10:
                # Math symbol passed
                profile.avatar = avatar_data
                profile.save()
                return Response({
                    'success': True,
                    'avatar': profile.avatar,
                    'message': 'Avatar symbol updated successfully.',
                    'profile': StudentProfileSerializer(profile).data
                })

        if not image_stream:
            return Response({'error': 'No image file or valid image data provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Optimize image: resize to max 800px and compress under 500 KB
            optimized_bytes, file_ext, final_size_kb, w, h = optimize_avatar_image(
                image_stream,
                max_kb=500,
                max_dimension=800,
                target_square=True
            )
            
            # Save to media directory
            avatar_url = save_avatar_file(profile.id or 'guest', optimized_bytes, file_ext)
            
            profile.avatar = avatar_url
            profile.save()
            
            return Response({
                'success': True,
                'avatar': avatar_url,
                'size_kb': final_size_kb,
                'dimensions': f"{w}x{h}",
                'message': f"Avatar resized and compressed to {final_size_kb} KB (Under 500 KB limit).",
                'profile': StudentProfileSerializer(profile).data
            })
        except Exception as e:
            return Response({'error': f'Failed to process image: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Resets avatar back to default math symbol."""
        profile = get_or_create_student_profile(request)
        profile.avatar = '∑'
        profile.save()
        return Response({
            'success': True,
            'avatar': '∑',
            'message': 'Avatar reset to default symbol.',
            'profile': StudentProfileSerializer(profile).data
        })


