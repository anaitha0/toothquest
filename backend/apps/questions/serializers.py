# serializers.py
from rest_framework import serializers
from .models import Module, Course, Question, QuestionOption, QuestionReport

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    module = ModuleSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'

class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'option_letter', 'is_correct']

class QuestionOptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['option_text', 'option_letter', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    # Create mock objects for frontend compatibility
    module = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'
    
    def get_module(self, obj):
        # Return a mock module object for frontend compatibility
        return {
            'id': hash(obj.module_name) % 10000,  # Generate a consistent fake ID
            'name': obj.module_name,
            'year': obj.year
        }
    
    def get_course(self, obj):
        # Return a mock course object for frontend compatibility
        return {
            'id': hash(obj.course_name) % 10000,  # Generate a consistent fake ID
            'name': obj.course_name
        }
    
    def get_created_by(self, obj):
        return {
            'id': obj.created_by.id,
            'username': obj.created_by.username,
            'email': obj.created_by.email,
            'full_name': getattr(obj.created_by, 'full_name', obj.created_by.username)
        }

class QuestionCreateUpdateSerializer(serializers.ModelSerializer):
    options = QuestionOptionCreateSerializer(many=True)
    # Accept string values from frontend
    module_name = serializers.CharField(source='module_name')
    course_name = serializers.CharField(source='course_name')
    
    class Meta:
        model = Question
        fields = [
            'question_text', 'module_name', 'course_name', 'year', 
            'difficulty', 'explanation', 'image', 'explanation_image', 'options'
        ]
    
    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        
        # Create options
        for option_data in options_data:
            QuestionOption.objects.create(question=question, **option_data)
        
        return question
    
    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', [])
        
        # Update question fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Delete existing options and create new ones
        if options_data:
            instance.options.all().delete()
            for option_data in options_data:
                QuestionOption.objects.create(question=instance, **option_data)
        
        return instance

class QuestionReportSerializer(serializers.ModelSerializer):
    reported_by = serializers.StringRelatedField(read_only=True)
    resolved_by = serializers.StringRelatedField(read_only=True)
    question = QuestionSerializer(read_only=True)
    
    class Meta:
        model = QuestionReport
        fields = '__all__'