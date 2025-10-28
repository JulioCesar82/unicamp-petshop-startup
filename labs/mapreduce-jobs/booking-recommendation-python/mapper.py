#!/usr/bin/env python3

import sys

for line in sys.stdin:
    line = line.strip()
    fields = line.split(',')
    if len(fields) >= 3:
        pet_id = fields[0]
        appointment_date = fields[2].strip()
        print(f"{pet_id}\t{appointment_date}")
