from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .registry import SolverRegistry

class SolverListView(APIView):
    def get(self, request):
        solvers = SolverRegistry.list_all()
        return Response(solvers)


class SolverCalculateView(APIView):
    def post(self, request, slug):
        solver = SolverRegistry.get(slug)
        if not solver:
            return Response(
                {'error': f'Solver for "{slug}" is not currently available.'},
                status=status.HTTP_404_NOT_FOUND
            )

        inputs = request.data.get('inputs')
        if not isinstance(inputs, dict):
            inputs = {}
        result = solver.calculate(inputs)
        return Response(result)
