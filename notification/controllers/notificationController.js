const { 
    sendDynamicEmailNotification,
    processListingCreatedEvent 
} = require('../services/notificationService');

// Repurpose the sendEmail function to use sendDynamicEmailNotification
const sendEmail = async (req, res) => {
    try {
        const { email, subject, text } = req.body;
        const response = await sendDynamicEmailNotification(email, subject, text);
        res.status(200).send({ status: 'success', messageId: response.id });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
};

const sendDynamicEmail = async (req, res) => {
    try {
        const { userId } = req.params;
        const { subject, text } = req.body;
        
        const response = await sendDynamicEmailNotification(userId, subject, text);
        res.status(200).send({ 
            status: 'success', 
            message: `Email sent to user ${userId}`,
            messageId: response.id
        });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
};

const healthCheck = (req, res) => {
    res.status(200).send({ status: 'UP', service: 'notification' });
};

module.exports = {
    sendEmail,
    sendDynamicEmail,
    healthCheck
};
