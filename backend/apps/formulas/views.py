from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from django.http import Http404
from .models import Subject, Formula, DonationTransaction
from .serializers import SubjectSerializer, FormulaListSerializer, DonationTransactionSerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all().prefetch_related('topics', 'formulas')
    serializer_class = SubjectSerializer
    lookup_field = 'slug'


class FormulaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Formula.objects.select_related('subject').prefetch_related('topics').all()
    serializer_class = FormulaListSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary', 'keywords', 'subject__name', 'formula_id']
    ordering_fields = ['title', 'level', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        subject_param = self.request.query_params.get('subject')
        if subject_param and subject_param != 'all':
            qs = qs.filter(Q(subject__slug=subject_param) | Q(subject__name__iexact=subject_param))

        level_param = self.request.query_params.get('level')
        if level_param and level_param != 'all':
            qs = qs.filter(level=level_param)

        has_demo_param = self.request.query_params.get('has_demo')
        if has_demo_param in ['true', '1', True]:
            qs = qs.filter(has_demo=True)

        return qs

    def get_object(self):
        queryset = self.get_queryset()
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        val = str(self.kwargs[lookup_url_kwarg]).strip('/')

        obj = queryset.filter(
            Q(slug__iexact=val) |
            Q(formula_id__iexact=val) |
            Q(slug__iexact=val.replace('_', '-')) |
            Q(slug__iexact=val.replace('-', '_')) |
            Q(formula_id__iexact=val.replace('_', '-')) |
            Q(formula_id__iexact=val.replace('-', '_')) |
            Q(title__iexact=val.replace('-', ' ')) |
            Q(title__iexact=val.replace('_', ' '))
        ).first()

        if obj:
            return obj

        if val.isdigit():
            obj = queryset.filter(pk=int(val)).first()
            if obj:
                return obj

        raise Http404(f"Formula not found for '{val}'")



class DonationSubmitView(APIView):
    def post(self, request):
        serializer = DonationTransactionSerializer(data=request.data)
        if serializer.is_valid():
            transaction = serializer.save()
            return Response(
                {
                    'status': 'success',
                    'message': 'Donation recorded successfully! Thank you for supporting free math education.',
                    'donation': DonationTransactionSerializer(transaction).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response({'status': 'error', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class RecentDonationsView(APIView):
    def get(self, request):
        donations = DonationTransaction.objects.all()[:20]
        serializer = DonationTransactionSerializer(donations, many=True)
        return Response({'donations': serializer.data})

