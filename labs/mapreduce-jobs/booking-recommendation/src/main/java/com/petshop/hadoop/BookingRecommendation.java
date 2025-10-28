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
import java.util.List;
import java.util.concurrent.TimeUnit;

public class BookingRecommendation extends Configured implements Tool {

    private static final Log LOG = LogFactory.getLog(BookingRecommendation.class);

    // Mapper: Emite (pet_id, suggested_date, average_frequency_days)
    public static class RecommendationMapper extends Mapper<Object, Text, Text, Text> {
        private Text petId = new Text();
        private Text dateAndFrequency = new Text();

        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            // Formato da linha do Sqoop: 1,2025-04-10 14:00:00.0,30
            String[] fields = value.toString().split(",");
            if (fields.length >= 3) {
                petId.set(fields[0]);
                dateAndFrequency.set(fields[1] + "," + fields[2]);
                context.write(petId, dateAndFrequency);
            }
        }
    }

    // Reducer: Calcula a data sugerida com base na frequência de referência
    public static class RecommendationReducer extends Reducer<Text, Text, Text, Text> {
        private Text result = new Text();
        private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        public void reduce(Text key, Iterable<Text> values, Context context) throws IOException, InterruptedException {
            List<Date> dates = new ArrayList<>();
            long referenceFrequency = 0;

            for (Text val : values) {
                String[] parts = val.toString().split(",");
                try {
                    dates.add(dateFormat.parse(parts[0]));
                    referenceFrequency = Long.parseLong(parts[1]);
                } catch (ParseException | NumberFormatException e) {
                    // Log
                }
            }

            if (dates.isEmpty()) {
                return;
            }

            Collections.sort(dates);
            Date lastAppointment = dates.get(dates.size() - 1);
            
            Date now = new Date();
            Date baseDate = lastAppointment.after(now) ? lastAppointment : now;

            long suggestedDateMillis = baseDate.getTime() + TimeUnit.MILLISECONDS.convert(referenceFrequency, TimeUnit.DAYS);
            Date suggestedDate = new Date(suggestedDateMillis);

            SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd");
            String suggestedDateStr = outputFormat.format(suggestedDate);

            result.set(suggestedDateStr + "," + referenceFrequency);
            context.write(key, result);
        }
    }

    @Override
    public int run(String[] args) throws Exception {
        LOG.info("Iniciando o job BookingRecommendation...");
        if (args.length != 2) {
            LOG.error("Uso: BookingRecommendation <input path> <output path>");
            System.err.println("Usage: BookingRecommendation <input path> <output path>");
            return -1;
        }
        
        String inputPath = args[0];
        String outputPath = args[1];
        LOG.info("Caminho de entrada: " + inputPath);
        LOG.info("Caminho de saída: " + outputPath);

        Configuration conf = getConf();
        Job job = Job.getInstance(conf, "Frequency Recommendation");
        job.setJarByClass(BookingRecommendation.class);
        job.setMapperClass(RecommendationMapper.class);
        // job.setCombinerClass(RecommendationReducer.class);
        job.setReducerClass(RecommendationReducer.class);
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
        int res = ToolRunner.run(new Configuration(), new BookingRecommendation(), args);
        System.exit(res);
    }
}
