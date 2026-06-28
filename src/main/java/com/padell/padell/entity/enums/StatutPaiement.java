package com.padell.padell.entity.enums;

public enum StatutPaiement {
    EN_ATTENTE,   // paiement pas encore effectué
    PAYE,         // paiement confirmé
    REMBOURSE,    // remboursé après annulation d'une réservation déjà payée
    ANNULE        // annulé suite à l'annulation d'une réservation non payée
}