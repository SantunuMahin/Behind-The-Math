from abc import ABC, abstractmethod

class BaseSolverStrategy(ABC):
    slug = ""
    title = ""
    formula_latex = ""
    inputs_schema = []  # list of dicts: {'id': 'a', 'label': 'Coefficient a', 'default': 1, 'type': 'number'}

    @abstractmethod
    def calculate(self, inputs: dict) -> dict:
        """
        Takes input dictionary and returns:
        {
            'success': True/False,
            'result': 'Summary result string',
            'steps': [
                {'step': 1, 'title': '...', 'description': '...', 'latex': '...'},
                ...
            ],
            'calculated_values': {'x1': 3.0, 'x2': 2.0, ...},
            'error': None or error message
        }
        """
        pass
