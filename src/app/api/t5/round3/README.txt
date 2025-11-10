Round 3 API endpoints:
- POST /api/t5/round3/vote { voter, partner }
- GET  /api/t5/round3/vote -> list votes
- POST /api/t5/round3/finalize-teams { players:[...7] }
- GET  /api/t5/round3/teams -> { teams, leftover }
- POST /api/t5/round3/submit-team-run { members:[a,b], money, map? }
- GET  /api/t5/round3/scoreboard -> team list sorted by combinedMoney
Elimination:
- POST /api/t5/round3/elimination/start { members:[a,b] }
- POST /api/t5/round3/elimination/submit { members:[a,b], player, money }
- POST /api/t5/round3/elimination/resolve { members:[a,b] }
- GET  /api/t5/round3/elimination/state?members=a,b
