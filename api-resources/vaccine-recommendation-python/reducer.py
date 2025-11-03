#!/usr/bin/env python3

import sys
import logging
import os
from datetime import datetime
import math
import calendar

# --- CONFIGURAÇÃO DO LOG ---
# Tenta criar um arquivo de log em um local comum, mas se falhar, continua logando para stderr.
try:
    log_dir = '/tmp/logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    LOG_FILE = os.path.join(log_dir, 'pet_vaccine_recommender.log')
    log_handler = logging.FileHandler(LOG_FILE)
except Exception:
    log_handler = logging.StreamHandler(sys.stderr)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - REDUCER - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[log_handler]
)
# --- FIM DA CONFIGURAÇÃO DO LOG ---

def add_months(source_date, months):
    """Adiciona meses a uma data, lidando com fins de mês (ex: 31 de Jan + 1 mês = 28/29 de Fev)."""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return datetime(year, month, day)

def process_pet_data(pet_id, records):
    logging.info(f"Iniciando Reducer para a chave: {pet_id}")
    
    species = None
    birth_date = None
    applied_vaccines = set()
    processed_vaccines = set()

    all_records_parsed = []
    for record_line in records:
        try:
            fields = record_line.split(',')
            if len(fields) < 11:
                logging.warning(f"Registro para o pet {pet_id} tem campos insuficientes ({len(fields)}). Ignorando: {record_line}")
                continue
            all_records_parsed.append(fields)

            if species is None:
                species = fields[1].strip()
            
            if birth_date is None:
                birth_date = datetime.strptime(fields[2].strip(), "%Y-%m-%d")

            if fields[10].strip().lower() != 'null':
                applied_vaccine = fields[4].strip()
                applied_vaccines.add(applied_vaccine)
        except (ValueError, IndexError) as e:
            logging.error(f"Erro ao parsear registro inicial para o pet {pet_id}: {record_line}. Erro: {e}")
            continue

    if birth_date is None:
        logging.warning(f"Nenhuma data de nascimento válida encontrada para o pet {pet_id}. Ignorando.")
        return

    for fields in all_records_parsed:
        try:
            vaccine_name = fields[4].strip()
            if vaccine_name in processed_vaccines:
                continue
            processed_vaccines.add(vaccine_name)

            if vaccine_name not in applied_vaccines:
                target_species = fields[6].strip()
                if target_species == species or target_species.lower() == 'ambos':
                    first_dose_age_months = float(fields[7].strip())
                    
                    recommendation_date = add_months(birth_date, int(math.ceil(first_dose_age_months)))
                    logging.debug(f"Data de recomendação para '{vaccine_name}': {recommendation_date}")

                    if recommendation_date > datetime.now():
                        description = fields[5].strip()
                        mandatory = fields[9].strip()
                        suggested_date_str = recommendation_date.strftime("%Y-%m-%d")
                        vaccine_reference_id = fields[3].strip()
                        
                        result = f"{vaccine_name},{description},{mandatory},{suggested_date_str},{vaccine_reference_id}"
                        print(f"{pet_id}\t{result}")
                        logging.info(f"Recomendação para {pet_id}: {result}")
        except (ValueError, IndexError) as e:
            logging.error(f"Erro ao processar recomendação para o pet {pet_id}. Registro: {fields}. Erro: {e}")
            continue

current_pet_id = None
pet_records = []

logging.info("Reducer script iniciado.")
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        pet_id, values_str = line.split('\t', 1)
        if current_pet_id and current_pet_id != pet_id:
            process_pet_data(current_pet_id, pet_records)
            pet_records = []
        current_pet_id = pet_id
        pet_records.append(values_str)
    except ValueError:
        logging.warning(f"Linha malformada ignorada (sem tab): {line}")
        continue

if current_pet_id:
    process_pet_data(current_pet_id, pet_records)

logging.info("Reducer script finalizado.")