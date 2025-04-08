import {MetricsModel} from "~/server/mongoose/metricsModel";

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    try {
        const { limit = 100, skip = 0 } = query

        const metrics = await MetricsModel.find()
            .sort({ timestamp: -1 })
            .limit(Number(limit))
            .skip(Number(skip));

        const count = await MetricsModel.countDocuments();

        return {
            metrics,
            total: count,
            limit: Number(limit),
            skip: Number(skip)
        };
    } catch (error) {
        console.error('Error retrieving metrics:', error);
        return createError('Error retrieving metrics')
    }
})
