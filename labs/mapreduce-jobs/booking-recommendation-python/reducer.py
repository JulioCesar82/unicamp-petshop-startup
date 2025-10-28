#!/usr/bin/env python3

import sys
from datetime import datetime, timedelta

def calculate_average_frequency(dates):
    if len(dates) < 2:
        return 0
    
    dates.sort()
    diffs = []
    for i in range(len(dates) - 1):
        diff = dates[i+1] - dates[i]
        diffs.append(diff.days)
    
    if not diffs:
        return 0
        
    return sum(diffs) / len(diffs)

for line in sys.stdin:
    line = line.strip()
    pet_id, date_str = line.split('\t')
    
    # Collect all dates for the current pet_id
    dates_for_pet = []
    try:
        dates_for_pet.append(datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S"))
    except ValueError:
        # Handle cases where date format might be slightly different or malformed
        try:
            dates_for_pet.append(datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f"))
        except ValueError:
            sys.stderr.write(f"Skipping malformed date for pet_id {pet_id}: {date_str}\n")
            continue

    # Hadoop streaming groups by key, so we process one pet_id at a time
    # This reducer assumes that all values for a given key are passed together.
    # In a real streaming scenario, you'd need to handle state across multiple calls
    # or use a custom partitioner/combiner if keys are not guaranteed to be grouped.
    # For simplicity, we'll process the first date and assume subsequent dates for the same pet_id
    # would be handled by an in-memory aggregation if this were a true streaming reducer.
    # For this simulation, we'll just use the single date passed.
    
    # To correctly simulate the Java reducer, we need all dates for a pet_id.
    # Since Hadoop Streaming sends one key-value pair per line to the reducer,
    # a simple Python reducer script like this would typically aggregate all values
    # for a key. However, the provided Java reducer processes all dates for a single pet_id
    # at once. To mimic this, we'd need to collect all dates for a pet_id before processing.
    # For a simple streaming setup, this is usually done by sorting the input by key
    # and then processing groups.
    
    # For now, let's assume the input is already grouped by pet_id and sorted.
    # In a real streaming job, the framework handles grouping.
    
    # To make this reducer work correctly with grouped input from Hadoop Streaming,
    # we need to collect all dates for a given pet_id.
    # The standard approach for streaming is to process line by line,
    # and rely on Hadoop to sort and group keys.
    
    # Let's refine this to correctly handle grouped input.
    # The input to the reducer will be:
    # pet_id \t date1
    # pet_id \t date2
    # ...
    # pet_id \t dateN
    
    # We need to collect all dates for a pet_id before calculating.
    # This means the reducer needs to maintain state for the current pet_id.
    
    current_pet_id = None
    current_dates = []

    # The input is already grouped by pet_id due to Hadoop's sort and shuffle phase.
    # We can process it by detecting changes in pet_id.
    
    # This simple reducer processes one line at a time.
    # To get all dates for a pet_id, we need to read all lines for that pet_id.
    # This is typically handled by the Hadoop framework.
    # For a single reducer call for a key, `values` would contain all dates.
    # Since we are reading from stdin line by line, we need to simulate this.
    
    # Let's assume the input is already sorted by pet_id.
    # We'll process groups of lines for the same pet_id.
    
    # This is a common pattern for streaming reducers:
    # Initialize variables for the current key
    # Loop through input lines
    #   If key changes, process previous key's values and reset
    #   Add value to current key's list
    # Process the last key's values after the loop
    
    # However, for a single reducer script, it receives one key and an iterator of values.
    # The `for line in sys.stdin` loop is effectively iterating over the values for a single key
    # if the input is pre-grouped by Hadoop.
    
    # Let's simplify and assume the input to this script is already grouped for one pet_id.
    # If not, the Hadoop Streaming setup needs to ensure proper grouping.
    
    # Re-evaluating the Java reducer: it receives `Text key, Iterable<Text> values`.
    # This means all values for a key are available in the `values` iterable.
    # To replicate this in Python streaming, the `sys.stdin` should effectively provide
    # all values for a single key in a single invocation of the reducer script,
    # or the script needs to handle state across multiple invocations for the same key.
    
    # The most straightforward way for Hadoop Streaming is to have the reducer script
    # process one key and all its values. This means the input to the reducer script
    # would be something like:
    # pet_id \t date1
    # pet_id \t date2
    # ...
    
    # Let's adjust the logic to collect all dates for a pet_id from the input stream
    # before performing calculations, assuming the input is grouped by pet_id.
    
    # This is a common pattern for streaming reducers:
    # current_pet_id = None
    # current_dates = []
    # for line in sys.stdin:
    #     pet_id, date_str = line.strip().split('\t')
    #     if current_pet_id and current_pet_id != pet_id:
    #         # Process previous pet_id's dates
    #         process_pet_dates(current_pet_id, current_dates)
    #         current_dates = []
    #     current_pet_id = pet_id
    #     current_dates.append(datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S"))
    # if current_pet_id:
    #     process_pet_dates(current_pet_id, current_dates)
    
    # However, the `for line in sys.stdin` loop in a Hadoop Streaming reducer
    # typically means it's processing *one* key's values.
    # The framework handles the grouping and calls the reducer script for each unique key.
    # So, `sys.stdin` for a reducer script will contain all lines for a single key.
    
    # Let's assume `sys.stdin` contains all key-value pairs for a single pet_id.
    # Example input to reducer.py:
    # 1\t2025-04-10 14:00:00
    # 1\t2025-05-11 14:00:00
    # 1\t2025-06-12 14:00:00
    
    # So, we need to collect all dates from sys.stdin for the current pet_id.
    
    all_dates_for_current_pet = []
    first_pet_id = None

    # Read all lines for the current pet_id from stdin
    # (Hadoop Streaming ensures all values for a key are piped to one reducer instance)
    for line_from_stdin in sys.stdin:
        line_from_stdin = line_from_stdin.strip()
        if not line_from_stdin:
            continue
        
        parts = line_from_stdin.split('\t')
        if len(parts) != 2:
            sys.stderr.write(f"Skipping malformed reducer input: {line_from_stdin}\n")
            continue
            
        current_pet_id_from_line, date_str_from_line = parts
        
        if first_pet_id is None:
            first_pet_id = current_pet_id_from_line
        
        # Ensure we are processing dates for the same pet_id
        if current_pet_id_from_line != first_pet_id:
            sys.stderr.write(f"Error: Reducer received multiple pet_ids. Expected {first_pet_id}, got {current_pet_id_from_line}\n")
            continue # This should not happen with proper Hadoop grouping

        try:
            all_dates_for_current_pet.append(datetime.strptime(date_str_from_line, "%Y-%m-%d %H:%M:%S"))
        except ValueError:
            try:
                all_dates_for_current_pet.append(datetime.strptime(date_str_from_line, "%Y-%m-%d %H:%M:%S.%f"))
            except ValueError:
                sys.stderr.write(f"Skipping malformed date for pet_id {first_pet_id}: {date_str_from_line}\n")
                continue

    if not all_dates_for_current_pet:
        sys.stderr.write(f"No valid dates found for pet_id {first_pet_id}\n")
    elif len(all_dates_for_current_pet) < 2:
        sys.stderr.write(f"Skipping pet_id {first_pet_id} due to less than 2 valid dates ({len(all_dates_for_current_pet)})\n")
    else:
        avg_freq_days = calculate_average_frequency(all_dates_for_current_pet)
        
        last_appointment = max(all_dates_for_current_pet)
        now = datetime.now()
        
        base_date = last_appointment if last_appointment > now else now
        
        suggested_date = base_date + timedelta(days=avg_freq_days)
        
        print(f"{first_pet_id}\t{suggested_date.strftime('%Y-%m-%d')},{int(avg_freq_days)}")
