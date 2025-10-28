#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys

def main():
    # A entrada vem do STDIN (padrão do Hadoop Streaming)
    for line in sys.stdin:
        # Remove espaços em branco no início e no fim
        line = line.strip()
        # Divide a linha em campos com base na vírgula
        fields = line.split(',')
        
        # Formato esperado: pet_id,pet_profile,booking_date
        # Ex: 1,Cão;Golden Retriever;Longo,2025-04-10 14:00:00.0
        if len(fields) >= 3:
            pet_id = fields[0]
            pet_profile = fields[1]
            booking_date = fields[2]
            
            # A chave é o perfil do pet
            # O valor é o ID do pet e a data do agendamento, separados por vírgula
            # Saída: "Cão;Golden Retriever;Longo\t1,2025-04-10 14:00:00.0"
            print('%s\t%s,%s' % (pet_profile, pet_id, booking_date))

if __name__ == "__main__":
    main()
