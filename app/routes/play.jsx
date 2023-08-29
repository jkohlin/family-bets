import { useLoaderData } from '@remix-run/react'
import { Container, Label } from 'semantic-ui-react'
import { getFootballDataFromREST, leaderboard, notify } from '~/models/football.server'
import { supabase } from '~/models/user.server'
import { groupBy, objectFromArray } from '~/utils/utils'

//import ChatBox from '~/components/ChatBox'
export const loader = async ({ request, params }) => {
    const { data: matches, error: match_error } = await supabase
        .from('matches')
        .select('away:away_team_id(name), home:home_team_id(name), stage')
        .or('stage.eq.LAST_16, stage.eq.QUARTER_FINALS, stage.eq.SEMI_FINALS, stage.eq.FINAL, stage.eq.THIRD_PLACE')
    const { data: bets, error: bets_final_error } = await supabase
        .from('final_bets')
        .select('profile:user_id(name), key, value,id')
        .or('key.eq.LAST_16, key.eq.QUARTER_FINALS, key.eq.SEMI_FINALS, key.eq.FINAL, key.eq.THIRD_PLACE')
    const { data: teams, error: teams_error } = await supabase
        .from('teams')
        .select('id, name, crest')



    //const results = await getFootballDataFromREST('competitions/2000/matches?stage=SEMI_FINALS,THIRD_PLACE,FINAL')

    return { data: { matches, bets, teams: objectFromArray(teams, 'id') }, error: { match_error, bets_final_error } }
}
export default () => {
    const { data } = useLoaderData()
    const stages = groupBy(data.matches, 'stage')
    const bets = groupBy(data.bets, 'key')
    let stage = ''
    return (
        <Container className='w-full'>
            {Object.keys(bets).map((key) => {
                return (
                    <div key={key}>
                        <h3>{key}</h3>
                        {bets[key].map((bet) => {
                            return (
                                <div key={bet.id}>
                                    <p>{bet.profile.name}</p>
                                    <div>
                                        {bet.value.map((team) => {
                                            return (
                                                <Label size='small' color='black' key={team}>
                                                    {data.teams[team].name}
                                                </Label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}


        </Container>
    )
}
/**
 *             {data.matches && data.matches.map(m => {
                const newStage = m.stage !== stage
                stage = m.stage
                return (m.home &&
                    <div key={m.id}>
                        {newStage && <h3>{m.stage}</h3>}
                        <p>{m.home.name} - {m.away.name}</p>
                        <div>
                            {data && data.bets.map((bet) => (
                                <div key={bet.id}>
                                    <p>{bet.profile.name}</p>
                                    <div>
                                        {bet.value.map(team => {
                                            return <Label size='small' color='black' key={team}>{data.teams[team].name}</Label>
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>
                )
            })}
 */