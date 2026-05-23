import cron from 'node-cron';
import Hearing from '../models/hearing.model.js';
import Case from '../models/case.model.js';
import User from '../models/user.model.js';
import { sendHearingReminderEmail } from '../services/emailService.js';

export const startHearingReminderCron = () => {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron Job] Running hearing reminder cron at 8:00 AM...');
        try {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            
            // Set bounds for the next 24 hours
            const startOfNext24h = new Date(now);
            const endOfNext24h = new Date(tomorrow);

            // Find hearings scheduled in the next 24 hours where reminder is not sent
            const upcomingHearings = await Hearing.find({
                date: { $gte: startOfNext24h, $lte: endOfNext24h },
                reminderSent: false
            }).populate('caseId');

            console.log(`[Cron Job] Found ${upcomingHearings.length} upcoming hearings for reminder.`);

            for (const hearing of upcomingHearings) {
                const caseObj = hearing.caseId;
                if (!caseObj) continue;

                let lawyer = null;
                let judge = null;

                if (caseObj.lawyerId) {
                    lawyer = await User.findById(caseObj.lawyerId).select('email username');
                }
                if (caseObj.judgeId) {
                    judge = await User.findById(caseObj.judgeId).select('email username');
                }

                const success = await sendHearingReminderEmail(hearing, caseObj, lawyer, judge);
                
                if (success) {
                    hearing.reminderSent = true;
                    await hearing.save();
                }
            }
            console.log('[Cron Job] Hearing reminder cron execution completed.');
        } catch (error) {
            console.error('[Cron Job] Error running hearing reminder cron:', error);
        }
    });

    console.log('[Cron Job] Hearing reminder cron scheduled (Daily at 8:00 AM).');
};
