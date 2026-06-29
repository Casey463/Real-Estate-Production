import json
from urllib import request
from django.http import JsonResponse, HttpResponse
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SupabaseListing
from .serializers import SupabaseListingSerializer
from .scoring import get_population_growth_score, get_property_tax_score, has_adu_potential

class SupabaseListingListView(ListAPIView):
    queryset = SupabaseListing.objects.all().order_by('-id')
    serializer_class = SupabaseListingSerializer

class SupabaseListingZipCodeView(ListAPIView):
    serializer_class = SupabaseListingSerializer
    queryset = SupabaseListing.objects.all().order_by('-id')

    def post(self, request):
        if self.request.method == 'POST':
            try:
                body_unicode = self.request.body.decode('utf-8')
                data = json.loads(body_unicode)
                queryset = self.queryset.filter(zip_code__in=data)
                serializer = self.serializer_class(queryset, many=True)
                return Response(serializer.data)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
        return JsonResponse({'error': 'Only POST requests allowed'}, status=405)



class RankedListingView(APIView):
    def get(self, request):
        listings = SupabaseListing.objects.filter(state='WA')[:100]  # Limit for performance
        results = []
        for listing in listings:
            pop_score = get_population_growth_score(listing.city)
            state_tax_score = 1.0  # WA has no income tax
            tax_score = get_property_tax_score(listing.taxes_annual)
            adu_score = has_adu_potential(listing)

            # Weighting system
            total_score = (
                0.4 * pop_score +
                0.2 * state_tax_score +
                0.3 * tax_score +
                0.1 * adu_score
            )

            results.append({
                'id': listing.id,
                'city': listing.city,
                'taxes_annual': listing.taxes_annual,
                'adu': bool(adu_score),
                'score': round(total_score, 3),
                'price': listing.current_price,
                'remarks': listing.marketing_remarks
            })

        sorted_results = sorted(results, key=lambda x: x['score'], reverse=True)
        return Response(sorted_results)
