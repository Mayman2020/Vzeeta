package com.vzeeta.modules.notification.scheduler;

import com.vzeeta.modules.notification.service.AppointmentReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentReminderService appointmentReminderService;

    @Scheduled(cron = "${vzeeta.reminders.cron:0 0 * * * *}")
    public void sendDueReminders() {
        int sent = appointmentReminderService.sendDueReminders();
        if (sent > 0) {
            log.info("Sent {} appointment reminder(s)", sent);
        }
    }
}
