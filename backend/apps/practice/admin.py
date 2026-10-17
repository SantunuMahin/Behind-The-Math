from django.contrib import admin
from .models import PracticeQuestion, PracticeAttempt

@admin.register(PracticeQuestion)
class PracticeQuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'topic_tag', 'question_type', 'correct_answer', 'order']
    list_filter = ['subject', 'question_type', 'topic_tag']
    search_fields = ['question_text', 'explanation', 'correct_answer']

@admin.register(PracticeAttempt)
class PracticeAttemptAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'question', 'user_answer', 'is_correct', 'attempted_at']
    list_filter = ['is_correct', 'attempted_at']
    search_fields = ['user__username', 'user_answer', 'question__question_text']
