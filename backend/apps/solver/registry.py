from typing import Dict, Optional, List
from .base import BaseSolverStrategy
from .strategies import (
    QuadraticSolver,
    CircleAreaSolver,
    PythagoreanSolver,
    EuclideanGcdSolver,
    CompoundInterestSolver,
    LinearSystemSolver,
    DerivativePolynomialSolver,
    DefiniteIntegralSolver,
    VectorDotCrossSolver,
    NormalZScoreSolver,
)

class SolverRegistry:
    _strategies: Dict[str, BaseSolverStrategy] = {}

    @classmethod
    def register(cls, strategy: BaseSolverStrategy):
        cls._strategies[strategy.slug] = strategy

    @classmethod
    def get(cls, slug: str) -> Optional[BaseSolverStrategy]:
        return cls._strategies.get(slug)

    @classmethod
    def list_all(cls) -> List[dict]:
        return [
            {
                'slug': strat.slug,
                'title': strat.title,
                'formula_latex': strat.formula_latex,
                'inputs_schema': strat.inputs_schema,
            }
            for strat in cls._strategies.values()
        ]

# Register all built-in solver strategies
for strat_class in [
    QuadraticSolver,
    CircleAreaSolver,
    PythagoreanSolver,
    EuclideanGcdSolver,
    CompoundInterestSolver,
    LinearSystemSolver,
    DerivativePolynomialSolver,
    DefiniteIntegralSolver,
    VectorDotCrossSolver,
    NormalZScoreSolver,
]:
    SolverRegistry.register(strat_class())

