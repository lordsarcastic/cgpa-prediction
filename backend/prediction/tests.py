import random
from string import ascii_letters
from typing import Callable

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse_lazy

from rest_framework.test import APIClient
from pandas.core.frame import DataFrame


def create_good_dataframe(columns: int, rows: int, column_generator: Callable, cell_generator: Callable,
                          replicate_rows: bool = True) -> DataFrame:
    if columns < 1 or rows < 1:
        return DataFrame({})

    column_names = {
        ''.join(
            column_generator(_)
        ) for _ in range(columns)
    }

    if replicate_rows:
        row_values = [list(map(
            cell_generator,
            range(rows)
        ))] * columns
    else:
        row_values = list(map(
            lambda _: [cell_generator(i) for i in range(rows)],
            range(columns)
        ))

    compiled_dictionary = {}

    for key, value in zip(column_names, row_values):
        compiled_dictionary[key] = value

    return DataFrame(data=compiled_dictionary)


print(create_good_dataframe(
    columns=2,
    rows=7,
    column_generator=lambda _: random.choices(ascii_letters, k=6),
    cell_generator=lambda _: ''.join(random.choices(ascii_letters, k=6))
))


class TrainingModelTestCast(TestCase):
    def setUp(self) -> None:
        self.client = APIClient()

    # def test_valid_excel_file_will_post(self):
    #     excel_dataframe = create_good_dataframe(
    #         columns = 2,
    #         rows = 7,
    #         column_generator = lambda _: random.choices(ascii_letters, k=6),
    #         cell_generator = lambda _: ''.join(random.choices(ascii_letters, k=6))
    #     ).to_excel()

    def test_valid_csv_file_will_post(self):
        csv_dataframe = create_good_dataframe(
            columns=2,
            rows=7,
            column_generator=lambda _: random.choices(ascii_letters, k=6),
            cell_generator=lambda _: ''.join(random.choices(ascii_letters, k=6))
        ).to_csv(mode='w')

        file_object = SimpleUploadedFile('data.csv', csv_dataframe.encode('utf-8'))

        name = random.choices(ascii_letters, k=10)
        response = self.client.post(
            reverse_lazy('prediction:base'),
            {
                "name": name,
                "dataset": file_object
            }
        )

        self.assertEqual(response.status_code, 201)
