from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re

def validate_access_code_format(value):
    """
    Validate access code format: PREFIX-XXXXXX
    """
    pattern = r'^[A-Z]{2,4}-[A-Z0-9]{6}$'
    if not re.match(pattern, value):
        raise ValidationError(
            'Access code must be in format: PREFIX-XXXXXX (e.g., TQ1-ABC123)'
        )

def validate_phone_number(value):
    """
    Validate phone number format
    """
    pattern = r'^\+?[1-9]\d{1,14}$'
    if not re.match(pattern, value):
        raise ValidationError(
            'Enter a valid phone number.'
        )

def validate_university_email(value):
    """
    Validate that email belongs to an educational institution
    """
    # Common educational domains
    edu_domains = ['.edu', '.ac.', '.univ-', 'university', 'college']
    
    # For Algeria specifically
    algeria_edu_domains = ['.edu.dz', '.univ-', 'universite', 'usthb', 'univ']
    
    email_lower = value.lower()
    
    # Check if it's an educational domain
    is_edu = any(domain in email_lower for domain in edu_domains + algeria_edu_domains)
    
    if not is_edu:
        raise ValidationError(
            'Please use your university email address.'
        )

def validate_image_size(image):
    """
    Validate uploaded image size
    """
    max_size = 5 * 1024 * 1024  # 5MB
    
    if image.size > max_size:
        raise ValidationError(
            f'Image file too large. Size should not exceed 5MB.'
        )

def validate_question_options(options):
    """
    Validate that question has exactly 4 options with one correct answer
    """
    if len(options) != 4:
        raise ValidationError('Question must have exactly 4 options.')
    
    correct_count = sum(1 for option in options if option.get('is_correct', False))
    
    if correct_count != 1:
        raise ValidationError('Question must have exactly one correct answer.')
    
    # Check that all options have text
    for i, option in enumerate(options):
        if not option.get('option_text', '').strip():
            raise ValidationError(f'Option {i+1} cannot be empty.')

# Custom regex validators
alphanumeric_validator = RegexValidator(
    regex=r'^[a-zA-Z0-9]*$',
    message='Only alphanumeric characters are allowed.'
)

username_validator = RegexValidator(
    regex=r'^[a-zA-Z0-9_.-]*$',
    message='Username can only contain letters, numbers, dots, hyphens and underscores.'
)