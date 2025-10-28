#!/usr/bin/env python3

import sys

for line in sys.stdin:
    line = line.strip()
    # Input from Sqoop (example):
    # pet_id, species, birth_date, vaccine_reference_id, vaccine_name, description, target_species, first_dose_age_months, booster_interval_months, mandatory, application_date
    fields = line.split(',')
    if len(fields) >= 10:
        pet_id = fields[0].strip()
        species = fields[1].strip()
        birth_date = fields[2].strip()
        vaccine_reference_id = fields[3].strip()
        vaccine_name = fields[4].strip()
        description = fields[5].strip()
        target_species = fields[6].strip()
        first_dose_age_months = fields[7].strip()
        booster_interval_months = fields[8].strip()
        mandatory = fields[9].strip()
        application_date = fields[10].strip() if len(fields) > 10 and fields[10].strip() and fields[10].strip().lower() != 'null' else "NULL"

        # Emit pet_id as key and combined vaccine data as value
        print(f"{pet_id}\t{species},{birth_date},{vaccine_reference_id},{vaccine_name},{description},{target_species},{first_dose_age_months},{booster_interval_months},{mandatory},{application_date}")
