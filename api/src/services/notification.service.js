const fs = require('fs');
const path = require('path');

const emailProvider = require('../providers/email');
const { templatePath: emailTemplatePath, subject: emailSubject } = require('../config/email');

const sendEmailAsync = async (tutor, recommendations) => {
    try {
        const templatePath = path.join(__dirname, '..', emailTemplatePath);
        const template = fs.readFileSync(templatePath, 'utf-8');

        const recommendationsHtml = recommendations.map(rec => `<li>${rec.service_name} (Pet: ${rec.pet_name})</li>`).join('');
        const html = template
            .replace('{{tutor_name}}', tutor.name)
            .replace('{{recommendations}}', recommendationsHtml);

        await emailProvider.send({
            to: tutor.email,
            subject: emailSubject,
            html
        });

        console.log(`[EMAIL] E-mail de recomendação enviado para ${tutor.email}`);
    } catch (error) {
        throw new Error(`[EMAIL] Erro ao enviar e-mail para ${tutor.email}:`, error);
    }
};

const sendSMS = (tutor, recommendations) => {
    console.log(`[SMS] Enviando SMS para ${tutor.phone} sobre ${recommendations.length} novas recomendações.`);
    // TODO: Lógica de envio de SMS aqui...
};

const sendPushNotification = (tutor, recommendations) => {
    console.log(`[PUSH] Enviando Push Notification para o tutor ${tutor.name} (ID: ${tutor.tutor_id}) sobre ${recommendations.length} novas recomendações.`);
    // TODO: Lógica de envio de Push Notification aqui...
};

const notifyTutorAsync = async (tutor, recommendations) => {
    await sendEmailAsync(tutor, recommendations);
    sendSMS(tutor, recommendations);
    sendPushNotification(tutor, recommendations);
};

module.exports = {
    notifyTutorAsync
};
