import { useEffect, useState } from 'react'
import { useOptionalUser } from '~/utils'
import { Link } from '@remix-run/react'
import { Button, Card, Container, Grid, Message } from 'semantic-ui-react'
import { getBetsPerStage, getRecentMatches, leaderboard } from '~/models/football.server'
import { s } from '~/utils/styles'
import { getTimeRemaining, niceDate } from '~/utils/utils'
import qatar from '../assets/qatar.png'
import Leaderboard from '~/components/Leaderboard'
import RecentMatches from '~/components/RecentMatches'
import NextMatch from '~/components/NextMatch'
import ScoringTable from '~/components/ScoringTable'
import BetsPerStage from '~/components/BetsPerStage'

export async function loader({ params, request }) {
    const leaderboardUsers = await leaderboard()
    const recentMatches = await getRecentMatches()
    const betsPerStage = await getBetsPerStage()
    return { leaderboardUsers, recentMatches, betsPerStage }
}


function Countdown({ date }) {
    const [{ day, hour, minute, second, total }, setTimer] = useState({ day: 0, hour: 0, minute: 0, second: 0, total: 0 })
    const timeLeft = total > 0
    useEffect(() => {
        setTimer(getTimeRemaining(date))
        const interval = setInterval(() => {
            setTimer(getTimeRemaining(date))
        }, 1000)
        return () => clearInterval(interval)
    }, [date])
    return timeLeft ? (
        <Card fluid>
            <Card.Content>
                <Card.Header textAlign="center">Nästa match startar om...</Card.Header>
                <p className='text-lime-600 text-3xl text-center font-bold'>{+day ? `${day} dagar ` : ''}{`${hour}h ${minute}m ${second}s`}</p>
            </Card.Content>
        </Card>

    ) : (
        <Card fluid>
            <Card.Content>
                <Card.Header textAlign="center">Poängen är räknade</Card.Header>
                <Link to={'/user'}>
                    <p className='text-lime-600 text-3xl text-center font-bold'>Kolla på Andras bets</p>
                </Link>
            </Card.Content>
        </Card>

    )
}

const notice = { header: 'Vinnaren är korad', content: 'Pinsamt nog blev det jag själv 🙈. OOOtroligt spännande final där Cardigan Daffipuff hade Messi som målgörare. Men Mbappe vann med ett mer mål. Så slutresultatet    1. Johan Kohlin 2. Sven "Cardigan DaffiPuff" Parker   3. Jörgen Strand' }

function Index() {
    const { nextMatch, ...loggedIn } = useOptionalUser()
    const { date, away_team, home_team } = nextMatch ?? { date: null, away_team: null, home_team: null }
    let next
    if (date) {
        next = {
            date: new Date(date),
            home: home_team.name,
            away: away_team.name,
        }
    }
    return (
        <Container className='pt-10'>
            {notice && <Message color='yellow' header={notice.header} content={notice.content} />}
            <Grid as="main" columns={16} reversed="tablet computer">
                <Grid.Column mobile={16} tablet={10} computer={10} className="order-first">
                    {/* <Countdown date={next?.date || new Date()} /> */}
                    <Card style={s.heroContainer}>
                        <div style={s.gradientWhiteUp}>
                            <img src={qatar} alt="VM-logga" style={s.heroLogo} />
                            {loggedIn.user ?
                                (
                                    <div className='flex flex-col'>
                                        <h1>Välkommen {loggedIn.profile?.name}</h1>
                                        {/* <Button as={Link} to="bets" primary>Lägg in dina betts</Button> */}
                                        <Link to={'graph'} className="bg-lime-800 text-white text-center py-2 rounded-md">Se din utveckling i en graf</Link>
                                    </div>
                                )
                                :
                                (
                                    <Container style={s.flex}>
                                        <Button as={Link} to='/login' primary className='!mt-2 !mr-2'>
                                            Logga in
                                        </Button>
                                        <Button as={Link} to='/join' primary className='!mt-2'>
                                            Registrera dig
                                        </Button>
                                    </Container>
                                )
                            }
                        </div>
                    </Card>
                    <RecentMatches />
                    <BetsPerStage />
                    <ScoringTable />
                </Grid.Column>

                <Grid.Column mobile={16} tablet={6} computer={6}>
                    <NextMatch next={next} />
                    <Leaderboard />
                </Grid.Column>
            </Grid>

        </Container>
    )
}
export default Index
