import { useMemo } from 'react'
import { Item, Label, Table } from 'semantic-ui-react'
import useMediaQuery from '~/utils/responsive'
import { translate } from '~/utils/utils'


const BetBox = ({ match, teams, disabled }) => {
    const mobile = useMediaQuery('(max-width: 639px)')
    const [bet] = match.bets
    const { win, results, total } = useMemo(() => {
        const win = bet?.win || 0
        const results = bet?.results || 0
        const total = win + results
        return { win, results, total }
    }, [bet])
    const sida = {
        home: 'Hemma',
        away: 'Borta'
    }
    const Bet = ({ side }) => {
        return (
            <Item className="input-wrapper !text-white">
                <Item.Content content={bet?.[`${side}_score`] ?? '✏️…'} />
            </Item>
        )
    }
    return (
        <>
            {mobile ? (
                <Table.Row>
                    <Table.Cell colSpan={3}>
                        <div className='flex flex-col'>
                            <small className='text-neutral-500 border-b-[1px] border-neutral-500 mb-1'>Match {match.order}</small>
                            <div className='grid grid-auto-cols-2 gap-y-1'>
                                <span className='text-sm w-24 text-neutral-300'>{translate(teams['home']?.name || sida['home'])}</span>
                                <span className='text-sm text-white'>{bet?.home_score ?? '🤔'}</span>
                                <span className='text-sm w-24 text-neutral-300'>{translate(teams['away']?.name || sida['away'])}</span>
                                <span className='text-sm text-white'>{bet?.away_score ?? '🤔'}</span>
                            </div>
                        </div>
                    </Table.Cell>
                    <Table.Cell>
                        <div className='flex flex-col'>
                            <small className='text-neutral-500 border-b-[1px] border-neutral-500 mb-1'>Poäng</small>
                            <div className='grid grid-auto-cols-2 gap-x-2  gap-y-1'>
                                <span className='text-sm text-neutral-300'>Rätt lag:</span>
                                <span className='text-sm text-white'>{win.toString()}</span>
                                <span className='text-sm text-neutral-300'>Resultat:</span>
                                <span className='text-sm text-white'>{results.toString()}</span>
                            </div>
                        </div>
                    </Table.Cell>
                    <Table.Cell>
                        <div className='mt-4 flex justify-center items-center'>
                            <span className={`text-2xl ${total === 7 && 'text-green-500'}`}>{`${total}`}</span><sub className='text-neutral-500 ml-1'>p</sub>
                        </div>
                    </Table.Cell>
                </Table.Row>
            )
                :
                (<Table.Row className='align-baseline'>
                    <Table.Cell>
                        <div className="flex items-center">
                            <span className='mr-2 text-neutral-500'>{match.order}. </span>
                            <span className="">{translate(teams['home']?.name) || sida['home']} {match.home_score != null && `(${match.home_score})`}</span>
                            <span className='match-separator'>-</span>
                            <span className="">{translate(teams['away']?.name) || sida['away']} {match.away_score && `(${match.away_score})`}</span>
                        </div>
                    </Table.Cell>
                    <Table.Cell className='flex items-center'>
                        <Bet side={'home'} />
                        <div className='match-separator'>-</div>
                        <Bet side={'away'} />
                    </Table.Cell>
                    <Table.Cell className='!text-center'>{win}</Table.Cell>
                    <Table.Cell className='!text-center'>{results}</Table.Cell>
                    <Table.Cell className='!text-center'>{total === 7 ? <Label circular color={'green'} size="mini">{total}</Label> : total}</Table.Cell>
                </Table.Row>
                )
            }
        </ >
    )
}

export default BetBox

