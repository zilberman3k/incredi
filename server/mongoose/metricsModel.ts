import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  cpu: {
    usage: Number,
    cores: Number
  },
  memory: {
    total: Number,
    used: Number,
    usagePercentage: Number
  },
  disk: [{
    fs: String,
    size: Number,
    used: Number,
    usagePercentage: Number
  }],
  network: {
    rx_sec: Number,
    tx_sec: Number
  }
});

const metricsDB = mongoose.connection.useDb('MetricsDB')
export const MetricsModel = metricsDB.model('Metric', metricsSchema);
