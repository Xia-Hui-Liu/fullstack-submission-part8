import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient, useQuery } from '@apollo/client'
import { ALL_BOOKS } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)
  const [error, setError] = useState('')
  const result = useQuery(ALL_BOOKS)
  const client = useApolloClient()

  if (result.loading) {
    return <div>loading...</div>
  }

  const handleLogin = () => {
    setIsLoggedIn(true);
  }
  
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {isLoggedIn && <button onClick={() => setPage('add')}>Add Book</button>}
        {isLoggedIn && <button onClick={logout}>Logout</button>}
        {!isLoggedIn && <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <LoginForm show={page === 'login'} setToken={setToken} setError={setError} handleLogin={handleLogin}/> 
      {isLoggedIn && (<NewBook show={page === 'add'}/>)}
  </div>
  )
}

export default App
