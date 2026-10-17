from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.formulas.views import SubjectViewSet, FormulaViewSet, DonationSubmitView, RecentDonationsView
from apps.lessons.views import LessonModuleViewSet
from apps.practice.views import PracticeQuestionViewSet
from apps.students.views import (
    BookmarkViewSet,
    FormulaNoteViewSet,
    FlashcardViewSet,
    StudentStatsView,
    StudentProfileView,
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView,
    StudentAvatarUploadView
)
from apps.solver.views import SolverListView, SolverCalculateView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'formulas', FormulaViewSet, basename='formula')
router.register(r'lessons', LessonModuleViewSet, basename='lesson')
router.register(r'practice', PracticeQuestionViewSet, basename='practice')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')
router.register(r'notes', FormulaNoteViewSet, basename='note')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/profile/', StudentProfileView.as_view(), name='student-profile'),
    path('api/v1/profile/avatar/', StudentAvatarUploadView.as_view(), name='student-avatar-upload'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/v1/auth/login/', LoginView.as_view(), name='auth-login'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('api/v1/auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('api/v1/auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('api/v1/solver/', SolverListView.as_view(), name='solver-list'),
    path('api/v1/solver/<slug:slug>/calculate/', SolverCalculateView.as_view(), name='solver-calculate'),
    path('api/v1/stats/', StudentStatsView.as_view(), name='student-stats'),
    path('api/v1/donations/submit/', DonationSubmitView.as_view(), name='donation-submit'),
    path('api/v1/donations/recent/', RecentDonationsView.as_view(), name='donation-recent'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

