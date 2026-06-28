package com.padelPlay.scheduler;

import com.padelPlay.service.MatchService;
import com.padelPlay.service.PaiementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchScheduler {

    private final MatchService matchService;
    private final PaiementService paiementService;

    // tourne tous les jours à minuit
    @Scheduled(cron = "0 0 0 * * *")
    public void processExpiredPrivateMatches() {
        log.info("Scheduler started : checking expired private matches...");
        matchService.checkAndConvertExpiredPrivateMatches();
        log.info("Scheduler done : expired private matches processed");
    }

    // tourne tous les jours à minuit cinq (après le premier)
    @Scheduled(cron = "0 5 0 * * *")
    public void processUnpaidReservations() {
        log.info("Scheduler started : checking unpaid reservations...");
        paiementService.checkUnpaidBeforeMatch();
        log.info("Scheduler done : unpaid reservations processed");
    }
}
