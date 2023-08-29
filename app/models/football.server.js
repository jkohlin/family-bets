import { supabase } from './user.server'
import { groupBy, objectFromArray } from '../utils/utils'
import { diff } from 'just-diff'
import compare from 'just-compare'
const matchesEndpoint = 'matches'
const betsEndpoint = 'bets'
const finalBetsEndpoint = 'final_bets'


/* -------------------------------------------------------------------------- */
/*                   Hämta och spara BETS
/* -------------------------------------------------------------------------- */

export const saveBets = async (bets) => {
    try {
        const { data, error } = await supabase.from(betsEndpoint).insert(bets, { upsert: true, onConflict: 'match_id, user_id', ignoreDuplicates: false }).select()
        console.log('saveBets error', error)
        if (error?.code) {
            throw new Error(error?.message)
        }
        return data
    } catch (error) {
        console.log('SaveBets catch', error)
        throw new Response('Ajdå, det blev knas... Servern säger detta:' + error, {
            status: 500,
        })
    }
}
export const saveFinalBets = async (bets) => {
    try {
        const { data, error } = await supabase.from(finalBetsEndpoint).insert(bets, { upsert: true, onConflict: 'user_id, key', ignoreDuplicates: false }).select()
        if (error?.code) {
            throw new Error(error.message, {
                status: 500,
            })
        }
        return data

    } catch (error) {
        console.log('catch error', error)
        throw new Response('NAJ! det gick inte att spara dina bets :( ', {
            status: 500,
        })
    }
}
export const getBetsForUser = async (user) => {
    try {
        const { data, error } = await supabase
            .from(matchesEndpoint)
            .select(`*, away_team:away_team_id(*), home_team:home_team_id(*), bets:${betsEndpoint}!left(away_score, home_score, win, results)`)
            .eq(`${betsEndpoint}.user_id`, user.userId)
            .eq('stage', 'GROUP_STAGE')
            .order('date', { ascending: true })
        if (error?.code) {
            console.log('getBetsForUser error', error)
            throw new Error('getBetsForUser lyckades inte hämta dina bets. Supabase: ' + error.message)
        }
        return data

    } catch (error) {
        throw new Response('NAJ! det gick inte att hämta dina bets. log: ' + error, {
            status: 500
        })
    }
}
/**
 * Description: Hämtar de sista betsen, där man väljer vilka lag som går vidare etc
 * @param {Object} user {userId: string}
 * @returns {Promise<Array>} JSON [{id: number, user_id: string, key: string, value: string}]
 * @example
 * return value:
[
  {
    id: 1,
    user_id: '0a8bf37d-e093-4541-ba7d-403c2801b0d2',
    key: '8',
    value: [ 764, 781 ]
  }
]
 
 */
export const getFinalBetsForUser = async (user) => {
    try {
        const { data, error } = await supabase
            .from(finalBetsEndpoint)
            .select('user_id, key, value, score')
            .eq('user_id', user.userId)

        if (error?.code) {
            console.log('getFinalBetsForUser error', error)
            throw new Error(error.message)
        }

        return data.reduce((acc, item) => {
            acc[item.key] = { value: item.value, id: item.id, user_id: item.user_id, score: item.score }
            return acc
        }, {})

    } catch (error) {
        throw new Response('NAJ! det gick inte att hämta dina bets :( ', {
        })
    }
}

export const leaderboard = async () => {
    try {
        // const { data: bets, error } = await supabase
        //     .from('bets')
        //     .select('user_id, win, results, name:user_id(name), final_score:user_id!final_bets(score)')
        //     .eq('accounted', true)
        // const users = bets.reduce((acc, { user_id, win, results, name }) => {
        //     if (!acc[user_id]) {
        //         acc[user_id] = { ...name, user_id, score: 0 }
        //     }
        //     acc[user_id].score += win + results
        //     return acc
        // }, {})
        // const usersArray = Object.values(users)
        const { data, error } = await supabase
            .from('summarized_score')
            .select('*')

        if (error) throw new Error('leaderboard: ' + error.message)
        const users = data.reduce((acc, { user_id, bet_score, final_score, name }) => {
            if (isNaN(bet_score) || isNaN(final_score)) return acc
            return [...acc, { score: bet_score + final_score, user_id, name }]
        }, [])
        users.sort((a, b) => {
            return b.score - a.score
        })
        return users

    } catch (error) {
        throw new Response('NAJ! det gick inte att hämta leaderboard :( ', {
        })
    }
}

/* -------------------------------------------------------------------------- */
/*                   Hämta data från football-data.org
/* -------------------------------------------------------------------------- */

/**
 * Description: Hämtar data från football-data.org eller databasen
 * @param {string} endpoint Om fromDB,  en tabell ('teams'), annars API-endpoint till football-data.org
 * @param {Boolean} forSelect=false Om true, returnerar en array med objekr som har value och label
 * @param {Boolean} fromDB=false Om true, hämtar data från databasen
 * @returns {Promise<Array>}
 */
export const getFootballDataFromREST = async (endpoint) => {
    const url = `https://api.football-data.org/v4/${endpoint}` // `https://api.football-data.org/v4/competitions/2000/matches
    try {
        const response = await fetch(url, {
            headers: {
                'X-Auth-Token': process.env.FOOTBALL_KEY,
            },
        }).catch((error) => {
            console.log('getFootballData fetch error', error)
            throw new Error('getFootballData lyckades inte hämta data från football-data.org')
        })
        const res = await response.json()
        return res

    } catch (error) {
        console.log('getFootballData try/catch error', error)
        throw new Response(error, { status: 500, })
    }

}
export const getFootballData = async (endpoint, forSelect = false) => {
    let columns = '*'
    let order = 'name'
    // DEBUG:  Ta bort senare. Varför?
    if (endpoint === matchesEndpoint) {
        columns = 'competition_id, date, status, stage, group, away_team_id, home_team_id, away_score, home_score, winner, id, accounted'
        order = 'date'
    }
    try {
        let { data, error } = endpoint === matchesEndpoint
            ? await supabase.from(endpoint).select(columns).eq('stage', 'GROUP_STAGE').order(order, { ascending: true })
            : await supabase.from(endpoint).select(columns).order(order, { ascending: true })
        if (error) {
            console.log(`getFootballData ${endpoint}`, error)
            throw new Error('getFootballData lyckades inte hämta data från databasen')
        }

        if (forSelect) {
            return data.map((item) => {
                return {
                    value: item.id,
                    label: item.name,
                }
            }) || []
        }
        return data

    } catch (error) {
        console.log('getFootballData try/catch error', error)
        throw new Response(error, { status: 500, })
    }

}

/* -------------------------------------------------------------------------- */
/*                   Uppdatera matcherna och lagen
/* -------------------------------------------------------------------------- */

/**
 * Description
 * @returns {Promise<Array>}
 */
// export const updateTeams = async () => {
//     try {
//         const teams = await getFootballDataFromREST('competitions/2000/teams')
//         const teamsToSave = teams.teams.map((team) => {
//             return objectFilter(team, ['id', 'name', 'tla', 'crest', 'clubColors'])
//         })
//         const { data, error } = await supabase.from('teams').insert(teamsToSave, { upsert: true, onConflict: 'id', ignoreDuplicates: false }).select()

//         if (error?.code) throw new Error(error.message)
//         return data

//     } catch (error) {
//         throw new Response('NAJ! det gick inte att uppdatera lagen :( ', {
//             status: 500
//         })
//     }
// }

// endpoint=competitions/2000/matches?stage=LAST_16,QUARTER_FINALS,SEMI_FINALS,THIRD_PLACE,FINAL
export const updateEndgameMatches = async () => {
    // TODO: third place blir inte räknad korrekt
    try {
        const res = await supabase.from('endgame_matches').select('*').eq('accounted', false)
        if (res.data?.length === 0) { // vi vet att alla vanliga bets är räknade 
            const competition = await getFootballDataFromREST('competitions/2000')
            if (competition.currentSeason.winner) {
                const { data, error } = await supabase.from('final_bets').or('key.eq.WINNER, key.eq.TOP_SCORER')
                const { scorers } = await getFootballDataFromREST('competitions/2000/scorers')
                const topScorers = scorers.map(({ player, goals }) => ({ name: player.name, goals }))

            }





        }
        const results = await getFootballDataFromREST('competitions/2000/matches?stage=LAST_16,QUARTER_FINALS,SEMI_FINALS,FINAL')
        if (res.error?.code) throw new Error(res.error.message)
        if (!results) throw new Error('getFootballDataFromREST - updateEndgameMatches returned no data')
        if ('matches' in results && results.matches.length > 0) {
            // filtrera bort de matcher som inte har några lag ännu
            const cleanedMatchesToCheck = cleanMatches(results.matches.filter(match => res.data.map(m => m.id).includes(match.id)), res.data)
            const updates = findChangedRows(cleanedMatchesToCheck, res.data, false)
            // om det inte är några ändringar så KAN det bero på att det blivit fel i updateFinalScores. Då har matches uppdaterats, men inte poängen och det går inte att göra om
            if (updates && updates?.length !== 0) {
                // spara ändringarna till supabase
                await supabase.from('fetch_history').insert({ latest_changes: updates })
                // filtrera ut de som faktiskt ändrats
                const cleanedMatchesToAccount = cleanedMatchesToCheck.filter(match => updates.includes(match.id))
                const apiMatchIds = cleanedMatchesToAccount.map((match) => match.id)
                // filtera ut supaMatches, bara id, som accounted=false, utifrån de som finns i apiMatchIds
                // TODO: borde inte de vara samma?
                const correspondingSupaMatchIds = res.data.filter((match) => match.accounted === false && apiMatchIds.includes(match.id)).map(m => m.id)
                // DELA UT POÄNGEN
                const { accountedStages } = await updateFinalScores(cleanedMatchesToAccount, correspondingSupaMatchIds)
                const hydratedApiMatches = cleanedMatchesToAccount.map(m => ({ ...m, accounted: accountedStages.includes(m.stage) }))
                // uppdatera supabase->matches 
                const { error } = await supabase
                    .from(matchesEndpoint)
                    .upsert(hydratedApiMatches, { onConflict: 'id', ignoreDuplicates: false })
                if (error?.code) throw new Error('updateMatches, upsert: ' + error.message)

                return accountedStages
            }
        }
        return []
    } catch (error) {
        throw new Response('NAJ! det gick inte att uppdatera slutspelsmatcherna :( ' + error, {
            status: 500
        })
    }
}

/**
 * Description Downloads matches from football-data.org and saves them to the database and returns them
 * @returns {Promise<Array>} JSON [{id: number, away_team_id: number, home_team_id: number, date: string, stage: string, group: string, home_score: number, away_score: number, home_team: {id: number, name: string, tla: string, crest: string, clubColors: string}, away_team: {id: number, name: string, tla: string, crest: string, clubColors: string}}]
 */
export const updateMatches = async () => {
    try {
        const supaMatches = await getFootballData(matchesEndpoint)
        const results = await getFootballDataFromREST('competitions/2000/matches') // FUTURE:  make competition id dynamic 
        if (!results) throw new Error('getFootballDataFromREST(competitions/2000/matches) returned no data')
        const { matches } = results

        const cleanedMatches = cleanMatches(matches.filter(m => m.stage === 'GROUP_STAGE'), supaMatches)
        //Kolla om det är några skillnader mellan databasen och football-data.org och uppdatera databasen om det behövs och spara skillnaden till fetch-history
        const updates = findChangedRows(cleanedMatches, supaMatches)

        if (updates && updates?.length !== 0) {
            // spara ändringarna till supabase
            await supabase.from('fetch_history').insert({ latest_changes: updates })

            const finishedApiMatches = cleanedMatches.filter((match) => match.status === 'FINISHED')
            const finishedApiMatchIds = finishedApiMatches.map((match) => match.id)

            // filtera ut supaMatches, bara id, som accounted=false, utifrån de som finns i finishedApiMatchIds
            const correspondingSupaMatchIds = supaMatches.filter((match) => match.accounted === false && finishedApiMatchIds.includes(match.id)).map(m => m.id)
            // DELA UT POÄNGEN
            const accounted = await updateScores(finishedApiMatches, correspondingSupaMatchIds)
            const hydratedApiMatches = cleanedMatches.map(m => ({ ...m, accounted: accounted.includes(m.id) }))
            // uppdatera supabase->matches 
            const { error } = await supabase
                .from(matchesEndpoint)
                .upsert(hydratedApiMatches, { onConflict: 'id', ignoreDuplicates: false, returning: 'representation' })
                .select()
            if (error?.code) throw new Error('updateMatches, upsert: ' + error.message)

            return updates
        }
        return []
    } catch (error) {
        console.log('502 updateMatches try/catch error', error)
        throw new Response(error, { status: 502 })
    }
}

/* -------------------------------------------------------------------------- */
/*                   Dela ut poäng till alla eftersom en match är färdig. Anropas av updateMatches
/* -------------------------------------------------------------------------- */

export const updateScores = async (finishedApiMatches, supaMatchIdsToScore) => {
    try {
        // plocka bort de API-matcher som är FINISHED som vi redan delat ut poäng för. (supaMatchIdsToScore)
        const apiMatchesToAccount = (finishedApiMatches ?? []).filter(api_match => supaMatchIdsToScore.includes(api_match.id) && api_match.stage === 'GROUP_STAGE') || []

        for await (const apiMatch of apiMatchesToAccount) {
            const { data, error: betsError } = await supabase.from(betsEndpoint).select('*').eq('match_id', apiMatch.id)
            const bets = groupBy(data, 'match_id')
            if (betsError?.code) throw new Error('get bets updateScores' + betsError.message)
            // update all bets where match_id = apiMatch.id   // FUTURE: Detta borde göras med graphql istället så att det bara blir en query
            const currentBetInLoop = bets[apiMatch.id] || []
            currentBetInLoop.forEach(async (userBet) => {
                const userWinGuess = userBet.home_score - (userBet.away_score ?? 0) > 0 ? 'home' : (userBet.home_score ?? 0) - (userBet.away_score ?? 0) < 0 ? 'away' : 'draw'
                switch (apiMatch.winner) {
                    case 'HOME_TEAM':
                        userBet.win = userWinGuess === 'home' ? 3 : 0
                        break
                    case 'AWAY_TEAM':
                        userBet.win = userWinGuess === 'away' ? 3 : 0
                        break
                    case 'DRAW':
                        userBet.win = userWinGuess === 'draw' ? 3 : 0
                        break
                    default:
                        userBet.win = 0
                }
                if ((userBet.home_score ?? 0) == apiMatch.home_score && (userBet.away_score ?? 0) == apiMatch.away_score) {
                    userBet.results = 4
                }
                userBet.accounted = true
                const { win, results, accounted, user_id } = userBet
                const { error } = await supabase.from(betsEndpoint).update({ win, results, accounted }).eq('match_id', apiMatch.id).eq('user_id', user_id)
                if (error?.code) throw new Error('uppdatera bets ' + error.message)
            })
        }
        return apiMatchesToAccount.map(match => match.id)

    } catch (error) {
        throw new Response(error, { status: 503, statusText: error })
    }
}
export const updateFinalScores = async (cleanedMatchesToAccount, correspondingSupaMatchIds) => {
    const finalStages = [
        { stageName: 'LAST_16', numMatches: 8, teams: [], points: 6 },
        { stageName: 'QUARTER_FINALS', numMatches: 4, teams: [], points: 11 },
        { stageName: 'SEMI_FINALS', numMatches: 2, teams: [], points: 15 },
        { stageName: 'FINAL', numMatches: 1, teams: [], points: 18 },
    ]
    const getTeamsFromStageIfAllSet = (stage) => {
        const stageMatches = cleanedMatchesToAccount.filter(match => match.stage === stage.stageName && match.home_team_id && match.away_team_id && correspondingSupaMatchIds.includes(match.id))
        if (stageMatches.length === stage.numMatches) {
            stage.teams = stageMatches.map(match => [match.home_team_id, match.away_team_id]).flat()
        }
    }
    // kolla om alla matcher i en stage är satta, om de är det, lägg till alla teams i stage.teams
    finalStages.forEach(getTeamsFromStageIfAllSet)
    if (finalStages.some(stage => stage.teams.length === stage.numMatches * 2)) {
        const stagesToCheck = finalStages.filter(stage => stage.teams.length === stage.numMatches * 2)
        const accountedStages = stagesToCheck.map((stage) => stage.stageName)
        const orQuery = stagesToCheck.reduce((acc, stage) => `${acc !== '' ? `${acc},` : ''}key.eq.${stage.stageName}`, '')
        // hämta bara de bets som har med finalStages att göra
        const { data: supaFinalBets, error: supaFinalBetsError } = await supabase.from(finalBetsEndpoint).select('*').or(orQuery)
        if (supaFinalBetsError?.code) throw new Error('updateFinalScores, get final bets: ' + supaFinalBetsError.message)
        const groupedFinalBets = groupBy(supaFinalBets, 'key') // {LAST_16: [...], QUARTER_FINAL: [...]}
        // gå igenom alla stages där samtliga förväntade teams är satta, dela ut poäng och lägg till i accountedFinalBets
        const accountedFinalBets = stagesToCheck.reduce((acc, stage) => {
            // plocka ut alla bets för detta stage
            const bets = groupedFinalBets[stage.stageName] || []
            // gå igenom alla bets och dela ut poäng
            const scored = bets.map((userBet, i) => {
                const userBetTeams = typeof userBet.value === 'string' ? JSON.parse(userBet.value) : userBet.value
                const correctTeams = userBetTeams.filter(team => stage.teams.includes(team)).length
                const score = correctTeams * stage.points
                return { ...userBet, score, accounted: true }
            })
            return [...acc, ...scored]
        }, [])
        // om accountedFinalBets har något, uppdatera alla bets i accountedFinalBets
        const { error } = await supabase.from(finalBetsEndpoint).upsert(accountedFinalBets, { onConflict: 'id, user_id, key', ignoreDuplicates: false })
        if (error?.code) throw new Response('update final bets ' + error.message, { status: 503 })
        return { accountedFinalBets, accountedStages }
    }
    return { accountedFinalBets: [], accountedStages: [] }



}

/* -------------------------------------------------------------------------- */
/*                   Hämta nästa match
/* -------------------------------------------------------------------------- */

export const getNextMatch = async () => {
    try {
        const { data: [match], error } = await supabase
            .from(matchesEndpoint)
            .select('*, away_team:away_team_id(*), home_team:home_team_id(*)')
            .eq('status', 'TIMED')
            .order('date', { ascending: true })
            .limit(1)

        if (error?.code) {
            console.log('getNextMatch error', error)
            throw new Error(error.message)
        }
        return match

    } catch (error) {
        throw new Response('NAJ! det gick inte att hämta nästa match :( ', {
        })
    }
}

/* -------------------------------------------------------------------------- */
/*                   Hämta matchinformation
/* -------------------------------------------------------------------------- */
// {home: [homeName, homeScore], away:[awayName, awayScore], congrats} = await getMatchInfo(diffs.match.id)
/**
 * Description Plockar ut info om en match
 * @param {number} matchId
 * @returns {Promise<Object>} {home: [homeName, homeScore], away:[awayName, awayScore], congrats}
 */
export const getMatchInfo = async (matchId) => {
    if (typeof matchId !== 'number') throw new Response('getMatchInfo: matchId måste vara ett nummer', { status: 500 })
    try {
        const { data, error } = await supabase // get users.name whose bets.win + bets.results ==7 for match.id
            .from(betsEndpoint)
            .select('win, results, user:user_id(name), match:match_id(home_team:home_team_id(name),home_score, away_team:away_team_id(name), away_score)')
            .eq('match_id', +matchId)
            .order('results', { ascending: false })
        if (error?.code) {
            console.log('getMatchInfo error', error)
            throw new Error(error.message)
        }
        if (data.length === 0) throw new Response('Kunde inte hitta matchen ' + matchId, { status: 400 })
        const hasFullpot = data.some(bet => bet.win + bet.results === 7)
        const congrats = hasFullpot ? 'Grattis ' + data.filter(bet => bet.results === 4).map(bet => bet.user?.name || '').join(', ') + '!' : 'Ingen tippade rätt resultat'
        const [bet] = data
        const home = [bet.match.home_team.name, bet.match.home_score]
        const away = [bet.match.away_team.name, bet.match.away_score]
        return { home, away, congrats }
    } catch (error) {
        throw new Response('Det gick åt pipan! ' + error, {
            status: 500
        })
    }
}

/* -------------------------------------------------------------------------- */
/*  Hämta info om pågående och föregående match.
/* -------------------------------------------------------------------------- */
export const getRecentMatches = async () => {
    try {
        const { data, error } = await supabase.from('current_bets')
        /*
        {
        "match_id": 391896,
        "points": 7,
        "bet": "2 – 0",
        "name": "Emil Larsson",
        "score": "Argentina 2 – 0 Mexico",
        "home_crest": "https://crests.football-data.org/762.png",
        "away_crest": "https://crests.football-data.org/769.svg"
        date: "2021-07-02T20:00:00Z"
      },
*/
        if (error?.code) {
            console.log('getLiveMatch error', error)
            throw new Error(error.message)
        }
        return groupBy(data, 'match_id', true)
    } catch (error) {
        throw new Response('NAJ! det gick inte att hämta pågående match :( ', {
        })
    }
}

/* -------------------------------------------------------------------------- */
/*  Skicka ut notiser via ntfy.sh
/* -------------------------------------------------------------------------- */

export async function notify(msg) {
    const url = 'https://ntfy.sh/youbet2022' // cron ? 'https://ntfy.sh/youbet2022cron' : 'https://ntfy.sh/youbet2022'
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: msg,
    })
}

export const cleanMatches = (APImatches, supaMatches) => {
    // TODO: Här vore egentligen bättre att redan ha filtrerat bort alla supaMatcher som redan är accounted
    const matchReducer = obj => {
        return {
            competition_id: obj.competition.id,
            id: obj.id,
            date: obj.utcDate,
            status: obj.status,
            stage: obj.stage,
            group: obj.group,
            home_team_id: obj.homeTeam.id,
            away_team_id: obj.awayTeam.id,
            home_score: obj.score.fullTime.home,
            away_score: obj.score.fullTime.away,
            winner: obj.score.winner,
            accounted: supaMatches.find(m => m.id === obj.id)?.accounted,
        }
    }

    const cleanedMatches = APImatches.map(matchReducer).sort((a, b) => new Date(a.date) - new Date(b.date))
    return cleanedMatches
}

export const findChangedRows = (cleanedMatches, supaMatches, isGroupStage = true) => {
    return cleanedMatches.reduce((acc, match, index) => {
        const supaMatch = supaMatches.find((supaMatch) => supaMatch.id === match.id)
        let same = compare(supaMatch, match)
        if (!same && isGroupStage) {
            const changes = diff(supaMatch, match)
            const finished = changes.some(change => change.path[0] === 'status' && change.value === 'FINISHED')
            return finished ? [...acc, { match }] : acc
        } else if (!same) {
            // const changes = diff(supaMatch, match)
            return [...acc, match.id]
        }
        return acc

    }, []).flat()
}
/*
| poäng  | kategori      | maxpoäng |
| -----  | -----------   | -------  |
| 3      | rätt lag      | 144      |
| 4      | rätt resultat | 192      |
| 16x6p  | 8-del         | 96       |
| 8x11p  | kvartsfinal   | 88       |
| 4x15p  | semifinal     | 60       |
| 2x18p  | final         | 36       |
| 26     | vinnare       | 26       |
| 15     | brons         | 15       |
| 15     | skytte        | 15       |
|        | Summa         |      672 | 
*/

export const getBetsPerStage = async () => {
    const { data: matches, error: match_error } = await supabase
        .from('matches')
        .select('away:away_team_id(name), home:home_team_id(name), stage')
        .or('stage.eq.LAST_16, stage.eq.QUARTER_FINALS, stage.eq.SEMI_FINALS, stage.eq.FINAL, stage.eq.THIRD_PLACE')
    const { data: bets, error: bets_final_error } = await supabase
        .from('final_bets')
        .select('profile:user_id(name), key, value,id')
        .or('key.eq.LAST_16, key.eq.QUARTER_FINALS, key.eq.SEMI_FINALS, key.eq.FINAL, key.eq.THIRD_PLACE, key.eq.WINNER')
    const { data: teams, error: teams_error } = await supabase
        .from('teams')
        .select('id, name, crest')



    //const results = await getFootballDataFromREST('competitions/2000/matches?stage=SEMI_FINALS,THIRD_PLACE,FINAL')

    return { matches, bets, teams: objectFromArray(teams, 'id') }

}