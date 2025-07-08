#---IMPORTS------------------------------------------------------------------------------------------------------------------------------------------------------------------------
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Create your models here.

#---CLIENT-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

class Client(AbstractUser):
    # CIVIL STATUS
    CIVIL_STATUS_CHOICES = [
        ('Single', 'single'),
        ('Married', 'married'),
        ('Widowed', 'widowed'),
        ('Divorced', 'divorced'),
        ('Separated', 'separated'),
    ]
    
    # GENDERS
    SEX_CHOICES = [
        ('Male', 'male'),
        ('Female', 'female'),

    ]
    
    # GROUP PERMISSIONS
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='client_set',
        related_query_name='client',
    )

    # USER PERMISSIONS
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='client_set',
        related_query_name='client',
    )
    
    #---INFO FIELDS----------------------------------------------------------------------------
    
    # PERSONAL INFO
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, blank=True, null=True)
    
    # CONTACTS
    email = models.EmailField(unique=True)
    contact_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    occupation = models.CharField(max_length=100, blank=True, null=True, verbose_name="Occupation")   
    # ADDRESS FIELDS
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    barangay = models.CharField(max_length=100)
    street = models.CharField(max_length=100, blank=True, null=True)
    
    # PERSONAL INFO (CONTINUATION)
    civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS_CHOICES, default='Single')
    birthplace = models.CharField(max_length=200)
    birthday = models.DateField()
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, default='Male')
    
    # SPECIAL FIELDS
    is_pwd = models.BooleanField(default=False, verbose_name='Person with Disability')
    is_pregnant = models.BooleanField(default=False)
    
    # SYSTEM RECORDS
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # FIELD DEF & REQS
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'firstname', 'lastname']
    
    #---------------------------------------------------------------------------------------

    #---DERIVED DATA-------------------------------------------------------------------------

    # FULL ADDRESS COMPOSITION
    @property
    def full_address(self):
        address_parts = []
        if self.street:
            address_parts.append(self.street)
        address_parts.extend([self.barangay, self.city, self.province])
        return ', '.join(address_parts)
    
    #FULL NAME COMPOSITION
    @property
    def full_name(self):
        if self.middlename:
            return f"{self.firstname} {self.middlename} {self.lastname}"
        return f"{self.firstname} {self.lastname}"
    
    # AGE CALCULATION
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.birthday.year - ((today.month, today.day) < (self.birthday.month, self.birthday.day))
    
    #-----------------------------------------------------------------------------------------

    class Meta:
        db_table = 'tblClients'
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
    
    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.username})"