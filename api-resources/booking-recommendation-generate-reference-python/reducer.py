#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import math
from datetime import datetime
from collections import defaultdict

def main():
    # Dicionário para agrupar as datas por pet_id dentro de cada perfil
    # A chave será o pet_profile (ex: "Cão;Golden Retriever;Longo")
    # O valor será outro dicionário: {pet_id: [datas]}
    pet_dates_by_profile = defaultdict(lambda: defaultdict(list))
    current_profile = None
    
    # Processa a entrada linha por linha
    for line in sys.stdin:
        line = line.strip()
        
        # Tenta dividir a linha em chave (profile) e valor (pet_id,date)
        try:
            profile, value = line.split('\t', 1)
            pet_id, date_str = value.split(',', 1)
        except ValueError:
            # Ignora linhas mal formatadas
            continue

        # Converte a string de data para um objeto datetime
        try:
            # O formato pode ter milissegundos (.0)
            date_obj = datetime.strptime(date_str.split('.')[0], '%Y-%m-%d %H:%M:%S')
        except ValueError:
            continue

        # Se o perfil mudou, processa o perfil anterior
        if current_profile and current_profile != profile:
            process_profile(current_profile, pet_dates_by_profile[current_profile])

            # Limpa o dicionário para o próximo perfil
            pet_dates_by_profile.pop(current_profile)

        current_profile = profile
        pet_dates_by_profile[current_profile][pet_id].append(date_obj)

    # Processa o último perfil
    if current_profile:
        process_profile(current_profile, pet_dates_by_profile[current_profile])

def process_profile(profile, pet_dates):
    """
    Calcula a frequência média para um perfil de pet, removendo outliers.
    """
    all_diffs = []
    
    # 1. Coleta todas as diferenças de dias para o perfil
    for pet_id, dates in pet_dates.items():
        if len(dates) < 2:
            continue
        
        dates.sort()
        
        for i in range(len(dates) - 1):
            time_diff = dates[i+1] - dates[i]
            all_diffs.append(time_diff.days)
            
    if not all_diffs:
        return

    # 2. Calcula média e desvio padrão
    n = len(all_diffs)
    if n == 0:
        return
        
    mean = sum(all_diffs) / float(n)
    
    variance = sum([(x - mean) ** 2 for x in all_diffs]) / float(n)
    std_dev = math.sqrt(variance)

    # 3. Filtra outliers (intervalo de confiança de 95%)
    lower_bound = mean - 1.96 * std_dev
    upper_bound = mean + 1.96 * std_dev
    
    filtered_diffs = [d for d in all_diffs if lower_bound <= d <= upper_bound]
    
    if not filtered_diffs:
        # Fallback para a média original se todos os dados forem outliers
        final_average = mean
    else:
        # 4. Calcula a média final com dados filtrados
        final_average = sum(filtered_diffs) / float(len(filtered_diffs))

    print('%s\t%d' % (profile, int(round(final_average))))

if __name__ == "__main__":
    main()
