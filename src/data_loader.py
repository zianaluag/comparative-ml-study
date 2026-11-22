import csv
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "datasets")


def get_dataset_path():
    for file in os.listdir(DATASET_DIR):
        if file.endswith(".csv"):
            return os.path.join(DATASET_DIR, file)
    return None


def load_csv():
    rows = []
    skipped = 0
    seen_ids = set() # uses a hash table to check for duplicate ids instantly

    # Load file by using get_dataset_path helper by joining the base dir and dataset dir
    path = get_dataset_path()
    if path is None:
        print("No csv file found in dataset folder\n")
        return rows
    
    try:
        with open(path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
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
                    latitude = float(row.get("latitude"))
                    longitude = float(row.get("longitude"))
                except(ValueError,TypeError):
                    skipped += 1
                    continue

                contract_id = row["contractId"]
                if contract_id in seen_ids:
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
    
    except OSError:
        print("Error loading file")

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