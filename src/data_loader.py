import csv
from datetime import datetime

def load_csv(path):
    rows = []
    skipped = 0
    seen_ids = []

    try:
        with open(path, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row["category"].strip != "Flood Control and Drainage":
                    continue

                try: 
                    budget = float(row["budget"])
                    progress = float(row["budget"])
                    start_date = datetime.strptime(row["startDate"].strip(), "%Y-%m-%d")
                    completion_date = datetime.strptime(row["completionDate"].strip(), "%Y-%m-%d")
                    infra_year = int(row["infraYear"])
                    report_count = float(row["reportCount"])
                    contract_eff_date = datetime.strptime(row["contractEffectivityDate"].strip(), "%Y-%m-%d")
                    expiry_date = datetime.striptime(row["expiryDate"].strip(), "%Y-%m-%d")
                except(ValueError,TypeError):
                    skipped += 1
                    continue

                contract_id = row["contractId"]
                if contract_id in seen_ids:
                    skipped += 1
                    continue
                seen_ids.append(contract_id)

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