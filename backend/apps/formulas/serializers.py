from rest_framework import serializers
from .models import Subject, Topic, Formula, DonationTransaction

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'slug']


class SubjectSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    formula_count = serializers.IntegerField(source='formulas.count', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'slug', 'icon', 'description', 'gradient', 'order', 'formula_count', 'topics']


class FormulaListSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_slug = serializers.CharField(source='subject.slug', read_only=True)
    topic_names = serializers.SerializerMethodField()

    class Meta:
        model = Formula
        fields = [
            'id',
            'formula_id',
            'title',
            'slug',
            'subject',
            'subject_name',
            'subject_slug',
            'topic_names',
            'level',
            'summary',
            'formula_latex',
            'has_demo',
            'keywords',
            'href',
            'video_youtube_id',
            'video_url',
            'video_title',
            'video_channel',
        ]

    def get_topic_names(self, obj):
        return [t.name for t in obj.topics.all()]


class DonationTransactionSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = DonationTransaction
        fields = [
            'id',
            'sender_name',
            'sender_phone',
            'sender_role',
            'provider',
            'amount',
            'currency',
            'trx_id',
            'message',
            'status',
            'is_monthly',
            'created_at',
            'formatted_date',
        ]
        read_only_fields = ['id', 'created_at', 'formatted_date']

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d %b %Y, %I:%M %p')
