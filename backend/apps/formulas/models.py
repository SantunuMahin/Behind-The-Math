from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=20, default='📐')
    description = models.TextField(blank=True)
    gradient = models.CharField(max_length=100, default='from-[#1D3557] to-[#457B9D]')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Topic(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)

    class Meta:
        ordering = ['name']
        unique_together = ('subject', 'slug')

    def __str__(self):
        return f"{self.subject.name} - {self.name}"


class Formula(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    formula_id = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='formulas')
    topics = models.ManyToManyField(Topic, related_name='formulas', blank=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    summary = models.TextField()
    formula_latex = models.TextField()
    has_demo = models.BooleanField(default=False)
    keywords = models.JSONField(default=list, blank=True)
    href = models.CharField(max_length=255, blank=True)

    # Video explanation metadata
    video_youtube_id = models.CharField(max_length=50, blank=True, null=True)
    video_url = models.URLField(max_length=500, blank=True, null=True)
    video_title = models.CharField(max_length=255, blank=True, null=True)
    video_channel = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class DonationTransaction(models.Model):
    PROVIDER_CHOICES = [
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('rocket', 'Rocket'),
        ('googlepay', 'Google Pay'),
    ]

    STATUS_CHOICES = [
        ('submitted', 'Submitted / Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    sender_name = models.CharField(max_length=150, blank=True, default='Anonymous Benefactor')
    sender_phone = models.CharField(max_length=50, blank=True, null=True)
    sender_role = models.CharField(max_length=150, blank=True, default='Math Enthusiast')
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='bkash')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='BDT')
    trx_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    message = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='verified')
    is_monthly = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.provider.upper()} {self.amount} {self.currency} by {self.sender_name} (TrxID: {self.trx_id})"
