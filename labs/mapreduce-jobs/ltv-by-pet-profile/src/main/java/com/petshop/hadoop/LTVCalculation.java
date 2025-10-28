package com.petshop.hadoop;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

import java.io.IOException;

import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;

public class LTVCalculation extends Configured implements Tool {

    private static final Log LOG = LogFactory.getLog(LTVCalculation.class);

    // Mapper: Emite (perfil_pet, valor_compra)
    public static class LTVMapper extends Mapper<Object, Text, Text, DoubleWritable> {
        private static final Log LOG = LogFactory.getLog(LTVMapper.class);
        private Text petProfile = new Text();
        private DoubleWritable purchaseValue = new DoubleWritable();

        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            LOG.debug("Processando linha de entrada: '" + value.toString() + "'");
            // Formato da linha do Sqoop: Cão;Golden;Longo,123.45
            String[] fields = value.toString().split(",");
            if (fields.length == 2) {
                try {
                    petProfile.set(fields[0]);
                    purchaseValue.set(Double.parseDouble(fields[1]));
                    context.write(petProfile, purchaseValue);
                    LOG.debug("Emitindo -> Chave: " + petProfile.toString() + ", Valor: " + purchaseValue.get());
                } catch (NumberFormatException e) {
                    LOG.warn("Não foi possível parsear o valor da compra. Linha ignorada: '" + value.toString() + "'", e);
                }
            } else {
                LOG.warn("Linha mal formatada ignorada (não possui 2 campos): '" + value.toString() + "'");
            }
        }
    }

    // Reducer: Soma os valores por perfil
    public static class LTVReducer extends Reducer<Text, DoubleWritable, Text, DoubleWritable> {
        private static final Log LOG = LogFactory.getLog(LTVReducer.class);
        private DoubleWritable result = new DoubleWritable();

        public void reduce(Text key, Iterable<DoubleWritable> values, Context context) throws IOException, InterruptedException {
            LOG.info("Iniciando Reducer para o perfil: " + key.toString());
            double sum = 0;
            int count = 0;
            for (DoubleWritable val : values) {
                sum += val.get();
                count++;
                LOG.debug("Perfil '" + key.toString() + "': adicionando valor " + val.get() + ". Soma parcial: " + sum);
            }
            result.set(sum);
            context.write(key, result);
            LOG.info("Resultado final para o perfil '" + key.toString() + "': LTV = " + sum + " (agregado de " + count + " registros).");
        }
    }

    @Override
    public int run(String[] args) throws Exception {
        LOG.info("Iniciando job LTVCalculation...");

        if (args.length != 2) {
            LOG.error("Argumentos inválidos! Uso: LTVCalculation <input path> <output path>");
            System.err.println("Uso: LTVCalculation <input path> <output path>");
            return -1;
        }

        LOG.info("Caminho de entrada: " + args[0]);
        LOG.info("Caminho de saída: " + args[1]);

        Configuration conf = getConf();
        Job job = Job.getInstance(conf, "LTV by Pet Profile");
        job.setJarByClass(LTVCalculation.class);
        job.setMapperClass(LTVMapper.class);
        // job.setCombinerClass(LTVReducer.class);
        job.setReducerClass(LTVReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(DoubleWritable.class);
        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        boolean success = job.waitForCompletion(true);

        if (success) {
            LOG.info("Job LTVCalculation concluído com sucesso!");
        } else {
            LOG.error("Job LTVCalculation falhou.");
        }
        return success ? 0 : 1;
    }

    public static void main(String[] args) throws Exception {
        int res = ToolRunner.run(new Configuration(), new LTVCalculation(), args);
        System.exit(res);
    }
}