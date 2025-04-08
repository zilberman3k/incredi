import express from 'express';
import si from 'systeminformation';
import os from 'os';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// Configuration
const COLLECTION_INTERVAL_MS = 5000; // Collect every 5 seconds
const SEND_INTERVAL_MS = 30000;      // Send every 30 seconds
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

// Store metrics temporarily
let metricsBuffer = [];

// Collect system metrics
async function collectMetrics() {
    try {
        // CPU usage
        const cpuData = await si.currentLoad();

        // Memory usage
        const memData = await si.mem();

        // Disk usage
        const diskData = await si.fsSize();

        // Network stats
        const networkStats = await si.networkStats();

        const metrics = {
            timestamp: new Date(),
            cpu: {
                usage: cpuData.currentLoad,
                cores: os.cpus().length
            },
            memory: {
                total: memData.total,
                used: memData.used,
                usagePercentage: (memData.used / memData.total) * 100
            },
            disk: diskData.map(disk => ({
                fs: disk.fs,
                size: disk.size,
                used: disk.used,
                usagePercentage: (disk.used / disk.size) * 100
            })),
            network: {
                rx_sec: networkStats.reduce((sum, iface) => sum + iface.rx_sec, 0),
                tx_sec: networkStats.reduce((sum, iface) => sum + iface.tx_sec, 0)
            }
        };

        metricsBuffer.push(metrics);
        console.log('Metrics collected:', JSON.stringify(metrics, null, 2));

        return metrics;
    } catch (error) {
        console.error('Error collecting metrics:', error);
        throw error;
    }
}

// Send metrics to cloud with retry
async function sendMetricsWithRetry(metrics, attempt = 1) {
    try {
        const response = await axios.post(`${API_URL}/metrics`, metrics, {
            auth: {
                username: 'admin',
                password: process.env.AUTH_PASSWORD || 'password'
            }
        });

        console.log('Metrics sent successfully:', response.status);
        return response;
    } catch (error) {
        console.error(`Error sending metrics (attempt ${attempt}/${RETRY_ATTEMPTS}):`, error.message);

        if (attempt < RETRY_ATTEMPTS) {
            console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            return sendMetricsWithRetry(metrics, attempt + 1);
        } else {
            console.error('Maximum retry attempts reached. Failed to send metrics.');
            throw error;
        }
    }
}

// Function to send buffered metrics
async function sendBufferedMetrics() {
    if (metricsBuffer.length === 0) {
        console.log('No metrics to send');
        return;
    }

    const metricsToSend = [...metricsBuffer];
    metricsBuffer = [];

    try {
        await sendMetricsWithRetry(metricsToSend);
    } catch (error) {
        console.error('Failed to send metrics after all retries:', error);
        // Add back to the buffer for next attempt
        metricsBuffer = [...metricsToSend, ...metricsBuffer];
    }
}

// Start collection and sending intervals
setInterval(collectMetrics, COLLECTION_INTERVAL_MS);
setInterval(sendBufferedMetrics, SEND_INTERVAL_MS);

// API endpoints for local debugging
app.get('/api/latest-metrics',  async (req, res) => {
    try {
        const metrics = await collectMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Local agent running on http://localhost:${PORT}`);
});
