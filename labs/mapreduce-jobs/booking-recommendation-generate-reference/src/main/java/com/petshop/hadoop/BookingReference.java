package com.petshop.hadoop;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class BookingReference extends Configured implements Tool {

    private static final Log LOG = LogFactory.getLog(BookingReference.class);

    // Mapper: Emite (perfil_pet, pet_id, suggested_date)
    public static class BookingReferenceMapper extends Mapper<Object, Text, Text, Text> {
        private static final Log LOG = LogFactory.getLog(BookingReferenceMapper.class);
        private Text petProfile = new Text();
        private Text petIdAndDate = new Text();

        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            LOG.debug("Processando linha de entrada: '" + value.toString() + "'");
            // Formato da linha do Sqoop: 1,Cão;Golden Retriever;Longo,2025-04-10 14:00:00.0
            String[] fields = value.toString().split(",");
            if (fields.length >= 3) {
                String profile = fields[1];
                String petId = fields[0];
                String date = fields[2];
                
                petProfile.set(profile);
                petIdAndDate.set(petId + "," + date);
                context.write(petProfile, petIdAndDate);
                LOG.debug("Emitindo -> Chave: " + petProfile.toString() + ", Valor: " + petIdAndDate.toString());
            } else {
                LOG.warn("Linha mal formatada ignorada (menos de 3 campos): '" + value.toString() + "'");
            }
        }
    }

    // Reducer: Calcula a frequência média por perfil, removendo outliers
    public static class BookingReferenceReducer extends Reducer<Text, Text, Text, Text> {
        private static final Log LOG = LogFactory.getLog(BookingReferenceReducer.class);
        private Text result = new Text();
        private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
            LOG.info("Iniciando Reducer para o perfil: " + key.toString());
            Map<String, List<Date>> petsByProfile = new HashMap<>();

            // 1. Agrupa as datas por pet_id
            for (Text val : values) {
                String[] parts = val.toString().split(",");
                if (parts.length < 2) {
                    LOG.warn("Valor mal formatado ignorado: '" + val.toString() + "'");
                    continue;
                }
                String petId = parts[0];
                try {
                    Date date = dateFormat.parse(parts[1].trim());
                    petsByProfile.computeIfAbsent(petId, k -> new ArrayList<>()).add(date);
                } catch (ParseException e) {
                    LOG.warn("Não foi possível parsear a data para o perfil " + key.toString() + ". Valor: '" + parts[1] + "'", e);
                }
            }
            LOG.debug("Perfil " + key.toString() + " contém " + petsByProfile.size() + " pets distintos.");

            // 2. Calcula a diferença em dias entre agendamentos para todos os pets do perfil
            List<Long> allDiffs = new ArrayList<>();
            for (List<Date> dates : petsByProfile.values()) {
                if (dates.size() >= 2) {
                    Collections.sort(dates);
                    for (int i = 0; i < dates.size() - 1; i++) {
                        long diffInMillis = dates.get(i + 1).getTime() - dates.get(i).getTime();
                        allDiffs.add(TimeUnit.DAYS.convert(diffInMillis, TimeUnit.MILLISECONDS));
                    }
                }
            }

            if (allDiffs.isEmpty()) {
                LOG.warn("Nenhuma frequência pôde ser calculada para o perfil (sem pets com >= 2 agendamentos): " + key.toString());
                return;
            }

            // 3. Calcula a média e o desvio padrão
            double sum = 0;
            for (Long diff : allDiffs) {
                sum += diff;
            }
            double mean = sum / allDiffs.size();

            double standardDeviation = 0;
            for (Long diff : allDiffs) {
                standardDeviation += Math.pow(diff - mean, 2);
            }
            standardDeviation = Math.sqrt(standardDeviation / allDiffs.size());

            // 4. Filtra outliers (considerando dados dentro de ~95% da distribuição normal)
            double lowerBound = mean - 1.96 * standardDeviation;
            double upperBound = mean + 1.96 * standardDeviation;
            
            List<Long> filteredDiffs = new ArrayList<>();
            for (Long diff : allDiffs) {
                if (diff >= lowerBound && diff <= upperBound) {
                    filteredDiffs.add(diff);
                }
            }
            
            if (filteredDiffs.isEmpty()) {
                LOG.warn("Todos os dados foram considerados outliers para o perfil: " + key.toString() + ". Usando a média original.");
                // Se a filtragem remover todos os dados, fallback para a média original
                result.set(String.valueOf(Math.round(mean)));
                context.write(key, result);
                return;
            }

            // 5. Calcula a média final com os dados filtrados
            double filteredSum = 0;
            for (Long diff : filteredDiffs) {
                filteredSum += diff;
            }
            double finalAverage = filteredSum / filteredDiffs.size();

            result.set(String.valueOf(Math.round(finalAverage)));
            context.write(key, result);
            LOG.info("Resultado final para o perfil " + key.toString() + " -> Frequência Média: " + Math.round(finalAverage) + " dias.");
        }
    }

    @Override
    public int run(String[] args) throws Exception {
        LOG.info("Iniciando o job BookingReference...");
        if (args.length != 2) {
            LOG.error("Argumentos inválidos! Uso: BookingReference <input path> <output path>");
            System.err.println("Usage: BookingReference <input path> <output path>");
            return -1;
        }
        
        String inputPath = args[0];
        String outputPath = args[1];
        LOG.info("Caminho de entrada: " + inputPath);
        LOG.info("Caminho de saída: " + outputPath);

        Configuration conf = getConf();
        Job job = Job.getInstance(conf, "Booking Reference Generation");
        job.setJarByClass(BookingReference.class);
        job.setMapperClass(BookingReferenceMapper.class);
        job.setReducerClass(BookingReferenceReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);
        FileInputFormat.addInputPath(job, new Path(inputPath));
        FileOutputFormat.setOutputPath(job, new Path(outputPath));

        boolean success = job.waitForCompletion(true);
        if (success) {
            LOG.info("Job concluído com sucesso!");
        } else {
            LOG.error("O Job falhou.");
        }
        return success ? 0 : 1;
    }

    public static void main(String[] args) throws Exception {
        int res = ToolRunner.run(new Configuration(), new BookingReference(), args);
        System.exit(res);
    }
}
