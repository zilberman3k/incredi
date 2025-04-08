import {MetricsModel} from "~/server/mongoose/metricsModel";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    try {
        const metrics = Array.isArray(body) ? body : [body];

        const savedMetrics = await MetricsModel.insertMany(metrics);
        return {
            message: `${savedMetrics.length} metrics saved`,
            count: savedMetrics.length
        }
    } catch (error) {
        console.error('Error saving metrics:', error);
        return createError('Error saving metrics:')
    }
})
