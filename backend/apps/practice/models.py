from django.db import models
from django.conf import settings
from apps.formulas.models import Subject
from apps.lessons.models import LessonModule

class PracticeQuestion(models.Model):
    QUESTION_TYPES = [
        ('numeric', 'Numeric Value'),
        ('multiple_choice', 'Multiple Choice'),
        ('text', 'Expression / Text'),
    ]

    lesson = models.ForeignKey(LessonModule, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='questions')
    topic_tag = models.CharField(max_length=50)
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='numeric')
    options = models.JSONField(default=list, blank=True)
    correct_answer = models.CharField(max_length=255)
    tolerance = models.FloatField(default=0.01)
    unit_label = models.CharField(max_length=50, blank=True)
    hint = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."


class PracticeAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='practice_attempts')
    question = models.ForeignKey(PracticeQuestion, on_delete=models.CASCADE, related_name='attempts')
    user_answer = models.CharField(max_length=255)
    is_correct = models.BooleanField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = 'Correct' if self.is_correct else 'Incorrect'
        return f"Attempt {self.id} on Q{self.question.id}: {status}"
