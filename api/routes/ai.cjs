require('dotenv').config();

const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


router.post('/ask', async (req, res) => {
    const prompt = req.body.prompt;

    try{
        if( prompt === null ){
            throw new Error('Prompt cannot be null');
        }

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
        });
        
        const completion = response.data.choices[0].text;

        return res.status(200).json({
            success: true,
            message: completion,
        });

    } catch ( error ) {
        res.status(500).json({ message: 'Error asking question', error: error });
    }

});

module.exports = router;