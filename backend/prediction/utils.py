from typing import List

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from Learning.utils import ALLOWED_EXTENSIONS

def arrayfy_strings(columns_string):
    """
    Parses tag input, with multiple word input being activated and
    delineated by commas and double quotes. Quotes take precedence, so
    they may contain commas.
    Returns a sorted list of unique tag names.
    Ported from Jonathan Buchanan's `django-tagging
    <http://django-tagging.googlecode.com/>`_
    """
    if not columns_string:
        return []

    # Special case - if there are no commas or double quotes in the
    # input, we don't *do* a recall... I mean, we know we only need to
    # split on spaces.
    if "," not in columns_string and '"' not in columns_string:
        words = list(set(split_strip(columns_string, " ")))
        words.sort()
        return words

    words = []
    buffer = []
    # Defer splitting of non-quoted sections until we know if there are
    # any unquoted commas.
    to_be_split = []
    saw_loose_comma = False
    open_quote = False
    i = iter(columns_string)
    try:
        while True:
            c = next(i)
            if c == '"':
                if buffer:
                    to_be_split.append("".join(buffer))
                    buffer = []
                # Find the matching quote
                open_quote = True
                c = next(i)
                while c != '"':
                    buffer.append(c)
                    c = next(i)
                if buffer:
                    word = "".join(buffer).strip()
                    if word:
                        words.append(word)
                    buffer = []
                open_quote = False
            else:
                if not saw_loose_comma and c == ",":
                    saw_loose_comma = True
                buffer.append(c)
    except StopIteration:
        # If we were parsing an open quote which was never closed treat
        # the buffer as unquoted.
        if buffer:
            if open_quote and "," in buffer:
                saw_loose_comma = True
            to_be_split.append("".join(buffer))
    if to_be_split:
        if saw_loose_comma:
            delimiter = ","
        else:
            delimiter = " "
        for chunk in to_be_split:
            words.extend(split_strip(chunk, delimiter))
    words = list(set(words))
    words.sort()
    return words


def split_strip(string, delimiter=","):
    """
    Splits ``string`` on ``delimiter``, stripping each resulting string
    and returning a list of non-empty strings.
    Ported from Jonathan Buchanan's `django-tagging
    <http://django-tagging.googlecode.com/>`_
    """
    if not string:
        return []

    words = [w.strip() for w in string.split(delimiter)]
    return [w for w in words if w]

def stringify_array(feature_columns: List[str]) -> str:
    return str(feature_columns)


def clean_array(array: List) -> List:
    """
    :param array: an array of values of different types
    :return: an array containing truthy values in `array`
    """

    return list(filter(bool, array))

def validate_dataset(value):
        extension = value.name.split('.')[-1]
        if extension not in ALLOWED_EXTENSIONS:
            raise ValidationError(_(f'Expected file with extension: {ALLOWED_EXTENSIONS}, found file type of {extension}'))
        
def validate_feature_columns(value):
    try:
        arrayfy_strings(value)
    except:
        raise ValidationError(_('Columns are not valid as an array. Ensure input is a string of comma-separated values'))

def remove_chars_from_string(string: str, chars: List, replacement: str=None) -> str:
    if replacement:
        result = "".join(map(lambda char: replacement if char in chars else char, string))
    else:
        result = "".join(filter(lambda char: char not in chars, string))

    return result
