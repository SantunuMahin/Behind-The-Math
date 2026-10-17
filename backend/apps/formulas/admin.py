from django.contrib import admin
from .models import Subject, Topic, Formula, DonationTransaction

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'slug']
    list_filter = ['subject']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Formula)
class FormulaAdmin(admin.ModelAdmin):
    list_display = ['title', 'formula_id', 'subject', 'level', 'has_demo']
    list_filter = ['subject', 'level', 'has_demo']
    search_fields = ['title', 'formula_id', 'summary']

@admin.register(DonationTransaction)
class DonationTransactionAdmin(admin.ModelAdmin):
    list_display = ['sender_name', 'provider', 'amount', 'currency', 'trx_id', 'status', 'created_at']
    list_filter = ['provider', 'currency', 'status', 'is_monthly']
    search_fields = ['sender_name', 'sender_phone', 'trx_id', 'message']
    list_editable = ['status']

