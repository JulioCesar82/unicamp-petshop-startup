#!/usr/bin/env python3

import sys

current_pet_profile = None
current_sum = 0.0

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        pet_profile, value_str = line.split('\t')
        value = float(value_str)
    except ValueError:
        sys.stderr.write(f"Skipping malformed input: {line}\n")
        continue

    if current_pet_profile == pet_profile:
        current_sum += value
    else:
        if current_pet_profile:
            print(f"{current_pet_profile}\t{current_sum}")
        current_pet_profile = pet_profile
        current_sum = value

if current_pet_profile:
    print(f"{current_pet_profile}\t{current_sum}")
