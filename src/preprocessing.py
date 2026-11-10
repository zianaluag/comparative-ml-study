import data_loader
import random
import math


# Supposed duration of the infrastructure projects before exceeding expiry data
def planned_duration(row):
    return (row["expiryDate"] - row["contractEffectivityDate"]).days


# Delay days checker with 5% tolerance
def is_delayed(row):
    planned = planned_duration(row)
    delay = (row["completionDate"] - row["expiryDate"]).days
    tolerance = planned * 0.05

    return delay > tolerance 


# Checks statuses of projects if terminated and if complete but with inconsistencies
def build_status(row):
    status = row["status"].strip().lower()

    if status == "terminated":
        return 1

    if status == "completed":
        if row["progress"] < 100.0:
            return 1
        
        if is_delayed(row):
            return 1
        return 0

    return None


# Return numerical data from budget, progress, infrastructure year, and the planned duration
def build_num_data(row):
    return[
        row["budget"],
        row["progress"],
        row["infraYear"],
        planned_duration(row),
    ]


# The dataset to be used be the ML model to train data
def build_dataset(rows):
    num_data = []
    statuses = []
    proj_ids = []

    for row in rows:
        status = build_status(row)
        if status is None:
            continue

        duration = planned_duration(row)

        if duration < 0:
            continue

        num_data.append(build_num_data(row))
        statuses.append(status)
        proj_ids.append(row["contractId"])

    return num_data, statuses, proj_ids


# split the data set to train and test data using an 80/20 split
def split_dataset(num_data, status, proj_ids, test_size=0.2):
    combined = list(zip(num_data, status, proj_ids))

    random.shuffle(combined)

    train_size = int(len(combined) * (1 - test_size))
    train_data = combined[:train_size]
    test_data = combined[train_size:]

    num_train = [data[0] for data in train_data]
    status_train = [data[1] for data in train_data]
    id_train = [data[2] for data in train_data]

    num_test = [data[0] for data in test_data]
    status_test = [data[1] for data in test_data]
    id_test = [data[2] for data in test_data]

    return num_train, num_test, status_train, status_test, id_train, id_test


# apply normalization to the numerical statistics
def normalizer(num_stats, means, std_devs):
    normalized = []

    for row in num_stats:
        normalized_row = []

        for i in range(len(row)):
            if std_devs[i] == 0:
                normalized_row.append(0)
            else:
                value = (row[i] - means[i]) /std_devs[i]
                normalized_row.append(value)

        normalized.append(normalized_row)

    return normalized


# calculate mean and standard deviation for normalization
def calc_stats(num_train):
    means = []
    std_devs = []

    for col in zip(*num_train):
        mean = sum(col)/len(col)
        # s^2 = summation of (x - mean)^2 all over n
        variance = sum((value - mean) ** 2 for value in col) / len(col)
        std_dev = math.sqrt(variance)

        means.append(mean)
        std_devs.append(std_dev)

    return means, std_devs


# normalize the numerical data from train and test data
def normalize(num_train, num_test):
    means, std_devs = calc_stats(num_train)

    normalized_num_train = normalizer(num_train, means, std_devs)
    normalized_num_test = normalizer(num_test, means, std_devs)

    return normalized_num_train, normalized_num_test

 
if __name__ == "__main__":
    rows = data_loader.load_csv()

    print(f"Loaded {len(rows)} rows")

    num_data, statuses, proj_ids = build_dataset(rows)

    print(f"Built dataset: {len(num_data)} valid projects")
    print(f"Class 0: {statuses.count(0)}")
    print(f"Class 1: {statuses.count(1)}")

    num_train, num_test, status_train, status_test, id_train, id_test = split_dataset(
        num_data, statuses, proj_ids
    )

    print(f"Training samples: {len(num_train)}")
    print(f"Testing samples: {len(num_test)}")

    normalized_train, normalized_test = normalize(num_train, num_test)

    print("Normalization complete...")
    print(f"Training features: {len(normalized_train)}")
    print(f"Testing features: {len(normalized_test)}")

    print("Sample normalized data:")
    print(normalized_train[0] if normalized_train else "No training data")