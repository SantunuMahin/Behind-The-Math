from django.contrib import admin
from .models import LessonModule, SymbolDefinition, CodeImplementation

class SymbolDefinitionInline(admin.TabularInline):
    model = SymbolDefinition
    extra = 1

class CodeImplementationInline(admin.StackedInline):
    model = CodeImplementation
    extra = 1

@admin.register(LessonModule)
class LessonModuleAdmin(admin.ModelAdmin):
    list_display = ['formula', 'lab_component_name', 'updated_at']
    search_fields = ['formula__title', 'plain_language_intuition']
    inlines = [SymbolDefinitionInline, CodeImplementationInline]

@admin.register(SymbolDefinition)
class SymbolDefinitionAdmin(admin.ModelAdmin):
    list_display = ['symbol', 'meaning', 'lesson', 'order']
    list_filter = ['lesson']

@admin.register(CodeImplementation)
class CodeImplementationAdmin(admin.ModelAdmin):
    list_display = ['lesson', 'language']
    list_filter = ['language']
