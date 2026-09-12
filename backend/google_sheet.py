import requests
import csv
from io import StringIO

# Your Google Sheet ID
SHEET_ID = "1-gcFWicRTsLKV4Fua75Hs-OIB67H4jG2PckJ-ff4M8g"


def get_students_from_sheet():

    # Google Sheets public CSV URL
    url = (
        f"https://docs.google.com/spreadsheets/d/"
        f"{SHEET_ID}/gviz/tq?tqx=out:csv"
    )

    # Get the sheet data
    response = requests.get(url)

    # Stop if Google returns an error
    response.raise_for_status()

    # Convert CSV text into something Python can read
    csv_data = StringIO(response.text)

    # Read the CSV
    reader = csv.DictReader(csv_data)

    # Remove extra spaces from column names
    if reader.fieldnames:
        reader.fieldnames = [
            field.strip() for field in reader.fieldnames
        ]

    print("COLUMN NAMES:", reader.fieldnames)

    students = []

    # Read every row
    for row in reader:

        # Remove spaces from values as well
        cleaned_row = {
            key.strip(): value.strip() if value else ""
            for key, value in row.items()
            if key
        }

        name = cleaned_row.get("Name")
        email = cleaned_row.get("Email id")
        roll_no = cleaned_row.get("Roll no.")

        # Only add rows that have all three details
        if name and email and roll_no:

            students.append({
                "name": name,
                "email": email,
                "roll_no": roll_no
            })

    return students