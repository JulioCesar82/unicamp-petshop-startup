module.exports = {
    templatePath: process.env.EMAIL_TEMPLATE_PATH || 'src/templates/email-template.html',
    emailSubject: process.env.EMAIL_SUBJECT || 'Novas Recomendações para seu Pet',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM
};