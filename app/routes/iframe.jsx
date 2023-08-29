import { useState } from 'react'

export default function Iframe() {
    const [todos, setTodos] = useState(['buy milk', 'buy eggs'])
    return (
        <div>
            <h1>this page is an iframe</h1>
            <ul data-test-id="some-container">
                {todos.map(todo =>
                (<li key="todo" data-testid="todo-item" class="w-52 text-xl grid grid-cols-2 items-baseline gap-x-3 mb-2"><span>{todo}</span>
                    <button
                        class="leading-4 h-5 ring-1 ring-stone-100 rounded-full text-center text-lg w-5 hover:bg-red-500"
                        onClick={() => {
                            setTodos(([...newtodos]) => {
                                const idx = newtodos.indexOf(todo)
                                newtodos.splice(idx, 1)
                                return newtodos
                            })
                        }}><span style={{ transform: 'translate(0.7px, -0.5px) rotate(45deg);display: block;' }}>+</span></button>
                </li>))}
            </ul>
        </div>
    )
}