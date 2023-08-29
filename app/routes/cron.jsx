import { notify, updateMatches, getMatchInfo, updateEndgameMatches, leaderboard } from '~/models/football.server'
export async function loader() {
    let diffs = await updateMatches() // either an array of finished mATCHES or null
    let msg = 'Inga uppdateringar'
    if (diffs && diffs?.length) {
        for await (const { match } of diffs) {
            if ('id' in match) {
                const res = await getMatchInfo(match.id)
                const { home: [homeName, homeScore], away: [awayName, awayScore], congrats } = res
                msg = `Matchen är slut. ${homeName} ${homeScore}-${awayScore} ${awayName}
${congrats}`
                //await notify(msg)
            }
        }
    } else {
        diffs = await updateEndgameMatches()
        if (diffs && diffs?.length) {
            const [l1, l2, l3] = await leaderboard()
            msg = `Alla lag för steget ${diffs.join(', ')} är klara och poäng har delats ut. 
I toppen hittar vi ${l1.name}, ${l2.name} och ${l3.name}`
            await notify(msg)
        }

    }

    return new Response(msg, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    })
}

