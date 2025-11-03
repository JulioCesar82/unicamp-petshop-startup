#!/usr/bin/env python3

import sys
import logging

# Configuração básica de log para depuração
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - MAPPER - %(levelname)s - %(message)s')

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    fields = line.split(',')
    
    # A consulta SQL tem 11 campos. A verificação deve ser >= 11.
    # O último campo (application_date) pode ser 'null'.
    if len(fields) >= 11:
        pet_id = fields[0].strip()
        # Emite o pet_id como chave e a linha inteira como valor,
        # espelhando o comportamento do mapper Java.
        print(f"{pet_id}\t{line}")
    else:
        logging.warning(f"Linha mal formatada ignorada (campos insuficientes: {len(fields)}): '{line}'")