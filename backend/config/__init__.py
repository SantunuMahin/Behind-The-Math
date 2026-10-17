# Python 3.14 compatibility patch for Django 5.0 BaseContext.__copy__
# In Python 3.14, copy(super()) returns a super proxy without __dict__,
# causing AttributeError in BaseContext.__copy__.
try:
    import django.template.context as _django_context

    def _safe_base_context_copy(self):
        cls = self.__class__
        duplicate = cls.__new__(cls)
        duplicate.__dict__.update(self.__dict__)
        duplicate.dicts = self.dicts[:]
        return duplicate

    _django_context.BaseContext.__copy__ = _safe_base_context_copy
except Exception:
    pass
