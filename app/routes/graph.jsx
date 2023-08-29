// import { useLoaderData } from '@remix-run/react'
import { supabase } from '~/models/user.server'
import Chart from '~/components/Chart'
import { useLoaderData } from '@remix-run/react'
import { Card } from 'semantic-ui-react'
export const loader = async ({ request, params }) => {
    const { data, error } = await supabase.from('all_bets')
    return data
}

// const betsEndpoint = 'bets_duplicate'
// export const loader = async ({ request }) => {
//     let [matchId] = Object.values(Object.fromEntries(new URLSearchParams(request.url).entries())) ?? 391882
//     const { data, error } = await supabase
//         .from(betsEndpoint)
//         .select('match_id, user:user_id(name), match:match_id(home_team:home_team_id(name),home_score, away_team:away_team_id(name), away_score)')
//         .eq('match_id', +matchId)
//         .eq('win', 3)
//         .eq('results', 4)

//     if (error?.code) {
//         console.log('getMatchInfo error', error)
//         throw new Error(error.message)
//     }
//     const [match] = data
//     const home = [match.match.home_team.name, match.match.home_score]
//     const away = [match.match.away_team.name, match.match.away_score]
//     const congrats = data.map(bet => bet.user.name)
//     return { home, away, congrats }
// }

export default function Page() {
    const data = useLoaderData()
    return (<Card fluid>
        <Chart data={data} />
    </Card>)
}