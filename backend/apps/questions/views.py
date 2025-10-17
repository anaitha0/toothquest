from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import Module, Course, Question, QuestionReport
from .serializers import (
    ModuleSerializer, CourseSerializer, QuestionSerializer, 
    QuestionCreateUpdateSerializer, QuestionReportSerializer
)

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['year', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'year', 'created_at']
    ordering = ['name']

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.select_related('module')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['module', 'module__year'] # This is still correct as Course has a ForeignKey to Module
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.select_related('module')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

class QuestionListCreateView(generics.ListCreateAPIView):
    # Removed 'module' and 'course' from select_related as they are no longer ForeignKeys on Question
    queryset = Question.objects.select_related('created_by').prefetch_related('options')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    # Changed 'module' to 'module_name' and 'course' to 'course_name' for filtering
    filterset_fields = ['module_name', 'course_name', 'year', 'difficulty', 'is_active']
    search_fields = ['question_text', 'explanation', 'module_name', 'course_name'] # Added module_name and course_name
    ordering_fields = ['created_at', 'difficulty', 'year']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuestionCreateUpdateSerializer
        return QuestionSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Removed 'module' and 'course' from select_related as they are no longer ForeignKeys on Question
    queryset = Question.objects.select_related('created_by').prefetch_related('options')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return QuestionCreateUpdateSerializer
        return QuestionSerializer

class QuestionReportListCreateView(generics.ListCreateAPIView):
    queryset = QuestionReport.objects.select_related('question', 'reported_by', 'resolved_by')
    serializer_class = QuestionReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    # Changed 'question__module' to 'question__module_name'
    filterset_fields = ['status', 'question__module_name', 'question__year']
    search_fields = ['reason', 'question__question_text', 'question__module_name', 'question__course_name'] # Added related string fields
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

class QuestionReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = QuestionReport.objects.select_related('question', 'reported_by', 'resolved_by')
    serializer_class = QuestionReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        if serializer.validated_data.get('status') == 'resolved':
            serializer.save(resolved_by=self.request.user, resolved_at=timezone.now())
        else:
            serializer.save()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resolve_report(request, pk):
    try:
        report = QuestionReport.objects.get(pk=pk)
        admin_response = request.data.get('admin_response', '')
        
        report.status = 'resolved'
        report.admin_response = admin_response
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.save()
        
        return Response({'message': 'Report resolved successfully'})
    except QuestionReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def dismiss_report(request, pk):
    try:
        report = QuestionReport.objects.get(pk=pk)
        report.status = 'dismissed'
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.save()
        
        return Response({'message': 'Report dismissed successfully'})
    except QuestionReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)