import { useLoaderData } from '@remix-run/react'
import { Table } from 'semantic-ui-react'
import BetBox from '~/components/BetBox'
import BetFinalBox from '~/components/BetFinalBox'
import { getBetsForUser, getFinalBetsForUser, getFootballData } from '~/models/football.server'
import { requireUserId } from '~/session.server'
import useMediaQuery from '~/utils/responsive'

export async function loader({ params, request }) {
    const userId = params.bets
    await requireUserId(request) // går till login om ingen användare
    const bets = await getBetsForUser({ userId })
    const finals = await getFinalBetsForUser({ userId })
    const teams = await getFootballData('teams', true) // [{ value: 758, label: 'Uruguay' }]
    // matcha ihop teams med finalbets
    const finalBets = Object.entries(finals).reduce((acc, [k, v]) => {
        if (k === 'TOP_SCORER') return { ...acc, [k]: { teams: [v.value], score: v.score } }
        else {
            return { ...acc, [k]: { score: v.score, teams: teams.filter(t => v.value.includes(t.value)).map(team => team.label) } }
        }
    }, {})

    return { bets, finalBets }
}

export default function BetsPage() {
    const { bets, finalBets } = useLoaderData()
    const mobile = useMediaQuery('(max-width: 639px)')
    const { totalWin, totalResults, totalTotal } = bets.reduce((acc, match) => {
        const { bets } = match
        const { win, results } = bets[0] ?? { win: 0, results: 0 }
        acc.totalWin += win
        acc.totalResults += results
        acc.totalTotal += win + results
        return acc
    }, { totalWin: 0, totalResults: 0, totalTotal: 0 })
    return (
        <Table inverted unstackable striped>
            {mobile ?
                (<Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={8} colSpan={3}>Tips</Table.HeaderCell>
                        <Table.HeaderCell width={7}>Poäng</Table.HeaderCell>
                        <Table.HeaderCell width={1} className='!text-center'>Totalt</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>) :
                (
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell rowSpan='2'>Match</Table.HeaderCell>
                            <Table.HeaderCell rowSpan='2'>Tips</Table.HeaderCell>
                            <Table.HeaderCell className='!text-center' colSpan='3'>Poäng</Table.HeaderCell>
                        </Table.Row>
                        <Table.Row>
                            <Table.HeaderCell className='!text-center'>Vinst</Table.HeaderCell>
                            <Table.HeaderCell className='!text-center'>Resultat</Table.HeaderCell>
                            <Table.HeaderCell className='!text-center'>Totalt</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                )

            }
            <Table.Body>
                {bets.map
                    ? bets.map((match, i) => <BetBox key={match.id} match={{ ...match, order: i + 1 }} teams={{ home: match.home_team, away: match.away_team }} />)
                    : <div>Nåt är knas med databasen…</div>
                }
                {Object.keys(finalBets).map ?
                    Object.entries(finalBets).map(([key, value]) => <BetFinalBox key={key} finalBet={value} title={key} />)
                    : <div>Nåt är knas med databasen…</div>
                }
            </Table.Body>
            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan={2} />
                    <Table.HeaderCell className='!text-center'>{totalWin}</Table.HeaderCell>
                    <Table.HeaderCell className='!text-center'>{totalResults}</Table.HeaderCell>
                    <Table.HeaderCell className='!text-center'>{totalTotal}</Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
}