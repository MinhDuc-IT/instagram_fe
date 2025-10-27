import { useState, useEffect, useCallback } from 'react';
import uploadService from '../service/uploadService';
import { JobStatusResponse } from '../types/upload.types';

export const useJobPolling = (jobId: string | null, interval: number = 2000) => {
    const [job, setJob] = useState<JobStatusResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchJobStatus = useCallback(async () => {
        if (!jobId) return;

        try {
            setLoading(true);
            const response = await uploadService.getJobStatus(jobId);
            setJob(response);
            setError(null);

            // Stop polling if completed or failed
            if (response.status === 'completed' || response.status === 'failed') {
                return true; // Signal to stop polling
            }

            return false;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch job status');
            return true; // Stop polling on error
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        if (!jobId) return;

        // Initial fetch
        fetchJobStatus();

        // Set up polling
        const intervalId = setInterval(async () => {
            const shouldStop = await fetchJobStatus();
            if (shouldStop) {
                clearInterval(intervalId);
            }
        }, interval);

        return () => clearInterval(intervalId);
    }, [jobId, interval, fetchJobStatus]);

    return { job, loading, error };
};