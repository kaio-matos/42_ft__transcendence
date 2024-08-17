def TournamentResource(tournament, player):
    accepted = tournament.has_player_accepted(player)
    rejected = tournament.has_player_rejected(player)
    pending = (
        bool(not accepted and not rejected)
        and tournament.status == tournament.Status.AWAITING_CONFIRMATION
    )

    r = {
        "confirmation": {
            "accepted": accepted,
            "rejected": rejected,
            "pending": pending,
        }
    }

    return r | tournament.toDict()
