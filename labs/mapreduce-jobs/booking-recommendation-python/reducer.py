#!/usr/bin/env python3

import sys
import logging
import os
from datetime import datetime, timedelta

# --- CONFIGURAÇÃO DO LOG ---
# Define o nome do arquivo de log, incluindo um subdiretório "logs"
# O script criará este diretório se ele não existir.
LOG_FILE = '/tmp/logs/pet_frequency_reducer.log'

# Cria o diretório (e todos os pais necessários) se ele não existir.
# O bloco try/except garante que o script não falhe se a criação 
# do diretório falhar (ex: problemas de permissão).
try:
    log_dir = os.path.dirname(LOG_FILE)
    # Verifica se há um caminho de diretório (não apenas o nome do arquivo)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
except Exception as e:
    # Se a criação falhar, reporta o erro para o stderr e tenta
    # mudar o LOG_FILE para o diretório atual para evitar falha total.
    sys.stderr.write(f"ERROR: Falha ao criar o diretório de log ({log_dir}). Verifique as permissões. Erro: {e}\n")
    LOG_FILE = os.path.basename(LOG_FILE) # Retorna para o nome base no diretório atual
    
# Configura o logger
logging.basicConfig(
    level=logging.DEBUG, # Captura todos os níveis (DEBUG e acima)
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    filename=LOG_FILE, # Redireciona o output para o arquivo
    filemode='a' # Anexa ao arquivo se ele já existir
)

# Cria um logger para uso no script
logger = logging.getLogger(__name__)
# --- FIM DA CONFIGURAÇÃO DO LOG ---


def calculate_average_frequency(dates):
    """Calcula a frequência média em dias entre as datas fornecidas."""
    logger.debug(f"calculate_average_frequency received dates: {dates}")
    
    if len(dates) < 2:
        logger.debug(f"Less than 2 dates, returning 0. Dates count: {len(dates)}")
        return 0
    
    dates.sort()
    logger.debug(f"Sorted dates: {dates}")
    diffs = []
    for i in range(len(dates) - 1):
        diff = dates[i+1] - dates[i]
        diffs.append(diff.days)
    
    logger.debug(f"Date differences (days): {diffs}")
    if not diffs:
        logger.debug(f"No differences, returning 0.")
        return 0
        
    avg_diff = sum(diffs) / len(diffs)
    logger.debug(f"Average frequency (days): {avg_diff}")
    return avg_diff

current_pet_id = None
dates_for_current_pet = []

logger.debug("Reducer script started.")

for line in sys.stdin:
    line = line.strip()
    if not line:
        logger.debug("Empty line received.")
        continue
    else:
        logger.debug(f"Processing line: {line}")
    
    parts = line.split('\t')
    if len(parts) != 2:
        logger.debug(f"Skipping malformed reducer input: {line}")
        continue
        
    pet_id, date_and_freq_str = parts
    logger.debug(f"Received line - pet_id: {pet_id}, date_and_freq_str: {date_and_freq_str}")

    # Split date_and_freq_str into date_str and frequency_str
    date_parts = date_and_freq_str.split(',')
    if len(date_parts) != 2:
        logger.error(f"Skipping malformed date_and_freq_str for pet_id {pet_id}: {date_and_freq_str}")
        continue
    
    date_str = date_parts[0]
    frequency_str = date_parts[1]

    if current_pet_id is None:
        current_pet_id = pet_id
        logger.debug(f"Initializing current_pet_id to {current_pet_id}")
    
    if current_pet_id == pet_id:
        # Same pet_id, collect the date
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            dates_for_current_pet.append(parsed_date)
            logger.debug(f"Successfully parsed date {date_str} for {pet_id}. dates_for_current_pet: {dates_for_current_pet}")
        except ValueError:
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f")
                dates_for_current_pet.append(parsed_date)
                logger.debug(f"Successfully parsed date {date_str} (with microseconds) for {pet_id}. dates_for_current_pet: {dates_for_current_pet}")
            except ValueError:
                logger.error(f"Skipping malformed date for pet_id {pet_id}: {date_str}")
                continue
    else:
        # Process the previous pet_id's dates
        logger.warning(f"Key change detected within a single reducer invocation. Previous pet_id: {current_pet_id}, New pet_id: {pet_id}. This is unexpected in standard streaming behavior.")
        
        if len(dates_for_current_pet) >= 2:
            avg_freq_days = calculate_average_frequency(dates_for_current_pet)
            last_appointment = max(dates_for_current_pet)
            now = datetime.now()
            
            # Determine base date for next appointment calculation
            base_date = last_appointment if last_appointment > now else now
            
            suggested_date = base_date + timedelta(days=avg_freq_days)
            
            print(f"{current_pet_id}\t{suggested_date.strftime('%Y-%m-%d')},{int(avg_freq_days)}")
            logger.debug(f"Emitted output for previous pet_id {current_pet_id}: {suggested_date.strftime('%Y-%m-%d')},{int(avg_freq_days)}")
        else:
            logger.debug(f"Skipping previous pet_id {current_pet_id} due to less than 2 valid dates ({len(dates_for_current_pet)})")
        
        # Reset for the new pet_id
        current_pet_id = pet_id
        dates_for_current_pet = []
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            dates_for_current_pet.append(parsed_date)
            logger.debug(f"Started collecting for new pet_id {current_pet_id}. dates_for_current_pet: {dates_for_current_pet}")
        except ValueError:
            try:
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f")
                dates_for_current_pet.append(parsed_date)
                logger.debug(f"Started collecting for new pet_id {current_pet_id} (with microseconds). dates_for_current_pet: {dates_for_current_pet}")
            except ValueError:
                logger.error(f"Skipping malformed date for new pet_id {pet_id}: {date_str}")
                continue

# Process the last pet_id after the loop finishes
logger.debug(f"End of stdin loop. Processing last pet_id: {current_pet_id}")
if current_pet_id is not None:
    if len(dates_for_current_pet) >= 2:
        avg_freq_days = calculate_average_frequency(dates_for_current_pet)
        last_appointment = max(dates_for_current_pet)
        now = datetime.now()
        
        base_date = last_appointment if last_appointment > now else now
        
        suggested_date = base_date + timedelta(days=avg_freq_days)
        
        print(f"{current_pet_id}\t{suggested_date.strftime('%Y-%m-%d')},{int(avg_freq_days)}")
        logger.debug(f"Emitted final output for pet_id {current_pet_id}: {suggested_date.strftime('%Y-%m-%d')},{int(avg_freq_days)}")
    else:
        logger.debug(f"Skipping final pet_id {current_pet_id} due to less than 2 valid dates ({len(dates_for_current_pet)})")

logger.debug("Reducer script finished.")
