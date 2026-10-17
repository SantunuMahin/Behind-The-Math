from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.formulas.models import Subject, Formula
from apps.lessons.models import LessonModule
from apps.practice.models import PracticeQuestion

class MathBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.subject = Subject.objects.create(name='Geometry', slug='geometry', icon='📐', order=1)
        self.formula = Formula.objects.create(
            formula_id='pythagorean-theorem',
            title='Pythagorean Theorem',
            slug='pythagorean-theorem',
            subject=self.subject,
            summary='In a right triangle, a^2 + b^2 = c^2.',
            formula_latex='a^2 + b^2 = c^2'
        )
        self.lesson = LessonModule.objects.create(
            formula=self.formula,
            subtitle='The cornerstone of Euclidean distance.',
            latex_display='a^2 + b^2 = c^2'
        )
        self.question = PracticeQuestion.objects.create(
            subject=self.subject,
            lesson=self.lesson,
            topic_tag='geometry',
            question_text='A triangle has legs 3 and 4. What is the hypotenuse?',
            question_type='numeric',
            correct_answer='5',
            tolerance=0.01,
            hint='Use a^2 + b^2 = c^2.',
            explanation='3^2 + 4^2 = 9 + 16 = 25, sqrt(25) = 5.'
        )

    def test_list_subjects(self):
        response = self.client.get('/api/v1/subjects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_list_formulas(self):
        response = self.client.get('/api/v1/formulas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_formula_by_slug(self):
        response = self.client.get(f'/api/v1/formulas/{self.formula.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Pythagorean Theorem')

    def test_retrieve_lesson(self):
        response = self.client.get(f'/api/v1/lessons/{self.formula.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['formula']['title'], 'Pythagorean Theorem')

    def test_submit_practice_correct_numeric(self):
        url = f'/api/v1/practice/{self.question.id}/submit/'
        response = self.client.post(url, {'answer': '5.0'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_correct'])

    def test_submit_practice_incorrect_numeric(self):
        url = f'/api/v1/practice/{self.question.id}/submit/'
        response = self.client.post(url, {'answer': '6.0'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_correct'])

    def test_solver_calculation(self):
        url = '/api/v1/solver/pythagorean-theorem/calculate/'
        response = self.client.post(url, {'inputs': {'a': 6, 'b': 8}}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['calculated_values']['hypotenuse'], 10.0)

    def test_solver_null_inputs_safe(self):
        url = '/api/v1/solver/pythagorean-theorem/calculate/'
        response = self.client.post(url, {'inputs': None}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_lesson_not_found_returns_404_not_500(self):
        response = self.client.get('/api/v1/lessons/nonexistent-formula-slug/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_submit_practice_fraction_numeric(self):
        url = f'/api/v1/practice/{self.question.id}/submit/'
        response = self.client.post(url, {'answer': '10/2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_correct'])

    def test_student_stats_zero_division_safety(self):
        from apps.students.models import StudentProfile
        profile = StudentProfile.objects.create(display_name='Test', daily_goal_formulas=0)
        response = self.client.get('/api/v1/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('daily_goal_progress', response.data)

    def test_bookmark_idempotent_and_toggle(self):
        # Create bookmark
        response = self.client.post('/api/v1/bookmarks/', {'formula': self.formula.id}, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

        # Second creation should return 200 without duplicate error
        response2 = self.client.post('/api/v1/bookmarks/', {'formula': self.formula.slug}, format='json')
        self.assertIn(response2.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

        # Toggle bookmark
        toggle_res = self.client.post('/api/v1/bookmarks/toggle/', {'formula': self.formula.id}, format='json')
        self.assertEqual(toggle_res.status_code, status.HTTP_200_OK)
        self.assertFalse(toggle_res.data['bookmarked'])

