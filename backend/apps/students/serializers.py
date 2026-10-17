from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudentProfile, UserBookmark, UserFormulaNote, FlashcardSRS
from apps.formulas.serializers import FormulaListSerializer

LEVEL_TITLES = [
    "Math Novice",
    "Formula Apprentice",
    "Derivation Specialist",
    "Geometric Intuitive",
    "Euler Scholar",
    "Lagrange Pioneer",
    "Gauss Master",
    "Quantum Theorist",
    "Field Medalist",
    "Grand Mathematical Archmage"
]

class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True, default='Guest')
    email = serializers.CharField(source='user.email', read_only=True, default='')
    level = serializers.SerializerMethodField()
    level_title = serializers.SerializerMethodField()
    next_level_xp = serializers.SerializerMethodField()
    level_progress_pct = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'username',
            'email',
            'display_name',
            'avatar',
            'institution',
            'bio',
            'target_exam',
            'target_exam_date',
            'daily_goal_formulas',
            'study_streak_days',
            'last_active_date',
            'xp_points',
            'completed_labs',
            'unlocked_badges',
            'total_focus_minutes',
            'completed_focus_sessions',
            'daily_activity_map',
            'level',
            'level_title',
            'next_level_xp',
            'level_progress_pct'
        ]

    def get_level(self, obj):
        return (obj.xp_points // 200) + 1

    def get_level_title(self, obj):
        lvl = (obj.xp_points // 200) + 1
        idx = min(len(LEVEL_TITLES) - 1, max(0, lvl - 1))
        return LEVEL_TITLES[idx]

    def get_next_level_xp(self, obj):
        lvl = (obj.xp_points // 200) + 1
        return lvl * 200

    def get_level_progress_pct(self, obj):
        rem = obj.xp_points % 200
        return min(100, int((rem / 200) * 100))


class UserBookmarkSerializer(serializers.ModelSerializer):
    formula_detail = FormulaListSerializer(source='formula', read_only=True)

    class Meta:
        model = UserBookmark
        fields = ['id', 'formula', 'formula_detail', 'created_at']


class UserFormulaNoteSerializer(serializers.ModelSerializer):
    formula_title = serializers.CharField(source='formula.title', read_only=True)

    class Meta:
        model = UserFormulaNote
        fields = ['id', 'formula', 'formula_title', 'note_text', 'updated_at']


class FlashcardSRSSerializer(serializers.ModelSerializer):
    formula_detail = FormulaListSerializer(source='formula', read_only=True)

    class Meta:
        model = FlashcardSRS
        fields = ['id', 'formula', 'formula_detail', 'repetitions', 'interval_days', 'ease_factor', 'next_due_date']


class UserBasicSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, min_length=4)
    display_name = serializers.CharField(required=False, allow_blank=True, default='')
    institution = serializers.CharField(required=False, allow_blank=True, default='')
    target_exam = serializers.CharField(required=False, allow_blank=True, default='HSC Higher Math 2026')
    target_exam_date = serializers.DateField(required=False, allow_null=True)
    guest_progress = serializers.DictField(required=False, default=dict)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A student with this username already exists.")
        return value


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=4)

