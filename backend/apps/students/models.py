from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.formulas.models import Formula

class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True,
        blank=True
    )
    display_name = models.CharField(max_length=100, blank=True, default='Math Student')
    avatar = models.TextField(blank=True, default='∑')
    institution = models.CharField(max_length=150, blank=True, default='Dhaka College')
    bio = models.TextField(blank=True, default='Passionate about visualizing mathematics, physics intuition, and algorithms.')
    target_exam = models.CharField(max_length=100, blank=True, default='HSC Higher Math 2026')
    daily_goal_formulas = models.PositiveIntegerField(default=5)
    study_streak_days = models.PositiveIntegerField(default=7)
    last_active_date = models.DateField(auto_now=True)
    xp_points = models.PositiveIntegerField(default=350)
    completed_labs = models.JSONField(default=list, blank=True)
    unlocked_badges = models.JSONField(default=list, blank=True)
    total_focus_minutes = models.PositiveIntegerField(default=0)
    completed_focus_sessions = models.PositiveIntegerField(default=0)
    target_exam_date = models.DateField(null=True, blank=True, default=None)
    daily_activity_map = models.JSONField(default=dict, blank=True)

    def __str__(self):
        name = self.display_name or (self.user.username if self.user else 'Guest Student')
        return f"Student: {name} ({self.xp_points} XP)"


class UserBookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='bookmarks')
    formula = models.ForeignKey(Formula, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        username = self.user.username if self.user else 'Guest'
        return f"{username} -> {self.formula.title}"


class UserFormulaNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='formula_notes')
    formula = models.ForeignKey(Formula, on_delete=models.CASCADE, related_name='notes')
    note_text = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        username = self.user.username if self.user else 'Guest'
        return f"Note on {self.formula.title} by {username}"


class FlashcardSRS(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='flashcards')
    formula = models.ForeignKey(Formula, on_delete=models.CASCADE, related_name='flashcards')
    repetitions = models.PositiveIntegerField(default=0)
    interval_days = models.PositiveIntegerField(default=1)
    ease_factor = models.FloatField(default=2.5)
    next_due_date = models.DateField(default=timezone.now)

    class Meta:
        ordering = ['next_due_date']

    def __str__(self):
        return f"Flashcard for {self.formula.title} (Due: {self.next_due_date})"
