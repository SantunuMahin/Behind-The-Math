from django.db import models
from apps.formulas.models import Formula

class LessonModule(models.Model):
    formula = models.OneToOneField(Formula, on_delete=models.CASCADE, related_name='lesson')
    subtitle = models.TextField(blank=True)
    latex_display = models.TextField(blank=True)
    plain_language_intuition = models.TextField(blank=True)
    conditions_and_assumptions = models.JSONField(default=dict, blank=True)
    worked_example_problem = models.TextField(blank=True)
    worked_example_steps = models.JSONField(default=list, blank=True)
    worked_example_solution = models.TextField(blank=True)
    lab_component_name = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Lesson: {self.formula.title}"


class SymbolDefinition(models.Model):
    lesson = models.ForeignKey(LessonModule, on_delete=models.CASCADE, related_name='symbols')
    symbol = models.CharField(max_length=50)
    meaning = models.CharField(max_length=255)
    unit = models.CharField(max_length=100, blank=True)
    constraint = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.symbol} - {self.meaning}"


class CodeImplementation(models.Model):
    LANGUAGE_CHOICES = [
        ('c', 'C (C11)'),
        ('python', 'Python 3')
    ]

    lesson = models.ForeignKey(LessonModule, on_delete=models.CASCADE, related_name='code_snippets')
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    code = models.TextField()
    sample_input = models.TextField(blank=True)
    sample_output = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['language']

    def __str__(self):
        return f"{self.lesson.formula.title} ({self.get_language_display()})"
