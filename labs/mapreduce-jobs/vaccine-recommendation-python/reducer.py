#!/usr/bin/env python3

import sys
from datetime import datetime
from dateutil.relativedelta import relativedelta

def calculate_age_in_months(birth_date_str):
    birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
    today = datetime.now()
    age_in_months = (today.year - birth_date.year) * 12 + today.month - birth_date.month
    return age_in_months

def process_pet_data(pet_id, data):
    species = None
    birth_date_str = None
    applied_vaccines = set()
    all_vaccines = []

    for item in data:
        fields = item.split(',')
        (s, bd, vaccine_ref_id, vaccine_name, desc, target_species, first_dose, booster, mandatory, app_date) = fields
        
        if not species: species = s
        if not birth_date_str: birth_date_str = bd

        all_vaccines.append({
            "vaccine_name": vaccine_name,
            "description": desc,
            "target_species": target_species,
            "first_dose_age_months": float(first_dose),
            "booster_interval_months": float(booster) if booster != 'None' else None,
            "mandatory": mandatory.lower() == 'true'
        })

        if app_date != "NULL":
            applied_vaccines.add(vaccine_name)

    if not birth_date_str:
        return

    age_in_months = calculate_age_in_months(birth_date_str)
    birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")

    recommended_vaccines = []
    for vaccine in all_vaccines:
        if vaccine["vaccine_name"] not in applied_vaccines:
            if (vaccine["target_species"] == species or vaccine["target_species"] == 'Ambos') and vaccine["first_dose_age_months"] <= age_in_months:
                recommended_vaccines.append(vaccine)

    # Remove duplicates
    recommended_vaccines = [dict(t) for t in {tuple(d.items()) for d in recommended_vaccines}]

    for rec in recommended_vaccines:
        suggestion_date = birth_date + relativedelta(months=int(rec['first_dose_age_months']))
        if suggestion_date > datetime.now():
            print(f"{pet_id}\t{rec['vaccine_name']},{rec['description']},{rec['mandatory']},{suggestion_date.strftime('%Y-%m-%d')}")

current_pet_id = None
pet_data = []

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        pet_id, values_str = line.split('\t', 1)

        if current_pet_id and current_pet_id != pet_id:
            process_pet_data(current_pet_id, pet_data)
            pet_data = []

        current_pet_id = pet_id
        pet_data.append(values_str)

    except ValueError:
        sys.stderr.write(f"Skipping malformed input: {line}\n")
        continue

if current_pet_id:
    process_pet_data(current_pet_id, pet_data)
