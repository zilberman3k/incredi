import {MetricsModel} from "~/server/mongoose/metricsModel";

export default defineEventHandler(async (event) => {
    try {
        const latestMetric = await MetricsModel.findOne().sort({ timestamp: -1 });

       return latestMetric
    } catch (error) {
        console.error('Error retrieving latest metric:', error);
        return createError('Error retrieving latest metric')
    }
})
