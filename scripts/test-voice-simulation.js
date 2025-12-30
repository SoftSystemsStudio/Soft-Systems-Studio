const WebSocket = require('ws');

// Connect to the local Voice Receptionist
const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', () => {
    console.log('Connected to Voice Receptionist');

    // 1. Send Setup Message
    // This simulates Twilio connecting
    ws.send(JSON.stringify({
        type: 'setup',
        callSid: 'CA_TEST_SIMULATION_' + Date.now(),
        streamSid: 'MX_TEST_STREAM',
        from: '+15550000000',
        lang: 'en-US'
    }));
});

ws.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('Received:', msg);

    // 2. Wait for Greeting, then send User Prompt
    if (msg.type === 'text' && msg.token.includes('help')) {
        console.log('Greeting received. Sending user prompt...');

        setTimeout(() => {
            ws.send(JSON.stringify({
                type: 'prompt',
                voicePrompt: 'I need to schedule an appointment for a pregnancy checkup.',
                lang: 'en-US'
            }));
        }, 1000);
    }

    // 3. Wait for AI Response
    if (msg.type === 'text' && (msg.token.includes('certainly') || msg.token.includes('schedule'))) {
        console.log('AI Response received. Interaction successful.');
        console.log('Closing connection to trigger Intake Webhook...');
        ws.close();
    }
});

ws.on('close', () => {
    console.log('Connection closed.');
});

ws.on('error', (err) => {
    console.error('WS Error:', err);
});
