import { Link, useLoaderData } from '@remix-run/react'
import { Card, Table } from 'semantic-ui-react'

export default function Leaderboard() {
    const { leaderboardUsers } = useLoaderData()
    let prev = { score: null, pos: 0 }
    return (
        <Card title="Leaderboard" fluid>
            <Card.Content>
                <Card.Header>Leaderboard</Card.Header>
                <Table celled unstackable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Plats</Table.HeaderCell>
                            <Table.HeaderCell>Namn</Table.HeaderCell>
                            <Table.HeaderCell>Poäng</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {leaderboardUsers.map((user, i) => {
                            if (user.score !== prev.score) {
                                prev.pos += 1
                            }
                            prev.score = user.score

                            return (
                                <Table.Row key={user.user_id}>
                                    <Table.Cell>{prev.pos}</Table.Cell>
                                    <Table.Cell><Link to={'user/' + user.user_id}>{user.name}</Link></Table.Cell>
                                    <Table.Cell>{user.score}</Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            </Card.Content>
        </Card>
    )

}