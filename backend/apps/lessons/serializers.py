from rest_framework import serializers
from .models import LessonModule, SymbolDefinition, CodeImplementation
from apps.formulas.serializers import FormulaListSerializer

class SymbolDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymbolDefinition
        fields = ['id', 'symbol', 'meaning', 'unit', 'constraint', 'order']


class CodeImplementationSerializer(serializers.ModelSerializer):
    language_display = serializers.CharField(source='get_language_display', read_only=True)

    class Meta:
        model = CodeImplementation
        fields = ['id', 'language', 'language_display', 'code', 'sample_input', 'sample_output', 'notes']


class LessonModuleSerializer(serializers.ModelSerializer):
    formula = FormulaListSerializer(read_only=True)
    symbols = SymbolDefinitionSerializer(many=True, read_only=True)
    code_snippets = CodeImplementationSerializer(many=True, read_only=True)

    class Meta:
        model = LessonModule
        fields = [
            'id',
            'formula',
            'subtitle',
            'latex_display',
            'plain_language_intuition',
            'conditions_and_assumptions',
            'worked_example_problem',
            'worked_example_steps',
            'worked_example_solution',
            'lab_component_name',
            'symbols',
            'code_snippets',
            'created_at',
            'updated_at',
        ]
