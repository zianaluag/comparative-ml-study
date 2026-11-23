import csv
from datetime import datetime
from math import isfinite
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "dpwh_infrastructure_contracts.csv")


def load_csv():
    rows = []
    skipped = 0
    seen_ids = set() # uses a hash table to check for duplicate ids instantly

    try:
        with open(DATASET_PATH, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # DictReader fills missing fields in a short row with None
                if any(value is None for key, value in row.items() if key != "componentCategory"):
                    skipped += 1
                    continue

                # Checks for inconsistencies in data (ie missing data)
                try: 
                    budget = float(row["budget"])
                    progress = float(row["progress"])
                    start_date = datetime.strptime(row["startDate"].strip(), "%Y-%m-%d")
                    raw_comp = row["completionDate"].strip()
                    completion_date = datetime.strptime(raw_comp, "%Y-%m-%d") if raw_comp else None
                    infra_year = int(row["infraYear"])
                    report_count = float(row["reportCount"])
                    contract_eff_date = datetime.strptime(row["contractEffectivityDate"].strip(), "%Y-%m-%d")
                    expiry_date = datetime.strptime(row["expiryDate"].strip(), "%Y-%m-%d")
                    latitude = float(row["latitude"])
                    longitude = float(row["longitude"])
                except (ValueError, TypeError):
                    skipped += 1
                    continue

                numeric_values = (budget, progress, report_count, latitude, longitude)
                if not all(isfinite(value) for value in numeric_values):
                    skipped += 1
                    continue

                contract_id = row["contractId"]
                if not contract_id.strip() or contract_id in seen_ids:
                    skipped += 1
                    continue
                seen_ids.add(contract_id)
                component_cat = (row.get("componentCategory") or "").strip() or "Unknown"
                rows.append({   
                    "contractId": contract_id,
                    "description": row["description"],
                    "category": row["category"],
                    "status": row["status"],
                    "budget": budget,
                    "progress": progress,
                    "region": row["region"],
                    "province": row["province"],
                    "contractor": row["contractor"],
                    "startDate": start_date,
                    "completionDate": completion_date,
                    "infraYear": infra_year,
                    "programName": row["programName"],
                    "sourceOfFunds": row["sourceOfFunds"],
                    "reportCount": report_count,
                    "contractEffectivityDate": contract_eff_date,
                    "expiryDate": expiry_date,
                    "latitude": latitude,
                    "longitude": longitude,
                    "componentCategory": component_cat,
                })
    
    except KeyError as error:
        print(f"Dataset is missing the {error.args[0]} column.")
        return []
    except OSError as error:
        print(f"Error loading {DATASET_PATH}: {error.strerror}")
        return []

    print(f"Loaded {len(rows)} rows, skipped {skipped}")
    return rows


# Turns the columns/headers data from the dataset to one list
def to_columns(rows, cols):
    columns = []

    for col in cols:
        column = []
        for row in rows:
            column.append(row[col])
        columns.append(column)

    return columns
