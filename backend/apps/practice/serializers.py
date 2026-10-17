from rest_framework import serializers
from .models import PracticeQuestion, PracticeAttempt

class PracticeQuestionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = PracticeQuestion
        fields = [
            'id',
            'lesson',
            'subject',
            'subject_name',
            'topic_tag',
            'question_text',
            'question_type',
            'options',
            'unit_label',
            'hint',
            'explanation',
            'order',
        ]


class PracticeSubmitSerializer(serializers.Serializer):
    answer = serializers.CharField(max_length=255)


class PracticeAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeAttempt
        fields = ['id', 'question', 'user_answer', 'is_correct', 'attempted_at']
