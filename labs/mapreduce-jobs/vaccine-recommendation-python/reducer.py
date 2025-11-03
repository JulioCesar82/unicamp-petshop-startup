#!/usr/bin/env python3

import sys
import logging
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta

# -------------------------------
# --- CONFIGURAÇÃO DO LOG 🛠️ ---
# -------------------------------

# Define o nome do arquivo de log, incluindo um subdiretório "logs"
LOG_FILE = '/tmp/logs/pet_vaccine_recommender.log'

# Cria o diretório (e todos os pais necessários) se ele não existir.
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


def calculate_age_in_months(birth_date_str):
    """Calcula a idade em meses a partir da data de nascimento."""
    logger.debug(f"Calculating age for birth date: {birth_date_str}")
    try:
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        today = datetime.now()
        age_in_months = (today.year - birth_date.year) * 12 + today.month - birth_date.month
        logger.debug(f"Age calculated: {age_in_months} months.")
        return age_in_months
    except ValueError as e:
        logger.error(f"Failed to parse birth date '{birth_date_str}': {e}")
        return 0 # Retorna 0 em caso de erro de data

def process_pet_data(pet_id, data):
    """Processa todos os dados de vacinação de um pet para recomendar a próxima vacina."""
    logger.info(f"Processing data for pet_id: {pet_id} with {len(data)} records.")
    species = None
    birth_date_str = None
    applied_vaccines = set()
    all_vaccines = []

    for item in data:
        logger.debug(f"Parsing record item: {item}")
        try:
            fields = item.split(',')
            # Certifique-se de que há 10 campos
            # The full line from the mapper is passed as 'item'
            # Example: 1,Dog,2025-04-10,Bidu,VacinaX,Descrição da VacinaX,Dog,3.0,Anual,Sim,2025-04-10 14:00:00.0
            fields = item.split(',')

            # Check for minimum required fields (10 for all vaccine info, 11 if app_date is present)
            if len(fields) < 10:
                 logger.warning(f"Skipping record with insufficient number of fields ({len(fields)} < 10): {item}")
                 continue

            # Extract fields based on Java's interpretation of the full line
            # Note: pet_id (fields[0]) is already handled as the key
            current_species = fields[1].strip()
            current_birth_date_str = fields[2].strip()
            vaccine_name = fields[4].strip()
            description = fields[5].strip()
            target_species = fields[6].strip()
            first_dose_age_months = float(fields[7].strip())
            booster_interval_str = fields[8].strip()
            mandatory_str = fields[9].strip()
            
            app_date = "NULL" # Default if not present
            if len(fields) > 10:
                app_date = fields[10].strip()

            if not species: species = current_species
            if not birth_date_str: birth_date_str = current_birth_date_str

            all_vaccines.append({
                "vaccine_name": vaccine_name,
                "description": description,
                "target_species": target_species,
                "first_dose_age_months": float(first_dose_age_months),
                "booster_interval_months": float(booster_interval_str) if booster_interval_str not in ('None', 'null') else None,
                "mandatory": mandatory_str.lower() == 'true'
            })

            if app_date.upper() != "NULL":
                applied_vaccines.add(vaccine_name)
                logger.debug(f"Vaccine '{vaccine_name}' recorded as applied on {app_date}.")
        except (ValueError, IndexError, TypeError) as e:
            logger.error(f"Skipping malformed vaccine data: {item}. Error: {e}")
            continue

    if not birth_date_str:
        logger.warning(f"No birth date found for pet_id {pet_id}. Skipping processing.")
        return

    age_in_months = calculate_age_in_months(birth_date_str)
    birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
    logger.debug(f"Pet {pet_id} species: {species}, birth date: {birth_date_str}, age: {age_in_months} months.")

    recommended_vaccines = []
    for vaccine in all_vaccines:
        if vaccine["vaccine_name"] not in applied_vaccines:
            is_target_species = vaccine["target_species"] == species or vaccine["target_species"].lower() == 'ambos'
            is_age_appropriate = vaccine["first_dose_age_months"] <= age_in_months
            
            if is_target_species and is_age_appropriate:
                recommended_vaccines.append(vaccine)
                logger.debug(f"Potential recommendation: {vaccine['vaccine_name']}")

    # Remove duplicates
    recommended_vaccines = [dict(t) for t in {tuple(sorted(d.items())) for d in recommended_vaccines}]

    for rec in recommended_vaccines:
        suggestion_date = birth_date + relativedelta(months=int(rec['first_dose_age_months']))
        
        # Só sugere se a data de sugestão ainda não passou
        if suggestion_date > datetime.now():
            output_line = f"{pet_id}\t{rec['vaccine_name']},{rec['description']},{rec['mandatory']},{suggestion_date.strftime('%Y-%m-%d')}"
            print(output_line)
            logger.debug(f"Emitted recommendation for {pet_id}: {output_line}")
        else:
            logger.debug(f"Skipping recommendation for {rec['vaccine_name']} (Pet {pet_id}): Suggestion date {suggestion_date.strftime('%Y-%m-%d')} is in the past.")

current_pet_id = None
pet_data = []

logger.debug("Reducer script started (Vaccine Recommender).")

for line in sys.stdin:
    line = line.strip()
    if not line:
        logger.debug("Empty line received.")
        continue

    try:
        # Divide a linha no primeiro tab para separar o pet_id do restante dos valores
        pet_id, values_str = line.split('\t', 1)
        logger.debug(f"Processing line: pet_id={pet_id}, values_str={values_str[:30]}...")

        if current_pet_id and current_pet_id != pet_id:
            # Novo pet_id, processa o anterior
            logger.warning(f"Key change detected. Processing previous pet_id: {current_pet_id}")
            process_pet_data(current_pet_id, pet_data)
            
            # Reinicia para o novo pet_id
            pet_data = []
            logger.debug(f"Resetting for new pet_id: {pet_id}")

        current_pet_id = pet_id
        pet_data.append(values_str)
        logger.debug(f"Collected record for {current_pet_id}. Total records: {len(pet_data)}")

    except ValueError:
        logger.error(f"Skipping malformed input (no tab separator): {line}")
        continue

# Processa o último pet_id após o loop terminar
logger.debug(f"End of stdin loop. Processing last pet_id: {current_pet_id}")
if current_pet_id:
    process_pet_data(current_pet_id, pet_data)

logger.debug("Reducer script finished.")