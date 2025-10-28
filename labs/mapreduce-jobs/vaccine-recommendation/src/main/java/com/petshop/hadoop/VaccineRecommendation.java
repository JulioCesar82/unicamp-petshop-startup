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
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;

public class VaccineRecommendation extends Configured implements Tool {

    private static final Log LOG = LogFactory.getLog(VaccineRecommendation.class);

    // Mapper: Emite (pet_id, data{})
    public static class RecommendationMapper extends Mapper<Object, Text, Text, Text> {
        private static final Log LOG = LogFactory.getLog(RecommendationMapper.class);
        private Text petId = new Text();
        private Text data = new Text();

        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            LOG.debug("Processando linha de entrada: '" + value.toString() + "'");
            // Formato da linha do Sqoop: 1,2025-04-10,Bidu,Dog,VacinaX,Descrição da VacinaX,Dog,3.0,Anual,Sim,2025-04-10 14:00:00.0
            String[] fields = value.toString().split(",");
            if (fields.length >= 10) {
                petId.set(fields[0].trim());
                data.set(value.toString());
                context.write(petId, data);
                LOG.debug("Emitindo -> Chave: " + petId.toString() + ", Valor: " + data.toString());
            } else {
                LOG.warn("Linha mal formatada ignorada (menos de 10 campos): '" + value.toString() + "'");
            }
        }
    }

    // Reducer: Calcula a data sugerida
    public static class RecommendationReducer extends Reducer<Text, Text, Text, Text> {
        private static final Log LOG = LogFactory.getLog(RecommendationReducer.class);
        private Text result = new Text();

        public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
            LOG.info("Iniciando Reducer para a chave: " + key.toString());
            
            String species = null;
            Date birthDate = null;
            Set<String> appliedVaccines = new HashSet<>();
            Set<String> processedVaccines = new HashSet<>();

            // Primeira iteração para coletar todos os dados necessários
            List<String> allValues = new ArrayList<>();
            for (Text val : values) {
                allValues.add(val.toString());
                String[] fields = val.toString().split(",");

                if (species == null) {
                    species = fields[1].trim();
                }

                if (birthDate == null) {
                    try {
                        birthDate = new SimpleDateFormat("yyyy-MM-dd").parse(fields[2].trim());
                        LOG.debug("Data de nascimento parseada para " + key.toString() + ": " + birthDate);
                    } catch (ParseException e) {
                        LOG.warn("Não foi possível parsear a data de nascimento para a chave " + key.toString() + ". Valor: '" + fields[2].trim() + "'", e);
                        return; // Não podemos continuar sem a data de nascimento
                    }
                }

                if (fields.length > 10 && !fields[10].trim().equalsIgnoreCase("null")) {
                    String appliedVaccine = fields[4].trim();
                    appliedVaccines.add(appliedVaccine);
                    LOG.debug("Vacina aplicada encontrada para " + key.toString() + ": " + appliedVaccine);
                }
            }

            // Agora que temos todas as vacinas aplicadas, iteramos novamente para recomendação
            for (String val : allValues) {
                String[] fields = val.split(",");
                String vaccineName = fields[4].trim();

                if (processedVaccines.contains(vaccineName)) {
                    continue; // Evita processamento duplicado da mesma vacina
                }
                processedVaccines.add(vaccineName);

                if (!appliedVaccines.contains(vaccineName)) {
                    String targetSpecies = fields[6].trim();
                    if (targetSpecies.equals(species) || targetSpecies.equals("Ambos")) {
                        float firstDoseAgeMonths = Float.parseFloat(fields[7].trim());
                        
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(birthDate);
                        cal.add(Calendar.MONTH, (int) Math.ceil(firstDoseAgeMonths));
                        Date recommendationDate = cal.getTime();
                        LOG.debug("Data de recomendação calculada para vacina '" + vaccineName + "': " + recommendationDate);

                        if (recommendationDate.after(new Date())) {
                            String description = fields[5].trim();
                            String mandatory = fields[9].trim();
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                            String suggestedDate = sdf.format(recommendationDate);

                            result.set(vaccineName + "," + description + "," + mandatory + "," + suggestedDate);
                            context.write(key, result);
                            LOG.info("Recomendação para " + key.toString() + ": " + result.toString());
                        } else {
                            LOG.debug("Recomendação para vacina '" + vaccineName + "' ignorada pois a data já passou.");
                        }
                    }
                    else {
                        LOG.debug("Vacina '" + vaccineName + "' não aplicável para espécie '" + species + "' de " + key.toString() + ", pulando recomendação.");
                    }
                }
                else {
                    LOG.debug("Vacina '" + vaccineName + "' já aplicada para " + key.toString() + ", pulando recomendação.");
                }
            }
        }
    }

    @Override
    public int run(String[] args) throws Exception {
        LOG.info("Iniciando o job VaccineRecommendation...");
        if (args.length != 2) {
            LOG.error("Argumentos inválidos! Uso: VaccineRecommendation <input path> <output path>");
            System.err.println("Usage: VaccineRecommendation <input path> <output path>");
            return -1;
        }

        LOG.info("Caminho de entrada: " + args[0]);
        LOG.info("Caminho de saída: " + args[1]);

        Configuration conf = getConf();
        Job job = Job.getInstance(conf, "Vaccine Recommendation");
        job.setJarByClass(VaccineRecommendation.class);
        job.setMapperClass(RecommendationMapper.class);
        job.setReducerClass(RecommendationReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);
        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        boolean success = job.waitForCompletion(true);
        if (success) {
            LOG.info("Job concluído com sucesso!");
        } else {
            LOG.error("O Job falhou.");
        }
        return success ? 0 : 1;
    }

    public static void main(String[] args) throws Exception {
        int res = ToolRunner.run(new Configuration(), new VaccineRecommendation(), args);
        System.exit(res);
    }
}
