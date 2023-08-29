[![Netlify Status](https://api.netlify.com/api/v1/badges/101397de-a069-4b09-8e45-18d1e8d2a2b4/deploy-status)](https://app.netlify.com/sites/kohlin/deploys)

#vmtipset
website: https://kohlin.info
# poäng 

| poäng | kategori      | maxpoäng |
| ----- | ------------- | -------- |
| 3     | rätt lag      | 144      |
| 4     | rätt resultat | 192      |
| 16x6p | 8-del         | 96       |
| 8x11p | kvartsfinal   | 88       |
| 4x15p | semifinal     | 60       |
| 2x18p | final         | 36       |
| 26    | vinnare       | 26       |
| 15    | brons         | 15       |
| 15    | skytte        | 15       |
|       |    Summa      |      672 |



##  TODO:  

- [x] byt ut de sista matcherna mot att tippa vilka lag som kommer att vinna etc
  - [x] ta bort finalmatcherna när vi hämtar matcher (SQL)
  - [x] hitta en lösning att spara dem från formuläret

- [x] fixa till user bets
- [ ] Byta lösenord
- [x] Räkna ut poäng 
- [x] Strypa tillgången till databasen med requireUserId
- [x] Alltid kolla användaren innan vi gör anrop till supabase
- [x] Hantera fel i DB-anrop med catchboundary
- [ ] FUTURE:  Bets borde vara key-value typ 
  key='gruppspel' value="{matchId, home, away}" men kan också vara 
  key='16del' value=[123,543,45,567]
- [ ] final_bet: Vinnare, bronsmedalj och målkung rättas inte automatiskt


# Notifications
Manuellt:
```
curl \
  -H "Title: Grattis Argentina" \
  -H "Priority: urgent" \
  -H "Tags: soccer," \
  -d "Tack alla som spelat. Slutresultat: 1. Johan 2. Cardigan Daffipuff 3. Jörgen" \
  ntfy.sh/youbet2022
```

# Cron

Schedule:
```
select
  cron.schedule(
    'get-football-scores',
    '*/2 * * * *',
    $$
    select *
  from
  http_get('https://kohlin.info/cron');
    $$
  );
```

Unschedule:
```
SELECT cron.unschedule('get-football-scores');
```





