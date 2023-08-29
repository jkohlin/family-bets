import { useLoaderData, Form, useActionData, useCatch, useTransition } from '@remix-run/react'
import { getBetsForUser, getFinalBetsForUser, getFootballData, saveBets, saveFinalBets } from '../models/football.server'
import BetForm from '../components/BetForm'
import { requireUserId } from '~/session.server'
import { useUser } from '~/utils'
import { Container, Divider, Form as UIForm, Button, Icon, Item } from 'semantic-ui-react'
import { useEffect, useMemo, useState } from 'react'
import BetFinal from '~/components/BetFinal'
import { useHasMounted } from '~/utils/utils'

/* -------------------------------------------------------------------------- */
/*                   LOADER
/* -------------------------------------------------------------------------- */
export async function loader({ request }) {
    const userId = await requireUserId(request) // går till login om ingen användare
    const matches = await getBetsForUser({ userId })
    const finalBets = await getFinalBetsForUser({ userId })
    const teams = await getFootballData('teams', true) // [{ value: 758, label: 'Uruguay' }]

    teams.sort((a, b) => {
        if (a.label < b.label) {
            return -1
        }
        if (a.label > b.label) {
            return 1
        }
        return 0
    })
    const selecIDs = (new Array(32).fill('')).map(i => (Math.random() * Math.exp(16)).toString(16).split('.'))
    // TODO:  hantera error
    return { matches, teams, finalBets, selecIDs }
}


/* -------------------------------------------------------------------------- */
/*                   ACTION
/* -------------------------------------------------------------------------- */
export const action = async ({ request }) => {
    const user_id = await requireUserId(request)
    const today = new Date()
    const lastDayToEnter = new Date('2022-11-20T16:59:59.999Z')
    const tooLate = today > lastDayToEnter
    if (tooLate) {
        throw new Response('Det är för sent att ändra sina bets, lille haacker', { status: 400 })
    }
    const f = await request.formData() // NOTE:  Object.fromEntries(f.entries())
    if (user_id !== f.get('user_id')) {
        throw new Error('User mismatch in action of bets.jsx:41')
    }

    const bets = Array.from(f.entries())
        .filter(([key]) => key.includes('away') || key.includes('home'))
        .reduce((acc, [name, value]) => {
            const [team, match_id] = name.split('_')
            if (!acc[match_id]) acc[match_id] = { match_id, user_id }
            acc[match_id][`${team}_score`] = parseInt(value)
            return acc
        }, {})

    const finalBets = ['LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'WINNER', 'THIRD_PLACE', 'TOP_SCORER'].map(bet => {
        if (bet === 'TOP_SCORER') {
            return { key: bet, value: f.get(bet), user_id }
        }
        return { key: bet, value: f.getAll(bet).filter(Number).map(Number), user_id }
    }
    ).filter(({ value }) => value[0] !== '')
    /*
    [{
    "user_id":"0a8bf37d-e093-4541-ba7d-403c2801b0d2",
    "key":"LAST_16",
    "value":[
        {"value":758,"label":"Uruguay"},
        {"value":759,"label":"Germany"},
        {"value":760,"label":"Spain"}
    ]
    }, 
    {key:'TOP_SCORER', value:'Ronaldo', user_id:'0a8bf37d-e093-4541-ba7d-403c2801b0d2'}]
    */
    const betsRes = saveBets(Object.values(bets))
    const finalBetsRes = saveFinalBets(finalBets)
    return !!(betsRes && finalBetsRes)
}


/* -------------------------------------------------------------------------- */
/*                   COMPONENT
/* -------------------------------------------------------------------------- */
const BetsPage = () => {
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const user = useUser()
    const { matches, teams, finalBets, selecIDs } = useLoaderData()
    let actionSaved = useActionData()
    const today = new Date()
    const lastDayToEnter = new Date('2022-11-20T16:59:59.999Z')
    const { state } = useTransition()
    const busy = state === 'submitting'
    const disabled = today > lastDayToEnter
    const memoLabel = useMemo(() => {
        if (disabled) return 'All bets are off'
        if ((isSaved || actionSaved) && !hasChanges) {
            return 'Sparad'
        }
        return 'Spara'
    }, [disabled, isSaved, hasChanges, actionSaved])

    const mounted = useHasMounted()
    useEffect(() => {
        if (actionSaved) {
            setIsSaved(true)
            setHasChanges(false)
        }
    }, [actionSaved])

    /* -------------------------------------------------------------------------- */
    /*    if not mounted stop here
    /* -------------------------------------------------------------------------- */

    if (!mounted) {
        return null
    }

    matches.sort((a, b) => {
        return new Date(a.date) - new Date(b.date)
    })
    const formHandler = () => {
        setHasChanges(true)
        setIsSaved(false)
    }
    return (
        <Container>
            <h3 className='text-lime-500'>Sista dagen att lämna in din tipsrad är 24h innan avspark</h3>
            <p>När du ändrar eller fyller i, visas en sparaknapp upp till höger som du kan klicka på för att spara.</p>
            <p>Även längst ner på sidan finns en sparaknapp. Du kan spara hur många gånger du vill.</p>
            <Form method="post" onChange={formHandler}>
                <div className={`saveJumbotron${hasChanges ? ' active' : ''}`}>
                    {hasChanges ? <Button inverted type='submit' basic icon="save" circular /> : null}
                </div>
                <input type="hidden" name="user_id" value={user.id} />
                <Divider inverted horizontal className='!mt-12 !mb-4 !text-2xl'>Gruppspel</Divider>
                {matches.map
                    ? matches.map((match, i) => <BetForm key={match.id} match={{ ...match, order: i + 1 }} teams={{ home: match.home_team, away: match.away_team }} disabled={disabled || busy} />)
                    : <div>Nåt är knas med databasen…</div>
                }
                <Divider inverted horizontal className='!mt-12 !mb-4 !text-2xl'>Slutspel</Divider>
                <BetFinal emitChange={formHandler} keys={selecIDs.splice(0, 1)} options={teams} count={16} title="LAST_16" bets={finalBets['LAST_16'] || []} />
                <BetFinal emitChange={formHandler} keys={selecIDs.splice(0, 1)} options={teams} count={8} title="QUARTER_FINALS" bets={finalBets['QUARTER_FINALS'] || []} />
                <BetFinal emitChange={formHandler} keys={selecIDs.splice(0, 1)} options={teams} count={4} title="SEMI_FINALS" bets={finalBets['SEMI_FINALS'] || []} />
                <BetFinal emitChange={formHandler} keys={selecIDs.splice(0, 1)} options={teams} count={2} title="FINAL" bets={finalBets['FINAL'] || []} />
                <BetFinal emitChange={formHandler} keys={selecIDs.splice(0, 1)} options={teams} count={1} title="WINNER" bets={finalBets['WINNER'] || []} />
                <BetFinal emitChange={formHandler} keys={selecIDs.splice(0, 1)} options={teams} count={1} title="THIRD_PLACE" bets={finalBets['THIRD_PLACE'] || []} />
                <Container>
                    <Item>
                        <Item.Header className='text-xl mb-2'>Skyttekung</Item.Header>
                        <Item.Content><UIForm.Input label='Spelarnamn' type='text' name="TOP_SCORER" defaultValue={finalBets['TOP_SCORER']?.value || ''} /></Item.Content>
                    </Item>
                </Container>
                <Item className='mt-8'>
                    <Item.Header className='text-xl mb-2'>Spara din spelbricka</Item.Header>
                    <Item.Content>
                        <Button icon inverted type='submit' labelPosition='right' disabled={disabled || busy} >
                            <Icon name='save' />
                            {memoLabel}
                        </Button>
                    </Item.Content>
                </Item>
            </Form>
            {busy ? <div className='w-screen h-screen absolute top-0 left-0 z-10 backdrop-grayscale backdrop-blur-sm flex items-center justify-center text-6xl animate-pulse'>Sparar…</div> : null}
        </Container>
    )
}

/* -------------------------------------------------------------------------- */
/*                   Error pages
/* -------------------------------------------------------------------------- */
export function CatchBoundary() {
    const caught = useCatch()
    return (
        <div className='h-screen flex items-center justify-center'>
            <h1>Catch</h1>
            <p>{JSON.stringify(caught)}</p>
        </div>
    )
}
export default BetsPage


/* -------------------------------------------------------------------------- */
/* 
| 16    | 8-del         | 96       |
| 8     | kvartsfinal   | 88       |
| 4     | semifinal     | 60       |
| 2     | final         | 36       |
| 26    | vinnare       | 26       |
| 15    | brons         | 15       |
| 15    | skytte        | 15       |

    const titleMap = {
        LAST_16: 'Åttondelsfinal',
        QUARTER_FINALS: 'Kvartsfinal',
        SEMI_FINALS: 'Semifinal',
        FINAL: 'Final',
        WINNER: 'Vinnare',
        THIRD_PLACE: 'Bronsplatsen',
        TOP_SCORER: 'Målskytt',
    }
Server: 
"item sm:!mx-auto sm:!mt-0 my-2" Client: 
"ui fitted horizontal inverted divider pt-4"
*/