import React from 'react'
import { Flag, Form, Item, Divider } from 'semantic-ui-react'
import { translate } from '../utils/utils'
import useMediaQuery from '../utils/responsive'

const inputEqual = (prevProps, nextProps) => {
    return prevProps.side === nextProps.side
}
const betFormEqual = (prevProps, nextProps) => {
    return prevProps.match.id === nextProps.match.id
}
const BetForm = ({ match, teams, disabled }) => {
    const mobile = useMediaQuery('(max-width: 639px)')
    if (match?.stage !== 'GROUP_STAGE') {
        return null
    }

    const [bet] = match.bets
    const d = new Date(match.date)
    const time = d.toLocaleTimeString('sv-se', { hour: '2-digit', minute: '2-digit' })
    const date = d.toLocaleDateString('sv-se', { weekday: 'long', day: 'numeric', month: 'short', })
    const groupEnum = {
        GROUP_A: 'Grupp A',
        GROUP_B: 'Grupp B',
        GROUP_C: 'Grupp C',
        GROUP_D: 'Grupp D',
        GROUP_F: 'Grupp E',
        GROUP_E: 'Grupp F',
        GROUP_G: 'Grupp G',
        GROUP_H: 'Grupp H'
    }
    // const stageEnum = {
    //     'GROUP_STAGE': 'Gruppspel',
    //     'LAST_16': '8-delsfinal',
    //     'QUARTER_FINALS': 'Kvartsfinal',
    //     'SEMI_FINALS': 'Semifinal',
    //     'THIRD_PLACE': 'Bronsmatch',
    //     'FINAL': 'Final'
    // }
    // const sida = {
    //     home: 'Hemma',
    // }
    const InputUi = ({ side }) => {
        let sideBet = typeof bet?.[`${side}_score`] === 'number' ? bet[`${side}_score`] : ''
        const tag = <Flag className="!mx-2" name={teams[side]?.name.toLowerCase()} />//teams[side]?.tla || sida[side]
        return (
            <div className="input-wrapper">
                {side === 'home'
                    ? <div className={`label flag ${side === 'home' ? 'left' : 'right'}`}>{tag}</div> : null}

                <input
                    placeholder="…"
                    className={`input ${side === 'home' ? 'left' : 'right'}`}
                    name={`${side}_${match.id || null}`}
                    disabled={disabled}
                    type="number"
                    min={0}
                    defaultValue={sideBet} />

                {side === 'away' ? <div className={`label flag ${side === 'home' ? 'left' : 'right'}`}>{tag}</div> : null}
            </div>
        )
    }
    const MemoInput = React.memo(InputUi, inputEqual)

    return (
        <Form.Field as="fieldset" className='field sm:mt-2.5 mt-3 rounded border border-gray-500 px-6'>
            <legend className='text-gray-500 text-sm px-2 -ml-2'>{`Match ${match.order}: ${date}`}</legend>
            <div className="flex sm:flex-row flex-col">
                <div className="flex items-center justify-center mt-2">
                    <MemoInput side="home" />
                    <div className='match-separator'>-</div>
                    <MemoInput side="away" />
                </div>

                {mobile && <Divider inverted horizontal fitted className="pt-4" content={groupEnum[match.group]} />}
                <Item className='sm:!mx-auto sm:!mt-0 my-2'>
                    <Item.Content>
                        {!mobile && <p className="group">{groupEnum[match.group]}</p>}
                        <Item.Header className="!justify-center sm:!mt-2">
                            <Flag className="!mx-2" name={teams['home']?.name.toLowerCase()} /> {translate(teams['home']?.name)} – {translate(teams['away']?.name)}  <Flag className="!mx-2" name={teams['away']?.name.toLowerCase()} />
                        </Item.Header>
                        <Item.Meta className="!text-center !mt-0">
                            <time className='text-xs text-gray-400'>Matchstart: {time}</time>
                        </Item.Meta>
                    </Item.Content>
                </Item>
            </div>
        </Form.Field>
    )
}

export default React.memo(BetForm, betFormEqual)
/**
 *              Match:
 *              "id": 391882,
                "competition_id": 2000,
                "season_id": 1382,
                "date": "2022-11-20T16:00:00Z",
                "status": "TIMED",
                "matchday": 1,
                "stage": "GROUP_STAGE",
                "group": "GROUP_A",
                "away_team_id": 791,
                "home_team_id": 8030,
                "away_score": null,
                "home_score": null,
                "winner": null

                teams": 
            {
                "id": 762,
                "name": "Argentina",
                "shortName": "Argentina",
                "tla": "ARG",
                "clubColors": "Sky Blue / White / Black",
                "crest": "https://crests.football-data.org/762.png"
            },

 */