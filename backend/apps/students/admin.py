from django.contrib import admin
from .models import StudentProfile, UserBookmark, UserFormulaNote, FlashcardSRS

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = [
        'display_name',
        'avatar_preview',
        'target_exam',
        'study_streak_days',
        'xp_points',
        'institution',
        'daily_goal_formulas',
        'total_focus_minutes',
        'completed_focus_sessions',
        'last_active_date'
    ]
    search_fields = ['display_name', 'target_exam', 'institution', 'user__username']

    def avatar_preview(self, obj):
        if not obj.avatar:
            return '∑'
        if obj.avatar.startswith('data:image/') or obj.avatar.startswith('http') or obj.avatar.startswith('/'):
            return f"[Photo Avatar]"
        return obj.avatar
    avatar_preview.short_description = 'Avatar'
    list_editable = ['target_exam', 'xp_points', 'study_streak_days', 'total_focus_minutes']

@admin.register(UserBookmark)
class UserBookmarkAdmin(admin.ModelAdmin):
    list_display = ['user', 'formula', 'created_at']
    search_fields = ['user__username', 'formula__title']

@admin.register(UserFormulaNote)
class UserFormulaNoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'formula', 'updated_at']
    search_fields = ['user__username', 'formula__title', 'note_text']

@admin.register(FlashcardSRS)
class FlashcardSRSAdmin(admin.ModelAdmin):
    list_display = ['user', 'formula', 'repetitions', 'interval_days', 'ease_factor', 'next_due_date']
    list_filter = ['next_due_date']
    search_fields = ['user__username', 'formula__title']
