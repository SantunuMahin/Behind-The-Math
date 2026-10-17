from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PracticeQuestion, PracticeAttempt
from .serializers import PracticeQuestionSerializer, PracticeSubmitSerializer

class PracticeQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PracticeQuestion.objects.select_related('subject', 'lesson').all()
    serializer_class = PracticeQuestionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        topic = self.request.query_params.get('topic')
        if topic and topic != 'all':
            qs = qs.filter(topic_tag__iexact=topic)
        return qs

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_answer(self, request, pk=None):
        question = self.get_object()
        serializer = PracticeSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_answer = serializer.validated_data['answer'].strip()

        is_correct = False
        if question.question_type == 'numeric':
            try:
                def parse_num(val):
                    c = val.replace('$', '').replace(',', '').replace('%', '').strip()
                    if '/' in c:
                        parts = c.split('/')
                        if len(parts) == 2 and float(parts[1]) != 0:
                            return float(parts[0]) / float(parts[1])
                    return float(c)

                ans_float = parse_num(user_answer)
                corr_float = parse_num(question.correct_answer)
                if abs(ans_float - corr_float) <= question.tolerance:
                    is_correct = True
            except (ValueError, TypeError, ZeroDivisionError):
                # fallback to string match
                is_correct = (user_answer.lower() == question.correct_answer.lower())
        else:
            # multiple choice or text match
            is_correct = (user_answer.lower() == question.correct_answer.lower())

        # Record attempt
        user = request.user if request.user.is_authenticated else None
        PracticeAttempt.objects.create(
            user=user,
            question=question,
            user_answer=user_answer,
            is_correct=is_correct
        )

        return Response({
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation,
            'message': 'Correct! Excellent job.' if is_correct else 'Not quite right. Review the explanation below.'
        })
