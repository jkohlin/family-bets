import { useLoaderData } from '@remix-run/react'
import { Card, Container, Header, Image, Item, Table } from 'semantic-ui-react'
import { niceDate } from '~/utils/utils'


function Match({ data }) {
    const [match] = data ?? []
    if (!match) return null
    const datum = niceDate({ date: new Date(match.date), format: 'short' })
    return (
        <>
            <Item title="Föregående match">
                <Item.Content>
                    <Item.Header className='flex !items-center justify-center text-3xl mt-3'>
                        <Image src={match.home_crest} size='mini' />
                        <span className='mx-2 text-lg'>{match.score}</span>
                        <Image src={match.away_crest} size='mini' />
                    </Item.Header>
                    <Item.Meta className='flex !items-center justify-center text-sm mt-2'>{datum}</Item.Meta>
                </Item.Content>
            </Item>

            <Table inverted unstackable striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Namn</Table.HeaderCell>
                        <Table.HeaderCell>Tips</Table.HeaderCell>
                        <Table.HeaderCell>Poäng</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((match) => (
                        <Table.Row key={match.name}>
                            <Table.Cell>{match.name}</Table.Cell>
                            <Table.Cell>{match.bet}</Table.Cell>
                            <Table.Cell>{match.points}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>

            </Table>
        </>

    )
}


export default function RecentMatches() {
    const { recentMatches: [previous, current] } = useLoaderData()
    return (
        <Container>
            {current ?
                (<>
                    <h3 className='text-2xl text-white text-center'>Nästa/pågående match</h3>
                    <Match data={current} />
                </>)
                : null
            }
            {previous ?
                (<>
                    <h3 className='text-2xl text-white text-center'>Föregående match</h3>
                    <Match data={previous} />
                </>)
                : null
            }

        </Container >
    )
}