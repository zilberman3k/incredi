import {MetricsModel} from "~/server/mongoose/metricsModel";

export default defineEventHandler(async(event) => {
    const model = new MetricsModel({
        "timestamp": "2025-04-08T12:34:56.789Z",
        "cpu": {
            "usage": 45.5,
            "cores": 8
        },
        "memory": {
            "total": 16384,
            "used": 8192,
            "usagePercentage": 50.0
        },
        "disk": [
            {
                "fs": "/dev/sda1",
                "size": 512000,
                "used": 256000,
                "usagePercentage": 50.0
            },
            {
                "fs": "/dev/sdb1",
                "size": 1024000,
                "used": 512000,
                "usagePercentage": 50.0
            }
        ],
        "network": {
            "rx_sec": 12500,
            "tx_sec": 8400
        }
    })
    await model.save()
    return model
})
