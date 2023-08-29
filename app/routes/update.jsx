import { Link, Outlet } from '@remix-run/react'
import { Card, Container, List } from 'semantic-ui-react'
import { requireUserId } from '~/session.server'


const UpdateCenter = () => {
    return (
        <div className="mt-20">
            <Container>
                <Card>
                    <Card.Content>
                        <Card.Header>Uppdatera</Card.Header>
                        <Card.Meta>
                            <span className='date'>Uppdatera matcher och tabeller</span>
                        </Card.Meta>
                        <Card.Description>
                            <List>
                                <List.Item>
                                    <List.Icon name='calendar' />
                                    <List.Content>
                                        <List.Header>Uppdatera matcher</List.Header>
                                        <List.Description><Link to="matches">Uppdatera matcher</Link></List.Description>
                                        <List.Description><Link to="teams">Uppdatera Lag</Link></List.Description>
                                    </List.Content>
                                </List.Item>
                            </List>
                        </Card.Description>
                    </Card.Content>
                </Card>
                <Outlet />
            </Container>

        </div>
    )
}

export default UpdateCenter

// skapa update teams