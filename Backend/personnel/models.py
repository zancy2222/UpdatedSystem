from django.db import models
from django.contrib.auth.models import AbstractUser

class Personnel(AbstractUser):
    POSITION_CHOICES = [
        ('HeadOfOffice', 'Head of Office'),
        ('Deputy', 'Deputy'),
        ('Administrative Officer', 'Administrative Officer'),
        ('Examiner', 'Examiner'),
    ]
    
    CIVIL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
    ]
    
    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    
    position = models.CharField(max_length=50, choices=POSITION_CHOICES, default='Administrative Officer')
    lastname = models.CharField(max_length=100)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, blank=True, null=True)
    MobileNumber = models.CharField(max_length=20)
    address = models.TextField()
    CivilStatus = models.CharField(max_length=10, choices=CIVIL_STATUS_CHOICES, default='Single')
    birthplace = models.CharField(max_length=100)
    birthday = models.DateField()
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, default='Male')
    
    def __str__(self):
        return f"{self.lastname}, {self.firstname}"

    class Meta:
        verbose_name_plural = "Personnel"